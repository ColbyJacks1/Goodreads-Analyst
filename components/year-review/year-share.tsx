'use client';

import { useState, useRef, useCallback } from 'react';
import { Share2, Copy, Check, X, BookOpen, Calendar, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { YearStats } from '@/lib/types';
import { YearSummaryData } from '@/app/api/year-summary/route';
import html2canvas from 'html2canvas';

interface YearShareButtonProps {
  stats: YearStats;
  summary: YearSummaryData | null;
}

interface YearShareModalProps extends YearShareButtonProps {
  onClose: () => void;
}

function generateShareText(stats: YearStats, summary: YearSummaryData | null): string {
  let text = `📚 My ${stats.year} Reading Year\n\n`;
  
  text += `📖 ${stats.booksRead} books read`;
  if (stats.pagesRead > 0) {
    text += ` · ${stats.pagesRead.toLocaleString()} pages\n`;
  } else {
    text += `\n`;
  }
  
  if (stats.averageRating > 0) {
    text += `⭐ Average rating: ${stats.averageRating.toFixed(1)}/5\n`;
  }
  
  text += `\n`;
  
  if (summary?.headline) {
    text += `✨ "${summary.headline}"\n\n`;
  }
  
  if (summary?.overview) {
    text += `${summary.overview}\n\n`;
  }
  
  text += `— via goodreads-analyst.vercel.app`;
  
  return text;
}

export function YearShareButton({ stats, summary }: YearShareButtonProps) {
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
        <YearShareModal 
          stats={stats}
          summary={summary}
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}

function YearShareModal({ stats, summary, onClose }: YearShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const shareText = generateShareText(stats, summary);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const captureImage = useCallback(async (): Promise<Blob | null> => {
    if (!previewRef.current) {
      console.error('Preview ref is null');
      return null;
    }
    
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
      });
      
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('toBlob returned null');
              // Fallback: try getting data URL and converting
              try {
                const dataUrl = canvas.toDataURL('image/png');
                fetch(dataUrl)
                  .then(res => res.blob())
                  .then(b => resolve(b))
                  .catch(() => resolve(null));
              } catch {
                resolve(null);
              }
            } else {
              resolve(blob);
            }
          },
          'image/png',
          1.0
        );
      });
    } catch (err) {
      console.error('Failed to capture image:', err);
      return null;
    }
  }, []);
  
  const handleSaveImage = useCallback(async () => {
    setSaving(true);
    try {
      const blob = await captureImage();
      if (!blob) throw new Error('Failed to capture');
      
      let sharedSuccessfully = false;
      
      // Try native share with file (works on mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], `my-${stats.year}-reading-year.png`, { type: 'image/png' });
          const shareData = { files: [file] };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            sharedSuccessfully = true;
          }
        } catch (shareErr) {
          // Native share failed or was cancelled, fall through to download
          if ((shareErr as Error).name === 'AbortError') {
            setSaving(false);
            return; // User cancelled, don't download
          }
          console.log('Native share not available, downloading instead');
        }
      }
      
      // Fallback: download the image
      if (!sharedSuccessfully) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `my-${stats.year}-reading-year.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save image. Please try again.');
    }
    setSaving(false);
  }, [captureImage, stats.year]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Share Your {stats.year} Reading Year</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Preview Card - This gets captured as image */}
        {/* Using inline styles with RGB colors because html2canvas doesn't support lab() color function */}
        <div className="p-4">
          <div 
            ref={previewRef} 
            className="rounded-xl p-5"
            style={{ 
              background: 'linear-gradient(to bottom right, #ecfdf5, #f0fdfa)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}
          >
            {/* Branding */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm">Year in Review {stats.year}</span>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.booksRead}</p>
                <p className="text-xs text-muted-foreground">Books</p>
              </div>
              {stats.pagesRead > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{(stats.pagesRead / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-muted-foreground">Pages</p>
                </div>
              )}
              {stats.averageRating > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              )}
            </div>
            
            {/* AI Summary Headline */}
            {summary?.headline && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">✨ Year Theme</p>
                <p className="text-sm font-medium italic">"{summary.headline}"</p>
              </div>
            )}
            
            {/* Overview */}
            {summary?.overview && (
              <div className="mb-3">
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {summary.overview}
                </p>
              </div>
            )}
            
            {/* Top Books */}
            {stats.topRatedBooks.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">⭐ Top Rated</p>
                <div className="flex flex-wrap gap-2">
                  {stats.topRatedBooks.slice(0, 3).map((book, i) => (
                    <span key={i} className="text-xs">
                      {book.title.length > 25 ? book.title.substring(0, 25) + '...' : book.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="p-4 pt-0 space-y-2">
          {/* Primary: Save/Share as Image */}
          <Button onClick={handleSaveImage} className="w-full gap-2" disabled={saving}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                Share as Image
              </>
            )}
          </Button>
          
          {/* Secondary: Copy text */}
          <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Text Copied!' : 'Copy as Text'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

