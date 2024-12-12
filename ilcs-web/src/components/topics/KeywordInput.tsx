"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading";

interface KeywordInputProps {
  onAnalyze: (keywords: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function KeywordInput({ onAnalyze, isLoading = false }: KeywordInputProps) {
  const [keywords, setKeywords] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordList.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one keyword",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAnalyze(keywordList);
      toast({
        title: "Topics generated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast({
        title: "Using mock data for demonstration",
        description: "API connection failed",
        variant: "default",
      });
      // Retry with mock data fallback
      try {
        await onAnalyze(keywordList);
      } catch (secondError) {
        console.error('Error with mock data fallback:', secondError);
        toast({
          title: "Error",
          description: "Failed to generate topics. Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Industry Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Enter keywords separated by commas (e.g., artificial intelligence, machine learning)"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>Analyzing...</span>
              </div>
            ) : (
              "Generate Topic Map"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
