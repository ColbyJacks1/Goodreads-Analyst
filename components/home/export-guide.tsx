'use client';

import { useState } from 'react';
import { HelpCircle, ExternalLink, Download, Upload, CheckCircle, X, Smartphone, Apple, MonitorSmartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ExportGuideProps {
  variant?: 'modal' | 'inline' | 'tooltip';
  onClose?: () => void;
}

export function ExportGuide({ variant = 'inline', onClose }: ExportGuideProps) {
  const steps = [
    {
      number: 1,
      title: 'Log in to Goodreads',
      description: 'Go to goodreads.com and sign in to your account',
    },
    {
      number: 2,
      title: 'Go to Export Page',
      description: 'Click the link below or navigate to My Books → Import and Export',
      link: 'https://www.goodreads.com/review/import',
    },
    {
      number: 3,
      title: 'Click "Export Library"',
      description: 'Find the export section and click the export button',
    },
    {
      number: 4,
      title: 'Download CSV File',
      description: 'Wait for the export to complete, then download your file',
    },
    {
      number: 5,
      title: 'Upload Here',
      description: 'Drag and drop your CSV file into the upload area above',
    },
  ];

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              How to Export from Goodreads
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ExportSteps steps={steps} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Download className="w-5 h-5 text-primary" />
          How to Export from Goodreads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ExportSteps steps={steps} />
      </CardContent>
    </Card>
  );
}

function ExportSteps({ steps }: { steps: { number: number; title: string; description: string; link?: string }[] }) {
  const mobileStepsIOS = [
    { number: 1, title: 'Sign in via Safari', description: 'Open Safari, go to goodreads.com and sign in' },
    { number: 2, title: 'Go to Export Page', description: 'Navigate to My Books → Import and Export', link: 'https://www.goodreads.com/review/import' },
    { number: 3, title: 'Tap "Export Library"', description: 'Wait for export to complete, then tap the download link' },
    { number: 4, title: 'Copy the Link', description: 'In the popup, tap Share (↑) then Copy' },
    { number: 5, title: 'Paste in New Tab', description: 'Open a new Safari tab, paste the URL — tap Download when prompted' },
    { number: 6, title: 'Upload Here', description: 'Return to this site, tap "Browse" and select your CSV' },
  ];

  const mobileStepsAndroid = [
    { number: 1, title: 'Open Goodreads in Chrome', description: 'Go to goodreads.com and sign in (use Chrome, not the app)' },
    { number: 2, title: 'Go to Export Page', description: 'Navigate to My Books → Import and Export', link: 'https://www.goodreads.com/review/import' },
    { number: 3, title: 'Click "Export Library"', description: 'Tap the export button and wait for it to complete' },
    { number: 4, title: 'Download the File', description: 'Long-press the download link and select "Download link"' },
    { number: 5, title: 'Find in Downloads', description: 'The file will be in your Downloads folder' },
    { number: 6, title: 'Upload Here', description: 'Return to this site, tap "Browse" and select your CSV from Downloads' },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="desktop" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="desktop" className="text-xs sm:text-sm">
            <MonitorSmartphone className="w-4 h-4 mr-1 hidden sm:inline" />
            Desktop
          </TabsTrigger>
          <TabsTrigger value="ios" className="text-xs sm:text-sm">
            <Apple className="w-4 h-4 mr-1 hidden sm:inline" />
            iPhone
          </TabsTrigger>
          <TabsTrigger value="android" className="text-xs sm:text-sm">
            <Smartphone className="w-4 h-4 mr-1 hidden sm:inline" />
            Android
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop">
          <StepList steps={steps} />
        </TabsContent>

        <TabsContent value="ios">
          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> Use Safari (not the app) and stay logged in throughout
            </p>
          </div>
          <StepList steps={mobileStepsIOS} />
        </TabsContent>

        <TabsContent value="android">
          <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Tip: Use Chrome browser, not the Goodreads app
            </p>
          </div>
          <StepList steps={mobileStepsAndroid} />
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <a
          href="https://www.goodreads.com/review/import"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full gap-2">
            <ExternalLink className="w-4 h-4" />
            Go to Goodreads Export Page
          </Button>
        </a>
      </div>
    </div>
  );
}

function StepList({ steps }: { steps: { number: number; title: string; description: string; link?: string }[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-3">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{step.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground">{step.title}</p>
            <p className="text-xs text-foreground/70">{step.description}</p>
            {step.link && (
              <a
                href={step.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
              >
                Open Export Page
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExportGuideButton() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <HelpCircle className="w-4 h-4" />
        How to export from Goodreads
      </button>
      
      {showGuide && (
        <ExportGuide variant="modal" onClose={() => setShowGuide(false)} />
      )}
    </>
  );
}

export function ExportGuideTooltip() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="p-1 rounded-full hover:bg-muted transition-colors"
        title="How to export from Goodreads"
      >
        <HelpCircle className="w-5 h-5 text-muted-foreground hover:text-primary" />
      </button>
      
      {showTooltip && (
        <div className="absolute z-50 top-full right-0 mt-2 w-80">
          <Card className="shadow-lg border-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-sm">Export from Goodreads</p>
                <button onClick={() => setShowTooltip(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-sm space-y-2 text-foreground/80">
                <li>1. Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">goodreads.com/review/import</a></li>
                <li>2. Click "Export Library"</li>
                <li>3. Download the CSV file</li>
                <li>4. Upload it here</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

