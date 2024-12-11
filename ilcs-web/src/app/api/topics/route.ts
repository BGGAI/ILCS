import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const topicMap = JSON.parse(completion.choices[0].text);

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
