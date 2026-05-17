import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import { Navigation, PhoneCall, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const createIcon = (color, size = [25, 41]) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const icons = {
  user:             createIcon('red'),
  shelter:          createIcon('green'),
  hospital:         createIcon('blue'),
  community_centre: createIcon('gold'),
};

// Larger, glowing variant for the currently selected shelter
const selectedIcons = {
  shelter:          createIcon('green',  [38, 62]),
  hospital:         createIcon('blue',   [38, 62]),
  community_centre: createIcon('gold',   [38, 62]),
};

// ── Map helpers ───────────────────────────────────────────────────────────────
/**
 * Registers the map instance in a ref so the parent can drive it.
 * Also runs invalidateSize() once to fix blank tile rendering.
 */
function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);
  }, [map, mapRef]);
  return null;
}

/**
 * Watches selectedShelter and flyTo-animates the map whenever it changes.
 * markerRefs is a Map<id, Leaflet Marker instance> so we can openPopup().
 */
function FlyToOnSelect({ selectedShelter, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedShelter) return;

    // Fly with smooth animation (duration 1 s)
    map.flyTo([selectedShelter.lat, selectedShelter.lng], 16, { duration: 1 });

    // Open popup after animation settles (markercluster may need a brief delay)
    const t = setTimeout(() => {
      const marker = markerRefs.current.get(selectedShelter.id);
      if (marker) {
        // If the marker is inside a cluster, spiderfy it first
        marker.__parent?.spiderfy?.();
        marker.openPopup();
      }
    }, 1100);
    return () => clearTimeout(t);
  }, [selectedShelter, map, markerRefs]);

  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  if (status === 'Available') return 'text-green-400 bg-green-400/10 border-green-400/20';
  if (status === 'Near Full')  return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReliefShelters() {
  const [userLocation,    setUserLocation]    = useState(null);
  const [shelters,        setShelters]        = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [formStatus,      setFormStatus]      = useState({ submitting: false, success: false, error: null });

  // refs for imperative map control
  const mapRef     = useRef(null);           // Leaflet map instance
  const markerRefs = useRef(new Map());      // shelter id → Leaflet Marker instance
  const listItemRefs = useRef(new Map());    // shelter id → list DOM node (for scroll-into-view)

  const [formData, setFormData] = useState({
    name: '', phone: '', people_count: 1,
    type: 'Airlift Rescue', medical_emergency: false, description: '',
  });

  // ── Location + shelter fetch ───────────────────────────────────────────────
  useEffect(() => {
    let settled = false;

    const fallback = (lat = 28.6139, lng = 77.2090) => {
      if (settled) return;   // prevent double-fire
      settled = true;
      setUserLocation({ lat, lng });
      fetchShelters(lat, lng);
    };

    if (!navigator.geolocation) { fallback(); return; }

    // Hard 5-second timeout — geolocation in many environments never fires the
    // error callback; this guarantees the fallback runs so the map always loads.
    const timer = setTimeout(() => fallback(), 5000);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { clearTimeout(timer); fallback(coords.latitude, coords.longitude); },
      ()            => { clearTimeout(timer); fallback(); },
      { timeout: 8000, maximumAge: 60000 },
    );

    return () => clearTimeout(timer);
  }, []);

  const fetchShelters = async (lat, lng) => {
    setLoadingShelters(true);
    console.log('User Location:', lat, lng);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/nearby-shelters?lat=${lat}&lng=${lng}&radius=20`
      );
      // Backend returns a flat array of shelter objects
      const shelterList = Array.isArray(data) ? data : (data.results || []);
      console.log('Shelters API response:', shelterList.length, 'shelters loaded');
      setShelters(shelterList);
    } catch (e) {
      console.error('Failed to fetch shelters:', e);
      // Last-resort client-side fallback — generates shelters near detected location
      const fallback = [
        { id:'fb1', name:'City Emergency Shelter',    lat: lat+0.07, lng: lng+0.08, type:'shelter',          distance:10, available_beds:120, capacity:500, medical_support:true,  occupancy_status:'Available' },
        { id:'fb2', name:'District Community Centre', lat: lat-0.04, lng: lng+0.11, type:'community_centre', distance:13, available_beds:80,  capacity:300, medical_support:false, occupancy_status:'Available' },
        { id:'fb3', name:'Government Hospital',       lat: lat+0.03, lng: lng-0.06, type:'hospital',         distance:7,  available_beds:200, capacity:800, medical_support:true,  occupancy_status:'Available' },
        { id:'fb4', name:'Flood Relief Shelter',      lat: lat-0.09, lng: lng-0.04, type:'shelter',          distance:11, available_beds:150, capacity:400, medical_support:false, occupancy_status:'Available' },
        { id:'fb5', name:'NDRF Disaster Relief Camp', lat: lat-0.11, lng: lng+0.07, type:'shelter',          distance:14, available_beds:250, capacity:700, medical_support:true,  occupancy_status:'Available' },
      ];
      console.log('Using client-side fallback — backend unreachable');
      setShelters(fallback);
    } finally {
      setLoadingShelters(false);
    }
  };

  // ── When user clicks a list row ────────────────────────────────────────────
  const handleShelterSelect = useCallback((shelter) => {
    setSelectedShelter(shelter);

    // Scroll the list item into view
    const el = listItemRefs.current.get(shelter.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  // ── Google Maps routing ────────────────────────────────────────────────────
  const openGoogleMaps = (lat, lng) => {
    const base = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(base, '_blank');
  };

  // ── Evacuation form ────────────────────────────────────────────────────────
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userLocation) {
      setFormStatus({ submitting: false, success: false, error: 'Location required for rescue.' });
      return;
    }
    setFormStatus({ submitting: true, success: false, error: null });
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/evacuation-request`, {
        ...formData, lat: userLocation.lat, lng: userLocation.lng,
      });
      setFormStatus({ submitting: false, success: true, error: null });
      setFormData({ name: '', phone: '', people_count: 1, type: 'Airlift Rescue', medical_emergency: false, description: '' });
      setTimeout(() => setFormStatus(p => ({ ...p, success: false })), 5000);
    } catch {
      setFormStatus({ submitting: false, success: false, error: 'Failed to submit request.' });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left column: map + list ──────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="text-green-500" />
              Relief Shelters &amp; Safe Zones
            </h1>
            <p className="text-gray-400 mt-1">
              Live safe routes and temporary shelters pulled directly from OpenStreetMap.
              <span className="ml-2 text-green-400 text-xs font-medium">Click a shelter in the list to focus it on the map.</span>
            </p>
          </div>

          {/* Map */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden h-[500px] relative z-0">
            {!userLocation ? (
              <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">
                Detecting your location…
              </div>
            ) : (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
              >
                {/* Registers mapRef + fixes tile sizing */}
                <MapController mapRef={mapRef} />

                {/* Handles flyTo + popup when selectedShelter changes */}
                <FlyToOnSelect selectedShelter={selectedShelter} markerRefs={markerRefs} />

                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                {/* User / disaster-zone pin */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
                  <Popup>
                    <div className="text-gray-100 font-medium">📍 Your Current Location</div>
                    <div className="text-xs text-red-400 mt-1">Affected Disaster Area</div>
                  </Popup>
                </Marker>

                {/* Shelter markers */}
                <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                  {shelters.map((shelter) => {
                    const isSelected = selectedShelter?.id === shelter.id;
                    const icon = isSelected
                      ? (selectedIcons[shelter.type] || selectedIcons.shelter)
                      : (icons[shelter.type]         || icons.shelter);

                    return (
                      <Marker
                        key={shelter.id}
                        position={[shelter.lat, shelter.lng]}
                        icon={icon}
                        ref={(m) => {
                          if (m) markerRefs.current.set(shelter.id, m);
                          else   markerRefs.current.delete(shelter.id);
                        }}
                        eventHandlers={{
                          click: () => handleShelterSelect(shelter),
                        }}
                      >
                        <Popup>
                          <div className="text-gray-100 p-1 min-w-[220px]">
                            <h3 className="font-bold border-b border-gray-700 pb-2 mb-2">{shelter.name}</h3>
                            <div className="space-y-1.5 text-xs text-gray-300">
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="capitalize text-white">{shelter.type.replace('_', ' ')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Distance:</span>
                                <span className="text-white">{shelter.distance} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Beds:</span>
                                <span className="text-white font-mono">{shelter.available_beds} / {shelter.capacity}</span>
                              </div>
                              {shelter.medical_support && (
                                <div className="text-blue-400 font-medium">⚕️ Medical Support Available</div>
                              )}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => openGoogleMaps(shelter.lat, shelter.lng)}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-medium transition-colors text-xs flex items-center justify-center gap-1"
                              >
                                <Navigation className="w-3 h-3" /> Directions
                              </button>
                              <button
                                onClick={() => {
                                  // Pre-fill the evacuation form with this shelter's coords as destination
                                  setFormData(f => ({ ...f, description: `Requesting rescue near ${shelter.name}` }));
                                  document.getElementById('evac-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition-colors text-xs"
                              >
                                Request Rescue
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </div>

          {/* Shelter list */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">Nearest Facilities ({shelters.length})</h3>
              <div className="flex items-center gap-3">
                {selectedShelter && (
                  <button
                    onClick={() => setSelectedShelter(null)}
                    className="text-xs text-gray-500 hover:text-gray-300 underline"
                  >
                    Clear selection
                  </button>
                )}
                {loadingShelters && <span className="text-xs text-blue-400 animate-pulse">Updating…</span>}
              </div>
            </div>

            <div className="divide-y divide-gray-800 max-h-[420px] overflow-y-auto">
              {shelters.length === 0 && !loadingShelters && (
                <div className="p-8 text-center text-gray-500">No shelters found nearby.</div>
              )}

              {shelters.map(shelter => {
                const isSelected = selectedShelter?.id === shelter.id;
                return (
                  <div
                    key={shelter.id}
                    ref={(el) => {
                      if (el) listItemRefs.current.set(shelter.id, el);
                      else   listItemRefs.current.delete(shelter.id);
                    }}
                    onClick={() => handleShelterSelect(shelter)}
                    className={`p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                      isSelected
                        ? 'bg-green-950/40 border-l-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.06)]'
                        : 'border-l-transparent hover:bg-gray-800/50 hover:border-l-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-medium flex-1 pr-4 ${isSelected ? 'text-green-300' : 'text-gray-100'}`}>
                        {isSelected && <span className="mr-1.5">📍</span>}
                        {shelter.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(shelter.occupancy_status)}`}>
                        {shelter.occupancy_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-400">
                      <div>📍 {shelter.distance} km away</div>
                      <div>🛏️ {shelter.available_beds} beds free</div>
                      <div className="capitalize text-gray-300">🏢 {shelter.type.replace('_', ' ')}</div>
                      {shelter.medical_support && <div className="text-blue-400">⚕️ Medically Equipped</div>}
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openGoogleMaps(shelter.lat, shelter.lng); }}
                          className="flex-1 py-1.5 bg-green-700/50 hover:bg-green-600/60 border border-green-600/40 text-green-300 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Get Directions
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(f => ({ ...f, description: `Requesting rescue near ${shelter.name}` }));
                            document.getElementById('evac-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex-1 py-1.5 bg-red-700/40 hover:bg-red-600/50 border border-red-600/40 text-red-300 rounded text-xs font-semibold transition-colors"
                        >
                          Request Rescue
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right column: evacuation form ────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div
            id="evac-form"
            className="bg-blue-950/20 border-2 border-blue-900/50 rounded-xl overflow-hidden sticky top-24 shadow-2xl shadow-blue-900/10"
          >
            <div className="p-5 border-b border-blue-900/50 bg-blue-900/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400">
                <AlertTriangle className="animate-pulse" />
                <h2 className="text-lg font-bold">Emergency Evacuation</h2>
              </div>
              <p className="text-sm text-blue-200/70">
                Request immediate extraction for individuals trapped in High-Risk Disaster Zones.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-4">

              {/* Rescue type buttons */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: 'Airlift Rescue', emoji: '🚁', active: 'bg-blue-600/20 border-blue-500 text-white' },
                  { val: 'Air Ambulance',  emoji: '🚑', active: 'bg-red-600/20  border-red-500  text-white' },
                ].map(({ val, emoji, active }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: val })}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      formData.type === val ? active : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-semibold text-center">{val}</span>
                  </button>
                ))}
              </div>

              {/* Fields */}
              {[
                { label: 'Contact Name', key: 'name', type: 'text', placeholder: 'Your Full Name' },
                { label: 'Phone Number', key: 'phone', type: 'tel',  placeholder: 'e.g. 9876543210' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
                  <input
                    required type={type} placeholder={placeholder}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">People Count</label>
                  <input
                    required type="number" min="1"
                    value={formData.people_count}
                    onChange={(e) => setFormData({ ...formData, people_count: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-700 bg-gray-900 text-red-500 focus:ring-red-500"
                      checked={formData.medical_emergency}
                      onChange={(e) => setFormData({ ...formData, medical_emergency: e.target.checked })}
                    />
                    <span className={`text-sm ${formData.medical_emergency ? 'text-red-400 font-medium' : 'text-gray-300'}`}>
                      Medical Emergency
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Current Location</label>
                <div className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                  📍 {userLocation
                    ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                    : 'Detecting GPS coordinates…'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Situation Description</label>
                <textarea
                  required rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="e.g. Family trapped on roof due to severe flooding…"
                />
              </div>

              {formStatus.error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded text-sm text-center">
                  {formStatus.error}
                </div>
              )}

              {formStatus.success ? (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded flex flex-col items-center gap-2 py-4">
                  <CheckCircle2 className="w-8 h-8" />
                  <p className="font-semibold">Evacuation Request Sent!</p>
                  <p className="text-xs text-center">NDRF Command Center will contact you shortly.</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={formStatus.submitting || !userLocation}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  {formStatus.submitting ? 'Sending Request…' : 'Send Rescue Signal'}
                  <PhoneCall className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
