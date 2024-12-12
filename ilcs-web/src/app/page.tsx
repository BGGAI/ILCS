"use client";

import React from "react";
import KeywordInput from "@/components/topics/KeywordInput";
import TopicMap from "@/components/topics/TopicMap";
import InsightInput from "@/components/articles/InsightInput";
import ArticleDisplay from "@/components/articles/ArticleDisplay";
import { mockTopicData, mockArticles } from "@/mocks/topicData";
import { generateTopicMap, generateArticles } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
}

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [topicData, setTopicData] = React.useState<{
    topics: any[];
    relationships: any[];
  } | null>(null);
  const [articles, setArticles] = React.useState<Article[]>([]);

  const handleAnalyze = async (keywords: string[]) => {
    setIsLoading(true);
    try {
      const result = await generateTopicMap(keywords);
      setTopicData(result);
      setIsLoading(false);
    } catch (error) {
      console.error("Error analyzing keywords:", error);
      // Fallback to mock data on error
      setTopicData(mockTopicData);
      setIsLoading(false);
    }
  };

  const handleInsightSubmit = async (insights: string) => {
    setIsLoading(true);
    try {
      const result = await generateArticles(topicData?.topics || [], insights);
      setArticles(result.articles);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating articles:", error);
      // Fallback to mock data on error
      setArticles(mockArticles);
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-8">AI Content Creation Platform</h1>
      <div className="grid gap-8">
        <KeywordInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        {topicData && (
          <>
            <TopicMap
              topics={topicData.topics}
              relationships={topicData.relationships}
            />
            <InsightInput topics={topicData.topics} onSubmit={handleInsightSubmit} isLoading={isLoading} />
          </>
        )}
        {articles.length > 0 && <ArticleDisplay articles={articles} />}
      </div>
    </main>
  );
}
