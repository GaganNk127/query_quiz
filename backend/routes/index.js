import express from 'express'
import authRoutes from './auth.js'
import candidateRoutes from './candidates.js'
import dashboardRoutes from './dashboard.js'
import jobRoutes from './jobs.js'
import quizRoutes from './quiz.js'

const router = express.Router()

// API routes
router.use('/auth', authRoutes)
router.use('/candidates', candidateRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/jobs', jobRoutes)
router.use('/quiz', quizRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SmartRecruit AI API is running',
    timestamp: new Date().toISOString()
  })
})

export default router
