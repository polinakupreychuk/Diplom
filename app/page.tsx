'use client'

import { useMemo } from 'react'
import { Newspaper, Activity, Radio, Bell, ImageIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { TopEntities } from '@/components/dashboard/top-entities'
import { SourceBreakdown } from '@/components/dashboard/source-breakdown'
import { AiInsights } from '@/components/dashboard/ai-insights'
import { VisualAnalysis } from '@/components/dashboard/visual-analysis'
import { useArticles } from '@/lib/use-articles'

export default function DashboardPage() {
  const { articles, isLoading, lastUpdated } = useArticles()

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayArticles = articles.filter(
      (a) => new Date(a.publishedAt) >= today
    )

    const positive = articles.filter((a) => a.sentiment === 'positive').length
    const total = articles.length || 1
    const positiveRatio = Math.round((positive / total) * 100)

    const sources = new Set(articles.map((a) => a.source))

    // Image statistics
    const articlesWithImages = articles.filter((a) => a.imageUrl)
    const imageCount = articlesWithImages.length
    const imagePercentage = total > 0 ? Math.round((imageCount / total) * 100) : 0

    // Real 7-day sparkline data
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const day = new Date()
      day.setDate(day.getDate() - (6 - i))
      day.setHours(0, 0, 0, 0)
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      return articles.filter(a => {
        const t = new Date(a.publishedAt).getTime()
        return t >= day.getTime() && t < next.getTime()
      }).length
    })

    return {
      todayCount: todayArticles.length,
      positiveRatio,
      sourcesCount: sources.size,
      sparkline: dailyTrend,
      imageCount,
      imagePercentage,
      gaugeColor:
        positiveRatio > 50
          ? 'green'
          : positiveRatio >= 30
          ? 'amber'
          : ('red' as const),
      gaugeLabel:
        positiveRatio > 50
          ? 'Positive'
          : positiveRatio >= 30
          ? 'Neutral'
          : 'Negative',
    }
  }, [articles])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          subtitle="Real-time Ukrainian media analytics"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[140px] skeleton-shimmer"
            />
          ))}
        </div>
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[340px] skeleton-shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[350px] skeleton-shimmer" />
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[350px] skeleton-shimmer" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[320px] skeleton-shimmer" />
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[320px] skeleton-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time Ukrainian media analytics"
        lastUpdated={lastUpdated}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Publications Today"
          value={stats.todayCount}
          icon={Newspaper}
          sparklineData={stats.sparkline}
          trend={{ value: 12, label: 'vs yesterday' }}
        />
        <KpiCard
          title="Average Sentiment"
          value={stats.positiveRatio}
          icon={Activity}
          gauge={{
            value: stats.positiveRatio,
            label: stats.gaugeLabel,
            color: stats.gaugeColor,
          }}
        />
        <KpiCard
          title="Active Sources"
          value={stats.sourcesCount}
          icon={Radio}
          badge={{ text: 'All online', variant: 'success' }}
        />
        <KpiCard
          title="Images Processed"
          value={stats.imageCount}
          icon={ImageIcon}
          badge={{ 
            text: `${stats.imagePercentage}% coverage`, 
            variant: stats.imagePercentage > 50 ? 'success' : 'warning' 
          }}
        />
        <KpiCard
          title="Alerts Triggered"
          value={7}
          icon={Bell}
          badge={{ text: '3 need attention', variant: 'error' }}
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart articles={articles} />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopEntities articles={articles} />
        <SourceBreakdown articles={articles} />
      </div>

      {/* Visual Content Analysis */}
      <VisualAnalysis articles={articles} />

      {/* AI Insights */}
      <AiInsights articles={articles} />
    </div>
  )
}
