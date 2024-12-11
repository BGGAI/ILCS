"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InsightInputProps {
  onSubmit: (insights: string) => void;
  isLoading?: boolean;
}

export default function InsightInput({ onSubmit, isLoading = false }: InsightInputProps) {
  const [insights, setInsights] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (insights.trim()) {
      onSubmit(insights.trim());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Your Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Share your industry insights to enhance the generated content..."
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
            disabled={isLoading}
            className="min-h-32"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Add Insights"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
