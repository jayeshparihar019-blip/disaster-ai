import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, ShieldCheck, AlertTriangle, Clock, Phone, CreditCard, Loader2, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  pending:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  verified:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
  under_response: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved:       'bg-green-500/20 text-green-400 border-green-500/30',
};

const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40',
  HIGH:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
  MEDIUM:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  LOW:      'bg-gray-700/50 text-gray-400 border-gray-600',
};

const DISASTER_TYPES = ['All', 'Earthquake', 'Flood', 'Fire', 'Cyclone', 'Landslide', 'Tsunami', 'Industrial Accident', 'Other'];
const STATUS_FILTERS = ['All', 'pending', 'verified', 'under_response', 'resolved'];
const STATUS_LABELS  = { pending: 'Pending', verified: 'Verified', under_response: 'Under Response', resolved: 'Resolved' };

export default function CitizenReports({ defaultTypeFilter, onSelect, selectedId }) {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState(defaultTypeFilter || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating]         = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) throw new Error('Server returned non-JSON response');
      const data = await res.json();
      setReports(data);
    } catch (e) {
      setError('Unable to fetch disaster reports. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const iv = setInterval(fetchReports, 5000);
    return () => clearInterval(iv);
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      alert('Failed to update status: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = reports.filter(r => {
    const matchType   = typeFilter === 'All' || r.disasterType === typeFilter;
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    const q           = search.toLowerCase();
    const matchSearch = !q || r.location?.toLowerCase().includes(q) ||
      r.disasterType?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-red-400 w-4 h-4" />
            Citizen Disaster Reports
            {reports.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500/15 text-red-400 text-xs rounded-full border border-red-500/30">{reports.length}</span>
            )}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Sorted by AI Priority Score — click a row to select</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors">
          <span className="text-base leading-none">↻</span> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search location, type, name…"
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none [&>option]:bg-gray-800">
            {DISASTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-orange-500 appearance-none [&>option]:bg-gray-800 capitalize">
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_LABELS[s] || s}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading reports…
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-400 flex flex-col items-center gap-3">
          <AlertTriangle className="w-8 h-8" />
          <p className="text-sm max-w-xs">{error}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-600/30 transition-colors">
            ↻ Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-sm">No reports match the current filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const isSelected = selectedId === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onSelect?.(r)}
                className={`border rounded-xl p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-orange-500/60 bg-orange-500/5 ring-1 ring-orange-500/30'
                    : r.aiPriorityLabel === 'CRITICAL'
                      ? 'border-red-500/40 bg-red-500/5 hover:bg-red-500/8'
                      : 'border-gray-700/60 bg-gray-800/30 hover:bg-gray-800/50'
                }`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">#{r.id?.slice(-6)}</span>
                    <span className="font-semibold text-white text-sm">{r.disasterType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_COLORS[r.aiPriorityLabel]}`}>
                      AI: {r.aiPriorityLabel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[r.status] || STATUS_COLORS.pending}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.time} · {r.date}
                    </span>
                    {isSelected && <ChevronRight className="w-4 h-4 text-orange-400" />}
                  </div>
                </div>

                <p className="text-sm font-medium text-blue-400 mb-1">📍 {r.location}</p>
                <p className="text-sm text-gray-300 leading-relaxed mb-3 line-clamp-2">{r.description}</p>

                {/* ── Evidence Media ────────────────────────────────────── */}
                {(r.transcription || r.audioUrl || r.videoUrl) && (
                  <div className="mb-3 space-y-2 bg-gray-800/60 border border-gray-700/60 rounded-xl p-3" onClick={e => e.stopPropagation()}>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">🎯 Attached Evidence</p>
                    {r.transcription && (
                      <div className="bg-purple-900/20 border border-purple-800/40 rounded-lg p-2.5">
                        <p className="text-xs text-purple-400 font-semibold mb-1">✨ AI Transcription</p>
                        <p className="text-xs text-gray-300 italic">"{r.transcription}"</p>
                      </div>
                    )}
                    {r.audioUrl && (
                      <div>
                        <p className="text-xs text-green-400 font-medium mb-1">🎤 Voice Report</p>
                        <audio controls src={`${import.meta.env.VITE_API_URL}${r.audioUrl}`} className="w-full h-9" />
                      </div>
                    )}
                    {r.videoUrl && (
                      <div>
                        <p className="text-xs text-blue-400 font-medium mb-1">🎥 Video Evidence</p>
                        <video controls src={`${import.meta.env.VITE_API_URL}${r.videoUrl}`} className="w-full rounded-lg max-h-36" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 {r.phoneNumber}</span>
                  <span className="flex items-center gap-1 font-mono"><CreditCard className="w-3 h-3" /> {r.maskedAadhaar}</span>
                  <span>Reported by: <span className="text-gray-300">{r.name}</span></span>
                  <span className={`font-semibold ${r.severity === 'High' ? 'text-red-400' : r.severity === 'Medium' ? 'text-orange-400' : 'text-yellow-400'}`}>
                    ● {r.severity}
                  </span>
                </div>

                {/* Action buttons */}
                {r.status !== 'resolved' && (
                  <div className="flex gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
                    {r.status === 'pending' && (
                      <button onClick={() => handleStatusUpdate(r.id, 'verified')} disabled={updating === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {updating === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                        Verify
                      </button>
                    )}
                    {(r.status === 'verified') && (
                      <button onClick={() => handleStatusUpdate(r.id, 'under_response')} disabled={updating === r.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600/30 text-orange-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                        {updating === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                        Start Response
                      </button>
                    )}
                    <button onClick={() => handleStatusUpdate(r.id, 'resolved')} disabled={updating === r.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 text-green-400 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                      {updating === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && (
        <p className="mt-4 text-xs text-gray-600 text-right">Showing {filtered.length} of {reports.length} reports</p>
      )}
    </div>
  );
}
