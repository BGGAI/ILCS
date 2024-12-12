"""Sentiment analysis module using ChatGPT API."""
from typing import Dict, Tuple
import openai
from ..config import EVENT_WEIGHTS, OPENAI_MODEL, MAX_TOKENS, TEMPERATURE

class SentimentAnalyzer:
    """Analyzes news sentiment and events using ChatGPT."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        openai.api_key = api_key

    def analyze_news(self, news_text: str) -> Tuple[float, Dict]:
        """
        Analyze news text in two stages:
        1. Extract key information and classify events
        2. Perform sentiment analysis

        Returns:
        - sentiment_score: float between -1 and 1
        - event_info: dict containing detected events and their details
        """
        # Implementation will be added in the next phase
        pass
