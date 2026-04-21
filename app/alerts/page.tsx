'use client'

import { useState, useMemo } from 'react'
import {
  Bell,
  Plus,
  Mail,
  MessageSquare,
  Slack,
  Pencil,
  Trash2,
  X,
  Clock,
  Activity,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useArticles } from '@/lib/use-articles'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'

interface Alert {
  id: string
  name: string
  condition: string
  channels: ('email' | 'telegram' | 'slack')[]
  active: boolean
  lastTriggered: string
}

const SAMPLE_ALERTS: Alert[] = [
  {
    id: '1',
    name: 'Spike: Зеленський',
    condition: 'mentions > 200/hr',
    channels: ['telegram'],
    active: true,
    lastTriggered: '12 min ago',
  },
  {
    id: '2',
    name: 'Negative sentiment: Уряд',
    condition: 'neg ratio > 60%',
    channels: ['email'],
    active: true,
    lastTriggered: '2 hr ago',
  },
  {
    id: '3',
    name: 'New entity spike',
    condition: 'any entity +500% in 30min',
    channels: ['slack'],
    active: false,
    lastTriggered: 'Never',
  },
  {
    id: '4',
    name: 'НАТО mentions surge',
    condition: 'mentions > 150/hr',
    channels: ['email', 'telegram'],
    active: true,
    lastTriggered: '45 min ago',
  },
  {
    id: '5',
    name: 'Source offline',
    condition: 'source unavailable > 5min',
    channels: ['slack', 'email'],
    active: true,
    lastTriggered: '3 days ago',
  },
  {
    id: '6',
    name: 'ЗСУ activity',
    condition: 'mentions > 100/hr',
    channels: ['telegram'],
    active: true,
    lastTriggered: '1 hr ago',
  },
  {
    id: '7',
    name: 'Critical negative spike',
    condition: 'neg articles > 50 in 1hr',
    channels: ['email', 'telegram', 'slack'],
    active: false,
    lastTriggered: '1 week ago',
  },
  {
    id: '8',
    name: 'Харків coverage',
    condition: 'mentions > 80/hr',
    channels: ['email'],
    active: true,
    lastTriggered: '4 hr ago',
  },
]

const CHANNEL_ICONS = {
  email: Mail,
  telegram: MessageSquare,
  slack: Slack,
}

const SPARK_DATA = Array.from({ length: 24 }, () => ({
  value: Math.floor(Math.random() * 100 + 20),
}))

const HISTORY_DATA = [
  { time: '2 hr ago', value: 245 },
  { time: '4 hr ago', value: 189 },
  { time: '6 hr ago', value: 312 },
  { time: '8 hr ago', value: 156 },
  { time: '12 hr ago', value: 278 },
  { time: '1 day ago', value: 201 },
  { time: '2 days ago', value: 167 },
  { time: '3 days ago', value: 234 },
  { time: '5 days ago', value: 145 },
  { time: '1 week ago', value: 289 },
]

