'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { BookRecommendation } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface ParsedRecommendation {
  title: string;
  author: string;
  whyThisBook: string;
  connectionToReading: string;
  themes: string[];
}

interface JSONResponse {
  recommendations: ParsedRecommendation[];
  genreExpansion: string;
}

function parseRecommendations(content: string): { recommendations: ParsedRecommendation[]; genreExpansion: string } {
  // Try to parse as JSON first
  try {
    // Extract JSON from the content (might be wrapped in markdown code blocks)
    let jsonStr = content;
    
    // Remove markdown code block if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    // Try to find JSON object in the content
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed: JSONResponse = JSON.parse(jsonStr);
    
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return {
        recommendations: parsed.recommendations.map(rec => ({
          title: rec.title || '',
          author: rec.author || '',
          whyThisBook: rec.whyThisBook || '',
          connectionToReading: rec.connectionToReading || '',
          themes: Array.isArray(rec.themes) ? rec.themes : [],
        })),
        genreExpansion: parsed.genreExpansion || '',
      };
    }
  } catch {
    // JSON parsing failed, fall back to markdown parsing
    console.log('JSON parsing failed, falling back to markdown parsing');
  }
  
  // Fallback: Try markdown parsing for backwards compatibility
  return parseMarkdownRecommendations(content);
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^[-•]\s*/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseMarkdownRecommendations(content: string): { recommendations: ParsedRecommendation[]; genreExpansion: string } {
  const recommendations: ParsedRecommendation[] = [];
  let genreExpansion = '';
  
  const genreMatch = content.match(/###?\s*Genre Expansion\s*([\s\S]*?)$/i);
  if (genreMatch) {
    genreExpansion = cleanText(genreMatch[1]);
  }
  
  const sections = content.split(/(?:^|\n)###?\s*\d+\.\s*/);
  
  for (const section of sections) {
    if (!section.trim()) continue;
    if (section.toLowerCase().includes('genre expansion')) continue;
    if (section.toLowerCase().startsWith('curated')) continue;
    
    const firstLineEnd = section.indexOf('\n');
    const firstLine = firstLineEnd > 0 ? section.slice(0, firstLineEnd) : section;
    
    const titleMatch = firstLine.match(/^\*{0,2}([^*\n]+?)\*{0,2}\s+by\s+([^\n]+)/i);
    if (!titleMatch) continue;
    
    const title = cleanText(titleMatch[1]);
    const author = cleanText(titleMatch[2]);
    
    if (!title || !author) continue;
    
    recommendations.push({
      title,
      author,
      whyThisBook: '',
      connectionToReading: '',
      themes: [],
    });
  }
  
  return { recommendations, genreExpansion };
}

interface RecommendationCardProps {
  recommendation?: BookRecommendation;
  rawContent?: string;
}

export function RecommendationCard({ recommendation, rawContent }: RecommendationCardProps) {
  const [imageError, setImageError] = useState(false);
  
  if (rawContent) {
    return <RecommendationList content={rawContent} />;
  }
  
  if (!recommendation) return null;
  
  const coverUrl = recommendation.coverUrl && !imageError 
    ? recommendation.coverUrl 
    : null;
  
  return (
    <Card className="w-full max-w-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row w-full">
        <div className="sm:w-32 flex-shrink-0 bg-muted">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={recommendation.title}
              className="w-full h-48 sm:h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 sm:h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary/40" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 p-4 space-y-3 overflow-hidden" style={{ maxWidth: 'calc(100% - 8rem)' }}>
          <div>
            <h3 className="font-bold text-xl text-foreground" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {recommendation.title?.replace(/\*/g, '')}
            </h3>
            <p className="text-base text-foreground/70" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
              {recommendation.author?.replace(/\*/g, '')}
            </p>
          </div>
          
          {recommendation.whyThisBook && (
            <div>
              <p className="text-sm font-medium text-primary mb-1">Why this book:</p>
              <p className="text-base" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {recommendation.whyThisBook.replace(/\*/g, '')}
              </p>
            </div>
          )}
          
          {recommendation.connectionToReading && (
            <div>
              <p className="text-sm font-medium text-primary mb-1">Connection to your reading:</p>
              <p className="text-base text-foreground/75" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {recommendation.connectionToReading.replace(/\*/g, '')}
              </p>
            </div>
          )}
          
          {recommendation.whatToExpect && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium text-primary mb-1">What to expect:</p>
              <p className="text-base text-foreground/80" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                {recommendation.whatToExpect.replace(/\*/g, '')}
              </p>
            </div>
          )}
          
          {recommendation.themes && recommendation.themes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {recommendation.themes.map((theme, i) => (
                <Badge key={i} variant="secondary" className="text-sm max-w-full truncate">
                  {theme.replace(/\*/g, '')}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SingleRecommendationCard({ rec, index }: { rec: ParsedRecommendation; index: number }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${rec.title} ${rec.author} book`)}`;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/60">
      <CardContent className="p-5 overflow-hidden">
        {/* Header with number badge */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{index + 1}</span>
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xl leading-tight text-foreground break-words">
                  {rec.title.replace(/\*/g, '')}
                </h3>
                <p className="text-base text-foreground/70 mt-0.5 break-words">by {rec.author.replace(/\*/g, '')}</p>
              </div>
              <a 
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
                title="Search for this book"
              >
                <ExternalLink className="w-4 h-4 text-primary/60" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Why this book */}
        {rec.whyThisBook && (
          <div className="mb-4 pl-12 pr-2 overflow-hidden">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1.5">
              Why this book
            </p>
            <p className="text-base text-foreground/90 leading-relaxed break-words">{rec.whyThisBook.replace(/\*/g, '')}</p>
          </div>
        )}
        
        {/* Connection to reading */}
        {rec.connectionToReading && (
          <div className="mb-4 pl-12 pr-2 overflow-hidden">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1.5">
              Connection to your reading
            </p>
            <p className="text-base text-foreground/75 leading-relaxed break-words">{rec.connectionToReading.replace(/\*/g, '')}</p>
          </div>
        )}
        
        {/* Themes */}
        {rec.themes.length > 0 && (
          <div className="pl-12 pr-2 pt-1 overflow-hidden">
            <div className="flex flex-wrap gap-2">
              {rec.themes.map((theme, i) => (
                <Badge 
                  key={i} 
                  variant="secondary" 
                  className="text-sm px-3 py-1 bg-secondary/50"
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface RecommendationListProps {
  content: string;
}

export function RecommendationList({ content }: RecommendationListProps) {
  const { recommendations, genreExpansion } = useMemo(() => parseRecommendations(content), [content]);
  
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Sparkles className="w-6 h-6 text-primary" />
            Book Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {content}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Curated Book Recommendations</h2>
          <p className="text-base text-foreground/70">
            {recommendations.length} books picked just for you
          </p>
        </div>
      </div>
      
      {/* Recommendation Cards */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <SingleRecommendationCard key={index} rec={rec} index={index} />
        ))}
      </div>
      
      {/* Genre Expansion */}
      {genreExpansion && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-primary/20 flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-3 text-primary">Expand Your Horizons</h3>
                <div className="text-base text-foreground/80 leading-relaxed prose prose-base dark:prose-invert max-w-none prose-strong:text-primary prose-strong:font-semibold prose-em:text-foreground/90">
                  <ReactMarkdown>{genreExpansion}</ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
