'use client';

import { YearStats } from '@/lib/types';
import { YearSummaryData } from '@/app/api/year-summary/route';
import { StatCard } from '@/components/stats/stat-card';
import { TimelineChart } from '@/components/stats/timeline-chart';
import { BookCard } from '@/components/books/book-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, FileText, Star, Users, TrendingUp, Award, BookMarked, 
  Sparkles, Brain, Heart, Lightbulb, Link2, User, ArrowRight, Loader2 
} from 'lucide-react';

interface YearStatsDisplayProps {
  stats: YearStats;
  summary?: YearSummaryData | null;
  summaryLoading?: boolean;
  summaryError?: string | null;
  onGenerateSummary?: () => void;
}

export function YearStatsDisplay({ 
  stats, 
  summary, 
  summaryLoading, 
  summaryError,
  onGenerateSummary 
}: YearStatsDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Books Read"
          value={stats.booksRead}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          title="Pages Read"
          value={stats.pagesRead.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="w-5 h-5" />}
        />
        <StatCard
          title="Unique Authors"
          value={stats.uniqueAuthors}
          icon={<Users className="w-5 h-5" />}
        />
      </div>
      
      {/* AI Year Summary */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            AI Reading Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!summary && !summaryLoading && !summaryError && (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 text-primary/50" />
              <p className="text-lg font-medium text-foreground mb-2">
                Discover the deeper meaning in your {stats.year} reading
              </p>
              <p className="text-base text-foreground/70 mb-6 max-w-md mx-auto">
                Our AI will analyze your books to find themes, emotional patterns, and surprising connections.
              </p>
              <Button onClick={onGenerateSummary} size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Reading Reflection
              </Button>
            </div>
          )}
          
          {summaryLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium">Reflecting on your reading year...</p>
              <p className="text-base text-foreground/70">Finding themes and connections</p>
            </div>
          )}
          
          {summaryError && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{summaryError}</p>
              <Button onClick={onGenerateSummary} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          
          {summary && (
            <div className="space-y-6">
              {/* Headline & Overview */}
              <div className="text-center pb-6 border-b">
                <h3 className="text-2xl font-bold text-primary mb-3">
                  "{summary.headline}"
                </h3>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto leading-relaxed">
                  {summary.overview}
                </p>
              </div>
              
              {/* Key Themes */}
              {summary.keyThemes && summary.keyThemes.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Key Themes
                  </h4>
                  <div className="grid gap-4">
                    {summary.keyThemes.map((theme, i) => (
                      <div key={i} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
                        <p className="font-bold text-lg text-foreground mb-2">{theme.theme}</p>
                        <p className="text-base text-foreground/80 mb-2">{theme.insight}</p>
                        {theme.books && theme.books.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {theme.books.map((book, j) => (
                              <Badge key={j} variant="secondary" className="text-sm">
                                {book}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Emotional Journey & Intellectual Pursuits */}
              <div className="grid md:grid-cols-2 gap-4">
                {summary.emotionalJourney && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-rose-700 dark:text-rose-400">
                      <Heart className="w-5 h-5" />
                      Emotional Journey
                    </h4>
                    <p className="text-base text-foreground/80">{summary.emotionalJourney}</p>
                  </div>
                )}
                
                {summary.intellectualPursuits && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                      <Brain className="w-5 h-5" />
                      Intellectual Pursuits
                    </h4>
                    <p className="text-base text-foreground/80">{summary.intellectualPursuits}</p>
                  </div>
                )}
              </div>
              
              {/* Surprising Connection */}
              {summary.surprisingConnection && summary.surprisingConnection.connection && (
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                  <h4 className="font-bold flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-400">
                    <Link2 className="w-5 h-5" />
                    Surprising Connection
                  </h4>
                  <p className="text-base text-foreground/80 mb-2">{summary.surprisingConnection.connection}</p>
                  {summary.surprisingConnection.books && summary.surprisingConnection.books.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {summary.surprisingConnection.books.map((book, i) => (
                        <Badge key={i} variant="secondary" className="text-sm bg-purple-100 dark:bg-purple-900/30">
                          {book}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {summary.surprisingConnection.insight && (
                    <p className="text-sm text-foreground/70 italic">{summary.surprisingConnection.insight}</p>
                  )}
                </div>
              )}
              
              {/* Reader Portrait & Looking Ahead */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                {summary.readerPortrait && (
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="font-bold flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-primary" />
                      You as a Reader in {stats.year}
                    </h4>
                    <p className="text-base text-foreground/80">{summary.readerPortrait}</p>
                  </div>
                )}
                
                {summary.lookingAhead && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-green-700 dark:text-green-400">
                      <ArrowRight className="w-5 h-5" />
                      Looking Ahead
                    </h4>
                    <p className="text-base text-foreground/80">{summary.lookingAhead}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Genre Summary */}
      {stats.topGenres && stats.topGenres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <Award className="w-6 h-6 text-primary" />
              Genres Explored in {stats.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Top Genre Highlight */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Top Genre</p>
                  <p className="text-2xl font-bold text-foreground">{stats.topGenre}</p>
                </div>
              </div>
              
              {/* All Genres */}
              <div className="flex flex-wrap gap-2">
                {stats.topGenres.map((g, i) => (
                  <Badge 
                    key={g.genre} 
                    variant={i === 0 ? "default" : "secondary"}
                    className={`text-sm px-3 py-1.5 ${i === 0 ? 'bg-primary text-primary-foreground' : ''}`}
                  >
                    {g.genre} ({g.count})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Monthly Reading Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Reading in {stats.year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineChart 
            data={stats.monthlyBreakdown} 
            type="monthly" 
          />
        </CardContent>
      </Card>
      
      {/* Top Rated Books */}
      {stats.topRatedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Your Top Rated Books of {stats.year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {stats.topRatedBooks.map((book) => (
                <BookCard key={book.id} book={book} showGenres={false} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Longest and Shortest Books */}
      {(stats.longestBook || stats.shortestBook) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.longestBook && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-blue-500" />
                  Longest Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{stats.longestBook.title}</p>
                    <p className="text-base text-foreground/70">{stats.longestBook.author}</p>
                    <p className="text-base font-semibold text-primary mt-1">
                      {stats.longestBook.pages?.toLocaleString()} pages
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {stats.shortestBook && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-green-500" />
                  Shortest Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{stats.shortestBook.title}</p>
                    <p className="text-base text-foreground/70">{stats.shortestBook.author}</p>
                    <p className="text-base font-semibold text-primary mt-1">
                      {stats.shortestBook.pages?.toLocaleString()} pages
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Fun Stats */}
      {stats.pagesRead > 0 && (
        <Card className="bg-secondary/30">
          <CardContent className="pt-6">
            <p className="text-center text-lg text-foreground/80">
              📚 You read <span className="font-bold text-foreground">{stats.pagesRead.toLocaleString()}</span> pages in {stats.year} — 
              that's equivalent to about <span className="font-bold text-foreground">{Math.round(stats.pagesRead / 310)}</span> Harry Potter books!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
