'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, BookOpen } from 'lucide-react';
import { getBooks, getYearSummary, saveYearSummary } from '@/lib/storage';
import { getYearsWithData, calculateYearStats } from '@/lib/stats';
import { track } from '@vercel/analytics';
import { Book, YearStats } from '@/lib/types';
import { YearSelector } from '@/components/year-review/year-selector';
import { YearStatsDisplay } from '@/components/year-review/year-stats';
import { YearShareButton } from '@/components/year-review/year-share';
import { Skeleton } from '@/components/ui/skeleton';
import { YearSummaryData } from '@/app/api/year-summary/route';

const COOLDOWN_SECONDS = 30;

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
  
  // Rate limiting state
  const [lastSummaryTime, setLastSummaryTime] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  
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
      
      // Load cached summary for this year
      const cachedSummary = getYearSummary(selectedYear);
      if (cachedSummary) {
        setYearSummary(cachedSummary as YearSummaryData);
      } else {
        setYearSummary(null);
      }
      setSummaryError(null);
    }
  }, [selectedYear, books]);
  
  // Fetch AI summary for the year with rate limiting
  const fetchYearSummary = useCallback(async () => {
    if (!selectedYear || books.length === 0) return;
    
    // Check cooldown (only applies if we already have a summary for this year)
    if (yearSummary) {
      const now = Date.now();
      const timeSinceLastRun = (now - lastSummaryTime) / 1000;
      if (lastSummaryTime > 0 && timeSinceLastRun < COOLDOWN_SECONDS) {
        return; // Still in cooldown
      }
      setLastSummaryTime(now);
    }
    
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
        saveYearSummary(selectedYear, data.summary);
        setLastSummaryTime(Date.now());
        track('year_summary_generated', { year: selectedYear, bookCount: yearBooks.length });
      } else {
        setSummaryError(data.error || 'Failed to generate summary');
      }
    } catch (error) {
      setSummaryError('Failed to connect to AI service');
    } finally {
      setSummaryLoading(false);
    }
  }, [selectedYear, books, yearSummary, lastSummaryTime]);
  
  // Cooldown timer effect
  useEffect(() => {
    if (lastSummaryTime === 0) return;
    
    const updateCooldown = () => {
      const remaining = Math.max(0, COOLDOWN_SECONDS - (Date.now() - lastSummaryTime) / 1000);
      setCooldownRemaining(Math.ceil(remaining));
    };
    
    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [lastSummaryTime]);
  
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
        
        <div className="flex items-center gap-3">
          {yearStats && yearStats.booksRead > 0 && (
            <YearShareButton stats={yearStats} summary={yearSummary} />
          )}
          {selectedYear && (
            <YearSelector
              years={years}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          )}
        </div>
      </div>
      
      {/* Year Stats */}
      {yearStats && yearStats.booksRead > 0 ? (
        <YearStatsDisplay 
          stats={yearStats} 
          summary={yearSummary}
          summaryLoading={summaryLoading}
          summaryError={summaryError}
          onGenerateSummary={fetchYearSummary}
          cooldownRemaining={cooldownRemaining}
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

