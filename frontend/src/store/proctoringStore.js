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
    multiple_faces: 0,
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

      // Load models in parallel
      const [model, objectModel] = await Promise.all([
        blazeface.load().catch(err => {
          console.error('BlazeFace load error:', err);
          return null;
        }),
        cocoSsd.load().catch(err => {
          console.error('COCO-SSD load error:', err);
          return null;
        })
      ]);

      if (!model) {
        throw new Error('Failed to load Face Detection model. Please check your connection.');
      }

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

      // Run detections in parallel for better performance
      await Promise.all([
        get().detectFaces(),
        get().detectObjects()
      ]).catch(err => console.error('Monitoring loop error:', err));

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
      if (predictions.length > 1) {
        // Multiple faces detected
        logViolation('multiple_faces', 'Multiple faces detected')
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
      const prohibitedItems = ['cell phone', 'mobile phone', 'phone', 'remote', 'laptop']

      const violations = predictions.filter(pred =>
        (prohibitedItems.includes(pred.class.toLowerCase()) || 
         pred.class.toLowerCase().includes('phone')) && 
        pred.score > 0.5 // Slightly lower threshold for better recall
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
      violations.multiple_faces >= 2 ||
      violations.tab_switch >= 1 ||
      violations.window_minimize >= 1 ||
      violations.prohibited_object >= 1
    )
  },

  triggerAutoSubmission: () => {
    if (!PROCTORING_ENABLED) {
      return
    }

    console.log('Proctoring violation threshold reached. Triggering auto-submission...')
    
    // Stop monitoring to prevent further violations during submission
    get().stopFaceMonitoring()
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
        multiple_faces: 0,
        tab_switch: 0,
        window_minimize: 0,
        prohibited_object: 0
      },
      lastFaceDetection: null,
      isMonitoring: false
    })
  }
}))
