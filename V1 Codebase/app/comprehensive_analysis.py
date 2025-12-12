"""Comprehensive book analysis using Google Gemini."""

# Version: 2024-12-19 - Fixed for Streamlit Cloud deployment
import json
import logging
import os
import time
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from .db import db_manager, LLMHistoryCreate
from .usage_logger import usage_logger

logger = logging.getLogger(__name__)


class ComprehensiveAnalyzer:
    """Generates comprehensive analysis including insights, profile, and recommendations."""
    
    def __init__(self):
        self.db = db_manager
        
        # Initialize Google Gemini
        api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
        if not api_key:
            logger.warning("No Google Gemini API key provided. Analysis will be disabled.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_INSIGHTS_MODEL", "gemini-2.5-flash")
            self.model = genai.GenerativeModel(model_name)
        
        # Load comprehensive prompt template (for parallel analysis)
        prompt_path = Path(__file__).parent.parent / "prompts" / "comprehensive_analysis_prompt_parallel.md"
        with open(prompt_path, 'r') as f:
            self.prompt_template = f.read()
    
    def _convert_session_books_to_objects(self, session_books: List[Dict[str, Any]]) -> List[Any]:
        """Convert session book dictionaries to objects with expected attributes."""
        class BookObject:
            def __init__(self, book_dict: Dict[str, Any]):
                self.book_id = book_dict.get('book_id', '')
                self.title = book_dict.get('title', 'Unknown Title')
                self.author = book_dict.get('author', 'Unknown Author')
                self.my_rating = book_dict.get('my_rating')
                self.average_rating = book_dict.get('average_rating')
                self.date_read = book_dict.get('date_read')
                self.date_added = book_dict.get('date_added')
                self.bookshelves = book_dict.get('bookshelves')
                self.my_review = book_dict.get('my_review')
                self.genres = book_dict.get('genres')
                self.publisher = book_dict.get('publisher')
                self.pages = book_dict.get('pages')
                self.year_published = book_dict.get('year_published')
                self.isbn = book_dict.get('isbn')
                self.isbn13 = book_dict.get('isbn13')
        
        return [BookObject(book) for book in session_books]
    
    def _format_books(self, books: List[Any]) -> str:
        """Format user's books for LLM context."""
        if not books:
            return "No books available."
        
        # Sort by rating (highest first) and date read (most recent first)
        sorted_books = sorted(books, 
                             key=lambda x: (x.my_rating or 0, x.date_read or x.date_added), 
                             reverse=True)
        
        book_lines = []
        for book in sorted_books:
            rating = book.my_rating or "No rating"
            date = book.date_read or book.date_added
            
            # Handle date formatting - could be string or datetime object
            if date:
                if hasattr(date, 'strftime'):
                    # It's a datetime object
                    date_str = date.strftime("%Y-%m-%d")
                else:
                    # It's a string, use as-is
                    date_str = str(date)
            else:
                date_str = "Unknown date"
            
            line = f"- {book.title} by {book.author} (Rating: {rating}, Read: {date_str})"
            
            if book.genres:
                line += f" [Genres: {book.genres}]"
            
            if book.my_review:
                line += f" - Review: {book.my_review[:100]}..."
            
            book_lines.append(line)
        
        return "\n".join(book_lines)

    def generate_quick_analysis(self, session_books: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Generate quick analysis (roast + recommendations) for immediate display."""
        try:
            if not self.model:
                api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
                error_msg = "Gemini model not available"
                if not api_key:
                    error_msg += " - GOOGLE_GEMINI_API_KEY environment variable not set"
                else:
                    error_msg += " - Model initialization failed"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "raw_response": None
                }
            
            # Use session books if provided, otherwise fallback to database
            if session_books is not None:
                books = self._convert_session_books_to_objects(session_books)
            else:
                books = self.db.get_all_books()
            
            if not books:
                return {"error": "No books found"}
            
            books_text = self._format_books(books)
            
            # Load quick analysis prompt
            prompt_path = Path(__file__).parent.parent / "prompts" / "quick_analysis_prompt.md"
            with open(prompt_path, 'r') as f:
                quick_prompt_template = f.read()
            
            quick_prompt = quick_prompt_template.format(books=books_text)
            
            logger.info("Generating quick analysis...")
            
            # Capture start time for processing time
            start_time = time.time()
            
            response = self.model.generate_content(quick_prompt)
            
            processing_time = time.time() - start_time
            
            if not response.text:
                error_msg = "No response from LLM"
                usage_logger.log_ai_response(
                    analysis_type="quick_analysis",
                    prompt=quick_prompt,
                    response="",
                    book_count=len(books),
                    processing_time=processing_time,
                    error=error_msg
                )
                return {"error": error_msg}
            
            # Log the AI response
            usage_logger.log_ai_response(
                analysis_type="quick_analysis",
                prompt=quick_prompt,
                response=response.text,
                book_count=len(books),
                processing_time=processing_time
            )
            
            # Parse quick response
            parsed_sections = self._parse_quick_response(response.text)
            
            return {
                "success": True,
                "quick_analysis": response.text,
                "parsed_sections": parsed_sections,
                "raw_response": response.text
            }
        
        except Exception as e:
            logger.error(f"Error generating quick analysis: {str(e)}")
            usage_logger.log_error("quick_analysis", str(e))
            return {"error": str(e)}

    def generate_comprehensive_analysis_parallel(self, session_books: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Generate comprehensive analysis (insights + profile) for secondary display."""
        try:
            if not self.model:
                api_key = os.getenv("GOOGLE_GEMINI_API_KEY")
                error_msg = "Gemini model not available"
                if not api_key:
                    error_msg += " - GOOGLE_GEMINI_API_KEY environment variable not set"
                else:
                    error_msg += " - Model initialization failed"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "raw_response": None
                }
            
            # Use session books if provided, otherwise fallback to database
            if session_books is not None:
                books = self._convert_session_books_to_objects(session_books)
            else:
                books = self.db.get_all_books()
            
            if not books:
                return {"error": "No books found"}
            
            books_text = self._format_books(books)
            
            # Format prompt
            comprehensive_prompt = self.prompt_template.format(books=books_text)
            
            logger.info("Generating comprehensive analysis parallel...")
            
            # Capture start time for processing time
            start_time = time.time()
            
            response = self.model.generate_content(comprehensive_prompt)
            
            processing_time = time.time() - start_time
            
            if not response.text:
                error_msg = "No response from LLM"
                usage_logger.log_ai_response(
                    analysis_type="comprehensive_analysis",
                    prompt=comprehensive_prompt,
                    response="",
                    book_count=len(books),
                    processing_time=processing_time,
                    error=error_msg
                )
                return {"error": error_msg}
            
            # Log the AI response
            usage_logger.log_ai_response(
                analysis_type="comprehensive_analysis",
                prompt=comprehensive_prompt,
                response=response.text,
                book_count=len(books),
                processing_time=processing_time
            )
            
            # Parse comprehensive response
            parsed_sections = self._parse_comprehensive_response_parallel(response.text)
            
            return {
                "success": True,
                "comprehensive_analysis_parallel": response.text,
                "parsed_sections": parsed_sections,
                "raw_response": response.text
            }
        
        except Exception as e:
            logger.error(f"Error generating comprehensive analysis parallel: {str(e)}")
            usage_logger.log_error("comprehensive_analysis", str(e))
            return {"error": str(e)}
    


    def _parse_quick_response(self, response_text: str) -> Dict[str, str]:
        """Parse the quick response into separate sections."""
        sections = {
            "humorous": "",
            "recommendations": ""
        }
        
        # Debug: Log the raw response to see what we're working with
        logger.info(f"Raw quick response: {response_text[:500]}...")
        
        # Parse quick response (roast + recommendations)
        lines = response_text.split('\n')
        current_section = None
        current_content = []
        
        # Multiple header patterns to try
        roast_headers = [
            "## ROAST ME",
            "## HUMOROUS ROAST ANALYSIS", 
            "## ROAST",
            "ROAST ME",
            "HUMOROUS ROAST"
        ]
        
        recommendations_headers = [
            "## PERSONALIZED RECOMMENDATIONS",
            "## RECOMMENDATIONS",
            "## BOOK RECOMMENDATIONS",
            "PERSONALIZED RECOMMENDATIONS"
        ]
        
        for line in lines:
            # Check for roast section with multiple header patterns
            if any(header in line for header in roast_headers):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = "humorous"
                current_content = [line]
                logger.info(f"Found roast section with header: {line}")
            elif any(header in line for header in recommendations_headers):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = "recommendations"
                current_content = [line]
                logger.info(f"Found recommendations section with header: {line}")
            elif current_section:
                current_content.append(line)
        
        # Add the last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)
        
        # Fallback: If no sections found, try to split by common patterns
        if not sections["humorous"] and not sections["recommendations"]:
            logger.warning("No sections found with headers, trying fallback parsing...")
            sections = self._fallback_parse_quick_response(response_text)
        
        # Debug: Log what we found
        logger.info(f"Parsed sections - humorous: {len(sections['humorous'])} chars, recommendations: {len(sections['recommendations'])} chars")
        
        return sections
    
    def _fallback_parse_quick_response(self, response_text: str) -> Dict[str, str]:
        """Fallback parsing when headers aren't found."""
        sections = {
            "humorous": "",
            "recommendations": ""
        }
        
        # Try to find content by looking for key phrases
        text_lower = response_text.lower()
        
        # Look for roast indicators
        roast_indicators = ["roast", "humorous", "witty", "sarcastic", "reader summary", "literary roast"]
        recommendations_indicators = ["recommendations", "suggestions", "books to read", "curated"]
        
        # Split the text roughly in half and assign based on content
        lines = response_text.split('\n')
        mid_point = len(lines) // 2
        
        first_half = '\n'.join(lines[:mid_point])
        second_half = '\n'.join(lines[mid_point:])
        
        # Check which half has more roast indicators
        first_roast_score = sum(1 for indicator in roast_indicators if indicator in first_half.lower())
        second_roast_score = sum(1 for indicator in roast_indicators if indicator in second_half.lower())
        
        if first_roast_score > second_roast_score:
            sections["humorous"] = first_half
            sections["recommendations"] = second_half
        else:
            sections["humorous"] = second_half
            sections["recommendations"] = first_half
        
        logger.info(f"Fallback parsing - assigned {len(sections['humorous'])} chars to humorous, {len(sections['recommendations'])} chars to recommendations")
        
        return sections

    def _parse_comprehensive_response_parallel(self, response_text: str) -> Dict[str, str]:
        """Parse the comprehensive response parallel into separate sections."""
        sections = {
            "insights": "",
            "profile": ""
        }
        
        # Parse comprehensive response (insights + profile)
        lines = response_text.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            if "## LITERARY PSYCHOLOGY INSIGHTS" in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = "insights"
                current_content = [line]
            elif "## PERSONAL PROFILE ANALYSIS" in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = "profile"
                current_content = [line]
            elif current_section:
                current_content.append(line)
        
        # Add the last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
    
    def get_analysis_stats(self, session_books: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Get statistics about the comprehensive analysis capability."""
        # Use session books if provided, otherwise fallback to database
        if session_books is not None:
            books = self._convert_session_books_to_objects(session_books)
        else:
            books = self.db.get_all_books()
        
        if not books:
            return {
                "total_books": 0,
                "can_generate_analysis": False,
                "reason": "No books in database"
            }
        
        # Check if we have enough data for meaningful analysis
        books_with_ratings = [book for book in books if book.my_rating]
        
        can_generate = (
            len(books) >= 5 and
            len(books_with_ratings) >= 3
        )
        
        return {
            "total_books": len(books),
            "books_with_ratings": len(books_with_ratings),
            "can_generate_analysis": can_generate,
            "reason": "Insufficient data" if not can_generate else "Ready"
        }


# Global comprehensive analyzer instance
print("🔄 Creating comprehensive_analyzer instance...")
comprehensive_analyzer = ComprehensiveAnalyzer()
print(f"✅ Created comprehensive_analyzer with methods: {[m for m in dir(comprehensive_analyzer) if not m.startswith('_')]}")
