'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Article } from '@/lib/use-articles'

interface SourceBreakdownProps {
  articles: Article[]
}

export function SourceBreakdown({ articles }: SourceBreakdownProps) {
  const sourceData = useMemo(() => {
    const counts: Record<string, { name: string; count: number; color: string }> = {}

    articles.forEach((article) => {
      if (!counts[article.source]) {
        counts[article.source] = {
          name: article.source,
          count: 0,
          color: article.color,
        }
      }
      counts[article.source].count++
    })

    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [articles])

  return (
    <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#F4F5F7]">
          Source Breakdown
        </h3>
        <p className="text-sm text-[#5B5E6E]">
          Articles per source
        </p>
      </div>

      {sourceData.length === 0 ? (
        <p className="text-center text-[#5B5E6E] py-8">No sources available</p>
      ) : (
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData} layout="vertical">
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#5B5E6E', fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA0AE', fontSize: 12 }}
                width={120}
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
                formatter={(value: number) => [`${value} articles`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
