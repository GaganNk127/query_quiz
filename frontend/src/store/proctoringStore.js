import { create } from 'zustand'
import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { useQuizStore } from './authStore.js'

const PROCTORING_ENABLED = import.meta.env.VITE_ENABLE_PROCTORING === 'true'

const ensureTFBackend = async () => {
  await tf.ready()

  try {
    if (tf.getBackend() !== 'webgl') {
      await tf.setBackend('webgl')
      await tf.ready()
    }
    return 'webgl'
  } catch (error) {
    console.warn('WebGL backend unavailable, falling back to CPU:', error)
    await tf.setBackend('cpu')
    await tf.ready()
    return 'cpu'
  }
}

export const useProctoringStore = create((set, get) => ({
  // State
  isProctoringActive: false,
  model: null,
  objectModel: null,
  video: null,
  proctoringWarnings: [],
  violationCount: {
    no_face: 0,
    multiple_faces: 0,
    head_turned: 0,
    tab_switch: 0,
    window_minimize: 0,
    prohibited_object: 0
  },
  lastFaceDetection: null,
  isMonitoring: false,

  // Actions
  startProctoring: async () => {
    if (!PROCTORING_ENABLED) {
      console.warn('Proctoring is disabled via configuration.')
      return { success: true, disabled: true }
    }

    try {
      // Ensure TensorFlow backend is initialized
      await ensureTFBackend()

      // Load BlazeFace model
      const model = await blazeface.load()

      // Load COCO-SSD model
      const objectModel = await cocoSsd.load()

      // Set up visibility change detection
      document.addEventListener('visibilitychange', get().handleVisibilityChange)

      // Set up window focus/blur detection
      window.addEventListener('blur', get().handleWindowBlur)
      window.addEventListener('focus', get().handleWindowFocus)

      // Set up beforeunload for tab switching
      window.addEventListener('beforeunload', get().handleBeforeUnload)

      set({
        isProctoringActive: true,
        model,
        objectModel,
        isMonitoring: true
      })

      // Start face detection monitoring
      get().startFaceMonitoring()

      return { success: true }
    } catch (error) {
      console.error('Failed to start proctoring:', error)
      return { success: false, error: error.message }
    }
  },

  stopProctoring: () => {
    if (!PROCTORING_ENABLED) {
      return
    }

    const { isMonitoring } = get()

    if (isMonitoring) {
      // Remove event listeners
      document.removeEventListener('visibilitychange', get().handleVisibilityChange)
      window.removeEventListener('blur', get().handleWindowBlur)
      window.removeEventListener('focus', get().handleWindowFocus)
      window.removeEventListener('beforeunload', get().handleBeforeUnload)

      // Stop face monitoring
      get().stopFaceMonitoring()
    }

    set({
      isProctoringActive: false,
      isMonitoring: false,
      model: null,
      video: null
    })
  },

  setVideoElement: (videoElement) => {
    set({ video: videoElement })
  },

  startFaceMonitoring: async () => {
    const { model, video, detectFaces } = get()

    if (!model || !video) return

    const monitor = async () => {
      const { isMonitoring } = get()
      if (!isMonitoring) return

      await get().detectFaces()
      await get().detectObjects()

      // Schedule next detection
      setTimeout(monitor, 1000) // Check every second
    }

    monitor()
  },

  stopFaceMonitoring: () => {
    set({ isMonitoring: false })
  },

  detectFaces: async () => {
    const { model, video, lastFaceDetection, logViolation } = get()

    if (!model || !video || video.readyState !== 4) return

    try {
      const predictions = await model.estimateFaces(video, false)

      const currentTime = Date.now()
      const detection = {
        timestamp: currentTime,
        faceCount: predictions.length,
        predictions
      }

      set({ lastFaceDetection: detection })

      // Check for violations
      if (predictions.length === 0) {
        // No face detected
        if (!lastFaceDetection || lastFaceDetection.faceCount > 0) {
          logViolation('no_face', 'No face detected')
        }
      } else if (predictions.length > 1) {
        // Multiple faces detected
        logViolation('multiple_faces', 'Multiple faces detected')
      } else {
        // Single face detected - check if it's looking away
        const face = predictions[0]
        if (face.annotations) {
          const { leftEye, rightEye, nose } = face.annotations

          if (leftEye && rightEye && nose) {
            // Simple head pose estimation (can be enhanced)
            const eyeCenter = [
              (leftEye[0][0] + rightEye[0][0]) / 2,
              (leftEye[0][1] + rightEye[0][1]) / 2
            ]
            const nosePos = nose[0]

            // Check if head is turned (simplified)
            const headTurnThreshold = 50
            const headTurned = Math.abs(eyeCenter[0] - nosePos[0]) > headTurnThreshold

            if (headTurned) {
              logViolation('head_turned', 'Head turned away from screen')
            }
          }
        }
      }
    } catch (error) {
      console.error('Face detection error:', error)
    }
  },

  detectObjects: async () => {
    const { objectModel, video, logViolation } = get()

    if (!objectModel || !video || video.readyState !== 4) return

    try {
      const predictions = await objectModel.detect(video)

      // Check for prohibited items (e.g., cell phone)
      const prohibitedItems = ['cell phone', 'mobile phone']

      const violations = predictions.filter(pred =>
        prohibitedItems.includes(pred.class.toLowerCase()) && pred.score > 0.6
      )

      if (violations.length > 0) {
        logViolation('prohibited_object', `Prohibited object detected: ${violations[0].class}`)
      }
    } catch (error) {
      console.error('Object detection error:', error)
    }
  },

  logViolation: (type, message) => {
    if (!PROCTORING_ENABLED) {
      return
    }

    const { violationCount, proctoringWarnings } = get()

    const newViolationCount = {
      ...violationCount,
      [type]: violationCount[type] + 1
    }

    const warning = {
      timestamp: Date.now(),
      type,
      message,
      count: newViolationCount[type]
    }

    const newWarnings = [...proctoringWarnings, warning].slice(-10) // Keep last 10 warnings

    set({
      violationCount: newViolationCount,
      proctoringWarnings: newWarnings
    })

    // Log to backend
    get().sendProctoringEvent(type, 1)

    // Check for auto-submission conditions
    const shouldAutoSubmit = get().shouldAutoSubmit(newViolationCount)
    if (shouldAutoSubmit) {
      get().triggerAutoSubmission()
    }
  },

  sendProctoringEvent: async (type, duration) => {
    if (!PROCTORING_ENABLED) {
      return
    }

    try {
      const { quizId } = useQuizStore.getState() || {}

      await fetch('/api/quiz/proctoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type, duration, quizId })
      })
    } catch (error) {
      console.error('Failed to send proctoring event:', error)
    }
  },

  shouldAutoSubmit: (violations) => {
    if (!PROCTORING_ENABLED) {
      return false
    }

    // Auto-submit if any violation threshold is exceeded
    return (
      violations.no_face >= 3 ||
      violations.multiple_faces >= 2 ||
      violations.head_turned >= 2 ||
      violations.tab_switch >= 1 ||
      violations.window_minimize >= 1 ||
      violations.prohibited_object >= 1
    )
  },

  triggerAutoSubmission: () => {
    if (!PROCTORING_ENABLED) {
      return
    }

    // This would be called when cheating is detected
    const { completeQuiz } = useQuizStore.getState()
    completeQuiz()

    // Show alert to user
    alert('Quiz has been auto-submitted due to proctoring violations.')

    // Stop proctoring
    get().stopProctoring()
  },

  handleVisibilityChange: () => {
    if (!PROCTORING_ENABLED) {
      return
    }

    if (document.hidden) {
      get().logViolation('tab_switch', 'Tab switched or window minimized')
    }
  },

  handleWindowBlur: () => {
    if (!PROCTORING_ENABLED) {
      return
    }

    get().logViolation('tab_switch', 'Window lost focus')
  },

  handleWindowFocus: () => {
    // Window regained focus - could log this as well
  },

  handleBeforeUnload: (e) => {
    const message = 'Leaving this page will end your quiz session. Are you sure?'
    e.returnValue = message
    return message
  },

  // Get proctoring statistics
  getProctoringStats: () => {
    const { violationCount, proctoringWarnings, lastFaceDetection } = get()

    return {
      totalViolations: Object.values(violationCount).reduce((sum, count) => sum + count, 0),
      violations: violationCount,
      warningCount: proctoringWarnings.length,
      lastDetection: lastFaceDetection,
      complianceScore: get().calculateComplianceScore()
    }
  },

  calculateComplianceScore: () => {
    const { violationCount } = get()

    // Simple compliance score calculation
    const maxViolations = 10 // Maximum allowed violations
    const totalViolations = Object.values(violationCount).reduce((sum, count) => sum + count, 0)

    const score = Math.max(0, 100 - (totalViolations * 10))
    return Math.round(score)
  },

  // Reset proctoring state
  resetProctoring: () => {
    set({
      isProctoringActive: false,
      model: null,
      objectModel: null,
      video: null,
      proctoringWarnings: [],
      violationCount: {
        no_face: 0,
        multiple_faces: 0,
        head_turned: 0,
        tab_switch: 0,
        window_minimize: 0,
        prohibited_object: 0
      },
      lastFaceDetection: null,
      isMonitoring: false
    })
  }
}))
