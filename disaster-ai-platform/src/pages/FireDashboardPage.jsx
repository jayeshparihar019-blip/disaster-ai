import React, { useState, useEffect } from 'react';
import { Flame, Truck, MapPin, Bell, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import AlertTable from '../components/AlertTable';
import MapComponent from '../components/MapComponent';
import CitizenReports from '../components/CitizenReports';

// Fire Mock Alerts
const FIRE_ALERTS = [
  { id: 2, time: '18:31 IST', location: 'Jaipur, Rajasthan', type: 'Fire', severity: 'High', source: 'Emergency 101', resource: 'Fire Engines 3, 4', lat: 26.9124, lng: 75.7873, severityScore: 88 },
  { id: 8, time: '17:10 IST', location: 'Surat, Gujarat', type: 'Fire', severity: 'Low', source: 'Fire Dept. Sensors', resource: 'Fire Brigade Unit 2', lat: 21.1702, lng: 72.8311, severityScore: 30 },
  { id: 11, time: '16:15 IST', location: 'Delhi Industrial Area', type: 'Fire', severity: 'High', source: 'Emergency 101', resource: 'Aerial Tankers, 5 Fire Engines', lat: 28.7041, lng: 77.1025, severityScore: 94 },
];

export default function FireDashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-red-900/50 to-gray-900 border border-red-500/20 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between shadow-lg shadow-red-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-lg text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Flame size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Fire Department Control Room</h1>
              <p className="text-red-400 text-sm font-medium">Welcome, {user?.name || 'Chief'}</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg flex items-center gap-2 text-orange-400 text-sm font-bold">
            <Activity size={16} />
            LOCAL INCIDENTS: 3 ACTIVE
          </div>
        </div>

        {/* ─── Citizen Disaster Reports (Fire-filtered by default) ─────── */}
        <div className="mb-8">
          <CitizenReports defaultTypeFilter="Fire" />
        </div>

        {/* Emergency Response Tracking */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-red-400">
            <Truck className="text-red-500" />
            Emergency Response Tracking
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Engines Deployed</div>
              <div className="text-2xl font-black text-white">18</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Available Engines</div>
              <div className="text-2xl font-black text-green-400">42</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Avg Response Time</div>
              <div className="text-2xl font-black text-white">6m 24s</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Total Incidents Today</div>
              <div className="text-2xl font-black text-white">14</div>
            </div>
          </div>
        </div>

        {/* Fire Alerts */}
        <div className="mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Bell className="text-red-500" />
            Active Fire Alerts
          </h2>
          <AlertTable alerts={FIRE_ALERTS} onAlertClick={setSelectedAlert} selectedId={selectedAlert?.id} />
        </div>

        {/* Map */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <MapPin className="text-red-500" />
            Nearby Incidents Map
          </h2>
          <MapComponent disasters={FIRE_ALERTS} />
        </div>
      </div>
    </div>
  );
}
