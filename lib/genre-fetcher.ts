// Background genre fetching from Open Library

import { Book } from './types';

// Map Open Library subjects to our genres
const SUBJECT_TO_GENRE: Record<string, string> = {
  // Fiction
  'fiction': 'fiction',
  'literature': 'fiction',
  'novels': 'fiction',
  'science fiction': 'science_fiction',
  'sci-fi': 'science_fiction',
  'fantasy': 'fantasy',
  'fantasy fiction': 'fantasy',
  'mystery': 'mystery',
  'mystery fiction': 'mystery',
  'detective': 'mystery',
  'thriller': 'thriller',
  'thrillers': 'thriller',
  'suspense': 'thriller',
  'romance': 'romance',
  'love stories': 'romance',
  'historical fiction': 'historical_fiction',
  'history': 'history',
  'horror': 'horror',
  'horror fiction': 'horror',
  
  // Non-fiction
  'biography': 'biography',
  'biographies': 'biography',
  'autobiography': 'biography',
  'memoir': 'biography',
  'memoirs': 'biography',
  'philosophy': 'philosophy',
  'philosophers': 'philosophy',
  'science': 'science',
  'popular science': 'science',
  'psychology': 'psychology',
  'self-help': 'self_help',
  'personal development': 'self_help',
  'business': 'business',
  'economics': 'business',
  'politics': 'politics',
  'political science': 'politics',
  'religion': 'religion',
  'spirituality': 'religion',
  'christianity': 'religion',
  'art': 'art',
  'artists': 'art',
  'poetry': 'poetry',
  'poems': 'poetry',
  'humor': 'humor',
  'comedy': 'humor',
  'travel': 'travel',
  'cooking': 'cookbook',
  'cookbooks': 'cookbook',
  
  // Age categories
  'young adult': 'young_adult',
  'young adult fiction': 'young_adult',
  'juvenile fiction': 'children',
  'children\'s fiction': 'children',
};

function mapSubjectsToGenres(subjects: string[]): string[] {
  const genres = new Set<string>();
  
  for (const subject of subjects) {
    const lower = subject.toLowerCase();
    
    // Direct match
    if (SUBJECT_TO_GENRE[lower]) {
      genres.add(SUBJECT_TO_GENRE[lower]);
      continue;
    }
    
    // Partial match
    for (const [key, genre] of Object.entries(SUBJECT_TO_GENRE)) {
      if (lower.includes(key) || key.includes(lower)) {
        genres.add(genre);
        break;
      }
    }
  }
  
  return Array.from(genres).slice(0, 3); // Max 3 genres per book
}

async function fetchGenresForBook(isbn: string): Promise<string[]> {
  try {
    // Use search API which is faster than individual lookups
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(
      `https://openlibrary.org/search.json?isbn=${isbn}&fields=subject&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data.docs && data.docs[0]?.subject) {
      return mapSubjectsToGenres(data.docs[0].subject);
    }
    
    return [];
  } catch {
    return [];
  }
}

export interface EnrichmentProgress {
  current: number;
  total: number;
  booksEnriched: number;
}

/**
 * Fetch genres for books in parallel batches
 * Returns updated books array
 */
export async function enrichBooksWithGenres(
  books: Book[],
  onProgress?: (progress: EnrichmentProgress) => void,
  signal?: AbortSignal
): Promise<Book[]> {
  // Only process read books without genres that have ISBNs
  const booksNeedingGenres = books.filter(
    b => b.exclusiveShelf === 'read' && 
         b.genres.length === 0 && 
         (b.isbn13 || b.isbn)
  );
  
  if (booksNeedingGenres.length === 0) {
    return books;
  }
  
  const updatedBooks = [...books];
  const bookIndexMap = new Map<string, number>();
  books.forEach((book, index) => bookIndexMap.set(book.id, index));
  
  let enriched = 0;
  let processed = 0;
  
  // Process in parallel batches of 25
  const BATCH_SIZE = 25;
  
  for (let i = 0; i < booksNeedingGenres.length; i += BATCH_SIZE) {
    if (signal?.aborted) break;
    
    const batch = booksNeedingGenres.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(async (book) => {
        const isbn = book.isbn13 || book.isbn;
        if (!isbn) return { book, genres: [] };
        
        const genres = await fetchGenresForBook(isbn);
        return { book, genres };
      })
    );
    
    // Apply results
    for (const { book, genres } of results) {
      processed++;
      if (genres.length > 0) {
        const originalIndex = bookIndexMap.get(book.id);
        if (originalIndex !== undefined) {
          updatedBooks[originalIndex] = {
            ...updatedBooks[originalIndex],
            genres,
          };
          enriched++;
        }
      }
    }
    
    onProgress?.({
      current: processed,
      total: booksNeedingGenres.length,
      booksEnriched: enriched,
    });
    
    // Minimal delay between batches
    if (i + BATCH_SIZE < booksNeedingGenres.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
  
  return updatedBooks;
}

