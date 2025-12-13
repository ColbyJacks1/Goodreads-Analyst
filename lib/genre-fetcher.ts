// Background genre fetching from Open Library

import { Book } from './types';

// Map Open Library subjects to our genres - expanded for better matching
const SUBJECT_TO_GENRE: Record<string, string> = {
  // Fiction
  'fiction': 'fiction',
  'literature': 'fiction',
  'novels': 'fiction',
  'novel': 'fiction',
  'literary fiction': 'fiction',
  'general fiction': 'fiction',
  'science fiction': 'science_fiction',
  'sci-fi': 'science_fiction',
  'scifi': 'science_fiction',
  'space opera': 'science_fiction',
  'dystopian': 'science_fiction',
  'cyberpunk': 'science_fiction',
  'fantasy': 'fantasy',
  'fantasy fiction': 'fantasy',
  'epic fantasy': 'fantasy',
  'urban fantasy': 'fantasy',
  'high fantasy': 'fantasy',
  'dark fantasy': 'fantasy',
  'magic': 'fantasy',
  'mystery': 'mystery',
  'mystery fiction': 'mystery',
  'detective': 'mystery',
  'detective fiction': 'mystery',
  'crime': 'mystery',
  'crime fiction': 'mystery',
  'thriller': 'thriller',
  'thrillers': 'thriller',
  'suspense': 'thriller',
  'psychological thriller': 'thriller',
  'romance': 'romance',
  'love stories': 'romance',
  'romantic fiction': 'romance',
  'contemporary romance': 'romance',
  'historical fiction': 'historical_fiction',
  'historical novel': 'historical_fiction',
  'history': 'history',
  'horror': 'horror',
  'horror fiction': 'horror',
  'supernatural': 'horror',
  'gothic': 'horror',
  'adventure': 'adventure',
  'action': 'adventure',
  
  // Non-fiction
  'biography': 'biography',
  'biographies': 'biography',
  'autobiography': 'biography',
  'autobiographies': 'biography',
  'memoir': 'biography',
  'memoirs': 'biography',
  'philosophy': 'philosophy',
  'philosophers': 'philosophy',
  'ethics': 'philosophy',
  'science': 'science',
  'popular science': 'science',
  'physics': 'science',
  'biology': 'science',
  'chemistry': 'science',
  'nature': 'science',
  'psychology': 'psychology',
  'self-help': 'self_help',
  'self help': 'self_help',
  'personal development': 'self_help',
  'business': 'business',
  'economics': 'business',
  'finance': 'business',
  'management': 'business',
  'politics': 'politics',
  'political science': 'politics',
  'religion': 'religion',
  'spirituality': 'religion',
  'christianity': 'religion',
  'buddhism': 'religion',
  'art': 'art',
  'artists': 'art',
  'music': 'art',
  'poetry': 'poetry',
  'poems': 'poetry',
  'humor': 'humor',
  'comedy': 'humor',
  'humorous fiction': 'humor',
  'travel': 'travel',
  'cooking': 'cookbook',
  'cookbooks': 'cookbook',
  'food': 'cookbook',
  
  // Age categories
  'young adult': 'young_adult',
  'young adult fiction': 'young_adult',
  'ya': 'young_adult',
  'teen': 'young_adult',
  'juvenile fiction': 'children',
  'children\'s fiction': 'children',
  'children': 'children',
  'picture books': 'children',
  
  // Additional common subjects
  'war': 'history',
  'world war': 'history',
  'military': 'history',
  'american literature': 'fiction',
  'english literature': 'fiction',
  'british literature': 'fiction',
  'classics': 'classics',
  'classic literature': 'classics',
  'graphic novels': 'comics',
  'comics': 'comics',
  'manga': 'comics',
};

function mapSubjectsToGenres(subjects: string[]): string[] {
  const genres = new Set<string>();
  
  for (const subject of subjects) {
    const lower = subject.toLowerCase().trim();
    
    // Direct match
    if (SUBJECT_TO_GENRE[lower]) {
      genres.add(SUBJECT_TO_GENRE[lower]);
      continue;
    }
    
    // Partial match - check if any key is contained in the subject
    for (const [key, genre] of Object.entries(SUBJECT_TO_GENRE)) {
      if (lower.includes(key)) {
        genres.add(genre);
        break;
      }
    }
  }
  
  return Array.from(genres).slice(0, 3); // Max 3 genres per book
}

// Fast search-based genre lookup
async function fetchGenresForBook(book: Book): Promise<string[]> {
  const isbn = book.isbn13 || book.isbn;
  
  // Try ISBN search first (fastest, single call)
  if (isbn) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://openlibrary.org/search.json?isbn=${isbn}&fields=subject&limit=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data.docs?.[0]?.subject) {
          const genres = mapSubjectsToGenres(data.docs[0].subject);
          if (genres.length > 0) return genres;
        }
      }
    } catch {
      // Continue to title search
    }
  }
  
  // Fallback: Search by title + author (still fast, single call)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Use just title for faster/better matching
    const query = encodeURIComponent(book.title);
    const response = await fetch(
      `https://openlibrary.org/search.json?title=${query}&fields=subject&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data.docs?.[0]?.subject) {
        const genres = mapSubjectsToGenres(data.docs[0].subject);
        if (genres.length > 0) return genres;
      }
    }
  } catch {
    // No genres found
  }
  
  return [];
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
  // Only process read books without genres
  const booksNeedingGenres = books.filter(
    b => b.exclusiveShelf === 'read' && b.genres.length === 0
  );
  
  if (booksNeedingGenres.length === 0) {
    return books;
  }
  
  const updatedBooks = [...books];
  const bookIndexMap = new Map<string, number>();
  books.forEach((book, index) => bookIndexMap.set(book.id, index));
  
  let enriched = 0;
  let processed = 0;
  
  // Process in larger parallel batches for speed
  const BATCH_SIZE = 20;
  
  for (let i = 0; i < booksNeedingGenres.length; i += BATCH_SIZE) {
    if (signal?.aborted) break;
    
    const batch = booksNeedingGenres.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const results = await Promise.all(
      batch.map(async (book) => {
        const genres = await fetchGenresForBook(book);
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
    
    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < booksNeedingGenres.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return updatedBooks;
}
