import { useState } from 'react'
import KeywordInput from './components/topics/KeywordInput'
import TopicMap from './components/topics/TopicMap'
import InsightInput from './components/articles/InsightInput'
import ArticleDisplay from './components/articles/ArticleDisplay'

// Mock data for testing UI components
const mockTopicData = {
  topics: [
    {
      name: "AI Applications",
      keywords: ["artificial intelligence", "machine learning"],
      relevanceScore: 0.9,
      searchVolume: 80,
      difficulty: 0.7
    },
    {
      name: "Deep Learning",
      keywords: ["neural networks", "deep learning"],
      relevanceScore: 0.8,
      searchVolume: 60,
      difficulty: 0.8
    }
  ],
  relationships: [
    { source: "AI Applications", target: "Deep Learning" }
  ]
}

const mockArticles = [
  {
    id: "1",
    title: "The Future of AI Applications in Business",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    images: [{ url: "https://via.placeholder.com/400x300", alt: "AI Business Applications" }]
  }
]

function App() {
  const [topicData, setTopicData] = useState(mockTopicData)
  const [articles, setArticles] = useState(mockArticles)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnalyze = async (keywords: string[]) => {
    setIsLoading(true)
    console.log('Analyzing keywords:', keywords)
    // Mock API call
    setTimeout(() => {
      setTopicData(mockTopicData)
      setIsLoading(false)
    }, 1000)
  }

  const handleInsightSubmit = async (insights: string) => {
    setIsLoading(true)
    console.log('Processing insights:', insights)
    // Mock API call
    setTimeout(() => {
      setArticles(mockArticles)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Content Creation Platform</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Enter Keywords</h2>
          <KeywordInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {topicData && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Topic Map</h2>
            <TopicMap topics={topicData.topics} relationships={topicData.relationships} />
          </section>
        )}

        {topicData && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Add Insights</h2>
            <InsightInput onSubmit={handleInsightSubmit} isLoading={isLoading} />
          </section>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Generated Articles</h2>
            <ArticleDisplay articles={articles} />
          </section>
        )}
      </div>
    </div>
  )
}

export default App
