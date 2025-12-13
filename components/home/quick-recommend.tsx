'use client';

import { useState } from 'react';
import { Loader2, Sparkles, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface QuickRecommendation {
  title: string;
  author: string;
  reason: string;
}

export function QuickRecommend() {
  const [bookInput, setBookInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<QuickRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    if (!bookInput.trim()) return;
    
    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const response = await fetch('/api/quick-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedBook: bookInput.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-foreground mb-2">
          Quick Book Recommendation
        </h3>
        <p className="text-foreground/70 text-base">
          Tell us a book you loved, and we&apos;ll suggest what to read next
        </p>
      </div>

      <div className="flex gap-3 max-w-xl mx-auto">
        <div className="flex-1 relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Enter a book you loved..."
            value={bookInput}
            onChange={(e) => setBookInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendations()}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button 
          onClick={handleGetRecommendations}
          disabled={loading || !bookInput.trim()}
          className="h-12 px-6"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get Recs
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="text-center text-destructive text-sm">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <p className="text-center text-sm text-foreground/70">
            If you liked <span className="font-semibold text-foreground">{bookInput}</span>, you might enjoy:
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.map((rec, index) => (
              <QuickRecCard key={index} recommendation={rec} />
            ))}
          </div>

          <div className="text-center pt-4 border-t border-border/50">
            <p className="text-sm text-foreground/70 mb-3">
              Want more personalized recommendations?
            </p>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Upload your Goodreads library
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickRecCard({ recommendation }: { recommendation: QuickRecommendation }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(recommendation.title + ' ' + recommendation.author + ' book')}`;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div>
          <h4 className="font-bold text-foreground line-clamp-2">
            {recommendation.title}
          </h4>
          <p className="text-sm text-foreground/70">
            {recommendation.author}
          </p>
        </div>
        
        <p className="text-sm text-foreground/80 line-clamp-3">
          {recommendation.reason}
        </p>
        
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Learn more
          <ExternalLink className="w-3 h-3" />
        </a>
      </CardContent>
    </Card>
  );
}

// Compact version for homepage
export function QuickRecommendCompact() {
  const [bookInput, setBookInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<QuickRecommendation[]>([]);

  const handleGetRecommendations = async () => {
    if (!bookInput.trim()) return;
    
    setLoading(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/quick-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likedBook: bookInput.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setShowResults(true);
      }
    } catch {
      // Silently fail for compact version
    } finally {
      setLoading(false);
    }
  };

  if (showResults && recommendations.length > 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-center text-foreground/70">
          Because you liked <span className="font-medium">{bookInput}</span>:
        </p>
        <div className="space-y-2">
          {recommendations.slice(0, 3).map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Badge variant="secondary" className="flex-shrink-0">{i + 1}</Badge>
              <div>
                <span className="font-medium">{rec.title}</span>
                <span className="text-foreground/60"> by {rec.author}</span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => { setShowResults(false); setBookInput(''); }}
          className="text-xs text-primary hover:underline"
        >
          Try another book
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-foreground/70 text-center">
        I liked:
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="The Great Gatsby..."
          value={bookInput}
          onChange={(e) => setBookInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendations()}
          className="h-9 text-sm"
        />
        <Button 
          size="sm"
          onClick={handleGetRecommendations}
          disabled={loading || !bookInput.trim()}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

