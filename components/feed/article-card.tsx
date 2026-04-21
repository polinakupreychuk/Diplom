'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, Image as ImageIcon, Type, Eye } from 'lucide-react'
import { Article } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
}

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

const ENTITY_TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  PERSON: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  ORG: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  LOCATION: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
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

export function ArticleCard({ article }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const sentiment = SENTIMENT_STYLES[article.sentiment]
  const displayEntities = article.entities.slice(0, 4)
  const hasImage = article.imageUrl && !imageError

  return (
    <div
      className={cn(
        'bg-[#13141A] border border-[#22242E] rounded-xl p-5 transition-all duration-200',
        expanded && 'border-[#2E3040]'
      )}
    >
      {/* Main content with optional thumbnail */}
      <div className="flex gap-4">
        {/* Thumbnail or placeholder */}
        <div className="shrink-0">
          {hasImage ? (
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#1C1D26]">
              <img
                src={article.imageUrl!}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div 
              className="w-24 h-24 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${article.color}20` }}
            >
              <span 
                className="text-2xl font-bold opacity-60"
                style={{ color: article.color }}
              >
                {article.initials}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium text-xs shrink-0"
              style={{ backgroundColor: article.color }}
            >
              {article.initials}
            </div>
            <span className="text-sm font-medium text-[#F4F5F7]">
              {article.source}
            </span>
            <span className="text-sm text-[#5B5E6E]">
              {formatTimeAgo(article.publishedAt)}
            </span>
            {article.imageUrl && (
              <ImageIcon className="w-4 h-4 text-[#5B5E6E]" />
            )}
          </div>

          {/* Title */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-2 group"
          >
            <h3 className="text-base font-semibold text-[#F4F5F7] leading-snug group-hover:text-[#3B82F6] transition-colors line-clamp-2">
              {article.title}
            </h3>
          </a>

          {/* Excerpt */}
          <p className="text-sm text-[#9CA0AE] leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-md',
              sentiment.bg,
              sentiment.text
            )}
          >
            {sentiment.label}
          </span>
          {displayEntities.map((entity) => {
            const style = ENTITY_TYPE_STYLES[entity.type] || {
              bg: 'bg-[#5B5E6E]/10',
              text: 'text-[#5B5E6E]',
            }
            return (
              <span
                key={entity.name}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-md',
                  style.bg,
                  style.text
                )}
              >
                {entity.name}
              </span>
            )
          })}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 text-[#5B5E6E] hover:text-[#9CA0AE] transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#22242E] space-y-4">
          {/* Large image display */}
          {hasImage && (
            <div className="rounded-lg overflow-hidden bg-[#1C1D26]">
              <img
                src={article.imageUrl!}
                alt=""
                className="w-full max-h-[400px] object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Computer Vision Analysis */}
          {article.imageAnalysis && (
            <div className="bg-[#1C1D26] rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#3B82F6]" />
                <h4 className="text-sm font-semibold text-[#F4F5F7]">
                  Computer Vision Analysis
                </h4>
              </div>

              {/* CV Tags */}
              <div>
                <p className="text-xs text-[#5B5E6E] mb-2 uppercase tracking-wider">
                  Detected Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {article.imageAnalysis.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium rounded-md bg-[#3B82F6]/10 text-[#3B82F6]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detected Objects with confidence bars */}
              <div>
                <p className="text-xs text-[#5B5E6E] mb-2 uppercase tracking-wider">
                  Detected Objects
                </p>
                <div className="space-y-2">
                  {article.imageAnalysis.detectedObjects.slice(0, 3).map((obj) => (
                    <div key={obj.label} className="flex items-center gap-3">
                      <span className="text-xs text-[#9CA0AE] w-20 capitalize">
                        {obj.label}
                      </span>
                      <div className="flex-1 h-2 bg-[#22242E] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full transition-all"
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

              {/* Indicators row */}
              <div className="flex items-center gap-4 pt-2 border-t border-[#22242E]">
                {/* Has text indicator */}
                <div className="flex items-center gap-2">
                  <Type className={cn(
                    'w-4 h-4',
                    article.imageAnalysis.hasText ? 'text-[#10B981]' : 'text-[#5B5E6E]'
                  )} />
                  <span className="text-xs text-[#9CA0AE]">
                    {article.imageAnalysis.hasText ? 'Contains text' : 'No text detected'}
                  </span>
                </div>

                {/* Dominant colors */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5B5E6E]">Colors:</span>
                  <div className="flex gap-1">
                    {article.imageAnalysis.dominantColors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded border border-[#22242E]"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full excerpt */}
          <p className="text-sm text-[#9CA0AE] leading-relaxed">
            {article.excerpt}
          </p>

          {/* Confidence bars */}
          <div className="space-y-2">
            <p className="text-xs text-[#5B5E6E] font-medium uppercase tracking-wider">
              Sentiment Analysis
            </p>
            <div className="flex h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#10B981] transition-all"
                style={{
                  width:
                    article.sentiment === 'positive'
                      ? '65%'
                      : article.sentiment === 'neutral'
                      ? '20%'
                      : '15%',
                }}
              />
              <div
                className="bg-[#6B7280] transition-all"
                style={{
                  width:
                    article.sentiment === 'neutral'
                      ? '55%'
                      : article.sentiment === 'positive'
                      ? '25%'
                      : '25%',
                }}
              />
              <div
                className="bg-[#EF4444] transition-all"
                style={{
                  width:
                    article.sentiment === 'negative'
                      ? '60%'
                      : article.sentiment === 'positive'
                      ? '10%'
                      : '20%',
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#5B5E6E]">
              <span>Positive</span>
              <span>Neutral</span>
              <span>Negative</span>
            </div>
          </div>

          {/* All entities */}
          {article.entities.length > 0 && (
            <div>
              <p className="text-xs text-[#5B5E6E] font-medium uppercase tracking-wider mb-2">
                Extracted Entities
              </p>
              <div className="flex flex-wrap gap-2">
                {article.entities.map((entity) => {
                  const style = ENTITY_TYPE_STYLES[entity.type] || {
                    bg: 'bg-[#5B5E6E]/10',
                    text: 'text-[#5B5E6E]',
                  }
                  return (
                    <span
                      key={entity.name}
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-md',
                        style.bg,
                        style.text
                      )}
                    >
                      {entity.name}
                      <span className="ml-1 opacity-60">({entity.type})</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Open article button */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors"
          >
            Open article
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}
