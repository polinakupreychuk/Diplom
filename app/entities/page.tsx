'use client'

import { useState, useMemo } from 'react'
import { RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { useArticles } from '@/lib/use-articles'
import { cn } from '@/lib/utils'

interface NodeData {
  name: string
  type: 'PERSON' | 'ORG' | 'LOCATION'
  x: number
  y: number
}

interface EdgeData {
  from: string
  to: string
  strength: number
}

const NODES: NodeData[] = [
  { name: 'Зеленський', type: 'PERSON', x: 450, y: 150 },
  { name: 'Залужний', type: 'PERSON', x: 220, y: 300 },
  { name: 'Шмигаль', type: 'PERSON', x: 680, y: 300 },
  { name: 'Верховна Рада', type: 'ORG', x: 450, y: 380 },
  { name: 'НАТО', type: 'ORG', x: 180, y: 160 },
  { name: 'ЗСУ', type: 'ORG', x: 300, y: 470 },
  { name: 'Міноборони', type: 'ORG', x: 150, y: 420 },
  { name: 'ЄС', type: 'ORG', x: 720, y: 160 },
  { name: 'Київ', type: 'LOCATION', x: 560, y: 470 },
  { name: 'США', type: 'LOCATION', x: 90, y: 260 },
  { name: 'Польща', type: 'LOCATION', x: 760, y: 280 },
  { name: 'Харків', type: 'LOCATION', x: 650, y: 490 },
  { name: 'Росія', type: 'LOCATION', x: 820, y: 400 },
]

const EDGES: EdgeData[] = [
  { from: 'Зеленський', to: 'Верховна Рада', strength: 0.9 },
  { from: 'Зеленський', to: 'НАТО', strength: 0.85 },
  { from: 'Зеленський', to: 'ЗСУ', strength: 0.8 },
  { from: 'Залужний', to: 'ЗСУ', strength: 0.95 },
  { from: 'Залужний', to: 'Міноборони', strength: 0.88 },
  { from: 'НАТО', to: 'США', strength: 0.9 },
  { from: 'НАТО', to: 'ЄС', strength: 0.82 },
  { from: 'Київ', to: 'Зеленський', strength: 0.7 },
  { from: 'Харків', to: 'ЗСУ', strength: 0.65 },
  { from: 'Росія', to: 'США', strength: 0.6 },
  { from: 'Шмигаль', to: 'Верховна Рада', strength: 0.75 },
  { from: 'Польща', to: 'ЄС', strength: 0.7 },
  { from: 'ЄС', to: 'Зеленський', strength: 0.68 },
]

const TYPE_COLORS: Record<string, string> = {
  PERSON: '#3B82F6',
  ORG: '#10B981',
  LOCATION: '#F59E0B',
}

export default function EntitiesPage() {
  const { articles, isLoading, lastUpdated } = useArticles()
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    PERSON: true,
    ORG: true,
    LOCATION: true,
  })

  const mentionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    articles.forEach((article) => {
      article.entities.forEach((entity) => {
        counts[entity.name] = (counts[entity.name] || 0) + 1
      })
    })
    return counts
  }, [articles])

  const maxMentions = Math.max(...Object.values(mentionCounts), 1)

  const filteredNodes = NODES.filter((node) => filters[node.type])
  const filteredEdges = EDGES.filter((edge) => {
    const fromNode = NODES.find((n) => n.name === edge.from)
    const toNode = NODES.find((n) => n.name === edge.to)
    return (
      fromNode &&
      toNode &&
      filters[fromNode.type] &&
      filters[toNode.type]
    )
  })

  const getNodeRadius = (name: string) => {
    const count = mentionCounts[name] || 0
    return 14 + (count / maxMentions) * 18
  }

  const getConnectedNodes = (nodeName: string) => {
    const connected: string[] = []
    EDGES.forEach((edge) => {
      if (edge.from === nodeName) connected.push(edge.to)
      if (edge.to === nodeName) connected.push(edge.from)
    })
    return connected
  }

  const typeCounts = useMemo(() => {
    return {
      PERSON: filteredNodes.filter((n) => n.type === 'PERSON').length,
      ORG: filteredNodes.filter((n) => n.type === 'ORG').length,
      LOCATION: filteredNodes.filter((n) => n.type === 'LOCATION').length,
    }
  }, [filteredNodes])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Entity Map" subtitle="Relationship network visualization" />
        <div className="bg-[#13141A] border border-[#22242E] rounded-xl h-[600px] skeleton-shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entity Map"
        subtitle="Relationship network visualization"
        lastUpdated={lastUpdated}
      />

      <div className="flex gap-6">
        {/* Sidebar Panel */}
        <div className="w-60 shrink-0 space-y-6">
          {/* Filter by Type */}
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
            <h3 className="text-sm font-medium text-[#F4F5F7] mb-4">
              Filter by Type
            </h3>
            <div className="space-y-3">
              {(['PERSON', 'ORG', 'LOCATION'] as const).map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters[type]}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [type]: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded border-[#22242E] bg-[#1C1D26] text-[#3B82F6] focus:ring-[#3B82F6] focus:ring-offset-0"
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                  />
                  <span className="text-sm text-[#9CA0AE]">
                    {type === 'PERSON'
                      ? 'Person'
                      : type === 'ORG'
                      ? 'Organization'
                      : 'Location'}
                  </span>
                  <span className="text-xs text-[#5B5E6E] ml-auto">
                    {typeCounts[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset View */}
          <button
            onClick={() =>
              setFilters({ PERSON: true, ORG: true, LOCATION: true })
            }
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1D26] border border-[#22242E] rounded-lg text-sm text-[#9CA0AE] hover:text-[#F4F5F7] hover:border-[#2E3040] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset View
          </button>

          {/* Legend */}
          <div className="bg-[#13141A] border border-[#22242E] rounded-xl p-5">
            <h3 className="text-sm font-medium text-[#F4F5F7] mb-4">Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#3B82F6]" />
                <span className="text-sm text-[#9CA0AE]">Person</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#10B981]" />
                <span className="text-sm text-[#9CA0AE]">Organization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F59E0B]" />
                <span className="text-sm text-[#9CA0AE]">Location</span>
              </div>
              <div className="pt-3 border-t border-[#22242E]">
                <p className="text-xs text-[#5B5E6E]">
                  Node size indicates mention frequency. Line thickness shows
                  relationship strength.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="flex-1 bg-[#13141A] border border-[#22242E] rounded-xl p-4 overflow-hidden">
          <svg
            viewBox="0 0 900 580"
            className="w-full h-auto"
            style={{ minHeight: '500px' }}
          >
            {/* Edges */}
            {filteredEdges.map((edge, index) => {
              const fromNode = NODES.find((n) => n.name === edge.from)
              const toNode = NODES.find((n) => n.name === edge.to)
              if (!fromNode || !toNode) return null

              const isHighlighted =
                hoveredNode === edge.from || hoveredNode === edge.to
              const isDimmed = hoveredNode && !isHighlighted

              return (
                <line
                  key={index}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isHighlighted ? '#FFFFFF' : 'rgba(148,163,184,0.3)'}
                  strokeWidth={1 + edge.strength * 2}
                  opacity={isDimmed ? 0.2 : 1}
                  className="transition-all duration-200"
                />
              )
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const radius = getNodeRadius(node.name)
              const isHovered = hoveredNode === node.name
              const isConnected =
                hoveredNode && getConnectedNodes(hoveredNode).includes(node.name)
              const isDimmed = hoveredNode && !isHovered && !isConnected
              const connected = getConnectedNodes(node.name)

              return (
                <g
                  key={node.name}
                  onMouseEnter={() => setHoveredNode(node.name)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                >
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={TYPE_COLORS[node.type]}
                    opacity={isDimmed ? 0.2 : 1}
                    stroke={isHovered ? '#FFFFFF' : 'transparent'}
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 16}
                    textAnchor="middle"
                    className="text-[11px] font-medium fill-[#9CA0AE] transition-all duration-200"
                    opacity={isDimmed ? 0.2 : 1}
                  >
                    {node.name}
                  </text>

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={node.x + radius + 10}
                        y={node.y - 50}
                        width={160}
                        height={90}
                        rx={8}
                        fill="#1C1D26"
                        stroke="#2E3040"
                        strokeWidth={1}
                      />
                      <text
                        x={node.x + radius + 22}
                        y={node.y - 28}
                        className="text-[13px] font-semibold fill-[#F4F5F7]"
                      >
                        {node.name}
                      </text>
                      <text
                        x={node.x + radius + 22}
                        y={node.y - 10}
                        className="text-[11px] fill-[#5B5E6E]"
                      >
                        {node.type} | {mentionCounts[node.name] || 0} mentions
                      </text>
                      <text
                        x={node.x + radius + 22}
                        y={node.y + 10}
                        className="text-[10px] fill-[#5B5E6E]"
                      >
                        Connected to:
                      </text>
                      <text
                        x={node.x + radius + 22}
                        y={node.y + 26}
                        className="text-[11px] fill-[#9CA0AE]"
                      >
                        {connected.slice(0, 2).join(', ')}
                        {connected.length > 2 && ` +${connected.length - 2}`}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}
