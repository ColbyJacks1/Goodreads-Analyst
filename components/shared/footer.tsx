'use client';

import { Linkedin, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Branding */}
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Made with 📚 by Colby
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Not affiliated with Goodreads or Amazon
            </p>
          </div>

          {/* Contact Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/in/colbyjackson/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="https://x.com/TheColbyJackson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="mailto:Colbyjacks1@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

