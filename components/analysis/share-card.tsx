'use client';

import { useState, useRef } from 'react';
import { Share2, Copy, Check, X, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FullAnalysis, Book } from '@/lib/types';

interface ShareCardProps {
  analysis: FullAnalysis;
  books: Book[];
  onClose: () => void;
}

function parseJsonFromRaw(raw: string) {
  try {
    let jsonStr = raw;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) jsonStr = objectMatch[0];
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function extractHighlights(analysis: FullAnalysis, books: Book[]) {
  // Get reading stats
  const booksRead = books.filter(b => b.exclusiveShelf === 'read').length;
  const totalPages = books.reduce((sum, b) => sum + (b.pages || 0), 0);
  
  // Parse roast data
  let roastBullets: string[] = [];
  let summary = '';
  
  if (analysis.roast && 'raw' in analysis.roast) {
    const parsed = parseJsonFromRaw(analysis.roast.raw);
    if (parsed) {
      roastBullets = Array.isArray(parsed.roastBullets) ? parsed.roastBullets.slice(0, 2) : [];
      summary = parsed.readerSummary || '';
    }
  }
  
  // Parse insights for literary portrait and reader archetype
  let literaryPortrait = '';
  let readerArchetype = '';
  
  if (analysis.insights && 'raw' in analysis.insights) {
    const parsed = parseJsonFromRaw(analysis.insights.raw);
    if (parsed) {
      literaryPortrait = parsed.literaryPortrait || '';
      readerArchetype = parsed.readerArchetype || '';
    }
  }
  
  return {
    booksRead,
    totalPages,
    roastBullets,
    summary,
    literaryPortrait,
    readerArchetype,
  };
}

function generateShareText(highlights: ReturnType<typeof extractHighlights>): string {
  let text = `📚 My Reading Personality\n\n`;
  
  text += `📖 ${highlights.booksRead} books read`;
  if (highlights.totalPages > 0) {
    text += ` · ${highlights.totalPages.toLocaleString()} pages\n\n`;
  } else {
    text += `\n\n`;
  }
  
  if (highlights.summary) {
    text += `✨ Reader Summary:\n${highlights.summary}\n\n`;
  }
  
  if (highlights.literaryPortrait) {
    text += `📖 Literary Portrait:\n${highlights.literaryPortrait}\n\n`;
  }
  
  if (highlights.readerArchetype) {
    text += `🎭 Reader Archetype:\n${highlights.readerArchetype}\n\n`;
  }
  
  if (highlights.roastBullets.length > 0) {
    text += `🔥 The Roast:\n`;
    highlights.roastBullets.forEach((bullet: string) => {
      text += `• ${bullet}\n`;
    });
    text += `\n`;
  }
  
  text += `— via goodreads-analyst.vercel.app`;
  
  return text;
}

export function ShareButton({ analysis, books }: { analysis: FullAnalysis; books: Book[] }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      
      {showModal && (
        <ShareModal 
          analysis={analysis} 
          books={books} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}

function ShareModal({ analysis, books, onClose }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const highlights = extractHighlights(analysis, books);
  const shareText = generateShareText(highlights);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Reading Personality',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopy();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto" ref={cardRef}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Share Your Results</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Preview Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
            {/* Branding */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">Goodreads Analyzer</span>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-background/60 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-primary">{highlights.booksRead}</p>
                <p className="text-xs text-muted-foreground">Books Read</p>
              </div>
              {highlights.totalPages > 0 && (
                <div className="bg-background/60 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{(highlights.totalPages / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Pages</p>
                </div>
              )}
            </div>
            
            {/* Reader Summary */}
            {highlights.summary && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-primary mb-1">✨ Reader Summary</p>
                <p className="text-sm leading-relaxed">{highlights.summary}</p>
              </div>
            )}
            
            {/* Literary Portrait */}
            {highlights.literaryPortrait && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">📖 Literary Portrait</p>
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{highlights.literaryPortrait}</p>
              </div>
            )}
            
            {/* Reader Archetype */}
            {highlights.readerArchetype && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">🎭 Reader Archetype</p>
                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">{highlights.readerArchetype}</p>
              </div>
            )}
            
            {/* Roast Highlights */}
            {highlights.roastBullets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <Flame className="w-3.5 h-3.5" />
                  The Roast
                </div>
                {highlights.roastBullets.map((bullet: string, i: number) => (
                  <p key={i} className="text-xs text-foreground/80 pl-1 border-l-2 border-orange-400/50">
                    {bullet}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 pt-0 flex gap-2">
          {'share' in navigator ? (
            <Button onClick={handleNativeShare} className="flex-1 gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          ) : (
            <Button onClick={handleCopy} className="flex-1 gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          )}
          
          {/* Always show copy as secondary option on mobile */}
          {'share' in navigator && (
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

