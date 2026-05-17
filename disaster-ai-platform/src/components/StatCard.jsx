export default function StatCard({ title, value, icon: Icon, color = 'red', trend }) {
  const colorMap = {
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    value: 'text-red-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', value: 'text-orange-400' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: 'text-yellow-400', value: 'text-yellow-400' },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   value: 'text-blue-400' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  value: 'text-green-400' },
  }

  const c = colorMap[color] || colorMap.red

  return (
    <div className={`relative overflow-hidden bg-gray-900 border ${c.border} rounded-xl p-5 hover:border-opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group animate-fade-in`}>
      {/* Background glow */}
      <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-lg ${c.bg} border ${c.border}`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
          {trend !== undefined && (
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${trend >= 0 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.value}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
