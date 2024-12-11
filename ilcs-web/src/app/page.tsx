"use client";

import React from "react";
import KeywordInput from "@/components/topics/KeywordInput";
import TopicMap from "@/components/topics/TopicMap";
import InsightInput from "@/components/articles/InsightInput";
import ArticleDisplay from "@/components/articles/ArticleDisplay";

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
  }>({ topics: [], relationships: [] });
  const [articles, setArticles] = React.useState<Article[]>([]);

  const handleAnalyze = async (keywords: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await response.json();
      setTopicData(data);
    } catch (error) {
      console.error("Error analyzing keywords:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightSubmit = async (insights: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: topicData.topics,
          insights,
        }),
      });
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error("Error generating articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-8">AI Content Creation Platform</h1>
      <div className="grid gap-8">
        <KeywordInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        {topicData.topics.length > 0 && (
          <>
            <TopicMap
              topics={topicData.topics}
              relationships={topicData.relationships}
            />
            <InsightInput onSubmit={handleInsightSubmit} isLoading={isLoading} />
          </>
        )}
        {articles.length > 0 && <ArticleDisplay articles={articles} />}
      </div>
    </main>
  );
}
