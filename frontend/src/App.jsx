import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'
import { useUIStore } from './store/authStore'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { QuizProvider } from './contexts/QuizContext'

// Layout Components
import Layout from './components/Layout/Layout'
import AuthLayout from './components/Layout/AuthLayout'

// Auth Pages
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'

// Candidate Pages
import CandidateDashboard from './pages/Candidate/Dashboard'
import CandidateProfile from './pages/Candidate/Profile'
import ResumeUpload from './pages/Candidate/ResumeUpload'
import QuizDashboard from './pages/Candidate/QuizDashboard'
import QuizInterface from './pages/Candidate/QuizInterface'
import QuizResults from './pages/Candidate/QuizResults'
import JobListings from './pages/Candidate/JobListings'

// Recruiter Pages
import RecruiterDashboard from './pages/Recruiter/Dashboard'
import JobPosting from './pages/Recruiter/JobPosting'
import CandidateList from './pages/Recruiter/CandidateList'
import CandidateDetails from './pages/Recruiter/CandidateDetails'

// Public Pages
import Home from './pages/Public/Home'
import About from './pages/Public/About'
import NotFound from './pages/NotFound'

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute'

function AppContent() {
  const { initializeAuth, user, isLoading } = useAuth()
  const { isDarkMode } = useUIStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Candidate Routes */}
      <Route path="/candidate" element={
        <ProtectedRoute requiredRole="candidate">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="resume-upload" element={<ResumeUpload />} />
        <Route path="quiz-dashboard" element={<QuizDashboard />} />
        <Route path="quiz" element={<QuizInterface />} />
        <Route path="quiz/attempt" element={<QuizInterface />} />
        <Route path="quiz-results" element={<QuizResults />} />
        <Route path="jobs" element={<JobListings />} />
        <Route path="jobs/:id" element={<JobListings />} />
      </Route>

      {/* Recruiter Routes */}
      <Route path="/recruiter" element={
        <ProtectedRoute requiredRole="recruiter">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="job-posting" element={<JobPosting />} />
        <Route path="job-management" element={<RecruiterDashboard />} />
        <Route path="job-management/:id" element={<RecruiterDashboard />} />
        <Route path="candidates" element={<CandidateList />} />
        <Route path="candidates/:id" element={<CandidateDetails />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <AppContent />
      </QuizProvider>
    </AuthProvider>
  )
}

export default App
