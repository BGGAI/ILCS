"""Configuration settings for the ILCS system."""

# Event weights for different types of news events
EVENT_WEIGHTS = {
    # Positive events
    "acquisition_success": 0.7,
    "earnings_beat": 0.6,
    "new_partnership": 0.5,
    "product_launch": 0.4,

    # Negative events
    "regulatory_investigation": -0.7,
    "guidance_downgrade": -0.6,
    "executive_departure": -0.5,
    "product_recall": -0.4,
}

# Trading signal thresholds
SIGNAL_THRESHOLDS = {
    "buy": 0.5,
    "sell": -0.5,
}

# API Configuration
OPENAI_MODEL = "gpt-4"  # or "gpt-3.5-turbo" based on availability
MAX_TOKENS = 1000
TEMPERATURE = 0.3  # Lower temperature for more focused responses

# News Analysis Configuration
NEWS_BATCH_SIZE = 10
NEWS_CACHE_DURATION = 3600  # Cache news results for 1 hour
