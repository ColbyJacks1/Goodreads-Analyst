// Genre Normalizer - Ported from V1 Python codebase
// Normalizes inconsistent Goodreads genres/bookshelves into standardized categories

// Genre mapping rules - expanded for better matching
const GENRE_MAPPINGS: Record<string, string[]> = {
  // Fiction categories
  fiction: ['fiction', 'general-fiction', 'literary-fiction', 'literary', 'contemporary-fiction', 'novels', 'novel', 'stories', 'short-stories'],
  science_fiction: ['science-fiction', 'sci-fi', 'scifi', 'science fiction', 'sf', 'space', 'alien', 'futuristic', 'cyberpunk', 'space-opera', 'hard-sf'],
  fantasy: ['fantasy', 'epic-fantasy', 'high-fantasy', 'urban-fantasy', 'dark-fantasy', 'sword-and-sorcery', 'magic', 'magical', 'dragons', 'wizards', 'fae', 'faerie'],
  mystery: ['mystery', 'detective', 'crime', 'crime-fiction', 'whodunit', 'cozy-mystery', 'noir', 'police-procedural', 'murder-mystery'],
  thriller: ['thriller', 'suspense', 'psychological-thriller', 'legal-thriller', 'spy', 'espionage', 'action-thriller'],
  romance: ['romance', 'romantic', 'love-story', 'chick-lit', 'women-fiction', 'contemporary-romance', 'paranormal-romance', 'historical-romance'],
  historical_fiction: ['historical-fiction', 'historical', 'period-fiction', 'historical-novel', 'wwii', 'ww2', 'world-war'],
  young_adult: ['young-adult', 'ya', 'teen', 'adolescent', 'juvenile-fiction', 'ya-fiction', 'coming-of-age'],
  children: ['children', 'childrens', 'kids', 'middle-grade', 'juvenile', 'picture-book', 'chapter-book'],
  classics: ['classics', 'classic', 'literary-classics', 'canon', 'classic-literature', '19th-century', '20th-century'],
  
  // Non-fiction categories
  non_fiction: ['non-fiction', 'nonfiction', 'general-non-fiction', 'essays', 'journalism'],
  biography: ['biography', 'biographies', 'memoir', 'autobiography', 'memoirs', 'autobiographies', 'life-story'],
  history: ['history', 'historical-nonfiction', 'world-history', 'american-history', 'ancient-history', 'medieval', 'military-history', 'civil-war'],
  philosophy: ['philosophy', 'philosophical', 'ethics', 'metaphysics', 'stoicism', 'existentialism', 'eastern-philosophy'],
  science: ['science', 'scientific', 'physics', 'chemistry', 'biology', 'astronomy', 'neuroscience', 'evolution', 'popular-science'],
  psychology: ['psychology', 'psychological', 'psych', 'mental-health', 'behavioral', 'cognitive', 'neuroscience', 'psychiatry'],
  self_help: ['self-help', 'selfhelp', 'personal-development', 'motivation', 'self-improvement', 'productivity', 'habits', 'mindfulness', 'wellness'],
  business: ['business', 'economics', 'finance', 'management', 'leadership', 'entrepreneurship', 'investing', 'marketing', 'startups', 'career'],
  politics: ['politics', 'political', 'government', 'current-events', 'social-issues', 'activism', 'democracy'],
  religion: ['religion', 'religious', 'spirituality', 'theology', 'christianity', 'buddhism', 'islam', 'faith', 'spiritual'],
  travel: ['travel', 'travelogue', 'exploration', 'travel-writing', 'wanderlust'],
  cookbook: ['cookbook', 'cooking', 'food', 'recipes', 'culinary', 'baking', 'foodie'],
  art: ['art', 'artistic', 'design', 'photography', 'architecture', 'painting', 'sculpture', 'visual-arts', 'music'],
  education: ['education', 'academic', 'textbook', 'reference', 'learning', 'teaching'],
  technology: ['technology', 'tech', 'programming', 'coding', 'software', 'computer', 'ai', 'machine-learning', 'data'],
  
  // Special categories
  poetry: ['poetry', 'poems', 'verse', 'poet'],
  drama: ['drama', 'plays', 'theater', 'theatre', 'screenplay'],
  comics: ['comics', 'graphic-novel', 'graphic-novels', 'manga', 'superhero', 'comic-book', 'sequential-art'],
  horror: ['horror', 'scary', 'supernatural', 'paranormal', 'gothic', 'dark', 'creepy', 'haunted'],
  adventure: ['adventure', 'action', 'action-adventure', 'quest'],
  humor: ['humor', 'comedy', 'funny', 'satire', 'humorous', 'comedic', 'wit'],
  dystopian: ['dystopian', 'dystopia', 'post-apocalyptic', 'apocalyptic', 'utopia'],
  literary_fiction: ['literary', 'litfic', 'literary-fiction', 'booker', 'pulitzer', 'award-winning'],
  true_crime: ['true-crime', 'crime-nonfiction', 'criminal', 'forensic'],
  sports: ['sports', 'athletics', 'football', 'baseball', 'basketball', 'soccer', 'running'],
  nature: ['nature', 'environment', 'ecology', 'animals', 'wildlife', 'outdoors', 'climate'],
  health: ['health', 'medical', 'medicine', 'nutrition', 'fitness', 'diet', 'exercise'],
};

