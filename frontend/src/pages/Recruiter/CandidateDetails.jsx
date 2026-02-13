import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Download,
  Calendar,
  Award,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Star,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react'
import { useEmailService } from '../../services/emailService'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function CandidateDetails() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailType, setEmailType] = useState('shortlist')
  const [customMessage, setCustomMessage] = useState('')

  const { sendShortlistEmail, sendRejectionEmail, sendCustomEmail } = useEmailService()

  useEffect(() => {
    fetchCandidateDetails()
  }, [id])

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/candidates/${id}`)
      setCandidate(response.data.candidate)
    } catch (error) {
      console.error('Error fetching candidate details:', error)
      toast.error('Failed to load candidate details')
    } finally {
      setLoading(false)
    }
  }

  const handleShortlist = async () => {
    try {
      await axios.post(`/api/candidates/${id}/shortlist`)

      // Update local state
      setCandidate(prev => ({ ...prev, shortlisted: true }))

      // Send email notification
      await sendShortlistEmail(
        candidate.user.email,
        candidate.user.name,
        'Applied Position',
        'Your Company'
      )

      toast.success('Candidate shortlisted successfully!')
    } catch (error) {
      console.error('Error shortlisting candidate:', error)
      toast.error('Failed to shortlist candidate')
    }
  }

  const handleSendEmail = async () => {
    try {
      let emailFunction
      let emailArgs = [
        candidate.user.email,
        candidate.user.name,
        'Applied Position',
        'Your Company'
      ]

      switch (emailType) {
        case 'shortlist':
          emailFunction = sendShortlistEmail
          break
        case 'rejection':
          emailFunction = sendRejectionEmail
          break
        case 'custom':
          emailFunction = sendCustomEmail
          emailArgs = [
            candidate.user.email,
            `Message from Recruiter regarding your application`,
            customMessage
          ]
          break
        default:
          return
      }

      await emailFunction(...emailArgs)
      setEmailModalOpen(false)
      setCustomMessage('')
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const downloadResume = async () => {
    try {
      const response = await axios.get(`/api/candidates/${id}/resume`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `resume_${candidate.user.name.replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast.error('Failed to download resume')
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Candidate Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The candidate you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/recruiter/candidates"
          className="btn btn-primary"
        >
          Back to Candidates
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {candidate.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {candidate.user?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {candidate.user?.email}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                {candidate.shortlisted && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Shortlisted
                  </span>
                )}
                <span className="text-gray-500 dark:text-gray-400">
                  Applied {formatDate(candidate.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={downloadResume}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Resume</span>
            </button>

            <button
              onClick={() => {
                setEmailType('shortlist')
                setEmailModalOpen(true)
              }}
              disabled={candidate.shortlisted}
              className="btn btn-primary disabled:opacity-50"
            >
              {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>

            <button
              onClick={() => {
                setEmailType('custom')
                setEmailModalOpen(true)
              }}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ATS Score
            </h3>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className={`text-center p-6 rounded-lg ${getScoreBgColor(candidate.atsScore)}`}>
            <div className={`text-4xl font-bold ${getScoreColor(candidate.atsScore)}`}>
              {candidate.atsScore}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Resume matching score
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quiz Score
            </h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          {candidate.quizScore > 0 ? (
            <div className={`text-center p-6 rounded-lg ${getScoreBgColor(candidate.quizScore)}`}>
              <div className={`text-4xl font-bold ${getScoreColor(candidate.quizScore)}`}>
                {candidate.quizScore}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                Assessment performance
              </p>
            </div>
          ) : (
            <div className="text-center p-6 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
                Not Taken
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Quiz not completed yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {['overview', 'resume', 'quiz', 'proctoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {candidate.user?.email}
                    </span>
                  </div>
                  {candidate.user?.profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {candidate.user.profile.phone}
                      </span>
                    </div>
                  )}
                  {candidate.user?.profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {candidate.user.profile.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Professional Information
                </h3>
                <div className="space-y-4">
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {candidate.experience && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Experience Level
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {candidate.experience}
                      </p>
                    </div>
                  )}

                  {candidate.user?.profile?.bio && (
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {candidate.user.profile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {candidate.education && candidate.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Education
                  </h3>
                  <div className="space-y-3">
                    {candidate.education.map((edu, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {edu.degree}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution} • {edu.year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Resume Analysis
              </h3>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Extracted Text Preview
                </h4>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {candidate.resumeText?.substring(0, 2000)}
                    {candidate.resumeText?.length > 2000 && '...'}
                  </pre>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={downloadResume}
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Resume</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quiz Results
              </h3>

              {candidate.quizAnswers && candidate.quizAnswers.length > 0 ? (
                <div className="space-y-4">
                  {candidate.quizAnswers.map((answer, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Question {index + 1}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${answer.isCorrect
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {answer.question}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>Your answer: {answer.selectedAnswer}</p>
                        {!answer.isCorrect && (
                          <p>Correct answer: {answer.correctAnswer}</p>
                        )}
                        <p>Time taken: {answer.timeSpent}s</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Quiz not completed yet
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'proctoring' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Proctoring Report
              </h3>

              {candidate.proctoringLog && candidate.proctoringLog.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Violations Summary
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(candidate.proctoringStats?.violations || {}).map(([type, count]) => (
                          <div key={type} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {type.replace('_', ' ')}
                            </span>
                            <span className={`font-medium ${count > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Compliance Score
                      </h4>
                      <div className={`text-center p-4 rounded-lg ${getScoreBgColor(candidate.proctoringStats?.complianceScore || 100)}`}>
                        <div className={`text-2xl font-bold ${getScoreColor(candidate.proctoringStats?.complianceScore || 100)}`}>
                          {candidate.proctoringStats?.complianceScore || 100}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Proctoring Events
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {candidate.proctoringLog.map((event, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="flex items-center space-x-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {event.type.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No proctoring data available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Send Email to {candidate.user?.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Type
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="input"
                >
                  <option value="shortlist">Shortlist Notification</option>
                  <option value="rejection">Rejection Notice</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              {emailType === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="textarea"
                    placeholder="Enter your custom message..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEmailModalOpen(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="btn btn-primary"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
