"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface KeywordInputProps {
  onAnalyze: (keywords: string[]) => void;
  isLoading?: boolean;
}

export default function KeywordInput({ onAnalyze, isLoading = false }: KeywordInputProps) {
  const [keywords, setKeywords] = useState<string>("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
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

    onAnalyze(keywordList);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Enter Industry Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter keywords separated by commas (e.g., artificial intelligence, machine learning)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing..." : "Generate Topic Map"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
