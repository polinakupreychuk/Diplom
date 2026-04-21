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

interface VisualAnalysisProps {
  articles: Article[]
}

export function VisualAnalysis({ articles }: VisualAnalysisProps) {
  const { objectData, coverageData } = useMemo(() => {
    // Count detected objects across all articles
    const objectCounts: Record<string, number> = {}
    
    for (const article of articles) {
      if (article.imageAnalysis) {
        for (const obj of article.imageAnalysis.detectedObjects) {
          objectCounts[obj.label] = (objectCounts[obj.label] || 0) + 1
        }
      }
    }
    
    // Sort by count and take top 8
    const objectData = Object.entries(objectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([label, count]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        count,
      }))

    // Calculate image coverage per source
    const sourceStats: Record<string, { with: number; without: number; color: string }> = {}
    
    for (const article of articles) {
      if (!sourceStats[article.source]) {
        sourceStats[article.source] = { with: 0, without: 0, color: article.color }
      }
      if (article.imageUrl) {
        sourceStats[article.source].with++
      } else {
        sourceStats[article.source].without++
      }
    }
    
    const coverageData = Object.entries(sourceStats).map(([source, stats]) => ({
      source: source.length > 12 ? source.slice(0, 12) + '...' : source,
      fullSource: source,
      withImage: stats.with,
      withoutImage: stats.without,
      color: stats.color,
      percentage: Math.round((stats.with / (stats.with + stats.without)) * 100) || 0,
    }))

    return { objectData, coverageData }
  }, [articles])

  if (articles.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top Detected Objects */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[#F4F5F7] mb-4">
          Top Detected Objects
        </h3>
        {objectData.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={objectData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  stroke="#5B5E6E"
                  tick={{ fill: '#9CA0AE', fontSize: 12 }}
                  axisLine={{ stroke: '#22242E' }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#5B5E6E"
                  tick={{ fill: '#9CA0AE', fontSize: 12 }}
                  axisLine={{ stroke: '#22242E' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1D26',
                    border: '1px solid #22242E',
                    borderRadius: '8px',
                    color: '#F4F5F7',
                  }}
                  labelStyle={{ color: '#9CA0AE' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {objectData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index % 2 === 0 ? '#3B82F6' : '#10B981'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-[#5B5E6E]">
            No visual data available
          </div>
        )}
      </div>

      {/* Image Coverage by Source */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
        <h3 className="text-base font-semibold text-[#F4F5F7] mb-4">
          Image Coverage by Source
        </h3>
        <div className="space-y-4">
          {coverageData.map((source) => (
            <div key={source.fullSource}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm text-[#9CA0AE]">{source.source}</span>
                </div>
                <span className="text-sm font-medium text-[#F4F5F7]">
                  {source.percentage}%
                </span>
              </div>
              <div className="h-3 bg-[#1C1D26] rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${source.percentage}%`,
                    backgroundColor: source.color,
                  }}
                />
                <div
                  className="h-full bg-[#22242E] transition-all"
                  style={{ width: `${100 - source.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-[#5B5E6E]">
                <span>{source.withImage} with images</span>
                <span>{source.withoutImage} without</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
