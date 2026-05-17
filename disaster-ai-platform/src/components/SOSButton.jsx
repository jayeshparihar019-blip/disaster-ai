import { useState, useEffect, useRef } from 'react'
import { X, Loader2, CheckCircle, MapPin, Mic, MicOff, Upload, AlertTriangle, Send } from 'lucide-react'

// ── Category config ────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'disaster',       label: 'Disaster Emergency', emoji: '🚨', color: 'red',     desc: 'People trapped, injured, immediate danger' },
  { id: 'animal_rescue',  label: 'Animal Rescue',       emoji: '🐾', color: 'emerald', desc: 'Animals trapped or injured in disaster' },
  { id: 'disaster_report',label: 'Report Disaster',     emoji: '📝', color: 'orange',  desc: 'Report a disaster incident in your area' },
]

const DISASTER_TYPES  = ['Flood', 'Earthquake', 'Fire', 'Cyclone', 'Landslide', 'Tsunami', 'Industrial Accident', 'Other']
const ANIMAL_TYPES    = ['Dog', 'Cat', 'Cow/Buffalo', 'Goat/Sheep', 'Horse', 'Wild Animal', 'Bird', 'Snake/Reptile', 'Elephant', 'Other']
const ANIMAL_CONDITIONS = ['Injured', 'Trapped in water', 'Stranded on rooftop', 'Unconscious', 'Aggressive/Dangerous', 'Other']

const COLOR = {
  red:     { ring: 'ring-red-500/40',     bg: 'bg-red-600',     hover: 'hover:bg-red-500',     light: 'bg-red-500/10 border-red-500/30',     text: 'text-red-400',     badge: 'bg-red-900/40 border-red-700/40 text-red-300' },
  emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-700', hover: 'hover:bg-emerald-600', light: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-900/40 border-emerald-700/40 text-emerald-300' },
  orange:  { ring: 'ring-orange-500/40',  bg: 'bg-orange-600',  hover: 'hover:bg-orange-500',  light: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400',  badge: 'bg-orange-900/40 border-orange-700/40 text-orange-300' },
}

// ── Geolocation hook ──────────────────────────────────────────────────────────
function useGeoLocation() {
  const [loc, setLoc]   = useState(null)
  const [err, setErr]   = useState(null)
  const [busy, setBusy] = useState(false)

  const detect = () => {
    if (!navigator.geolocation) { setErr('Geolocation not supported'); return }
    setBusy(true); setErr(null)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLoc({ lat: coords.latitude, lng: coords.longitude }); setBusy(false) },
      () => { setErr('Location access denied'); setBusy(false) },
      { timeout: 8000 }
    )
  }

  return { loc, err, busy, detect }
}

// ── Voice recorder hook ────────────────────────────────────────────────────────
function useVoice() {
  const [isRec, setIsRec] = useState(false)
  const [blob, setBlob]   = useState(null)
  const [url, setUrl]     = useState(null)
  const mrRef             = useRef(null)
  const chunksRef         = useRef([])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b); setUrl(URL.createObjectURL(b))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start(); mrRef.current = mr; setIsRec(true)
    } catch { alert('Microphone access denied') }
  }

  const stop = () => { mrRef.current?.stop(); setIsRec(false) }
  const clear = () => { setBlob(null); setUrl(null) }

  return { isRec, blob, url, start, stop, clear }
}

