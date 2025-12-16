// localStorage helpers for persisting book data and analysis

import { Book, FullAnalysis, STORAGE_KEYS } from './types';
import { DEMO_BOOKS, DEMO_ANALYSIS } from './demo-data';

const DEMO_MODE_KEY = 'goodreads_demo_mode';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save books to localStorage
 * Automatically exits demo mode when saving real user data
 */
export function saveBooks(books: Book[], isDemo: boolean = false): void {
  if (!isBrowser) return;
  
  try {
    // Exit demo mode when saving real user data
    if (!isDemo) {
      localStorage.removeItem(DEMO_MODE_KEY);
      // Clear any existing analysis when new data is uploaded
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
    }
    
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
  } catch (error) {
    console.error('Failed to save books to localStorage:', error);
  }
}

/**
 * Get books from localStorage
 */
export function getBooks(): Book[] {
  if (!isBrowser) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!stored) return [];
    return JSON.parse(stored) as Book[];
  } catch (error) {
    console.error('Failed to get books from localStorage:', error);
    return [];
  }
}

/**
 * Check if books exist in localStorage
 */
export function hasBooks(): boolean {
  if (!isBrowser) return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!stored) return false;
    const books = JSON.parse(stored) as Book[];
    return books.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get the count of stored books
 */
export function getBookCount(): number {
  if (!isBrowser) return 0;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!stored) return 0;
    const books = JSON.parse(stored) as Book[];
    return books.length;
  } catch {
    return 0;
  }
}

/**
 * Clear books from localStorage
 */
export function clearBooks(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
  } catch (error) {
    console.error('Failed to clear books from localStorage:', error);
  }
}

/**
 * Save analysis results to localStorage
 */
export function saveAnalysis(analysis: FullAnalysis): void {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
  } catch (error) {
    console.error('Failed to save analysis to localStorage:', error);
  }
}

/**
 * Get analysis results from localStorage
 */
export function getAnalysis(): FullAnalysis | null {
  if (!isBrowser) return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
    if (!stored) return null;
    return JSON.parse(stored) as FullAnalysis;
  } catch (error) {
    console.error('Failed to get analysis from localStorage:', error);
    return null;
  }
}

/**
 * Clear analysis from localStorage
 */
export function clearAnalysis(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
  } catch (error) {
    console.error('Failed to clear analysis from localStorage:', error);
  }
}

/**
 * Get last updated timestamp
 */
export function getLastUpdated(): string | null {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
  } catch {
    return null;
  }
}

// ============================================
// Demo Mode Helpers
// ============================================

/**
 * Check if currently in demo mode
 */
export function isDemoMode(): boolean {
  if (!isBrowser) return false;
  
  try {
    return localStorage.getItem(DEMO_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Load demo data into storage
 */
export function loadDemoData(): void {
  if (!isBrowser) return;
  
  try {
    // Set demo mode flag
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    
    // Load demo books
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(DEMO_BOOKS));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
    
    // Load pre-generated analysis
    localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(DEMO_ANALYSIS));
  } catch (error) {
    console.error('Failed to load demo data:', error);
  }
}

/**
 * Clear demo mode and data
 */
export function clearDemoData(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
    localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
  } catch (error) {
    console.error('Failed to clear demo data:', error);
  }
}

/**
 * Exit demo mode when user uploads their own data
 * This is called automatically when saveBooks is used with non-demo data
 */
export function exitDemoMode(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(DEMO_MODE_KEY);
  } catch (error) {
    console.error('Failed to exit demo mode:', error);
  }
}

// ============================================
// Year Summary Storage
// ============================================

/**
 * Save a year summary to localStorage
 */
export function saveYearSummary(year: number, summary: unknown): void {
  if (!isBrowser) return;
  
  try {
    const existing = getYearSummaries();
    existing[year] = summary;
    localStorage.setItem(STORAGE_KEYS.YEAR_SUMMARIES, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to save year summary:', error);
  }
}

/**
 * Get all year summaries from localStorage
 */
export function getYearSummaries(): Record<number, unknown> {
  if (!isBrowser) return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.YEAR_SUMMARIES);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get year summaries:', error);
    return {};
  }
}

/**
 * Get a specific year's summary from localStorage
 */
export function getYearSummary(year: number): unknown | null {
  const summaries = getYearSummaries();
  return summaries[year] || null;
}

/**
 * Clear all year summaries
 */
export function clearYearSummaries(): void {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.YEAR_SUMMARIES);
  } catch (error) {
    console.error('Failed to clear year summaries:', error);
  }
}

