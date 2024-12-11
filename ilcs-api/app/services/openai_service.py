from openai import OpenAI
from typing import List, Tuple, Dict
import json
from ..config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

async def generate_topic_map(keywords: List[str]) -> Tuple[List[Dict], List[Dict]]:
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
