"""Trading signal generation based on news analysis."""
from typing import Dict
from ..config import SIGNAL_THRESHOLDS

class SignalGenerator:
    """Generates trading signals based on sentiment and event analysis."""

    def calculate_final_score(self, sentiment_score: float, event_weight: float) -> float:
        """
        Calculate final score using the formula:
        final_score = sentiment_score * (1 + event_weight)
        """
        return sentiment_score * (1 + event_weight)

    def generate_signal(self, final_score: float) -> str:
        """Generate trading signal based on final score."""
        if final_score > SIGNAL_THRESHOLDS["buy"]:
            return "BUY"
        elif final_score < SIGNAL_THRESHOLDS["sell"]:
            return "SELL"
        return "HOLD"
