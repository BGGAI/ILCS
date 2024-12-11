import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import natural from "natural";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const tokenizer = new natural.WordTokenizer();
const tfidf = new natural.TfIdf();

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "Keywords must be a non-empty array" },
        { status: 400 }
      );
    }

    // Generate topic map using OpenAI
    const prompt = `Analyze these keywords and generate a comprehensive topic map with related topics, their relationships, and SEO metrics:
    Keywords: ${keywords.join(", ")}

    Format the response as JSON with the following structure:
    {
      "topics": [
        {
          "name": "topic name",
          "keywords": ["related", "keywords"],
          "relevanceScore": 0.0-1.0,
          "searchVolume": estimated monthly searches,
          "difficulty": 0.0-1.0
        }
      ],
      "relationships": [
        {
          "source": "topic1",
          "target": "topic2"
        }
      ]
    }`;

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const topicMap = JSON.parse(completion.data.choices[0].text);

    // Store topics in database
    for (const topic of topicMap.topics) {
      await prisma.topic.create({
        data: {
          name: topic.name,
          keywords: topic.keywords,
          relevanceScore: topic.relevanceScore,
          searchVolume: topic.searchVolume,
          difficulty: topic.difficulty,
        },
      });
    }

    return NextResponse.json(topicMap);
  } catch (error) {
    console.error("Error generating topic map:", error);
    return NextResponse.json(
      { error: "Failed to generate topic map" },
      { status: 500 }
    );
  }
}
