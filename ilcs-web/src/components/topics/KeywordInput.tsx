"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface KeywordInputProps {
  onAnalyze: (keywords: string[]) => void;
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
      // For testing UI without backend
      if (!process.env.NEXT_PUBLIC_API_URL) {
        toast({
          title: "Development Mode",
          description: "Using mock data for testing",
        });
        onAnalyze(keywordList);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: keywordList }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze keywords");
      }

      const result = await response.json();
      onAnalyze(result.topics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze keywords. Please try again later.",
        variant: "destructive",
      });
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
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Generate Topic Map"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
