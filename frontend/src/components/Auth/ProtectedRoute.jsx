import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, isLoading, hasRole } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="loading-spinner h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    const userRole = user?.role
    if (userRole === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />
    } else if (userRole === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />
    } else {
      return <Navigate to="/auth/login" replace />
    }
  }

  return children
}
