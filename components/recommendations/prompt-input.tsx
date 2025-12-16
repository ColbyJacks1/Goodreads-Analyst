'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  cooldownRemaining?: number;
}

const QUICK_PROMPTS = [
  'Beach read',
  'Mind-bending sci-fi',
  'Historical epic',
  'Cozy mystery',
  'Thought-provoking non-fiction',
  'Page-turner thriller',
  'Literary fiction',
  'Something funny',
];

export function PromptInput({ onSubmit, disabled = false, cooldownRemaining = 0 }: PromptInputProps) {
  const isDisabled = disabled || cooldownRemaining > 0;
  const [prompt, setPrompt] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isDisabled) {
      onSubmit(prompt.trim());
    }
  };
  
  const handleQuickPrompt = (quickPrompt: string) => {
    if (!isDisabled) {
      setPrompt(quickPrompt);
      onSubmit(quickPrompt);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Quick prompt chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((quickPrompt) => (
          <Badge
            key={quickPrompt}
            variant="outline"
            className={cn(
              'cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => handleQuickPrompt(quickPrompt)}
          >
            {quickPrompt}
          </Badge>
        ))}
      </div>
      
      {/* Text input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Tell me what you're looking for... (e.g., 'a thriller for a rainy weekend' or 'something like Project Hail Mary')"
            className={cn(
              'w-full px-4 py-3 rounded-lg border bg-background resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              'placeholder:text-muted-foreground',
              isDisabled && 'opacity-50 cursor-not-allowed'
            )}
            rows={2}
            disabled={isDisabled}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!prompt.trim() || isDisabled}
          className="h-auto"
        >
          {cooldownRemaining > 0 ? `${cooldownRemaining}s` : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}

