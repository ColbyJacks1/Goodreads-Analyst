# Backlog

## Genre Detection Improvement

**Priority:** Low (nice to have)  
**Status:** Deferred

### Problem
- Open Library's subject data doesn't map well to common book genres
- Many fiction books come back as "Philosophy" or other non-fiction categories
- The subject-to-genre mapping is unreliable

### Potential Solutions
1. **Use Google Books API** - Has "categories" field that may be more accurate
   - Requires API key
   - 1,000 requests/day limit (free tier)
   
2. **Use multiple sources** - Combine Open Library + Google Books
   - More complexity, more API calls
   
3. **LLM-based genre inference** - Send book title/author to Gemini to infer genre
   - Would be accurate but slow and uses API quota
   
4. **Manual genre mapping** - Let users edit/assign genres
   - More work for users

### Current Workaround
- Genre chart shows whatever data is available from Open Library
- Users can manually click "Fetch Genres" button to try to improve data
- Not blocking any functionality - just informational

### Decision
Deprioritized for now. The core app functionality (analysis, recommendations) works without accurate genre data since it sends full book list to LLM anyway.

