'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Key,
  CreditCard,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'notifications' | 'api' | 'plan'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
}

const SAMPLE_API_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production',
    key: 'mp_live_sk_a1b2c3d4e5f6g7h8i9j0',
    created: 'Jan 15, 2024',
    lastUsed: '2 hours ago',
  },
  {
    id: '2',
    name: 'Development',
    key: 'mp_test_sk_z9y8x7w6v5u4t3s2r1q0',
    created: 'Feb 3, 2024',
    lastUsed: '5 days ago',
  },
]

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'api', label: 'API Keys', icon: Key },
  { key: 'plan', label: 'Plan', icon: CreditCard },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'j.doe@mediapulse.io',
    role: 'Analyst',
    language: 'en',
    timezone: 'Europe/Kyiv',
  })
  const [notifications, setNotifications] = useState({
    email: true,
    telegram: true,
    slack: false,
    frequency: 'immediate',
    quietHours: false,
    quietFrom: '22:00',
    quietTo: '08:00',
  })
  const [apiKeys, setApiKeys] = useState(SAMPLE_API_KEYS)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const maskKey = (key: string) => {
    return key.slice(0, 12) + '••••••••••••••••'
  }

  const copyKey = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const generateNewKey = () => {
    if (!newKeyName.trim()) return
    const key = `mp_live_sk_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    setGeneratedKey(key)
    setCountdown(30)

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setShowKeyModal(false)
          setGeneratedKey('')
          setNewKeyName('')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    setApiKeys((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newKeyName,
        key,
        created: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        lastUsed: 'Never',
      },
    ])
  }

  const deleteKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-56 shrink-0">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                      : 'text-[#9CA0AE] hover:text-[#F4F5F7] hover:bg-[#1C1D26]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-xl font-semibold">
                  JD
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#F4F5F7]">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-[#5B5E6E]">{profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => {
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => {
                      setProfile((prev) => ({ ...prev, email: e.target.value }))
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Role
                  </label>
                  <select
                    value={profile.role}
                    onChange={(e) => {
                      setProfile((prev) => ({ ...prev, role: e.target.value }))
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Language
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Timezone
                  </label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => {
                      setProfile((prev) => ({
                        ...prev,
                        timezone: e.target.value,
                      }))
                      setHasChanges(true)
                    }}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                  >
                    <option value="Europe/Kyiv">
                      Europe/Kyiv (UTC+2)
                    </option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#22242E]">
                <button
                  disabled={!hasChanges}
                  onClick={() => setHasChanges(false)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    hasChanges
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                      : 'bg-[#1C1D26] text-[#5B5E6E] cursor-not-allowed'
                  )}
                >
                  Save Changes
                </button>
              </div>

              {/* Data Types Processed Section */}
              <div className="pt-6 border-t border-[#22242E]">
                <h4 className="text-sm font-semibold text-[#F4F5F7] mb-4">
                  Data Types Processed
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#1C1D26] rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#10B981]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F4F5F7]">
                        Text Content
                      </p>
                      <p className="text-xs text-[#5B5E6E]">
                        NLP processing, sentiment analysis, entity extraction
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#1C1D26] rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#3B82F6]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F4F5F7]">
                        Visual Content
                      </p>
                      <p className="text-xs text-[#5B5E6E]">
                        Computer vision object detection, tagging, color analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#1C1D26] rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F4F5F7]">
                        Metadata
                      </p>
                      <p className="text-xs text-[#5B5E6E]">
                        Timestamps, source tracking, geolocation, publication data
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6 space-y-6">
              <div className="space-y-4">
                {[
                  {
                    key: 'email',
                    label: 'Email Notifications',
                    desc: 'Receive alerts via email',
                  },
                  {
                    key: 'telegram',
                    label: 'Telegram Bot',
                    desc: 'Get instant alerts on Telegram',
                  },
                  {
                    key: 'slack',
                    label: 'Slack Webhook',
                    desc: 'Post alerts to Slack channels',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-[#22242E] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#F4F5F7]">
                        {item.label}
                      </p>
                      <p className="text-xs text-[#5B5E6E]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]:
                            !prev[item.key as keyof typeof notifications],
                        }))
                      }
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        notifications[
                          item.key as keyof typeof notifications
                        ]
                          ? 'bg-[#10B981]'
                          : 'bg-[#22242E]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                          notifications[
                            item.key as keyof typeof notifications
                          ]
                            ? 'left-6'
                            : 'left-1'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#22242E]">
                <p className="text-sm font-medium text-[#F4F5F7] mb-3">
                  Alert Frequency
                </p>
                <div className="flex gap-2">
                  {['immediate', '15min', 'hourly', 'daily'].map((freq) => (
                    <button
                      key={freq}
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          frequency: freq,
                        }))
                      }
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        notifications.frequency === freq
                          ? 'bg-[#3B82F6] text-white'
                          : 'bg-[#1C1D26] text-[#9CA0AE] hover:text-[#F4F5F7]'
                      )}
                    >
                      {freq === 'immediate'
                        ? 'Immediately'
                        : freq === '15min'
                        ? 'Every 15 min'
                        : freq === 'hourly'
                        ? 'Hourly'
                        : 'Daily'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#22242E]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-[#F4F5F7]">
                      Quiet Hours
                    </p>
                    <p className="text-xs text-[#5B5E6E]">
                      Pause notifications during specific hours
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        quietHours: !prev.quietHours,
                      }))
                    }
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      notifications.quietHours
                        ? 'bg-[#10B981]'
                        : 'bg-[#22242E]'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        notifications.quietHours ? 'left-6' : 'left-1'
                      )}
                    />
                  </button>
                </div>
                {notifications.quietHours && (
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-xs text-[#5B5E6E] mb-1">
                        From
                      </label>
                      <input
                        type="time"
                        value={notifications.quietFrom}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            quietFrom: e.target.value,
                          }))
                        }
                        className="px-3 py-2 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] text-sm focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#5B5E6E] mb-1">
                        To
                      </label>
                      <input
                        type="time"
                        value={notifications.quietTo}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            quietTo: e.target.value,
                          }))
                        }
                        className="px-3 py-2 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] text-sm focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#F4F5F7]">
                    API Keys
                  </h3>
                  <p className="text-sm text-[#5B5E6E]">
                    Manage your API access keys
                  </p>
                </div>
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Generate New Key
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#22242E]">
                    <th className="text-left py-3 text-xs font-medium text-[#5B5E6E] uppercase">
                      Name
                    </th>
                    <th className="text-left py-3 text-xs font-medium text-[#5B5E6E] uppercase">
                      Key
                    </th>
                    <th className="text-left py-3 text-xs font-medium text-[#5B5E6E] uppercase">
                      Created
                    </th>
                    <th className="text-left py-3 text-xs font-medium text-[#5B5E6E] uppercase">
                      Last Used
                    </th>
                    <th className="text-right py-3 text-xs font-medium text-[#5B5E6E] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-[#22242E] last:border-0"
                    >
                      <td className="py-4 text-sm font-medium text-[#F4F5F7]">
                        {key.name}
                      </td>
                      <td className="py-4">
                        <code className="text-sm text-[#9CA0AE] font-mono">
                          {visibleKeys.has(key.id)
                            ? key.key
                            : maskKey(key.key)}
                        </code>
                      </td>
                      <td className="py-4 text-sm text-[#5B5E6E]">
                        {key.created}
                      </td>
                      <td className="py-4 text-sm text-[#5B5E6E]">
                        {key.lastUsed}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1.5 text-[#5B5E6E] hover:text-[#9CA0AE] transition-colors"
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyKey(key.key, key.id)}
                            className="p-1.5 text-[#5B5E6E] hover:text-[#9CA0AE] transition-colors"
                          >
                            {copiedKey === key.id ? (
                              <Check className="w-4 h-4 text-[#10B981]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteKey(key.id)}
                            className="px-3 py-1 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors"
                          >
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="space-y-6">
              <div className="bg-[#13141A] border-2 border-[#3B82F6] rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#F4F5F7]">
                      Pro Plan
                    </h3>
                    <p className="text-2xl font-bold text-[#F4F5F7] mt-1">
                      $49
                      <span className="text-sm font-normal text-[#5B5E6E]">
                        /month
                      </span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-sm font-medium rounded-lg">
                    Active
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Sources', used: 6, max: 10 },
                    { label: 'Publications', used: 623, max: 10000 },
                    { label: 'API Requests', used: 8400, max: 50000 },
                    { label: 'Team Members', used: 2, max: 5 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-[#9CA0AE]">{item.label}</span>
                        <span className="text-[#F4F5F7]">
                          {item.used.toLocaleString()} /{' '}
                          {item.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-[#1C1D26] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#3B82F6] rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (item.used / item.max) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#F4F5F7] mb-2">
                  Upgrade to Enterprise
                </h3>
                <p className="text-sm text-[#5B5E6E] mb-4">
                  Get unlimited access and priority support
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-[#9CA0AE]">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    Unlimited sources and publications
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#9CA0AE]">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    Custom integrations and webhooks
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#9CA0AE]">
                    <Check className="w-4 h-4 text-[#10B981]" />
                    Dedicated account manager
                  </li>
                </ul>
                <button className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] text-[#F4F5F7] rounded-lg hover:bg-[#22242E] transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-6 w-full max-w-md">
            {!generatedKey ? (
              <>
                <h3 className="text-lg font-semibold text-[#F4F5F7] mb-6">
                  Generate New API Key
                </h3>
                <div className="mb-6">
                  <label className="block text-sm text-[#9CA0AE] mb-2">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-[#F4F5F7] focus:outline-none focus:border-[#3B82F6]"
                    placeholder="e.g., Production, Staging"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 text-[#9CA0AE] hover:text-[#F4F5F7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateNewKey}
                    disabled={!newKeyName.trim()}
                    className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#F4F5F7] mb-2">
                  Your New API Key
                </h3>
                <p className="text-sm text-[#EF4444] mb-4">
                  This key will not be shown again. Copy it now.
                </p>
                <div className="flex items-center gap-2 p-3 bg-[#1C1D26] rounded-lg mb-4">
                  <code className="flex-1 text-sm text-[#F4F5F7] font-mono break-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={() => copyKey(generatedKey, 'new')}
                    className="p-2 text-[#5B5E6E] hover:text-[#9CA0AE] transition-colors"
                  >
                    {copiedKey === 'new' ? (
                      <Check className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#5B5E6E] text-center">
                  Auto-closing in {countdown} seconds...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
