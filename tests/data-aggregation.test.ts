import { describe, it, expect } from 'vitest'

interface Article {
    id: string
    source: string
    sentiment: 'positive' | 'neutral' | 'negative'
    entities: string[]
    publishedAt: Date
    imageUrl: string | null
}

function getTopEntities(articles: Article[], limit = 8) {
    const counts: Record<string, number> = {}
    articles.forEach(a =>
        a.entities.forEach(e => counts[e] = (counts[e] || 0) + 1)
    )
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

function getSentimentStats(articles: Article[]) {
    if (articles.length === 0) return { positive: 0, neutral: 0, negative: 0 }
    const pos = articles.filter(a => a.sentiment === 'positive').length
    const neu = articles.filter(a => a.sentiment === 'neutral').length
    const neg = articles.filter(a => a.sentiment === 'negative').length
    const total = articles.length
    return {
        positive: Math.round(pos / total * 100),
        neutral: Math.round(neu / total * 100),
        negative: Math.round(neg / total * 100),
    }
}

function getSourceBreakdown(articles: Article[]) {
    const counts: Record<string, number> = {}
    articles.forEach(a => counts[a.source] = (counts[a.source] || 0) + 1)
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
}

describe('Data Aggregation - Top Entities', () => {
    const mockArticles: Article[] = [
        { id: '1', source: 'A', sentiment: 'positive', entities: ['Зеленський', 'НАТО'], publishedAt: new Date(), imageUrl: null },
        { id: '2', source: 'B', sentiment: 'negative', entities: ['Зеленський', 'Київ'], publishedAt: new Date(), imageUrl: null },
        { id: '3', source: 'A', sentiment: 'neutral', entities: ['НАТО', 'США'], publishedAt: new Date(), imageUrl: null },
    ]

    it('should count entity occurrences correctly', () => {
        const result = getTopEntities(mockArticles)
        expect(result[0].name).toBe('Зеленський')
        expect(result[0].count).toBe(2)
    })

    it('should return entities sorted by count descending', () => {
        const result = getTopEntities(mockArticles)
        for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count)
        }
    })

    it('should respect the limit parameter', () => {
        const result = getTopEntities(mockArticles, 2)
        expect(result.length).toBeLessThanOrEqual(2)
    })

    it('should return empty array for empty input', () => {
        expect(getTopEntities([])).toEqual([])
    })
})

describe('Data Aggregation - Sentiment Stats', () => {
    it('should return zero stats for empty articles', () => {
        const result = getSentimentStats([])
        expect(result).toEqual({ positive: 0, neutral: 0, negative: 0 })
    })

    it('should calculate percentages correctly', () => {
        const articles: Article[] = [
            { id: '1', source: 'A', sentiment: 'positive', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '2', source: 'A', sentiment: 'negative', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '3', source: 'A', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '4', source: 'A', sentiment: 'positive', entities: [], publishedAt: new Date(), imageUrl: null },
        ]
        const result = getSentimentStats(articles)
        expect(result.positive).toBe(50)
        expect(result.negative).toBe(25)
        expect(result.neutral).toBe(25)
    })

    it('should handle all-positive articles', () => {
        const articles: Article[] = [
            { id: '1', source: 'A', sentiment: 'positive', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '2', source: 'A', sentiment: 'positive', entities: [], publishedAt: new Date(), imageUrl: null },
        ]
        const result = getSentimentStats(articles)
        expect(result.positive).toBe(100)
        expect(result.negative).toBe(0)
    })
})

describe('Data Aggregation - Source Breakdown', () => {
    it('should count articles per source', () => {
        const articles: Article[] = [
            { id: '1', source: 'Джерело А', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '2', source: 'Джерело А', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: null },
            { id: '3', source: 'Джерело Б', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: null },
        ]
        const result = getSourceBreakdown(articles)
        expect(result[0].name).toBe('Джерело А')
        expect(result[0].count).toBe(2)
        expect(result[1].name).toBe('Джерело Б')
        expect(result[1].count).toBe(1)
    })

    it('should return empty array for no articles', () => {
        expect(getSourceBreakdown([])).toEqual([])
    })
})