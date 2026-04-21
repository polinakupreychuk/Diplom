'use client'

import { useState, useMemo } from 'react'
import { Search, X, SortAsc, ExternalLink, Eye, Type, Image as ImageIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useArticles, Article } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

type SortOption = 'newest' | 'most-objects' | 'most-tags'

const SENTIMENT_STYLES = {
  positive: {
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    label: 'Positive',
  },
  neutral: {
    bg: 'bg-[#6B7280]/10',
    text: 'text-[#6B7280]',
    label: 'Neutral',
  },
  negative: {
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    label: 'Negative',
  },
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export default function GalleryPage() {
  const { articles, isLoading, lastUpdated } = useArticles()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  // Filter to only articles with images
  const articlesWithImages = useMemo(() => {
    return articles.filter((a) => a.imageUrl && a.imageAnalysis)
  }, [articles])

  // Extract unique tags and sources
  const { uniqueTags, uniqueSources } = useMemo(() => {
    const tags = new Set<string>()
    const sources = new Set<string>()

    for (const article of articlesWithImages) {
      sources.add(article.source)
      if (article.imageAnalysis) {
        article.imageAnalysis.tags.forEach((tag) => tags.add(tag))
      }
    }

    return {
      uniqueTags: Array.from(tags).sort(),
      uniqueSources: Array.from(sources).sort(),
    }
  }, [articlesWithImages])

  // Filtered and sorted articles
  const filteredArticles = useMemo(() => {
    let result = articlesWithImages

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(lowerSearch) ||
          a.imageAnalysis?.tags.some((tag) =>
            tag.toLowerCase().includes(lowerSearch)
          )
      )
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter((a) =>
        selectedTags.every((tag) => a.imageAnalysis?.tags.includes(tag))
      )
    }

    // Source filter
    if (selectedSource !== 'all') {
      result = result.filter((a) => a.source === selectedSource)
    }

    // Sort
    switch (sortBy) {
      case 'most-objects':
        result = [...result].sort(
          (a, b) =>
            (b.imageAnalysis?.detectedObjects.length || 0) -
            (a.imageAnalysis?.detectedObjects.length || 0)
        )
        break
      case 'most-tags':
        result = [...result].sort(
          (a, b) =>
            (b.imageAnalysis?.tags.length || 0) -
            (a.imageAnalysis?.tags.length || 0)
        )
        break
      default:
        result = [...result].sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
    }

    return result
  }, [articlesWithImages, search, selectedTags, selectedSource, sortBy])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Media Gallery"
          subtitle="Visual content with computer vision analysis"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-[#13141A] border border-[#22242E] rounded-xl overflow-hidden skeleton-shimmer"
            >
              <div className="aspect-video bg-[#1C1D26]" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[#1C1D26] rounded w-3/4" />
                <div className="h-3 bg-[#1C1D26] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Gallery"
        subtitle="Visual content with computer vision analysis"
        lastUpdated={lastUpdated}
      />

      {/* Filter Bar */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5B5E6E]" />
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-sm text-[#F4F5F7] placeholder:text-[#5B5E6E] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-sm text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-[#5B5E6E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-sm text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="newest">Newest</option>
              <option value="most-objects">Most Objects</option>
              <option value="most-tags">Most Tags</option>
            </select>
          </div>
        </div>

        {/* Tag Chips */}
        {uniqueTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {uniqueTags.slice(0, 12).map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[#1C1D26] text-[#9CA0AE] hover:bg-[#22242E]'
                )}
              >
                {tag}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-[#9CA0AE]">
        <ImageIcon className="w-4 h-4" />
        <span>
          {filteredArticles.length} image{filteredArticles.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Gallery Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-[#13141A] border border-[#22242E] rounded-xl overflow-hidden hover:border-[#2E3040] transition-all cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-video bg-[#1C1D26] overflow-hidden">
                <img
                  src={article.imageUrl!}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-sm font-semibold text-white line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: article.color }}
                      >
                        {article.initials}
                      </div>
                      <span className="text-xs text-white/80">
                        {formatTimeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded',
                      SENTIMENT_STYLES[article.sentiment].bg,
                      SENTIMENT_STYLES[article.sentiment].text
                    )}
                  >
                    {SENTIMENT_STYLES[article.sentiment].label}
                  </span>
                  {article.imageAnalysis?.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium rounded bg-[#3B82F6]/10 text-[#3B82F6]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1C1D26] flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-[#5B5E6E]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F4F5F7] mb-2">
            No images found
          </h3>
          <p className="text-sm text-[#9CA0AE] max-w-md">
            {search || selectedTags.length > 0 || selectedSource !== 'all'
              ? 'Try adjusting your filters to find more results.'
              : 'No images available in the current feed.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-[#13141A] border border-[#22242E] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative">
              <img
                src={selectedArticle.imageUrl!}
                alt=""
                className="w-full max-h-[400px] object-contain bg-[#0A0B0F]"
              />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: selectedArticle.color }}
                  >
                    {selectedArticle.initials}
                  </div>
                  <span className="text-sm text-[#9CA0AE]">
                    {selectedArticle.source}
                  </span>
                  <span className="text-sm text-[#5B5E6E]">
                    {formatTimeAgo(selectedArticle.publishedAt)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-[#F4F5F7] mb-2">
                  {selectedArticle.title}
                </h2>
                <p className="text-sm text-[#9CA0AE] leading-relaxed">
                  {selectedArticle.excerpt}
                </p>
              </div>

              {/* CV Analysis */}
              {selectedArticle.imageAnalysis && (
                <div className="bg-[#1C1D26] rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#3B82F6]" />
                    <h4 className="text-sm font-semibold text-[#F4F5F7]">
                      Computer Vision Analysis
                    </h4>
                  </div>

                  {/* Tags */}
                  <div>
                    <p className="text-xs text-[#5B5E6E] mb-2 uppercase tracking-wider">
                      All Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.imageAnalysis.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium rounded-md bg-[#3B82F6]/10 text-[#3B82F6]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Objects */}
                  <div>
                    <p className="text-xs text-[#5B5E6E] mb-2 uppercase tracking-wider">
                      Detected Objects
                    </p>
                    <div className="space-y-2">
                      {selectedArticle.imageAnalysis.detectedObjects.map((obj) => (
                        <div key={obj.label} className="flex items-center gap-3">
                          <span className="text-xs text-[#9CA0AE] w-20 capitalize">
                            {obj.label}
                          </span>
                          <div className="flex-1 h-2 bg-[#22242E] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#10B981] rounded-full"
                              style={{ width: `${obj.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#5B5E6E] w-12 text-right">
                            {Math.round(obj.confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicators */}
                  <div className="flex items-center gap-6 pt-2 border-t border-[#22242E]">
                    <div className="flex items-center gap-2">
                      <Type
                        className={cn(
                          'w-4 h-4',
                          selectedArticle.imageAnalysis.hasText
                            ? 'text-[#10B981]'
                            : 'text-[#5B5E6E]'
                        )}
                      />
                      <span className="text-xs text-[#9CA0AE]">
                        {selectedArticle.imageAnalysis.hasText
                          ? 'Contains text'
                          : 'No text detected'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#5B5E6E]">Colors:</span>
                      <div className="flex gap-1">
                        {selectedArticle.imageAnalysis.dominantColors.map(
                          (color, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded border border-[#22242E]"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  Open article
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 bg-[#1C1D26] text-[#9CA0AE] text-sm font-medium rounded-lg hover:bg-[#22242E] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
