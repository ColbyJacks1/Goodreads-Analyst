'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Sparkles, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/upload/file-dropzone';
import { ImportProgressDisplay } from '@/components/upload/import-progress';
import { ExportGuide } from '@/components/upload/export-guide';
import { parseGoodreadsCsv } from '@/lib/csv-parser';
import { saveBooks, getBookCount, clearBooks, clearAnalysis } from '@/lib/storage';
import { normalizeBookshelves } from '@/lib/genre-normalizer';
import { startBackgroundAnalysis, resetAnalysisState } from '@/lib/background-analysis';
import { Book, ImportProgress } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [existingBookCount, setExistingBookCount] = useState(0);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'idle',
    current: 0,
    total: 0,
    message: '',
  });
  
  useEffect(() => {
    setExistingBookCount(getBookCount());
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
      // This runs while user is viewing stats, so analysis is ready when they click Analyze
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
    resetAnalysisState();
    setExistingBookCount(0);
    setProgress({
      stage: 'idle',
      current: 0,
      total: 0,
      message: '',
    });
  }, []);
  
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
                    <p className="text-lg font-medium mb-2">
                      You have {existingBookCount.toLocaleString()} books loaded
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Continue exploring your library or upload a new file
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
                  <FileDropzone onFileSelect={handleFileSelect} disabled={isProcessing} />
                  <ExportGuide />
                </div>
              )}
            </>
          ) : (
            <ImportProgressDisplay progress={progress} />
          )}
        </div>
        
        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Your data is processed locally and stored in your browser. 
          We don&apos;t store your reading history on our servers.
        </p>
      </div>
    </div>
  );
}
