import axios from 'axios';

export interface Topic {
  name: string;
  keywords: string[];
  relevanceScore: number;
  searchVolume: number;
  difficulty: number;
}

interface Relationship {
  source: string;
  target: string;
  strength: number;
}

export interface TopicResponse {
  topics: Topic[];
  relationships: Relationship[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
}

export interface ArticleResponse {
  articles: Article[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'  // FastAPI backend URL with Vite env var
});

export const generateTopicMap = async (keywords: string[]): Promise<TopicResponse> => {
  const response = await api.post('/topics', { keywords });
  return response.data;
};

export const generateArticles = async (topics: Topic[], insights: string): Promise<ArticleResponse> => {
  const response = await api.post('/articles', { topics, insights });
  return response.data;
};
