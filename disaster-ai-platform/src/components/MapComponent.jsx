import { useEffect, useState, useCallback } from 'react'
import {
  MapContainer, TileLayer, Marker, Popup,
  Polyline, useMap, LayersControl
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import axios from 'axios'

// ── Fix default icon URLs for Vite ────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Disaster icon factory ─────────────────────────────────────────────────────
const DISASTER_META = {
  Fire:       { emoji: '🔥', bg: '#ef4444', shadow: '#ef444460' },
  Flood:      { emoji: '🌊', bg: '#3b82f6', shadow: '#3b82f660' },
  Cyclone:    { emoji: '🌀', bg: '#8b5cf6', shadow: '#8b5cf660' },
  Earthquake: { emoji: '⚡', bg: '#f97316', shadow: '#f9731660' },
  Landslide:  { emoji: '⛰️', bg: '#a3a3a3', shadow: '#a3a3a360' },
  Tsunami:    { emoji: '🌊', bg: '#06b6d4', shadow: '#06b6d460' },
  default:    { emoji: '⚠️', bg: '#eab308', shadow: '#eab30860' },
}

const SEVERITY_RING = {
  High:   { ring: '#ef4444', pulse: true,  size: 46 },
  Medium: { ring: '#f97316', pulse: false, size: 38 },
  Low:    { ring: '#eab308', pulse: false, size: 32 },
}

function injectPulseStyle() {
  if (document.getElementById('map-pulse-style')) return
  const s = document.createElement('style')
  s.id = 'map-pulse-style'
  s.textContent = `
    @keyframes mapPulse {
      0%   { transform:scale(1);   opacity:.8 }
      70%  { transform:scale(2.2); opacity:0  }
      100% { transform:scale(1);   opacity:0  }
    }
    .map-pulse-ring::before {
      content:''; position:absolute; inset:-6px; border-radius:50%;
      border:3px solid currentColor; animation:mapPulse 1.6s ease-out infinite;
    }
    .cyclone-dot { animation: mapPulse 1s ease-out infinite; }
  `
  document.head.appendChild(s)
}

function makeDisasterIcon(type, severity) {
  injectPulseStyle()
  const meta = DISASTER_META[type] || DISASTER_META.default
  const sev  = SEVERITY_RING[severity] || SEVERITY_RING.Low
  const sz   = sev.size
  const html = `
    <div style="
      position:relative;width:${sz}px;height:${sz}px;border-radius:50%;
      background:${meta.bg}22;border:2.5px solid ${sev.ring};
      display:flex;align-items:center;justify-content:center;
      font-size:${sz*.5}px;box-shadow:0 0 14px ${meta.shadow};color:${sev.ring};
    " class="${sev.pulse ? 'map-pulse-ring' : ''}">${meta.emoji}</div>`
  return L.divIcon({ html, className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2], popupAnchor:[0,-(sz/2+4)] })
}

const ACTIONS = {
  Earthquake: 'Deploy rescue teams & medical support immediately',
  Flood:      'Evacuate residents & deploy rescue boats',
  Fire:       'Deploy fire engines & aerial firefighting units',
  Cyclone:    'Issue evacuation orders & shelter alerts',
  Tsunami:    'Activate coastal evacuation protocols',
  Landslide:  'Clear roads & deploy rescue + relief teams',
  default:    'Alert local authorities & mobilise rescue teams',
}

// ── Map utility components ────────────────────────────────────────────────────
function MapResizer() {
  const map = useMap()
  useEffect(() => { setTimeout(() => map.invalidateSize(), 200) }, [map])
  return null
}

function HeatLayer({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points?.length || !L.heatLayer) return
    const heat = L.heatLayer(
      points.map(p => [p.lat, p.lng, p.risk || 0.5]),
      { radius:40, blur:25, maxZoom:10, gradient:{ 0.3:'yellow', 0.6:'orange', 1.0:'darkred' } }
    )
    heat.addTo(map)
    return () => map.removeLayer(heat)
  }, [map, points])
  return null
}

function FloodHeatLayer({ zones, visible }) {
  const map = useMap()
  useEffect(() => {
    if (!visible || !zones?.length || !L.heatLayer) return
    const heat = L.heatLayer(
      zones.map(z => [z.lat, z.lng, z.risk]),
      { radius:55, blur:40, maxZoom:12, gradient:{ 0.4:'#3b82f680', 0.7:'#f97316aa', 1.0:'#ef4444cc' } }
    )
    heat.addTo(map)
    return () => map.removeLayer(heat)
  }, [map, zones, visible])
  return null
}

