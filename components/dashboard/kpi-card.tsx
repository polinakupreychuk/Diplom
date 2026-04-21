'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  badge?: {
    text: string
    variant: 'success' | 'warning' | 'error'
  }
  sparklineData?: number[]
  gauge?: {
    value: number
    label: string
    color: 'green' | 'amber' | 'red'
  }
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  badge,
  sparklineData,
  gauge,
}: KpiCardProps) {
  return (
    <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5 hover:border-[#2E3040] transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1C1D26]">
          <Icon className="w-5 h-5 text-[#3B82F6]" />
        </div>
        {badge && (
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-md',
              badge.variant === 'success' && 'bg-[#10B981]/10 text-[#10B981]',
              badge.variant === 'warning' && 'bg-[#F59E0B]/10 text-[#F59E0B]',
              badge.variant === 'error' && 'bg-[#EF4444]/10 text-[#EF4444]'
            )}
          >
            {badge.text}
          </span>
        )}
      </div>

      <p className="text-sm text-[#9CA0AE] mb-1">{title}</p>
      
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-[#F4F5F7]">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium',
                trend.value >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
              )}
            >
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <svg
            width="80"
            height="32"
            viewBox="0 0 80 32"
            className="text-[#3B82F6]"
          >
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparklineData
                .map((val, i) => {
                  const x = (i / (sparklineData.length - 1)) * 76 + 2
                  const max = Math.max(...sparklineData)
                  const min = Math.min(...sparklineData)
                  const range = max - min || 1
                  const y = 30 - ((val - min) / range) * 26
                  return `${x},${y}`
                })
                .join(' ')}
            />
          </svg>
        )}

        {gauge && (
          <div className="relative w-16 h-16">
            <svg
              viewBox="0 0 36 36"
              className="w-16 h-16 -rotate-90"
            >
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#1C1D26"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={
                  gauge.color === 'green'
                    ? '#10B981'
                    : gauge.color === 'amber'
                    ? '#F59E0B'
                    : '#EF4444'
                }
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${gauge.value * 0.88} 88`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-semibold text-[#F4F5F7]">
                {gauge.value}%
              </span>
            </div>
          </div>
        )}
      </div>

      {gauge && (
        <p className="text-xs text-[#5B5E6E] mt-2">{gauge.label}</p>
      )}
    </div>
  )
}
