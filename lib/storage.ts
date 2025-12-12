// localStorage helpers for persisting book data and analysis

import { Book, FullAnalysis, STORAGE_KEYS } from './types';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save books to localStorage
 */
export function saveBooks(books: Book[]): void {
  if (!isBrowser) return;
  
  try {
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

