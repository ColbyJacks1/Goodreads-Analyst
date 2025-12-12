'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, BookMarked, Clock, Fingerprint, Brain, Eye, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface InsightsData {
  literaryPortrait: string;
  dominantThemes: string;
  readingJourney: string;
  readerArchetype: string;
  intellectualProfile: string;
  hiddenPatterns: string;
  growthAreas: string;
}

function parseInsights(content: string): InsightsData | null {
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
    
    if (parsed.literaryPortrait || parsed.dominantThemes || parsed.readerArchetype) {
      return {
        literaryPortrait: parsed.literaryPortrait || '',
        dominantThemes: parsed.dominantThemes || '',
        readingJourney: parsed.readingJourney || '',
        readerArchetype: parsed.readerArchetype || '',
        intellectualProfile: parsed.intellectualProfile || '',
        hiddenPatterns: parsed.hiddenPatterns || '',
        growthAreas: parsed.growthAreas || '',
      };
    }
  } catch {
    console.log('JSON parsing failed for insights, falling back to markdown');
  }
  
  return null;
}

interface InsightCardProps {
  content: string;
}

export function InsightCard({ content }: InsightCardProps) {
  const insightsData = useMemo(() => parseInsights(content), [content]);
  
  if (insightsData) {
    const insightSections = [
      { key: 'portrait', title: 'Literary Portrait', icon: <BookMarked className="w-6 h-6 text-emerald-500" />, content: insightsData.literaryPortrait },
      { key: 'themes', title: 'Dominant Themes', icon: <Lightbulb className="w-6 h-6 text-amber-500" />, content: insightsData.dominantThemes },
      { key: 'journey', title: 'Reading Journey', icon: <Clock className="w-6 h-6 text-blue-500" />, content: insightsData.readingJourney },
      { key: 'archetype', title: 'Reader Archetype', icon: <Fingerprint className="w-6 h-6 text-purple-500" />, content: insightsData.readerArchetype },
      { key: 'intellectual', title: 'Intellectual Profile', icon: <Brain className="w-6 h-6 text-rose-500" />, content: insightsData.intellectualProfile },
      { key: 'hidden', title: 'Hidden Patterns', icon: <Eye className="w-6 h-6 text-indigo-500" />, content: insightsData.hiddenPatterns },
      { key: 'growth', title: 'Growth Areas', icon: <TrendingUp className="w-6 h-6 text-teal-500" />, content: insightsData.growthAreas },
    ].filter(s => s.content);
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightSections.map((section) => (
            <Card key={section.key} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Fallback: Parse markdown sections
  const sections = {
    portrait: '',
    themes: '',
    timeline: '',
    personality: '',
    intellectual: '',
  };
  
  const portraitMatch = content.match(/### Literary Portrait\s*([\s\S]*?)(?=###|$)/i);
  const themesMatch = content.match(/### Dominant Themes\s*([\s\S]*?)(?=###|$)/i);
  const timelineMatch = content.match(/### Reading Journey Timeline\s*([\s\S]*?)(?=###|$)/i);
  const personalityMatch = content.match(/### (?:Personality Type|Reader Archetype)\s*([\s\S]*?)(?=###|$)/i);
  const intellectualMatch = content.match(/### Intellectual Profile\s*([\s\S]*?)(?=###|$)/i);
  
  if (portraitMatch) sections.portrait = portraitMatch[1].trim();
  if (themesMatch) sections.themes = themesMatch[1].trim();
  if (timelineMatch) sections.timeline = timelineMatch[1].trim();
  if (personalityMatch) sections.personality = personalityMatch[1].trim();
  if (intellectualMatch) sections.intellectual = intellectualMatch[1].trim();
  
  const hasStructure = Object.values(sections).some(s => s.length > 0);
  
  if (!hasStructure) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Lightbulb className="w-6 h-6 text-primary" />
            Literary Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-base dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }
  
  const insightSections = [
    { key: 'portrait', title: 'Literary Portrait', icon: <BookMarked className="w-6 h-6 text-emerald-500" />, content: sections.portrait },
    { key: 'themes', title: 'Dominant Themes', icon: <Lightbulb className="w-6 h-6 text-amber-500" />, content: sections.themes },
    { key: 'timeline', title: 'Reading Journey', icon: <Clock className="w-6 h-6 text-blue-500" />, content: sections.timeline },
    { key: 'personality', title: 'Reader Archetype', icon: <Fingerprint className="w-6 h-6 text-purple-500" />, content: sections.personality },
    { key: 'intellectual', title: 'Intellectual Profile', icon: <Brain className="w-6 h-6 text-rose-500" />, content: sections.intellectual },
  ].filter(s => s.content);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insightSections.map((section) => (
          <Card key={section.key} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                {section.icon}
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
