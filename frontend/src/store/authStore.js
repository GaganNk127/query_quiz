import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

// Axios configuration is handled in AuthContext.jsx
// Do not add interceptors here to avoid duplicates


export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (email, password) => {
        try {
          set({ isLoading: true })
          const response = await axios.post('/api/auth/login', { email, password })
          const { token, user } = response.data

          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed'
          }
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await axios.post('/api/auth/register', userData)
          const { token, user } = response.data

          localStorage.setItem('token', token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.message || 'Registration failed'
          }
        }
      },

      logout: () => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
        // Clear the persist storage to ensure clean state on next login
        useAuthStore.persist.clearStorage()
      },

      initializeAuth: async () => {
        const token = localStorage.getItem('token')

        if (!token) {
          // Clear any persist storage if no token exists
          useAuthStore.persist.clearStorage()
          set({ isLoading: false })
          return
        }

        try {
          set({ isLoading: true })
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          const response = await axios.get('/api/auth/me')
          const { user, candidateData } = response.data

          set({
            user,
            candidateData,
            token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          localStorage.removeItem('token')
          delete axios.defaults.headers.common['Authorization']
          // Clear persist storage on auth failure
          useAuthStore.persist.clearStorage()
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true })
          const response = await axios.put('/api/auth/profile', { profile: profileData })
          const { user } = response.data

          set({
            user,
            isLoading: false
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.message || 'Profile update failed'
          }
        }
      },

      // Check if user has specific role
      hasRole: (role) => {
        const { user } = get()
        return user?.role === role
      },

      // Check if user is candidate
      isCandidate: () => {
        const { user } = get()
        return user?.role === 'candidate'
      },

      // Check if user is recruiter
      isRecruiter: () => {
        const { user } = get()
        return user?.role === 'recruiter'
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Quiz Store
export const useQuizStore = create((set, get) => ({
  // State
  currentQuestion: 0,
  answers: [],
  timeRemaining: 0,
  isQuizActive: false,
  quizQuestions: [],
  quizStartTime: null,
  questionStartTime: null,

  // Actions
  startQuiz: (questions) => {
    const totalTime = questions.reduce((total, q) => total + (q.timeLimit || 60), 0)
    set({
      quizQuestions: questions,
      currentQuestion: 0,
      answers: [],
      timeRemaining: totalTime,
      isQuizActive: true,
      quizStartTime: Date.now(),
      questionStartTime: Date.now()
    })
  },

  submitAnswer: async (questionId, answer) => {
    const { answers, questionStartTime } = get()
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)

    const newAnswer = {
      questionId,
      answer,
      timeSpent
    }

    const updatedAnswers = [...answers.filter(a => a.questionId !== questionId), newAnswer]
    set({ answers: updatedAnswers })

    try {
      const response = await axios.post('/api/quiz/answer', {
        questionId,
        answer,
        timeSpent
      })

      return response.data
    } catch (error) {
      console.error('Error submitting answer:', error)
      return { success: false, error: 'Failed to submit answer' }
    }
  },

  nextQuestion: () => {
    const { currentQuestion, quizQuestions } = get()
    if (currentQuestion < quizQuestions.length - 1) {
      set({
        currentQuestion: currentQuestion + 1,
        questionStartTime: Date.now()
      })
    }
  },

  updateTimer: () => {
    const { timeRemaining } = get()
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 })
    }
  },

  completeQuiz: async () => {
    try {
      const response = await axios.post('/api/quiz/complete')
      set({
        isQuizActive: false,
        currentQuestion: 0,
        answers: []
      })
      return response.data
    } catch (error) {
      console.error('Error completing quiz:', error)
      return { success: false, error: 'Failed to complete quiz' }
    }
  },

  resetQuiz: () => {
    set({
      currentQuestion: 0,
      answers: [],
      timeRemaining: 0,
      isQuizActive: false,
      quizQuestions: [],
      quizStartTime: null,
      questionStartTime: null
    })
  }
}))

// UI Store for dark mode and other UI state
export const useUIStore = create(
  persist(
    (set, get) => ({
      // State
      isDarkMode: false,
      sidebarOpen: false,

      // Actions
      toggleDarkMode: () => {
        const newDarkMode = !get().isDarkMode
        set({ isDarkMode: newDarkMode })

        // Apply dark mode class to document
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen })
      },

      closeSidebar: () => {
        set({ sidebarOpen: false })
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode
      })
    }
  )
)

// Initialize dark mode on app load
const initializeDarkMode = () => {
  const stored = localStorage.getItem('ui-storage')
  if (stored) {
    const { isDarkMode } = JSON.parse(stored)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }
}

initializeDarkMode()
