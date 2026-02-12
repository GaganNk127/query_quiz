import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary w-full py-3 text-base inline-flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Back Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline w-full py-3 text-base inline-flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Looking for something specific?
          </h3>
          <div className="space-y-2 text-sm">
            <Link
              to="/candidate/dashboard"
              className="block text-primary hover:underline"
            >
              Candidate Dashboard →
            </Link>
            <Link
              to="/recruiter/dashboard"
              className="block text-primary hover:underline"
            >
              Recruiter Dashboard →
            </Link>
            <Link
              to="/auth/login"
              className="block text-primary hover:underline"
            >
              Sign In →
            </Link>
            <Link
              to="/auth/register"
              className="block text-primary hover:underline"
            >
              Create Account →
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
