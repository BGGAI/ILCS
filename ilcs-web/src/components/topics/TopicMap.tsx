"use client";

import React from "react";
import ForceGraph2D from "react-force-graph-2d";

interface TopicMapProps {
  topics: Array<{
    name: string;
    keywords: string[];
    relevanceScore: number;
    searchVolume: number;
    difficulty: number;
  }>;
  relationships: Array<{
    source: string;
    target: string;
  }>;
}

export default function TopicMap({ topics, relationships }: TopicMapProps) {
  const graphData = {
    nodes: topics.map((topic) => ({
      id: topic.name,
      val: topic.relevanceScore * 10,
      color: `hsl(${topic.difficulty * 360}, 70%, 50%)`,
      label: topic.name,
    })),
    links: relationships.map((rel) => ({
      source: rel.source,
      target: rel.target,
    })),
  };

  return (
    <div className="w-full aspect-video border rounded-lg bg-white shadow-sm">
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeRelSize={6}
        linkWidth={1}
        linkColor="#999"
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.label;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, node.x, node.y);
        }}
      />
    </div>
  );
}
