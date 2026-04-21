import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { classifySentiment, extractEntitiesNLP } from '@/lib/nlp-utils'

// Extended parser to capture media namespace and enclosure tags
const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'MediaPulse/1.0',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['enclosure', 'enclosure'],
    ],
  },
})

interface RSSSource {
  name: string
  url: string
  initials: string
  color: string
}

const RSS_SOURCES: RSSSource[] = [
  {
    name: 'Українська правда',
    url: 'https://www.pravda.com.ua/rss/view_news/',
    initials: 'УП',
    color: '#DC2626',
  },
  {
    name: 'TSN.ua',
    url: 'https://tsn.ua/rss/full.rss',
    initials: 'Т',
    color: '#F59E0B',
  },
  {
    name: 'Суспільне',
    url: 'https://suspilne.media/rss/all.rss',
    initials: 'С',
    color: '#10B981',
  },
  {
    name: 'Радіо Свобода',
    url: 'https://www.radiosvoboda.org/api/zepyraqmoi',
    initials: 'РС',
    color: '#8B5CF6',
  },
]

const POSITIVE_WORDS = [
  'перемога',
  'допомога',
  'підтримка',
  'угода',
  'успіх',
  'зростання',
  'звільнення',
  'відновлення',
]

const NEGATIVE_WORDS = [
  'атака',
  'загибель',
  'втрати',
  'обстріл',
  'криза',
  'загроза',
  'вибух',
  'окупація',
  'удар',
  'поранений',
]

const KNOWN_ENTITIES = [
  { name: 'Зеленський', type: 'PERSON' },
  { name: 'Залужний', type: 'PERSON' },
  { name: 'Шмигаль', type: 'PERSON' },
  { name: 'Трамп', type: 'PERSON' },
  { name: 'Путін', type: 'PERSON' },
  { name: 'Верховна Рада', type: 'ORG' },
  { name: 'НАТО', type: 'ORG' },
  { name: 'ЗСУ', type: 'ORG' },
  { name: 'Міноборони', type: 'ORG' },
  { name: 'ЄС', type: 'ORG' },
  { name: 'Київ', type: 'LOCATION' },
  { name: 'США', type: 'LOCATION' },
  { name: 'Польща', type: 'LOCATION' },
  { name: 'Харків', type: 'LOCATION' },
  { name: 'Одеса', type: 'LOCATION' },
  { name: 'Львів', type: 'LOCATION' },
  { name: 'Росія', type: 'LOCATION' },
  { name: 'Білорусь', type: 'LOCATION' },
]

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

// Extract image URL from RSS item using multiple strategies
function extractImageUrl(item: Record<string, unknown>): string | null {
  // Strategy 1: media:content namespace
  const mediaContent = item.mediaContent as Array<{ $?: { url?: string; medium?: string } }> | undefined
  if (mediaContent && mediaContent.length > 0) {
    for (const media of mediaContent) {
      const url = media.$?.url
      const medium = media.$?.medium
      if (url && (!medium || medium === 'image')) {
        return url
      }
    }
  }

  // Strategy 2: media:thumbnail namespace
  const mediaThumbnail = item.mediaThumbnail as Array<{ $?: { url?: string } }> | undefined
  if (mediaThumbnail && mediaThumbnail.length > 0) {
    const url = mediaThumbnail[0].$?.url
    if (url) return url
  }

  // Strategy 3: enclosure tag with image type
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined
  if (enclosure?.url && enclosure.type?.startsWith('image/')) {
    return enclosure.url
  }

  // Strategy 4: Parse img src from HTML content/description
  const htmlContent = (item.content || item['content:encoded'] || item.description || '') as string
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1]
  }

  return null
}

