'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Entity {
  name: string
  type: string
}

export interface ImageAnalysis {
  tags: string[]
  detectedObjects: Array<{ label: string; confidence: number }>
  hasText: boolean
  dominantColors: string[]
}

export interface Article {
  id: string
  source: string
  initials: string
  color: string
  title: string
  excerpt: string
  url: string
  publishedAt: string
  sentiment: 'positive' | 'neutral' | 'negative'
  entities: Entity[]
  imageUrl: string | null
  imageAnalysis: ImageAnalysis | null
}

interface UseArticlesReturn {
  articles: Article[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export function useArticles(): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchArticles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/feeds')
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        setArticles(data)
        setLastUpdated(new Date())
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching articles:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
    
    const interval = setInterval(fetchArticles, 60000)
    
    return () => clearInterval(interval)
  }, [fetchArticles])

  return {
    articles,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchArticles,
  }
}
