import React, { createContext, useContext, useReducer, useCallback } from 'react'
import axios from 'axios'

// Quiz actions
const QUIZ_ACTIONS = {
  START_QUIZ: 'START_QUIZ',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  NEXT_QUESTION: 'NEXT_QUESTION',
  UPDATE_TIMER: 'UPDATE_TIMER',
  COMPLETE_QUIZ: 'COMPLETE_QUIZ',
  RESET_QUIZ: 'RESET_QUIZ'
}

// Initial state
const initialState = {
  currentQuestion: 0,
  answers: [],
  timeRemaining: 0,
  isQuizActive: false,
  quizQuestions: [],
  quizStartTime: null,
  questionStartTime: null,
  score: null,
  isSubmitting: false
}

// Reducer
const quizReducer = (state, action) => {
  switch (action.type) {
    case QUIZ_ACTIONS.START_QUIZ:
      return {
        ...state,
        quizQuestions: action.payload.questions,
        currentQuestion: 0,
        answers: [],
        timeRemaining: action.payload.timeLimit,
        isQuizActive: true,
        quizStartTime: Date.now(),
        questionStartTime: Date.now(),
        score: null
      }

    case QUIZ_ACTIONS.SUBMIT_ANSWER: {
      const { questionId, selectedAnswer, timeSpent } = action.payload
      const newAnswer = { questionId, selectedAnswer, timeSpent }

      // Replace if exists, otherwise append
      const updatedAnswers = [
        ...state.answers.filter(a => a.questionId !== questionId),
        newAnswer
      ]

      return { ...state, answers: updatedAnswers }
    }

    case QUIZ_ACTIONS.NEXT_QUESTION:
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
        questionStartTime: Date.now()
      }

    case QUIZ_ACTIONS.UPDATE_TIMER:
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1)
      }

    case QUIZ_ACTIONS.COMPLETE_QUIZ:
      return {
        ...state,
        isQuizActive: false,
        score: action.payload.score,
        isSubmitting: false
      }

    case QUIZ_ACTIONS.RESET_QUIZ:
      return { ...initialState }

    default:
      return state
  }
}

// Create context
const QuizContext = createContext()

// Provider component
export const QuizProvider = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState)

  // Start quiz
  const startQuiz = useCallback((questions, timeLimit) => {
    const totalTime = timeLimit || questions.length * 60
    dispatch({
      type: QUIZ_ACTIONS.START_QUIZ,
      payload: { questions, timeLimit: totalTime }
    })
  }, [])

  // Submit answer (FIXED)
  const submitAnswer = useCallback(
    async (questionId, selectedAnswer) => {
      const timeSpent = Math.floor((Date.now() - state.questionStartTime) / 1000)

      dispatch({
        type: QUIZ_ACTIONS.SUBMIT_ANSWER,
        payload: { questionId, selectedAnswer, timeSpent }
      })

      try {
        await axios.post('/api/quiz/answer', {
          questionId,
          selectedAnswer,
          timeSpent
        })
        return { success: true }
      } catch (error) {
        console.error('Error submitting answer:', error)
        return { success: false }
      }
    },
    [state.questionStartTime]
  )

  // Move to next question
  const nextQuestion = useCallback(() => {
    if (state.currentQuestion < state.quizQuestions.length - 1) {
      dispatch({ type: QUIZ_ACTIONS.NEXT_QUESTION })
    }
  }, [state.currentQuestion, state.quizQuestions.length])

  // Timer tick
  const updateTimer = useCallback(() => {
    dispatch({ type: QUIZ_ACTIONS.UPDATE_TIMER })
  }, [])

  // Complete quiz (fixed scoring)
  const completeQuiz = useCallback(
    async (score, answers) => {
      dispatch({ type: QUIZ_ACTIONS.COMPLETE_QUIZ, payload: { score } })

      try {
        await axios.post('/api/quiz/complete', {
          score,
          answers,
          totalTime: Math.floor((Date.now() - state.quizStartTime) / 1000)
        })
        return { success: true }
      } catch (error) {
        console.error('Error completing quiz:', error)
        return { success: false }
      }
    },
    [state.quizStartTime]
  )

  // Reset quiz
  const resetQuiz = useCallback(() => {
    dispatch({ type: QUIZ_ACTIONS.RESET_QUIZ })
  }, [])

  return (
    <QuizContext.Provider
      value={{
        ...state,
        startQuiz,
        submitAnswer,
        nextQuestion,
        updateTimer,
        completeQuiz,
        resetQuiz
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

// Hook
export const useQuiz = () => {
  const context = useContext(QuizContext)
  if (!context) throw new Error('useQuiz must be used within a QuizProvider')
  return context
}

export default QuizContext
