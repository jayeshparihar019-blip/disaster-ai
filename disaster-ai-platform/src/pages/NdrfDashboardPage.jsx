import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Users, Map, Bell, AlertTriangle, Truck, Flame,
  Wifi, RefreshCw, LifeBuoy, Stethoscope, CarFront, Shield,
  MapPin, Cpu
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import CitizenReports from '../components/CitizenReports';
import NdrfIntelligencePanel from '../components/NdrfIntelligencePanel';
import EvacuationRequests from '../components/EvacuationRequests';
import SOSAlertsDashboard from '../components/SOSAlertsDashboard';

// ─── Region extraction from location string ────────────────────────────────── 
const REGION_MAP = {
  mumbai: 'Maharashtra', pune: 'Maharashtra', nagpur: 'Maharashtra', nashik: 'Maharashtra', aurangabad: 'Maharashtra', latur: 'Maharashtra',
  delhi: 'Delhi', 'new delhi': 'Delhi',
  jaipur: 'Rajasthan', jodhpur: 'Rajasthan', bikaner: 'Rajasthan', udaipur: 'Rajasthan', kota: 'Rajasthan', ajmer: 'Rajasthan',
  bengaluru: 'Karnataka', bangalore: 'Karnataka', mysore: 'Karnataka', hubli: 'Karnataka', mangalore: 'Karnataka',
  chennai: 'Tamil Nadu', madurai: 'Tamil Nadu', coimbatore: 'Tamil Nadu', trichy: 'Tamil Nadu',
  hyderabad: 'Telangana', warangal: 'Telangana', nizamabad: 'Telangana',
  kolkata: 'West Bengal', 'west bengal': 'West Bengal', howrah: 'West Bengal',
  ahmedabad: 'Gujarat', surat: 'Gujarat', vadodara: 'Gujarat', rajkot: 'Gujarat',
  lucknow: 'Uttar Pradesh', kanpur: 'Uttar Pradesh', agra: 'Uttar Pradesh', varanasi: 'Uttar Pradesh',
  patna: 'Bihar', gaya: 'Bihar', muzaffarpur: 'Bihar',
  bhopal: 'Madhya Pradesh', indore: 'Madhya Pradesh', jabalpur: 'Madhya Pradesh',
  raipur: 'Chhattisgarh', chhattisgarh: 'Chhattisgarh',
  bhubaneswar: 'Odisha', cuttack: 'Odisha', odisha: 'Odisha',
  guwahati: 'Assam', assam: 'Assam', silchar: 'Assam',
  chandigarh: 'Punjab', amritsar: 'Punjab', ludhiana: 'Punjab', punjab: 'Punjab',
  dehradun: 'Uttarakhand', uttarakhand: 'Uttarakhand', haridwar: 'Uttarakhand', uttarkashi: 'Uttarakhand',
  shimla: 'Himachal Pradesh', himachal: 'Himachal Pradesh', manali: 'Himachal Pradesh',
  visakhapatnam: 'Andhra Pradesh', vijayawada: 'Andhra Pradesh', guntur: 'Andhra Pradesh',
  kochi: 'Kerala', thiruvananthapuram: 'Kerala', kozhikode: 'Kerala', kerala: 'Kerala',
  'jammu': 'Jammu & Kashmir', srinagar: 'Jammu & Kashmir',
  ranchi: 'Jharkhand', jamshedpur: 'Jharkhand', jharkhand: 'Jharkhand',
  andheri: 'Maharashtra',
};

function extractRegion(location) {
  if (!location) return null;
  const loc = location.toLowerCase();
  for (const [key, region] of Object.entries(REGION_MAP)) {
    if (loc.includes(key)) return region;
  }
  return null;
}

