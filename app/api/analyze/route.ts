// API route for AI analysis using Google Gemini
// Optimized for token efficiency: 2 batched calls instead of 4

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Book, AnalyzeResponse } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

type AnalysisType = 'quick' | 'deep' | 'all';

interface AnalyzeRequestBody {
  books: Book[];
  analysisType?: AnalysisType;
}

/**
 * Filter and format books for LLM context (optimized for token efficiency)
 * - Includes "read" books and "to-read" books (marked separately)
 * - Strips unnecessary fields
 * - Truncates reviews to 500 chars
 */
function formatBooksForPrompt(books: Book[]): string {
  // Separate read and to-read books
  const readBooks = books.filter(b => b.exclusiveShelf === 'read');
  const toReadBooks = books.filter(b => b.exclusiveShelf === 'to-read');
  
  // Sort read books by rating (highest first) and date read (most recent first)
  const sortedReadBooks = [...readBooks].sort((a, b) => {
    const ratingDiff = (b.myRating || 0) - (a.myRating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    
    const dateA = a.dateRead || a.dateAdded || '';
    const dateB = b.dateRead || b.dateAdded || '';
    return dateB.localeCompare(dateA);
  });
  
  // Format a single book
  function formatBook(book: Book, status: 'READ' | 'WANT_TO_READ'): string {
    const rating = book.myRating ? `${book.myRating}/5` : '-';
    const year = book.dateRead ? book.dateRead.split('/')[0] || book.dateRead.split('-')[0] : '';
    
    // Only include top 2 genres to save tokens
    const topGenres = book.genres.slice(0, 2).join(', ');
    
    let line = `[${status}] ${book.title} by ${book.author} | ${rating}`;
    
    if (year) {
      line += ` | ${year}`;
    }
    
    if (topGenres) {
      line += ` | ${topGenres}`;
    }
    
    // Include truncated review (up to 500 chars) if it exists and is meaningful
    if (book.myReview && book.myReview.length > 10) {
      const truncatedReview = book.myReview.substring(0, 500).replace(/\n/g, ' ').trim();
      const ellipsis = book.myReview.length > 500 ? '...' : '';
      line += ` | "${truncatedReview}${ellipsis}"`;
    }
    
    return line;
  }
  
  // Format read books first, then to-read books
  const readLines = sortedReadBooks.map(b => formatBook(b, 'READ'));
  const toReadLines = toReadBooks.map(b => formatBook(b, 'WANT_TO_READ'));
  
  return [...readLines, ...toReadLines].join('\n');
}

/**
 * Load prompt template from file
 */
async function loadPromptTemplate(type: 'quick' | 'deep'): Promise<string> {
  const filename = type === 'quick' ? 'analysis-quick.md' : 'analysis-deep.md';
  const promptPath = path.join(process.cwd(), 'prompts', filename);
  
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load prompt template ${filename}:`, error);
    throw new Error(`Failed to load prompt template: ${filename}`);
  }
}

/**
 * Generate analysis using a combined prompt
 */
async function generateAnalysis(
  model: ReturnType<typeof genAI.getGenerativeModel>,
  type: 'quick' | 'deep',
  booksText: string
): Promise<string> {
  const template = await loadPromptTemplate(type);
  const prompt = template.replace('{books}', booksText);
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
function parseJSONResponse(content: string): Record<string, unknown> | null {
  try {
    let jsonStr = content;
    
    // Remove markdown code block if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Find JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse JSON response');
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Check for API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    const body: AnalyzeRequestBody = await request.json();
    
    if (!body.books || !Array.isArray(body.books) || body.books.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No books provided for analysis' },
        { status: 400 }
      );
    }
    
    const { books, analysisType = 'all' } = body;
    
    // Format books for the prompt (filtered and optimized)
    const booksText = formatBooksForPrompt(books);
    
    // Log token estimate for debugging
    const estimatedTokens = Math.ceil(booksText.length / 4);
    const readCount = books.filter(b => b.exclusiveShelf === 'read').length;
    const toReadCount = books.filter(b => b.exclusiveShelf === 'to-read').length;
    console.log(`Formatted ${readCount} read + ${toReadCount} to-read books, ~${estimatedTokens} tokens`);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const analysis: Record<string, unknown> = {};
    
    // Run analysis based on type - IN PARALLEL for speed
    if (analysisType === 'all') {
      // Run both quick and deep analysis in parallel
      console.log('Starting parallel analysis...');
      const startTime = Date.now();
      
      const [quickResponse, deepResponse] = await Promise.all([
        generateAnalysis(model, 'quick', booksText),
        generateAnalysis(model, 'deep', booksText)
      ]);
      
      console.log(`Both analyses completed in ${Date.now() - startTime}ms`);
      
      // Process quick analysis results
      const quickData = parseJSONResponse(quickResponse);
      if (quickData) {
        if (quickData.roast) {
          analysis.roast = { raw: JSON.stringify(quickData.roast) };
        }
        if (quickData.recommendations || quickData.genreExpansion) {
          analysis.recommendations = { 
            raw: JSON.stringify({
              recommendations: quickData.recommendations,
              genreExpansion: quickData.genreExpansion
            })
          };
        }
      } else {
        analysis.roast = { raw: quickResponse };
        analysis.recommendations = { raw: quickResponse };
      }
      
      // Process deep analysis results
      const deepData = parseJSONResponse(deepResponse);
      if (deepData) {
        if (deepData.profile) {
          analysis.profile = { raw: JSON.stringify(deepData.profile) };
        }
        if (deepData.insights) {
          analysis.insights = { raw: JSON.stringify(deepData.insights) };
        }
      } else {
        analysis.profile = { raw: deepResponse };
        analysis.insights = { raw: deepResponse };
      }
    } else if (analysisType === 'quick') {
      const quickResponse = await generateAnalysis(model, 'quick', booksText);
      const quickData = parseJSONResponse(quickResponse);
      
      if (quickData) {
        if (quickData.roast) {
          analysis.roast = { raw: JSON.stringify(quickData.roast) };
        }
        if (quickData.recommendations || quickData.genreExpansion) {
          analysis.recommendations = { 
            raw: JSON.stringify({
              recommendations: quickData.recommendations,
              genreExpansion: quickData.genreExpansion
            })
          };
        }
      } else {
        analysis.roast = { raw: quickResponse };
        analysis.recommendations = { raw: quickResponse };
      }
    } else if (analysisType === 'deep') {
      const deepResponse = await generateAnalysis(model, 'deep', booksText);
      const deepData = parseJSONResponse(deepResponse);
      
      if (deepData) {
        if (deepData.profile) {
          analysis.profile = { raw: JSON.stringify(deepData.profile) };
        }
        if (deepData.insights) {
          analysis.insights = { raw: JSON.stringify(deepData.insights) };
        }
      } else {
        analysis.profile = { raw: deepResponse };
        analysis.insights = { raw: deepResponse };
      }
    }
    
    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        generatedAt: new Date().toISOString(),
      } as AnalyzeResponse['analysis'],
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
