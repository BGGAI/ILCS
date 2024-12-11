from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    database_url: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
