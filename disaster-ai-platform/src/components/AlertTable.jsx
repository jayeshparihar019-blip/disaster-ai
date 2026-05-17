import { ChevronRight, Clock, MapPin, Flame, Calendar, User } from 'lucide-react'

const severityConfig = {
  High: {
    label: 'High',
    dot: 'bg-red-500',
    badge: 'bg-red-500/15 text-red-400 border border-red-500/30',
    row: 'hover:bg-red-500/5',
  },
  Medium: {
    label: 'Medium',
    dot: 'bg-orange-500',
    badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    row: 'hover:bg-orange-500/5',
  },
  Low: {
    label: 'Low',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    row: 'hover:bg-yellow-500/5',
  },
}

export default function AlertTable({ alerts, onAlertClick, selectedId }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400" />
          <h2 className="text-white font-semibold text-sm">Active Disaster Alerts</h2>
          <span className="ml-1 px-2 py-0.5 bg-red-500/15 text-red-400 text-xs rounded-full border border-red-500/30">
            {alerts.length} Active
          </span>
        </div>
        <p className="text-gray-500 text-xs">Click a row for details</p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800/60">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Reporter Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Disaster Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {alerts.map((alert) => {
              const s = severityConfig[alert.severity] || severityConfig.Low
              const isSelected = selectedId === alert.id
              return (
                <tr
                  key={alert.id}
                  onClick={() => onAlertClick(alert)}
                  className={`cursor-pointer transition-all duration-150 ${s.row} ${
                    isSelected ? 'bg-gray-800/60 border-l-2 border-red-500' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {alert.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {alert.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      {alert.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      {alert.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{alert.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dot} ${alert.severity === 'High' ? 'severity-pulse' : ''}`} />
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.badge}`}>
                        {s.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-red-400' : 'text-gray-600'}`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-800/50">
        {alerts.map((alert) => {
          const s = severityConfig[alert.severity] || severityConfig.Low
          return (
            <div
              key={alert.id}
              onClick={() => onAlertClick(alert)}
              className={`px-4 py-4 cursor-pointer transition-colors ${s.row}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white font-medium text-sm">{alert.type}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <p className="text-gray-400 text-xs">{alert.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {alert.time}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {alert.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {alert.name}</span>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ${s.badge}`}>
                  {s.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
