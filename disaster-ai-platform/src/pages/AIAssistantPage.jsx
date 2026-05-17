import { useMemo, useState } from 'react'
import Navbar from '../components/Navbar'

function getApiBase() {
  const raw = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return raw.replace(/\/$/, '')
}

export default function AIAssistantPage() {
  const apiBase = useMemo(() => getApiBase(), [])
  const [prompt, setPrompt] = useState(
    'Create a priority action checklist for a flood alert in my city. Include citizen steps and responder steps.',
  )
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      const r = await fetch(`${apiBase}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(data?.error || 'Request failed')
      setAnswer(data?.answer || '')
    } catch (e) {
      setError(e?.message || 'Failed to fetch AI response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Response Assistant</h1>
          <p className="text-sm text-gray-400 mt-1">
            Uses your backend endpoint <span className="text-gray-300 font-mono">{apiBase}/api/ai/assistant</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-200">Prompt</h2>
              <button
                onClick={run}
                disabled={loading || !prompt.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
              >
                {loading ? 'Thinking…' : 'Run'}
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={10}
              className="w-full resize-none rounded-xl bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
              placeholder="Ask for an action plan, advisory, evacuation guidance, or a situational report…"
            />

            <div className="mt-3 text-xs text-gray-500">
              Tip: set <span className="text-gray-300 font-mono">AI_API_KEY</span> in the backend to use a real model;
              otherwise it returns a safe mock.
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
            <h2 className="font-semibold text-sm text-gray-200 mb-3">Answer</h2>
            <div className="rounded-xl bg-gray-950 border border-gray-800 p-4 min-h-[18rem]">
              {loading ? (
                <div className="text-sm text-gray-400">Generating response…</div>
              ) : answer ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-100 leading-relaxed">{answer}</pre>
              ) : (
                <div className="text-sm text-gray-500">
                  Run the prompt to see a structured checklist. This page is intentionally minimal and fast for hackathon
                  demos.
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              If you’re still pointing to Render, update{' '}
              <span className="text-gray-300 font-mono">VITE_API_URL</span> (in{' '}
              <span className="text-gray-300 font-mono">disaster-ai-platform/.env</span>) to{' '}
              <span className="text-gray-300 font-mono">http://localhost:8000</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

