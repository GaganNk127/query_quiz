import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Video,
  VideoOff,
  Eye,
  EyeOff
} from 'lucide-react'
import { useQuiz } from '../../contexts/QuizContext'
import { useQuizStore } from '../../store/authStore'
import { useProctoringStore } from '../../store/proctoringStore'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'

export default function QuizInterface() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    quizQuestions,
    currentQuestion,
    answers,
    timeRemaining,
    isQuizActive,
    startQuiz,
    nextQuestion,
    completeQuiz,
    resetQuiz,
    submitAnswer,
    isSubmitting
  } = useQuiz()

  const {
    isProctoringActive,
    proctoringWarnings,
    startProctoring,
    stopProctoring,
    logProctoringEvent,
    setVideoElement,
    violationCount,
    shouldAutoSubmit
  } = useProctoringStore()

  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showCamera, setShowCamera] = useState(true)
  const [cameraPermission, setCameraPermission] = useState(false)
  const [quizData, setQuizData] = useState(null)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  // Watch for proctoring violations
  useEffect(() => {
    if (isQuizActive && shouldAutoSubmit(violationCount)) {
      handleAutoSubmit()
    }
  }, [violationCount, isQuizActive])

  // Get quiz data from navigation state or fetch it
  useEffect(() => {
    if (location.state?.quiz) {
      setQuizData(location.state.quiz)
      setQuizStarted(true)
    } else {
      // If no quiz data, redirect to quiz dashboard
      navigate('/candidate/quiz-dashboard')
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (quizStarted && !isQuizActive && quizData) {
      initializeQuiz()
    }
  }, [quizStarted, quizData, isQuizActive])

  useEffect(() => {
    if (isQuizActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        useQuizStore.getState().updateTimer()
      }, 1000)
    } else if (timeRemaining === 0 && isQuizActive) {
      handleTimeUp()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isQuizActive])

  useEffect(() => {
    if (showCamera && cameraPermission) {
      startCamera()
    } else {
      stopCamera()
    }
  }, [showCamera, cameraPermission])

  const initializeQuiz = async () => {
    try {
      setLoading(true)

      // Use quiz data from navigation state
      if (quizData && quizData.questions) {
        const questions = quizData.questions
        const timeLimit = quizData.timeLimit || questions.length * 60 // 1 minute per question default

        startQuiz(questions, timeLimit)
        
        // 🔥 SYNC: Ensure quizStore has the quizId for proctoring
        useQuizStore.getState().startQuiz(questions, quizData.id)

        setQuestionStartTime(Date.now())

        // Start proctoring
        await startProctoring()

        toast.success('Quiz started successfully!')
      } else {
        throw new Error('No quiz questions available')
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to initialize quiz:', error)
      toast.error('Failed to initialize quiz')
      navigate('/candidate/quiz-dashboard')
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true // Relaxed constraints
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraPermission(true)
        setVideoElement(videoRef.current)
        console.log("Camera started successfully")
      }
    } catch (error) {
      console.error('Camera access error:', error.name, error.message)
      setCameraPermission(false)

      if (error.name === 'NotAllowedError') {
        toast.error('Please allow camera access in your browser settings')
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found')
      } else {
        toast.error('Failed to access camera: ' + error.message)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
      setVideoElement(null)
    }
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null) return

    setLoading(true)

    try {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

      // Save answer to store
      const answerData = {
        questionId: quizQuestions[currentQuestion].id,
        selectedAnswer: selectedAnswer,
        timeSpent: timeSpent
      }

      // Submit answer using quiz context
      await submitAnswer(answerData.questionId, answerData.selectedAnswer)

      // Move to next question or complete quiz
      if (currentQuestion < quizQuestions.length - 1) {
        setSelectedAnswer(null)
        nextQuestion()
        setQuestionStartTime(Date.now())

        toast.success('Answer submitted!')
      } else {
        // Complete quiz with all answers
        const finalAnswers = [...answers, answerData]

        // Calculate score
        let correctCount = 0
        finalAnswers.forEach(answer => {
          const question = quizQuestions.find(q => q.id === answer.questionId)
          if (question && answer.selectedAnswer === question.correct) {
            correctCount++
          }
        })

        const score = Math.round((correctCount / quizQuestions.length) * 100)

        // Submit quiz completion
        try {
          const response = await axios.post('/api/quiz/complete', {
            quizId: location.state?.quizId,
            answers: finalAnswers,
            score: score,
            totalTime: Math.floor((Date.now() - questionStartTime) / 1000)
          })

          await completeQuiz(score, finalAnswers)
          stopProctoring()
          stopCamera()

          toast.success(`Quiz completed! Score: ${score}%`)
          navigate('/candidate/quiz-results', {
            state: {
              score,
              answers: finalAnswers,
              totalQuestions: quizQuestions.length
            }
          })
        } catch (submitError) {
          console.error('Error submitting quiz:', submitError)
          // Still complete quiz locally even if backend fails
          await completeQuiz(score, finalAnswers)
          stopProctoring()
          stopCamera()

          navigate('/candidate/quiz-results', {
            state: {
              score,
              answers: finalAnswers,
              totalQuestions: quizQuestions.length
            }
          })
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }

  const handleTimeUp = async () => {
    try {
      // Calculate final score with current answers
      let correctCount = 0
      answers.forEach(answer => {
        const question = quizQuestions.find(q => q.id === answer.questionId)
        if (question && answer.selectedAnswer === question.correct) {
          correctCount++
        }
      })

      const score = Math.round((correctCount / quizQuestions.length) * 100)

      await completeQuiz(score, answers)
      stopProctoring()
      stopCamera()

      toast.error(`Time is up! Quiz submitted automatically. Score: ${score}%`)

      navigate('/candidate/quiz-results', {
        state: {
          score,
          answers,
          totalQuestions: quizQuestions.length
        }
      })
    } catch (error) {
      console.error('Error completing quiz:', error)
    }
  }

  const handleAutoSubmit = async () => {
    try {
      // Calculate final score with current answers
      let correctCount = 0
      answers.forEach(answer => {
        const question = quizQuestions.find(q => q.id === answer.questionId)
        if (question && answer.selectedAnswer === question.correct) {
          correctCount++
        }
      })

      const score = Math.round((correctCount / quizQuestions.length) * 100)

      // Submit to backend as well
      await axios.post('/api/quiz/complete', {
        quizId: quizData?.id,
        answers: answers,
        score: score,
        status: 'auto_submitted_cheating'
      }).catch(err => console.error('Auto-submit backend error:', err))

      await completeQuiz(score, answers)
      stopProctoring()
      stopCamera()

      toast.error('Quiz has been auto-submitted due to multiple proctoring violations.')

      navigate('/candidate/quiz-results', {
        state: {
          score,
          answers,
          totalQuestions: quizQuestions.length,
          autoSubmitted: true
        }
      })
    } catch (error) {
      console.error('Error in auto-submission:', error)
    }
  }

  const handleStartQuiz = async () => {
    setQuizStarted(true)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600 timer-warning'
    if (timeRemaining <= 300) return 'text-yellow-600'
    return 'text-gray-700'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      case 'analytical': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Assessment Quiz
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Test your skills and knowledge with our comprehensive assessment
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">
                Quiz Instructions
              </h3>
              <ul className="text-left space-y-2 text-sm text-blue-800">
                <li>• The quiz consists of 10 questions with varying difficulty levels</li>
                <li>• You will have approximately 10-15 minutes to complete the quiz</li>
                <li>• Each question can only be answered once</li>
                <li>• Camera and microphone access is required for proctoring</li>
                <li>• Make sure you're in a quiet, well-lit environment</li>
                <li>• Do not switch tabs or minimize the window during the quiz</li>
                <li>• Your face must be visible throughout the assessment</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleStartQuiz}
                className="btn-primary btn-lg w-full"
              >
                Start Quiz
              </button>

              <button
                onClick={() => window.history.back()}
                className="btn-outline btn-lg w-full"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && !isQuizActive) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="loading-spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Initializing quiz...
          </p>
        </div>
      </div>
    )
  }

  if (!isQuizActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quiz Completed
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for completing the assessment!
            </p>
            <button
              onClick={() => window.location.href = '/candidate/quiz-results'}
              className="btn-primary"
            >
              View Results
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quizQuestions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                Question
              </span>
              <span className="text-lg font-bold text-gray-900">
                {currentQuestion + 1}/{quizQuestions.length}
              </span>
            </div>

            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQ.difficulty)}`}>
              {currentQ.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Proctoring Status */}
            <div className="flex items-center space-x-2">
              {isProctoringActive ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Proctoring Active</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <VideoOff className="h-4 w-4" />
                  <span className="text-sm">Proctoring Inactive</span>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className={`flex items-center space-x-2 ${getTimerColor()}`}>
              <Clock className="h-5 w-5" />
              <span className="text-lg font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Quiz Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQ.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === index
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === index
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                      }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-900">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null || loading}
              className="btn-primary btn-lg w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-5 w-5 mr-2"></div>
                  Submitting...
                </div>
              ) : currentQuestion === quizQuestions.length - 1 ? (
                'Submit Final Answer'
              ) : (
                'Submit Answer & Continue'
              )}
            </button>
          </div>
        </div>

        {/* Proctoring Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Proctoring
              </h3>
              <button
                onClick={() => setShowCamera(!showCamera)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showCamera ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Camera Feed */}
            {showCamera && (
              <div className="relative mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg bg-gray-900"
                />
                {!cameraPermission && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                    <div className="text-center">
                      <VideoOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-3">
                        Camera access required
                      </p>
                      <button
                        onClick={startCamera}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        Retry Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Proctoring Warnings */}
            {proctoringWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Warnings
                </h4>
                {proctoringWarnings.slice(-3).map((warning, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Proctoring Guidelines */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                Guidelines
              </h4>
              <ul className="text-xs space-y-1 text-yellow-700">
                <li>• Keep your face visible at all times</li>
                <li>• Do not switch tabs or windows</li>
                <li>• No other persons should be visible</li>
                <li>• Maintain eye contact with screen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