// CV tag mappings based on keywords
const CV_TAG_MAPPINGS: Record<string, string[]> = {
  'Зеленський': ['politician', 'official', 'speech', 'government'],
  'Залужний': ['military', 'uniform', 'official', 'outdoor'],
  'Шмигаль': ['politician', 'official', 'indoor', 'meeting'],
  'Путін': ['politician', 'official', 'russia'],
  'Трамп': ['politician', 'official', 'usa'],
  'НАТО': ['military', 'alliance', 'outdoor', 'flags'],
  'ЗСУ': ['military', 'soldiers', 'outdoor', 'equipment'],
  'Міноборони': ['military', 'building', 'official'],
  'Верховна Рада': ['parliament', 'indoor', 'politics', 'session'],
  'ЄС': ['european', 'flags', 'meeting', 'politics'],
  'Київ': ['city', 'urban', 'ukraine', 'capital'],
  'Харків': ['city', 'urban', 'ukraine', 'eastern'],
  'Одеса': ['city', 'coastal', 'ukraine', 'port'],
  'Львів': ['city', 'historic', 'ukraine', 'western'],
  'обстріл': ['destruction', 'damage', 'smoke', 'emergency'],
  'вибух': ['explosion', 'fire', 'emergency', 'destruction'],
  'атака': ['military', 'combat', 'emergency'],
  'відновлення': ['construction', 'recovery', 'workers'],
  'допомога': ['humanitarian', 'aid', 'supplies'],
}

// Detected object templates
const OBJECT_TEMPLATES = [
  { label: 'person', baseConfidence: 0.92 },
  { label: 'building', baseConfidence: 0.87 },
  { label: 'vehicle', baseConfidence: 0.84 },
  { label: 'flag', baseConfidence: 0.89 },
  { label: 'text', baseConfidence: 0.91 },
  { label: 'crowd', baseConfidence: 0.82 },
  { label: 'document', baseConfidence: 0.86 },
  { label: 'microphone', baseConfidence: 0.88 },
  { label: 'uniform', baseConfidence: 0.85 },
  { label: 'weapon', baseConfidence: 0.79 },
]

// Color palettes for dominant colors
const COLOR_PALETTES = [
  ['#1E3A5F', '#4A7C9B', '#87CEEB'],
  ['#2D5016', '#5A8033', '#98D14C'],
  ['#4A3728', '#8B7355', '#D4C4B5'],
  ['#1A1A2E', '#16213E', '#0F3460'],
  ['#3D0C11', '#7B2D3A', '#C75B7A'],
  ['#2C3E50', '#34495E', '#95A5A6'],
]

// Perform mock CV analysis based on article content
function analyzeImage(
  imageUrl: string | null,
  title: string,
  entities: Array<{ name: string; type: string }>
): {
  tags: string[]
  detectedObjects: Array<{ label: string; confidence: number }>
  hasText: boolean
  dominantColors: string[]
} | null {
  if (!imageUrl) return null

  const tags = new Set<string>()
  
  // Add tags based on entity mentions
  for (const entity of entities) {
    const mappedTags = CV_TAG_MAPPINGS[entity.name]
    if (mappedTags) {
      mappedTags.forEach(tag => tags.add(tag))
    }
  }
  
  // Add tags based on title keywords
  const lowerTitle = title.toLowerCase()
  for (const [keyword, cvTags] of Object.entries(CV_TAG_MAPPINGS)) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      cvTags.forEach(tag => tags.add(tag))
    }
  }
  
  // Ensure at least some generic tags
  if (tags.size < 2) {
    tags.add('news')
    tags.add('media')
  }

  // Generate detected objects with varied confidence
  const seedValue = imageUrl.length + title.length
  const numObjects = 2 + (seedValue % 4) // 2-5 objects
  const shuffledObjects = [...OBJECT_TEMPLATES]
    .sort(() => (seedValue % 2 === 0 ? 1 : -1) * 0.5 - 0.25)
    .slice(0, numObjects)
  
  const detectedObjects = shuffledObjects.map((obj, idx) => ({
    label: obj.label,
    confidence: Math.min(0.99, obj.baseConfidence + (((seedValue + idx) % 10) - 5) / 100),
  })).sort((a, b) => b.confidence - a.confidence)

  // Determine hasText based on content
  const hasText = tags.has('document') || tags.has('text') || (seedValue % 10) < 4

  // Select color palette based on seed
  const colorIndex = seedValue % COLOR_PALETTES.length
  const dominantColors = COLOR_PALETTES[colorIndex]

  return {
    tags: Array.from(tags).slice(0, 8),
    detectedObjects,
    hasText,
    dominantColors,
  }
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const lowerText = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0

  for (const word of POSITIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      positiveCount++
    }
  }

  for (const word of NEGATIVE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      negativeCount++
    }
  }

  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}

