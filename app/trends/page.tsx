'use client'

import { useState, useMemo } from 'react'
import { X, Plus, TrendingUp, AlertTriangle } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { PageHeader } from '@/components/page-header'
import { useArticles } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

type RangeFilter = '24h' | '7d' | '30d' | '90d'

interface Keyword {
  text: string
  color: string
}

const DEFAULT_KEYWORDS: Keyword[] = [
  { text: 'Зеленський', color: '#3B82F6' },
  { text: 'НАТО', color: '#10B981' },
  { text: 'Верховна Рада', color: '#F59E0B' },
  { text: 'Залужний', color: '#8B5CF6' },
]

const AVAILABLE_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#EC4899',
]

export default function TrendsPage() {
  const { articles, isLoading, lastUpdated } = useArticles()
  const [keywords, setKeywords] = useState<Keyword[]>(DEFAULT_KEYWORDS)
  const [newKeyword, setNewKeyword] = useState('')
  const [range, setRange] = useState<RangeFilter>('7d')

  const removeKeyword = (text: string) => {
    setKeywords((prev) => prev.filter((k) => k.text !== text))
  }

  const addKeyword = () => {
    if (!newKeyword.trim() || keywords.length >= 4) return
    const usedColors = new Set(keywords.map((k) => k.color))
    const availableColor =
      AVAILABLE_COLORS.find((c) => !usedColors.has(c)) || '#3B82F6'
    setKeywords((prev) => [
      ...prev,
      { text: newKeyword.trim(), color: availableColor },
    ])
    setNewKeyword('')
  }

  const chartData = useMemo(() => {
    const now = new Date()
    let buckets: { label: string; start: Date; end: Date }[] = []

    if (range === '24h') {
      // Hourly buckets
      for (let i = 23; i >= 0; i--) {
        const start = new Date(now)
        start.setHours(now.getHours() - i, 0, 0, 0)
        const end = new Date(start)
        end.setHours(start.getHours() + 1)
        buckets.push({
          label: start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          }),
          start,
          end,
        })
      }
    } else {
      // Daily buckets
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      for (let i = days - 1; i >= 0; i--) {
        const start = new Date(now)
        start.setDate(now.getDate() - i)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(start.getDate() + 1)
        buckets.push({
          label: start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
          start,
          end,
        })
      }
    }

    return buckets.map((bucket) => {
      const bucketArticles = articles.filter((a) => {
        const pubDate = new Date(a.publishedAt)
        return pubDate >= bucket.start && pubDate < bucket.end
      })

      const data: Record<string, string | number> = { name: bucket.label }

      keywords.forEach((keyword) => {
        const count = bucketArticles.filter(
          (a) =>
            a.title.includes(keyword.text) || a.excerpt.includes(keyword.text)
        ).length
        data[keyword.text] = count
      })

      return data
    })
  }, [articles, keywords, range])

  const anomalies = useMemo(() => {
    const results: Array<{
      keyword: string
      time: string
      volume: number
      change: number
      status: 'critical' | 'warning'
    }> = []

    keywords.forEach((keyword) => {
      const values = chartData.map((d) => (d[keyword.text] as number) || 0)
      const avg = values.reduce((a, b) => a + b, 0) / values.length || 1

      values.forEach((value, index) => {
        if (value > avg * 2.5 && value > 2) {
          results.push({
            keyword: keyword.text,
            time: chartData[index].name as string,
            volume: value,
            change: Math.round(((value - avg) / avg) * 100),
            status: value > avg * 4 ? 'critical' : 'warning',
          })
        }
      })
    })

    return results.slice(0, 5)
  }, [chartData, keywords])

  const ranges: { key: RangeFilter; label: string }[] = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Trends" subtitle="Keyword and entity trend analysis" />
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[100px] skeleton-shimmer" />
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 h-[400px] skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trends"
        subtitle="Keyword and entity trend analysis"
        lastUpdated={lastUpdated}
      />

      {/* Keyword Manager */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {keywords.map((keyword) => (
            <span
              key={keyword.text}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: `${keyword.color}15`,
                color: keyword.color,
              }}
            >
              {keyword.text}
              <button
                onClick={() => removeKeyword(keyword.text)}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {keywords.length < 4 && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword..."
                className="px-3 py-1.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-sm text-[#F4F5F7] placeholder-[#5B5E6E] focus:outline-none focus:border-[#3B82F6] w-[140px]"
              />
              <button
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
                className="p-1.5 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-[#5B5E6E]">Maximum 4 keywords</p>
      </div>

      {/* Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F4F5F7]">
          Mention Frequency
        </h3>
        <div className="flex gap-1 bg-[#13141A] border border-[#22242E] rounded-lg p-1">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
                range === r.key
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[#5B5E6E] hover:text-[#9CA0AE]'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5B5E6E', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5B5E6E', fontSize: 12 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1D26',
                  border: '1px solid #2E3040',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: '#F4F5F7', marginBottom: 8 }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span className="text-[#9CA0AE] text-sm">{value}</span>
                )}
              />
              {keywords.map((keyword) => (
                <Line
                  key={keyword.text}
                  type="monotone"
                  dataKey={keyword.text}
                  stroke={keyword.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Detection Table */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-lg font-semibold text-[#F4F5F7]">
            Anomaly Detection
          </h3>
        </div>

        {anomalies.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-8 h-8 text-[#5B5E6E] mx-auto mb-3" />
            <p className="text-[#5B5E6E]">
              No anomalies detected in selected range
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#22242E]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                    Change %
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {anomalies.map((anomaly, index) => (
                  <tr
                    key={index}
                    className="border-b border-[#22242E] last:border-0"
                  >
                    <td className="py-3 px-4 text-sm text-[#F4F5F7]">
                      {anomaly.keyword}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#9CA0AE]">
                      {anomaly.time}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#F4F5F7]">
                      {anomaly.volume}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#10B981]">
                      +{anomaly.change}%
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-md',
                          anomaly.status === 'critical'
                            ? 'bg-[#EF4444]/10 text-[#EF4444]'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        )}
                      >
                        {anomaly.status === 'critical' ? 'Critical' : 'Warning'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
