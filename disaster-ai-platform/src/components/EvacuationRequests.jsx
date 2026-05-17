import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PhoneCall, AlertTriangle, Search, CheckCircle2, Clock } from 'lucide-react';

export default function EvacuationRequests({ onStatusChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/evacuation-request`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch evacuation requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/evacuation-request/${id}/status`, { status });
      if (res.data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        if (onStatusChange) onStatusChange();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Rescue Team Assigned': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Evacuation in Progress': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'Completed': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-950/20">
        <div className="flex items-center gap-3">
          <PhoneCall className="w-5 h-5 text-red-400 animate-pulse" />
          <h2 className="text-base font-bold text-white">Emergency Evacuation Requests</h2>
          <span className="px-2 py-0.5 bg-red-500 text-white font-bold text-xs rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            {requests.filter(r => r.status === 'Pending').length} Pending
          </span>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Rescue Team Assigned', 'Evacuation in Progress', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === f ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 bg-gray-800 hover:text-white hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading && requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Scanning comm channels for evacuation requests...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
             <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
             <p className="text-gray-500">No active evacuation requests under this filter.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider">ID / Request</th>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider">Contact</th>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider">Type & Details</th>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider">Location</th>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-400 uppercase text-xs tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                     <div className="font-mono text-xs text-gray-500 mb-1">{req.id}</div>
                     <div className="text-gray-300 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(req.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-5 py-4">
                     <div className="font-bold text-gray-200">{req.name}</div>
                     <div className="text-gray-400 text-xs mt-0.5">{req.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                     <div className="flex items-center gap-2 mb-1.5">
                       <span className="font-semibold text-white">{req.type}</span>
                       <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded whitespace-nowrap">{req.people_count} People</span>
                     </div>
                     {req.medical_emergency && (
                        <div className="flex items-center gap-1 text-xs text-red-400 font-bold bg-red-900/20 inline-block px-1.5 py-0.5 rounded border border-red-900/50">
                          <AlertTriangle className="w-3 h-3"/> Medical Emergency
                        </div>
                     )}
                     {req.description && <p className="text-gray-400 text-xs mt-1 italic max-w-xs truncate" title={req.description}>"{req.description}"</p>}
                  </td>
                  <td className="px-5 py-4 text-xs">
                     <div className="text-gray-300 bg-gray-900 border border-gray-700 rounded px-2 py-1 font-mono inline-block">
                       {req.lat.toFixed(4)}, {req.lng.toFixed(4)}
                     </div>
                     <button 
                       onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${req.lat},${req.lng}`, '_blank')}
                       className="text-blue-400 hover:text-blue-300 underline mt-1 block flex items-center gap-1"
                     >
                       <Search className="w-3 h-3"/> View Map
                     </button>
                  </td>
                  <td className="px-5 py-4">
                     <span className={`px-2.5 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusBadge(req.status)}`}>
                       {req.status}
                     </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <select 
                      className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:border-red-500 focus:outline-none cursor-pointer"
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Rescue Team Assigned">Assign Team</option>
                      <option value="Evacuation in Progress">In Progress</option>
                      <option value="Completed">Complete</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
