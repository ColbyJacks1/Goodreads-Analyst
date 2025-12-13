'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BarChart3, Sparkles, BookMarked, Calendar, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { hasBooks } from '@/lib/storage';
import { DemoBanner } from './demo-banner';

const navItems = [
  { href: '/', label: 'Home', icon: BookOpen },
  { href: '/stats', label: 'Stats', icon: BarChart3, requiresBooks: true },
  { href: '/analyze', label: 'Analyze', icon: Sparkles, requiresBooks: true },
  { href: '/recommendations', label: 'Find Books', icon: BookMarked, requiresBooks: true },
  { href: '/year-review', label: 'Year Review', icon: Calendar, requiresBooks: true },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booksLoaded, setBooksLoaded] = useState(false);
  
  useEffect(() => {
    setBooksLoaded(hasBooks());
  }, [pathname]);
  
  const visibleItems = navItems.filter(item => 
    !item.requiresBooks || booksLoaded
  );
  
  return (
    <>
      <DemoBanner />
      <nav className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-background shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="w-7 h-7 text-primary" />
            <span className="hidden sm:inline text-foreground">Goodreads Analyzer</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold transition-all duration-200',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-foreground/80 hover:text-foreground hover:bg-background/80'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden border-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-primary/10">
            <div className="flex flex-col gap-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-lg text-base font-semibold transition-all',
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-foreground bg-secondary/30 hover:bg-secondary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
