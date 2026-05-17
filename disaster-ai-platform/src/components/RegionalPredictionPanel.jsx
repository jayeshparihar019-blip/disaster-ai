import { useMemo, useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import axios from 'axios'

const TYPE_COLORS = {
  flood:      { bar: '#3b82f6', bg: '#1e3a5f', label: '🌊 Flood' },
  cyclone:    { bar: '#8b5cf6', bg: '#2e1f5e', label: '🌀 Cyclone' },
  landslide:  { bar: '#a3a3a3', bg: '#2a2a2a', label: '⛰️ Landslide' },
  earthquake: { bar: '#f97316', bg: '#3d1f07', label: '⚡ Earthquake' },
  heatwave:   { bar: '#ef4444', bg: '#3d0f0f', label: '🌡️ Heatwave' },
  drought:    { bar: '#eab308', bg: '#3d3200', label: '🏜️ Drought' },
}

const TYPE_ACTIONS = {
  flood: 'Check low-lying areas, stage boats/pumps, prepare sandbags.',
  cyclone: 'Verify shelters, pre-position relief, issue coastal warnings.',
  landslide: 'Block risky routes, deploy earthmovers, prepare slope monitoring.',
  earthquake: 'Inspect critical buildings, ready medical triage, keep roads clear.',
  heatwave: 'Open cooling centers, water distribution, advise limited outdoor work.',
  drought: 'Coordinate water tankers, protect crops, update rationing plans.',
}

function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return raw.replace(/\/$/, '')
}

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props
  const radius = 4
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius} fill={fill} />
      <rect x={x} y={y + height - radius} width={width} height={radius} fill={fill} />
    </g>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 shadow-xl">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="text-white font-extrabold text-sm">{payload[0].value}%</div>
    </div>
  )
}

export default function RegionalPredictionPanel({ region }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiBase = useMemo(() => getApiBase(), [])

  useEffect(() => {
    if (!region) return
    const ctrl = new AbortController()

    setLoading(true)
    setError(null)
    setData(null)

    axios
      .get(`${apiBase}/api/regional-prediction?region=${encodeURIComponent(region)}`, { signal: ctrl.signal })
      .then((res) => {
        setData(res.data)
        setLoading(false)
      })
      .catch((e) => {
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return
        setError('Failed to load prediction')
        setLoading(false)
      })

    return () => ctrl.abort()
  }, [apiBase, region])

  if (!region) return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">📍</div>
      <p className="text-gray-200 font-semibold text-sm">Regional AI Prediction</p>
      <p className="text-gray-500 text-xs mt-1">Click an incident on the map (or a table row) to see risk probabilities.</p>
    </div>
  )

  if (loading) return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-gray-400 text-xs">
          Fetching AI predictions for <span className="text-white font-semibold">{region}</span>…
        </span>
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 rounded-md bg-slate-800/60" style={{ opacity: 1 - i * 0.12 }} />
        ))}
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 text-sm text-red-300">
      ⚠️ {error || 'No data available'}
    </div>
  )

  const chartData = Object.entries(data.predictions).map(([type, val]) => ({
    type, name: TYPE_COLORS[type]?.label || type, pct: Math.round(val * 100), color: TYPE_COLORS[type]?.bar || '#888',
  })).sort((a, b) => b.pct - a.pct)

  const topRisk = chartData[0]
  const top3 = chartData.slice(0, 3)

  const riskBadge = (pct) => {
    if (pct >= 70) return { text: 'HIGH RISK', cls: 'text-red-300 border-red-500/30 bg-red-500/10' }
    if (pct >= 40) return { text: 'MEDIUM RISK', cls: 'text-orange-300 border-orange-500/30 bg-orange-500/10' }
    return { text: 'LOW RISK', cls: 'text-yellow-200 border-yellow-500/30 bg-yellow-500/10' }
  }
  const badge = riskBadge(topRisk.pct)

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-gray-500">AI Regional Risk</div>
          <div className="mt-1 text-white font-extrabold text-sm truncate">📍 {data.region}</div>
          <div className="mt-1 text-gray-500 text-xs">
            Source: <span className="text-gray-400 font-mono">{apiBase}</span>
          </div>
        </div>
        <div className={`shrink-0 px-3 py-1 rounded-lg border text-[11px] font-extrabold ${badge.cls}`}>
          {badge.text}
        </div>
      </div>

      <div
        className="rounded-xl border p-3 mb-4 flex items-center justify-between gap-3"
        style={{
          background: TYPE_COLORS[topRisk.type]?.bg || '#111827',
          borderColor: `${topRisk.color}40`,
        }}
      >
        <div className="min-w-0">
          <div className="text-[10px] text-slate-300/80">Highest Risk</div>
          <div className="text-white font-semibold text-sm">{topRisk.name}</div>
          <div className="text-slate-200/80 text-xs mt-1">
            {TYPE_ACTIONS[topRisk.type] || 'Prepare resources and monitor conditions.'}
          </div>
        </div>
        <div className="font-black text-2xl shrink-0" style={{ color: topRisk.color }}>
          {topRisk.pct}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {top3.map((r) => (
          <div key={r.type} className="rounded-xl border border-gray-800 bg-black/20 px-3 py-2">
            <div className="text-[11px] text-gray-300 truncate">{r.name}</div>
            <div className="text-sm font-extrabold mt-0.5" style={{ color: r.color }}>
              {r.pct}%
            </div>
          </div>
        ))}
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 26, bottom: 0, left: 6 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={95} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="pct" shape={<CustomBar />} radius={4}>
              {chartData.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {chartData.map((entry) => (
          <div key={entry.type} className="flex items-center justify-between gap-3">
            <span className="text-gray-300 text-xs">{entry.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${entry.pct}%`, background: entry.color }} />
              </div>
              <span className="text-xs font-bold w-10 text-right" style={{ color: entry.color }}>
                {entry.pct}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500">
        ⚙️ Regional model: knowledge-base + jitter (demo). Click another region to refresh.
      </div>
    </div>
  )
}
