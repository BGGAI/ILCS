export const mockTopicData = {
  topics: [
    {
      name: "Artificial Intelligence",
      keywords: ["AI", "machine learning", "neural networks"],
      relevanceScore: 0.9,
      searchVolume: 85,
      difficulty: 0.7,
    },
    {
      name: "Machine Learning",
      keywords: ["ML", "deep learning", "algorithms"],
      relevanceScore: 0.8,
      searchVolume: 75,
      difficulty: 0.6,
    },
    {
      name: "Deep Learning",
      keywords: ["neural networks", "CNN", "RNN"],
      relevanceScore: 0.7,
      searchVolume: 65,
      difficulty: 0.8,
    },
  ],
  relationships: [
    { source: "Artificial Intelligence", target: "Machine Learning" },
    { source: "Machine Learning", target: "Deep Learning" },
    { source: "Artificial Intelligence", target: "Deep Learning" },
  ],
};

export const mockArticles = [
  {
    id: "1",
    title: "The Future of AI in Business",
    content: "Artificial Intelligence is transforming the way businesses operate...",
    images: [
      {
        url: "https://via.placeholder.com/800x400",
        alt: "AI Business Integration",
      },
    ],
  },
];
