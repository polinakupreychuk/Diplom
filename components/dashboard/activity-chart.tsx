'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Article } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

interface ActivityChartProps {
  articles: Article[]
}

type FilterType = 'all' | 'positive' | 'neutral' | 'negative'

const FILTER_COLORS: Record<FilterType, string> = {
  all: '#3B82F6',
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444',
}

export function ActivityChart({ articles }: ActivityChartProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const chartData = useMemo(() => {
    const now = new Date()
    const hours: { hour: string; all: number; positive: number; neutral: number; negative: number }[] = []

    for (let i = 23; i >= 0; i--) {
      const hourDate = new Date(now)
      hourDate.setHours(now.getHours() - i, 0, 0, 0)
      
      const hourStr = hourDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      })

      const hourStart = new Date(hourDate)
      const hourEnd = new Date(hourDate)
      hourEnd.setHours(hourDate.getHours() + 1)

      const hourArticles = articles.filter((a) => {
        const pubDate = new Date(a.publishedAt)
        return pubDate >= hourStart && pubDate < hourEnd
      })

      hours.push({
        hour: hourStr,
        all: hourArticles.length,
        positive: hourArticles.filter((a) => a.sentiment === 'positive').length,
        neutral: hourArticles.filter((a) => a.sentiment === 'neutral').length,
        negative: hourArticles.filter((a) => a.sentiment === 'negative').length,
      })
    }

    return hours
  }, [articles])

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'positive', label: 'Positive' },
    { key: 'negative', label: 'Negative' },
    { key: 'neutral', label: 'Neutral' },
  ]

  return (
    <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[#F4F5F7]">
            24-Hour Activity
          </h3>
          <p className="text-sm text-[#5B5E6E]">
            Publication frequency over time
          </p>
        </div>
        <div className="flex gap-1 bg-[#1C1D26] rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                filter === f.key
                  ? 'bg-[#13141A] text-[#F4F5F7]'
                  : 'text-[#5B5E6E] hover:text-[#9CA0AE]'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={FILTER_COLORS[filter]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={FILTER_COLORS[filter]}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
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
              labelStyle={{ color: '#F4F5F7', marginBottom: 4 }}
              itemStyle={{ color: '#9CA0AE' }}
            />
            <Area
              type="monotone"
              dataKey={filter}
              stroke={FILTER_COLORS[filter]}
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
