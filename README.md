# Goodreads Analyzer

Discover what your reading history reveals about you. Upload your Goodreads export and get AI-powered insights, personalized book recommendations, and a humorous roast of your literary choices.

## Features

- **Reading Statistics**: Beautiful visualizations of your reading habits, including genre distribution, rating patterns, and reading timeline
- **AI-Powered Analysis**: Get a literary roast, personality profile, and deep psychological insights based on your reading history
- **Smart Recommendations**: Tell the AI what you're in the mood for and get personalized book suggestions based on your reading preferences
- **Year in Review**: A detailed breakdown of your reading for any given year

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **AI**: Google Gemini API
- **Book Data**: Open Library API

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd goodreads-analyzer-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your Gemini API key:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Getting Your Goodreads Data

1. Log into your Goodreads account
2. Go to **My Books**
3. Find **Import and export** in the left sidebar (under Tools)
4. Click **Export Library**
5. Download the CSV file
6. Upload it to this app

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add the environment variable:
   - `GOOGLE_GEMINI_API_KEY`: Your Gemini API key
4. Deploy!

## Project Structure

```
app/
├── page.tsx              # Home/Upload page
├── stats/page.tsx        # Reading statistics dashboard
├── analyze/page.tsx      # AI analysis (roast, profile, insights)
├── recommendations/      # Prompt-based book finder
├── year-review/          # Year in Review
└── api/
    ├── enrich/           # Open Library API
    ├── analyze/          # Gemini analysis
    └── recommend/        # Gemini recommendations

components/
├── upload/               # File dropzone, progress
├── books/                # Book cards, lists
├── stats/                # Stat cards, charts
├── analysis/             # Analysis display cards
├── recommendations/      # Prompt input, results
├── year-review/          # Year selector, stats
└── shared/               # Navigation, export

lib/
├── types.ts              # TypeScript interfaces
├── csv-parser.ts         # Goodreads CSV parsing
├── storage.ts            # localStorage helpers
├── stats.ts              # Statistics calculation
├── genre-normalizer.ts   # Genre normalization
└── open-library.ts       # Open Library API client
```

## Privacy

Your reading data is stored locally in your browser using localStorage. The only external calls are:
- **Open Library API**: To fetch book covers and genre information
- **Google Gemini**: To generate AI analysis (your book data is sent to generate insights)

We do not store your data on any server.

## License

MIT
