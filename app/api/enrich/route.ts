// API route for enriching books with Open Library data

import { NextRequest, NextResponse } from 'next/server';
import { fetchBookByIsbn } from '@/lib/open-library';
import { normalizeBookshelves } from '@/lib/genre-normalizer';

interface BookToEnrich {
  isbn: string | null;
  isbn13: string | null;
  title: string;
  author: string;
  bookshelves: string | null;
}

interface EnrichRequestBody {
  books: BookToEnrich[];
}

interface EnrichedResult {
  index: number;
  genres: string[];
  coverUrl: string | null;
  description: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequestBody = await request.json();
    
    if (!body.books || !Array.isArray(body.books)) {
      return NextResponse.json(
        { error: 'Invalid request: books array required' },
        { status: 400 }
      );
    }
    
    const results: EnrichedResult[] = [];
    
    for (let i = 0; i < body.books.length; i++) {
      const book = body.books[i];
      const isbn = book.isbn13 || book.isbn;
      
      let genres: string[] = [];
      let coverUrl: string | null = null;
      let description: string | null = null;
      
      // Try Open Library if we have an ISBN
      if (isbn) {
        try {
          const openLibData = await fetchBookByIsbn(isbn);
          if (openLibData) {
            genres = openLibData.genres;
            coverUrl = openLibData.coverUrl;
            description = openLibData.description;
          }
        } catch (error) {
          console.error(`Failed to fetch from Open Library for ${isbn}:`, error);
        }
      }
      
      // Fallback to bookshelves normalization if no genres from Open Library
      if (genres.length === 0 && book.bookshelves) {
        genres = normalizeBookshelves(book.bookshelves);
      }
      
      // Always try to get cover URL even if other data failed
      if (!coverUrl && isbn) {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
      }
      
      results.push({
        index: i,
        genres,
        coverUrl,
        description,
      });
      
      // Small delay to avoid rate limiting (100ms between requests)
      if (i < body.books.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return NextResponse.json({ enrichedBooks: results });
  } catch (error) {
    console.error('Enrich API error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich books' },
      { status: 500 }
    );
  }
}

