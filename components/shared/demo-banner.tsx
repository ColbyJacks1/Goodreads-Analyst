'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { isDemoMode, clearDemoData } from '@/lib/storage';

export function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (!isDemo || dismissed) return null;

  const handleExit = () => {
    clearDemoData();
    window.location.href = '/';
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Demo Mode</span>
          </div>
          <span className="text-sm text-foreground/70 hidden sm:inline">
            Exploring with sample data
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            href="/"
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload your library</span>
            <span className="sm:hidden">Upload</span>
          </Link>
          
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-primary/10 text-foreground/60 hover:text-foreground"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact badge version for tighter spaces
export function DemoBadge() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  if (!isDemo) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary">
      <Sparkles className="w-3 h-3" />
      Demo
    </div>
  );
}

