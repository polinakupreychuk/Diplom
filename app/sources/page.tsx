'use client'

import { useState, useMemo } from 'react'
import {
  Database,
  Plus,
  RefreshCw,
  AlertTriangle,
  X,
  CheckCircle,
  PauseCircle,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useArticles } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

interface Source {
  id: string
  name: string
  type: 'RSS' | 'Scraper' | 'API' | 'Twitter'
  status: 'Active' | 'Paused' | 'Error'
  lastChecked: string
  publications: number
  latency: number | null
}

const SAMPLE_SOURCES: Source[] = [
  {
    id: '1',
    name: 'Українська правда',
    type: 'RSS',
    status: 'Active',
    lastChecked: '2 min ago',
    publications: 143,
    latency: 120,
  },
  {
    id: '2',
    name: 'TSN.ua',
    type: 'Scraper',
    status: 'Active',
    lastChecked: '5 min ago',
    publications: 89,
    latency: 340,
  },
  {
    id: '3',
    name: 'Twitter/X API',
    type: 'API',
    status: 'Active',
    lastChecked: '1 min ago',
    publications: 312,
    latency: 85,
  },
  {
    id: '4',
    name: 'Суспільне',
    type: 'RSS',
    status: 'Active',
    lastChecked: '8 min ago',
    publications: 67,
    latency: 156,
  },
  {
    id: '5',
    name: 'Дзеркало тижня',
    type: 'RSS',
    status: 'Paused',
    lastChecked: '2 hr ago',
    publications: 12,
    latency: 203,
  },
  {
    id: '6',
    name: 'Радіо Свобода',
    type: 'RSS',
    status: 'Error',
    lastChecked: '47 min ago',
    publications: 0,
    latency: null,
  },
]

const STATUS_CONFIG = {
  Active: {
    icon: CheckCircle,
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]',
  },
  Paused: {
    icon: PauseCircle,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]',
  },
  Error: {
    icon: XCircle,
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]',
  },
}

export default function SourcesPage() {
  const { articles } = useArticles()
  const [sources, setSources] = useState(SAMPLE_SOURCES)
  const [showModal, setShowModal] = useState(false)
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    type: 'RSS',
    interval: '5',
    authToken: '',
  })

  // Compute real publication counts from articles
  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    articles.forEach((a) => {
      if (new Date(a.publishedAt) >= today) {
        stats[a.source] = (stats[a.source] || 0) + 1
      }
    })
    return stats
  }, [articles])

  // Update sample sources with real data
  const sourcesWithRealData = useMemo(() => {
    return sources.map((source) => ({
      ...source,
      publications: sourceStats[source.name] || source.publications,
    }))
  }, [sources, sourceStats])

  const activeCount = sourcesWithRealData.filter((s) => s.status === 'Active').length
  const errorCount = sourcesWithRealData.filter((s) => s.status === 'Error').length

  const getLatencyColor = (latency: number | null) => {
    if (latency === null) return 'text-[#5B5E6E]'
    if (latency <= 200) return 'text-[#10B981]'
    if (latency <= 500) return 'text-[#F59E0B]'
    return 'text-[#EF4444]'
  }

  const handleRetry = (id: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'Active' as const, lastChecked: 'Just now', latency: 180 }
          : s
      )
    )
  }

  const handleAddSource = () => {
    if (!newSource.name || !newSource.url) return
    const source: Source = {
      id: Date.now().toString(),
      name: newSource.name,
      type: newSource.type as Source['type'],
      status: 'Active',
      lastChecked: 'Just now',
      publications: 0,
      latency: Math.floor(Math.random() * 200 + 50),
    }
    setSources((prev) => [...prev, source])
    setShowModal(false)
    setNewSource({
      name: '',
      url: '',
      type: 'RSS',
      interval: '5',
      authToken: '',
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sources"
        subtitle="Manage your data ingestion pipelines"
      >
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <span className="text-sm text-[#9CA0AE]">Total Sources</span>
          </div>
          <span className="text-3xl font-semibold text-[#F4F5F7]">
            {sourcesWithRealData.length}
          </span>
        </div>
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <span className="text-sm text-[#9CA0AE]">Active</span>
          </div>
          <span className="text-3xl font-semibold text-[#10B981]">
            {activeCount}
          </span>
        </div>
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <span className="text-sm text-[#9CA0AE]">Errors</span>
          </div>
          <span className="text-3xl font-semibold text-[#EF4444]">
            {errorCount}
          </span>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-[#13141A] border border-[#22242E] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#22242E]">
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Type
              </th>
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Last Checked
              </th>
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Publications
              </th>
              <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Latency
              </th>
              <th className="text-right py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sourcesWithRealData.map((source) => {
              const statusConfig = STATUS_CONFIG[source.status]
              const StatusIcon = statusConfig.icon
              return (
                <tr
                  key={source.id}
                  className="border-b border-[#22242E] last:border-0 hover:bg-[#1C1D26]/50 transition-colors"
                >
                  <td className="py-4 px-5 text-sm font-medium text-[#F4F5F7]">
                    {source.name}
                  </td>
                  <td className="py-4 px-5">
                    <span className="px-2 py-1 text-xs font-medium bg-[#1C1D26] text-[#9CA0AE] rounded-md">
                      {source.type}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn('w-2 h-2 rounded-full', statusConfig.bg)}
                      />
                      <span className={cn('text-sm', statusConfig.color)}>
                        {source.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-sm text-[#9CA0AE]">
                    {source.lastChecked}
                  </td>
                  <td className="py-4 px-5 text-sm text-[#F4F5F7]">
                    {source.publications}
                  </td>
                  <td
                    className={cn(
                      'py-4 px-5 text-sm',
                      getLatencyColor(source.latency)
                    )}
                  >
                    {source.latency !== null ? `${source.latency}ms` : '—'}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      {source.status === 'Error' && (
                        <button
                          onClick={() => handleRetry(source.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium rounded-lg hover:bg-[#EF4444]/20 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                      )}
                      {source.status === 'Error' && (
                        <div className="relative group">
                          <AlertTriangle className="w-4 h-4 text-[#EF4444] cursor-help" />
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[#1C1D26] border border-[#2E3040] rounded-lg text-xs text-[#9CA0AE] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Connection timeout - unable to reach server
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add Source Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#F4F5F7]">
                Add Source
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#5B5E6E] hover:text-[#9CA0AE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  placeholder="Source name"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">URL</label>
                <input
                  type="url"
                  value={newSource.url}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  placeholder="https://example.com/rss"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Type
                </label>
                <select
                  value={newSource.type}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="RSS">RSS</option>
                  <option value="Scraper">Web Scraper</option>
                  <option value="API">REST API</option>
                  <option value="Twitter">Twitter API</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Crawl Interval
                </label>
                <select
                  value={newSource.interval}
                  onChange={(e) =>
                    setNewSource((prev) => ({
                      ...prev,
                      interval: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="1">Every 1 minute</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="60">Every hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Auth Token (optional)
                </label>
                <input
                  type="password"
                  value={newSource.authToken}
                  onChange={(e) =>
                    setNewSource((prev) => ({
                      ...prev,
                      authToken: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  placeholder="API key or token"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-[#9CA0AE] hover:text-[#F4F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
