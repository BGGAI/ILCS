from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg
from typing import List
import uuid

from .models import KeywordRequest, TopicResponse, ArticleRequest, ArticleResponse, Article
from .services.openai_service import generate_topic_map, generate_article

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
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
