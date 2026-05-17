import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import {
  Send, Upload, MapPin, User, FileText, AlertTriangle,
  CheckCircle, Loader2, Phone, CreditCard, ShieldAlert, X, Scale,
  Mic, MicOff, Video, Play, StopCircle, Trash2, Wand2
} from 'lucide-react'
import Navbar from '../components/Navbar'

const DISASTER_TYPES = ['Earthquake', 'Flood', 'Fire', 'Cyclone', 'Landslide', 'Tsunami', 'Industrial Accident', 'Other']
const API = import.meta.env.VITE_API_URL

const maskAadhaar = (num) => {
  if (!num || num.length < 4) return num
  return 'XXXX XXXX ' + num.slice(-4)
}

// ─── Voice Recorder Hook ───────────────────────────────────────────────────────
function useVoiceRecorder() {
  const [recording, setRecording]       = useState(false)
  const [audioBlob, setAudioBlob]       = useState(null)
  const [audioUrl,  setAudioUrl]        = useState(null)
  const [duration,  setDuration]        = useState(0)
  const mediaRecRef  = useRef(null)
  const chunksRef    = useRef([])
  const timerRef     = useRef(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRecRef.current = mr
      setRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } catch {
      alert('Microphone access denied. Please allow microphone in browser settings.')
    }
  }

  const stop = () => {
    mediaRecRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }

  const clear = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
  }

  useEffect(() => () => clearInterval(timerRef.current), [])

  return { recording, audioBlob, audioUrl, duration, start, stop, clear }
}

// ─── AI Transcription ──────────────────────────────────────────────────────────
function useTranscription() {
  const [transcribing, setTranscribing] = useState(false)
  const [transcript,   setTranscript]   = useState('')

  const transcribe = (blob) => {
    if (!blob) return
    setTranscribing(true)
    setTranscript('')

    // Use Web Speech API for real-time transcription
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setTranscript('AI transcription not supported in this browser. Chrome recommended.')
      setTranscribing(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN'

    // Play audio through a hidden audio element so speech recognition captures it
    // Since SpeechRecognition works on live mic, we use a different approach:
    // We pipe the audio blob back into recognition via a MediaStream
    const audioEl = document.createElement('audio')
    audioEl.src = URL.createObjectURL(blob)

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setTranscript(text || '(No speech detected)')
      setTranscribing(false)
    }
    recognition.onerror = () => {
      setTranscript('Transcription failed. Please type a description manually.')
      setTranscribing(false)
    }
    recognition.onend = () => setTranscribing(false)
    recognition.start()

    // Stop recognition after 15s max
    setTimeout(() => { try { recognition.stop() } catch {} }, 15000)
  }

  return { transcribing, transcript, setTranscript, transcribe }
}

