// CSV Parser for Goodreads export format using Papa Parse

import Papa from 'papaparse';
import { Book } from './types';

// Goodreads CSV column names
interface GoodreadsRow {
  'Book Id': string;
  'Title': string;
  'Author': string;
  'Author l-f': string;
  'Additional Authors': string;
  'ISBN': string;
  'ISBN13': string;
  'My Rating': string;
  'Average Rating': string;
  'Publisher': string;
  'Binding': string;
  'Number of Pages': string;
  'Year Published': string;
  'Original Publication Year': string;
  'Date Read': string;
  'Date Added': string;
  'Bookshelves': string;
  'Bookshelves with positions': string;
  'Exclusive Shelf': string;
  'My Review': string;
  'Spoiler': string;
  'Private Notes': string;
  'Read Count': string;
  'Owned Copies': string;
}

/**
 * Parse a date string from various Goodreads formats
 */
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  const value = dateStr.trim();
  
  // Try different date formats
  const formats = [
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
  ];
  
  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      // Return ISO format
      if (format === formats[0] || format === formats[1]) {
        return value.replace(/\//g, '-');
      } else {
        // MM/DD/YYYY -> YYYY-MM-DD
        return `${match[3]}-${match[1]}-${match[2]}`;
      }
    }
  }
  
  // Try parsing as a date directly
  try {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Invalid date
  }
  
  return null;
}

/**
 * Parse a rating string to a number
 */
function parseRating(ratingStr: string | undefined): number | null {
  if (!ratingStr || ratingStr.trim() === '') return null;
  
  const rating = parseFloat(ratingStr.trim());
  if (isNaN(rating) || rating <= 0) return null;
  
  return rating;
}

/**
 * Parse a year string to a number
 */
function parseYear(yearStr: string | undefined): number | null {
  if (!yearStr || yearStr.trim() === '') return null;
  
  const year = parseInt(yearStr.trim(), 10);
  if (isNaN(year) || year < 1500 || year > 2030) return null;
  
  return year;
}

/**
 * Parse a pages string to a number
 */
function parsePages(pagesStr: string | undefined): number | null {
  if (!pagesStr || pagesStr.trim() === '') return null;
  
  const pages = parseInt(pagesStr.trim(), 10);
  if (isNaN(pages) || pages <= 0) return null;
  
  return pages;
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text: string | undefined): string | null {
  if (!text || typeof text !== 'string') return null;
  
  const cleaned = text.trim().replace(/\s+/g, ' ');
  return cleaned || null;
}

/**
 * Clean ISBN by removing quotes and formatting characters
 */
function cleanIsbn(isbn: string | undefined): string | null {
  if (!isbn) return null;
  
  // Remove equals signs, quotes, spaces, and hyphens that Goodreads adds
  const cleaned = isbn.replace(/[="'\s-]/g, '');
  
  // Validate it looks like an ISBN (10 or 13 digits, possibly with X)
  if (cleaned && /^[\dXx]{10,13}$/.test(cleaned)) {
    return cleaned;
  }
  
  return null;
}

/**
 * Parse exclusive shelf value
 */
function parseExclusiveShelf(shelf: string | undefined): 'read' | 'to-read' | 'currently-reading' | null {
  if (!shelf) return null;
  
  const cleaned = shelf.toLowerCase().trim();
  if (cleaned === 'read') return 'read';
  if (cleaned === 'to-read') return 'to-read';
  if (cleaned === 'currently-reading') return 'currently-reading';
  
  return null;
}

/**
 * Generate a unique ID for a book
 */
function generateId(): string {
  return `book_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Process a single CSV row into a Book object
 */
function processRow(row: GoodreadsRow): Book | null {
  const title = cleanText(row['Title']);
  const author = cleanText(row['Author']);
  
  // Skip rows without essential data
  if (!title || !author) {
    return null;
  }
  
  return {
    id: generateId(),
    bookId: row['Book Id'] || '',
    title,
    author,
    isbn: cleanIsbn(row['ISBN']),
    isbn13: cleanIsbn(row['ISBN13']),
    myRating: parseRating(row['My Rating']),
    averageRating: parseRating(row['Average Rating']),
    publisher: cleanText(row['Publisher']),
    pages: parsePages(row['Number of Pages']),
    yearPublished: parseYear(row['Year Published']),
    originalPublicationYear: parseYear(row['Original Publication Year']),
    dateRead: parseDate(row['Date Read']),
    dateAdded: parseDate(row['Date Added']),
    bookshelves: cleanText(row['Bookshelves']),
    exclusiveShelf: parseExclusiveShelf(row['Exclusive Shelf']),
    myReview: cleanText(row['My Review']),
    // These will be filled in by enrichment
    genres: [],
    coverUrl: null,
    description: null,
  };
}

export interface ParseResult {
  success: boolean;
  books: Book[];
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  errors: string[];
}

/**
 * Parse a Goodreads CSV file
 */
export function parseGoodreadsCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const result: ParseResult = {
      success: false,
      books: [],
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0,
      errors: [],
    };
    
    Papa.parse<GoodreadsRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parseResult) => {
        result.totalRows = parseResult.data.length;
        
        for (let i = 0; i < parseResult.data.length; i++) {
          try {
            const book = processRow(parseResult.data[i]);
            if (book) {
              result.books.push(book);
              result.processedRows++;
            } else {
              result.skippedRows++;
            }
          } catch (error) {
            result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            result.skippedRows++;
          }
        }
        
        result.success = result.books.length > 0;
        resolve(result);
      },
      error: (error) => {
        result.errors.push(`Parse error: ${error.message}`);
        resolve(result);
      },
    });
  });
}

/**
 * Parse CSV content from a string (useful for testing)
 */
export function parseGoodreadsCsvString(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    books: [],
    totalRows: 0,
    processedRows: 0,
    skippedRows: 0,
    errors: [],
  };
  
  const parseResult = Papa.parse<GoodreadsRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  
  result.totalRows = parseResult.data.length;
  
  for (let i = 0; i < parseResult.data.length; i++) {
    try {
      const book = processRow(parseResult.data[i]);
      if (book) {
        result.books.push(book);
        result.processedRows++;
      } else {
        result.skippedRows++;
      }
    } catch (error) {
      result.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.skippedRows++;
    }
  }
  
  result.success = result.books.length > 0;
  return result;
}

