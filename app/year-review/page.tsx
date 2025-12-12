'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, BookOpen } from 'lucide-react';
import { getBooks } from '@/lib/storage';
import { getYearsWithData, calculateYearStats } from '@/lib/stats';
import { Book, YearStats } from '@/lib/types';
import { YearSelector } from '@/components/year-review/year-selector';
import { YearStatsDisplay } from '@/components/year-review/year-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { YearSummaryData } from '@/app/api/year-summary/route';

export default function YearReviewPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearStats, setYearStats] = useState<YearStats | null>(null);
  const [yearSummary, setYearSummary] = useState<YearSummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const storedBooks = getBooks();
    if (storedBooks.length === 0) {
      router.push('/');
      return;
    }
    
    setBooks(storedBooks);
    
    const availableYears = getYearsWithData(storedBooks);
    setYears(availableYears);
    
    // Default to most recent year
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
    
    setLoading(false);
  }, [router]);
  
  // Calculate stats when year changes
  useEffect(() => {
    if (selectedYear && books.length > 0) {
      const stats = calculateYearStats(books, selectedYear);
      setYearStats(stats);
      // Reset summary when year changes
      setYearSummary(null);
      setSummaryError(null);
    }
  }, [selectedYear, books]);
  
  // Fetch AI summary for the year
  const fetchYearSummary = useCallback(async () => {
    if (!selectedYear || books.length === 0) return;
    
    // Get books for this year
    const yearBooks = books.filter(book => {
      if (!book.dateRead) return false;
      return new Date(book.dateRead).getFullYear() === selectedYear;
    });
    
    if (yearBooks.length === 0) return;
    
    setSummaryLoading(true);
    setSummaryError(null);
    
    try {
      const response = await fetch('/api/year-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books: yearBooks, year: selectedYear }),
      });
      
      const data = await response.json();
      
      if (data.success && data.summary) {
        setYearSummary(data.summary);
      } else {
        setSummaryError(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      setSummaryError('Failed to connect to AI service');
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedYear, books]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }
  
  if (years.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Reading Data Found</h2>
          <p className="text-muted-foreground">
            We couldn't find any books with read dates in your library.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Year in Review
          </h1>
          <p className="text-muted-foreground">
            A look back at your reading journey
          </p>
        </div>
        
        {selectedYear && (
          <YearSelector
            years={years}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        )}
      </div>
      
      {/* Year Stats */}
      {yearStats && yearStats.booksRead > 0 ? (
        <YearStatsDisplay 
          stats={yearStats} 
          summary={yearSummary}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
          onGenerateSummary={fetchYearSummary}
        />
      ) : yearStats ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Books Read in {selectedYear}</h2>
          <p className="text-muted-foreground">
            Try selecting a different year.
          </p>
        </div>
      ) : null}
    </div>
  );
}