// Build reverse mapping for quick lookup
const REVERSE_MAPPINGS: Record<string, string> = {};
for (const [normalizedGenre, variants] of Object.entries(GENRE_MAPPINGS)) {
  for (const variant of variants) {
    REVERSE_MAPPINGS[variant.toLowerCase()] = normalizedGenre;
  }
}

// Non-genre shelves to filter out
const NON_GENRE_SHELVES = new Set([
  'to-read',
  'currently-reading',
  'read',
  'favorites',
  'owned',
  'owned-books',
  'wish-list',
  'wishlist',
  'library',
  'kindle',
  'ebook',
  'ebooks',
  'audiobook',
  'audiobooks',
  'audio',
  'physical',
  'paperback',
  'hardcover',
  'borrowed',
  'dnf',
  'did-not-finish',
  'abandoned',
  'on-hold',
  'series',
  're-read',
  'reread',
  'all-time-favorites',
  'default',
]);

/**
 * Normalize a single genre/bookshelf text to a standard category
 */
export function normalizeGenre(genreText: string): string | null {
  if (!genreText) return null;
  
  // Clean the genre text
  const cleaned = genreText.toLowerCase().trim().replace(/[^\w\s-]/g, '');
  
  // Skip non-genre shelves
  if (NON_GENRE_SHELVES.has(cleaned)) {
    return null;
  }
  
  // Direct match
  if (REVERSE_MAPPINGS[cleaned]) {
    return REVERSE_MAPPINGS[cleaned];
  }
  
  // Partial match (check if any variant is contained in the text)
  for (const [variant, normalized] of Object.entries(REVERSE_MAPPINGS)) {
    if (cleaned.includes(variant) || variant.includes(cleaned)) {
      return normalized;
    }
  }
  
  // Check for common patterns
  if (cleaned.includes('fiction') || cleaned.includes('novel')) {
    return 'fiction';
  }
  if (cleaned.includes('non-fiction') || cleaned.includes('nonfiction')) {
    return 'non_fiction';
  }
  if (cleaned.includes('classic') || cleaned.includes('canon')) {
    return 'classics';
  }
  if (cleaned.includes('young') || cleaned.includes('teen') || cleaned.includes('ya')) {
    return 'young_adult';
  }
  if (cleaned.includes('child') || cleaned.includes('kid')) {
    return 'children';
  }
  
  return null;
}

/**
 * Normalize a bookshelves string to a list of standardized genres
 */
export function normalizeBookshelves(bookshelves: string | null): string[] {
  if (!bookshelves) return [];
  
  // Split by common delimiters
  const genres = bookshelves.split(/[,;|]/);
  const normalizedGenres: string[] = [];
  
  for (const genre of genres) {
    const normalized = normalizeGenre(genre.trim());
    if (normalized && !normalizedGenres.includes(normalized)) {
      normalizedGenres.push(normalized);
    }
  }
  
  return normalizedGenres;
}

/**
 * Format a normalized genre name for display
 * e.g., "science_fiction" -> "Science Fiction"
 */
export function formatGenreName(genre: string): string {
  return genre
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all available normalized genre names
 */
export function getAllGenres(): string[] {
  return Object.keys(GENRE_MAPPINGS);
}

