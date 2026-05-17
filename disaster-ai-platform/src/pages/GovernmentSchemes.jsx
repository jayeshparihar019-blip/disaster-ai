import { useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Wand2, Loader2, FileText, Home, Wheat, Heart, Building2 } from 'lucide-react'
import Navbar from '../components/Navbar'

// ── Scheme Data ───────────────────────────────────────────────────────────────
const SCHEMES = [
  {
    id: 1,
    icon: '💰',
    color: 'blue',
    name: 'National Disaster Relief Fund (NDRF)',
    ministry: 'Ministry of Home Affairs',
    description: 'Provides immediate financial assistance to people affected by natural calamities declared as national disasters.',
    eligibility: ['Residents in officially declared disaster zones', 'Families who have lost property or livelihood', 'Individuals with Aadhaar-linked bank accounts'],
    benefits: ['Emergency cash relief up to ₹1,20,000', 'Reconstruction support for damaged houses', 'Agriculture input subsidy for crop damage'],
    disasterTypes: ['Flood', 'Earthquake', 'Cyclone', 'Landslide'],
    link: 'https://ndma.gov.in',
  },
  {
    id: 2,
    icon: '🌾',
    color: 'green',
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    ministry: 'Ministry of Agriculture',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss or damage due to natural calamities.',
    eligibility: ['All farmers growing notified crops', 'Loanee and non-loanee farmers', 'Tenant farmers with valid land records'],
    benefits: ['Full crop insurance coverage at minimal premium (2%)', 'Payout within 2 months of damage assessment', 'Technology-based fast claim settlement'],
    disasterTypes: ['Flood', 'Cyclone', 'Drought', 'Pest Attack'],
    link: 'https://pmfby.gov.in',
  },
  {
    id: 3,
    icon: '🏠',
    color: 'orange',
    name: 'Pradhan Mantri Awas Yojana (Emergency)',
    ministry: 'Ministry of Housing and Urban Affairs',
    description: 'Emergency housing support for families whose homes were destroyed or severely damaged in natural disasters.',
    eligibility: ['BPL families whose homes are destroyed', 'Residents in disaster-affected districts', 'Priority to widows and differently-abled persons'],
    benefits: ['₹1.2 lakh for pucca house construction (rural)', '₹1.5 lakh interest subsidy (urban)', 'Toilets and LPG connection included'],
    disasterTypes: ['Flood', 'Earthquake', 'Cyclone', 'Landslide', 'Tsunami'],
    link: 'https://pmaymis.gov.in',
  },
  {
    id: 4,
    icon: '🏥',
    color: 'red',
    name: 'Ayushman Bharat PM-JAY (Disaster Extension)',
    ministry: 'Ministry of Health & Family Welfare',
    description: 'Health insurance coverage extended for disaster victims requiring immediate hospitalisation and medical treatment.',
    eligibility: ['All disaster-affected families in notified zones', 'Patients requiring hospitalisation due to disaster injuries', 'Covers pre-existing conditions worsened by disaster'],
    benefits: ['Health cover up to ₹5 lakh per family per year', 'Cashless treatment at 25,000+ hospitals', 'Covers injuries, surgery, ICU, and follow-up'],
    disasterTypes: ['All Disaster Types'],
    link: 'https://pmjay.gov.in',
  },
  {
    id: 5,
    icon: '💼',
    color: 'purple',
    name: 'MGNREGS Disaster Employment Scheme',
    ministry: 'Ministry of Rural Development',
    description: 'Guaranteed 100 days of wage employment for rural households post-disaster to restore livelihoods and rebuild infrastructure.',
    eligibility: ['Rural households in disaster-affected areas', 'Adult members willing to do unskilled manual work', 'Priority to BPL and SC/ST households'],
    benefits: ['₹333/day wage guarantee (Min. in many states)', 'Work provided within 15 days of application', 'Unemployment allowance if work not provided'],
    disasterTypes: ['Flood', 'Drought', 'Earthquake', 'Cyclone'],
    link: 'https://nrega.nic.in',
  },
  {
    id: 6,
    icon: '🎓',
    color: 'cyan',
    name: 'National Scholarship for Disaster-Affected Students',
    ministry: 'Ministry of Education',
    description: 'Scholarship support for students whose education was disrupted due to natural disasters, covering fees and living expenses.',
    eligibility: ['Students enrolled in classes 1–12 or college', 'Annual family income below ₹2 lakh', 'Schools/colleges in declared disaster zones'],
    benefits: ['Up to ₹25,000 per year for higher education', 'Stationery and book allowance', 'Laptop provision for displaced students'],
    disasterTypes: ['All Disaster Types'],
    link: 'https://scholarships.gov.in',
  },
]