function RainViewerLayer({ visible }) {
  const map = useMap()
  useEffect(() => {
    if (!visible) return
    // Use RainViewer public API for latest radar tile
    let layer = null
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then(data => {
        const path = data?.radar?.past?.[data.radar.past.length - 1]?.path
        if (!path) return
        layer = L.tileLayer(
          `https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/2/1_1.png`,
          { opacity: 0.65, attribution: 'Rain data: RainViewer' }
        )
        layer.addTo(map)
      })
      .catch(() => {}) // silently fail if radar unavailable
    return () => { if (layer) map.removeLayer(layer) }
  }, [map, visible])
  return null
}

function MapLegend() {
  const map = useMap()
  useEffect(() => {
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div')
      div.innerHTML = `
        <div style="
          background:rgba(9,14,27,0.94);border:1px solid #1e293b;
          border-radius:12px;padding:12px 16px;font-size:12px;color:#94a3b8;
          line-height:2;backdrop-filter:blur(10px);min-width:170px;
        ">
          <div style="font-weight:800;color:#fff;margin-bottom:6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase">Map Legend</div>
          <div>🔥 Fire</div>
          <div>🌊 Flood / Tsunami</div>
          <div>🌀 Cyclone</div>
          <div>⚡ Earthquake</div>
          <div>⛰️ Landslide</div>
          <div style="margin-top:8px;border-top:1px solid #1e293b;padding-top:8px">
            <div><span style="color:#ef4444">●</span> High – pulsing ring</div>
            <div><span style="color:#f97316">●</span> Medium</div>
            <div><span style="color:#eab308">●</span> Low</div>
          </div>
          <div style="margin-top:8px;border-top:1px solid #1e293b;padding-top:8px">
            <div>🌀 Cyclone path (solid)</div>
            <div style="color:#60a5fa">⋯ Forecast path (dashed)</div>
            <div style="color:#ef4444">▓ Flood risk zone</div>
          </div>
        </div>`
      return div
    }
    legend.addTo(map)
    return () => legend.remove()
  }, [map])
  return null
}

function CycloneLayers({ data, visible }) {
  if (!visible || !data) return null
  const pathCoords   = data.path.map(p => [p.lat, p.lng])
  const forecastCoords = [
    data.path[data.path.length - 1],
    ...data.forecast,
  ].map(p => [p.lat, p.lng])

  const currentPos = data.path[data.path.length - 1]
  const cycloneIcon = L.divIcon({
    html: `<div style="
      width:38px;height:38px;border-radius:50%;background:#8b5cf622;
      border:3px solid #8b5cf6;display:flex;align-items:center;justify-content:center;
      font-size:20px;box-shadow:0 0 18px #8b5cf680;color:#8b5cf6;
    " class="map-pulse-ring">🌀</div>`,
    className: '', iconSize: [38,38], iconAnchor: [19,19], popupAnchor: [0,-22]
  })

  return (
    <>
      <Polyline positions={pathCoords} pathOptions={{ color:'#8b5cf6', weight:3, opacity:0.85 }} />
      <Polyline positions={forecastCoords} pathOptions={{ color:'#60a5fa', weight:2.5, dashArray:'8 6', opacity:0.75 }} />
      <Marker position={[currentPos.lat, currentPos.lng]} icon={cycloneIcon}>
        <Popup maxWidth={240}>
          <div style={{ color:'#f1f5f9', minWidth:200, fontSize:13 }}>
            <div style={{ fontWeight:700, fontSize:15, color:'#a78bfa', marginBottom:8 }}>🌀 {data.name}</div>
            <div style={{ color:'#94a3b8', lineHeight:1.8, fontSize:12 }}>
              <div>📂 {data.category}</div>
              <div>💨 Wind: <span style={{ color:'#fff' }}>{data.windSpeed}</span></div>
              <div>🌡 Pressure: <span style={{ color:'#fff' }}>{data.pressure}</span></div>
            </div>
            <div style={{ marginTop:8, paddingTop:6, borderTop:'1px solid #334155', fontSize:11, color:'#60a5fa' }}>
              Dashed line = forecast path
            </div>
          </div>
        </Popup>
      </Marker>
      {data.forecast.map((pt, i) => (
        <Marker key={i} position={[pt.lat, pt.lng]} icon={L.divIcon({
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#60a5fa;border:2px solid #1d4ed8;"></div>`,
          className:'', iconSize:[10,10], iconAnchor:[5,5]
        })}>
          <Popup><span style={{ fontSize:12 }}>{pt.label}</span></Popup>
        </Marker>
      ))}
    </>
  )
}

