"""News scraping module for NASDAQ-100 stocks."""
import os
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from newsapi import NewsApiClient
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

# Load environment variables
load_dotenv()

class NewsCache:
    """Simple cache for news articles."""

    def __init__(self, cache_duration: int):
        self.cache = {}
        self.cache_duration = cache_duration

    def get(self, key: str) -> Optional[List[Dict]]:
        """Get cached news if not expired."""
        if key in self.cache:
            timestamp, data = self.cache[key]
            if time.time() - timestamp < self.cache_duration:
                return data
            del self.cache[key]
        return None

    def set(self, key: str, data: List[Dict]):
        """Cache news data with current timestamp."""
        self.cache[key] = (time.time(), data)

class NewsScraperBase:
    """Base class for news scrapers."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def fetch_news(self, symbol: str) -> List[Dict]:
        """Fetch news for a given stock symbol."""
        raise NotImplementedError("Subclasses must implement fetch_news")

class FinanceNewsAPI(NewsScraperBase):
    """News scraper implementation using NewsAPI."""

    def __init__(self, cache_duration: int = 3600):
        super().__init__()
        self.api_key = os.getenv('NEWS_API_KEY')
        if not self.api_key:
            raise ValueError("NEWS_API_KEY environment variable not set")
        self.newsapi = NewsApiClient(api_key=self.api_key)
        self.cache = NewsCache(cache_duration)

    def fetch_news(self, symbol: str) -> List[Dict]:
        """
        Fetch financial news for a given stock symbol.
        Returns a list of news items with title, content, url, and timestamp.
        """
        # Check cache first
        cached_news = self.cache.get(symbol)
        if cached_news:
            return cached_news

        try:
            # Get news from the last 7 days
            from_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')

            # Search for news related to the stock symbol
            response = self.newsapi.get_everything(
                q=f'"{symbol}" AND (stock OR shares OR nasdaq)',
                language='en',
                sort_by='relevancy',
                from_param=from_date
            )

            if response['status'] != 'ok':
                self.logger.error(f"NewsAPI error: {response.get('message', 'Unknown error')}")
                return []

            # Process and format news articles
            articles = []
            for article in response['articles']:
                articles.append({
                    'title': article['title'],
                    'content': article['description'] or article['content'],
                    'url': article['url'],
                    'timestamp': article['publishedAt'],
                    'source': article['source']['name']
                })

            # Cache the results
            self.cache.set(symbol, articles)
            return articles

        except Exception as e:
            self.logger.error(f"Error fetching news for {symbol}: {str(e)}")
            return []
