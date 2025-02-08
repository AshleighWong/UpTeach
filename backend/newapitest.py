import requests
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional
import os


class EducationalNewsTools:
    def __init__(self, api_key: str):
        """
        Initialize with NewsAPI key
        Get your API key from: https://newsapi.org/
        """
        self.api_key = api_key
        self.base_url = "https://newsapi.org/v2"

    def get_subject_news(
        self,
        subject: str,
        days_back: int = 7,
        max_articles: int = 5,
        language: str = "en",
        safe_mode: bool = True,
    ) -> Dict:
        """
        Get news articles relevant to a specific subject.

        Args:
            subject: The academic subject (e.g., 'biology', 'history')
            days_back: How many days of news to search
            max_articles: Maximum number of articles to return
            language: Language of articles
            safe_mode: If True, applies additional content filtering
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)

        # Add academic context to search
        academic_query = f"{subject} AND (research OR education OR study OR discovery OR development)"

        params = {
            "q": academic_query,
            "from": start_date.strftime("%Y-%m-%d"),
            "to": end_date.strftime("%Y-%m-%d"),
            "language": language,
            "sortBy": "relevancy",
            "pageSize": max_articles,
            "apiKey": self.api_key,
        }

        try:
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()
            articles = response.json()["articles"]

            # Additional filtering for educational content
            if safe_mode:
                articles = [
                    article
                    for article in articles
                    if self._is_educational_safe(article)
                ]

            return self._format_for_lesson_plan(articles)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching news: {e}")
            return {}

    def get_current_events(
        self, category: Optional[str] = None, country: str = "us", max_articles: int = 5
    ) -> Dict:
        """
        Get top current events, optionally filtered by category.

        Args:
            category: Optional category (e.g., 'science', 'technology', 'health')
            country: Country code for news sources
            max_articles: Maximum number of articles to return
        """
        params = {"country": country, "pageSize": max_articles, "apiKey": self.api_key}

        if category:
            params["category"] = category

        try:
            response = requests.get(f"{self.base_url}/top-headlines", params=params)
            response.raise_for_status()
            return self._format_for_lesson_plan(response.json()["articles"])

        except requests.exceptions.RequestException as e:
            print(f"Error fetching current events: {e}")
            return {}

    def generate_lesson_materials(
        self, subject: str, grade_level: str, topic: str
    ) -> Dict:
        """
        Generate comprehensive lesson materials including current events.

        Args:
            subject: Academic subject
            grade_level: Target grade level
            topic: Specific topic within the subject
        """
        # Get subject-specific news
        news = self.get_subject_news(topic, days_back=14, max_articles=3)

        # Structure for lesson plan
        lesson_plan = {
            "subject": subject,
            "grade_level": grade_level,
            "topic": topic,
            "current_events_connection": news,
            "suggested_activities": self._generate_activities(news, grade_level),
            "discussion_questions": self._generate_discussion_questions(news),
            "additional_resources": [],
        }

        return lesson_plan

    def _is_educational_safe(self, article: Dict) -> bool:
        """
        Check if article is appropriate for educational use.
        """
        # List of reliable educational news sources
        trusted_sources = [
            "edu",
            "academy",
            "science",
            "research",
            "university",
            "national geographic",
            "smithsonian",
            "discovery",
        ]

        # Basic checks for educational appropriateness
        source = article.get("source", {}).get("name", "").lower()
        title = article.get("title", "").lower()

        return any(term in source or term in title for term in trusted_sources)

    def _format_for_lesson_plan(self, articles: List[Dict]) -> List[Dict]:
        """
        Format articles for educational use.
        """
        formatted_articles = []
        for article in articles:
            formatted_articles.append(
                {
                    "title": article.get("title", ""),
                    "summary": article.get("description", ""),
                    "url": article.get("url", ""),
                    "date": article.get("publishedAt", ""),
                    "source": article.get("source", {}).get("name", ""),
                    "key_points": self._extract_key_points(article),
                    "curriculum_connections": self._suggest_curriculum_connections(
                        article
                    ),
                }
            )
        return formatted_articles

    def _generate_activities(self, news: List[Dict], grade_level: str) -> List[str]:
        """
        Generate age-appropriate activities based on news content.
        """
        activities = []
        for article in news:
            activities.extend(
                [
                    f"Research and present: Investigate the background of {article['title']}",
                    f"Group discussion: Analyze different perspectives on {article['title']}",
                    "Create a timeline of related historical events",
                    "Design an infographic summarizing the key points",
                    "Write a reflection piece connecting the news to personal experience",
                ]
            )
        return activities[:5]  # Return top 5 activities

    def _generate_discussion_questions(self, news: List[Dict]) -> List[str]:
        """
        Generate thought-provoking discussion questions.
        """
        questions = []
        for article in news:
            questions.extend(
                [
                    f"How does {article['title']} relate to what we've learned?",
                    "What are the potential long-term implications?",
                    "How might different stakeholders view this development?",
                    "What are the ethical considerations involved?",
                    "How does this connect to other current events?",
                ]
            )
        return questions[:5]  # Return top 5 questions

    def _extract_key_points(self, article: Dict) -> List[str]:
        """
        Extract key educational points from article.
        """
        return [
            f"Main concept: {article.get('title', '')}",
            f"Context: {article.get('description', '')}",
            f"Source credibility: {article.get('source', {}).get('name', '')}",
        ]

    def _suggest_curriculum_connections(self, article: Dict) -> List[str]:
        """
        Suggest connections to common curriculum topics.
        """
        return [
            "Critical thinking and analysis",
            "Current events and society",
            "Research and information literacy",
            "Cross-disciplinary connections",
        ]


def main():
    # Get API key from environment variable
    api_key = os.getenv("NEWSAPI_KEY")
    if not api_key:
        raise ValueError("Please set NEWSAPI_KEY environment variable")

    # Initialize the tools
    edu_tools = EducationalNewsTools(api_key)

    # Example: Generate materials for a biology lesson
    lesson_materials = edu_tools.generate_lesson_materials(
        subject="Biology", grade_level="High School", topic="Genetic Engineering"
    )

    # Save to JSON file
    with open("lesson_materials.json", "w") as f:
        json.dump(lesson_materials, f, indent=2)
        print("Lesson materials saved to lesson_materials.json")


if __name__ == "__main__":
    main()
