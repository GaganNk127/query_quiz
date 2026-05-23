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

  const latestAttempt = candidate?.quizAttempts?.filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

  // Calculate proctoring summary
  const proctoringStats = (() => {
    if (!candidate?.proctoringLog) return { violations: {}, complianceScore: 100 };
    
    const logs = candidate.proctoringLog;
    const violations = {};
    logs.forEach(log => {
      violations[log.type] = (violations[log.type] || 0) + 1;
    });

    // Simple compliance score calculation
    const totalViolations = Object.values(violations).reduce((a, b) => a + b, 0);
    const score = Math.max(0, 100 - (totalViolations * 5));
    
    return { violations, complianceScore: score };
  })();

  // Group proctoring logs by quizId
  const logsByQuiz = (() => {
    if (!candidate?.proctoringLog) return {};
    const grouped = {};
    candidate.proctoringLog.forEach(log => {
      if (!grouped[log.quizId]) grouped[log.quizId] = [];
      grouped[log.quizId].push(log);
    });
    return grouped;
  })();

  const latestCheatingQuizId = candidate?.cheatedQuizzes?.length > 0 
    ? candidate.cheatedQuizzes[candidate.cheatedQuizzes.length - 1].quizId 
    : null;

  const detailedQuizResults = latestAttempt?.answers?.map(ans => {
    // Find the question in assignments
    let questionText = 'Question details not available';
    let options = [];
    let correctAnswerText = 'Unknown';
    let selectedAnswerText = 'Not answered';

    candidate.quizAssignments?.forEach(assign => {
      const q = assign.questions?.find(q => String(q.id) === String(ans.questionId));
      if (q) {
        questionText = q.question;
        options = q.options;
        correctAnswerText = q.options[q.correct] || 'Unknown';
        selectedAnswerText = q.options[ans.answer !== undefined ? ans.answer : ans.selectedAnswer] || 'Not answered';
      }
    });

    return {
      ...ans,
      question: questionText,
      options,
      correctAnswer: correctAnswerText,
      selectedAnswer: selectedAnswerText
    };
  });

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
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {candidate.user?.email}
              </p>
              {candidate.appliedJobs && candidate.appliedJobs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {candidate.appliedJobs.map((app, idx) => (
                    <span key={idx} className="inline-flex items-center text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {app.job?.title || 'Unknown Job'}
                    </span>
                  ))}
                </div>
              )}
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
          {latestAttempt ? (
            <div className={`text-center p-6 rounded-lg ${getScoreBgColor(candidate.quizScore || latestAttempt.score)}`}>
              <div className={`text-4xl font-bold ${getScoreColor(candidate.quizScore || latestAttempt.score)}`}>
                {candidate.quizScore || latestAttempt.score}%
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

              {detailedQuizResults && detailedQuizResults.length > 0 ? (
                <div className="space-y-4">
                  {detailedQuizResults.map((answer, index) => (
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
                        <p className="font-medium">Selected: <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>{answer.selectedAnswer}</span></p>
                        {!answer.isCorrect && (
                          <p>Correct: <span className="text-green-600 font-medium">{answer.correctAnswer}</span></p>
                        )}
                        <p className="mt-1 opacity-70 italic text-xs">Time taken: {answer.timeSpent}s</p>
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proctoring Report
                </h3>
                {candidate.cheatingStatus === 'rejected_cheating' && (
                  <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold animate-pulse">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    REJECTED FOR CHEATING
                  </span>
                )}
              </div>

              {candidate.proctoringLog && candidate.proctoringLog.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Total Violations Summary
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(proctoringStats.violations)
                          .filter(([type]) => type !== 'no_face' && type !== 'head_turned')
                          .map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {type.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${count > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border text-center flex flex-col justify-center">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Overall Compliance
                      </h4>
                      <div className={`text-4xl font-bold ${getScoreColor(proctoringStats.complianceScore)}`}>
                        {proctoringStats.complianceScore}%
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Based on violation frequency</p>
                    </div>
                  </div>

                  {/* Latest Cheating Incident Highlight */}
                  {latestCheatingQuizId && (
                    <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg p-5">
                      <div className="flex items-center space-x-2 mb-4 text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="font-bold text-lg">Latest Cheating Incident Reported</h4>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-900 rounded-md border p-3">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              Quiz ID: <span className="font-mono text-xs">{latestCheatingQuizId}</span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Detected at: {formatDate(candidate.cheatedQuizzes.find(q => q.quizId === latestCheatingQuizId)?.cheatedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 mt-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Specific Violations for this Quiz:</p>
                          {(logsByQuiz[latestCheatingQuizId] || [])
                            .filter(event => event.type !== 'no_face' && event.type !== 'head_turned')
                            .map((event, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors border-l-4 border-red-500">
                              <span className="text-sm font-medium capitalize text-red-700 dark:text-red-400">
                                {event.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Events History */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Event History (All Quizzes)
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {Object.keys(logsByQuiz).reverse().map(quizId => (
                        <div key={quizId} className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quiz: {quizId}</p>
                          <div className="space-y-1">
                            {logsByQuiz[quizId]
                              .filter(event => event.type !== 'no_face' && event.type !== 'head_turned')
                              .map((event, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border rounded shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3">
                                  <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                                      {event.type.replace(/_/g, ' ')}
                                    </span>
                                    {event.duration > 0 && (
                                      <p className="text-[10px] text-gray-500">Duration: {event.duration}s</p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {new Date(event.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No proctoring data available for this candidate
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Compliance monitoring starts when the candidate begins a quiz
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
