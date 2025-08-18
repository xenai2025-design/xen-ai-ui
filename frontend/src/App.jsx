import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import MultiModalAI from './components/MultiModalAI'
import AuthCallback from './components/AuthCallback'
import { useEffect } from 'react'

// Main App Component with Guest Mode Support
const AppContent = () => {
  const { loading, enableGuestMode } = useAuth()

  useEffect(() => {
    // Enable guest mode if not authenticated after loading
    if (!loading) {
      enableGuestMode()
    }
  }, [loading, enableGuestMode])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Legacy login/register routes (now handled by modal) */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      
      {/* OAuth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Main App Route - accessible to everyone */}
      <Route path="/" element={<MultiModalAI />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
