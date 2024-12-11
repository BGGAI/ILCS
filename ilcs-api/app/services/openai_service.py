from openai import OpenAI
from typing import List, Tuple, Dict
import json
import os
from ..config import get_settings

settings = get_settings()
USE_MOCK = not settings.openai_api_key or os.getenv('USE_MOCK', '').lower() == 'true'

# Mock data for development and testing
MOCK_TOPIC_MAP = {
    "topics": [
        {
            "name": "Artificial Intelligence",
            "keywords": ["AI", "machine learning", "neural networks"],
            "relevanceScore": 0.9,
            "searchVolume": 85,
            "difficulty": 0.7
        },
        {
            "name": "Machine Learning",
            "keywords": ["ML", "deep learning", "algorithms"],
            "relevanceScore": 0.8,
            "searchVolume": 75,
            "difficulty": 0.6
        }
    ],
    "relationships": [
        {
            "source": "Artificial Intelligence",
            "target": "Machine Learning",
            "strength": 0.9
        }
    ]
}

MOCK_ARTICLE = {
    "title": "The Future of AI in Business",
    "content": """
Artificial Intelligence is revolutionizing the way businesses operate in the modern world.
From automated customer service to predictive analytics, AI technologies are creating new
opportunities for innovation and growth.

Machine learning algorithms, a subset of AI, are particularly valuable in processing large
amounts of data and extracting meaningful insights. These insights help businesses make
better decisions and improve their operations.
    """.strip(),
    "images": [{
        "url": "https://via.placeholder.com/1024x1024",
        "alt": "AI Business Integration Concept"
    }]
}

client = OpenAI(api_key=settings.openai_api_key) if not USE_MOCK else None

async def generate_topic_map(keywords: List[str]) -> Tuple[List[Dict], List[Dict]]:
    if USE_MOCK:
        return MOCK_TOPIC_MAP["topics"], MOCK_TOPIC_MAP["relationships"]

    prompt = f"""Analyze these keywords and create a topic map: {', '.join(keywords)}
    Generate a comprehensive analysis including:
    1. Main topics and subtopics
    2. Relevance scores (0-1)
    3. Estimated search volume (1-100)
    4. SEO difficulty (0-1)
    5. Related keywords
    Format as JSON with 'topics' and 'relationships' arrays."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a SEO expert analyzing keywords and generating topic maps."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result["topics"], result["relationships"]
    except Exception as e:
        print(f"Error generating topic map: {str(e)}")
        raise

async def generate_article(topic: Dict, insights: str) -> Dict:
    if USE_MOCK:
        return MOCK_ARTICLE

    prompt = f"""Create an SEO-optimized article about {topic['name']}.
    Use these keywords: {', '.join(topic['keywords'])}
    Consider these insights: {insights}
    Make it engaging and informative for the target audience.
    Include a title and content."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert content writer creating SEO-optimized articles."},
                {"role": "user", "content": prompt}
            ]
        )

        # Generate image prompt based on the article content
        image_prompt = f"Create a professional, relevant image for an article about {topic['name']}"
        image_response = await client.images.generate(
            model="dall-e-3",
            prompt=image_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        article_content = response.choices[0].message.content
        # Parse title and content from the generated text
        lines = article_content.split('\n')
        title = lines[0].strip('#').strip()
        content = '\n'.join(lines[2:])

        return {
            "title": title,
            "content": content,
            "images": [{"url": image_response.data[0].url, "alt": f"Image for {title}"}]
        }
    except Exception as e:
        print(f"Error generating article: {str(e)}")
        raise
