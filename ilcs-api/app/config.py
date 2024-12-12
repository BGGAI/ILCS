from functools import lru_cache
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    openai_api_key: str = ""  # Optional with default empty string
    database_url: str = os.getenv('DATABASE_URL', '')  # Optional with default from env
    use_mock: bool = True  # Default to using mock data

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
