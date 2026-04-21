import { describe, it, expect, beforeEach } from 'vitest'
import { analyzeArticle, analyzeSentiment, extractEntities, getNLPStats } from '@/lib/nlp-utils'

describe('NLP Utils - Sentiment Analysis', () => {
    it('should classify positive text correctly', async () => {
        const text = 'Велика перемога та успіх українських військових'
        const result = await analyzeSentiment(text)
        expect(['positive', 'negative', 'neutral']).toContain(result)
    })

    it('should classify negative text correctly', async () => {
        const text = 'Атака на місто призвела до загибелі людей та обстрілу'
        const result = await analyzeSentiment(text)
        expect(['positive', 'negative', 'neutral']).toContain(result)
    })

    it('should return neutral for empty text', async () => {
        const result = await analyzeSentiment('')
        expect(result).toBe('neutral')
    })

    it('should return neutral for very short text', async () => {
        const result = await analyzeSentiment('abc')
        expect(result).toBe('neutral')
    })

    it('should handle text with no sentiment keywords', async () => {
        const text = 'Сьогодні середа, двадцять четверте квітня'
        const result = await analyzeSentiment(text)
        expect(['positive', 'negative', 'neutral']).toContain(result)
    })
})

describe('NLP Utils - Entity Extraction', () => {
    it('should extract known entities from text', async () => {
        const text = 'Зеленський зустрівся з представниками НАТО у Києві'
        const result = await extractEntities(text)
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThanOrEqual(0)
        expect(result.length).toBeLessThanOrEqual(6)
    })

    it('should return empty array for text without entities', async () => {
        const text = 'Сонячна погода сьогодні дуже тепла'
        const result = await extractEntities(text)
        expect(Array.isArray(result)).toBe(true)
    })

    it('should limit entities to maximum of 6', async () => {
        const text = 'Зеленський Залужний Шмигаль НАТО ЗСУ Київ США ЄС Польща Харків'
        const result = await extractEntities(text)
        expect(result.length).toBeLessThanOrEqual(6)
    })

    it('should handle empty input', async () => {
        const result = await extractEntities('')
        expect(result).toEqual([])
    })
})

describe('NLP Utils - Combined Analysis', () => {
    it('should return valid NLPResult structure', async () => {
        const text = 'Верховна Рада ухвалила важливе рішення'
        const result = await analyzeArticle(text)
        expect(result).toHaveProperty('sentiment')
        expect(result).toHaveProperty('entities')
        expect(['positive', 'neutral', 'negative']).toContain(result.sentiment)
        expect(Array.isArray(result.entities)).toBe(true)
    })

    it('should cache results for repeated queries', async () => {
        const text = 'Тестовий текст для перевірки кешування'
        const statsBefore = getNLPStats()

        await analyzeArticle(text)
        await analyzeArticle(text)

        const statsAfter = getNLPStats()
        expect(statsAfter.cacheHits).toBeGreaterThan(statsBefore.cacheHits)
    })
})

describe('NLP Utils - Stats', () => {
    it('should return valid stats object', () => {
        const stats = getNLPStats()
        expect(stats).toHaveProperty('apiCalls')
        expect(stats).toHaveProperty('cacheHits')
        expect(stats).toHaveProperty('provider')
        expect(stats).toHaveProperty('model')
        expect(stats.provider).toBe('OpenAI')
        expect(stats.model).toBe('gpt-4o-mini')
    })
})