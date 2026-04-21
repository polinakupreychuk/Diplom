'use client'

import { useState, useMemo } from 'react'
import { RefreshCw, Search, Inbox } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ArticleCard } from '@/components/feed/article-card'
import { useArticles } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative'
type DateFilter = 'all' | 'today' | '24h' | '7d'

export default function FeedPage() {
  const { articles, isLoading, error, lastUpdated, refresh } = useArticles()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')

  const sources = useMemo(() => {
    const unique = new Set(articles.map((a) => a.source))
    return Array.from(unique)
  }, [articles])

  const filteredArticles = useMemo(() => {
    let filtered = [...articles]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query)
      )
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((a) => a.source === sourceFilter)
    }

    // Sentiment filter
    if (sentimentFilter !== 'all') {
      filtered = filtered.filter((a) => a.sentiment === sentimentFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      filtered = filtered.filter((a) => new Date(a.publishedAt) >= today)
    } else if (dateFilter === '24h') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter((a) => new Date(a.publishedAt) >= yesterday)
    } else if (dateFilter === '7d') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((a) => new Date(a.publishedAt) >= weekAgo)
    }

    return filtered
  }, [articles, searchQuery, sourceFilter, sentimentFilter, dateFilter])

  const sentimentStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayArticles = articles.filter(
      (a) => new Date(a.publishedAt) >= today
    )

    const total = todayArticles.length || 1
    const positive = todayArticles.filter(
      (a) => a.sentiment === 'positive'
    ).length
    const neutral = todayArticles.filter(
      (a) => a.sentiment === 'neutral'
    ).length
    const negative = todayArticles.filter(
      (a) => a.sentiment === 'negative'
    ).length

    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    }
  }, [articles])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const dateFilters: { key: DateFilter; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
  ]

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Live Feed" subtitle="Real-time news monitoring" />
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-6 text-center">
          <p className="text-[#EF4444] font-medium mb-4">
            Unable to load feeds
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Feed"
        subtitle="Real-time news monitoring"
        lastUpdated={lastUpdated}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] text-sm font-medium rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            Live
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1D26] text-[#F4F5F7] rounded-lg hover:bg-[#22242E] transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
            />
            Refresh
          </button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B5E6E]" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#13141A] border border-[#22242E] rounded-lg text-[#F4F5F7] placeholder-[#5B5E6E] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        {/* Source dropdown */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#13141A] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6] transition-colors min-w-[180px]"
        >
          <option value="all">All Sources</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>

        {/* Sentiment dropdown */}
        <select
          value={sentimentFilter}
          onChange={(e) => setSentimentFilter(e.target.value as SentimentFilter)}
          className="px-4 py-2.5 bg-[#13141A] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6] transition-colors min-w-[150px]"
        >
          <option value="all">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        {/* Date filter chips */}
        <div className="flex gap-1 bg-[#13141A] border border-[#22242E] rounded-lg p-1">
          {dateFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setDateFilter(f.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                dateFilter === f.key
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#5B5E6E] hover:text-[#9CA0AE]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment Distribution Bar */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-4">
        <p className="text-xs text-[#5B5E6E] font-medium mb-3">
          {"Today's"} Sentiment Distribution
        </p>
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          <div
            className="bg-[#10B981] transition-all"
            style={{ width: `${sentimentStats.positive}%` }}
          />
          <div
            className="bg-[#6B7280] transition-all"
            style={{ width: `${sentimentStats.neutral}%` }}
          />
          <div
            className="bg-[#EF4444] transition-all"
            style={{ width: `${sentimentStats.negative}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#10B981]">
            Positive {sentimentStats.positive}%
          </span>
          <span className="text-[#6B7280]">
            Neutral {sentimentStats.neutral}%
          </span>
          <span className="text-[#EF4444]">
            Negative {sentimentStats.negative}%
          </span>
        </div>
      </div>

      {/* Articles */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[160px] skeleton-shimmer"
            />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[#1C1D26] flex items-center justify-center">
              <Inbox className="w-8 h-8 text-[#5B5E6E]" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-[#F4F5F7] mb-2">
            No articles match your filters
          </h3>
          <p className="text-sm text-[#5B5E6E]">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
