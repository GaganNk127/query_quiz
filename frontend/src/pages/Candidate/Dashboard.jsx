import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  TrendingUp,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  BookOpen,
  Bell,
  MessageCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    atsScore: 0,
    quizScore: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    messages: 0,
    notifications: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchDashboardData()
    }
  }, [user?.id, user?._id])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/candidate/dashboard')
      const data = response.data.data || response.data

      setStats(data.stats || {})
      setRecentApplications(data.recentApplications || [])
      setRecommendedJobs(data.recommendedJobs || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Unable to load your dashboard right now.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900'
    return 'bg-red-100 dark:bg-red-900'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-white/90">
          Here's an overview of your recruitment journey
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(stats.atsScore)}`}>
              {stats.atsScore}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            ATS Score
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Resume matching score
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(stats.quizScore)}`}>
              {stats.quizScore}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Quiz Score
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assessment performance
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.applicationsCount}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Applications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jobs applied to
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.shortlisted}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Shortlisted
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selected by recruiters
          </p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.interviews}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Interviews
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            In-progress review stages
          </p>
        </div>
      </div>

      {/* Messages & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Messages</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.messages}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">From recruiters</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-blue-600" />
          </div>
        </div>
        <div className="card p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Notifications</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.notifications}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending updates</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
            <Bell className="h-7 w-7 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resume Status
            </h3>
            <FileText className="h-6 w-6 text-gray-400" />
          </div>

          <div className={`p-4 rounded-lg ${getScoreBgColor(stats.atsScore)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                ATS Analysis Score
              </span>
              <span className={`font-bold ${getScoreColor(stats.atsScore)}`}>
                {stats.atsScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stats.atsScore >= 80 ? 'bg-green-500' :
                  stats.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${stats.atsScore}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {stats.atsScore === 0 && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Upload your resume to get ATS analysis</span>
              </div>
            )}
            {stats.atsScore > 0 && stats.atsScore < 60 && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Consider improving your resume for better matching</span>
              </div>
            )}
            {stats.atsScore >= 60 && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Your resume is well-optimized for ATS systems</span>
              </div>
            )}
          </div>

          <Link
            to="/candidate/resume-upload"
            className="btn btn-primary w-full mt-4"
          >
            {stats.atsScore === 0 ? 'Upload Resume' : 'Update Resume'}
          </Link>
        </div>

        {/* Quiz Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Assessment Quiz
            </h3>
            <BookOpen className="h-6 w-6 text-gray-400" />
          </div>


          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ready to take the quiz?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete the assessment quiz to showcase your skills to recruiters
            </p>
            <Link
              to="/candidate/quiz"
              className="btn btn-primary"
            >
              Start Quiz
            </Link>
          </div>

          <div className={`p-4 rounded-lg ${getScoreBgColor(stats.quizScore)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                Previous Quiz Completed
              </span>
              <span className={`font-bold ${getScoreColor(stats.quizScore)}`}>
                {stats.quizScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stats.quizScore >= 80 ? 'bg-green-500' :
                  stats.quizScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${stats.quizScore}%` }}
              ></div>
            </div>
          </div>


          {stats.quizScore > 0 && (
            <Link
              to="/candidate/quiz-results"
              className="btn btn-outline w-full mt-4"
            >
              View Detailed Results
            </Link>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Applications
          </h3>
          <Link
            to="/candidate/jobs"
            className="text-primary hover:underline text-sm font-medium"
          >
            View All →
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="space-y-4">
            {recentApplications.map((application, index) => (
              <div key={application._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {application.job?.title || 'Job Title'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {application.job?.company || 'Company'} • {application.job?.location || 'Remote'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>{application.job?.type || 'Full-time'}</span>
                      <span>•</span>
                      <span>{application.job?.experience || 'Mid Level'}</span>
                      <span>•</span>
                      <span className="capitalize">{application.status || 'pending'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/candidate/jobs/${application.job?._id || ''}`}
                    className="btn btn-outline text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No applications yet. Start applying to jobs!
            </p>
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recommended Jobs
          </h3>
          <Link
            to="/candidate/jobs"
            className="text-primary hover:underline text-sm font-medium"
          >
            Browse All →
          </Link>
        </div>

        {recommendedJobs.length > 0 ? (
          <div className="space-y-4">
            {recommendedJobs.map((job) => (
              <div key={job._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {job.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {job.company || 'Company'} • {job.location}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {job.type} • {job.experience}
                    </p>
                  </div>
                  <Link
                    to={`/candidate/jobs/${job._id}`}
                    className="btn btn-outline text-sm"
                  >
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Jobs you might like will appear here.
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 Pro Tips for Success
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Keep your resume updated with relevant skills and experience</li>
          <li>• Aim for an ATS score of 70% or higher for better visibility</li>
          <li>• Complete the quiz assessment to stand out to recruiters</li>
          <li>• Apply to jobs that match your skills and experience level</li>
        </ul>
      </div>
    </div>
  )
}
