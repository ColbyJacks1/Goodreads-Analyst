'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Star, FileText, TrendingUp, Award, RefreshCw, Loader2, Calendar, Clock, History, Zap } from 'lucide-react';
import { getBooks, saveBooks } from '@/lib/storage';
import { calculateStats } from '@/lib/stats';
import { Book, BookStats } from '@/lib/types';
import { enrichBooksWithGenres, EnrichmentProgress } from '@/lib/genre-fetcher';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stats/stat-card';
import { GenreChart } from '@/components/stats/genre-chart';
import { RatingChart } from '@/components/stats/rating-chart';
import { TimelineChart } from '@/components/stats/timeline-chart';
import { BookList } from '@/components/books/book-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatsPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [enriching, setEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<EnrichmentProgress | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    const storedBooks = getBooks();
    if (storedBooks.length === 0) {
      router.push('/');
      return;
    }
    
    setBooks(storedBooks);
    setStats(calculateStats(storedBooks));
    setLoading(false);
    
    // Auto-start genre fetching in background if needed
    const booksNeedingGenres = storedBooks.filter(
      b => b.exclusiveShelf === 'read' && b.genres.length === 0
    );
    
    if (booksNeedingGenres.length > 0) {
      // Start in background after a small delay
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      setTimeout(() => {
        setEnriching(true);
        enrichBooksWithGenres(
          storedBooks,
          (progress) => setEnrichProgress(progress),
          controller.signal
        ).then((enrichedBooks) => {
          saveBooks(enrichedBooks);
          setBooks(enrichedBooks);
          setStats(calculateStats(enrichedBooks));
        }).catch(() => {
          // Ignore abort errors
        }).finally(() => {
          setEnriching(false);
          setEnrichProgress(null);
        });
      }, 500);
    }
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [router]);
  
  const handleEnrichGenres = useCallback(async () => {
    if (enriching) {
      // Cancel ongoing enrichment
      abortControllerRef.current?.abort();
      setEnriching(false);
      setEnrichProgress(null);
      return;
    }
    
    setEnriching(true);
    abortControllerRef.current = new AbortController();
    
    try {
      const enrichedBooks = await enrichBooksWithGenres(
        books,
        (progress) => setEnrichProgress(progress),
        abortControllerRef.current.signal
      );
      
      // Save and update state
      saveBooks(enrichedBooks);
      setBooks(enrichedBooks);
      setStats(calculateStats(enrichedBooks));
    } catch (error) {
      console.error('Enrichment failed:', error);
    } finally {
      setEnriching(false);
      setEnrichProgress(null);
    }
  }, [books, enriching]);
  
  // Count books needing genres (no longer requires ISBN - we can search by title/author)
  const booksWithoutGenres = books.filter(
    b => b.exclusiveShelf === 'read' && b.genres.length === 0
  ).length;
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Reading Stats</h1>
        <p className="text-muted-foreground">
          An overview of your reading journey based on {stats.booksRead} books you&apos;ve read
        </p>
      </div>
      
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Books Read"
          value={stats.booksRead.toLocaleString()}
          subtitle={`${stats.totalBooks} in library`}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Pages Read"
          value={stats.totalPages.toLocaleString()}
          subtitle={`~${stats.averagePages} per book`}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          subtitle={`${stats.booksWithRatings} rated`}
          icon={<Star className="w-5 h-5" />}
        />
        <StatCard
          title="Unique Authors"
          value={stats.uniqueAuthors.toLocaleString()}
          subtitle={`${stats.uniqueGenres} genres`}
          icon={<Users className="w-5 h-5" />}
        />
      </div>
      
      {/* Reading Timeline - moved up */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Reading Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="yearly">
            <TabsList className="mb-4">
              <TabsTrigger value="yearly">By Year</TabsTrigger>
              <TabsTrigger value="monthly">Last 12 Months</TabsTrigger>
            </TabsList>
            <TabsContent value="yearly">
              <TimelineChart data={stats.yearlyReading} type="yearly" />
            </TabsContent>
            <TabsContent value="monthly">
              <TimelineChart data={stats.monthlyReading} type="monthly" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Publication Era & Reading Pace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Publication Era */}
        {stats.publicationEra.averageYear > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Publication Era
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                When your books were originally published
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Average Publication Year</span>
                <span className="text-2xl font-bold text-primary">{stats.publicationEra.averageYear}</span>
              </div>
              
              {stats.publicationEra.oldestBook && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Oldest Read</p>
                  <p className="font-medium text-sm truncate">{stats.publicationEra.oldestBook.title}</p>
                  <p className="text-xs text-muted-foreground">{stats.publicationEra.oldestBook.author} ({stats.publicationEra.oldestBook.year})</p>
                </div>
              )}
              
              {stats.publicationEra.newestBook && (
                <div className="p-3 bg-secondary/50 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Newest Read</p>
                  <p className="font-medium text-sm truncate">{stats.publicationEra.newestBook.title}</p>
                  <p className="text-xs text-muted-foreground">{stats.publicationEra.newestBook.author} ({stats.publicationEra.newestBook.year})</p>
                </div>
              )}
              
              {stats.publicationEra.byDecade.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">By Decade</p>
                  <div className="grid grid-cols-3 gap-2">
                    {stats.publicationEra.byDecade.slice(-6).map(d => (
                      <div key={d.decade} className="text-center p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">{d.decade}</p>
                        <p className="font-bold text-sm">{d.count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Reading Pace */}
        {stats.readingPace.booksWithPaceData > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Reading Pace
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Time from adding a book to finishing it
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Average Days to Read</span>
                <span className="text-2xl font-bold text-primary">
                  {stats.readingPace.averageDaysToRead}
                  <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
                </span>
              </div>
              
              {stats.readingPace.fastestRead && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">Fastest Read</p>
                  </div>
                  <p className="font-medium text-sm truncate">{stats.readingPace.fastestRead.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.readingPace.fastestRead.author} — {stats.readingPace.fastestRead.days} days
                  </p>
                </div>
              )}
              
              {stats.readingPace.slowestRead && stats.readingPace.slowestRead.days !== stats.readingPace.fastestRead?.days && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Slowest Read</p>
                  </div>
                  <p className="font-medium text-sm truncate">{stats.readingPace.slowestRead.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.readingPace.slowestRead.author} — {stats.readingPace.slowestRead.days} days
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                Based on {stats.readingPace.booksWithPaceData} books with complete date data
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Genre Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Genre Distribution
              </CardTitle>
              {booksWithoutGenres > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnrichGenres}
                  disabled={false}
                >
                  {enriching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {enrichProgress 
                        ? `${enrichProgress.current}/${enrichProgress.total}` 
                        : 'Starting...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Fetch Genres ({booksWithoutGenres})
                    </>
                  )}
                </Button>
              )}
            </div>
            {stats.topGenres.length === 0 && !enriching && (
              <p className="text-sm text-muted-foreground mt-1">
                Click &quot;Fetch Genres&quot; to get genre data from Open Library
              </p>
            )}
          </CardHeader>
          <CardContent>
            <GenreChart data={stats.topGenres} />
            {enriching && enrichProgress && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Found genres for {enrichProgress.booksEnriched} books so far...
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Your Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RatingChart data={stats.ratingDistribution} />
          </CardContent>
        </Card>
      </div>
      
      {/* Top Authors */}
      {stats.topAuthors.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Favorite Authors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.topAuthors.slice(0, 10).map((author, index) => (
                <div 
                  key={author.author} 
                  className="p-3 bg-muted rounded-lg text-center"
                >
                  <p className="font-medium text-sm truncate" title={author.author}>
                    {author.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {author.count} books
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Book List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Your Library
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="read">
            <TabsList className="mb-4">
              <TabsTrigger value="read">
                Read ({books.filter(b => b.exclusiveShelf === 'read').length})
              </TabsTrigger>
              <TabsTrigger value="to-read">
                To Read ({books.filter(b => b.exclusiveShelf === 'to-read').length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({books.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="read">
              <BookList books={books.filter(b => b.exclusiveShelf === 'read')} />
            </TabsContent>
            <TabsContent value="to-read">
              <BookList books={books.filter(b => b.exclusiveShelf === 'to-read')} />
            </TabsContent>
            <TabsContent value="all">
              <BookList books={books} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

