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

function extractHighlights(analysis: FullAnalysis, books: Book[]) {
  const roast = analysis.roast && 'raw' in analysis.roast ? analysis.roast : null;
  const profile = analysis.profile && 'raw' in analysis.profile ? analysis.profile : null;
  
  // Get reading stats
  const booksRead = books.filter(b => b.exclusiveShelf === 'read').length;
  const totalPages = books.reduce((sum, b) => sum + (b.pages || 0), 0);
  
  // Get top genre from roast
  const topGenre = roast?.readingHabits?.mostReadGenre || '';
  
  // Get MBTI from profile (parse from raw)
  let mbti = '';
  if (profile?.raw) {
    const mbtiMatch = profile.raw.match(/MBTI[:\s]+([A-Z]{4})/i) || 
                      profile.raw.match(/Myers-Briggs[:\s]+([A-Z]{4})/i) ||
                      profile.raw.match(/\b([INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP]{4})\b/);
    if (mbtiMatch) mbti = mbtiMatch[1];
  }
  
  // Get best roast bullets (pick 2)
  const roastBullets = roast?.roastBullets?.slice(0, 2) || [];
  
  // Reader summary
  const summary = roast?.readerSummary || '';
  
  return {
    booksRead,
    totalPages,
    topGenre,
    mbti,
    roastBullets,
    summary,
  };
}

function generateShareText(highlights: ReturnType<typeof extractHighlights>): string {
  let text = `📚 My Reading Personality\n\n`;
  
  if (highlights.summary) {
    text += `${highlights.summary}\n\n`;
  }
  
  text += `📖 ${highlights.booksRead} books read`;
  if (highlights.totalPages > 0) {
    text += ` · ${highlights.totalPages.toLocaleString()} pages\n`;
  } else {
    text += `\n`;
  }
  
  if (highlights.topGenre) {
    text += `🎯 Top genre: ${highlights.topGenre}\n`;
  }
  
  if (highlights.mbti) {
    text += `🧠 Reading personality: ${highlights.mbti}\n`;
  }
  
  if (highlights.roastBullets.length > 0) {
    text += `\n🔥 The roast:\n`;
    highlights.roastBullets.forEach(bullet => {
      text += `• ${bullet}\n`;
    });
  }
  
  text += `\n— via goodreads-analyst.vercel.app`;
  
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
            
            {/* Summary */}
            {highlights.summary && (
              <p className="text-sm mb-4 leading-relaxed">{highlights.summary}</p>
            )}
            
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
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {highlights.topGenre && (
                <span className="px-2.5 py-1 bg-background/80 rounded-full text-xs font-medium">
                  🎯 {highlights.topGenre}
                </span>
              )}
              {highlights.mbti && (
                <span className="px-2.5 py-1 bg-background/80 rounded-full text-xs font-medium">
                  🧠 {highlights.mbti}
                </span>
              )}
            </div>
            
            {/* Roast Highlights */}
            {highlights.roastBullets.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <Flame className="w-3.5 h-3.5" />
                  The Roast
                </div>
                {highlights.roastBullets.map((bullet, i) => (
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

