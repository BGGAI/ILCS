from pydantic import BaseModel
from typing import List, Optional

class Topic:
    def __init__(self, name: str, keywords: List[str], relevance_score: float, search_volume: int, difficulty: float):
        self.name = name
        self.keywords = keywords
        self.relevance_score = relevance_score
        self.search_volume = search_volume
        self.difficulty = difficulty

class TopicRelation:
    def __init__(self, source: str, target: str):
        self.source = source
        self.target = target

class KeywordRequest(BaseModel):
    keywords: List[str]

class TopicResponse(BaseModel):
    topics: List[dict]
    relationships: List[dict]

class ArticleRequest(BaseModel):
    topics: List[dict]
    insights: str

class Image(BaseModel):
    url: str
    alt: str

class Article(BaseModel):
    id: str
    title: str
    content: str
    images: List[Image]

class ArticleResponse(BaseModel):
    articles: List[Article]
