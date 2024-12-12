"""Test module for news scraping functionality."""
import os
import sys
import unittest
from datetime import datetime
from unittest.mock import patch, MagicMock

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.ilcs.news.scraper import FinanceNewsAPI, NewsCache

class TestNewsCache(unittest.TestCase):
    """Test the NewsCache class."""

    def setUp(self):
        self.cache = NewsCache(cache_duration=1)
        self.test_data = [{"title": "Test News", "content": "Test Content"}]

    def test_cache_set_and_get(self):
        """Test setting and getting cached news."""
        self.cache.set("AAPL", self.test_data)
        cached_data = self.cache.get("AAPL")
        self.assertEqual(cached_data, self.test_data)

    def test_cache_expiration(self):
        """Test cache expiration."""
        import time
        self.cache.set("AAPL", self.test_data)
        time.sleep(1.1)  # Wait for cache to expire
        cached_data = self.cache.get("AAPL")
        self.assertIsNone(cached_data)

class TestFinanceNewsAPI(unittest.TestCase):
    """Test the FinanceNewsAPI class."""

    def setUp(self):
        self.api = FinanceNewsAPI(cache_duration=3600)
        self.mock_response = {
            'status': 'ok',
            'articles': [{
                'title': 'Test Article',
                'description': 'Test Description',
                'content': 'Test Content',
                'url': 'http://test.com',
                'publishedAt': '2024-03-11T12:00:00Z',
                'source': {'name': 'Test Source'}
            }]
        }

    @patch('newsapi.NewsApiClient.get_everything')
    def test_fetch_news_success(self, mock_get_everything):
        """Test successful news fetching."""
        mock_get_everything.return_value = self.mock_response
        news = self.api.fetch_news('AAPL')

        self.assertEqual(len(news), 1)
        self.assertEqual(news[0]['title'], 'Test Article')
        self.assertEqual(news[0]['source'], 'Test Source')

    @patch('newsapi.NewsApiClient.get_everything')
    def test_fetch_news_api_error(self, mock_get_everything):
        """Test handling of API errors."""
        mock_get_everything.return_value = {'status': 'error', 'message': 'API Error'}
        news = self.api.fetch_news('AAPL')
        self.assertEqual(news, [])

    def test_fetch_news_invalid_api_key(self):
        """Test handling of invalid API key."""
        with patch.dict(os.environ, {'NEWS_API_KEY': ''}):
            with self.assertRaises(ValueError):
                FinanceNewsAPI()

if __name__ == '__main__':
    unittest.main()
