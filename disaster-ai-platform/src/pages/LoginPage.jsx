import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShieldAlert, Flame, Lock, User, Building, AlertTriangle } from 'lucide-react';


const LoginPage = () => {
  const [department, setDepartment] = useState('NDRF');
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, skip the login screen
  const existingToken = localStorage.getItem('token');
  const existingUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  if (existingToken && existingUser) {
    if (existingUser.role === 'ndrf') return <Navigate to="/ndrf-dashboard" replace />;
    if (existingUser.role === 'fire') return <Navigate to="/fire-dashboard" replace />;
  }


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department, officerId, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Also store role and department for easy checks
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userDepartment', data.user.department);

      // Redirect: go back to where they came from, or default dashboard
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'ndrf') {
        navigate('/ndrf-dashboard', { replace: true });
      } else if (data.user.role === 'fire') {
        navigate('/fire-dashboard', { replace: true });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0b0f1a] animated-gradient overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-red-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="z-10 w-full max-w-md p-8 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Color accent top bar */}
        <div className={`absolute top-0 left-0 w-full h-1 ${department === 'NDRF' ? 'bg-orange-500' : 'bg-red-500'} transition-colors duration-500`}></div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {department === 'NDRF' ? (
              <div className="p-3 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <ShieldAlert size={32} />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Flame size={32} />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider">SECURE ACCESS</h2>
          <p className="text-gray-400 text-sm mt-1">Emergency Personnel Authentication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Department</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="NDRF">NDRF</option>
                <option value="Fire Department">Fire Department</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Officer ID</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. NDRF-001 or FIRE-001"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm mt-2">
            <label className="flex items-center text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
              <input type="checkbox" className="mr-2 rounded bg-gray-800 border-gray-600 outline-none" />
              Remember me
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              department === 'NDRF' 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)]'
            }`}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Unauthorized access is strictly prohibited and logged.</p>
          <p className="mt-1">System is protected by AI Verification Layer.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
