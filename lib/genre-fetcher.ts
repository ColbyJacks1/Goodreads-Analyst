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

// Try multiple methods to get genres for a book
async function fetchGenresForBook(book: Book): Promise<string[]> {
  const isbn = book.isbn13 || book.isbn;
  
  // Method 1: Try ISBN lookup via works endpoint (most complete data)
  if (isbn) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // First get the edition to find the work
      const editionResponse = await fetch(
        `https://openlibrary.org/isbn/${isbn}.json`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (editionResponse.ok) {
        const edition = await editionResponse.json();
        
        // If edition has subjects, use them
        if (edition.subjects && edition.subjects.length > 0) {
          const genres = mapSubjectsToGenres(edition.subjects);
          if (genres.length > 0) return genres;
        }
        
        // Otherwise try to get the work for more subjects
        if (edition.works && edition.works[0]?.key) {
          const workController = new AbortController();
          const workTimeoutId = setTimeout(() => workController.abort(), 5000);
          
          const workResponse = await fetch(
            `https://openlibrary.org${edition.works[0].key}.json`,
            { signal: workController.signal }
          );
          clearTimeout(workTimeoutId);
          
          if (workResponse.ok) {
            const work = await workResponse.json();
            if (work.subjects && work.subjects.length > 0) {
              const genres = mapSubjectsToGenres(work.subjects);
              if (genres.length > 0) return genres;
            }
          }
        }
      }
    } catch {
      // Continue to next method
    }
  }
  
  // Method 2: Search by title and author
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const query = encodeURIComponent(`${book.title} ${book.author}`);
    const searchResponse = await fetch(
      `https://openlibrary.org/search.json?q=${query}&fields=subject&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      if (data.docs && data.docs[0]?.subject) {
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
  
  // Process in parallel batches of 10 (more conservative to avoid rate limits)
  const BATCH_SIZE = 10;
  
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
    
    // Delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < booksNeedingGenres.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return updatedBooks;
}
