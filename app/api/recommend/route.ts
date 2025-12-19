// API route for prompt-based recommendations using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Book, RecommendResponse, BookRecommendation } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface RecommendRequestBody {
  books: Book[];
  prompt: string;
}

/**
 * Format books for LLM context
 */
function formatBooksForPrompt(books: Book[]): string {
  // Sort by rating (highest first) and date read (most recent first)
  const sortedBooks = [...books].sort((a, b) => {
    const ratingDiff = (b.myRating || 0) - (a.myRating || 0);
    if (ratingDiff !== 0) return ratingDiff;
    
    const dateA = a.dateRead || a.dateAdded || '';
    const dateB = b.dateRead || b.dateAdded || '';
    return dateB.localeCompare(dateA);
  });
  
  // Limit to top 100 books to keep prompt reasonable
  const limitedBooks = sortedBooks.slice(0, 100);
  
  return limitedBooks.map(book => {
    const rating = book.myRating || 'No rating';
    const date = book.dateRead || book.dateAdded || 'Unknown date';
    const genres = book.genres.length > 0 ? book.genres.join(', ') : null;
    
    let line = `- ${book.title} by ${book.author} (Rating: ${rating}, Read: ${date})`;
    
    if (genres) {
      line += ` [Genres: ${genres}]`;
    }
    
    return line;
  }).join('\n');
}

/**
 * Load prompt template from file
 */
async function loadPromptTemplate(): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', 'prompt-recommendations.md');
  
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load prompt template:', error);
    throw new Error('Failed to load prompt template');
  }
}

/**
 * Parse recommendations from LLM response
 */
function parseRecommendations(response: string): BookRecommendation[] {
  const recommendations: BookRecommendation[] = [];
  
  // Match recommendation blocks (### 1., ### 2., etc. or ### A Stretch Pick)
  const recPattern = /### (?:\d+\.|A Stretch Pick)[^\n]*\n([^#]*?)(?=### |\n## |$)/g;
  let match;
  
  while ((match = recPattern.exec(response)) !== null) {
    const block = match[1].trim();
    
    // Extract title and author from the header
    const headerMatch = match[0].match(/### (?:\d+\.|A Stretch Pick)\s*(.+?)\s+by\s+(.+?)(?:\n|$)/);
    if (!headerMatch) continue;
    
    const title = headerMatch[1].replace(/\*\*/g, '').trim();
    const author = headerMatch[2].replace(/\*\*/g, '').trim();
    
    // Extract why this matches request
    const requestMatch = block.match(/\*\*Why this matches your request:\*\*\s*([^\n]+)/);
    const fitsMatch = block.match(/\*\*Why it fits YOU:\*\*\s*([^\n]+)/);
    const expectMatch = block.match(/\*\*What to expect:\*\*\s*([^\n]+)/);
    
    const rec = {
      title,
      author,
      whyThisBook: requestMatch ? requestMatch[1].trim() : '',
      connectionToReading: fitsMatch ? fitsMatch[1].trim() : '',
      whatToExpect: expectMatch ? expectMatch[1].trim() : '',
      themes: [],
    };
    
    // Only add if we have at least some meaningful content
    if (rec.whyThisBook || rec.connectionToReading || rec.whatToExpect) {
      recommendations.push(rec);
    }
  }
  
  return recommendations;
}

export async function POST(request: NextRequest): Promise<NextResponse<RecommendResponse>> {
  try {
    // Check for API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    const body: RecommendRequestBody = await request.json();
    
    if (!body.books || !Array.isArray(body.books) || body.books.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No books provided for recommendations' },
        { status: 400 }
      );
    }
    
    if (!body.prompt || body.prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No prompt provided' },
        { status: 400 }
      );
    }
    
    const { books, prompt } = body;
    
    // Format books for the prompt
    const booksText = formatBooksForPrompt(books);
    
    // Load and fill template
    const template = await loadPromptTemplate();
    const fullPrompt = template
      .replace('{books}', booksText)
      .replace('{prompt}', prompt)
      .replace('"{prompt}"', `"${prompt}"`);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    
    // Generate recommendations
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    // Parse recommendations from response
    const recommendations = parseRecommendations(response);
    
    // If parsing failed, return raw response for debugging
    if (recommendations.length === 0) {
      console.warn('Failed to parse recommendations, returning raw response');
      return NextResponse.json({
        success: true,
        recommendations: [{
          title: 'See Full Response',
          author: 'AI Generated',
          whyThisBook: response.substring(0, 500),
          connectionToReading: '',
          themes: [],
        }],
      });
    }
    
    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error('Recommend API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Recommendation failed' },
      { status: 500 }
    );
  }
}

