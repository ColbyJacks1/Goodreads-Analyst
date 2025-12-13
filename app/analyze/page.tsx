'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Flame, User, Lightbulb, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import { getBooks, getAnalysis, saveAnalysis } from '@/lib/storage';
import { getAnalysisStatus, startBackgroundAnalysis, waitForAnalysis } from '@/lib/background-analysis';
import { Book } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RoastCard } from '@/components/analysis/roast-card';
import { RecommendationList } from '@/components/analysis/recommendation-card';
import { ProfileCard } from '@/components/analysis/profile-card';
import { InsightCard } from '@/components/analysis/insight-card';

interface AnalysisData {
  roast?: { raw: string };
  recommendations?: { raw: string };
  insights?: { raw: string };
  profile?: { raw: string };
}

export default function AnalyzePage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('roast');
  
  // Load books and check for cached analysis
  useEffect(() => {
    const storedBooks = getBooks();
    if (storedBooks.length === 0) {
      router.push('/');
      return;
    }
    
    setBooks(storedBooks);
    
    // Check for cached analysis
    const cachedAnalysis = getAnalysis();
    if (cachedAnalysis && cachedAnalysis.roast && 'raw' in cachedAnalysis.roast) {
      setAnalysis(cachedAnalysis);
      setLoading(false);
      return;
    }
    
    // Check if background analysis is already running
    const status = getAnalysisStatus();
    if (status.status === 'running') {
      setAnalyzing(true);
      
      // Wait for it to complete
      waitForAnalysis().then(() => {
        const result = getAnalysis();
        if (result && result.roast && 'raw' in result.roast) {
          setAnalysis(result);
        }
        setAnalyzing(false);
      });
    } else if (status.status === 'complete') {
      // Background analysis finished, load results
      const result = getAnalysis();
      if (result && result.roast && 'raw' in result.roast) {
        setAnalysis(result);
      }
    } else if (status.status === 'error') {
      setError(status.error || 'Background analysis failed');
    }
    
    setLoading(false);
  }, [router]);
  
  // Run analysis (only if not already cached)
  const runAnalysis = useCallback(async () => {
    if (books.length === 0) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ books, analysisType: 'all' }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }
      
      // Save to localStorage and state
      saveAnalysis(data.analysis);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }, [books]);
  
  // Auto-start analysis if needed
  useEffect(() => {
    if (!loading && books.length > 0 && !analysis && !analyzing && !error) {
      // No cached analysis and not already running, start it
      const status = getAnalysisStatus();
      if (status.status !== 'running') {
        runAnalysis();
      }
    }
  }, [loading, books, analysis, analyzing, error, runAnalysis]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }
  
  const hasAllSections = analysis?.roast && 'raw' in analysis.roast && 
                         analysis?.recommendations && 'raw' in analysis.recommendations && 
                         analysis?.profile && 'raw' in analysis.profile && 
                         analysis?.insights && 'raw' in analysis.insights;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary" />
          AI Analysis
        </h1>
        <p className="text-muted-foreground">
          Deep insights into your reading personality based on {books.length} books
        </p>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setError(null);
              runAnalysis();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="roast" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Roast</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Recs</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Loading State */}
        {analyzing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Analyzing your reading history...</p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take a moment
            </p>
          </div>
        )}
        
        {/* Roast Tab */}
        <TabsContent value="roast">
          {!analyzing && analysis?.roast && 'raw' in analysis.roast ? (
            <RoastCard content={(analysis.roast as { raw: string }).raw} />
          ) : !analyzing && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click the button below to generate your literary roast
              </p>
              <Button className="mt-4" onClick={runAnalysis}>
                Generate Analysis
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations">
          {!analyzing && analysis?.recommendations && 'raw' in analysis.recommendations ? (
            <RecommendationList content={(analysis.recommendations as { raw: string }).raw} />
          ) : !analyzing && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Recommendations will appear after analysis
              </p>
              <Button className="mt-4" onClick={runAnalysis}>
                Generate Analysis
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          {!analyzing && analysis?.profile && 'raw' in analysis.profile ? (
            <ProfileCard content={(analysis.profile as { raw: string }).raw} />
          ) : !analyzing && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click the button below to generate your reader profile
              </p>
              <Button className="mt-4" onClick={runAnalysis}>
                Generate Analysis
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights">
          {!analyzing && analysis?.insights && 'raw' in analysis.insights ? (
            <InsightCard content={(analysis.insights as { raw: string }).raw} />
          ) : !analyzing && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Click the button below to discover literary insights
              </p>
              <Button className="mt-4" onClick={runAnalysis}>
                Generate Analysis
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Regenerate Button */}
      {hasAllSections && !analyzing && (
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={runAnalysis}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
