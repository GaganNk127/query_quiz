import { useState, useEffect } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Bell,
  Calendar,
  Target,
  BookOpen,
  Award
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function QuizDashboard() {
  const [quizzes, setQuizzes] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuizzes()
    fetchNotifications()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz/my-quizzes')
      setQuizzes(response.data.quizzes || [])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz/notifications')
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleStartQuiz = async (quizId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/quiz/${quizId}/start`)
      
      // Navigate to quiz interface with questions
      navigate('/candidate/quiz/attempt', {
        state: {
          quiz: response.data.quiz,
          quizId: quizId
        }
      })
      
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error(error.response?.data?.message || 'Failed to start quiz')
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`http://localhost:5000/api/quiz/notifications/${notificationId}/read`)
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeRemaining = (expiresAt) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry - now
    
    if (diff <= 0) return 'Expired'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`
    return 'Less than 1 hour remaining'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'in_progress':
        return <Play className="w-5 h-5 text-blue-500" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Dashboard</h1>
          <p className="text-gray-600">View and attempt your assigned quizzes</p>
        </div>
        
        {/* Notifications Bell */}
        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border p-4 ${
                  notification.read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      notification.type === 'quiz_assigned' ? 'bg-blue-100' :
                      notification.type === 'quiz_completed' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      {notification.type === 'quiz_assigned' && <BookOpen className="w-4 h-4 text-blue-600" />}
                      {notification.type === 'quiz_completed' && <Award className="w-4 h-4 text-green-600" />}
                      {notification.type === 'quiz_reminder' && <Clock className="w-4 h-4 text-yellow-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quizzes Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Assigned Quizzes
        </h2>

        {quizzes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quizzes Assigned</h3>
            <p>You haven't been assigned any quizzes yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  {getStatusIcon(quiz.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                    {quiz.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {quiz.jobTitle}
                </h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    {quiz.totalQuestions} Questions
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {quiz.timeLimit} minutes
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {getTimeRemaining(quiz.expiresAt)}
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Assigned by {quiz.assignedBy}
                  </div>
                </div>

                {quiz.status === 'assigned' && (
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Quiz
                  </button>
                )}

                {quiz.status === 'in_progress' && (
                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    className="w-full btn btn-secondary flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue Quiz
                  </button>
                )}

                {quiz.status === 'completed' && (
                  <button
                    disabled
                    className="w-full btn bg-gray-100 text-gray-600 cursor-not-allowed flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Quiz Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Complete the quiz within the time limit</li>
              <li>• Quiz questions are based on the job requirements</li>
              <li>• You can attempt the quiz only once</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• Quiz expires in 7 days if not attempted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