// Async sentiment analysis with HF fallback to keyword analysis
async function analyzeSentimentWithNLP(
  text: string
): Promise<'positive' | 'neutral' | 'negative'> {
  // Try HF API first
  const hfResult = await classifySentiment(text)
  if (hfResult) {
    // Convert HF output to our format
    if (hfResult.label === 'POSITIVE' && hfResult.score > 0.5) return 'positive'
    if (hfResult.label === 'NEGATIVE' && hfResult.score > 0.5) return 'negative'
    return 'neutral'
  }

  // Fallback to keyword analysis
  return analyzeSentiment(text)
}

function extractEntities(text: string): Array<{ name: string; type: string }> {
  const found: Array<{ name: string; type: string }> = []

  for (const entity of KNOWN_ENTITIES) {
    if (text.includes(entity.name)) {
      found.push(entity)
    }
  }

  return found
}

// Async entity extraction with HF fallback to keyword matching
async function extractEntitiesWithNLP(
  text: string
): Promise<Array<{ name: string; type: string }>> {
  // Try HF API first
  const nlpEntities = await extractEntitiesNLP(text)
  if (nlpEntities && nlpEntities.length > 0) {
    // Combine HF results with known entities for coverage
    const entityNames = nlpEntities.map((e) => e.name.toLowerCase())
    const keywordEntities = extractEntities(text).filter(
      (e) => !entityNames.includes(e.name.toLowerCase())
    )
    return [...nlpEntities, ...keywordEntities].slice(0, 15) // Limit to 15
  }

  // Fallback to keyword matching
  return extractEntities(text)
}

async function fetchFeed(source: RSSSource) {
  try {
    const feed = await parser.parseURL(source.url)
    
    const items = feed.items.slice(0, 25)
    const articles = []

    // Process items with concurrent NLP (respect HF rate limits)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const index = i
      
      const title = item.title || 'Untitled'
      const rawDescription = item.contentSnippet || item.content || item.description || ''
      const cleanDescription = stripHtml(rawDescription)
      const excerpt = truncate(cleanDescription, 200)
      const fullText = `${title} ${cleanDescription}`
      
      // Use NLP analysis with fallback
      const sentiment = await analyzeSentimentWithNLP(fullText)
      const entities = await extractEntitiesWithNLP(fullText)
      
      // Extract image URL
      const imageUrl = extractImageUrl(item as Record<string, unknown>)
      const imageAnalysis = analyzeImage(imageUrl, title, entities)

      articles.push({
        id: `${source.initials}-${Date.now()}-${index}`,
        source: source.name,
        initials: source.initials,
        color: source.color,
        title,
        excerpt,
        url: item.link || '',
        publishedAt: item.pubDate
            ? new Date(item.pubDate).toISOString()
            : new Date().toISOString(),
        sentiment,
        entities,
        imageUrl,
        imageAnalysis,
      })

      // Add small delay between requests to avoid rate limiting
      if (i < items.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 50))
      }
    }

    return articles
  } catch (error) {
    console.error(`Failed to fetch ${source.name}:`, error)
    return []
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_SOURCES.map((source) => fetchFeed(source))
    )

    const articles = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return NextResponse.json(articles)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    )
  }
}
