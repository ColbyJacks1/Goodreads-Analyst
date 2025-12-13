import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

interface QuickRecommendation {
  title: string;
  author: string;
  reason: string;
}

interface QuickRecommendRequestBody {
  likedBook: string;
}

const QUICK_REC_PROMPT = `You are a book recommendation expert. A user tells you they liked a specific book.

Give them exactly 3 book recommendations that someone who enjoyed that book would likely love.

For each recommendation, provide:
- Title (exact book title)
- Author (author's name)
- Reason (1-2 sentences explaining why they'd like it based on what they enjoyed)

Consider: similar themes, writing style, genre, emotional resonance, and other readers' patterns.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "recommendations": [
    {"title": "Book Title", "author": "Author Name", "reason": "Why they'd like it"},
    {"title": "Book Title", "author": "Author Name", "reason": "Why they'd like it"},
    {"title": "Book Title", "author": "Author Name", "reason": "Why they'd like it"}
  ]
}

The user said they liked: "{book}"`;

function parseRecommendations(response: string): QuickRecommendation[] {
  try {
    // Try to extract JSON from the response
    let jsonStr = response;
    
    // Check for JSON code block
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Find the JSON object
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    return parsed.recommendations || [];
  } catch (error) {
    console.error('Failed to parse quick recommendations:', error);
    return [];
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body: QuickRecommendRequestBody = await request.json();
    const { likedBook } = body;

    if (!likedBook || typeof likedBook !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a book you liked' },
        { status: 400 }
      );
    }

    // Generate recommendations
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const prompt = QUICK_REC_PROMPT.replace('{book}', likedBook.trim());
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const recommendations = parseRecommendations(response);

    if (recommendations.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate recommendations. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      recommendations,
      likedBook 
    });

  } catch (error) {
    console.error('Quick recommend error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

