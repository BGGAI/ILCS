from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from typing import List
import uuid
import os

from .models import KeywordRequest, TopicResponse, ArticleRequest, ArticleResponse, Article
from .services.openai_service import generate_topic_map, generate_article

app = FastAPI()

# Configure CORS - must be added before any routes
origins = [
    "https://ai-content-creation-app-2411p38i.devinapps.com",  # Production frontend
    "http://localhost:5173",  # Development frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/topics", response_model=TopicResponse)
async def analyze_keywords(request: KeywordRequest):
    try:
        topics, relationships = await generate_topic_map(request.keywords)
        return {"topics": topics, "relationships": relationships}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/articles", response_model=ArticleResponse)
async def generate_articles(request: ArticleRequest):
    try:
        articles = []
        for topic in request.topics:
            article_data = await generate_article(topic, request.insights)
            articles.append(Article(
                id=str(uuid.uuid4()),
                title=article_data["title"],
                content=article_data["content"],
                images=article_data["images"]
            ))
        return {"articles": articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
