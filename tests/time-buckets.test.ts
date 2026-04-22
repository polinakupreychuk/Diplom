import { describe, it, expect } from 'vitest'
import { getHourlyActivity, detectAnomalies, type Article } from '../lib/aggregation'

describe('Time Buckets - Hourly Activity', () => {
    it('should return exactly 24 buckets', () => {
        const result = getHourlyActivity([])
        expect(result).toHaveLength(24)
    })

    it('should format time correctly', () => {
        const result = getHourlyActivity([])
        result.forEach(bucket => {
            expect(bucket.time).toMatch(/^\d{2}:00$/)
        })
    })

    it('should have zero counts for empty input', () => {
        const result = getHourlyActivity([])
        result.forEach(bucket => {
            expect(bucket.total).toBe(0)
            expect(bucket.positive).toBe(0)
            expect(bucket.negative).toBe(0)
            expect(bucket.neutral).toBe(0)
        })
    })

    it('should count current hour articles correctly', () => {
        const articles: Article[] = [
            { id: '1', source: 'A', publishedAt: new Date(), sentiment: 'positive', entities: [], imageUrl: null },
            { id: '2', source: 'A', publishedAt: new Date(), sentiment: 'negative', entities: [], imageUrl: null },
        ]
        const result = getHourlyActivity(articles)
        const lastBucket = result[result.length - 1]
        expect(lastBucket.total).toBe(2)
        expect(lastBucket.positive).toBe(1)
        expect(lastBucket.negative).toBe(1)
    })

    it('should ignore articles older than 24 hours', () => {
        const oldDate = new Date()
        oldDate.setDate(oldDate.getDate() - 2)
        const articles: Article[] = [
            { id: '1', source: 'A', publishedAt: oldDate, sentiment: 'positive', entities: [], imageUrl: null }
        ]
        const result = getHourlyActivity(articles)
        const total = result.reduce((s, b) => s + b.total, 0)
        expect(total).toBe(0)
    })

    it('should count all three sentiment types', () => {
        const now = new Date()
        const articles: Article[] = [
            { id: '1', source: 'A', publishedAt: now, sentiment: 'positive', entities: [], imageUrl: null },
            { id: '2', source: 'A', publishedAt: now, sentiment: 'positive', entities: [], imageUrl: null },
            { id: '3', source: 'A', publishedAt: now, sentiment: 'neutral', entities: [], imageUrl: null },
            { id: '4', source: 'A', publishedAt: now, sentiment: 'negative', entities: [], imageUrl: null },
        ]
        const result = getHourlyActivity(articles)
        const lastBucket = result[result.length - 1]
        expect(lastBucket.positive).toBe(2)
        expect(lastBucket.neutral).toBe(1)
        expect(lastBucket.negative).toBe(1)
        expect(lastBucket.total).toBe(4)
    })
})

describe('Time Buckets - Anomaly Detection', () => {
    it('should not detect anomaly for empty articles', () => {
        const result = detectAnomalies([], 'Test')
        expect(result.detected).toBe(false)
    })

    it('should detect anomaly when volume exceeds threshold', () => {
        const articles: Article[] = Array.from({ length: 10 }, (_, i) => ({
            id: `${i}`,
            source: 'A',
            publishedAt: new Date(),
            sentiment: 'neutral' as const,
            entities: ['Test'],
            imageUrl: null
        }))
        const result = detectAnomalies(articles, 'Test', 2.5)
        expect(result.detected).toBe(true)
        if (result.detected) {
            expect(result.volume).toBe(10)
            expect(result.keyword).toBe('Test')
        }
    })

    it('should not detect anomaly when keyword does not match', () => {
        const articles: Article[] = Array.from({ length: 10 }, (_, i) => ({
            id: `${i}`,
            source: 'A',
            publishedAt: new Date(),
            sentiment: 'neutral' as const,
            entities: ['OtherKeyword'],
            imageUrl: null
        }))
        const result = detectAnomalies(articles, 'NonExistent', 2.5)
        expect(result.detected).toBe(false)
    })

    it('should be case insensitive for keyword matching', () => {
        const articles: Article[] = Array.from({ length: 10 }, (_, i) => ({
            id: `${i}`,
            source: 'A',
            publishedAt: new Date(),
            sentiment: 'neutral' as const,
            entities: ['НАТО'],
            imageUrl: null
        }))
        const result = detectAnomalies(articles, 'нато', 2.5)
        expect(result.detected).toBe(true)
    })

    it('should include change percentage when anomaly detected', () => {
        const articles: Article[] = Array.from({ length: 10 }, (_, i) => ({
            id: `${i}`,
            source: 'A',
            publishedAt: new Date(),
            sentiment: 'neutral' as const,
            entities: ['Test'],
            imageUrl: null
        }))
        const result = detectAnomalies(articles, 'Test', 2.5)
        if (result.detected) {
            expect(result.change).toMatch(/^\+\d+%$/)
        }
    })
})