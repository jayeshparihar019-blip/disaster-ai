export default function FeatureCard({ icon: Icon, title, description, color = 'red' }) {
  const colorMap = {
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    hover: 'hover:border-red-500/50' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-400', hover: 'hover:border-orange-500/50' },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   hover: 'hover:border-blue-500/50' },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  hover: 'hover:border-green-500/50' },
  }

  const c = colorMap[color] || colorMap.red

  return (
    <div className={`group bg-gray-900 border ${c.border} ${c.hover} rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default`}>
      <div className={`inline-flex p-3 rounded-lg ${c.bg} border ${c.border} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
