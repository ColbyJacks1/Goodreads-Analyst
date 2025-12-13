// Background analysis service - starts analysis as soon as books are uploaded

import { Book } from './types';
import { saveAnalysis, getAnalysis } from './storage';

export type AnalysisStatus = 'idle' | 'running' | 'complete' | 'error';

interface AnalysisState {
  status: AnalysisStatus;
  error?: string;
  startedAt?: string;
}

// In-memory state for tracking analysis progress
let analysisState: AnalysisState = { status: 'idle' };
let analysisPromise: Promise<void> | null = null;

/**
 * Get the current analysis state
 */
export function getAnalysisStatus(): AnalysisState {
  return { ...analysisState };
}

/**
 * Check if analysis is already cached and valid
 */
export function hasValidCachedAnalysis(): boolean {
  const cached = getAnalysis();
  if (!cached) return false;
  
  // Check if all sections are present
  return !!(cached.roast && 'raw' in cached.roast && 
            cached.recommendations && 'raw' in cached.recommendations && 
            cached.profile && 'raw' in cached.profile && 
            cached.insights && 'raw' in cached.insights);
}

/**
 * Start background analysis (non-blocking)
 */
export function startBackgroundAnalysis(books: Book[]): void {
  // Don't start if already running
  if (analysisState.status === 'running') {
    console.log('Analysis already running, skipping');
    return;
  }
  
  // Don't start if we have valid cached analysis
  if (hasValidCachedAnalysis()) {
    console.log('Valid cached analysis found, skipping');
    analysisState.status = 'complete';
    return;
  }
  
  // Start analysis in background
  analysisState = { 
    status: 'running', 
    startedAt: new Date().toISOString() 
  };
  
  analysisPromise = runAnalysis(books);
}

/**
 * Run the actual analysis
 */
async function runAnalysis(books: Book[]): Promise<void> {
  try {
    console.log('Starting background analysis for', books.length, 'books');
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        books,
        analysisType: 'all' // Run both quick + deep analysis
      }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Analysis failed');
    }
    
    // Save to localStorage
    saveAnalysis(data.analysis);
    
    analysisState = { status: 'complete' };
    console.log('Background analysis complete');
    
  } catch (error) {
    console.error('Background analysis error:', error);
    analysisState = { 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    };
  }
}

/**
 * Wait for analysis to complete (for use when user navigates to analyze page)
 */
export async function waitForAnalysis(): Promise<void> {
  if (analysisPromise) {
    await analysisPromise;
  }
}

/**
 * Reset analysis state (for when user uploads new data)
 */
export function resetAnalysisState(): void {
  analysisState = { status: 'idle' };
  analysisPromise = null;
}

