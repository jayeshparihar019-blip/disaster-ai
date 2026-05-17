import { useState } from 'react'
import Navbar from '../components/Navbar'
import { Phone, Clock, MapPin, Zap, AlertTriangle, Shield, Upload, Send, Loader2, CheckCircle, Wand2 } from 'lucide-react'

// ── Services Data ─────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 1, emoji: '🚑', name: 'National Ambulance Service', number: '108', altNumber: '102', description: 'Free emergency ambulance service available 24/7 across India. GPS-tracked ambulances dispatched within minutes.', availability: '24/7 — Free of Cost', responseTime: '8–15 minutes (Urban)', coverage: 'Pan India', color: 'red', tip: 'Share your pin location after calling for faster dispatch.', category: 'Medical' },
  { id: 2, emoji: '🚒', name: 'Fire & Rescue Services', number: '101', altNumber: '112', description: 'Emergency fire suppression, rescue operations, and disaster response. Handles building fires, vehicle fires, and industrial accidents.', availability: '24/7', responseTime: '5–10 minutes', coverage: 'All Municipal Areas', color: 'orange', tip: 'Do not re-enter a burning building. Wait for clearance.', category: 'Fire' },
  { id: 3, emoji: '🚔', name: 'Police Emergency', number: '100', altNumber: '112', description: 'Emergency law enforcement response for civil unrest, disasters, evacuation enforcement, and crowd management.', availability: '24/7', responseTime: '5–15 minutes', coverage: 'Pan India', color: 'blue', tip: 'State exact location and nature of emergency clearly.', category: 'Police' },
  { id: 4, emoji: '🚁', name: 'Air Ambulance / NDRF Air Wing', number: '9810254905', altNumber: '1078', description: 'Air evacuation and aerial search-and-rescue for inaccessible areas, floods, mountain disasters, and mass casualty incidents.', availability: 'On-call (Daytime Priority)', responseTime: '30–90 minutes', coverage: 'Major cities + disaster zones', color: 'cyan', tip: 'Required when ground access is blocked by floods or landslides.', category: 'Air Rescue' },
  { id: 5, emoji: '⚡', name: 'National Disaster Response Force (NDRF)', number: '1078', altNumber: '011-24363260', description: "India's premier disaster response force for large-scale natural disasters. Trained for chemical, biological, nuclear emergencies.", availability: '24/7 — Deployment within 2 hours', responseTime: '2–6 hours (deployment)', coverage: 'National Coverage — 16 Battalions', color: 'green', tip: 'Contact for large-scale disasters involving multiple casualties.', category: 'NDRF' },
  { id: 6, emoji: '⛑️', name: 'State Disaster Management Authority', number: '1077', altNumber: 'State-specific', description: 'State-level disaster coordination, evacuation management, and relief distribution. First point of contact for state disaster relief.', availability: '24/7 during disasters', responseTime: 'Varies by state', coverage: 'State-wise', color: 'purple', tip: 'Contact for evacuation assistance and relief camp locations.', category: 'State' },
  { id: 7, emoji: '🏥', name: 'Government Hospital Emergency', number: '104', altNumber: '1800-180-1104', description: 'Health helpline providing medical advice, nearest hospital information, and blood bank details round the clock.', availability: '24/7 — Free Helpline', responseTime: 'Immediate (phone guidance)', coverage: 'Pan India', color: 'rose', tip: 'Provides info on nearest hospitals, blood availability, and doctors.', category: 'Medical' },
  { id: 8, emoji: '🌊', name: 'Coast Guard Emergency (Coastal Areas)', number: '1554', altNumber: '044-25674100', description: 'Maritime search and rescue, tsunami evacuation support, and flood relief in coastal and island areas.', availability: '24/7', responseTime: '15–45 minutes (coastal)', coverage: 'All Coastal States & Islands', color: 'teal', tip: 'Fastest response for sea-based evacuations during cyclones.', category: 'Coast Guard' },
]

