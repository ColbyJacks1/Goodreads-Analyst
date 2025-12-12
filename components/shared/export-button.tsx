'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

export function ExportButton({ targetRef, filename = 'goodreads-analysis' }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  
  const handleExport = async () => {
    if (!targetRef.current) return;
    
    setExporting(true);
    
    try {
      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {exporting ? 'Exporting...' : 'Save as Image'}
    </Button>
  );
}

