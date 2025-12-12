'use client';

import { useState, useMemo } from 'react';
import { Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Book } from '@/lib/types';
import { BookCard } from './book-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BookListProps {
  books: Book[];
  showSearch?: boolean;
  showFilters?: boolean;
  maxBooks?: number;
  compact?: boolean;
}

type SortOption = 'rating-desc' | 'rating-asc' | 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';

export function BookList({ 
  books, 
  showSearch = true, 
  showFilters = true,
  maxBooks,
  compact = false,
}: BookListProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [filterRating, setFilterRating] = useState<string>('all');
  
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }
    
    // Rating filter
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      result = result.filter(book => book.myRating === rating);
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating-desc':
          return (b.myRating || 0) - (a.myRating || 0);
        case 'rating-asc':
          return (a.myRating || 0) - (b.myRating || 0);
        case 'date-desc':
          return (b.dateRead || b.dateAdded || '').localeCompare(a.dateRead || a.dateAdded || '');
        case 'date-asc':
          return (a.dateRead || a.dateAdded || '').localeCompare(b.dateRead || b.dateAdded || '');
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    // Limit
    if (maxBooks) {
      result = result.slice(0, maxBooks);
    }
    
    return result;
  }, [books, search, sortBy, filterRating, maxBooks]);
  
  return (
    <div className="space-y-4">
      {/* Controls */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {showSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search books or authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}
          
          {showFilters && (
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="rating-asc">Lowest Rated</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
      
      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredAndSortedBooks.length} of {books.length} books
      </p>
      
      {/* Book Grid */}
      {filteredAndSortedBooks.length > 0 ? (
        <div className={compact 
          ? 'space-y-2' 
          : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
        }>
          {filteredAndSortedBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              compact={compact}
              showGenres={!compact}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No books found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

