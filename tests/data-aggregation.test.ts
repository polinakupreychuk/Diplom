import { describe, it, expect } from 'vitest'
import {
    getTopEntities,
    getSentimentStats,
    getSourceBreakdown,
    getImageStats,
    filterByKeyword,
    getDailyTrend,
    type Article
} from '../lib/aggregation'

const mockArticles: Article[] = [
    { id: '1', source: 'A', sentiment: 'positive', entities: ['Зеленський', 'НАТО'], publishedAt: new Date(), imageUrl: 'url1' },
    { id: '2', source: 'B', sentiment: 'negative', entities: ['Зеленський', 'Київ'], publishedAt: new Date(), imageUrl: null },
    { id: '3', source: 'A', sentiment: 'neutral', entities: ['НАТО', 'США'], publishedAt: new Date(), imageUrl: 'url3' },
    { id: '4', source: 'A', sentiment: 'positive', entities: [], publishedAt: new Date(), imageUrl: null },
]

describe('Aggregation - Top Entities', () => {
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

    it('should handle articles with no entities', () => {
        const articles: Article[] = [
            { id: '1', source: 'A', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: null }
        ]
        expect(getTopEntities(articles)).toEqual([])
    })
})

describe('Aggregation - Sentiment Stats', () => {
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

    it('should sum to approximately 100', () => {
        const result = getSentimentStats(mockArticles)
        const sum = result.positive + result.neutral + result.negative
        expect(sum).toBeGreaterThanOrEqual(99)
        expect(sum).toBeLessThanOrEqual(101)
    })
})

describe('Aggregation - Source Breakdown', () => {
    it('should count articles per source', () => {
        const result = getSourceBreakdown(mockArticles)
        expect(result[0].name).toBe('A')
        expect(result[0].count).toBe(3)
        expect(result[1].name).toBe('B')
        expect(result[1].count).toBe(1)
    })

    it('should return empty array for no articles', () => {
        expect(getSourceBreakdown([])).toEqual([])
    })

    it('should sort by count descending', () => {
        const result = getSourceBreakdown(mockArticles)
        for (let i = 1; i < result.length; i++) {
            expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count)
        }
    })
})

describe('Aggregation - Image Stats', () => {
    it('should count articles with and without images', () => {
        const result = getImageStats(mockArticles)
        expect(result.withImage).toBe(2)
        expect(result.withoutImage).toBe(2)
        expect(result.percentage).toBe(50)
    })

    it('should return 0 percentage for empty articles', () => {
        const result = getImageStats([])
        expect(result.percentage).toBe(0)
        expect(result.withImage).toBe(0)
    })

    it('should return 100 when all have images', () => {
        const articles: Article[] = [
            { id: '1', source: 'A', sentiment: 'neutral', entities: [], publishedAt: new Date(), imageUrl: 'url' }
        ]
        expect(getImageStats(articles).percentage).toBe(100)
    })
})

describe('Aggregation - Filter by Keyword', () => {
    it('should filter by entity name', () => {
        const result = filterByKeyword(mockArticles, 'Зеленський')
        expect(result.length).toBe(2)
    })

    it('should filter by source', () => {
        const result = filterByKeyword(mockArticles, 'A')
        expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('should be case insensitive', () => {
        const upper = filterByKeyword(mockArticles, 'НАТО')
        const lower = filterByKeyword(mockArticles, 'нато')
        expect(lower.length).toBe(upper.length)
    })

    it('should return all articles for empty keyword', () => {
        const result = filterByKeyword(mockArticles, '')
        expect(result.length).toBe(mockArticles.length)
    })
})

describe('Aggregation - Daily Trend', () => {
    it('should return array of correct length', () => {
        const result = getDailyTrend(mockArticles, 7)
        expect(result).toHaveLength(7)
    })

    it('should default to 7 days', () => {
        const result = getDailyTrend(mockArticles)
        expect(result).toHaveLength(7)
    })

    it('should return zeros for empty articles', () => {
        const result = getDailyTrend([], 5)
        expect(result).toEqual([0, 0, 0, 0, 0])
    })
})