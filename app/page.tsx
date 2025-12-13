'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, BarChart3, ArrowRight, PlayCircle, Brain, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDropzone } from '@/components/upload/file-dropzone';
import { ImportProgressDisplay } from '@/components/upload/import-progress';
import { ExportGuideButton, ExportGuideTooltip } from '@/components/home/export-guide';
import { QuickRecommendCompact } from '@/components/home/quick-recommend';
import { EXAMPLE_PREVIEWS } from '@/lib/demo-data';
import { parseGoodreadsCsv } from '@/lib/csv-parser';
import { saveBooks, getBookCount, clearBooks, clearAnalysis, loadDemoData, isDemoMode, clearDemoData } from '@/lib/storage';
import { normalizeBookshelves } from '@/lib/genre-normalizer';
import { startBackgroundAnalysis, resetAnalysisState } from '@/lib/background-analysis';
import { Book, ImportProgress } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [existingBookCount, setExistingBookCount] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    current: 0,
    total: 0,
    message: '',
  });
  
  useEffect(() => {
    setExistingBookCount(getBookCount());
    setIsDemo(isDemoMode());
  }, []);
  
  const enrichBooks = useCallback(async (
    books: Book[], 
    onProgress: (current: number, total: number) => void
  ): Promise<Book[]> => {
    // Apply local genre normalization to all books (instant)
    const enrichedBooks = books.map(book => {
      // Get the best ISBN available (prefer ISBN13)
      const isbn = book.isbn13 || book.isbn;
      
      // Generate cover URL - Open Library covers work with ISBNs
      let coverUrl: string | null = null;
      if (isbn && isbn.length >= 10) {
        coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
      }
      
      return {
        ...book,
        genres: normalizeBookshelves(book.bookshelves),
        coverUrl,
      };
    });
    
    onProgress(books.length, books.length);
    return enrichedBooks;
  }, []);
  
  const handleFileSelect = useCallback(async (file: File) => {
    setProgress({
      stage: 'parsing',
      current: 0,
      total: 0,
      message: 'Reading CSV file...',
    });
    
    try {
      // Parse the CSV file
      const result = await parseGoodreadsCsv(file);
      
      if (!result.success) {
        setProgress({
          stage: 'error',
          current: 0,
          total: 0,
          message: result.errors[0] || 'Failed to parse CSV file',
        });
        return;
      }
      
      setProgress({
        stage: 'parsing',
        current: result.books.length,
        total: result.books.length,
        message: `Found ${result.books.length} books`,
      });
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress({
        stage: 'enriching',
        current: 0,
        total: result.books.length,
        message: 'Processing book data...',
      });
      
      // Enrich books with genre normalization and cover URLs
      const enrichedBooks = await enrichBooks(result.books, (current, total) => {
        setProgress({
          stage: 'enriching',
          current,
          total,
          message: `Processed ${current} of ${total} books...`,
        });
      });
      
      setProgress({
        stage: 'enriching',
        current: enrichedBooks.length,
        total: enrichedBooks.length,
        message: 'Almost done...',
      });
      
      // Save books to localStorage
      saveBooks(enrichedBooks);
      setExistingBookCount(enrichedBooks.length);
      
      // Start AI analysis in the background immediately
      startBackgroundAnalysis(enrichedBooks);
      
      setProgress({
        stage: 'complete',
        current: enrichedBooks.length,
        total: enrichedBooks.length,
        message: 'Import complete! AI analysis starting in background...',
      });
      
      // Navigate to stats page after a brief delay
      setTimeout(() => {
        router.push('/stats');
      }, 1500);
      
    } catch (error) {
      console.error('Import error:', error);
      setProgress({
        stage: 'error',
        current: 0,
        total: 0,
        message: error instanceof Error ? error.message : 'An error occurred during import',
      });
    }
  }, [enrichBooks, router]);
  
  const handleClearData = useCallback(() => {
    clearBooks();
    clearAnalysis();
    clearDemoData();
    resetAnalysisState();
    setExistingBookCount(0);
    setIsDemo(false);
    setProgress({
      stage: 'idle',
      current: 0,
      total: 0,
      message: '',
    });
  }, []);

  const handleTryDemo = useCallback(() => {
    loadDemoData();
    setExistingBookCount(28); // Demo has ~28 read books
    setIsDemo(true);
    router.push('/stats');
  }, [router]);
  
  const isProcessing = progress.stage === 'parsing' || progress.stage === 'enriching';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Goodreads Analyzer
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover what your reading history reveals about you. Get AI-powered insights, 
            personalized recommendations, and a humorous roast of your literary choices.
          </p>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">AI-powered personality analysis</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
            <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Beautiful reading statistics</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
            <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-sm">Personalized recommendations</span>
          </div>
        </div>
        
        {/* Upload Section */}
        <div className="bg-card rounded-2xl border p-8 shadow-sm">
          {progress.stage === 'idle' ? (
            <>
              {existingBookCount > 0 ? (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-muted rounded-xl">
                    {isDemo && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 bg-primary/10 rounded-full text-sm font-medium text-primary">
                        <Sparkles className="w-3.5 h-3.5" />
                        Demo Mode
                      </div>
                    )}
                    <p className="text-lg font-medium mb-2">
                      You have {existingBookCount.toLocaleString()} books loaded
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDemo 
                        ? 'Explore the app with sample data, or upload your own library'
                        : 'Continue exploring your library or upload a new file'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={() => router.push('/stats')}>
                        View My Stats
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button variant="outline" onClick={handleClearData}>
                        Upload New File
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* File upload with help tooltip */}
                  <div className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <ExportGuideTooltip />
                    </div>
                    <FileDropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
                  </div>
                  
                  {/* Export help link */}
                  <div className="text-center">
                    <ExportGuideButton />
                  </div>
                  
                  {/* Demo option */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      onClick={handleTryDemo}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Try with sample data
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      See how it works without uploading anything
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ImportProgressDisplay progress={progress} />
          )}
        </div>
        
        {/* Below-fold content when no books uploaded */}
        {existingBookCount === 0 && progress.stage === 'idle' && (
          <>
            {/* Quick Recommendation */}
            <Card className="mt-12 border-dashed">
              <CardContent className="p-6">
                <QuickRecommendCompact />
              </CardContent>
            </Card>
            
            {/* Example Previews */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-center mb-6">
                What You&apos;ll Discover
              </h2>
              
              <Tabs defaultValue="roast" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="roast" className="text-xs sm:text-sm gap-1">
                    <MessageSquare className="w-3.5 h-3.5 hidden sm:inline" />
                    Roast
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="text-xs sm:text-sm gap-1">
                    <User className="w-3.5 h-3.5 hidden sm:inline" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="year" className="text-xs sm:text-sm gap-1">
                    <Brain className="w-3.5 h-3.5 hidden sm:inline" />
                    Year Review
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="roast">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <MessageSquare className="w-5 h-5" />
                        {EXAMPLE_PREVIEWS.roast.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80 italic mb-3">
                        &ldquo;{EXAMPLE_PREVIEWS.roast.preview}&rdquo;
                      </p>
                      <p className="text-sm text-foreground/60">
                        Sample: &ldquo;{EXAMPLE_PREVIEWS.roast.fullQuote}&rdquo;
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="profile">
                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <User className="w-5 h-5" />
                        {EXAMPLE_PREVIEWS.profile.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-foreground mb-2">
                        {EXAMPLE_PREVIEWS.profile.type}
                      </p>
                      <p className="text-foreground/80">
                        {EXAMPLE_PREVIEWS.profile.preview}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="year">
                  <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-teal-700 dark:text-teal-400">
                        <Brain className="w-5 h-5" />
                        {EXAMPLE_PREVIEWS.yearSummary.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-foreground mb-2">
                        {EXAMPLE_PREVIEWS.yearSummary.headline}
                      </p>
                      <p className="text-foreground/80">
                        {EXAMPLE_PREVIEWS.yearSummary.preview}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="text-center mt-6">
                <Button onClick={handleTryDemo} variant="outline" className="gap-2">
                  <PlayCircle className="w-4 h-4" />
                  See Full Demo
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-lg mx-auto">
          Your CSV stays in your browser. AI features send your book list (titles, ratings, dates) 
          to generate insights — we don&apos;t store your library. Not affiliated with Goodreads or Amazon.
        </p>
      </div>
    </div>
  );
}
