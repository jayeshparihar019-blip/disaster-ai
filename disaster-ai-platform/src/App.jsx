import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import ReportDisasterPage from './pages/ReportDisasterPage'
import LoginPage from './pages/LoginPage'
import ReliefShelters from './pages/ReliefShelters'
import NdrfDashboardPage from './pages/NdrfDashboardPage'
import FireDashboardPage from './pages/FireDashboardPage'
import GovernmentSchemes from './pages/GovernmentSchemes'
import Services from './pages/Services'
import AIAssistantPage from './pages/AIAssistantPage'
import ProtectedRoute from './components/ProtectedRoute'
import SOSButton from './components/SOSButton'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/report" element={<ReportDisasterPage />} />
        <Route path="/relief-shelters" element={<ReliefShelters />} />
        <Route path="/government-schemes" element={<GovernmentSchemes />} />
        <Route path="/services" element={<Services />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route 
          path="/ndrf-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ndrf']}>
              <NdrfDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fire-dashboard" 
          element={
            <ProtectedRoute allowedRoles={['fire']}>
              <FireDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Global floating SOS button — visible on all pages */}
      <SOSButton />
    </BrowserRouter>
  )
}

export default App
