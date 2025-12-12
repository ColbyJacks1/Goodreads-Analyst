'use client';

import { BookRecommendation } from '@/lib/types';
import { RecommendationCard } from '@/components/analysis/recommendation-card';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendationResultsProps {
  recommendations: BookRecommendation[];
  loading?: boolean;
  prompt?: string;
}

export function RecommendationResults({ 
  recommendations, 
  loading = false,
  prompt 
}: RecommendationResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {prompt && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-base text-foreground">
            Showing recommendations for: <span className="font-semibold">"{prompt}"</span>
          </p>
        </div>
      )}
      
      <div className="space-y-4 w-full">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>
    </div>
  );
}

