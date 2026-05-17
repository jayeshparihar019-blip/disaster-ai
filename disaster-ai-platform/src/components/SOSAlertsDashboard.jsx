import React, { useState, useEffect } from 'react'
import { Loader2, AlertTriangle, CheckCircle, Clock, MapPin, Phone, ShieldCheck, Zap, RefreshCw } from 'lucide-react'

const TYPE_CONFIG = {
  disaster:        { emoji: '🚨', label: 'Disaster Emergency', color: 'red',     badge: 'bg-red-900/40 text-red-300 border-red-700/40' },
  animal_rescue:   { emoji: '🐾', label: 'Animal Rescue',       color: 'emerald', badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/40' },
  disaster_report: { emoji: '📝', label: 'Disaster Report',     color: 'orange',  badge: 'bg-orange-900/40 text-orange-300 border-orange-700/40' },
}

const STATUS_CONFIG = {
  pending:       { label: 'Pending',         color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  team_assigned: { label: 'Team Assigned',   color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  in_progress:   { label: 'In Progress',     color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  resolved:      { label: 'Resolved',        color: 'bg-green-500/15 text-green-400 border-green-500/30' },
}

export default function SOSAlertsDashboard() {
  const [alerts, setAlerts]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [updating, setUpdating]   = useState(null)
  const [typeFilter, setTypeFilter]     = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [lastCount, setLastCount]       = useState(0)
  const [newAlert, setNewAlert]         = useState(false)

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/sos`)
      const data = await res.json()
      // Real-time notification: detect new alerts
      if (data.length > lastCount && lastCount > 0) {
        setNewAlert(true)
        setTimeout(() => setNewAlert(false), 5000)
      }
      setLastCount(data.length)
      setAlerts(data)
      setError('')
    } catch {
      setError('Unable to fetch SOS alerts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const iv = setInterval(() => fetchAlerts(true), 5000)
    return () => clearInterval(iv)
  }, [])

  const updateStatus = async (alertId, status) => {
    setUpdating(alertId)
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/sos/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setAlerts(prev => prev.map(a => a.alertId === alertId ? { ...a, status } : a))
    } catch { alert('Failed to update status') }
    setUpdating(null)
  }

  const filtered = alerts.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    return true
  })

  const pendingCount  = alerts.filter(a => a.status === 'pending').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <span className="animate-pulse">🚨</span> SOS Emergency Requests
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse font-bold">
                {pendingCount} Pending
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">Real-time SOS alerts — auto-refreshes every 5s</p>
        </div>
        <button onClick={() => fetchAlerts()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* New alert notification */}
      {newAlert && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-600/40 rounded-xl flex items-center gap-2 text-red-300 text-sm animate-pulse">
          <span>🔔</span> New SOS Alert received! Scroll down to view.
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total SOS', value: alerts.length, color: 'text-white' },
          { label: 'Pending',   value: pendingCount,  color: 'text-red-400' },
          { label: 'Resolved',  value: resolvedCount, color: 'text-green-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-center">
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ v: 'all', l: 'All Types' }, { v: 'disaster', l: '🚨 Disaster' }, { v: 'animal_rescue', l: '🐾 Animal' }, { v: 'disaster_report', l: '📝 Report' }].map(({ v, l }) => (
          <button key={v} onClick={() => setTypeFilter(v)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${typeFilter === v ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
            {l}
          </button>
        ))}
        <div className="ml-auto">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none [&>option]:bg-gray-800">
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="flex justify-center py-10 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…</div>
      ) : error ? (
        <div className="py-8 text-center text-red-400 text-sm"><AlertTriangle className="w-6 h-6 mx-auto mb-2" />{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-sm">No SOS alerts match the current filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const tc = TYPE_CONFIG[alert.type]   || { emoji: '🆘', label: alert.type, badge: 'bg-gray-800 text-gray-400 border-gray-700' }
            const sc = STATUS_CONFIG[alert.status] || STATUS_CONFIG.pending
            const isPending = alert.status === 'pending'

            return (
              <div key={alert.alertId} className={`border rounded-xl p-4 transition-all ${isPending ? 'border-red-600/40 bg-red-950/10' : 'border-gray-700/60 bg-gray-800/20'}`}>
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl">{tc.emoji}</span>
                    <span className="font-mono text-xs text-gray-500">{alert.alertId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${tc.badge}`}>{tc.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.color}`}>{sc.label}</span>
                    {isPending && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />{alert.time} · {alert.date}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-2 leading-relaxed">{alert.description}</p>

                {/* Extra details */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{alert.name} · +91 {alert.phone}</span>
                  {alert.latitude && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-500" />{alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</span>}
                  {alert.extraDetails?.disasterType   && <span>⚠️ {alert.extraDetails.disasterType}</span>}
                  {alert.extraDetails?.animalType     && <span>🐾 {alert.extraDetails.animalType}</span>}
                  {alert.extraDetails?.animalCondition && <span>📋 {alert.extraDetails.animalCondition}</span>}
                  {alert.extraDetails?.trappedCount   && <span>👥 {alert.extraDetails.trappedCount} trapped</span>}
                  {alert.extraDetails?.medicalEmergency === 'Yes' && <span className="text-red-400 font-semibold">🏥 Medical Emergency</span>}
                </div>

                {/* Media */}
                {(alert.photoUrl || alert.audioUrl) && (
                  <div className="flex gap-3 mb-3">
                    {alert.photoUrl && <img src={`${import.meta.env.VITE_API_URL}${alert.photoUrl}`} alt="SOS" className="w-20 h-16 object-cover rounded-lg border border-gray-700" />}
                    {alert.audioUrl && <audio controls src={`${import.meta.env.VITE_API_URL}${alert.audioUrl}`} className="h-9 flex-1" />}
                  </div>
                )}

                {/* Status actions */}
                {alert.status !== 'resolved' && (
                  <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                    {alert.status === 'pending' && (
                      <button onClick={() => updateStatus(alert.alertId, 'team_assigned')} disabled={updating === alert.alertId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {updating === alert.alertId ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />} Assign Team
                      </button>
                    )}
                    {alert.status === 'team_assigned' && (
                      <button onClick={() => updateStatus(alert.alertId, 'in_progress')} disabled={updating === alert.alertId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 text-orange-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {updating === alert.alertId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} Mark In Progress
                      </button>
                    )}
                    <button onClick={() => updateStatus(alert.alertId, 'resolved')} disabled={updating === alert.alertId}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                      {updating === alert.alertId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Resolve
                    </button>
                  </div>
                )}
                {alert.status === 'resolved' && (
                  <p className="text-green-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolved</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
