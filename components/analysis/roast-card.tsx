'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Target, TrendingUp, Laugh } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface RoastData {
  readerSummary: string;
  roastBullets: string[];
  habitsExposed: {
    mostReadGenre: string;
    mostReadGenreComment: string;
    readingSpeed: string;
    readingSpeedComment: string;
    ratingPattern: string;
    ratingPatternComment: string;
    bookSelectionMethod: string;
    bookSelectionComment: string;
  };
  predictions: string[];
}

function parseRoast(content: string): RoastData | null {
  try {
    let jsonStr = content;
    
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.readerSummary || parsed.roastBullets || parsed.habitsExposed) {
      return {
        readerSummary: parsed.readerSummary || '',
        roastBullets: Array.isArray(parsed.roastBullets) ? parsed.roastBullets : [],
        habitsExposed: parsed.habitsExposed || {},
        predictions: Array.isArray(parsed.predictions) ? parsed.predictions : [],
      };
    }
  } catch {
    console.log('JSON parsing failed for roast, falling back to markdown');
  }
  
  return null;
}

interface RoastCardProps {
  content: string;
}

export function RoastCard({ content }: RoastCardProps) {
  const roastData = useMemo(() => parseRoast(content), [content]);
  
  if (roastData) {
    return (
      <div className="space-y-6">
        {/* Reader Summary */}
        {roastData.readerSummary && (
          <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                <Laugh className="w-6 h-6 text-amber-600" />
                Reader Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-foreground">{roastData.readerSummary}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Literary Roast */}
        {roastData.roastBullets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <Flame className="w-6 h-6 text-orange-500" />
                Literary Roast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {roastData.roastBullets.map((bullet, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-orange-500 mt-0.5 text-lg">🔥</span>
                    <span className="text-base leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {/* Reading Habits Exposed */}
        {roastData.habitsExposed && Object.keys(roastData.habitsExposed).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                <TrendingUp className="w-6 h-6 text-primary" />
                Reading Habits Exposed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roastData.habitsExposed.mostReadGenre && (
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-base font-bold text-foreground">Most Read Genre: {roastData.habitsExposed.mostReadGenre}</p>
                    <p className="text-base text-foreground/80 mt-1">{roastData.habitsExposed.mostReadGenreComment}</p>
                  </div>
                )}
                {roastData.habitsExposed.readingSpeed && (
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-base font-bold text-foreground">Reading Speed: {roastData.habitsExposed.readingSpeed}</p>
                    <p className="text-base text-foreground/80 mt-1">{roastData.habitsExposed.readingSpeedComment}</p>
                  </div>
                )}
                {roastData.habitsExposed.ratingPattern && (
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-base font-bold text-foreground">Rating Pattern: {roastData.habitsExposed.ratingPattern}</p>
                    <p className="text-base text-foreground/80 mt-1">{roastData.habitsExposed.ratingPatternComment}</p>
                  </div>
                )}
                {roastData.habitsExposed.bookSelectionMethod && (
                  <div className="p-4 bg-secondary/50 rounded-lg border border-border/50">
                    <p className="text-base font-bold text-foreground">Book Selection: {roastData.habitsExposed.bookSelectionMethod}</p>
                    <p className="text-base text-foreground/80 mt-1">{roastData.habitsExposed.bookSelectionComment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Predictions */}
        {roastData.predictions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <Target className="w-6 h-6 text-purple-500" />
                Brutally Honest Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {roastData.predictions.map((prediction, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-purple-500 mt-0.5 text-lg">🔮</span>
                    <span className="text-base leading-relaxed">{prediction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
  
  // Fallback: Parse markdown sections
  const sections = {
    summary: '',
    roast: '',
    habits: '',
    predictions: '',
  };
  
  const summaryMatch = content.match(/### Reader Summary\s*([\s\S]*?)(?=###|$)/i);
  const roastMatch = content.match(/### Literary Roast\s*([\s\S]*?)(?=###|$)/i);
  const habitsMatch = content.match(/### Reading Habits Exposed\s*([\s\S]*?)(?=###|$)/i);
  const predictionsMatch = content.match(/### Brutally Honest Predictions\s*([\s\S]*?)(?=###|$)/i);
  
  if (summaryMatch) sections.summary = summaryMatch[1].trim();
  if (roastMatch) sections.roast = roastMatch[1].trim();
  if (habitsMatch) sections.habits = habitsMatch[1].trim();
  if (predictionsMatch) sections.predictions = predictionsMatch[1].trim();
  
  const hasStructure = Object.values(sections).some(s => s.length > 0);
  
  if (!hasStructure) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Flame className="w-6 h-6 text-orange-500" />
            Literary Roast
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-base dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {sections.summary && (
        <Card className="border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-orange-700 dark:text-orange-400">
              <Laugh className="w-6 h-6" />
              Reader Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">{sections.summary}</p>
          </CardContent>
        </Card>
      )}
      
      {sections.roast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Flame className="w-6 h-6 text-orange-500" />
              Literary Roast
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-base dark:prose-invert max-w-none">
            <ReactMarkdown>{sections.roast}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
      
      {sections.habits && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Reading Habits Exposed
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-base dark:prose-invert max-w-none">
            <ReactMarkdown>{sections.habits}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
      
      {sections.predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <Target className="w-6 h-6 text-purple-500" />
              Brutally Honest Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-base dark:prose-invert max-w-none">
            <ReactMarkdown>{sections.predictions}</ReactMarkdown>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