export default function AlertsPage() {
  const { articles } = useArticles()
  const [alerts, setAlerts] = useState(SAMPLE_ALERTS)
  const [showModal, setShowModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [newAlert, setNewAlert] = useState({
    name: '',
    metric: 'mentions',
    operator: '>',
    value: '',
    channels: [] as string[],
  })

  // Compute triggered today from real entity spikes
  const triggeredToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const entityCounts: Record<string, number> = {}
    articles
      .filter((a) => new Date(a.publishedAt) >= today)
      .forEach((a) => {
        a.entities.forEach((e) => {
          entityCounts[e.name] = (entityCounts[e.name] || 0) + 1
        })
      })
    
    // Count entities mentioned more than 10 times (arbitrary spike threshold)
    return Object.values(entityCounts).filter((count) => count > 10).length
  }, [articles])

  const activeCount = alerts.filter((a) => a.active).length

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    )
  }

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    if (selectedAlert?.id === id) {
      setSelectedAlert(null)
    }
  }

  const handleCreateAlert = () => {
    if (!newAlert.name || !newAlert.value) return
    const alert: Alert = {
      id: Date.now().toString(),
      name: newAlert.name,
      condition: `${newAlert.metric} ${newAlert.operator} ${newAlert.value}`,
      channels: newAlert.channels as ('email' | 'telegram' | 'slack')[],
      active: true,
      lastTriggered: 'Never',
    }
    setAlerts((prev) => [...prev, alert])
    setShowModal(false)
    setNewAlert({
      name: '',
      metric: 'mentions',
      operator: '>',
      value: '',
      channels: [],
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Alerts" subtitle="Configure monitoring alerts">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Alert
        </button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <span className="text-sm text-[#9CA0AE]">Total Alerts</span>
          </div>
          <span className="text-3xl font-semibold text-[#F4F5F7]">
            {alerts.length}
          </span>
        </div>
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#10B981]" />
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
              <Bell className="w-5 h-5 text-[#EF4444]" />
            </div>
            <span className="text-sm text-[#9CA0AE]">Triggered Today</span>
          </div>
          <span className="text-3xl font-semibold text-[#EF4444]">
            {triggeredToday}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Alerts Table */}
        <div className="flex-1 bg-[#13141A] border border-[#22242E] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#22242E]">
                <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Condition
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Channels
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Last Triggered
                </th>
                <th className="text-right py-4 px-5 text-xs font-medium text-[#5B5E6E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={cn(
                    'border-b border-[#22242E] last:border-0 cursor-pointer transition-colors',
                    selectedAlert?.id === alert.id
                      ? 'bg-[#1C1D26]'
                      : 'hover:bg-[#1C1D26]/50'
                  )}
                >
                  <td className="py-4 px-5 text-sm font-medium text-[#F4F5F7]">
                    {alert.name}
                  </td>
                  <td className="py-4 px-5 text-sm text-[#9CA0AE]">
                    {alert.condition}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      {alert.channels.map((channel) => {
                        const Icon = CHANNEL_ICONS[channel]
                        return (
                          <Icon
                            key={channel}
                            className="w-4 h-4 text-[#5B5E6E]"
                          />
                        )
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAlert(alert.id)
                      }}
                      className={cn(
                        'relative w-10 h-5 rounded-full transition-colors',
                        alert.active ? 'bg-[#10B981]' : 'bg-[#22242E]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                          alert.active ? 'left-5' : 'left-0.5'
                        )}
                      />
                    </button>
                  </td>
                  <td className="py-4 px-5 text-sm text-[#5B5E6E]">
                    {alert.lastTriggered}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-[#5B5E6E] hover:text-[#9CA0AE] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAlert(alert.id)
                        }}
                        className="p-1.5 text-[#5B5E6E] hover:text-[#EF4444] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Drawer */}
        {selectedAlert && (
          <div className="w-80 bg-[#13141A] border border-[#22242E] rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#F4F5F7]">
                {selectedAlert.name}
              </h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 text-[#5B5E6E] hover:text-[#9CA0AE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sparkline */}
            <div>
              <p className="text-xs text-[#5B5E6E] mb-2">24h Activity</p>
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SPARK_DATA}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trigger History */}
            <div>
              <p className="text-xs text-[#5B5E6E] mb-3">Trigger History</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {HISTORY_DATA.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-[#22242E] last:border-0"
                  >
                    <span className="text-xs text-[#9CA0AE]">{item.time}</span>
                    <span className="text-xs text-[#F4F5F7]">
                      {item.value} mentions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Silence Buttons */}
            <div>
              <p className="text-xs text-[#5B5E6E] mb-3">Silence for</p>
              <div className="flex gap-2">
                {['1h', '24h', '1 week'].map((duration) => (
                  <button
                    key={duration}
                    className="flex-1 px-3 py-2 bg-[#1C1D26] border border-[#22242E] rounded-lg text-xs text-[#9CA0AE] hover:text-[#F4F5F7] hover:border-[#2E3040] transition-colors"
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#F4F5F7]">
                Create Alert
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
                  value={newAlert.name}
                  onChange={(e) =>
                    setNewAlert((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  placeholder="Alert name"
                />
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Condition
                </label>
                <div className="flex gap-2">
                  <select
                    value={newAlert.metric}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        metric: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="mentions">Mentions/hr</option>
                    <option value="negative">Negative ratio</option>
                    <option value="positive">Positive ratio</option>
                  </select>
                  <select
                    value={newAlert.operator}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        operator: e.target.value,
                      }))
                    }
                    className="w-20 px-3 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="=">=</option>
                  </select>
                  <input
                    type="number"
                    value={newAlert.value}
                    onChange={(e) =>
                      setNewAlert((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="w-24 px-3 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                    placeholder="Value"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#9CA0AE] mb-2">
                  Channels
                </label>
                <div className="flex gap-3">
                  {(['email', 'telegram', 'slack'] as const).map((channel) => {
                    const Icon = CHANNEL_ICONS[channel]
                    const isSelected = newAlert.channels.includes(channel)
                    return (
                      <button
                        key={channel}
                        onClick={() =>
                          setNewAlert((prev) => ({
                            ...prev,
                            channels: isSelected
                              ? prev.channels.filter((c) => c !== channel)
                              : [...prev.channels, channel],
                          }))
                        }
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
                          isSelected
                            ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]'
                            : 'border-[#22242E] text-[#5B5E6E] hover:text-[#9CA0AE]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm capitalize">{channel}</span>
                      </button>
                    )
                  })}
                </div>
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
                onClick={handleCreateAlert}
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
