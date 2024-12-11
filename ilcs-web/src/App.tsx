"use client";

import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import KeywordInput from '@/components/topics/KeywordInput';
import TopicMap from '@/components/topics/TopicMap';
import InsightInput from '@/components/articles/InsightInput';
import ArticleDisplay from '@/components/articles/ArticleDisplay';
import { Topic, Article, generateArticles } from '@/lib/api';

interface TopicData {
  topics: Topic[];
  relationships: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
}

function App() {
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicsGenerated = (result: TopicData) => {
    setIsLoading(false);
    setTopicData(result);
  };

  const handleInsightSubmit = async (insights: string) => {
    if (!topicData) return;

    setIsLoading(true);
    try {
      const result = await generateArticles(topicData.topics, insights);
      setArticles(result.articles);
    } catch (error) {
      console.error('Error generating articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Content Creation Platform</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Enter Keywords</h2>
          <KeywordInput
            onTopicsGenerated={handleTopicsGenerated}
            isLoading={isLoading}
          />
        </section>

        {topicData && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Topic Map</h2>
            <TopicMap
              topics={topicData.topics}
              relationships={topicData.relationships}
            />
          </section>
        )}

        {topicData && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Add Insights</h2>
            <InsightInput
              topics={topicData.topics}
              onSubmit={handleInsightSubmit}
              isLoading={isLoading}
            />
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Generated Articles</h2>
            <ArticleDisplay articles={articles} />
          </section>
        )}
      </div>

      <Toaster />
    </div>
  );
}

export default App;
