'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Loader2 } from 'lucide-react';
import { getBooks } from '@/lib/storage';
import { Book, BookRecommendation } from '@/lib/types';
import { PromptInput } from '@/components/recommendations/prompt-input';
import { RecommendationResults } from '@/components/recommendations/recommendation-results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecommendationsPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const storedBooks = getBooks();
    if (storedBooks.length === 0) {
      router.push('/');
      return;
    }
    
    setBooks(storedBooks);
    setLoading(false);
  }, [router]);
  
  const handlePromptSubmit = useCallback(async (prompt: string) => {
    if (books.length === 0) return;
    
    setGenerating(true);
    setError(null);
    setCurrentPrompt(prompt);
    setRecommendations([]);
    
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books, prompt }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate recommendations');
      }
      
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  }, [books]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Find Your Next Read
        </h1>
        <p className="text-muted-foreground">
          Tell us what you're in the mood for and we'll suggest books based on your reading history
        </p>
      </div>
      
      {/* Prompt Input */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            What are you looking for?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PromptInput onSubmit={handlePromptSubmit} disabled={generating} />
        </CardContent>
      </Card>
      
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      
      {/* Loading State */}
      {generating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Finding perfect books for you...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Analyzing your reading history and preferences
          </p>
        </div>
      )}
      
      {/* Results */}
      {!generating && (
        <RecommendationResults 
          recommendations={recommendations} 
          prompt={currentPrompt}
        />
      )}
      
      {/* Empty State */}
      {!generating && recommendations.length === 0 && !currentPrompt && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Ready when you are!</p>
          <p className="text-sm mt-1">
            Select a quick option or type your own request above
          </p>
        </div>
      )}
    </div>
  );
}

