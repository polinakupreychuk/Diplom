'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Newspaper,
  TrendingUp,
  Network,
  Bell,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Images,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/feed', label: 'Live Feed', icon: Newspaper },
  { href: '/trends', label: 'Trends', icon: TrendingUp },
  { href: '/entities', label: 'Entity Map', icon: Network },
  { href: '/gallery', label: 'Media Gallery', icon: Images },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/sources', label: 'Sources', icon: Database },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile overlay */}
      <div className="md:hidden fixed inset-0 bg-black/50 z-40 hidden" />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col border-r border-[#22242E] bg-[#0A0B0F] z-50 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[#22242E]">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#3B82F6]/10">
            <Activity className="w-5 h-5 text-[#3B82F6]" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-[#F4F5F7] text-lg tracking-tight">
              MediaPulse
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-l-2 border-[#3B82F6] ml-0 pl-[10px]'
                    : 'text-[#9CA0AE] hover:text-[#F4F5F7] hover:bg-[#13141A]'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-[#22242E] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-medium text-sm shrink-0">
              JD
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F4F5F7] truncate">
                  John Doe
                </p>
                <p className="text-xs text-[#5B5E6E] truncate">
                  j.doe@mediapulse.io
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#13141A] border border-[#22242E] flex items-center justify-center text-[#9CA0AE] hover:text-[#F4F5F7] hover:border-[#2E3040] transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Spacer for main content */}
      <div
        className={cn(
          'shrink-0 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60'
        )}
      />
    </>
  )
}
