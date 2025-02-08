import requests
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional
import os
from flask import jsonify


class GetNewsContent:
    def __init__(self, api_key: str):
        """
        Initialize with NewsAPI key
        Get your API key from: https://newsapi.org/
        """
        self.api_key = api_key
        self.base_url = "https://newsapi.org/v2"

    def _is_educational_safe(self, article: Dict) -> bool:
        # Add implementation for content safety checking
        return True

    def _format_for_lesson_plan(self, articles: List[Dict]) -> Dict:
        # Add implementation for formatting
        return {"articles": articles}

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
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days_back)
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
    edu_tools = GetNewsContent(api_key)  # Changed from EducationalNewsTools

    # Example: Get science news
    science_news = edu_tools.get_subject_news("biology", days_back=7)
    current_events = edu_tools.get_current_events(category="science")

    print(science_news)
    print(current_events)

def get():
    # Get API key from environment variable
    api_key = os.getenv("NEWSAPI_KEY")
    if not api_key:
        raise ValueError("Please set NEWSAPI_KEY environment variable")

    # Initialize the tools
    edu_tools = GetNewsContent(api_key)  # Changed from EducationalNewsTools

    # Example: Get science news
    science_news = edu_tools.get_subject_news("biology", days_back=7)
    current_events = edu_tools.get_current_events(category="science")

    return jsonify(science_news, current_events)


if __name__ == "__main__":
    main()
