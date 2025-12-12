'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ExportGuide() {
  const [isOpen, setIsOpen] = useState(false);
  
  const steps = [
    {
      number: 1,
      title: 'Go to Goodreads',
      description: 'Log into your Goodreads account',
    },
    {
      number: 2,
      title: 'Open My Books',
      description: 'Click on "My Books" in the navigation menu',
    },
    {
      number: 3,
      title: 'Find Import/Export',
      description: 'Scroll down and look for "Import and export" in the left sidebar (under Tools)',
    },
    {
      number: 4,
      title: 'Export Library',
      description: 'Click "Export Library" and wait for the CSV file to download',
    },
    {
      number: 5,
      title: 'Upload Here',
      description: 'Come back and upload the downloaded goodreads_library_export.csv file',
    },
  ];
  
  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <HelpCircle className="w-4 h-4" />
        <span>How do I get my Goodreads data?</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      <div className={cn(
        'overflow-hidden transition-all duration-300',
        isOpen ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'
      )}>
        <div className="bg-muted/50 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-center">Export Your Goodreads Library</h3>
          
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.number} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                  {step.number}
                </span>
                <div>
                  <p className="font-medium text-sm">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              asChild
            >
              <a
                href="https://www.goodreads.com/review/import"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Goodreads Export Page
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