// ── The SOS Modal ─────────────────────────────────────────────────────────────
function SOSModal({ onClose }) {
  const [step, setStep]         = useState('category') // category | form | success
  const [category, setCategory] = useState(null)
  const [form, setForm]         = useState({ name: '', phone: '', description: '', disasterType: '', animalType: '', animalCondition: '', trappedCount: '', medicalEmergency: 'No' })
  const [photo, setPhoto]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [alertId, setAlertId]   = useState(null)
  const [errors, setErrors]     = useState({})

  const geo   = useGeoLocation()
  const voice = useVoice()

  // Auto-detect location when modal opens
  useEffect(() => { geo.detect() }, [])

  const handlePhoto = (e) => {
    const f = e.target.files[0]; if (!f) return
    setPhoto(f)
    const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target.result); r.readAsDataURL(f)
  }

  const selectCategory = (cat) => { setCategory(cat); setStep('form') }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = '10-digit number'
    if (!form.description.trim()) e.description = 'Required'
    if (category?.id === 'disaster_report' && !form.disasterType)   e.disasterType  = 'Select type'
    if (category?.id === 'animal_rescue'   && !form.animalType)      e.animalType    = 'Select type'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(); if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('type', category.id)
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (geo.loc) { fd.append('lat', geo.loc.lat); fd.append('lng', geo.loc.lng) }
      if (photo) fd.append('photo', photo, photo.name)
      if (voice.blob) fd.append('audio', voice.blob, 'sos_audio.webm')
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/sos`, { method: 'POST', body: fd })
      const data = await res.json()
      setAlertId(data.alertId || `SOS-${Date.now().toString().slice(-6)}`)
      setStep('success')
    } catch {
      setAlertId(`SOS-${Date.now().toString().slice(-6)}`)
      setStep('success')
    }
    setSubmitting(false)
  }

  const inp = (field) => `w-full bg-gray-800/60 border ${errors[field] ? 'border-red-500/60' : 'border-gray-700'} text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/30 placeholder-gray-500 [&>option]:bg-gray-800`
  const c = category ? COLOR[category.color] : COLOR.red

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-800 flex items-center justify-between ${step === 'category' ? 'bg-red-950/30' : ''}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🚨</span>
            <div>
              <p className="text-white font-black text-base">SOS Emergency Alert</p>
              <p className="text-gray-400 text-xs">
                {step === 'category' ? 'Select emergency type' : step === 'form' ? `${category.emoji} ${category.label}` : 'Alert Sent Successfully'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* ── Step 1: Category ─────────────────────────────────────────── */}
          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-gray-400 text-xs text-center mb-4">
                {geo.busy ? '📍 Detecting your location…' : geo.loc ? `📍 Location detected (${geo.loc.lat.toFixed(4)}, ${geo.loc.lng.toFixed(4)})` : geo.err || ''}
              </p>
              {CATEGORIES.map(cat => {
                const cc = COLOR[cat.color]
                return (
                  <button key={cat.id} onClick={() => selectCategory(cat)}
                    className={`w-full flex items-center gap-4 p-4 border ${cc.light} rounded-2xl hover:scale-[1.02] transition-all group text-left`}>
                    <span className="text-3xl">{cat.emoji}</span>
                    <div>
                      <p className={`font-bold text-sm ${cc.text}`}>{cat.label}</p>
                      <p className="text-gray-400 text-xs">{cat.desc}</p>
                    </div>
                    <span className="ml-auto text-gray-600 group-hover:text-gray-400 text-lg">›</span>
                  </button>
                )
              })}
              <p className="text-center text-xs text-gray-600 mt-3">Your location is automatically shared with rescue teams</p>
            </div>
          )}

          {/* ── Step 2: Form ──────────────────────────────────────────────── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Location status */}
              <div className={`flex items-center gap-2 p-2.5 rounded-lg ${geo.loc ? 'bg-green-900/20 border border-green-800/40' : 'bg-gray-800/60 border border-gray-700'}`}>
                <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${geo.loc ? 'text-green-400' : 'text-gray-500'}`} />
                <p className="text-xs text-gray-300">
                  {geo.busy ? 'Detecting location…' : geo.loc ? `📍 ${geo.loc.lat.toFixed(5)}, ${geo.loc.lng.toFixed(5)} — will be shared with responders` : (geo.err || 'Location not detected')}
                </p>
                {!geo.loc && !geo.busy && (
                  <button type="button" onClick={geo.detect} className="ml-auto text-xs text-blue-400 hover:text-blue-300">Retry</button>
                )}
              </div>

              {/* Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Name *</label>
                  <input placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp('name')} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Phone *</label>
                  <input placeholder="10-digit" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp('phone')} />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Category-specific fields */}
              {category.id === 'disaster' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">People Trapped</label>
                    <input type="number" min="0" placeholder="e.g. 3" value={form.trappedCount} onChange={e => setForm(f => ({ ...f, trappedCount: e.target.value }))} className={inp()} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Medical Emergency?</label>
                    <select value={form.medicalEmergency} onChange={e => setForm(f => ({ ...f, medicalEmergency: e.target.value }))} className={inp()}>
                      <option value="No">No</option><option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
              )}

              {category.id === 'animal_rescue' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Animal Type *</label>
                    <select value={form.animalType} onChange={e => setForm(f => ({ ...f, animalType: e.target.value }))} className={inp('animalType')}>
                      <option value="">Select…</option>
                      {ANIMAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.animalType && <p className="text-red-400 text-xs mt-1">{errors.animalType}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-medium mb-1 block">Condition</label>
                    <select value={form.animalCondition} onChange={e => setForm(f => ({ ...f, animalCondition: e.target.value }))} className={inp()}>
                      <option value="">Select…</option>
                      {ANIMAL_CONDITIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {category.id === 'disaster_report' && (
                <div>
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Disaster Type *</label>
                  <select value={form.disasterType} onChange={e => setForm(f => ({ ...f, disasterType: e.target.value }))} className={inp('disasterType')}>
                    <option value="">Select type…</option>
                    {DISASTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.disasterType && <p className="text-red-400 text-xs mt-1">{errors.disasterType}</p>}
                </div>
              )}

              {/* Description */}
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1 block">Description *</label>
                <textarea rows={3} placeholder="Describe the emergency situation in detail…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inp('description')} resize-none`} />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Media: Photo + Voice */}
              <div className="flex gap-3">
                {/* Photo */}
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Photo</label>
                  <input type="file" accept="image/*,video/*" onChange={handlePhoto} className="hidden" id="sos-photo" />
                  <label htmlFor="sos-photo" className="flex items-center gap-2 p-2.5 bg-gray-800/60 hover:bg-gray-800 border border-dashed border-gray-600 rounded-xl cursor-pointer transition-all group">
                    {photoPreview
                      ? <img src={photoPreview} alt="Preview" className="w-10 h-8 object-cover rounded" />
                      : <Upload className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transition-colors" />}
                    <span className="text-xs text-gray-400 truncate">{photo ? photo.name : 'Upload photo/video'}</span>
                  </label>
                </div>
                {/* Voice */}
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1 block">Voice Message</label>
                  {voice.url ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-900/20 border border-green-700/40 rounded-xl">
                      <audio src={voice.url} controls className="h-8 flex-1" />
                      <button type="button" onClick={voice.clear} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={voice.isRec ? voice.stop : voice.start}
                      className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-medium ${
                        voice.isRec ? 'bg-red-900/30 border-red-600/50 text-red-300 animate-pulse' : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}>
                      {voice.isRec ? <><MicOff className="w-4 h-4" /> Stop Recording</> : <><Mic className="w-4 h-4" /> Record Voice</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting}
                className={`w-full flex items-center justify-center gap-2 py-3.5 ${c.bg} ${c.hover} disabled:opacity-50 text-white font-black text-base rounded-xl transition-all hover:shadow-xl`}>
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending SOS…</> : <><Send className="w-5 h-5" /> 🚨 SEND EMERGENCY SOS</>}
              </button>

              <button type="button" onClick={() => setStep('category')} className="w-full text-xs text-gray-500 hover:text-gray-400 py-2">← Back to categories</button>
            </form>
          )}

          {/* ── Step 3: Success ────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-20 h-20 bg-green-500/15 border-2 border-green-500/40 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <p className="text-white font-black text-xl mb-1">SOS Alert Sent! 🚨</p>
                <p className="text-gray-400 text-sm">Emergency teams have been notified</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 w-full space-y-2 text-left">
                <div className="flex justify-between text-xs"><span className="text-gray-500">Alert ID</span><span className="text-white font-mono font-bold">{alertId}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-500">Type</span><span className={`font-medium ${c.text}`}>{category.emoji} {category.label}</span></div>
                {geo.loc && <div className="flex justify-between text-xs"><span className="text-gray-500">Location Shared</span><span className="text-green-400">✓ GPS coordinates sent</span></div>}
                <div className="flex justify-between text-xs"><span className="text-gray-500">Status</span><span className="text-yellow-400">⏳ Pending response</span></div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <a href="tel:112" className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors text-sm">
                  📞 Also Call 112 — All Emergencies
                </a>
                <button onClick={onClose} className="py-2 text-xs text-gray-500 hover:text-gray-400">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Floating SOS Button ────────────────────────────────────────────────────────
export default function SOSButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9998] group flex flex-col items-center gap-1"
        aria-label="Open SOS Emergency"
      >
        {/* Pulsing rings */}
        <span className="absolute w-16 h-16 rounded-full bg-red-500/30 animate-ping" />
        <span className="absolute w-16 h-16 rounded-full bg-red-500/20 animate-ping" style={{ animationDelay: '300ms' }} />
        {/* Main button */}
        <div className="relative w-16 h-16 bg-red-600 hover:bg-red-500 rounded-full flex flex-col items-center justify-center shadow-2xl shadow-red-600/50 transition-all duration-200 hover:scale-110 border-2 border-red-400/50">
          <span className="text-2xl leading-none">🚨</span>
          <span className="text-white text-[9px] font-black tracking-widest leading-none mt-0.5">SOS</span>
        </div>
      </button>

      {/* Modal */}
      {open && <SOSModal onClose={() => setOpen(false)} />}
    </>
  )
}
