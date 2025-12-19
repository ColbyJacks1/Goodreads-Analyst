// API route for AI-powered year reading summary using Google Gemini

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Book } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface YearSummaryRequest {
  books: Book[];
  year: number;
}

export interface YearSummaryTheme {
  theme: string;
  insight: string;
  books: string[];
}

export interface YearSummaryData {
  headline: string;
  overview: string;
  keyThemes: YearSummaryTheme[];
  emotionalJourney: string;
  intellectualPursuits: string;
  surprisingConnection: {
    connection: string;
    books: string[];
    insight: string;
  };
  readerPortrait: string;
  lookingAhead: string;
}

interface YearSummaryResponse {
  success: boolean;
  summary?: YearSummaryData;
  error?: string;
}

/**
 * Format books for the year summary prompt
 */
function formatBooksForPrompt(books: Book[]): string {
  return books.map(book => {
    const rating = book.myRating ? `${book.myRating}/5` : 'No rating';
    const genres = book.genres.length > 0 ? book.genres.slice(0, 3).join(', ') : 'Unknown genre';
    const review = book.myReview && book.myReview.length > 10 
      ? ` | Review snippet: "${book.myReview.substring(0, 200)}${book.myReview.length > 200 ? '...' : ''}"`
      : '';
    
    return `- "${book.title}" by ${book.author} | ${rating} | ${genres}${review}`;
  }).join('\n');
}

/**
 * Load prompt template
 */
async function loadPromptTemplate(): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', 'year-summary.md');
  
  try {
    return await fs.readFile(promptPath, 'utf-8');
  } catch (error) {
    console.error('Failed to load year summary prompt:', error);
    throw new Error('Failed to load prompt template');
  }
}

/**
 * Parse JSON response from LLM
 */
function parseResponse(response: string): YearSummaryData | null {
  try {
    let jsonStr = response;
    
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Find JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Handle both wrapped and unwrapped response formats
    const data = parsed.yearSummary || parsed;
    
    if (data.headline && data.overview) {
      return {
        headline: data.headline || '',
        overview: data.overview || '',
        keyThemes: Array.isArray(data.keyThemes) ? data.keyThemes : [],
        emotionalJourney: data.emotionalJourney || '',
        intellectualPursuits: data.intellectualPursuits || '',
        surprisingConnection: data.surprisingConnection || { connection: '', books: [], insight: '' },
        readerPortrait: data.readerPortrait || '',
        lookingAhead: data.lookingAhead || '',
      };
    }
  } catch (error) {
    console.error('Failed to parse year summary response:', error);
  }
  
  return null;
}

export async function POST(request: NextRequest): Promise<NextResponse<YearSummaryResponse>> {
  try {
    // Check for API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }
    
    const body: YearSummaryRequest = await request.json();
    
    if (!body.books || !Array.isArray(body.books) || body.books.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No books provided' },
        { status: 400 }
      );
    }
    
    if (!body.year) {
      return NextResponse.json(
        { success: false, error: 'Year not specified' },
        { status: 400 }
      );
    }
    
    const { books, year } = body;
    
    // Format books for prompt
    const booksText = formatBooksForPrompt(books);
    
    // Load and fill template
    const template = await loadPromptTemplate();
    const fullPrompt = template
      .replace(/{year}/g, year.toString())
      .replace('{books}', booksText);
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    
    // Generate summary
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();
    
    // Parse response
    const summary = parseResponse(response);
    
    if (!summary) {
      console.error('Failed to parse summary, raw response:', response.substring(0, 500));
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Year summary API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Summary generation failed' },
      { status: 500 }
    );
  }
}