// ── Main MapComponent ─────────────────────────────────────────────────────────
export default function MapComponent({ disasters = [], onSelectRegion }) {
  const [heatmapData,   setHeatmapData]   = useState([])
  const [cycloneData,   setCycloneData]   = useState(null)
  const [floodZones,    setFloodZones]    = useState([])

  // Layer toggles
  const [showFlood,    setShowFlood]    = useState(false)
  const [showCyclone,  setShowCyclone]  = useState(false)
  const [showRadar,    setShowRadar]    = useState(false)
  const [showSatellite,setShowSatellite]= useState(false)

  const center = [20.5937, 78.9629]

  const loadLayers = useCallback(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/risk-heatmap`).then(r => setHeatmapData(r.data)).catch(() => {})
    axios.get(`${import.meta.env.VITE_API_URL}/api/cyclone-path`).then(r => setCycloneData(r.data)).catch(() => {})
    axios.get(`${import.meta.env.VITE_API_URL}/api/flood-risk-zones`).then(r => setFloodZones(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadLayers()
    const t = setInterval(loadLayers, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [loadLayers])

  const validDisasters = disasters.filter(d =>
    d.lat != null && d.lng != null && !isNaN(Number(d.lat)) && !isNaN(Number(d.lng))
  )

  // Layer toggle button style
  const btnStyle = (active) => ({
    padding: '5px 12px', borderRadius: 6, border: `1px solid ${active ? '#3b82f6' : '#1e293b'}`,
    background: active ? '#1e3a5f' : '#0f172a', color: active ? '#60a5fa' : '#64748b',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
    userSelect: 'none',
  })

  return (
    <div style={{ background: '#080e1a', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Live Disaster Map</span>
          {validDisasters.length > 0 && <span style={{ color: '#475569', fontSize: 12 }}>({validDisasters.length} incidents)</span>}
        </div>

        {/* Layer toggles */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button style={btnStyle(showSatellite)} onClick={() => setShowSatellite(v => !v)}>🛰️ Satellite</button>
          <button style={btnStyle(showCyclone)}   onClick={() => setShowCyclone(v => !v)}>🌀 Cyclone</button>
          <button style={btnStyle(showRadar)}     onClick={() => setShowRadar(v => !v)}>🌧️ Radar</button>
          <button style={btnStyle(showFlood)}     onClick={() => setShowFlood(v => !v)}>🌊 Flood Zones</button>
        </div>

        {/* Severity legend */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[['#ef4444','High'],['#f97316','Medium'],['#eab308','Low']].map(([c,l]) => (
            <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#94a3b8' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block' }} /> {l}
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '480px', position: 'relative' }}>
        <MapContainer center={center} zoom={5} style={{ height:'100%', width:'100%' }} className="z-0">
          <MapResizer />

          {/* Base tiles */}
          {showSatellite ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Esri World Imagery"
            />
          ) : (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            />
          )}

          {/* Risk heatmap (always on) */}
          <HeatLayer points={heatmapData} />

          {/* Rainfall radar */}
          <RainViewerLayer visible={showRadar} />

          {/* Flood zones heatmap */}
          <FloodHeatLayer zones={floodZones} visible={showFlood} />

          {/* Cyclone path + forecast */}
          <CycloneLayers data={cycloneData} visible={showCyclone} />

          {/* Map legend */}
          <MapLegend />

          {/* Disaster markers */}
          {validDisasters.map(d => (
            <Marker
              key={d.id}
              position={[Number(d.lat), Number(d.lng)]}
              icon={makeDisasterIcon(d.type, d.severity)}
              eventHandlers={{ click: () => onSelectRegion && onSelectRegion(d.location) }}
            >
              <Popup maxWidth={270}>
                <div style={{ color:'#f3f4f6', minWidth:210, fontSize:13 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{
                      padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700,
                      background:(DISASTER_META[d.type]||DISASTER_META.default).bg+'30',
                      color:(DISASTER_META[d.type]||DISASTER_META.default).bg,
                      border:`1px solid ${(DISASTER_META[d.type]||DISASTER_META.default).bg}60`,
                    }}>{d.severity}</span>
                    <span style={{ fontWeight:600, color:'#fff' }}>
                      {(DISASTER_META[d.type]||DISASTER_META.default).emoji} {d.type} Alert
                    </span>
                  </div>
                  <div style={{ fontSize:12, color:'#9ca3af', lineHeight:1.8 }}>
                    <div>📍 <span style={{ color:'#e5e7eb' }}>{d.location}</span></div>
                    {d.time && <div>🕐 <span style={{ color:'#e5e7eb' }}>{d.time}</span></div>}
                    {d.source && <div>📡 <span style={{ color:'#e5e7eb' }}>{d.source}</span></div>}
                  </div>
                  <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid #374151' }}>
                    <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Recommended Action</div>
                    <div style={{ fontSize:12, color:'#fde047', fontWeight:500 }}>
                      {ACTIONS[d.type] || ACTIONS.default}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectRegion && onSelectRegion(d.location)}
                    style={{
                      marginTop:10, width:'100%', padding:'6px 0',
                      background:'#1e3a5f', border:'1px solid #3b82f6',
                      borderRadius:6, color:'#60a5fa', fontSize:11, fontWeight:600,
                      cursor:'pointer'
                    }}
                  >
                    📊 View AI Prediction for {d.location.split(',')[0]}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
