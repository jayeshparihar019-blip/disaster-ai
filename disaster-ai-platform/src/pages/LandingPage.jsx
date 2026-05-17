import { Link } from 'react-router-dom'
import { Shield, Zap, Brain, Map, Truck, ArrowRight, Activity, AlertTriangle, ChevronDown, Globe } from 'lucide-react'
import Navbar from '../components/Navbar'
import FeatureCard from '../components/FeatureCard'

const features = [
  {
    icon: Activity,
    title: 'Real-Time Disaster Detection',
    description: 'Continuously monitors social media streams, weather APIs, and sensor networks to detect emerging disaster events the moment they happen.',
    color: 'red',
  },
  {
    icon: Brain,
    title: 'AI Text Analysis',
    description: 'Advanced NLP models analyze thousands of messages per second to identify, classify, and score disaster events by type and severity.',
    color: 'orange',
  },
  {
    icon: Map,
    title: 'Live Disaster Map',
    description: 'Interactive real-time map visualizes all active alerts geo-tagged by location with severity markers and detailed information popups.',
    color: 'blue',
  },
  {
    icon: Truck,
    title: 'Resource Recommendation',
    description: 'AI-driven engine recommends optimal emergency resources — rescue teams, equipment, and logistics — based on disaster type and severity.',
    color: 'green',
  },
]

const stats = [
  { value: '98.7%', label: 'Detection Accuracy' },
  { value: '<30s', label: 'Alert Latency' },
  { value: '500+', label: 'Data Sources' },
  { value: '24/7', label: 'Live Monitoring' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 animated-gradient overflow-hidden"
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(239,68,68,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(239,68,68,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto animate-fade-in pt-20">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <Globe className="w-3.5 h-3.5" />
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            LIVE — Monitoring 500+ Global Data Sources
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white mb-6">
            AI Powered Disaster
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Intelligence Platform
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time disaster detection powered by AI. Monitor, analyze, and respond to emergencies
            faster than ever — using social media signals, weather data, and field reports.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              id="open-dashboard-cta"
              className="flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5 group text-base"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/report"
              id="report-disaster-hero-btn"
              className="flex items-center gap-2 px-8 py-3.5 bg-gray-800/80 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-all duration-200 hover:-translate-y-0.5 text-base backdrop-blur-sm"
            >
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              Report Disaster
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-800/60 rounded-2xl overflow-hidden border border-gray-800 max-w-3xl w-full">
          {stats.map((s) => (
            <div key={s.label} className="bg-gray-950/80 px-6 py-5 text-center backdrop-blur-sm hover:bg-gray-900/80 transition-colors">
              <p className="text-2xl md:text-3xl font-black text-red-400">{s.value}</p>
              <p className="text-gray-400 text-xs mt-1 font-medium uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 animate-bounce">
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-4">
              Built for Emergency Responders
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Every feature designed to shave precious seconds off detection and response time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950 border-t border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to save lives?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join emergency response teams worldwide using our platform for faster, smarter disaster management.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-base transition-all duration-200 hover:shadow-2xl hover:shadow-red-600/30 hover:-translate-y-0.5"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="text-white font-semibold text-sm">Disaster Intelligence Platform</span>
        </div>
        <p>© 2026 · AI-Powered Emergency Response · Built to save lives</p>
      </footer>
    </div>
  )
}
