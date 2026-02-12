import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  TrendingUp,
  AlertTriangle,
  Download,
  Share,
  BarChart3
} from 'lucide-react'
import { useQuizStore } from '../../store/authStore'
import { useProctoringStore } from '../../store/proctoringStore'
import axios from 'axios'

export default function QuizResults() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [proctoringStats, setProctoringStats] = useState(null)
  
  // Get the proctoring store state and functions
  const violationCount = useProctoringStore(state => state.violationCount)
  const proctoringWarnings = useProctoringStore(state => state.proctoringWarnings)
  const getProctoringStats = useProctoringStore(state => state.getProctoringStats)

  useEffect(() => {
    fetchQuizResults()
  }, [])

  const fetchQuizResults = async () => {
    try {
      setLoading(true)
      
      // Fetch quiz results from backend
      const response = await axios.get('/api/quiz/results')
      const quizData = response.data
      
      // Get proctoring statistics
      const proctoringData = getProctoringStats()
      
      setResults(quizData)
      setProctoringStats(proctoringData)
    } catch (error) {
      console.error('Error fetching quiz results:', error)
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

  const getPerformanceMessage = (score) => {
    if (score >= 90) return 'Outstanding performance! You\'re among the top candidates.'
    if (score >= 80) return 'Excellent work! Your skills are highly valued.'
    if (score >= 70) return 'Good job! You have solid foundational knowledge.'
    if (score >= 60) return 'Nice effort! Consider reviewing some topics.'
    return 'Keep practicing! Review the material and try again.'
  }

  const downloadResults = () => {
    // Create a printable version of results
    const printContent = document.getElementById('quiz-results-content')
    const printWindow = window.open('', '_blank')
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Quiz Results - SmartRecruit AI</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score { font-size: 48px; font-weight: bold; color: #3b82f6; }
            .section { margin: 20px 0; }
            .question { margin: 15px 0; padding: 10px; border: 1px solid #e5e7eb; }
            .correct { color: #10b981; }
            .incorrect { color: #ef4444; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
  }

  const shareResults = async () => {
    const shareData = {
      title: 'My Quiz Results - SmartRecruit AI',
      text: `I scored ${results.score}% on my assessment quiz!`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        alert('Results copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing results:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Quiz Results Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't completed any quizzes yet.
          </p>
          <Link
            to="/candidate/quiz"
            className="btn btn-primary"
          >
            Take Quiz
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Quiz Results
          </h1>
          
          <div className={`inline-block px-6 py-3 rounded-full ${getScoreBgColor(results.score)} mb-4`}>
            <div className={`text-5xl font-bold ${getScoreColor(results.score)}`}>
              {results.score}%
            </div>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {getPerformanceMessage(results.score)}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={downloadResults}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            
            <button
              onClick={shareResults}
              className="btn btn-outline flex items-center space-x-2"
            >
              <Share className="h-4 w-4" />
              <span>Share Results</span>
            </button>
            
            <Link
              to="/candidate/dashboard"
              className="btn btn-primary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {results.correctAnswers}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Correct Answers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Out of {results.totalQuestions} questions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.floor(results.totalTime / 60)}:{(results.totalTime % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Time Taken
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average: {Math.floor(results.averageTimePerQuestion)}s per question
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {results.difficultyStats?.hard || 0}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Hard Questions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Completed successfully
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {proctoringStats?.complianceScore || 100}%
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Proctoring Score
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {proctoringStats?.totalViolations || 0} violations detected
          </p>
        </div>
      </div>

      {/* Detailed Results */}
      <div id="quiz-results-content" className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Detailed Results
        </h2>

        <div className="space-y-4">
          {results.answers?.map((answer, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Question {index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      answer.isCorrect 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {answer.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded text-xs">
                      {answer.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 dark:text-white mb-2">
                    {answer.question}
                  </p>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 dark:text-gray-400">Your answer:</span>
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {answer.selectedAnswer}
                      </span>
                    </div>
                    
                    {!answer.isCorrect && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 dark:text-gray-400">Correct answer:</span>
                        <span className="text-green-600">
                          {answer.correctAnswer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Time: {answer.timeSpent}s</span>
                <span>Points: {answer.points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proctoring Report */}
      {proctoringStats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Proctoring Report
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Compliance Score
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        proctoringStats.complianceScore >= 90 ? 'bg-green-500' :
                        proctoringStats.complianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${proctoringStats.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
                <span className={`font-bold ${
                  proctoringStats.complianceScore >= 90 ? 'text-green-600' :
                  proctoringStats.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {proctoringStats.complianceScore}%
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Violations Detected
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(proctoringStats.violations).map(([type, count]) => (
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
          </div>

          {proctoringStats.totalViolations > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Proctoring Violations Detected
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {proctoringStats.totalViolations} violation(s) were detected during your quiz. 
                    This may affect your assessment evaluation. Please ensure a quiet, distraction-free environment for future assessments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Next Steps
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Your results have been shared with recruiters
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Update your profile with additional skills and experience
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200">
              Browse job opportunities that match your profile
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/candidate/profile"
            className="btn btn-primary"
          >
            Update Profile
          </Link>
          <Link
            to="/candidate/jobs"
            className="btn btn-outline"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