// ─── Per-region resource data ─────────────────────────────────────────────────
const REGION_RESOURCES = {
  Maharashtra:       { rescue_boats: 28, fire_units: 22, ambulances: 45, medical_teams: 30, battalions: 3, personnel: 850 },
  Delhi:             { rescue_boats: 8,  fire_units: 35, ambulances: 62, medical_teams: 40, battalions: 2, personnel: 620 },
  Rajasthan:         { rescue_boats: 10, fire_units: 18, ambulances: 28, medical_teams: 20, battalions: 2, personnel: 540 },
  Karnataka:         { rescue_boats: 14, fire_units: 16, ambulances: 38, medical_teams: 24, battalions: 2, personnel: 480 },
  'Tamil Nadu':      { rescue_boats: 22, fire_units: 20, ambulances: 44, medical_teams: 28, battalions: 2, personnel: 600 },
  Telangana:         { rescue_boats: 12, fire_units: 14, ambulances: 32, medical_teams: 22, battalions: 1, personnel: 420 },
  'West Bengal':     { rescue_boats: 30, fire_units: 18, ambulances: 40, medical_teams: 26, battalions: 2, personnel: 560 },
  Gujarat:           { rescue_boats: 18, fire_units: 20, ambulances: 36, medical_teams: 24, battalions: 2, personnel: 500 },
  'Uttar Pradesh':   { rescue_boats: 15, fire_units: 28, ambulances: 58, medical_teams: 38, battalions: 3, personnel: 780 },
  Bihar:             { rescue_boats: 20, fire_units: 12, ambulances: 30, medical_teams: 18, battalions: 2, personnel: 440 },
  'Madhya Pradesh':  { rescue_boats: 10, fire_units: 16, ambulances: 34, medical_teams: 22, battalions: 1, personnel: 380 },
  Chhattisgarh:      { rescue_boats: 8,  fire_units: 14, ambulances: 24, medical_teams: 16, battalions: 1, personnel: 320 },
  Odisha:            { rescue_boats: 24, fire_units: 14, ambulances: 28, medical_teams: 18, battalions: 2, personnel: 460 },
  Assam:             { rescue_boats: 26, fire_units: 10, ambulances: 22, medical_teams: 14, battalions: 1, personnel: 350 },
  Punjab:            { rescue_boats: 8,  fire_units: 18, ambulances: 32, medical_teams: 20, battalions: 1, personnel: 380 },
  Uttarakhand:       { rescue_boats: 6,  fire_units: 12, ambulances: 20, medical_teams: 14, battalions: 1, personnel: 280 },
  'Himachal Pradesh':{ rescue_boats: 4,  fire_units: 10, ambulances: 16, medical_teams: 10, battalions: 1, personnel: 240 },
  'Andhra Pradesh':  { rescue_boats: 16, fire_units: 14, ambulances: 30, medical_teams: 18, battalions: 1, personnel: 420 },
  Kerala:            { rescue_boats: 20, fire_units: 12, ambulances: 28, medical_teams: 18, battalions: 1, personnel: 380 },
  'Jammu & Kashmir': { rescue_boats: 4,  fire_units: 8,  ambulances: 14, medical_teams: 10, battalions: 1, personnel: 240 },
  Jharkhand:         { rescue_boats: 10, fire_units: 12, ambulances: 22, medical_teams: 14, battalions: 1, personnel: 310 },
};

// National totals (shown when no disaster selected)
const NATIONAL = { rescue_boats: 42, fire_units: 38, ambulances: 95, medical_teams: 67, battalions: 12, personnel: 4850 };

