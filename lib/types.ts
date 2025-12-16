// Core data types for Goodreads Analyzer

export interface Book {
  id: string;
  bookId: string;
  title: string;
  author: string;
  isbn: string | null;
  isbn13: string | null;
  myRating: number | null;
  averageRating: number | null;
  publisher: string | null;
  pages: number | null;
  yearPublished: number | null;
  originalPublicationYear: number | null;
  dateRead: string | null;
  dateAdded: string | null;
  bookshelves: string | null;
  exclusiveShelf: 'read' | 'to-read' | 'currently-reading' | null;
  myReview: string | null;
  // Enriched data from Open Library
  genres: string[];
  coverUrl: string | null;
  description: string | null;
}

export interface BookStats {
  totalBooks: number;
  booksRead: number;
  booksWithRatings: number;
  totalPages: number;
  averageRating: number;
  averagePages: number;
  uniqueAuthors: number;
  uniqueGenres: number;
  topGenres: { genre: string; count: number }[];
  topAuthors: { author: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  yearlyReading: { year: number; count: number }[];
  monthlyReading: { month: string; count: number }[];
  // Publication era stats
  publicationEra: {
    averageYear: number;
    oldestBook: { title: string; author: string; year: number } | null;
    newestBook: { title: string; author: string; year: number } | null;
    byDecade: { decade: string; count: number }[];
  };
  // Reading pace stats
  readingPace: {
    averageDaysToRead: number;
    fastestRead: { title: string; author: string; days: number } | null;
    slowestRead: { title: string; author: string; days: number } | null;
    booksWithPaceData: number;
  };
}

export interface YearStats {
  year: number;
  booksRead: number;
  pagesRead: number;
  averageRating: number;
  topGenre: string;
  topGenres: { genre: string; count: number }[];
  topRatedBooks: Book[];
  monthlyBreakdown: { month: string; count: number }[];
  uniqueAuthors: number;
  longestBook: Book | null;
  shortestBook: Book | null;
}

// Analysis types
export interface RoastAnalysis {
  readerSummary: string;
  roastBullets: string[];
  readingHabits: {
    mostReadGenre: string;
    mostReadGenreComment: string;
    readingSpeed: string;
    readingSpeedComment: string;
    ratingPattern: string;
    ratingPatternComment: string;
    bookSelectionMethod: string;
    bookSelectionComment: string;
  };
  predictions: string[];
}

export interface BookRecommendation {
  title: string;
  author: string;
  whyThisBook: string;
  connectionToReading: string;
  whatToExpect?: string;
  themes: string[];
  coverUrl?: string;
}

export interface RecommendationsAnalysis {
  recommendations: BookRecommendation[];
  genreExpansion: string;
}

export interface ProfileAnalysis {
  demographics: {
    ageLifeStage: string;
    educationLevel: string;
    professionalField: string;
    geographicLocation: string;
    familyStatus: string;
  };
  mindset: {
    politicsValues: string;
    riskTolerance: string;
    learningStyle: string;
    informationDiet: string;
    lifeArc: string;
  };
  detailedAnalysis: string;
}

export interface InsightsAnalysis {
  literaryPortrait: string;
  dominantThemes: string;
  readingTimeline: string;
  personalityType: string;
  intellectualProfile: string;
}

// Raw analysis format (as returned from API)
export interface RawAnalysisSection {
  raw: string;
}

export interface FullAnalysis {
  roast?: RoastAnalysis | RawAnalysisSection;
  recommendations?: RecommendationsAnalysis | RawAnalysisSection;
  profile?: ProfileAnalysis | RawAnalysisSection;
  insights?: InsightsAnalysis | RawAnalysisSection;
  generatedAt?: string;
}

// API types
export interface EnrichRequest {
  books: {
    isbn: string | null;
    isbn13: string | null;
    title: string;
    author: string;
  }[];
}

export interface EnrichedBookData {
  isbn: string;
  genres: string[];
  coverUrl: string | null;
  description: string | null;
}

export interface EnrichResponse {
  enrichedBooks: EnrichedBookData[];
}

export interface AnalyzeRequest {
  books: Book[];
  analysisType: 'quick' | 'deep' | 'full';
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: Partial<FullAnalysis>;
  error?: string;
}

export interface RecommendRequest {
  books: Book[];
  prompt: string;
}

export interface RecommendResponse {
  success: boolean;
  recommendations?: BookRecommendation[];
  error?: string;
}

// Import progress
export interface ImportProgress {
  stage: 'idle' | 'parsing' | 'enriching' | 'complete' | 'error';
  current: number;
  total: number;
  message: string;
}

// Storage keys
export const STORAGE_KEYS = {
  BOOKS: 'goodreads-analyzer-books',
  ANALYSIS: 'goodreads-analyzer-analysis',
  YEAR_SUMMARIES: 'goodreads-analyzer-year-summaries',
  LAST_UPDATED: 'goodreads-analyzer-last-updated',
} as const;

