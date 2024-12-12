"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface Article {
  id: string;
  title: string;
  content: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
}

interface ArticleDisplayProps {
  articles: Article[];
}

export default function ArticleDisplay({ articles }: ArticleDisplayProps) {
  return (
    <div className="grid gap-6">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {article.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={article.images[0].url}
                    alt={article.images[0].alt}
                    className="w-full rounded-lg"
                  />
                </div>
              )}
              <div className="whitespace-pre-wrap">{article.content}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
