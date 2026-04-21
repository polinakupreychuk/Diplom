import { describe, it, expect } from 'vitest'

interface Article {
    publishedAt: Date
    sentiment: 'positive' | 'neutral' | 'negative'
}

function getHourlyActivity(articles: Article[]) {
    const now = new Date()
    return Array.from({ length: 24 }, (_, i) => {
        const hourStart = new Date(now)
        hourStart.setHours(now.getHours() - (23 - i), 0, 0, 0)
        const hourEnd = new Date(hourStart)
        hourEnd.setHours(hourEnd.getHours() + 1)

        const inBucket = articles.filter(a => {
            const t = new Date(a.publishedAt).getTime()
            return t >= hourStart.getTime() && t < hourEnd.getTime()
        })

        return {
            time: `${hourStart.getHours().toString().padStart(2, '0')}:00`,
            total: inBucket.length,
            positive: inBucket.filter(a => a.sentiment === 'positive').length,
            negative: inBucket.filter(a => a.sentiment === 'negative').length,
        }
    })
}

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
        })
    })

    it('should count current hour articles correctly', () => {
        const articles: Article[] = [
            { publishedAt: new Date(), sentiment: 'positive' },
            { publishedAt: new Date(), sentiment: 'negative' },
        ]
        const result = getHourlyActivity(articles)
        const lastBucket = result[result.length - 1]
        expect(lastBucket.total).toBe(2)
    })
})