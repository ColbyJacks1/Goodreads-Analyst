// Statistics calculation for book data

import { Book, BookStats, YearStats } from './types';
import { formatGenreName } from './genre-normalizer';

/**
 * Calculate comprehensive statistics from book data
 * Focuses on "read" books for meaningful stats
 */
export function calculateStats(books: Book[]): BookStats {
  // Filter to only books marked as "read" for accurate stats
  const readBooks = books.filter(b => b.exclusiveShelf === 'read');
  const booksWithRatings = readBooks.filter(b => b.myRating && b.myRating > 0);
  const booksWithPages = readBooks.filter(b => b.pages && b.pages > 0);
  
  // Calculate totals
  const totalPages = booksWithPages.reduce((sum, b) => sum + (b.pages || 0), 0);
  const totalRating = booksWithRatings.reduce((sum, b) => sum + (b.myRating || 0), 0);
  
  // Genre distribution (from read books only)
  const genreCounts: Record<string, number> = {};
  for (const book of readBooks) {
    for (const genre of book.genres) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count]) => ({ genre: formatGenreName(genre), count }));
  
  // Author distribution (from read books only)
  const authorCounts: Record<string, number> = {};
  for (const book of readBooks) {
    if (book.author) {
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    }
  }
  const topAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([author, count]) => ({ author, count }));
  
  // Rating distribution
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const book of booksWithRatings) {
    const rating = Math.round(book.myRating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  }
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: ratingCounts[rating],
  }));
  
  // Yearly reading distribution (from read books with dates)
  const yearlyCounts: Record<number, number> = {};
  for (const book of readBooks) {
    if (book.dateRead) {
      const year = new Date(book.dateRead).getFullYear();
      if (!isNaN(year)) {
        yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;
      }
    }
  }
  const yearlyReading = Object.entries(yearlyCounts)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([year, count]) => ({ year: parseInt(year), count }));
  
  // Monthly reading distribution (last 12 months or all time)
  const monthlyCounts: Record<string, number> = {};
  for (const book of readBooks) {
    if (book.dateRead) {
      const date = new Date(book.dateRead);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    }
  }
  const monthlyReading = Object.entries(monthlyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, count]) => ({ month, count }));
  
  // Unique counts (from read books)
  const uniqueAuthors = new Set(readBooks.map(b => b.author).filter(Boolean)).size;
  const uniqueGenres = new Set(readBooks.flatMap(b => b.genres)).size;
  
  return {
    totalBooks: books.length,
    booksRead: readBooks.length,
    booksWithRatings: booksWithRatings.length,
    totalPages,
    averageRating: booksWithRatings.length > 0 
      ? Math.round((totalRating / booksWithRatings.length) * 100) / 100 
      : 0,
    averagePages: booksWithPages.length > 0 
      ? Math.round(totalPages / booksWithPages.length) 
      : 0,
    uniqueAuthors,
    uniqueGenres,
    topGenres,
    topAuthors,
    ratingDistribution,
    yearlyReading,
    monthlyReading,
  };
}

/**
 * Calculate statistics for a specific year
 */
export function calculateYearStats(books: Book[], year: number): YearStats {
  // Filter books read in the specified year
  const yearBooks = books.filter(book => {
    if (!book.dateRead) return false;
    const readYear = new Date(book.dateRead).getFullYear();
    return readYear === year;
  });
  
  const booksWithRatings = yearBooks.filter(b => b.myRating && b.myRating > 0);
  const booksWithPages = yearBooks.filter(b => b.pages && b.pages > 0);
  
  // Total pages
  const pagesRead = booksWithPages.reduce((sum, b) => sum + (b.pages || 0), 0);
  
  // Average rating
  const totalRating = booksWithRatings.reduce((sum, b) => sum + (b.myRating || 0), 0);
  const averageRating = booksWithRatings.length > 0 
    ? Math.round((totalRating / booksWithRatings.length) * 100) / 100 
    : 0;
  
  // Top genres
  const genreCounts: Record<string, number> = {};
  for (const book of yearBooks) {
    for (const genre of book.genres) {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    }
  }
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  const topGenreEntry = sortedGenres[0];
  const topGenre = topGenreEntry ? formatGenreName(topGenreEntry[0]) : 'Unknown';
  const topGenres = sortedGenres
    .slice(0, 8)
    .map(([genre, count]) => ({ genre: formatGenreName(genre), count }));
  
  // Top rated books (5 stars or highest rated)
  const topRatedBooks = [...yearBooks]
    .filter(b => b.myRating && b.myRating > 0)
    .sort((a, b) => (b.myRating || 0) - (a.myRating || 0))
    .slice(0, 5);
  
  // Monthly breakdown
  const monthlyCounts: Record<string, number> = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (const book of yearBooks) {
    if (book.dateRead) {
      const month = new Date(book.dateRead).getMonth();
      monthlyCounts[monthNames[month]] = (monthlyCounts[monthNames[month]] || 0) + 1;
    }
  }
  const monthlyBreakdown = monthNames.map(month => ({
    month,
    count: monthlyCounts[month] || 0,
  }));
  
  // Unique authors
  const uniqueAuthors = new Set(yearBooks.map(b => b.author).filter(Boolean)).size;
  
  // Longest and shortest books
  const sortedByPages = booksWithPages.sort((a, b) => (b.pages || 0) - (a.pages || 0));
  const longestBook = sortedByPages[0] || null;
  const shortestBook = sortedByPages[sortedByPages.length - 1] || null;
  
  return {
    year,
    booksRead: yearBooks.length,
    pagesRead,
    averageRating,
    topGenre,
    topGenres,
    topRatedBooks,
    monthlyBreakdown,
    uniqueAuthors,
    longestBook,
    shortestBook,
  };
}

/**
 * Get all years that have reading data
 */
export function getYearsWithData(books: Book[]): number[] {
  const years = new Set<number>();
  
  for (const book of books) {
    if (book.dateRead) {
      const year = new Date(book.dateRead).getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    }
  }
  
  return Array.from(years).sort((a, b) => b - a); // Most recent first
}

