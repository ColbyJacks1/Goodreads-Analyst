import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Navigation } from "@/components/shared/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Goodreads Analyzer - Discover Your Reading Personality",
  description: "Upload your Goodreads data and get AI-powered insights about your reading habits, personalized book recommendations, and a humorous roast of your literary choices.",
  keywords: ["goodreads", "book analysis", "reading statistics", "book recommendations", "AI analysis"],
  authors: [{ name: "Goodreads Analyzer" }],
  openGraph: {
    title: "Goodreads Analyzer",
    description: "Discover what your reading history reveals about you",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <Navigation />
        <main>{children}</main>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
