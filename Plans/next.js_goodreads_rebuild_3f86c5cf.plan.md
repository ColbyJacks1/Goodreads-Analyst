---
name: Next.js Goodreads Rebuild
overview: Rebuild the Goodreads Analyzer as a modern Next.js application with improved genre detection via Open Library API, card-based UI components, Year in Review feature, and image export for sharing.
todos:
  - id: setup
    content: Initialize Next.js project with TypeScript, Tailwind, and shadcn/ui
    status: pending
  - id: types
    content: Create TypeScript interfaces for Book, Analysis, and API responses
    status: pending
  - id: storage
    content: Implement localStorage helpers for persisting book data
    status: pending
  - id: csv-parser
    content: Build CSV parsing with Papa Parse for Goodreads format
    status: pending
  - id: upload-ui
    content: Create upload page with drag-drop zone and import progress
    status: pending
  - id: api-enrich
    content: Build /api/enrich route for Open Library genre/cover lookup
    status: pending
  - id: book-components
    content: Create book card and book list components with cover images
    status: pending
  - id: stats-page
    content: Build stats page with stat cards and Recharts visualizations
    status: pending
  - id: api-analyze
    content: Build /api/analyze route for Gemini API integration
    status: pending
  - id: analysis-components
    content: Create roast, recommendation, profile, and insight card components
    status: pending
  - id: analysis-page
    content: Build analysis page with tabbed interface
    status: pending
  - id: year-review
    content: Create Year in Review page with year selector and stats
    status: pending
  - id: export
    content: Implement image export using html-to-image
    status: pending
  - id: navigation
    content: Build navigation component and layout
    status: pending
  - id: styling
    content: Apply design system colors and polish UI
    status: pending
  - id: deploy
    content: Deploy to Vercel with environment variables
    status: pending
---

# Next.js Goodreads Analyzer Rebuild

## Architecture Overview

A single Next.js 14 application deployed to Vercel with:

- **Frontend**: React + Tailwind CSS + shadcn/ui components
- **API Routes**: Next.js server functions for Gemini API calls (protects API key)
- **Data Storage**: Browser localStorage for persistence (no backend database needed)
- **External APIs**: Google Gemini (analysis), Open Library (genre/cover lookup)

## Tech Stack

| Layer | Technology |

|-------|------------|

| Framework | Next.js 14 (App Router) |

| Language | TypeScript |

| Styling | Tailwind CSS |

| Components | shadcn/ui |

| Charts | Recharts |

| CSV Parsing | Papa Parse |

| Image Export | html-to-image |

| Deployment | Vercel |

## Project Structure

```
goodreads-analyzer-v2/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Home/Upload page
│   ├── stats/page.tsx          # Books and Stats page
│   ├── analyze/page.tsx        # AI Analysis (roast, recs, profile, insights)
│   ├── year-review/page.tsx    # Year in Review feature
│   └── api/
│       ├── analyze/route.ts    # Gemini API calls
│       └── enrich/route.ts     # Open Library genre/cover lookup
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── upload/
│   │   ├── file-dropzone.tsx
│   │   └── import-progress.tsx
│   ├── books/
│   │   ├── book-card.tsx
│   │   ├── book-list.tsx
│   │   └── book-cover.tsx
│   ├── stats/
│   │   ├── stat-card.tsx
│   │   ├── genre-chart.tsx
│   │   ├── rating-chart.tsx
│   │   └── timeline-chart.tsx
│   ├── analysis/
│   │   ├── roast-card.tsx
│   │   ├── recommendation-card.tsx
│   │   ├── profile-card.tsx
│   │   └── insight-card.tsx
│   ├── year-review/
│   │   ├── year-selector.tsx
│   │   ├── year-stats.tsx
│   │   └── year-highlights.tsx
│   └── shared/
│       ├── navigation.tsx
│       ├── export-button.tsx
│       └── loading-skeleton.tsx
├── lib/
│   ├── csv-parser.ts           # Parse Goodreads CSV
│   ├── storage.ts              # localStorage helpers
│   ├── genre-normalizer.ts     # Improved genre normalization
│   ├── open-library.ts         # Open Library API client
│   ├── gemini.ts               # Gemini prompt formatting
│   └── types.ts                # TypeScript interfaces
├── hooks/
│   ├── use-books.ts            # Book data state management
│   └── use-analysis.ts         # Analysis state management
└── prompts/
    ├── quick-analysis.md       # Roast + recommendations prompt
    └── deep-analysis.md        # Profile + insights prompt
```

