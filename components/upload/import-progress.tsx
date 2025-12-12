'use client';

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { ImportProgress } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ImportProgressDisplayProps {
  progress: ImportProgress;
}

const FUN_FACTS = [
  "The average person reads about 12 books per year.",
  "Reading for just 6 minutes can reduce stress by 68%.",
  "The longest novel ever written is over 17,000 pages.",
  "Bibliophile means 'lover of books' in Greek.",
  "The smell of old books is called 'bibliosmia'.",
  "Reading before bed can improve sleep quality.",
  "The first book ever printed was the Gutenberg Bible.",
  "Speed readers can read 1,000+ words per minute.",
];

export function ImportProgressDisplay({ progress }: ImportProgressDisplayProps) {
  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;
  
  const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
  
  const getStageIcon = () => {
    switch (progress.stage) {
      case 'parsing':
        return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
      case 'enriching':
        return <BookOpen className="w-6 h-6 text-primary animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      default:
        return null;
    }
  };
  
  const getStageText = () => {
    switch (progress.stage) {
      case 'parsing':
        return 'Reading your library...';
      case 'enriching':
        return 'Processing book data...';
      case 'complete':
        return 'Import complete!';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Preparing...';
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Stage indicator */}
      <div className="flex items-center justify-center gap-3">
        {getStageIcon()}
        <span className="text-lg font-medium">{getStageText()}</span>
      </div>
      
      {/* Progress bar */}
      {(progress.stage === 'parsing' || progress.stage === 'enriching') && (
        <div className="space-y-2">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress.message}</span>
            <span>{percentage}%</span>
          </div>
        </div>
      )}
      
      {/* Book count */}
      {progress.current > 0 && (
        <div className={cn(
          'text-center py-4 px-6 rounded-lg',
          progress.stage === 'complete' ? 'bg-green-500/10' : 'bg-muted'
        )}>
          <div className="text-3xl font-bold text-primary">
            {progress.current.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {progress.stage === 'complete' ? 'books imported' : 'books processed'}
          </div>
        </div>
      )}
      
      {/* Fun fact while waiting */}
      {(progress.stage === 'parsing' || progress.stage === 'enriching') && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground italic">
            💡 {randomFact}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {progress.stage === 'error' && (
        <div className="p-4 bg-destructive/10 rounded-lg text-center">
          <p className="text-sm text-destructive">{progress.message}</p>
        </div>
      )}
    </div>
  );
}

