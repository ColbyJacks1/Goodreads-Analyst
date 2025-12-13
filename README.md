# 📚 Goodreads Analyzer

**Discover what your reading history reveals about you.**

Upload your Goodreads export and get AI-powered insights, personalized book recommendations, and a humorous roast of your literary choices.

🔗 **[Try it live](https://goodreads-analyst.vercel.app)** | No signup required

---

## ✨ Features

- **📊 Reading Statistics** — Beautiful visualizations of your reading habits, genre distribution, rating patterns, and reading timeline
- **🔥 AI Literary Roast** — A playful, personalized roast of your reading choices
- **🧠 Reader Profile** — AI-inferred personality analysis (Myers-Briggs, Big Five) based on what you read
- **📖 Smart Recommendations** — Tell the AI what you're in the mood for and get personalized suggestions
- **📅 Year in Review** — Detailed breakdown of any year, with AI-generated theme analysis
- **🎯 Demo Mode** — Try with sample data if you don't have Goodreads

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| AI | Google Gemini API |
| Book Data | Open Library API |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Local Development

```bash
# Clone the repo
git clone https://github.com/ColbyJacks1/Goodreads-Analyst.git
cd Goodreads-Analyst

# Install dependencies
npm install

# Add your API key
echo "GOOGLE_GEMINI_API_KEY=your_key_here" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Getting Your Goodreads Data

1. Log into [Goodreads](https://www.goodreads.com)
2. Go to **My Books** → **Import and export** (left sidebar)
3. Click **Export Library**
4. Upload the downloaded CSV file to this app

## 🔒 Privacy

Your data stays private:
- **Book data** is stored locally in your browser (localStorage)
- **AI analysis** sends book titles/ratings to Google Gemini to generate insights
- **No server storage** — we don't keep your library

## 📁 Project Structure

```
app/
├── page.tsx              # Home/Upload
├── stats/                # Reading statistics
├── analyze/              # AI analysis tabs
├── recommendations/      # Book finder
├── year-review/          # Year in Review
└── api/                  # Serverless functions

components/
├── analysis/             # Roast, profile, insights cards
├── books/                # Book cards and lists
├── stats/                # Charts and stat cards
└── shared/               # Navigation, footer

lib/
├── types.ts              # TypeScript interfaces
├── csv-parser.ts         # Goodreads CSV parsing
├── stats.ts              # Statistics calculations
└── storage.ts            # localStorage helpers
```

## 🤝 Contributing

This is a hobby project, but suggestions and bug reports are welcome! Open an issue or reach out.

## 📄 License

MIT — use it however you'd like.

---

Built with ☕ and 📚 by [Colby](https://www.linkedin.com/in/colbyjackson/)
