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
