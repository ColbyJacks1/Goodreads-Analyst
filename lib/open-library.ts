// Open Library API client for fetching book metadata

export interface OpenLibraryBook {
  title?: string;
  subjects?: string[];
  subject_places?: string[];
  subject_people?: string[];
  subject_times?: string[];
  description?: string | { value: string };
  covers?: number[];
}

export interface EnrichedData {
  genres: string[];
  coverUrl: string | null;
  description: string | null;
}

// Genre keywords to look for in subjects
const GENRE_KEYWORDS: Record<string, string[]> = {
  fiction: ['fiction', 'novel', 'stories'],
  science_fiction: ['science fiction', 'sci-fi', 'space', 'alien', 'future'],
  fantasy: ['fantasy', 'magic', 'dragon', 'wizard', 'mythical'],
  mystery: ['mystery', 'detective', 'crime', 'murder', 'thriller', 'suspense'],
  romance: ['romance', 'love story', 'romantic'],
  historical_fiction: ['historical fiction', 'historical novel'],
  young_adult: ['young adult', 'ya', 'teen', 'juvenile'],
  children: ['children', 'juvenile', 'picture book', 'kids'],
  classics: ['classic', 'literary fiction', 'literature'],
  non_fiction: ['non-fiction', 'nonfiction'],
  biography: ['biography', 'autobiography', 'memoir', 'life'],
  history: ['history', 'historical', 'war', 'military'],
  philosophy: ['philosophy', 'ethics', 'metaphysics'],
  science: ['science', 'physics', 'chemistry', 'biology', 'nature'],
  psychology: ['psychology', 'mental', 'mind', 'behavior'],
  self_help: ['self-help', 'self help', 'personal development', 'motivation'],
  business: ['business', 'economics', 'finance', 'management'],
  horror: ['horror', 'scary', 'supernatural', 'ghost'],
  poetry: ['poetry', 'poems', 'verse'],
  comics: ['comics', 'graphic novel', 'manga'],
};

/**
 * Extract genres from Open Library subjects
 */
function extractGenres(book: OpenLibraryBook): string[] {
  const subjects = [
    ...(book.subjects || []),
    ...(book.subject_places || []),
    ...(book.subject_people || []),
    ...(book.subject_times || []),
  ].map(s => s.toLowerCase());
  
  const genres: Set<string> = new Set();
  
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (subjects.some(s => s.includes(keyword))) {
        genres.add(genre);
        break;
      }
    }
  }
  
  return Array.from(genres);
}

/**
 * Get cover URL from Open Library
 */
function getCoverUrl(isbn: string): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
}

/**
 * Fetch book data from Open Library by ISBN
 */
export async function fetchBookByIsbn(isbn: string): Promise<EnrichedData | null> {
  try {
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const book: OpenLibraryBook = await response.json();
    
    // Extract description
    let description: string | null = null;
    if (book.description) {
      description = typeof book.description === 'string' 
        ? book.description 
        : book.description.value;
    }
    
    return {
      genres: extractGenres(book),
      coverUrl: getCoverUrl(isbn),
      description,
    };
  } catch (error) {
    console.error(`Failed to fetch book ${isbn}:`, error);
    return null;
  }
}

/**
 * Fetch book data with rate limiting
 */
export async function fetchBooksWithRateLimit(
  isbns: { isbn: string; index: number }[],
  onProgress?: (current: number, total: number) => void,
  delayMs: number = 100
): Promise<Map<string, EnrichedData>> {
  const results = new Map<string, EnrichedData>();
  
  for (let i = 0; i < isbns.length; i++) {
    const { isbn } = isbns[i];
    
    if (onProgress) {
      onProgress(i + 1, isbns.length);
    }
    
    const data = await fetchBookByIsbn(isbn);
    if (data) {
      results.set(isbn, data);
    }
    
    // Rate limiting delay
    if (i < isbns.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
}