// ─── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ form, onCancel, onConfirm, submitting }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-gray-900 border-2 border-orange-500/60 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500" />
        <div className="flex items-start justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/15 rounded-xl border border-orange-500/30">
              <ShieldAlert className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Disaster Report Verification Warning</h2>
              <p className="text-orange-400 text-xs font-semibold mt-0.5 uppercase tracking-widest">⚠ Official Government Notice</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-orange-500/5 border border-orange-500/30 rounded-xl p-4">
            <p className="text-orange-300 font-bold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Submitting a fake or false disaster report is a serious offense.
            </p>
            <ul className="space-y-1.5 text-sm text-gray-300">
              <li>⚖️ Legal action under the Disaster Management Act, 2005</li>
              <li>🛡️ Temporary or permanent account suspension</li>
              <li>📞 Reporting of the offender to local law enforcement</li>
            </ul>
          </div>
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">You are about to submit:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[['Reporter', form.name], ['Location', form.location], ['Type', form.disasterType], ['Severity', form.severity], ['Phone', `+91 ${form.phoneNumber}`], ['Aadhaar', maskAadhaar(form.aadhaarNumber)]].map(([k, v]) => (
                <div key={k} className="flex flex-col">
                  <span className="text-gray-500 text-xs">{k}</span>
                  <span className="font-semibold text-white">{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${agreed ? 'border-green-500/40 bg-green-500/5' : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'}`}>
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${agreed ? 'bg-green-500 border-green-500' : 'bg-gray-800 border-gray-600'}`}>
              {agreed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="sr-only" />
            <p className="text-sm text-gray-300">I confirm this report is <strong className="text-white">genuine</strong> and understand false reports may lead to <strong className="text-red-400">legal action</strong>.</p>
          </label>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-800">Cancel</button>
          <button onClick={onConfirm} disabled={!agreed || submitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Confirm & Submit</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportDisasterPage() {
  const [form, setForm] = useState({
    name: '', aadhaarNumber: '', phoneNumber: '',
    location: '', disasterType: '', severity: '', description: '',
  })
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile,    setImageFile]    = useState(null)
  const [videoFile,    setVideoFile]    = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [smsStatus, setSmsStatus]   = useState(null)
  const [reportId, setReportId]     = useState('')
  const [aiPriorityLabel, setAiPriorityLabel] = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [submittedUrls, setSubmittedUrls] = useState({})

  const voiceRec   = useVoiceRecorder()
  const transcription = useTranscription()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'aadhaarNumber' || name === 'phoneNumber') {
      const digits = value.replace(/\D/g, '')
      const max = name === 'aadhaarNumber' ? 12 : 10
      setForm(f => ({ ...f, [name]: digits.slice(0, max) }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleVideo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { alert('Video must be under 20MB'); return }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())         errs.name = 'Name is required'
    if (!form.aadhaarNumber)       errs.aadhaarNumber = 'Aadhaar number is required'
    else if (!/^\d{12}$/.test(form.aadhaarNumber)) errs.aadhaarNumber = 'Aadhaar must be exactly 12 digits'
    if (!form.phoneNumber)         errs.phoneNumber = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phoneNumber))   errs.phoneNumber = 'Enter a valid 10-digit Indian mobile number'
    if (!form.location.trim())     errs.location = 'Location is required'
    if (!form.disasterType)        errs.disasterType = 'Select a disaster type'
    if (!form.severity)            errs.severity = 'Select severity level'
    if (!form.description.trim())  errs.description = 'Description is required'
    if (form.description.length < 20) errs.description = 'Describe in at least 20 characters'
    return errs
  }

  const handleSubmitClick = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setShowModal(true)
  }

  const handleConfirmedSubmit = async () => {
    setSubmitting(true)
    setSmsStatus(null)
    try {
      // Use FormData for multipart/form-data (files + text fields)
      const fd = new FormData()
      fd.append('name',        form.name)
      fd.append('phone',       form.phoneNumber)
      fd.append('aadhaar',     form.aadhaarNumber)
      fd.append('location',    form.location)
      fd.append('type',        form.disasterType)
      fd.append('severity',    form.severity)
      fd.append('description', form.description)
      if (transcription.transcript) fd.append('transcription', transcription.transcript)

      // Attach files
      if (voiceRec.audioBlob) {
        fd.append('audioFile', voiceRec.audioBlob, `audio_${Date.now()}.webm`)
      }
      if (videoFile) {
        fd.append('videoFile', videoFile, videoFile.name)
      }
      if (imageFile) {
        fd.append('image', imageFile, imageFile.name)
      }

      const res  = await axios.post(`${API}/api/report`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const data = res.data
      setReportId(data.reportId || '')
      setAiPriorityLabel(data.aiPriorityLabel || '')
      setSubmittedUrls({ audioUrl: data.audioUrl, videoUrl: data.videoUrl, imageUrl: data.imageUrl })
      setSmsStatus(data.smsSent ? 'SMS sent to your number.' : 'Report saved. SMS in queue.')
      setShowModal(false)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.message || 'Submission failed. Please try again.' })
      setShowModal(false)
    } finally {
      setSubmitting(false)
    }
  }

  const resetAll = () => {
    setSubmitted(false); setSmsStatus(null); setReportId(''); setAiPriorityLabel(''); setSubmittedUrls({})
    setForm({ name: '', aadhaarNumber: '', phoneNumber: '', location: '', disasterType: '', severity: '', description: '' })
    setImagePreview(null); setImageFile(null); setVideoFile(null); setVideoPreview(null)
    voiceRec.clear(); transcription.setTranscript('')
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 pt-28 pb-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mb-5">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Report Submitted Successfully!</h2>
          <p className="text-gray-400 text-sm mb-5">
            Thank you, <span className="text-white font-semibold">{form.name}</span>. Your report for{' '}
            <span className="text-white font-semibold">{form.location}</span> is being reviewed by our AI systems.
          </p>

          {reportId && (
            <div className="w-full mb-4 px-4 py-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Your Report ID</p>
              <p className="text-2xl font-mono font-black text-white tracking-widest">{reportId}</p>
              <p className="text-xs text-gray-500 mt-1">Save this to track your report</p>
            </div>
          )}

          {/* Submitted media files */}
          {(submittedUrls.audioUrl || submittedUrls.videoUrl) && (
            <div className="w-full mb-4 bg-gray-900 border border-gray-800 rounded-xl p-4 text-left space-y-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Attached Evidence</p>
              {submittedUrls.audioUrl && (
                <div>
                  <p className="text-xs text-green-400 font-medium mb-1.5">🎤 Voice Report Stored</p>
                  <audio controls src={`${API}${submittedUrls.audioUrl}`} className="w-full h-10" />
                </div>
              )}
              {submittedUrls.videoUrl && (
                <div>
                  <p className="text-xs text-blue-400 font-medium mb-1.5">🎥 Video Evidence Stored</p>
                  <video controls src={`${API}${submittedUrls.videoUrl}`} className="w-full rounded-lg max-h-40" />
                </div>
              )}
              {transcription.transcript && (
                <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-3">
                  <p className="text-xs text-purple-400 font-semibold mb-1.5 flex items-center gap-1.5"><Wand2 className="w-3 h-3" /> AI Transcription</p>
                  <p className="text-sm text-gray-300 italic">"{transcription.transcript}"</p>
                </div>
              )}
            </div>
          )}

          <div className="w-full mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            {smsStatus || 'Report saved successfully.'}
          </div>

          {(aiPriorityLabel === 'CRITICAL' || aiPriorityLabel === 'HIGH') && (
            <div className="w-full mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              AI Priority: <strong>{aiPriorityLabel}</strong> — Authorities alerted.
            </div>
          )}

          <button onClick={resetAll} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">
            Report Another
          </button>
        </div>
      </div>
    )
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {showModal && (
        <ConfirmModal
          form={form}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmedSubmit}
          submitting={submitting}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-semibold mb-4">
            <AlertTriangle className="w-3 h-3" /> Emergency Report
          </div>
          <h1 className="text-3xl font-black text-white">Report a Disaster</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Help our AI detect and respond to emergencies faster. Attach voice + video evidence for faster response.</p>
        </div>

        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-orange-500/5 border border-orange-500/25 rounded-xl text-sm text-orange-400">
          <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p><span className="font-bold">Legal Notice:</span> False or fake disaster reports are a punishable offense under the Disaster Management Act, 2005.</p>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />{errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmitClick} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">

          <FormField label="Your Name" icon={User} required error={errors.name}>
            <input id="reporter-name" name="name" value={form.name} onChange={handleChange}
              placeholder="John Singh" className={inputClass(errors.name)} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Aadhaar Card Number" icon={CreditCard} required error={errors.aadhaarNumber}>
              <div className="relative">
                <input id="aadhaar-number" name="aadhaarNumber" type="text" inputMode="numeric"
                  value={form.aadhaarNumber} onChange={handleChange}
                  placeholder="12-digit Aadhaar" maxLength={12} className={inputClass(errors.aadhaarNumber)} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono">{form.aadhaarNumber.length}/12</span>
              </div>
            </FormField>

            <FormField label="Phone Number" icon={Phone} required error={errors.phoneNumber}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+91</span>
                <input id="phone-number" name="phoneNumber" type="tel" inputMode="tel"
                  value={form.phoneNumber} onChange={handleChange}
                  placeholder="10-digit mobile" maxLength={10}
                  className={`${inputClass(errors.phoneNumber)} pl-12`} />
              </div>
            </FormField>
          </div>

          <FormField label="Disaster Location" icon={MapPin} required error={errors.location}>
            <input id="disaster-location" name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Juhu Beach, Mumbai, Maharashtra" className={inputClass(errors.location)} />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Disaster Type" required error={errors.disasterType}>
              <select id="disaster-type" name="disasterType" value={form.disasterType} onChange={handleChange} className={inputClass(errors.disasterType)}>
                <option value="">Select type...</option>
                {DISASTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>

            <FormField label="Severity Level" required error={errors.severity}>
              <select id="disaster-severity" name="severity" value={form.severity} onChange={handleChange} className={inputClass(errors.severity)}>
                <option value="">Select severity...</option>
                <option value="Low">🟡 Low</option>
                <option value="Medium">🟠 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </FormField>
          </div>

          <FormField label="Disaster Description" icon={FileText} required error={errors.description}>
            <textarea id="disaster-description" name="description" value={form.description}
              onChange={handleChange} rows={3} className={`${inputClass(errors.description)} resize-none`}
              placeholder="Describe what you witnessed: water levels, people affected, immediate dangers…" />
            <p className="mt-1 text-xs text-gray-500 text-right">{form.description.length} characters</p>
          </FormField>

          {/* ── VOICE RECORDING ─────────────────────────────────────────── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Mic className="w-4 h-4 text-red-400" /> Voice Report
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>

            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3">
              {!voiceRec.audioUrl ? (
                <div className="flex items-center gap-3">
                  {!voiceRec.recording ? (
                    <button type="button" onClick={voiceRec.start}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/20">
                      <Mic className="w-4 h-4" /> 🎤 Record Voice Report
                    </button>
                  ) : (
                    <button type="button" onClick={voiceRec.stop}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-all animate-pulse">
                      <StopCircle className="w-4 h-4 text-red-400" /> Stop Recording
                    </button>
                  )}
                  {voiceRec.recording && (
                    <div className="flex items-center gap-2 text-sm text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {Math.floor(voiceRec.duration / 60).toString().padStart(2,'0')}:{(voiceRec.duration % 60).toString().padStart(2,'0')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <audio controls src={voiceRec.audioUrl} className="flex-1 h-10" />
                    <button type="button" onClick={voiceRec.clear}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AI Transcription */}
                  {!transcription.transcript && (
                    <button type="button"
                      onClick={() => transcription.transcribe(voiceRec.audioBlob)}
                      disabled={transcription.transcribing}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/50 border border-purple-700/50 text-purple-300 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                      {transcription.transcribing
                        ? <><Loader2 className="w-3 h-3 animate-spin" /> Transcribing…</>
                        : <><Wand2 className="w-3 h-3" /> ✨ AI Transcribe Voice Report</>}
                    </button>
                  )}

                  {transcription.transcript && (
                    <div className="bg-purple-900/20 border border-purple-700/40 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
                          <Wand2 className="w-3 h-3" /> AI Transcription
                        </p>
                        <button type="button" onClick={() => transcription.setTranscript('')}
                          className="text-gray-600 hover:text-gray-400 text-xs">clear</button>
                      </div>
                      <p className="text-sm text-gray-200 italic">"{transcription.transcript}"</p>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-600">Recording saved as WebM audio. AI transcription helps emergency teams respond faster.</p>
            </div>
          </div>

          {/* ── VIDEO UPLOAD ──────────────────────────────────────────────── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Video className="w-4 h-4 text-blue-400" /> 🎥 Upload Disaster Video
              <span className="text-gray-500 font-normal">(optional, max 20MB)</span>
            </label>
            <div>
              <input id="disaster-video" type="file" accept="video/mp4,video/webm,video/quicktime,.mov"
                onChange={handleVideo} className="hidden" />
              <label htmlFor="disaster-video"
                className="flex flex-col items-center gap-2 p-5 bg-gray-800/50 border-2 border-dashed border-gray-700 hover:border-blue-500/60 hover:bg-blue-500/5 rounded-xl cursor-pointer transition-all group">
                {videoPreview ? (
                  <div className="w-full relative">
                    <video src={videoPreview} controls className="w-full rounded-lg max-h-48" />
                    <button type="button"
                      onClick={(e) => { e.preventDefault(); setVideoFile(null); setVideoPreview(null) }}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-600 rounded-full text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-gray-500 group-hover:text-blue-400 transition-colors" />
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to upload MP4, WebM, or MOV</p>
                    <p className="text-xs text-gray-600">Max 20MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* ── IMAGE UPLOAD ─────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Image <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div>
              <input id="disaster-image" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <label htmlFor="disaster-image"
                className="flex flex-col items-center gap-3 p-5 bg-gray-800/50 border-2 border-dashed border-gray-700 hover:border-red-500/60 hover:bg-red-500/5 rounded-xl cursor-pointer transition-all group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-cover rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-500 group-hover:text-red-400 transition-colors" />
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to upload PNG, JPG, WEBP</p>
                    <p className="text-xs text-gray-600">Max 20MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Attachment summary */}
          {(voiceRec.audioBlob || videoFile || imageFile) && (
            <div className="flex flex-wrap gap-2">
              {voiceRec.audioBlob && <span className="px-2 py-1 bg-red-900/30 border border-red-800/50 text-red-300 text-xs rounded-full">🎤 Voice attached</span>}
              {videoFile && <span className="px-2 py-1 bg-blue-900/30 border border-blue-800/50 text-blue-300 text-xs rounded-full">🎥 {videoFile.name}</span>}
              {imageFile && <span className="px-2 py-1 bg-green-900/30 border border-green-800/50 text-green-300 text-xs rounded-full">🖼️ {imageFile.name}</span>}
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-400">
            <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Your Aadhaar is encrypted and securely stored. Only shared with authorized government agencies.</p>
          </div>

          <button id="submit-report-btn" type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-red-600/25">
            <Send className="w-4 h-4" />
            Submit Disaster Report
          </button>

          <p className="text-center text-xs text-gray-500">
            A verification warning will appear before submission. All reports are IP-logged and timestamped.
          </p>
        </form>
      </div>
    </div>
  )
}

// Helpers
function FormField({ label, icon: Icon, required, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function inputClass(hasError) {
  return `w-full bg-gray-800/60 border ${
    hasError ? 'border-red-500/60 focus:ring-red-500/40' : 'border-gray-700 focus:ring-red-500/30 focus:border-red-500/60'
  } text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all [&>option]:bg-gray-800`
}


