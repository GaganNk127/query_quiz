import express from 'express';
import quizQuestions, { quizQuestions as questionsArray } from '../data/quizQuestions.js';

const router = express.Router();

// Generate quiz questions
router.post('/generate', (req, res) => {
  try {
    // Select balanced questions: 3 easy, 4 medium, 2 hard, 1 analytical
    const easyQuestions = questionsArray.filter(q => q.difficulty === 'easy').slice(0, 3);
    const mediumQuestions = questionsArray.filter(q => q.difficulty === 'medium').slice(0, 4);
    const hardQuestions = questionsArray.filter(q => q.difficulty === 'hard').slice(0, 2);
    const analyticalQuestions = questionsArray.filter(q => q.difficulty === 'analytical').slice(0, 1);

    const selectedQuestions = [
      ...easyQuestions,
      ...mediumQuestions,
      ...hardQuestions,
      ...analyticalQuestions
    ];

    // Shuffle questions
    const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    res.status(200).json({
      success: true,
      data: {
        questions: shuffledQuestions,
        timeLimit: 20 * 60, // 20 minutes in seconds
        totalQuestions: shuffledQuestions.length
      }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz',
      error: error.message
    });
  }
});

// Submit quiz answer
router.post('/submit-answer', (req, res) => {
  try {
    const { questionId, answer, timeSpent } = req.body;

    // Find the question
    const question = questionsArray.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const isCorrect = answer === question.correct;

    res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correct,
        points: isCorrect ? question.points || 10 : 0,
        explanation: question.explanation || ''
      }
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
});

// Complete quiz
router.post('/complete', (req, res) => {
  try {
    const { answers, totalTime } = req.body;

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const detailedAnswers = [];

    answers.forEach(answer => {
      const question = questionsArray.find(q => q.id === answer.questionId);
      if (question) {
        totalPoints += question.points || 10;
        const isCorrect = answer.selectedAnswer === question.correct;
        if (isCorrect) {
          earnedPoints += question.points || 10;
        }

        detailedAnswers.push({
          questionId: question.id,
          question: question.question,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correct,
          isCorrect,
          points: question.points || 10,
          timeSpent: answer.timeSpent || 0,
          difficulty: question.difficulty
        });
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);

    res.status(200).json({
      success: true,
      message: 'Quiz completed successfully',
      data: {
        score,
        totalQuestions: answers.length,
        correctAnswers: detailedAnswers.filter(a => a.isCorrect).length,
        totalTime,
        answers: detailedAnswers
      }
    });
  } catch (error) {
    console.error('Quiz completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete quiz',
      error: error.message
    });
  }
});

// Get quiz results
router.get('/results', (req, res) => {
  try {
    // Mock quiz results for demo
    const mockResults = {
      score: 78,
      totalQuestions: 10,
      correctAnswers: 8,
      totalTime: 18 * 60, // 18 minutes
      answers: [
        {
          questionId: 'q001',
          question: 'What is the time complexity of binary search?',
          selectedAnswer: 'O(log n)',
          correctAnswer: 'O(log n)',
          isCorrect: true,
          points: 10,
          timeSpent: 45,
          difficulty: 'easy'
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: mockResults
    });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz results',
      error: error.message
    });
  }
});

// Log proctoring event
router.post('/proctoring', (req, res) => {
  try {
    const { eventType, timestamp, details } = req.body;

    // Log the proctoring event (in production, this would be stored in database)
    console.log('Proctoring event:', {
      eventType,
      timestamp,
      details,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Proctoring event logged successfully'
    });
  } catch (error) {
    console.error('Proctoring log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log proctoring event',
      error: error.message
    });
  }
});

export default router;