const SEV = {
  High:   { dot: 'bg-red-500 severity-pulse', badge: 'bg-red-500/15 text-red-400 border border-red-500/30', row: 'hover:bg-red-500/5 border-l-red-500' },
  Medium: { dot: 'bg-orange-500', badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30', row: 'hover:bg-orange-500/5 border-l-orange-500' },
  Low:    { dot: 'bg-yellow-500', badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30', row: 'hover:bg-yellow-500/5 border-l-yellow-500' },
};

const ST_BADGE = {
  pending:        'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  verified:       'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  under_response: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  resolved:       'bg-green-500/15 text-green-400 border border-green-500/30',
};
const ST_LABEL = { pending: 'Pending', verified: 'Verified', under_response: 'Under Response', resolved: 'Resolved' };

export default function NdrfDashboardPage() {
  const [user, setUser]                   = useState(null);
  const [alerts, setAlerts]               = useState([]);
  const [mapReports, setMapReports]       = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);  // for intelligence panel
  const [selectedReport, setSelectedReport] = useState(null); // for region resources
  const [lastRefresh, setLastRefresh]     = useState('');
  const [filterSev, setFilterSev]         = useState('All');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const fetchAlerts = useCallback(() => {
    // Use /api/reports (admin endpoint) so NDRF sees ALL statuses, including pending
    axios.get(`${import.meta.env.VITE_API_URL}/api/reports`)
      .then(res => {
        const formatted = res.data.map((a, i) => ({
          id: a.id || String(i + 1),
          time: a.time || '—', date: a.date || '—',
          name: a.name || 'Anonymous',
          location: a.location, type: a.type || a.disasterType, severity: a.severity,
          source: a.source || 'Citizen Report',
          lat: a.lat, lng: a.lng,
          status: a.status || 'pending',
          aiPriorityLabel: a.aiPriorityLabel || '',
          description: a.description || '',
          severityScore: a.severity === 'High' ? 90 : a.severity === 'Medium' ? 60 : 35,
        }));
        setAlerts(formatted);
        setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(console.error);
  }, []);

  const fetchMap = useCallback(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/map-data`)
      .then(res => setMapReports(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAlerts(); fetchMap();
    const iv = setInterval(() => { fetchAlerts(); fetchMap(); }, 5000);
    return () => clearInterval(iv);
  }, [fetchAlerts, fetchMap]);

  // ── Region-based resource calculation ──────────────────────────────────────
  const region = selectedReport ? extractRegion(selectedReport.location) : null;
  const resources = (region && REGION_RESOURCES[region]) ? REGION_RESOURCES[region] : NATIONAL;
  const isRegional = !!region;

  const handleCitizenSelect = (report) => {
    setSelectedReport(prev => prev?.id === report.id ? null : report);
  };

  const handleAlertSelect = (alert) => {
    setSelectedAlert(prev => prev?.id === alert.id ? null : alert);
  };

  const handleStatusChange = (id, newStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAlert?.id === id) setSelectedAlert(prev => ({ ...prev, status: newStatus }));
  };

  const filtered = filterSev === 'All' ? alerts : alerts.filter(a => a.severity === filterSev);
  const highCount    = alerts.filter(a => a.severity === 'High').length;
  const pendingCount = alerts.filter(a => a.status === 'pending').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  const RESOURCE_CARDS = [
    { label: 'Rescue Boats',    value: resources.rescue_boats,  icon: LifeBuoy,    color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Fire Units',      value: resources.fire_units,    icon: Flame,       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'Ambulances',      value: resources.ambulances,    icon: CarFront,    color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Medical Teams',   value: resources.medical_teams, icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'NDRF Battalions', value: resources.battalions,    icon: Shield,      color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Personnel',       value: isRegional ? resources.personnel : '4,850', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Intelligence Panel */}
      <NdrfIntelligencePanel
        disaster={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onStatusChange={handleStatusChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-orange-950/60 to-gray-900/80 border border-orange-500/25 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-orange-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.07),transparent_60%)]" />
          <div className="flex items-center gap-4 z-10">
            <div className="p-3.5 bg-orange-500/20 rounded-xl text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.25)] border border-orange-500/30">
              <ShieldAlert size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">NDRF Command Center</h1>
              <p className="text-orange-400 text-sm font-medium mt-0.5">
                Welcome, {user?.name || 'Commander'} — National Disaster Response Force
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 md:mt-0 z-10">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-semibold">
              <Wifi className="w-4 h-4 animate-pulse" /> Live · {lastRefresh}
            </div>
            <div className="px-4 py-2.5 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-400 text-sm font-bold animate-pulse">
              <AlertTriangle size={14} /> NATIONAL MONITORING ACTIVE
            </div>
          </div>
        </div>

        {/* ── Command Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Alerts',   value: alerts.length, color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'High Severity',  value: highCount,     color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
            { label: 'Pending Review', value: pendingCount,  color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Resolved',       value: resolvedCount, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} border rounded-2xl p-4`}>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Citizen Reports ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <CitizenReports
            onSelect={handleCitizenSelect}
            selectedId={selectedReport?.id}
          />
        </div>

        {/* ── Emergency Evacuation Requests ───────────────────────────────── */}
        <div className="mb-8">
          <EvacuationRequests />
        </div>

        {/* ── Resource Monitor ────────────────────────────────────────────── */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-400" />
                Resource Availability Monitor
              </h2>
              {isRegional ? (
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <p className="text-sm text-orange-400 font-semibold">{region} — Regional Resources</p>
                  <button onClick={() => setSelectedReport(null)} className="text-xs text-gray-500 hover:text-gray-300 underline ml-1">
                    Show National
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">Showing national totals — select a citizen report to see regional data</p>
              )}
            </div>
            <span className="text-xs text-green-400 font-semibold bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
              ● All Systems Operational
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {RESOURCE_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} border rounded-xl p-3 text-center transition-all duration-300`}>
                <Icon className={`w-5 h-5 ${color} mx-auto mb-1.5`} />
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Selected disaster info */}
          {selectedReport && (
            <div className="mt-4 p-3 bg-orange-500/5 border border-orange-500/20 rounded-xl flex items-center gap-3">
              <Cpu className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-orange-400 font-semibold">Displaying resources for selected incident</p>
                <p className="text-sm text-gray-300 mt-0.5">
                  <span className="font-semibold text-white">{selectedReport.type}</span> at {selectedReport.location}
                  {region ? ` · ${region}` : ' · Region not mapped'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── National Disaster Alerts Table ─────────────────────────────── */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-bold text-white">National Disaster Alerts</h2>
              <span className="px-2 py-0.5 bg-red-500/15 text-red-400 text-xs rounded-full border border-red-500/30">{alerts.length} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-lg p-1">
                {['All','High','Medium','Low'].map(level => (
                  <button key={level} onClick={() => setFilterSev(level)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${filterSev === level
                      ? level === 'High' ? 'bg-red-600 text-white' : level === 'Medium' ? 'bg-orange-600 text-white' : level === 'Low' ? 'bg-yellow-600 text-gray-900' : 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'}`}>
                    {level}
                  </button>
                ))}
              </div>
              <button onClick={() => { fetchAlerts(); fetchMap(); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/60">
                  {['Time','Date','Reporter','Location','Type','Severity','Status',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-500 text-sm">No alerts to display</td></tr>
                ) : filtered.map(alert => {
                  const s = SEV[alert.severity] || SEV.Low;
                  const isSelected = selectedAlert?.id === alert.id;
                  return (
                    <tr key={alert.id} onClick={() => handleAlertSelect(alert)}
                      className={`cursor-pointer transition-all border-l-2 ${s.row} ${isSelected ? 'bg-orange-500/5 border-l-orange-500' : 'border-l-transparent'}`}>
                      <td className="px-4 py-3 text-gray-300 font-mono text-xs">{alert.time}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{alert.date}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{alert.name}</td>
                      <td className="px-4 py-3 text-gray-300 text-xs">{alert.location}</td>
                      <td className="px-4 py-3 text-white font-semibold text-xs">{alert.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${s.badge}`}>{alert.severity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${ST_BADGE[alert.status] || ST_BADGE.pending}`}>
                          {ST_LABEL[alert.status] || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">Open →</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SOS Emergency Alerts ────────────────────────────────────────── */}
        <div className="mb-8">
          <SOSAlertsDashboard />
        </div>

        {/* ── Satellite Map ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Satellite Disaster Monitoring Map</h2>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> LIVE
            </div>
          </div>
          <MapComponent disasters={mapReports.length > 0 ? mapReports : alerts} />
        </div>

      </div>
    </div>
  );
}
