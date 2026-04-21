'use client'

import { useMemo } from 'react'
import { Article } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

interface TopEntitiesProps {
  articles: Article[]
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  PERSON: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]' },
  ORG: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
  LOCATION: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
}

export function TopEntities({ articles }: TopEntitiesProps) {
  const entityCounts = useMemo(() => {
    const counts: Record<string, { name: string; type: string; count: number }> = {}

    articles.forEach((article) => {
      article.entities.forEach((entity) => {
        const key = entity.name
        if (!counts[key]) {
          counts[key] = { name: entity.name, type: entity.type, count: 0 }
        }
        counts[key].count++
      })
    })

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [articles])

  const maxCount = entityCounts[0]?.count || 1

  return (
    <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-[#F4F5F7]">
          Top Mentioned Entities
        </h3>
        <p className="text-sm text-[#5B5E6E]">
          Most frequently mentioned in articles
        </p>
      </div>

      <div className="space-y-3">
        {entityCounts.length === 0 ? (
          <p className="text-center text-[#5B5E6E] py-8">
            No entities detected
          </p>
        ) : (
          entityCounts.map((entity, index) => (
            <div key={entity.name} className="flex items-center gap-3">
              <span className="w-5 text-sm text-[#5B5E6E] text-right">
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#F4F5F7]">
                      {entity.name}
                    </span>
                    <span
                      className={cn(
                        'px-1.5 py-0.5 text-[10px] font-medium rounded',
                        TYPE_COLORS[entity.type]?.bg || 'bg-[#5B5E6E]/10',
                        TYPE_COLORS[entity.type]?.text || 'text-[#5B5E6E]'
                      )}
                    >
                      {entity.type}
                    </span>
                  </div>
                  <span className="text-sm text-[#9CA0AE]">{entity.count}</span>
                </div>
                <div className="h-1.5 bg-[#1C1D26] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      entity.type === 'PERSON' && 'bg-[#3B82F6]',
                      entity.type === 'ORG' && 'bg-[#10B981]',
                      entity.type === 'LOCATION' && 'bg-[#F59E0B]'
                    )}
                    style={{ width: `${(entity.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
