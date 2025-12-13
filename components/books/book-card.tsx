'use client';

import { useState } from 'react';
import { Star, BookOpen } from 'lucide-react';
import { Book } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { formatGenreName } from '@/lib/genre-normalizer';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  showGenres?: boolean;
  compact?: boolean;
}

// Generate initials from title for placeholder
function getBookInitials(title: string): string {
  const words = title.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Generate a consistent color based on title
function getPlaceholderColor(title: string): string {
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-sky-500 to-blue-600',
    'from-violet-500 to-fuchsia-600',
  ];
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function BookCard({ book, showGenres = true, compact = false }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const renderRating = () => {
    if (!book.myRating) return null;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-3.5 h-3.5',
              star <= book.myRating! 
                ? 'fill-amber-400 text-amber-400' 
                : 'text-muted-foreground/30'
            )}
          />
        ))}
      </div>
    );
  };
  
  const coverUrl = book.coverUrl && !imageError ? book.coverUrl : null;
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
        {/* Cover */}
        <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center bg-gradient-to-br',
              getPlaceholderColor(book.title)
            )}>
              <span className="text-xs font-bold text-white/90">{getBookInitials(book.title)}</span>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{book.title}</h4>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
        </div>
        
        {/* Rating */}
        {book.myRating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {book.myRating}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="group bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Cover Image */}
      <div className="aspect-[2/3] bg-muted relative overflow-hidden">
        {coverUrl ? (
          <>
            {/* Show placeholder while loading */}
            {!imageLoaded && (
              <div className={cn(
                'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br',
                getPlaceholderColor(book.title)
              )}>
                <span className="text-3xl font-bold text-white/90">{getBookInitials(book.title)}</span>
              </div>
            )}
            <img
              src={coverUrl}
              alt={book.title}
              className={cn(
                'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                !imageLoaded && 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className={cn(
            'w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br',
            getPlaceholderColor(book.title)
          )}>
            <span className="text-3xl font-bold text-white/90 mb-2">{getBookInitials(book.title)}</span>
            <span className="text-xs text-white/70 line-clamp-2 px-2">{book.title}</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 leading-tight">{book.title}</h3>
        <p className="text-sm text-muted-foreground">{book.author}</p>
        
        {/* Rating */}
        {renderRating()}
        
        {/* Date Read */}
        {book.dateRead && (
          <p className="text-xs text-muted-foreground">
            Read: {new Date(book.dateRead).toLocaleDateString()}
          </p>
        )}
        
        {/* Genres */}
        {showGenres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {book.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="secondary" className="text-xs">
                {formatGenreName(genre)}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

