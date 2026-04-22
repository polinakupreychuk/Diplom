export interface Article {
    id: string
    source: string
    sentiment: 'positive' | 'neutral' | 'negative'
    entities: string[]
    publishedAt: Date | string
    imageUrl: string | null
    color?: string
}

export function getTopEntities(articles: Article[], limit = 8) {
    const counts: Record<string, number> = {}
    articles.forEach(a =>
        a.entities.forEach(e => counts[e] = (counts[e] || 0) + 1)
    )
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

export function getSentimentStats(articles: Article[]) {
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

export function getSourceBreakdown(articles: Article[]) {
    const counts: Record<string, number> = {}
    articles.forEach(a => counts[a.source] = (counts[a.source] || 0) + 1)
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
}

export function getHourlyActivity(articles: Article[]) {
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
            neutral: inBucket.filter(a => a.sentiment === 'neutral').length,
            negative: inBucket.filter(a => a.sentiment === 'negative').length,
        }
    })
}

export function getImageStats(articles: Article[]) {
    const withImage = articles.filter(a => a.imageUrl).length
    const total = articles.length
    return {
        withImage,
        withoutImage: total - withImage,
        percentage: total === 0 ? 0 : Math.round(withImage / total * 100)
    }
}

export function filterByKeyword(articles: Article[], keyword: string) {
    if (!keyword) return articles
    const lower = keyword.toLowerCase()
    return articles.filter(a =>
        a.entities.some(e => e.toLowerCase().includes(lower)) ||
        a.source.toLowerCase().includes(lower)
    )
}

export function getDailyTrend(articles: Article[], days = 7) {
    return Array.from({ length: days }, (_, i) => {
        const day = new Date()
        day.setDate(day.getDate() - (days - 1 - i))
        day.setHours(0, 0, 0, 0)
        const next = new Date(day)
        next.setDate(next.getDate() + 1)
        return articles.filter(a => {
            const t = new Date(a.publishedAt).getTime()
            return t >= day.getTime() && t < next.getTime()
        }).length
    })
}

export function detectAnomalies(articles: Article[], keyword: string, threshold = 2.5) {
    const hourly = getHourlyActivity(articles.filter(a =>
        a.entities.some(e => e.toLowerCase().includes(keyword.toLowerCase()))
    ))
    const values = hourly.map(h => h.total)
    const avg = values.reduce((s, v) => s + v, 0) / values.length
    const max = Math.max(...values)
    if (max >= 3 && max > avg * threshold) {
        const maxIndex = values.indexOf(max)
        return {
            detected: true,
            keyword,
            time: hourly[maxIndex].time,
            volume: max,
            change: `+${Math.round((max / (avg || 1) - 1) * 100)}%`
        }
    }
    return { detected: false }
}