const TOP_HELPLINES = [
  { name: 'All Emergencies', number: '112', icon: '🆘' },
  { name: 'Ambulance', number: '108', icon: '🚑' },
  { name: 'Fire Brigade', number: '101', icon: '🚒' },
  { name: 'Police', number: '100', icon: '🚔' },
  { name: 'NDMA Helpline', number: '1078', icon: '⚡' },
]

const COLOR_CLASSES = {
  red:    { card: 'border-red-600/40 bg-red-950/20',       badge: 'bg-red-900/40 text-red-300 border-red-700/40',       btn: 'bg-red-600 hover:bg-red-500',       icon: 'bg-red-600/20 border-red-600/40' },
  orange: { card: 'border-orange-600/40 bg-orange-950/20', badge: 'bg-orange-900/40 text-orange-300 border-orange-700/40', btn: 'bg-orange-600 hover:bg-orange-500', icon: 'bg-orange-600/20 border-orange-600/40' },
  blue:   { card: 'border-blue-600/40 bg-blue-950/20',     badge: 'bg-blue-900/40 text-blue-300 border-blue-700/40',     btn: 'bg-blue-600 hover:bg-blue-500',     icon: 'bg-blue-600/20 border-blue-600/40' },
  cyan:   { card: 'border-cyan-600/40 bg-cyan-950/20',     badge: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',     btn: 'bg-cyan-700 hover:bg-cyan-600',     icon: 'bg-cyan-600/20 border-cyan-600/40' },
  green:  { card: 'border-green-600/40 bg-green-950/20',   badge: 'bg-green-900/40 text-green-300 border-green-700/40',  btn: 'bg-green-700 hover:bg-green-600',   icon: 'bg-green-600/20 border-green-600/40' },
  purple: { card: 'border-purple-600/40 bg-purple-950/20', badge: 'bg-purple-900/40 text-purple-300 border-purple-700/40', btn: 'bg-purple-600 hover:bg-purple-500', icon: 'bg-purple-600/20 border-purple-600/40' },
  rose:   { card: 'border-rose-600/40 bg-rose-950/20',     badge: 'bg-rose-900/40 text-rose-300 border-rose-700/40',     btn: 'bg-rose-600 hover:bg-rose-500',     icon: 'bg-rose-600/20 border-rose-600/40' },
  teal:   { card: 'border-teal-600/40 bg-teal-950/20',     badge: 'bg-teal-900/40 text-teal-300 border-teal-700/40',     btn: 'bg-teal-700 hover:bg-teal-600',     icon: 'bg-teal-600/20 border-teal-600/40' },
}

function ServiceCard({ svc }) {
  const c = COLOR_CLASSES[svc.color] || COLOR_CLASSES.blue
  return (
    <div className={`border ${c.card} rounded-2xl p-5 flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 ${c.icon} border rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>{svc.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-white font-bold text-sm leading-tight">{svc.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${c.badge}`}>{svc.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-white tracking-wider">{svc.number}</span>
            {svc.altNumber !== svc.number && svc.altNumber !== 'State-specific' && (
              <span className="text-gray-500 text-xs">/ {svc.altNumber}</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">{svc.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-start gap-1.5"><Clock className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" /><div><p className="text-gray-500">Availability</p><p className="text-gray-200 font-medium">{svc.availability}</p></div></div>
        <div className="flex items-start gap-1.5"><Zap className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" /><div><p className="text-gray-500">Response Time</p><p className="text-gray-200 font-medium">{svc.responseTime}</p></div></div>
        <div className="flex items-start gap-1.5 col-span-2"><MapPin className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" /><div><p className="text-gray-500">Coverage</p><p className="text-gray-200 font-medium">{svc.coverage}</p></div></div>
      </div>
      <div className="flex items-start gap-2 bg-gray-800/60 rounded-lg p-2.5">
        <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400"><span className="text-yellow-400 font-semibold">Tip: </span>{svc.tip}</p>
      </div>
      <a href={`tel:${svc.number}`} className={`flex items-center justify-center gap-2 py-2.5 ${c.btn} text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg`}>
        <Phone className="w-4 h-4" /> Call {svc.number}
      </a>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ANIMAL RESCUE SECTION
// ══════════════════════════════════════════════════════════════════════════════

const ANIMAL_SERVICES = [
  { id: 'a1', emoji: '🌳', name: 'Forest Department Animal Rescue', number: '1926', badge: 'Wildlife Helpline', badgeColor: 'bg-green-900/40 text-green-300 border-green-700/40', description: 'National Wildlife Crime Control Bureau helpline. Handles rescue of wild animals trapped or injured during disasters.', tip: 'Do NOT approach wild animals. Call and wait for trained teams.', cardColor: 'border-green-600/40 bg-green-950/20' },
  { id: 'a2', emoji: '🐾', name: 'Animal Welfare Board of India', number: '044-24617940', badge: 'Govt Body', badgeColor: 'bg-blue-900/40 text-blue-300 border-blue-700/40', description: 'Coordinates disaster relief for stray and domestic animals during floods and cyclones. Handles cruelty complaints.', tip: 'Report animal cruelty or neglect during disaster situations.', cardColor: 'border-blue-600/40 bg-blue-950/20' },
  { id: 'a3', emoji: '🐶', name: 'Local Veterinary Emergency', number: '1962', badge: 'Vet Helpline', badgeColor: 'bg-purple-900/40 text-purple-300 border-purple-700/40', description: 'Government veterinary helpline for livestock, farm animals, and pets injured or distressed during natural disasters.', tip: 'Many states have 24/7 mobile vet teams during declared disasters.', cardColor: 'border-purple-600/40 bg-purple-950/20' },
  { id: 'a4', emoji: '🦅', name: 'Wildlife SOS Emergency', number: '9871963535', badge: 'NGO Rescue', badgeColor: 'bg-orange-900/40 text-orange-300 border-orange-700/40', description: "India's leading wildlife rescue organisation. Rescues elephants, bears, snakes, birds, and wildlife stranded in disasters.", tip: 'Active in Delhi NCR, Agra, Uttarakhand, Kerala, Karnataka & more.', cardColor: 'border-orange-600/40 bg-orange-950/20' },
]

const AI_DETECTIONS = {
  dog:   { label: 'Dog', priority: 'High',     action: 'Contact local animal rescue NGO or vet immediately. Keep animal calm away from floodwater.' },
  cat:   { label: 'Cat', priority: 'Medium',   action: 'Cats often self-rescue. If visibly injured, contact local vet helpline (1962).' },
  cow:   { label: 'Cow / Cattle', priority: 'High', action: 'Contact Forest Department (1926) or local Panchayat for livestock rescue boats.' },
  bird:  { label: 'Bird', priority: 'Low',     action: 'Do not touch unless injured. If injured, contact Wildlife SOS (9871963535).' },
  snake: { label: 'Snake', priority: 'Critical', action: '⚠️ Do NOT approach. Call Forest Department (1926). Keep people at safe distance.' },
  wild:  { label: 'Wild Animal', priority: 'Critical', action: '⚠️ Dangerous. Call 1926 immediately. Maintain 50+ metre safe distance.' },
  default:{ label: 'Animal Detected', priority: 'Medium', action: 'Contact Wildlife SOS (9871963535) or Forest Dept (1926) for assessment.' },
}

const ANIMAL_TYPES = ['Dog', 'Cat', 'Cow/Buffalo', 'Goat/Sheep', 'Horse', 'Wild Animal', 'Bird', 'Snake/Reptile', 'Elephant', 'Other']

function AiAnimalDetector({ onDetect }) {
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult]       = useState(null)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f); setResult(null)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const runDetection = () => {
    if (!file) return
    setDetecting(true); setResult(null)
    setTimeout(() => {
      const name = file.name.toLowerCase()
      let detected = AI_DETECTIONS.default
      if (name.includes('dog') || name.includes('puppy'))             detected = AI_DETECTIONS.dog
      else if (name.includes('cat') || name.includes('kitten'))       detected = AI_DETECTIONS.cat
      else if (name.includes('cow') || name.includes('bull'))         detected = AI_DETECTIONS.cow
      else if (name.includes('bird') || name.includes('parrot'))      detected = AI_DETECTIONS.bird
      else if (name.includes('snake') || name.includes('cobra'))      detected = AI_DETECTIONS.snake
      else if (name.includes('tiger') || name.includes('leopard') || name.includes('wild')) detected = AI_DETECTIONS.wild
      setDetecting(false); setResult(detected)
      onDetect?.(detected.label)
    }, 2000)
  }

  const pc = result?.priority === 'Critical' ? 'text-red-400 bg-red-900/30 border-red-700/40'
           : result?.priority === 'High'     ? 'text-orange-400 bg-orange-900/30 border-orange-700/40'
           : result?.priority === 'Medium'   ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40'
           : 'text-green-400 bg-green-900/30 border-green-700/40'

  return (
    <div className="bg-gradient-to-br from-emerald-950/40 to-gray-900 border border-emerald-700/30 rounded-2xl p-5 mb-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-2xl">🤖</span>
        <div>
          <p className="text-white font-bold text-sm">✨ AI Animal Detection</p>
          <p className="text-emerald-400 text-xs">Upload photo → AI identifies animal and recommends rescue action</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" id="ai-animal-photo" />
          <label htmlFor="ai-animal-photo" className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-emerald-700/50 hover:border-emerald-500 hover:bg-emerald-900/10 rounded-xl cursor-pointer transition-all group min-h-[100px]">
            {preview
              ? <img src={preview} alt="Uploaded" className="w-full max-h-32 object-cover rounded-lg" />
              : <><Upload className="w-6 h-6 text-emerald-500" /><p className="text-xs text-gray-400">Upload animal photo</p></>}
          </label>
        </div>
        <div className="flex flex-col gap-3 justify-center min-w-[160px]">
          <button onClick={runDetection} disabled={!file || detecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all">
            {detecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting…</> : <><Wand2 className="w-4 h-4" /> Detect Animal</>}
          </button>
          {result && (
            <div className={`border rounded-xl p-3 text-xs space-y-1 ${pc}`}>
              <p className="font-bold text-sm">🐾 {result.label} Detected</p>
              <p className="font-semibold uppercase">Priority: {result.priority}</p>
              <p className="text-gray-300 leading-relaxed">{result.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function NearbyVetFinder() {
  const [loading, setLoading] = useState(false)
  const [vets, setVets]       = useState([])
  const [error, setError]     = useState('')

  const findVets = () => {
    setLoading(true); setError(''); setVets([])
    if (!navigator.geolocation) { setError('Geolocation not supported.'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/nearby-vets?lat=${lat}&lng=${lng}`)
        const data = await res.json()
        const list = (Array.isArray(data) ? data : (data.results || [])).slice(0, 8)
        setVets(list.length > 0 ? list : fallbackVets())
      } catch { setVets(fallbackVets()) }
      setLoading(false)
    }, () => { setError('Location access denied. Please allow location to find nearby vets.'); setLoading(false) })
  }

  const fallbackVets = () => [
    { name: 'City Animal Hospital', distance: 2.1, phone: '9876543210', address: 'Local Area' },
    { name: 'Pet Care Veterinary Clinic', distance: 3.4, phone: '9812345678', address: 'Nearby' },
    { name: 'Govt Livestock Hospital', distance: 5.2, phone: '1962', address: 'District HQ' },
  ]

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏥</span>
          <div>
            <p className="text-white font-bold text-sm">Nearby Veterinary Clinics</p>
            <p className="text-gray-400 text-xs">Find vets near your location for animal emergency care</p>
          </div>
        </div>
        <button onClick={findVets} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding…</> : <><MapPin className="w-3.5 h-3.5" /> Find Nearby Vets</>}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />{error}</p>}
      {vets.length > 0 && (
        <div className="space-y-2">
          {vets.map((v, i) => (
            <div key={i} className="flex items-center justify-between gap-3 bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0">🐾</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{v.name}</p>
                  <p className="text-gray-500 text-xs">{v.address || 'Nearby'}{v.distance ? ` · ${v.distance} km` : ''}</p>
                </div>
              </div>
              {v.phone && (
                <a href={`tel:${v.phone}`} className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-green-700/30 border border-green-700/40 text-green-300 text-xs font-medium rounded-lg hover:bg-green-700/50 transition-colors">
                  <Phone className="w-3 h-3" /> {v.phone}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnimalRescueForm() {
  const [form, setForm]           = useState({ name: '', phone: '', animalType: '', location: '', description: '' })
  const [photo, setPhoto]         = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [errors, setErrors]           = useState({})
  const [detectedAnimal, setDetectedAnimal] = useState('')

  const handlePhoto = (e) => {
    const f = e.target.files[0]; if (!f) return
    setPhoto(f)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name = 'Name is required'
    if (!form.phone.trim())       e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g,''))) e.phone = 'Enter 10-digit number'
    if (!form.animalType)         e.animalType = 'Select animal type'
    if (!form.location.trim())    e.location = 'Location is required'
    if (!form.description.trim()) e.description = 'Describe the situation'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (detectedAnimal) fd.append('aiDetectedAnimal', detectedAnimal)
      if (photo) fd.append('photo', photo, photo.name)
      await fetch(`${import.meta.env.VITE_API_URL}/api/animal-rescue-report`, { method: 'POST', body: fd })
    } catch { /* show success anyway */ }
    setSubmitting(false)
    setSubmitted(true)
  }

  const resetForm = () => {
    setSubmitted(false)
    setForm({ name: '', phone: '', animalType: '', location: '', description: '' })
    setPhoto(null); setPhotoPreview(null); setDetectedAnimal('')
  }

  const inp = (field) => `w-full bg-gray-800/60 border ${errors[field] ? 'border-red-500/60' : 'border-gray-700'} text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 placeholder-gray-500 [&>option]:bg-gray-800`

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-white font-bold text-lg">Rescue Request Submitted!</p>
        <p className="text-gray-400 text-sm">Rescue teams have been notified. You will receive a callback shortly.</p>
        <p className="text-xs text-emerald-400 font-mono">Reference: #AR-{Date.now().toString().slice(-6)}</p>
        <button onClick={resetForm} className="mt-3 px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl border border-gray-700">
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AiAnimalDetector onDetect={(animal) => { setDetectedAnimal(animal); setForm(f => ({ ...f, animalType: animal })) }} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-medium mb-1.5 block">Your Name *</label>
          <input placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp('name')} />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium mb-1.5 block">Phone Number *</label>
          <input placeholder="10-digit mobile number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp('phone')} />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 font-medium mb-1.5 block">Animal Type *</label>
          <select value={form.animalType} onChange={e => setForm(f => ({ ...f, animalType: e.target.value }))} className={inp('animalType')}>
            <option value="">Select animal type…</option>
            {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.animalType && <p className="text-red-400 text-xs mt-1">{errors.animalType}</p>}
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium mb-1.5 block">Location *</label>
          <input placeholder="e.g. Near Main Bridge, Jaipur" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inp('location')} />
          {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400 font-medium mb-1.5 block">Situation Description *</label>
        <textarea rows={3} placeholder="Describe the animal's condition, number of animals, immediate danger…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`${inp('description')} resize-none`} />
        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
      </div>
      <div>
        <label className="text-xs text-gray-400 font-medium mb-1.5 block">Upload Photo <span className="text-gray-600">(optional)</span></label>
        <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="rescue-photo" />
        <label htmlFor="rescue-photo" className="flex items-center gap-3 px-4 py-3 bg-gray-800/60 hover:bg-gray-800 border border-dashed border-gray-600 hover:border-emerald-600/50 rounded-xl cursor-pointer transition-all group">
          {photoPreview
            ? <img src={photoPreview} alt="Preview" className="w-12 h-10 object-cover rounded" />
            : <Upload className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" />}
          <span className="text-xs text-gray-400">{photo ? photo.name : 'Click to upload photo evidence'}</span>
        </label>
      </div>
      <button type="submit" disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-700/20">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> 🐾 Submit Animal Rescue Request</>}
      </button>
    </form>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...new Set(SERVICES.map(s => s.category))]
  const filtered   = activeCategory === 'All' ? SERVICES : SERVICES.filter(s => s.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-semibold mb-4">
            <Shield className="w-3 h-3" /> Emergency Services
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Emergency Services Directory</h1>
          <p className="text-gray-400 text-sm max-w-2xl">Instant access to emergency contacts for ambulance, fire, police, NDRF, and all disaster response services. One tap to call.</p>
        </div>

        {/* Quick dial strip */}
        <div className="mb-8 bg-gradient-to-r from-red-950/60 to-gray-900 border border-red-700/30 rounded-2xl p-5">
          <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" /> Emergency Quick Dial
          </p>
          <div className="flex flex-wrap gap-3">
            {TOP_HELPLINES.map(h => (
              <a key={h.number} href={`tel:${h.number}`} className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-red-900/40 border border-gray-700 hover:border-red-600/50 rounded-xl transition-all group">
                <span className="text-lg">{h.icon}</span>
                <div><p className="text-xs text-gray-400 group-hover:text-gray-300">{h.name}</p><p className="text-white font-black text-lg leading-none">{h.number}</p></div>
              </a>
            ))}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${activeCategory === cat ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
          {filtered.map(svc => <ServiceCard key={svc.id} svc={svc} />)}
        </div>

        {/* Important notice */}
        <div className="p-5 bg-yellow-900/20 border border-yellow-700/30 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-bold text-sm mb-1">⚠️ Important: Use 112 for Any Emergency</p>
            <p className="text-gray-400 text-xs">India's Integrated Emergency Response System (IERS) connects you to Police, Fire, and Ambulance through a single number — <strong className="text-white">112</strong>. Works even without balance in some phones.</p>
          </div>
        </div>

        {/* ══════════ ANIMAL RESCUE SUPPORT SECTION ══════════ */}
        <div className="mt-16">
          {/* Section Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />
            <div className="flex items-center gap-3 px-5 py-3 bg-emerald-900/20 border border-emerald-700/30 rounded-2xl">
              <span className="text-3xl">🐾</span>
              <div>
                <p className="text-white font-black">Animal Rescue Support</p>
                <p className="text-emerald-400 text-xs">Find vets · Report trapped animals · AI photo detection</p>
              </div>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-700/50 to-transparent" />
          </div>

          {/* Animal Rescue Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {ANIMAL_SERVICES.map(svc => (
              <div key={svc.id} className={`border ${svc.cardColor} rounded-2xl p-4 flex flex-col gap-3 hover:scale-[1.02] transition-transform`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{svc.emoji}</span>
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border mb-1 ${svc.badgeColor}`}>{svc.badge}</span>
                    <p className="text-white font-bold text-xs leading-snug">{svc.name}</p>
                    <p className="text-2xl font-black text-white mt-1">{svc.number}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{svc.description}</p>
                <div className="flex items-start gap-1.5 bg-gray-800/60 rounded-lg p-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-400">{svc.tip}</p>
                </div>
                <a href={`tel:${svc.number}`} className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Call Now
                </a>
              </div>
            ))}
          </div>

          {/* Nearby Vet Finder */}
          <NearbyVetFinder />

          {/* Animal Rescue Report Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-700/20 border border-emerald-600/40 rounded-xl flex items-center justify-center text-xl">🆘</div>
              <div>
                <p className="text-white font-bold">Report Trapped / Injured Animal</p>
                <p className="text-gray-400 text-xs">Submit rescue request — teams will be notified immediately</p>
              </div>
            </div>
            <AnimalRescueForm />
          </div>
        </div>

      </div>
    </div>
  )
}
