import { useState, useEffect } from 'react'
import {
  X, MapPin, AlertTriangle, Clock, Calendar, User, Shield,
  Waves, Flame, Wind, Zap, Activity, CheckCircle2, Play,
  Radio, ChevronRight, Cpu, List, YoutubeIcon
} from 'lucide-react'
import axios from 'axios'

// ─── Severity Config ────────────────────────────────────────────────────────
const severityConfig = {
  High:   { badge: 'bg-red-500/20 text-red-400 border-red-500/40',    bar: 'bg-red-500',    border: 'border-l-red-500',    glow: 'shadow-red-500/10',    score: 90 },
  Medium: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', bar: 'bg-orange-500', border: 'border-l-orange-500', glow: 'shadow-orange-500/10', score: 60 },
  Low:    { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-yellow-500', border: 'border-l-yellow-500', glow: 'shadow-yellow-500/10', score: 35 },
}

const disasterIcons = {
  Earthquake: Zap, Flood: Waves, Fire: Flame, Cyclone: Wind,
  Tsunami: Waves, Landslide: AlertTriangle, default: AlertTriangle,
}

// ─── Demo social media / video content ───────────────────────────────────────
const SOCIAL_FEEDS = {
  Flood: [
    { title: 'Flood rescue operations underway — NDTV 24x7', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0', platform: 'YouTube' },
    { title: 'Flood warning zones mapped — IMD Update', thumb: 'https://img.youtube.com/vi/CnPbWMBCNyk/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=CnPbWMBCNyk', platform: 'YouTube' },
    { title: 'Rescue boats deployed in affected districts', thumb: 'https://img.youtube.com/vi/B1sHO9gBahA/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=B1sHO9gBahA', platform: 'YouTube' },
  ],
  Earthquake: [
    { title: 'Earthquake tremors felt — Live coverage', thumb: 'https://img.youtube.com/vi/D8IbN0DJNSE/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=D8IbN0DJNSE', platform: 'YouTube' },
    { title: 'Seismic activity report — IMD Bulletin', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0', platform: 'YouTube' },
  ],
  Fire: [
    { title: 'Fire brigade response — Live footage', thumb: 'https://img.youtube.com/vi/B1sHO9gBahA/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=B1sHO9gBahA', platform: 'YouTube' },
    { title: 'Fire safety guidelines — NDMA', thumb: 'https://img.youtube.com/vi/CnPbWMBCNyk/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=CnPbWMBCNyk', platform: 'YouTube' },
  ],
  default: [
    { title: 'NDMA Disaster response framework — Full video', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0', platform: 'YouTube' },
    { title: 'Emergency preparedness guide — India', thumb: 'https://img.youtube.com/vi/CnPbWMBCNyk/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=CnPbWMBCNyk', platform: 'YouTube' },
  ],
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DisasterDetailPanel({ disaster, onClose }) {
  const [advisory, setAdvisory] = useState(null)
  const [checklistChecked, setChecklistChecked] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!disaster) { setVisible(false); return }
    setVisible(true)
    setChecklistChecked([])
    setAdvisory(null)

    axios.get(`${import.meta.env.VITE_API_URL}/api/disaster-advisory/${encodeURIComponent(disaster.type)}`)
      .then(res => setAdvisory(res.data))
      .catch(() => setAdvisory({ advisory: [], impact: 'Advisory unavailable.', checklist: [] }))
  }, [disaster])

  if (!disaster) return null

  const s = severityConfig[disaster.severity] || severityConfig.Low
  const DisasterIcon = disasterIcons[disaster.type] || disasterIcons.default
  const feeds = SOCIAL_FEEDS[disaster.type] || SOCIAL_FEEDS.default
  const severityScore = disaster.severityScore || s.score

  const toggleCheck = (i) =>
    setChecklistChecked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-gray-950 border-l-4 ${s.border} z-50 overflow-y-auto
          shadow-2xl flex flex-col transition-transform duration-400 ease-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-950/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${s.badge}`}>
              <DisasterIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Disaster Intelligence Panel</h2>
              <p className="text-gray-500 text-xs mt-0.5">Emergency Response System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 pb-10">

          {/* ── Section 1: Disaster Overview ────────────────────────────── */}
          <div className={`rounded-2xl border border-gray-800 overflow-hidden`}>
            <div className={`px-4 py-2.5 border-b border-gray-800/60 flex items-center gap-2`}>
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Disaster Overview</span>
            </div>
            <div className="p-4 space-y-4 bg-gray-900/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-white">{disaster.type} Alert</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-400 text-sm">{disaster.location}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-bold rounded-full border flex-shrink-0 ${s.badge}`}>
                  {disaster.severity}
                </span>
              </div>

              {/* Severity bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">Severity Score</span>
                  <span className="text-xs font-bold text-white">{severityScore}/100</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar} transition-all duration-700`} style={{ width: `${severityScore}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Clock,    label: 'Time',        value: disaster.time  || '—' },
                  { icon: Calendar, label: 'Date',        value: disaster.date  || '—' },
                  { icon: User,     label: 'Reported By', value: disaster.name  || 'Anonymous' },
                  { icon: Radio,    label: 'Source',      value: disaster.source || 'Citizen Report' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">{label}</span>
                    </div>
                    <p className="text-sm text-white font-semibold truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 2: Government Advisory ──────────────────────────── */}
          <div className="rounded-2xl border border-orange-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-orange-500/20 bg-orange-500/5 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Government Safety Advisory</span>
            </div>
            <div className="p-4 bg-gray-900/40 space-y-2">
              {advisory ? advisory.advisory.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-300 leading-snug">{tip}</p>
                </div>
              )) : (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 3: AI Risk Assessment ────────────────────────────── */}
          <div className="rounded-2xl border border-blue-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-blue-500/20 bg-blue-500/5 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Risk Assessment</span>
              <span className="ml-auto text-xs text-blue-500/60 font-mono">AI GEN</span>
            </div>
            <div className="p-4 bg-gray-900/40">
              {advisory ? (
                <p className="text-sm text-gray-300 leading-relaxed">{advisory.impact}</p>
              ) : (
                <div className="space-y-2">
                  {[1,2].map(i => <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 4: Safety Checklist ──────────────────────────────── */}
          <div className="rounded-2xl border border-green-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-green-500/20 bg-green-500/5 flex items-center gap-2">
              <List className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Safety Checklist</span>
              {advisory && (
                <span className="ml-auto text-xs text-green-500/70 font-medium">
                  {checklistChecked.length}/{advisory.checklist.length} done
                </span>
              )}
            </div>
            <div className="p-4 bg-gray-900/40 space-y-2">
              {advisory ? advisory.checklist.map((item, i) => {
                const done = checklistChecked.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleCheck(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200
                      ${done
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : 'bg-gray-800/40 border-gray-700/40 text-gray-300 hover:bg-gray-800'
                      }`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 transition-colors ${done ? 'text-green-400' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium transition-all ${done ? 'line-through opacity-60' : ''}`}>{item}</span>
                  </button>
                )
              }) : (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Section 5: Live Social Media Feed ────────────────────────── */}
          <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Social Media Reports</span>
            </div>
            <div className="p-4 bg-gray-900/40">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {feeds.map((feed, i) => (
                  <a
                    key={i}
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-48 bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-500 transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={feed.thumb}
                        alt={feed.title}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                        YT
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs text-gray-300 font-medium leading-snug line-clamp-2">{feed.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition-colors border border-gray-700 hover:border-gray-600"
          >
            Close Panel
          </button>

        </div>
      </div>
    </>
  )
}
