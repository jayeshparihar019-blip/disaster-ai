import React, { useEffect, useState } from 'react';
import RiskTrendGraph from './RiskTrendGraph';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat'; // Make sure this is imported

// A specific component to handle Map heatmap layers since they require a Leaflet map context
export const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Convert points to [lat, lng, intensity] format required by leaflet.heat
    const heatData = points.map(p => [p.lat, p.lng, p.risk]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 40,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.3: 'yellow',
        0.6: 'orange',
        0.9: 'red',
        1.0: 'darkred'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const AIPredictionDashboard = () => {
  const [alertData, setAlertData] = useState({ alert: false, message: "", risk_level: "Low" });
  const [trendData, setTrendData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAIData = async () => {
    try {
      const [alertRes, trendRes, heatRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/ai-alerts`),
        fetch(`${import.meta.env.VITE_API_URL}/api/risk-trend`),
        fetch(`${import.meta.env.VITE_API_URL}/api/risk-heatmap`)
      ]);

      if (alertRes.ok) setAlertData(await alertRes.json());
      if (trendRes.ok) setTrendData(await trendRes.json());
      if (heatRes.ok) setHeatmapData(await heatRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch AI data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAIData();

    // Auto refresh every 10 minutes
    const interval = setInterval(() => {
      fetchAIData();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
      {/* 1. Early Warning Alert Banner */}
      {alertData.alert && (
        <div className={`p-4 rounded-lg flex items-start gap-4 shadow-lg border relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500
          ${alertData.risk_level === 'High' ? 'bg-red-950/40 border-red-500/50 text-red-100' : 'bg-orange-950/40 border-orange-500/50 text-orange-100'}
        `}>
          {/* Glowing background effect */}
          <div className={`absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none 
            ${alertData.risk_level === 'High' ? 'bg-gradient-to-r from-red-600 to-transparent' : 'bg-gradient-to-r from-orange-600 to-transparent'}
          `} />
          
          <div className={`flex-shrink-0 animate-pulse ${alertData.risk_level === 'High' ? 'text-red-400' : 'text-orange-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="flex-1 relative z-10">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              AI Early Warning
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide
                ${alertData.risk_level === 'High' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}
              `}>
                {alertData.risk_level} RISK
              </span>
            </h2>
            <p className="text-lg mb-2 text-opacity-90">{alertData.message}</p>
            
            <div className="mt-2 text-sm opacity-80 border-t border-white/10 pt-2">
              <strong>Recommended actions:</strong> Prepare evacuation routes • Monitor parameters • Alert local authorities
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Risk Trend Graph Section */}
        <div className="lg:col-span-2">
          {loading ? (
             <div className="h-80 bg-slate-800 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
               Loading AI Models...
             </div>
          ) : (
            <RiskTrendGraph data={trendData} />
          )}
        </div>

        {/* 3. Small Info Panel / AI Controls */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Live Monitor Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Next AI Update</span>
                <span className="text-slate-200 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  10m auto-refresh
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Weather API</span>
                <span className="text-teal-400 font-medium">Connected</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">Predictive Model</span>
                <span className="text-blue-400 font-medium">Active (RF Ensembled)</span>
              </div>
            </div>
          </div>
          
          <button onClick={fetchAIData} className="mt-6 w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Force Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPredictionDashboard;