## Core Features

### 1. CSV Upload and Processing

- Drag-and-drop file upload with visual feedback
- Parse CSV using Papa Parse
- Enrich books with Open Library data (genres, covers) via API route
- Store processed books in localStorage
- Show import progress with book count

### 2. Books and Stats Page

- Book list with cover images (from Open Library)
- Stat cards: total books, pages read, average rating, unique authors
- Genre distribution pie chart (with accurate genres from Open Library)
- Rating distribution bar chart
- Reading timeline by year

### 3. AI Analysis Page (Tabbed Interface)

- **Literary Roast**: Humorous analysis in styled card format
- **Recommendations**: Book cards with covers and match explanations
- **Reader Profile**: Demographics and preferences in infographic style
- **Literary Insights**: Psychological analysis with visual breakdowns
- Export any tab as image

### 4. Year in Review Page (New Feature)

- Year selector dropdown
- Stats for selected year: books read, pages, top genre, avg rating
- Monthly reading chart
- Top-rated books carousel
- Shareable year summary card

### 5. Export as Image

- "Share" button on analysis sections
- Uses html-to-image to capture styled component
- Downloads as PNG with branding

## API Routes

### `/api/enrich` (POST)

Accepts list of books with ISBNs, returns enriched data from Open Library:

```typescript
// Input
{ books: [{ isbn: "9780743273565", title: "The Great Gatsby" }] }

// Output  
{ enrichedBooks: [{ 
  isbn: "9780743273565",
  genres: ["Classic Literature", "Fiction", "American"],
  coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
  description: "..."
}]}
```

### `/api/analyze` (POST)

Accepts book data, calls Gemini API, returns structured analysis:

```typescript
// Input
{ books: [...], analysisType: "quick" | "deep" }

// Output
{ 
  roast: { summary: "...", bullets: [...], habits: {...}, predictions: [...] },
  recommendations: [{ title, author, why, themes }],
  profile: { demographics: {...}, mindset: {...} },
  insights: { portrait: "...", themes: "...", timeline: "..." }
}
```

## Design System

### Color Palette

- Primary: `#5D3FD3` (bookish purple)
- Secondary: `#F5F1EB` (cream/paper)
- Accent: `#C9A227` (gold for ratings)
- Background: `#FAFAF9` (warm white)
- Text: `#1C1917` (warm black)

### Component Styling

- Rounded corners (rounded-xl)
- Subtle shadows (shadow-md)
- Warm, bookish aesthetic
- Card-based layouts throughout
- Smooth transitions and hover states

## Data Flow

1. **Upload**: CSV file → Papa Parse → raw books array
2. **Enrich**: raw books → `/api/enrich` → books with genres/covers
3. **Store**: enriched books → localStorage
4. **Display**: localStorage → React state → UI components
5. **Analyze**: books → `/api/analyze` → Gemini → structured results → cards
6. **Export**: rendered card → html-to-image → PNG download

## Environment Variables

```
GOOGLE_GEMINI_API_KEY=xxx      # For AI analysis
```

Open Library API is free and requires no key.

## Deployment

1. Create new GitHub repository
2. Connect to Vercel
3. Add environment variable for Gemini API key
4. Deploy (auto-deploys on push)

## Migration Notes

The following logic will be adapted from the existing Python codebase:

- `app/ingest.py` GenreNormalizer → `lib/genre-normalizer.ts` (as fallback)
- `prompts/*.md` → `prompts/*.md` (reuse with minor adjustments)
- Analysis parsing logic → TypeScript interfaces with structured responses