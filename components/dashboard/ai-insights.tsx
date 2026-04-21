'use client'

import { useMemo } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Activity } from 'lucide-react'
import { Article } from '@/lib/use-articles'

interface AiInsightsProps {
  articles: Article[]
}

export function AiInsights({ articles }: AiInsightsProps) {
  const insights = useMemo(() => {
    const result: Array<{
      icon: React.ElementType
      text: string
      type: 'info' | 'warning' | 'success'
    }> = []

    // Calculate sentiment distribution
    const positive = articles.filter((a) => a.sentiment === 'positive').length
    const negative = articles.filter((a) => a.sentiment === 'negative').length
    const neutral = articles.filter((a) => a.sentiment === 'neutral').length
    const total = articles.length || 1

    const positiveRatio = Math.round((positive / total) * 100)
    const negativeRatio = Math.round((negative / total) * 100)
    const neutralRatio = Math.round((neutral / total) * 100)

    // Find dominant sentiment
    let dominant = 'neutral'
    let dominantPct = neutralRatio
    if (positiveRatio > negativeRatio && positiveRatio > neutralRatio) {
      dominant = 'positive'
      dominantPct = positiveRatio
    } else if (negativeRatio > positiveRatio && negativeRatio > neutralRatio) {
      dominant = 'negative'
      dominantPct = negativeRatio
    }

    result.push({
      icon: Activity,
      text: `Sentiment is predominantly ${dominant} (${dominantPct}%)`,
      type: dominant === 'negative' ? 'warning' : 'info',
    })

    // Calculate entity mentions
    const entityCounts: Record<string, number> = {}
    articles.forEach((article) => {
      article.entities.forEach((entity) => {
        entityCounts[entity.name] = (entityCounts[entity.name] || 0) + 1
      })
    })

    const topEntity = Object.entries(entityCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]

    if (topEntity) {
      result.push({
        icon: TrendingUp,
        text: `"${topEntity[0]}" is the most mentioned entity with ${topEntity[1]} references`,
        type: 'success',
      })
    }

    // Real activity comparison: today vs yesterday
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const todayCount = articles.filter((a) => {
      const t = new Date(a.publishedAt).getTime()
      return t >= today.getTime() && t < tomorrow.getTime()
    }).length

    const yesterdayCount = articles.filter((a) => {
      const t = new Date(a.publishedAt).getTime()
      return t >= yesterday.getTime() && t < today.getTime()
    }).length

    if (yesterdayCount > 0) {
      const changePercent = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
      const direction = changePercent >= 0 ? 'rose' : 'fell'
      result.push({
        icon: TrendingUp,
        text: `Activity ${direction} ${Math.abs(changePercent)}% compared to yesterday (${todayCount} publications today)`,
        type: changePercent >= 0 ? 'success' : 'warning',
      })
    } else {
      result.push({
        icon: TrendingUp,
        text: `${todayCount} publications detected today`,
        type: 'info',
      })
    }

    // Check for negative spike
    if (negativeRatio > 40) {
      result.push({
        icon: AlertTriangle,
        text: `High negative sentiment detected (${negativeRatio}%) - monitor for developing crisis`,
        type: 'warning',
      })
    }

    return result
  }, [articles])

  const typeStyles = {
    info: 'text-[#3B82F6]',
    warning: 'text-[#F59E0B]',
    success: 'text-[#10B981]',
  }

  return (
    <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#8B5CF6]/10">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#F4F5F7]">AI Insights</h3>
          <p className="text-sm text-[#5B5E6E]">Auto-generated analysis</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-[#1C1D26] rounded-lg"
            >
              <Icon className={`w-4 h-4 mt-0.5 ${typeStyles[insight.type]}`} />
              <p className="text-sm text-[#9CA0AE] leading-relaxed">
                {insight.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
