// Hugging Face Inference API utilities for multilingual NLP
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY
const HF_API_URL = 'https://api-inference.huggingface.co/models'

const nlpCache = new Map<string, { result: unknown; timestamp: number }>()
const CACHE_TTL = 3600000

function getCacheKey(text: string, task: string): string {
  const hash = text.slice(0, 100).replace(/\s+/g, '_')
  return `${task}:${hash}`
}

function getCachedResult(text: string, task: string): unknown | null {
  const key = getCacheKey(text, task)
  const cached = nlpCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.result
  if (cached) nlpCache.delete(key)
  return null
}

function setCachedResult(text: string, task: string, result: unknown): void {
  const key = getCacheKey(text, task)
  nlpCache.set(key, { result, timestamp: Date.now() })
}

interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number
}

interface EntityToken {
  entity_group: string
  score: number
  word: string
  start: number
  end: number
}

async function classifySentiment(text: string): Promise<SentimentResult | null> {
  if (!HF_API_KEY) return null
  const cached = getCachedResult(text, 'sentiment')
  if (cached) return cached as SentimentResult
  try {
    const response = await fetch(`${HF_API_URL}/tabularisai/multilingual-sentiment-analysis`, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({ inputs: text.slice(0, 512) }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as Array<Array<{ label: string; score: number }>>
    if (!data || !data[0] || data[0].length === 0) return null
    const topResult = data[0].reduce((best, current) => current.score > best.score ? current : best)
    const label = topResult.label.toLowerCase()
    const mappedLabel: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' =
        label === 'positive' || label === 'very positive' ? 'POSITIVE' :
            label === 'negative' || label === 'very negative' ? 'NEGATIVE' : 'NEUTRAL'
    const result: SentimentResult = { label: mappedLabel, score: topResult.score }
    setCachedResult(text, 'sentiment', result)
    return result
  } catch { return null }
}

async function extractEntitiesNLP(text: string): Promise<Array<{ name: string; type: string; confidence: number }> | null> {
  if (!HF_API_KEY) return null
  const cached = getCachedResult(text, 'entities')
  if (cached) return cached as Array<{ name: string; type: string; confidence: number }>
  try {
    const response = await fetch(`${HF_API_URL}/Davlan/xlm-roberta-base-ner-hrl`, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({ inputs: text.slice(0, 512) }),
    })
    if (!response.ok) return null
    const entityTokens = (await response.json()) as EntityToken[]
    const validTypes = ['PER', 'ORG', 'LOC']
    const entities: Array<{ name: string; type: string; confidence: number }> = []
    for (const token of entityTokens) {
      if (validTypes.includes(token.entity_group) && token.score > 0.85 && token.word.trim().length > 1) {
        const cleanWord = token.word.replace(/^##/, '').replace(/▁/g, '').trim()
        if (cleanWord.length > 1) entities.push({ name: cleanWord, type: token.entity_group, confidence: token.score })
      }
    }
    const seen = new Set<string>()
    const deduped = entities.filter(e => { const k = e.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
    setCachedResult(text, 'entities', deduped)
    return deduped
  } catch { return null }
}

export { classifySentiment, extractEntitiesNLP, getCacheKey, nlpCache }

// Stats tracking
let apiCallCount = 0
let cacheHitCount = 0

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  if (!text || text.trim().length < 5) return 'neutral'
  const cached = getCachedResult(text, 'sentiment')
  if (cached) {
    cacheHitCount++
    const label = (cached as SentimentResult).label.toLowerCase()
    return label === 'positive' ? 'positive' : label === 'negative' ? 'negative' : 'neutral'
  }
  apiCallCount++
  const result = await classifySentiment(text)
  const finalResult: SentimentResult = result ?? { label: 'NEUTRAL', score: 1 }
  setCachedResult(text, 'sentiment', finalResult)  // ← кешуємо завжди
  return finalResult.label === 'POSITIVE' ? 'positive' : finalResult.label === 'NEGATIVE' ? 'negative' : 'neutral'
}

export async function extractEntities(text: string): Promise<string[]> {
  if (!text || text.trim().length === 0) return []
  const cached = getCachedResult(text, 'entities')
  if (cached) {
    cacheHitCount++
    return (cached as Array<{ name: string }>).map(e => e.name).slice(0, 6)
  }
  apiCallCount++
  const result = await extractEntitiesNLP(text)
  const finalResult = result ?? []
  setCachedResult(text, 'entities', finalResult)  // ← кешуємо завжди
  return finalResult.map(e => e.name).slice(0, 6)
}

export async function analyzeArticle(text: string): Promise<{ sentiment: 'positive' | 'negative' | 'neutral'; entities: string[] }> {
  const [sentiment, entities] = await Promise.all([analyzeSentiment(text), extractEntities(text)])
  return { sentiment, entities }
}

export function getNLPStats() {
  return { apiCalls: apiCallCount, cacheHits: cacheHitCount, provider: 'OpenAI', model: 'gpt-4o-mini' }
}