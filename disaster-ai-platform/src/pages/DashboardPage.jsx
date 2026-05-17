import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell, AlertTriangle, Building2, Truck, RefreshCw, MapPin, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import AlertTable from '../components/AlertTable'
import MapComponent from '../components/MapComponent'
import DisasterDetailPanel from '../components/DisasterDetailPanel'
import AIPredictionDashboard from '../components/AIPredictionDashboard'
import RegionalPredictionPanel from '../components/RegionalPredictionPanel'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ALERTS = [
  { id: 1, time: '18:42 IST', location: 'Mumbai, Maharashtra', type: 'Flood', severity: 'High', source: 'Social Media + IMD', resource: 'Rescue Boats, NDRF Teams', lat: 19.0760, lng: 72.8777, severityScore: 92 },
  { id: 2, time: '18:31 IST', location: 'Jaipur, Rajasthan', type: 'Fire', severity: 'High', source: 'Emergency Hotline', resource: 'Fire Engines, Aerial Tankers', lat: 26.9124, lng: 75.7873, severityScore: 88 },
  { id: 3, time: '18:15 IST', location: 'Chennai, Tamil Nadu', type: 'Cyclone', severity: 'Medium', source: 'IMD Weather API', resource: 'Evacuation Teams, Emergency Shelters', lat: 13.0827, lng: 80.2707, severityScore: 65 },
  { id: 4, time: '18:02 IST', location: 'Latur, Maharashtra', type: 'Earthquake', severity: 'High', source: 'Seismic Sensors', resource: 'Rescue Teams, Medical Units', lat: 18.4088, lng: 76.5604, severityScore: 95 },
  { id: 5, time: '17:55 IST', location: 'Uttarkashi, Uttarakhand', type: 'Landslide', severity: 'Medium', source: 'Field Reports', resource: 'Road Clearing Equipment, Rescue Teams', lat: 30.7268, lng: 78.4354, severityScore: 60 },
  { id: 6, time: '17:40 IST', location: 'Patna, Bihar', type: 'Flood', severity: 'Medium', source: 'CWC + Social Media', resource: 'Rescue Boats, Relief Camps', lat: 25.5941, lng: 85.1376, severityScore: 58 },
  { id: 7, time: '17:22 IST', location: 'Kozhikode, Kerala', type: 'Landslide', severity: 'Low', source: 'Local Reports', resource: 'Local Relief Teams', lat: 11.2588, lng: 75.7804, severityScore: 35 },
  { id: 8, time: '17:10 IST', location: 'Surat, Gujarat', type: 'Fire', severity: 'Low', source: 'Fire Dept. API', resource: 'Fire Brigade, Ambulance', lat: 21.1702, lng: 72.8311, severityScore: 30 },
  { id: 9, time: '16:58 IST', location: 'Imphal, Manipur', type: 'Earthquake', severity: 'Medium', source: 'NCS + Twitter', resource: 'Search & Rescue, Medical Teams', lat: 24.8170, lng: 93.9368, severityScore: 62 },
  { id: 10, time: '16:45 IST', location: 'Visakhapatnam, AP', type: 'Cyclone', severity: 'High', source: 'IMD + INCOIS', resource: 'Navy Rescue Units, Evacuation Buses', lat: 17.6868, lng: 83.2185, severityScore: 90 },
]

const STATS = [
  { title: 'Total Alerts Today', value: '47', icon: Bell, color: 'blue', trend: 12 },
  { title: 'High Severity Alerts', value: '14', icon: AlertTriangle, color: 'red', trend: 8 },
  { title: 'Cities Affected', value: '23', icon: Building2, color: 'orange', trend: 5 },
  { title: 'Resources Recommended', value: '89', icon: Truck, color: 'green', trend: -3 },
]

export default function DashboardPage() {
  const [alerts, setAlerts] = useState([])
  const [mapReports, setMapReports] = useState([])
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  const [filterSeverity, setFilterSeverity] = useState('All')

  const fetchAlerts = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/alerts`)
      .then(res => {
        const formattedAlerts = res.data.map((a, i) => ({
          id: a.id || i + 1,
          time: a.time,
          date: a.date || 'Unknown',
          name: a.name || 'Anonymous',
          location: a.location,
          type: a.type,
          severity: a.severity,
          source: 'Citizen Report',
          resource: 'Pending Assessment',
          // Preserve API coords; only fall back if genuinely absent
          lat: (a.lat != null && !isNaN(Number(a.lat))) ? Number(a.lat) : null,
          lng: (a.lng != null && !isNaN(Number(a.lng))) ? Number(a.lng) : null,
          severityScore: a.severity === 'High' ? 90 : a.severity === 'Medium' ? 60 : 30,
          ...a
        }))
        setAlerts(formattedAlerts)
        setLastRefresh(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
      })
      .catch(err => console.error(err))
  }

  const fetchMapData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/map-data`)
      .then(res => {
        // Only use API data if it actually has coordinates; fall back to MOCK_ALERTS
        const data = Array.isArray(res.data) && res.data.length > 0
          ? res.data
          : MOCK_ALERTS
        setMapReports(data)
      })
      .catch(() => setMapReports(MOCK_ALERTS))
  }

  useEffect(() => {
    fetchAlerts()
    fetchMapData()
    // Real-time refresh every 5 seconds
    const interval = setInterval(() => {
      fetchAlerts()
      fetchMapData()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = filterSeverity === 'All'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Detail panel */}
      <DisasterDetailPanel
        disaster={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Emergency Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Real-time disaster monitoring — Last updated {lastRefresh}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Severity filter */}
            <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
              {['All', 'High', 'Medium', 'Low'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterSeverity(level)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                    filterSeverity === level
                      ? level === 'High' ? 'bg-red-600 text-white'
                        : level === 'Medium' ? 'bg-orange-600 text-white'
                        : level === 'Low' ? 'bg-yellow-600 text-gray-900'
                        : 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <button 
              onClick={fetchAlerts}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-medium rounded-lg transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>

        {/* Alert table — click a row to set selectedRegion */}
        <div className="mb-8">
          <AlertTable
            alerts={filteredAlerts}
            onAlertClick={(alert) => { setSelectedAlert(alert); setSelectedRegion(alert.location) }}
            selectedId={selectedAlert?.id}
          />
        </div>

        {/* AI Analytics Section */}
        <div className="mb-8">
          <AIPredictionDashboard />
        </div>

        {/* Map + Regional Prediction side by side */}
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <MapComponent
              disasters={mapReports.length > 0 ? mapReports : MOCK_ALERTS}
              onSelectRegion={setSelectedRegion}
            />
          </div>
          <div className="xl:w-80 w-full">
            {/* Region selector header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-white font-semibold text-sm">Regional AI Prediction</span>
              </div>
              {selectedRegion && (
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-500 hover:text-white text-xs flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
            <RegionalPredictionPanel region={selectedRegion} />
          </div>
        </div>
      </div>
    </div>
  )
}
