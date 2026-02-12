import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import axios from 'axios'

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_URL

// Add request interceptor to include auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  INIT_AUTH_START: 'INIT_AUTH_START',
  INIT_AUTH_SUCCESS: 'INIT_AUTH_SUCCESS',
  INIT_AUTH_FAILURE: 'INIT_AUTH_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE'
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case AUTH_ACTIONS.INIT_AUTH_START:
      return { ...state, isLoading: true }
    case AUTH_ACTIONS.INIT_AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    case AUTH_ACTIONS.INIT_AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user }
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })

      const response = await axios.post('/api/auth/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { token, user }
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('auth-storage') // Clear Zustand auth store
    localStorage.removeItem('quiz-storage') // Clear Zustand quiz store if any
    localStorage.removeItem('ui-storage')   // Clear UI state as well for full reset

    delete axios.defaults.headers.common['Authorization']
    dispatch({ type: AUTH_ACTIONS.LOGOUT })

    // Force reload to clear any in-memory state completely
    window.location.href = '/auth/login'
  }

  // Initialize auth - wrapped in useCallback to prevent infinite re-renders
  const initializeAuth = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      dispatch({ type: AUTH_ACTIONS.INIT_AUTH_FAILURE })
      return
    }

    try {
      dispatch({ type: AUTH_ACTIONS.INIT_AUTH_START })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/api/auth/me')
      const { user, candidateData } = response.data

      console.log('AuthContext: Initialized user:', user)
      dispatch({
        type: AUTH_ACTIONS.INIT_AUTH_SUCCESS,
        payload: { token, user, candidateData }
      })
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      dispatch({ type: AUTH_ACTIONS.INIT_AUTH_FAILURE })
    }
  }, []) // Empty dependency array since it doesn't depend on any external values

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      const response = await axios.put('/api/auth/profile', { profile: profileData })
      const { user } = response.data

      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: user
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Helper functions
  const hasRole = useCallback((role) => {
    return state.user?.role === role
  }, [state.user?.role])

  const isCandidate = useCallback(() => {
    return state.user?.role === 'candidate'
  }, [state.user?.role])

  const isRecruiter = useCallback(() => {
    return state.user?.role === 'recruiter'
  }, [state.user?.role])

  const value = {
    ...state,
    login,
    register,
    logout,
    initializeAuth,
    updateProfile,
    hasRole,
    isCandidate,
    isRecruiter
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
