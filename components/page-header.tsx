'use client'

import { useEffect, useState } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  lastUpdated?: Date | null
  children?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  lastUpdated,
  children,
}: PageHeaderProps) {
  const [timeAgo, setTimeAgo] = useState<string>('')

  useEffect(() => {
    if (!lastUpdated) return

    const updateTimeAgo = () => {
      const seconds = Math.floor(
        (new Date().getTime() - lastUpdated.getTime()) / 1000
      )
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (seconds < 3600) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  return (
    <header className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#F4F5F7] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#9CA0AE] mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <div className="flex items-center gap-2 text-sm text-[#9CA0AE]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span>Last updated {timeAgo}</span>
          </div>
        )}
        {children}
      </div>
    </header>
  )
}
