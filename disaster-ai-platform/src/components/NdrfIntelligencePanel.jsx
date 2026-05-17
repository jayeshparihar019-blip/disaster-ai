import { useState, useEffect } from 'react'
import {
  X, MapPin, AlertTriangle, Clock, Calendar, User, Shield,
  Waves, Flame, Wind, Zap, Activity, CheckCircle2, Play,
  Radio, Cpu, List, ChevronRight, Truck, UserCheck,
  PackageCheck, CheckCheck, Loader2
} from 'lucide-react'
import axios from 'axios'

const sev = {
  High:   { badge: 'bg-red-500/20 text-red-400 border-red-500/40',    bar: 'bg-red-500',    border: 'border-l-red-500',    score: 90 },
  Medium: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40', bar: 'bg-orange-500', border: 'border-l-orange-500', score: 60 },
  Low:    { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', bar: 'bg-yellow-500', border: 'border-l-yellow-500', score: 35 },
}

const icons = { Earthquake: Zap, Flood: Waves, Fire: Flame, Cyclone: Wind, Tsunami: Waves, Landslide: AlertTriangle, default: AlertTriangle }

const DISPATCH_MAP = {
  Flood: ['NDRF Rescue Boats', 'Medical Teams', 'Evacuation Buses', 'Water Pumps'],
  Earthquake: ['Search & Rescue Teams', 'Medical Units', 'Heavy Machinery', 'Sniffer Dogs'],
  Fire: ['Fire Brigade Units', 'Aerial Tankers', 'Ambulances', 'Evacuation Teams'],
  Cyclone: ['Coastal Rescue Units', 'Navy Support', 'Sheltering Teams', 'Emergency Supplies'],
  Tsunami: ['Coastal NDRF Units', 'Navy Rescue Ships', 'Medical Teams', 'Relief Camps'],
  Landslide: ['Road Clearing Equipment', 'Rescue Teams', 'Medical Units', 'Debris Removal'],
  default: ['NDRF Quick Response', 'Medical Teams', 'Area Assessment Unit'],
}

const SOCIAL_FEEDS = {
  Flood: [
    { title: 'Flood rescue operations — NDTV Live', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0' },
    { title: 'IMD Flood Warning Update', thumb: 'https://img.youtube.com/vi/CnPbWMBCNyk/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=CnPbWMBCNyk' },
  ],
  Earthquake: [
    { title: 'Earthquake live coverage — India Today', thumb: 'https://img.youtube.com/vi/D8IbN0DJNSE/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=D8IbN0DJNSE' },
    { title: 'NCS Seismic Bulletin', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0' },
  ],
  default: [
    { title: 'NDMA Emergency Response Guide', thumb: 'https://img.youtube.com/vi/zy2-D6WZ8M0/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=zy2-D6WZ8M0' },
    { title: 'Disaster preparedness — India', thumb: 'https://img.youtube.com/vi/CnPbWMBCNyk/mqdefault.jpg', url: 'https://www.youtube.com/watch?v=CnPbWMBCNyk' },
  ],
}

const STATUS_CYCLE = { pending: 'verified', verified: 'under_response', under_response: 'resolved' }
const STATUS_LABELS = { pending: 'Pending', verified: 'Verified', under_response: 'Under Response', resolved: 'Resolved' }
const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  verified: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  under_response: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function NdrfIntelligencePanel({ disaster, onClose, onStatusChange }) {
  const [advisory, setAdvisory] = useState(null)
  const [checklist, setChecklist] = useState([])
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState('pending')
  const [dispatching, setDispatching] = useState(false)
  const [dispatched, setDispatched] = useState(false)
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (!disaster) { setVisible(false); return }
    setVisible(true)
    setChecklist([])
    setAdvisory(null)
    setDispatched(false)
    setStatus(disaster.status || 'pending')

    // Build initial timeline from disaster data
    const tl = [{ time: disaster.time || '—', event: 'Citizen report submitted', icon: '📝' }]
    if (disaster.status === 'verified' || disaster.status === 'under_response' || disaster.status === 'resolved') {
      tl.push({ time: '—', event: 'Report verified by NDRF officer', icon: '✅' })
    }
    if (disaster.status === 'under_response' || disaster.status === 'resolved') {
      tl.push({ time: '—', event: 'Rescue team dispatched', icon: '🚁' })
    }
    if (disaster.status === 'resolved') {
      tl.push({ time: '—', event: 'Incident marked resolved', icon: '🟢' })
    }
    setTimeline(tl)

    axios.get(`${import.meta.env.VITE_API_URL}/api/disaster-advisory/${encodeURIComponent(disaster.type)}`)
      .then(res => setAdvisory(res.data))
      .catch(() => setAdvisory({ advisory: [], impact: 'Assessment unavailable.', checklist: [] }))
  }, [disaster])

  if (!disaster) return null
  const s = sev[disaster.severity] || sev.Low
  const Icon = icons[disaster.type] || icons.default
  const dispatchResources = DISPATCH_MAP[disaster.type] || DISPATCH_MAP.default
  const feeds = SOCIAL_FEEDS[disaster.type] || SOCIAL_FEEDS.default
  const score = disaster.severityScore || s.score

  // Helper: PATCH status to backend (requires JWT)
  const patchStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/reports/${disaster.id}`,
        { status: newStatus },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleVerify = async () => {
    await patchStatus('verified');
    setStatus('verified')
    setTimeline(prev => [...prev,
      { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }), event: 'Verified by NDRF Command — now visible on public dashboard', icon: '✅' }
    ])
    onStatusChange?.(disaster.id, 'verified')
  }

  const handleDispatch = () => {
    setDispatching(true)
    setTimeout(async () => {
      await patchStatus('under_response');
      setDispatching(false)
      setDispatched(true)
      setStatus('under_response')
      setTimeline(prev => [...prev,
        { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }), event: 'Resources dispatched to incident', icon: '🚁' }
      ])
      onStatusChange?.(disaster.id, 'under_response')
    }, 1800)
  }

  const handleResolve = async () => {
    await patchStatus('resolved');
    setStatus('resolved')
    setTimeline(prev => [...prev,
      { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }), event: 'Incident closed — removed from public dashboard', icon: '🟢' }
    ])
    onStatusChange?.(disaster.id, 'resolved')
  }

  const toggleCheck = (i) =>
    setChecklist(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/65 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-gray-950 border-l-4 ${s.border} z-50 overflow-y-auto shadow-2xl flex flex-col`}
        style={{ transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)', transform: visible ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-950/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${s.badge}`}><Icon className="w-5 h-5" /></div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Command Intelligence Panel</h2>
              <p className="text-gray-500 text-xs mt-0.5">NDRF Emergency Response System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
              {STATUS_LABELS[status] || 'Pending'}
            </span>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-5 space-y-5 pb-10">

          {/* ── Section 1: Disaster Overview */}
          <div className="rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-800/60 flex items-center gap-2 bg-gray-900/40">
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Disaster Overview</span>
            </div>
            <div className="p-4 space-y-4 bg-gray-900/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-white">{disaster.type} Alert</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-400 text-sm">{disaster.location}</span>
                  </div>
                </div>
                <span className={`px-3 py-1.5 text-xs font-bold rounded-full border flex-shrink-0 ${s.badge}`}>{disaster.severity}</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">Severity Score</span>
                  <span className="text-xs font-bold text-white">{score}/100</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${score}%`, transition: 'width 0.7s ease' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Clock,    label: 'Time',     value: disaster.time || '—' },
                  { icon: Calendar, label: 'Date',     value: disaster.date || '14 Mar' },
                  { icon: User,     label: 'Reporter', value: disaster.name || 'Citizen' },
                  { icon: Radio,    label: 'Source',   value: disaster.source || 'Citizen Report' },
                ].map(({ icon: Ic, label, value }) => (
                  <div key={label} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50">
                    <div className="flex items-center gap-1.5 mb-1"><Ic className="w-3 h-3 text-gray-500" /><span className="text-xs text-gray-500">{label}</span></div>
                    <p className="text-sm text-white font-semibold truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 2: Action Buttons */}
          <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700/50 flex items-center gap-2 bg-gray-900/40">
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Emergency Actions</span>
            </div>
            <div className="p-4 space-y-3 bg-gray-900/20">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleVerify}
                  disabled={status !== 'pending'}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-blue-400 rounded-xl text-xs font-bold transition-all"
                >
                  <UserCheck className="w-4 h-4" /> Verify Report
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={dispatching || dispatched || status === 'resolved'}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-orange-400 rounded-xl text-xs font-bold transition-all"
                >
                  {dispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                  {dispatching ? 'Dispatching…' : dispatched ? 'Dispatched ✓' : 'Dispatch Team'}
                </button>
                <button
                  disabled
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold opacity-60 cursor-not-allowed"
                >
                  <PackageCheck className="w-4 h-4" /> Assign Resources
                </button>
                <button
                  onClick={handleResolve}
                  disabled={status === 'resolved'}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500/15 border border-green-500/30 hover:bg-green-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-green-400 rounded-xl text-xs font-bold transition-all"
                >
                  <CheckCheck className="w-4 h-4" /> Mark Resolved
                </button>
              </div>

              {/* Resources to Dispatch */}
              <div className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-3">
                <p className="text-xs text-orange-400 font-semibold mb-2">Recommended Resources</p>
                <div className="flex flex-wrap gap-1.5">
                  {dispatchResources.map((r, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Government Advisory */}
          <div className="rounded-2xl border border-orange-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-orange-500/20 bg-orange-500/5 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Government Safety Advisory</span>
            </div>
            <div className="p-4 bg-gray-900/20 space-y-2">
              {advisory ? advisory.advisory.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-sm text-gray-300 leading-snug">{tip}</p>
                </div>
              )) : [1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          </div>

          {/* ── Section 4: AI Risk Assessment */}
          <div className="rounded-2xl border border-blue-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-blue-500/20 bg-blue-500/5 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Risk Assessment</span>
              <span className="ml-auto text-xs text-blue-500/60 font-mono">AI GEN</span>
            </div>
            <div className="p-4 bg-gray-900/20">
              {advisory ? <p className="text-sm text-gray-300 leading-relaxed">{advisory.impact}</p>
                : <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-4 bg-gray-800 rounded animate-pulse" />)}</div>}
            </div>
          </div>

          {/* ── Section 5: Safety Checklist */}
          <div className="rounded-2xl border border-green-500/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-green-500/20 bg-green-500/5 flex items-center gap-2">
              <List className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Officer Action Checklist</span>
              {advisory && <span className="ml-auto text-xs text-green-500/70">{checklist.length}/{advisory.checklist.length} done</span>}
            </div>
            <div className="p-4 bg-gray-900/20 space-y-2">
              {advisory ? advisory.checklist.map((item, i) => {
                const done = checklist.includes(i)
                return (
                  <button key={i} onClick={() => toggleCheck(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${done ? 'bg-green-500/10 border-green-500/30 text-green-300' : 'bg-gray-800/40 border-gray-700/40 text-gray-300 hover:bg-gray-800'}`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${done ? 'text-green-400' : 'text-gray-600'}`} />
                    <span className={`text-sm font-medium ${done ? 'line-through opacity-60' : ''}`}>{item}</span>
                  </button>
                )
              }) : [1,2,3].map(i => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}
            </div>
          </div>

          {/* ── Section 6: Incident Timeline */}
          <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700/50 flex items-center gap-2 bg-gray-900/40">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Incident Timeline</span>
            </div>
            <div className="p-4 bg-gray-900/20">
              <div className="relative">
                {timeline.map((entry, i) => (
                  <div key={i} className="flex gap-3 mb-4 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm flex-shrink-0">{entry.icon}</div>
                      {i < timeline.length - 1 && <div className="w-px flex-1 bg-gray-800 mt-1" />}
                    </div>
                    <div className="pt-1 pb-3">
                      <p className="text-xs text-gray-500 font-mono">{entry.time}</p>
                      <p className="text-sm text-gray-300 font-medium mt-0.5">{entry.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 7: Live Incident Media */}
          <div className="rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-700/50 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live Incident Media</span>
            </div>
            <div className="p-4 bg-gray-900/20">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {feeds.map((feed, i) => (
                  <a key={i} href={feed.url} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-48 bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-500 transition-all group">
                    <div className="relative">
                      <img src={feed.thumb} alt={feed.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none' }} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">YT</div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs text-gray-300 font-medium leading-snug line-clamp-2">{feed.title}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition-colors border border-gray-700">
            Close Panel
          </button>
        </div>
      </div>
    </>
  )
}
