"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Topic } from "@/lib/api";
import { LoadingSpinner } from "../ui/loading";

interface InsightInputProps {
  topics: Topic[];
  onSubmit: (insights: string) => Promise<void>;
  isLoading?: boolean;
}

export default function InsightInput({ topics, onSubmit, isLoading = false }: InsightInputProps) {
  const [insights, setInsights] = React.useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInsights = insights.trim();

    if (!trimmedInsights) {
      toast({
        title: "Error",
        description: "Please enter your insights",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(trimmedInsights);
      toast({
        title: "Success",
        description: "Articles are being generated",
        variant: "default",
      });
      setInsights(""); // Clear input after successful submission
    } catch (error) {
      toast({
        title: "Error generating articles",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const topicsList = topics.map(t => t.name).join(", ");
  const placeholderText = `Share your industry insights about ${topicsList}. For example:
- Key trends and developments in these areas
- Common challenges and their solutions
- Best practices and recommendations
- Market dynamics and competition
- Your unique perspective on these topics`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Your Insights</CardTitle>
        <CardDescription>
          Your expertise will help generate more accurate and relevant content about: {topicsList}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder={placeholderText}
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              disabled={isLoading}
              className="min-h-32"
            />
          </div>
          <Button type="submit" disabled={isLoading || !insights.trim()} className="w-full">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>Generating Articles...</span>
              </div>
            ) : (
              "Generate Articles"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