// ── AI Eligibility Checker ────────────────────────────────────────────────────
const DISASTER_TYPES_LIST = ['Flood', 'Earthquake', 'Cyclone', 'Landslide', 'Tsunami', 'Fire', 'Drought', 'Other']

function AIEligibilityChecker() {
  const [form, setForm] = useState({ location: '', income: '', disasterType: '', occupation: 'farmer' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkEligibility = () => {
    if (!form.location || !form.disasterType) {
      alert('Please fill in location and disaster type.')
      return
    }
    setLoading(true)
    setResults(null)
    setTimeout(() => {
      const income = parseInt(form.income) || 0
      const eligible = SCHEMES.filter(s => {
        const matchesDisaster = s.disasterTypes.includes(form.disasterType) || s.disasterTypes.includes('All Disaster Types')
        return matchesDisaster
      })
      const priority = eligible.filter(s => {
        if (form.occupation === 'farmer' && s.name.includes('Fasal')) return true
        if (income < 200000 && s.name.includes('Awas')) return true
        if (s.name.includes('NDRF') || s.name.includes('Ayushman')) return true
        return false
      })
      setResults({ eligible, priority })
      setLoading(false)
    }, 1800)
  }

  return (
    <div className="bg-gradient-to-br from-purple-950/60 to-gray-900 border border-purple-700/40 rounded-2xl p-6 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-purple-600/20 border border-purple-600/40 rounded-xl flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">✨ AI Scheme Eligibility Checker</h2>
          <p className="text-purple-400 text-xs">Enter your details — AI will suggest eligible government schemes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Your Location', key: 'location', placeholder: 'e.g. Jaipur, Rajasthan', type: 'text' },
          { label: 'Annual Income (₹)', key: 'income', placeholder: 'e.g. 150000', type: 'number' },
        ].map(({ label, key, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full bg-gray-800/60 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/60 placeholder-gray-500" />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Disaster Type</label>
          <select value={form.disasterType} onChange={e => setForm(f => ({ ...f, disasterType: e.target.value }))}
            className="w-full bg-gray-800/60 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40 [&>option]:bg-gray-800">
            <option value="">Select...</option>
            {DISASTER_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Occupation</label>
          <select value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))}
            className="w-full bg-gray-800/60 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/40 [&>option]:bg-gray-800">
            {['farmer', 'daily_wage', 'salaried', 'business', 'student', 'unemployed'].map(o => (
              <option key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={checkEligibility} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-600/25">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</> : <><Wand2 className="w-4 h-4" /> Check My Eligibility</>}
      </button>

      {results && (
        <div className="mt-5 border-t border-purple-800/40 pt-5">
          <p className="text-sm text-purple-300 font-semibold mb-3">
            ✅ AI found <span className="text-white">{results.eligible.length}</span> schemes you may qualify for:
          </p>
          <div className="flex flex-wrap gap-2">
            {results.eligible.map(s => (
              <span key={s.id} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                results.priority.find(p => p.id === s.id)
                  ? 'bg-green-900/30 border-green-700/50 text-green-300'
                  : 'bg-gray-800/60 border-gray-700 text-gray-300'
              }`}>
                {results.priority.find(p => p.id === s.id) ? '⭐ ' : ''}{s.icon} {s.name.split('(')[0].trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Scheme Card ───────────────────────────────────────────────────────────────
const COLOR_MAP = {
  blue:   { bg: 'bg-blue-600/10',   border: 'border-blue-600/30',   badge: 'bg-blue-900/40 text-blue-300 border-blue-700/40',   btn: 'bg-blue-600 hover:bg-blue-500' },
  green:  { bg: 'bg-green-600/10',  border: 'border-green-600/30',  badge: 'bg-green-900/40 text-green-300 border-green-700/40', btn: 'bg-green-700 hover:bg-green-600' },
  orange: { bg: 'bg-orange-600/10', border: 'border-orange-600/30', badge: 'bg-orange-900/40 text-orange-300 border-orange-700/40', btn: 'bg-orange-600 hover:bg-orange-500' },
  red:    { bg: 'bg-red-600/10',    border: 'border-red-600/30',    badge: 'bg-red-900/40 text-red-300 border-red-700/40',       btn: 'bg-red-600 hover:bg-red-500' },
  purple: { bg: 'bg-purple-600/10', border: 'border-purple-600/30', badge: 'bg-purple-900/40 text-purple-300 border-purple-700/40', btn: 'bg-purple-600 hover:bg-purple-500' },
  cyan:   { bg: 'bg-cyan-600/10',   border: 'border-cyan-600/30',   badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',   btn: 'bg-cyan-700 hover:bg-cyan-600' },
}

function SchemeCard({ scheme }) {
  const [open, setOpen] = useState(false)
  const c = COLOR_MAP[scheme.color]

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl flex-shrink-0">{scheme.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-sm leading-snug">{scheme.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{scheme.ministry}</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-3">{scheme.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {scheme.disasterTypes.map(d => (
          <span key={d} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.badge}`}>{d}</span>
        ))}
      </div>

      {open && (
        <div className="mb-4 space-y-3 border-t border-gray-700/50 pt-3">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Eligibility</p>
            <ul className="space-y-1">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />{e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1.5">Benefits</p>
            <ul className="space-y-1">
              {scheme.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="text-yellow-400 flex-shrink-0">★</span>{b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs font-medium rounded-lg transition-colors">
          {open ? <><ChevronUp className="w-3 h-3" /> Hide Details</> : <><ChevronDown className="w-3 h-3" /> View Details</>}
        </button>
        <a href={scheme.link} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-1.5 px-3 py-1.5 ${c.btn} text-white text-xs font-semibold rounded-lg transition-colors`}>
          <FileText className="w-3 h-3" /> Apply Now
        </a>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function GovernmentSchemes() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = SCHEMES.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.disasterTypes.includes(filter) || s.disasterTypes.includes('All Disaster Types')
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold mb-4">
            <Building2 className="w-3 h-3" /> Government Relief Programs
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Government Disaster Relief Schemes</h1>
          <p className="text-gray-400 text-sm max-w-2xl">
            Find and apply for government programs providing financial aid, housing support, crop insurance, medical coverage, and employment for disaster-affected citizens.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Active Schemes', value: SCHEMES.length, color: 'text-blue-400' },
            { label: 'Total Aid Pool', value: '₹42,000 Cr', color: 'text-green-400' },
            { label: 'States Covered', value: '36', color: 'text-orange-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* AI Eligibility Checker */}
        <AIEligibilityChecker />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="Search schemes…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-800/60 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-gray-500" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 [&>option]:bg-gray-800">
            <option value="All">All Disaster Types</option>
            {DISASTER_TYPES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Scheme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(s => <SchemeCard key={s.id} scheme={s} />)}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No schemes found for your search.</p>
            </div>
          )}
        </div>

        {/* Helpline strip */}
        <div className="mt-10 bg-blue-900/20 border border-blue-700/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold">Need help applying?</p>
            <p className="text-gray-400 text-sm">Call the National Disaster Management Helpline</p>
          </div>
          <a href="tel:1078" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/20 text-sm">
            📞 Call 1078 — NDMA Helpline
          </a>
        </div>
      </div>
    </div>
  )
}
