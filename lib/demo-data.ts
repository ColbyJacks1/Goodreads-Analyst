// Demo data for users without their own Goodreads export
// Contains sample books and pre-generated AI analysis

import { Book, FullAnalysis } from './types';

// Sample books representing a diverse reading history
export const DEMO_BOOKS: Book[] = [
  // Literary Fiction
  { id: 'd1', bookId: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', isbn13: '9780743273565', myRating: 5, averageRating: 3.93, publisher: 'Scribner', pages: 180, yearPublished: 1925, originalPublicationYear: 1925, dateRead: '2024-01-15', dateAdded: '2023-12-01', bookshelves: 'classics', exclusiveShelf: 'read', myReview: 'A masterpiece of American literature. The prose is gorgeous.', genres: ['Fiction', 'Classics', 'Literary Fiction'], coverUrl: null, description: null },
  { id: 'd2', bookId: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', isbn13: '9780061120084', myRating: 5, averageRating: 4.27, publisher: 'Harper Perennial', pages: 324, yearPublished: 1960, originalPublicationYear: 1960, dateRead: '2024-02-20', dateAdded: '2024-01-01', bookshelves: 'classics', exclusiveShelf: 'read', myReview: 'Powerful story about justice and moral growth.', genres: ['Fiction', 'Classics', 'Historical Fiction'], coverUrl: null, description: null },
  { id: 'd3', bookId: '3', title: 'The Kite Runner', author: 'Khaled Hosseini', isbn: '9781594631931', isbn13: '9781594631931', myRating: 4, averageRating: 4.34, publisher: 'Riverhead Books', pages: 371, yearPublished: 2003, originalPublicationYear: 2003, dateRead: '2024-03-10', dateAdded: '2024-02-01', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Emotionally devastating and beautifully written.', genres: ['Fiction', 'Historical Fiction', 'Literary Fiction'], coverUrl: null, description: null },
  
  // Science Fiction
  { id: 'd4', bookId: '4', title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', isbn13: '9780441172719', myRating: 5, averageRating: 4.26, publisher: 'Ace', pages: 688, yearPublished: 1965, originalPublicationYear: 1965, dateRead: '2024-04-05', dateAdded: '2024-03-01', bookshelves: 'sci-fi', exclusiveShelf: 'read', myReview: 'Epic worldbuilding and complex political intrigue.', genres: ['Science Fiction', 'Fantasy', 'Classics'], coverUrl: null, description: null },
  { id: 'd5', bookId: '5', title: 'Project Hail Mary', author: 'Andy Weir', isbn: '9780593135204', isbn13: '9780593135204', myRating: 5, averageRating: 4.52, publisher: 'Ballantine Books', pages: 496, yearPublished: 2021, originalPublicationYear: 2021, dateRead: '2024-05-12', dateAdded: '2024-04-01', bookshelves: 'sci-fi', exclusiveShelf: 'read', myReview: 'Incredible! The science is fascinating and the story is heartwarming.', genres: ['Science Fiction', 'Adventure', 'Space'], coverUrl: null, description: null },
  { id: 'd6', bookId: '6', title: 'The Three-Body Problem', author: 'Liu Cixin', isbn: '9780765382030', isbn13: '9780765382030', myRating: 4, averageRating: 4.06, publisher: 'Tor Books', pages: 400, yearPublished: 2008, originalPublicationYear: 2008, dateRead: '2024-06-20', dateAdded: '2024-05-01', bookshelves: 'sci-fi', exclusiveShelf: 'read', myReview: 'Mind-bending hard sci-fi. Took a while to get into but worth it.', genres: ['Science Fiction', 'Hard Science Fiction', 'Chinese Literature'], coverUrl: null, description: null },
  
  // Fantasy
  { id: 'd7', bookId: '7', title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', isbn13: '9780756404741', myRating: 5, averageRating: 4.52, publisher: 'DAW Books', pages: 662, yearPublished: 2007, originalPublicationYear: 2007, dateRead: '2024-01-25', dateAdded: '2023-12-15', bookshelves: 'fantasy', exclusiveShelf: 'read', myReview: 'Beautiful prose and compelling storytelling. Kvothe is unforgettable.', genres: ['Fantasy', 'Fiction', 'Epic Fantasy'], coverUrl: null, description: null },
  { id: 'd8', bookId: '8', title: 'Piranesi', author: 'Susanna Clarke', isbn: '9781635575637', isbn13: '9781635575637', myRating: 4, averageRating: 4.18, publisher: 'Bloomsbury', pages: 272, yearPublished: 2020, originalPublicationYear: 2020, dateRead: '2024-02-28', dateAdded: '2024-01-15', bookshelves: 'fantasy', exclusiveShelf: 'read', myReview: 'Haunting and strange. A puzzle box of a book.', genres: ['Fantasy', 'Fiction', 'Mystery'], coverUrl: null, description: null },
  
  // Non-Fiction
  { id: 'd9', bookId: '9', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316097', isbn13: '9780062316097', myRating: 5, averageRating: 4.36, publisher: 'Harper', pages: 443, yearPublished: 2011, originalPublicationYear: 2011, dateRead: '2024-03-15', dateAdded: '2024-02-10', bookshelves: 'non-fiction', exclusiveShelf: 'read', myReview: 'Changed how I think about human history and progress.', genres: ['Non-Fiction', 'History', 'Science'], coverUrl: null, description: null },
  { id: 'd10', bookId: '10', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', isbn: '9780374533557', isbn13: '9780374533557', myRating: 4, averageRating: 4.16, publisher: 'Farrar, Straus and Giroux', pages: 499, yearPublished: 2011, originalPublicationYear: 2011, dateRead: '2024-04-20', dateAdded: '2024-03-15', bookshelves: 'non-fiction', exclusiveShelf: 'read', myReview: 'Dense but rewarding. Every chapter has insights.', genres: ['Non-Fiction', 'Psychology', 'Science'], coverUrl: null, description: null },
  { id: 'd11', bookId: '11', title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', isbn13: '9780735211292', myRating: 4, averageRating: 4.36, publisher: 'Avery', pages: 320, yearPublished: 2018, originalPublicationYear: 2018, dateRead: '2024-05-08', dateAdded: '2024-04-05', bookshelves: 'self-help', exclusiveShelf: 'read', myReview: 'Practical and actionable. Actually changed my daily routines.', genres: ['Non-Fiction', 'Self-Help', 'Psychology'], coverUrl: null, description: null },
  
  // Mystery/Thriller
  { id: 'd12', bookId: '12', title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '9781250301697', isbn13: '9781250301697', myRating: 4, averageRating: 4.08, publisher: 'Celadon Books', pages: 336, yearPublished: 2019, originalPublicationYear: 2019, dateRead: '2024-06-10', dateAdded: '2024-05-20', bookshelves: 'thriller', exclusiveShelf: 'read', myReview: 'That twist! Did not see it coming.', genres: ['Thriller', 'Mystery', 'Psychological Thriller'], coverUrl: null, description: null },
  { id: 'd13', bookId: '13', title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', isbn13: '9780307588371', myRating: 4, averageRating: 4.09, publisher: 'Crown', pages: 419, yearPublished: 2012, originalPublicationYear: 2012, dateRead: '2024-07-05', dateAdded: '2024-06-01', bookshelves: 'thriller', exclusiveShelf: 'read', myReview: 'Dark and twisty. Both leads are terrible people and I loved it.', genres: ['Thriller', 'Mystery', 'Fiction'], coverUrl: null, description: null },
  
  // More varied reading
  { id: 'd14', bookId: '14', title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', isbn13: '9780399590504', myRating: 5, averageRating: 4.47, publisher: 'Random House', pages: 334, yearPublished: 2018, originalPublicationYear: 2018, dateRead: '2024-07-20', dateAdded: '2024-06-15', bookshelves: 'memoir', exclusiveShelf: 'read', myReview: 'Incredible memoir. Her resilience is inspiring.', genres: ['Non-Fiction', 'Memoir', 'Biography'], coverUrl: null, description: null },
  { id: 'd15', bookId: '15', title: 'The Midnight Library', author: 'Matt Haig', isbn: '9780525559474', isbn13: '9780525559474', myRating: 4, averageRating: 4.02, publisher: 'Viking', pages: 304, yearPublished: 2020, originalPublicationYear: 2020, dateRead: '2024-08-01', dateAdded: '2024-07-10', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'A comforting read about choices and regrets.', genres: ['Fiction', 'Fantasy', 'Contemporary'], coverUrl: null, description: null },
  { id: 'd16', bookId: '16', title: 'A Man Called Ove', author: 'Fredrik Backman', isbn: '9781476738024', isbn13: '9781476738024', myRating: 5, averageRating: 4.38, publisher: 'Atria Books', pages: 337, yearPublished: 2012, originalPublicationYear: 2012, dateRead: '2024-08-15', dateAdded: '2024-07-20', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Made me laugh and cry. Ove is the grumpy grandpa we all need.', genres: ['Fiction', 'Contemporary', 'Humor'], coverUrl: null, description: null },
  { id: 'd17', bookId: '17', title: 'The Overstory', author: 'Richard Powers', isbn: '9780393356687', isbn13: '9780393356687', myRating: 4, averageRating: 4.04, publisher: 'W. W. Norton', pages: 502, yearPublished: 2018, originalPublicationYear: 2018, dateRead: '2024-09-05', dateAdded: '2024-08-01', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'A love letter to trees and nature. Changed how I see forests.', genres: ['Fiction', 'Literary Fiction', 'Environmental'], coverUrl: null, description: null },
  { id: 'd18', bookId: '18', title: 'Station Eleven', author: 'Emily St. John Mandel', isbn: '9780385353304', isbn13: '9780385353304', myRating: 4, averageRating: 4.06, publisher: 'Knopf', pages: 333, yearPublished: 2014, originalPublicationYear: 2014, dateRead: '2024-09-20', dateAdded: '2024-08-15', bookshelves: 'sci-fi', exclusiveShelf: 'read', myReview: 'Beautiful post-apocalyptic literary fiction. Haunting.', genres: ['Fiction', 'Science Fiction', 'Literary Fiction'], coverUrl: null, description: null },
  
  // 2023 reads
  { id: 'd19', bookId: '19', title: '1984', author: 'George Orwell', isbn: '9780451524935', isbn13: '9780451524935', myRating: 5, averageRating: 4.19, publisher: 'Signet Classic', pages: 328, yearPublished: 1949, originalPublicationYear: 1949, dateRead: '2023-03-10', dateAdded: '2023-02-01', bookshelves: 'classics', exclusiveShelf: 'read', myReview: 'Terrifyingly relevant. Big Brother is watching.', genres: ['Fiction', 'Classics', 'Dystopian'], coverUrl: null, description: null },
  { id: 'd20', bookId: '20', title: 'Brave New World', author: 'Aldous Huxley', isbn: '9780060850524', isbn13: '9780060850524', myRating: 4, averageRating: 3.99, publisher: 'Harper Perennial', pages: 288, yearPublished: 1932, originalPublicationYear: 1932, dateRead: '2023-04-15', dateAdded: '2023-03-10', bookshelves: 'classics', exclusiveShelf: 'read', myReview: 'Pleasure as control. Equally disturbing as 1984 in different ways.', genres: ['Fiction', 'Classics', 'Dystopian'], coverUrl: null, description: null },
  { id: 'd21', bookId: '21', title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', isbn13: '9780062315007', myRating: 3, averageRating: 3.90, publisher: 'HarperOne', pages: 208, yearPublished: 1988, originalPublicationYear: 1988, dateRead: '2023-05-20', dateAdded: '2023-04-15', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Simple but meaningful. Good for a reflective weekend.', genres: ['Fiction', 'Philosophy', 'Spirituality'], coverUrl: null, description: null },
  { id: 'd22', bookId: '22', title: 'The Book Thief', author: 'Markus Zusak', isbn: '9780375842207', isbn13: '9780375842207', myRating: 5, averageRating: 4.39, publisher: 'Knopf', pages: 552, yearPublished: 2005, originalPublicationYear: 2005, dateRead: '2023-06-25', dateAdded: '2023-05-20', bookshelves: 'historical-fiction', exclusiveShelf: 'read', myReview: 'Death as narrator is brilliant. Devastatingly beautiful.', genres: ['Fiction', 'Historical Fiction', 'Young Adult'], coverUrl: null, description: null },
  { id: 'd23', bookId: '23', title: 'Circe', author: 'Madeline Miller', isbn: '9780316556347', isbn13: '9780316556347', myRating: 5, averageRating: 4.27, publisher: 'Little, Brown', pages: 393, yearPublished: 2018, originalPublicationYear: 2018, dateRead: '2023-07-30', dateAdded: '2023-06-25', bookshelves: 'fantasy', exclusiveShelf: 'read', myReview: 'Greek mythology reimagined beautifully. Circe is powerful.', genres: ['Fantasy', 'Fiction', 'Mythology'], coverUrl: null, description: null },
  { id: 'd24', bookId: '24', title: 'The Song of Achilles', author: 'Madeline Miller', isbn: '9780062060624', isbn13: '9780062060624', myRating: 5, averageRating: 4.36, publisher: 'Ecco', pages: 378, yearPublished: 2011, originalPublicationYear: 2011, dateRead: '2023-08-15', dateAdded: '2023-07-30', bookshelves: 'fantasy', exclusiveShelf: 'read', myReview: 'A tragic love story beautifully told. My heart.', genres: ['Fantasy', 'Fiction', 'Romance'], coverUrl: null, description: null },
  { id: 'd25', bookId: '25', title: 'Never Let Me Go', author: 'Kazuo Ishiguro', isbn: '9781400078776', isbn13: '9781400078776', myRating: 4, averageRating: 3.83, publisher: 'Vintage', pages: 288, yearPublished: 2005, originalPublicationYear: 2005, dateRead: '2023-09-10', dateAdded: '2023-08-15', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Quietly devastating. The slow reveal is masterful.', genres: ['Fiction', 'Science Fiction', 'Literary Fiction'], coverUrl: null, description: null },
  { id: 'd26', bookId: '26', title: 'The Road', author: 'Cormac McCarthy', isbn: '9780307387899', isbn13: '9780307387899', myRating: 4, averageRating: 3.98, publisher: 'Vintage', pages: 287, yearPublished: 2006, originalPublicationYear: 2006, dateRead: '2023-10-05', dateAdded: '2023-09-10', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Bleak but beautiful. The love between father and son.', genres: ['Fiction', 'Post-Apocalyptic', 'Literary Fiction'], coverUrl: null, description: null },
  { id: 'd27', bookId: '27', title: 'Slaughterhouse-Five', author: 'Kurt Vonnegut', isbn: '9780385333849', isbn13: '9780385333849', myRating: 4, averageRating: 4.09, publisher: 'Dell', pages: 275, yearPublished: 1969, originalPublicationYear: 1969, dateRead: '2023-11-20', dateAdded: '2023-10-05', bookshelves: 'classics', exclusiveShelf: 'read', myReview: 'So it goes. Anti-war satire at its finest.', genres: ['Fiction', 'Classics', 'Science Fiction'], coverUrl: null, description: null },
  { id: 'd28', bookId: '28', title: 'Where the Crawdads Sing', author: 'Delia Owens', isbn: '9780735219090', isbn13: '9780735219090', myRating: 4, averageRating: 4.46, publisher: 'Putnam', pages: 384, yearPublished: 2018, originalPublicationYear: 2018, dateRead: '2023-12-10', dateAdded: '2023-11-20', bookshelves: 'fiction', exclusiveShelf: 'read', myReview: 'Beautiful nature writing mixed with mystery. Atmospheric.', genres: ['Fiction', 'Mystery', 'Literary Fiction'], coverUrl: null, description: null },
  
  // To-read books
  { id: 'd29', bookId: '29', title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', isbn: '9780374528379', isbn13: '9780374528379', myRating: null, averageRating: 4.35, publisher: 'FSG', pages: 796, yearPublished: 1880, originalPublicationYear: 1880, dateRead: null, dateAdded: '2024-01-01', bookshelves: 'to-read', exclusiveShelf: 'to-read', myReview: null, genres: ['Fiction', 'Classics', 'Philosophy'], coverUrl: null, description: null },
  { id: 'd30', bookId: '30', title: 'Infinite Jest', author: 'David Foster Wallace', isbn: '9780316066525', isbn13: '9780316066525', myRating: null, averageRating: 4.33, publisher: 'Back Bay Books', pages: 1079, yearPublished: 1996, originalPublicationYear: 1996, dateRead: null, dateAdded: '2024-02-01', bookshelves: 'to-read', exclusiveShelf: 'to-read', myReview: null, genres: ['Fiction', 'Literary Fiction', 'Postmodern'], coverUrl: null, description: null },
  { id: 'd31', bookId: '31', title: 'House of Leaves', author: 'Mark Z. Danielewski', isbn: '9780375703768', isbn13: '9780375703768', myRating: null, averageRating: 4.13, publisher: 'Pantheon', pages: 709, yearPublished: 2000, originalPublicationYear: 2000, dateRead: null, dateAdded: '2024-03-01', bookshelves: 'to-read', exclusiveShelf: 'to-read', myReview: null, genres: ['Horror', 'Fiction', 'Experimental'], coverUrl: null, description: null },
];

// Pre-generated AI analysis for demo mode (no API calls needed)
export const DEMO_ANALYSIS: FullAnalysis = {
  roast: {
    raw: JSON.stringify({
      readerSummary: "You're that friend who always has a book recommendation ready, whether anyone asked or not. Your reading list screams 'I took one philosophy class and never recovered.'",
      roastBullets: [
        "28 books read and you still can't pick a genre lane. Commitment issues much?",
        "You gave The Alchemist 3 stars. Finally, someone brave enough to admit the emperor has no clothes.",
        "Two Madeline Miller books back-to-back? Someone discovered Greek mythology was actually interesting.",
        "Project Hail Mary AND Three-Body Problem? You're definitely the person who says 'well actually' at parties.",
        "Your to-read list includes Infinite Jest. We both know that's never happening."
      ],
      habitsExposed: {
        mostReadGenre: "Literary Fiction",
        mostReadGenreComment: "You like your books like you like your coffee - pretentious and requiring multiple attempts to finish.",
        readingSpeed: "Steady Reader",
        readingSpeedComment: "2-3 books per month. Very consistent. Very... safe.",
        ratingPattern: "Generous",
        ratingPatternComment: "Your average rating is 4.3 stars. Either you're excellent at picking books, or you're a book people-pleaser.",
        bookSelectionMethod: "Hype Train",
        bookSelectionComment: "Project Hail Mary, Atomic Habits, Educated - you've read the BookTok starter pack."
      },
      predictions: [
        "You'll finally start Brothers Karamazov next year. You'll get 150 pages in before 'taking a break.'",
        "You're going to recommend Sapiens to at least three people in the next month.",
        "That Infinite Jest on your to-read list? It'll still be there in 2030.",
        "You'll discover a new 'life-changing' non-fiction book by February.",
        "Someone will ask what you're reading and you'll say 'oh, just something for fun' about a 600-page literary novel."
      ]
    })
  },
  recommendations: {
    raw: JSON.stringify({
      recommendations: [
        {
          title: "Klara and the Sun",
          author: "Kazuo Ishiguro",
          whyThisBook: "You loved Never Let Me Go's quiet devastation. Ishiguro does it again with an AI narrator that'll make you question what it means to be human.",
          connectionToReading: "Your appreciation for literary sci-fi like Station Eleven and The Overstory shows you like genre fiction with depth.",
          themes: ["AI", "Love", "Humanity"]
        },
        {
          title: "The House in the Cerulean Sea",
          author: "TJ Klune",
          whyThisBook: "After A Man Called Ove, you clearly appreciate grumpy characters finding unexpected family. This is fantasy's answer to that.",
          connectionToReading: "Your 5-star rating for Ove plus your fantasy reads (Piranesi, Name of the Wind) makes this a perfect fit.",
          themes: ["Found Family", "Fantasy", "Comfort"]
        },
        {
          title: "Tomorrow, and Tomorrow, and Tomorrow",
          author: "Gabrielle Zevin",
          whyThisBook: "A beautiful exploration of creativity, friendship, and love spanning decades. It has the emotional depth you seek.",
          connectionToReading: "Your love for character-driven literary fiction and books that span time periods points directly here.",
          themes: ["Friendship", "Video Games", "Ambition"]
        },
        {
          title: "Children of Time",
          author: "Adrian Tchaikovsky",
          whyThisBook: "Hard sci-fi with incredible worldbuilding. If you liked Three-Body Problem's scope, this will blow your mind.",
          connectionToReading: "Dune fan + Three-Body Problem + Project Hail Mary = you're ready for spiders evolving intelligence.",
          themes: ["Evolution", "Space", "Survival"]
        },
        {
          title: "Pachinko",
          author: "Min Jin Lee",
          whyThisBook: "Epic multigenerational saga with gorgeous prose. It has the historical depth you loved in Kite Runner and The Book Thief.",
          connectionToReading: "Your 5-star ratings for sweeping narratives and immigrant stories make this essential.",
          themes: ["Family", "Identity", "History"]
        }
      ],
      genreExpansion: "You've stayed safely in literary fiction and popular sci-fi. Consider exploring translated fiction (try Convenience Store Woman or The Memory Police) or narrative non-fiction with more edge (Empire of Pain, Say Nothing). You might also enjoy literary horror - Mexican Gothic or The Only Good Indians would push your boundaries while matching your taste for beautiful prose."
    })
  },
  profile: {
    raw: JSON.stringify({
      demographics: {
        ageLifeStage: "Late 20s to mid-30s, established in career but still exploring identity",
        educationLevel: "Bachelor's degree or higher, likely in humanities or social sciences",
        professionalField: "Knowledge worker - possibly tech, academia, or creative industries",
        geographicLocation: "Urban or suburban, likely English-speaking Western country",
        familyStatus: "Single or partnered without children, values personal time for reading"
      },
      mindset: {
        politicsValues: "Progressive-leaning, values social justice and environmental issues",
        riskTolerance: "Moderate - enjoys challenging ideas but from the safety of acclaimed books",
        learningStyle: "Deep diver - prefers to fully understand topics through multiple sources",
        informationDiet: "Curates carefully - follows book recommendations, literary podcasts",
        lifeArc: "In a growth phase - actively working on self-improvement while exploring meaning"
      },
      personality: {
        myersBriggs: {
          type: "INFJ",
          reasoning: "Your attraction to deep character studies, philosophical themes, and books exploring human nature suggests strong Intuition and Feeling. The systematic approach to reading (completing series, exploring authors deeply) indicates Judging."
        },
        bigFive: {
          openness: "High - Your diverse genre exploration from hard sci-fi to literary fiction to self-help demonstrates intellectual curiosity",
          conscientiousness: "High - Consistent reading pace of 2-3 books monthly, thoughtful reviews, organized to-read list",
          extraversion: "Low to Medium - Preference for introspective narratives and solitary activity suggests introversion",
          agreeableness: "High - Generous ratings, empathetic book choices, drawn to stories about connection",
          neuroticism: "Low to Medium - Attracted to books about meaning and anxiety (1984, The Road) but also comfort reads"
        }
      },
      detailedAnalysis: [
        {
          title: "Intellectual Identity",
          conclusion: "You use books as a way to signal and develop intellectual identity",
          evidence: ["Reading Sapiens and Thinking Fast and Slow for Big Ideas", "Tackling 'important' literary fiction", "Keeping challenging books on to-read list even if unlikely to read"],
          confidence: "High"
        },
        {
          title: "Emotional Processing",
          conclusion: "Fiction serves as a safe space for emotional exploration",
          evidence: ["Multiple 'devastating' reads (Kite Runner, Book Thief, Song of Achilles)", "Seeking catharsis through tragic narratives", "Reviews emphasizing emotional impact"],
          confidence: "High"
        },
        {
          title: "Search for Meaning",
          conclusion: "Currently grappling with existential questions through reading choices",
          evidence: ["Dystopian classics exploring society (1984, Brave New World)", "Philosophy-adjacent fiction (The Alchemist, Midnight Library)", "Self-improvement non-fiction (Atomic Habits)"],
          confidence: "Medium"
        }
      ]
    })
  },
  insights: {
    raw: JSON.stringify({
      literaryPortrait: "You're a seeker dressed as a reader. Your bookshelf isn't just entertainment—it's a map of your quest to understand what makes life meaningful. You oscillate between escapist wonder (fantasy, sci-fi) and confronting hard truths (dystopia, literary fiction), never settling too long in either camp.",
      dominantThemes: "Identity and belonging echo throughout your choices. From Kvothe's origin story to Circe's self-discovery, from Educated's family rupture to Ove's reluctant community—you're drawn to characters figuring out who they are and where they fit. The secondary thread is mortality and legacy: what we leave behind, what makes a life worthwhile.",
      readingJourney: "2023 was your year of classics and emotional devastation. 2024 shifted toward contemporary literary fiction and science fiction with heart. You've moved from 'books you should read' toward 'books that resonate.' This evolution suggests growing confidence in your taste.",
      readerArchetype: "The Philosophical Adventurer - You want mind-expanding ideas wrapped in beautiful prose and emotional resonance. Pure entertainment isn't enough; you need to feel changed. But you also want the journey to be enjoyable, not homework.",
      intellectualProfile: "Your reading reveals someone building a personal philosophy from multiple sources. You're synthesizing scientific worldview (Sapiens, Three-Body Problem) with humanistic values (Educated, A Man Called Ove) and self-improvement frameworks (Atomic Habits). This bricolage approach suggests independent thinking rather than adherence to any single ideology.",
      hiddenPatterns: "You read in pairs and clusters without realizing it. Two Millers, two dystopias, multiple 'quiet apocalypse' books. You also tend to alternate heavy and light—devastation followed by comfort. This isn't random; it's emotional self-regulation through reading.",
      growthAreas: "Your to-read list skews toward intimidating 'important' books you may never read. Consider why. You might grow more by following curiosity toward genres you've dismissed (romance, horror, graphic novels) rather than adding more literary obligation."
    })
  },
  generatedAt: new Date().toISOString()
};

// Pre-generated year summary for demo
export const DEMO_YEAR_SUMMARY = {
  headline: "The Year of Seeking Meaning Through Stories",
  overview: "2024 was defined by your search for depth—in science fiction that asks big questions, literary fiction that breaks hearts, and non-fiction that promises transformation. You read not just for escape, but for understanding.",
  keyThemes: [
    {
      theme: "The Weight of Human Connection",
      insight: "From Kvothe's loneliness to Ove's reluctant friendships, you gravitated toward stories about isolated people finding unexpected bonds. This suggests you're thinking deeply about community and belonging in your own life.",
      books: ["A Man Called Ove", "The Name of the Wind", "The Kite Runner"]
    },
    {
      theme: "Confronting Mortality and Legacy",
      insight: "Multiple books dealt with death, memory, and what we leave behind. Station Eleven's post-apocalyptic beauty, The Road's stark survival—you're wrestling with questions about what matters.",
      books: ["Station Eleven", "The Road", "The Midnight Library"]
    },
    {
      theme: "The Power of Self-Determination",
      insight: "Atomic Habits, Educated, The Alchemist—a thread of books about choosing your path despite circumstances. You're in a phase of believing in personal agency.",
      books: ["Atomic Habits", "Educated", "Circe"]
    }
  ],
  emotionalJourney: "Your 2024 reading was an emotional rollercoaster by design. You alternated between devastating literary fiction and hopeful sci-fi, heavy non-fiction and comfort reads. This pattern suggests you use reading for emotional regulation—processing difficult feelings through sad books, then recovering with wonder.",
  intellectualPursuits: "You chased big ideas this year: the nature of consciousness (Three-Body Problem), the arc of human history (Sapiens), the mechanics of behavior change (Atomic Habits). But you wanted these ideas delivered with story, not textbook. You're building a worldview, but you want it to feel, not just inform.",
  surprisingConnection: {
    connection: "Project Hail Mary and A Man Called Ove are secretly the same book",
    books: ["Project Hail Mary", "A Man Called Ove"],
    insight: "Both feature grumpy, methodical protagonists who save the day through competence while accidentally building meaningful relationships. Your love for both reveals you're drawn to 'competence porn' wrapped in found family themes."
  },
  readerPortrait: "In 2024, you were a reader in transition—moving from 'should reads' to 'want reads' while still honoring intellectual ambition. You sought transformation through books, whether emotional catharsis, philosophical insight, or practical improvement. You read with intention but also allowed yourself pleasure.",
  lookingAhead: "Based on your patterns, you might love: literary mysteries (The Seven Husbands of Evelyn Hugo), translated fiction (The Memory Police), or hybrid memoir-science books (The Body Keeps the Score). You're ready for more adventurous choices—trust your evolving taste."
};

// Example preview content for homepage
export const EXAMPLE_PREVIEWS = {
  roast: {
    title: "Your Literary Roast",
    preview: "You're that friend who always has a book recommendation ready, whether anyone asked or not...",
    fullQuote: "28 books read and you still can't pick a genre lane. Commitment issues much?"
  },
  profile: {
    title: "Reader Profile",
    type: "INFJ - The Philosophical Adventurer",
    preview: "You want mind-expanding ideas wrapped in beautiful prose and emotional resonance."
  },
  yearSummary: {
    title: "2024 Year in Review",
    headline: "The Year of Seeking Meaning Through Stories",
    preview: "Your reading reveals someone building a personal philosophy from multiple sources."
  }
};

