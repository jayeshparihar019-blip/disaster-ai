import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Shield, Menu, X, AlertTriangle, ShieldAlert, Flame } from 'lucide-react'

const PUBLIC_LINKS = [
  { label: 'Home',               to: '/' },
  { label: 'Dashboard',          to: '/dashboard' },
  { label: 'Report Disaster',    to: '/report' },
  { label: 'Relief Shelters',    to: '/relief-shelters' },
  { label: 'Gov. Schemes',       to: '/government-schemes' },
  { label: 'Services',           to: '/services' },
  { label: 'AI Assistant',       to: '/ai-assistant' },
]


function readUser() {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(readUser)
  const location = useLocation()
  const navigate = useNavigate()

  // Keep user state in sync with localStorage across all navigations
  useEffect(() => {
    const sync = () => setUser(readUser())
    window.addEventListener('storage', sync)
    // Also re-read on every route change so navigation doesn't stale the state
    sync()
    return () => window.removeEventListener('storage', sync)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userDepartment')
    setUser(null)
    navigate('/')
  }

  const isAdmin = user?.role === 'ndrf' || user?.role === 'fire'
  const cmdLink = user?.role === 'ndrf' ? '/ndrf-dashboard' : user?.role === 'fire' ? '/fire-dashboard' : null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full" />
            </div>
            <div>
              <span className="text-white font-bold text-sm leading-none block">Disaster Intelligence</span>
              <span className="text-red-400 text-xs leading-none">Platform</span>
            </div>
          </Link>

          {/* ── Desktop links ─────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {PUBLIC_LINKS.map((link) => {
              const active = location.pathname === link.to
              return (
                <Link key={link.to} to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}>
                  {link.label}
                </Link>
              )
            })}

            {/* Command Center link — only for admin */}
            {isAdmin && cmdLink && (
              <Link to={cmdLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === cmdLink
                    ? 'text-orange-300 bg-orange-500/20 border border-orange-500/30'
                    : 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 border border-orange-500/20'
                }`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                Command Center
              </Link>
            )}

            {/* Admin badge */}
            {isAdmin && (
              <span className="ml-1 flex items-center gap-1 px-2.5 py-1 bg-orange-500/10 border border-orange-500/25 rounded-full text-xs font-bold text-orange-400 animate-pulse">
                🛡 {user.department || user.role?.toUpperCase()} Active
              </span>
            )}

            {/* Auth button */}
            {!user ? (
              <Link to="/login"
                className="ml-2 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 rounded-lg transition-colors">
                <ShieldAlert className="w-3.5 h-3.5" />
                Emergency Login
              </Link>
            ) : (
              <button onClick={handleLogout}
                className="ml-2 px-4 py-2 text-sm font-medium text-gray-400 border border-gray-600 hover:bg-gray-800 hover:text-white rounded-lg transition-colors focus:outline-none">
                Logout
              </button>
            )}

            <Link to="/report"
              className="ml-2 flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25">
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Disaster
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 animate-fade-in">
          <div className="px-4 py-3 space-y-1">

            {PUBLIC_LINKS.map((link) => {
              const active = location.pathname === link.to
              return (
                <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}>
                  {link.label}
                </Link>
              )
            })}

            {/* Mobile Command Center */}
            {isAdmin && cmdLink && (
              <Link to={cmdLink} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 transition-colors">
                <ShieldAlert className="w-3.5 h-3.5" />
                Command Center
              </Link>
            )}

            {/* Mobile admin badge */}
            {isAdmin && (
              <div className="px-4 py-2 text-xs font-bold text-orange-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                🛡 {user.department || user.role?.toUpperCase()} Mode Active
              </div>
            )}

            {!user ? (
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 mt-1 rounded-lg text-sm font-medium text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 transition-colors text-center">
                Emergency Login
              </Link>
            ) : (
              <button onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block w-full px-4 py-2.5 mt-1 rounded-lg text-sm font-medium text-gray-400 border border-gray-600 hover:bg-gray-800 hover:text-white transition-colors text-center">
                Logout
              </button>
            )}

            <Link to="/report" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg mt-1 w-full justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Disaster
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
