import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/authRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import predictionRoutes from './routes/predictionRoutes.js'
import shelterRoutes from './routes/shelterRoutes.js'
import sosRoutes from './routes/sosRoutes.js'
import animalRescueRoutes from './routes/animalRescueRoutes.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = Number(process.env.PORT || 8000)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || ''

app.disable('x-powered-by')

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true) // curl / server-to-server
      if (!FRONTEND_ORIGIN) return cb(null, true) // allow all in dev by default
      return cb(null, origin === FRONTEND_ORIGIN)
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health
app.get('/health', (req, res) => res.json({ ok: true }))

// Core API routes (already authored in this repo)
app.use('/api/auth', authRoutes)
app.use('/api', reportRoutes)
app.use('/api', predictionRoutes)
app.use('/api', shelterRoutes)
app.use('/api', sosRoutes)
app.use('/api', animalRescueRoutes)

// Compatibility aliases used by frontend `src/api/disasters.js`
app.get('/api/disasters', (req, res) => {
  res.redirect(302, '/api/alerts')
})
app.get('/api/disasters/:id', (req, res) => {
  res.status(404).json({ message: 'Not implemented: use /api/alerts and filter client-side.' })
})
app.get('/api/stats', async (req, res) => {
  // Lightweight derived stats from alerts
  try {
    const { default: fs } = await import('fs')
    const dataFile = path.join(__dirname, 'data', 'reports.json')
    const raw = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf-8') : '[]'
    const reports = JSON.parse(raw)
    const visible = reports.filter(r => r.status === 'verified' || r.status === 'under_response')
    const totalAlerts = visible.length
    const highSeverity = visible.filter(r => r.severity === 'High').length
    const citiesAffected = new Set(visible.map(r => (r.location || '').split(',')[0].trim()).filter(Boolean)).size
    const resourcesRecommended = Math.max(0, totalAlerts * 2) // placeholder metric
    res.json({ totalAlerts, highSeverity, citiesAffected, resourcesRecommended })
  } catch (e) {
    res.status(200).json({ totalAlerts: 0, highSeverity: 0, citiesAffected: 0, resourcesRecommended: 0 })
  }
})

// Simple “advanced model” endpoint (OpenAI-compatible; safe fallback when no key)
app.post('/api/ai/assistant', async (req, res) => {
  const prompt = (req.body?.prompt || '').toString().trim()
  if (!prompt) return res.status(400).json({ error: 'prompt is required' })

  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || ''
  const model = process.env.AI_MODEL || 'gpt-4.1-mini'

  // Fallback: deterministic “smart” response with actionable structure
  if (!apiKey) {
    return res.json({
      model: 'mock',
      answer:
        `AI is not configured (missing AI_API_KEY / OPENAI_API_KEY).\n\n` +
        `Here’s a structured response anyway:\n` +
        `- Summary: ${prompt.slice(0, 120)}${prompt.length > 120 ? '…' : ''}\n` +
        `- Next steps: Add AI_API_KEY in backend env, then retry.`,
    })
  }

  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are an emergency-response assistant. Be concise, practical, and safety-focused. Provide checklists and prioritized actions.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    })

    if (!r.ok) {
      const text = await r.text()
      return res.status(502).json({ error: 'AI provider error', details: text })
    }

    const data = await r.json()
    const answer = data?.choices?.[0]?.message?.content || ''
    return res.json({ model, answer })
  } catch (e) {
    return res.status(502).json({ error: 'AI request failed', details: e?.message || String(e) })
  }
})

// Error handler (multer/fileFilter errors + general)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const msg = err?.message || 'Server error'
  const status = err?.statusCode || 500
  res.status(status).json({ error: msg })
})

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})

