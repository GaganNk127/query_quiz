import express from 'express';
import Candidate from '../models/Candidate.js';
import QuizQuestion from '../models/QuizQuestion.js';
import { authenticate, authorize } from '../middleware/auth.js';
import * as quizService from '../services/quizService.js';
import * as notificationService from '../services/notificationService.js';

const router = express.Router();

/***********************************************************
 📌 1. Assign Quiz (Recruiter Only)
************************************************************/
import crypto from "crypto";

router.post('/assign', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({ message: 'Candidate ID and Job ID are required' });
    }

    const candidate = await Candidate.findById(candidateId).populate('user', 'name email');
    const Job = (await import('../models/Job.js')).default;
    const job = await Job.findById(jobId);

    if (!candidate || !job)
      return res.status(404).json({ message: 'Candidate or Job not found' });

    const alreadyAssigned = candidate.quizAssignments?.find(q => q.jobId.toString() === jobId);
    if (alreadyAssigned) {
      return res.status(400).json({ message: 'Quiz already assigned for this job' });
    }

    const generatedQuestions = await quizService.generateQuiz(
      job.description,
      candidate.resumeText || '',
      job.title
    );

    // 🔥 FIX: Normalize questions before saving
    const normalizedQuestions = generatedQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correct: q.correct,
      difficulty: q.difficulty,
      category: q.category,
      points: q.points ?? (q.difficulty === 'easy' ? 1 :
        q.difficulty === 'medium' ? 2 :
          q.difficulty === 'hard' ? 3 : 4)
    }));

    const quizAssignment = {
      id: crypto.randomUUID(),
      jobId,
      jobTitle: job.title,
      assignedAt: new Date(),
      assignedBy: req.user._id,
      status: 'assigned',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questions: normalizedQuestions,
      timeLimit: normalizedQuestions.length * 60
    };

    candidate.quizAssignments.push(quizAssignment);
    await candidate.save();

    notificationService.createQuizNotification(
      candidate._id.toString(),
      candidate.user.name,
      candidate.user.email,
      job.title,
      quizAssignment.id
    );

    res.json({ message: 'Quiz assigned successfully', quiz: quizAssignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error assigning quiz' });
  }
});


/***********************************************************
 📌 2. Get Assigned Quizzes (Candidate)
************************************************************/
router.get('/my-quizzes', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const active = candidate.quizAssignments?.filter(
      q => q.status !== 'completed' && new Date(q.expiresAt) > new Date()
    ) || [];

    res.json({ quizzes: active });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching quizzes' });
  }
});


/***********************************************************
 📌 3. Start Quiz
************************************************************/
router.post('/:quizId/start', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate) return res.status(404).json({ message: 'Candidate profile missing' });

    const assignment = candidate.quizAssignments.find(q => q.id === quizId);

    if (!assignment) return res.status(404).json({ message: 'Quiz not found' });

    if (assignment.status === 'completed')
      return res.status(400).json({ message: 'Quiz already completed' });

    assignment.status = 'in_progress';

    candidate.quizAttempts.push({
      quizId,
      startedAt: new Date(),
      answers: [],
      status: 'in_progress',
      timeRemaining: assignment.timeLimit
    });

    await candidate.save();

    res.json({
      message: 'Quiz started',
      quiz: {
        id: assignment.id,
        questions: assignment.questions,
        timeLimit: assignment.timeLimit
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error starting quiz' });
  }
});


/***********************************************************
 📌 4. Submit a Single Answer
************************************************************/
router.post('/answer', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const { questionId, answer, quizId } = req.body;
    const candidate = await Candidate.findOne({ user: req.user._id });

    // Use findOne with implicit type casting or explicit Number() if needed, but checking for null is key
    const question = await QuizQuestion.findOne({ id: questionId });

    if (!question) {
      console.error(`Question not found: ${questionId}`);
      return res.status(404).json({ message: 'Question not found' });
    }

    const isCorrect = Number(answer) === Number(question.correct);

    const attempt = candidate.quizAttempts.find(a => a.quizId === quizId && a.status === 'in_progress');

    if (!attempt) {
      return res.status(400).json({ message: 'No active quiz attempt found' });
    }

    // Check if answer already exists
    const existingAnswerIndex = attempt.answers.findIndex(a => String(a.questionId) === String(questionId));
    if (existingAnswerIndex > -1) {
      attempt.answers[existingAnswerIndex] = { questionId, answer, isCorrect }; // Update existing
    } else {
      attempt.answers.push({ questionId, answer, isCorrect });
    }

    await candidate.save();

    res.json({ message: 'Answer recorded', isCorrect });
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ message: 'Error saving answer' });
  }
});


/***********************************************************
 📌 5. Submit Proctoring Event
************************************************************/
router.post('/proctoring', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const { quizId, type, duration } = req.body;
    const candidate = await Candidate.findOne({ user: req.user._id }).populate('user', 'name email');

    // Log the event
    candidate.proctoringLog.push({ quizId, type, duration, timestamp: new Date() });

    // 🚩 NEW: Send email directly on the FIRST violation for this quiz
    const quizViolations = candidate.proctoringLog.filter(log => log.quizId === quizId);

    if (quizViolations.length === 1) {
      const assignment = candidate.quizAssignments.find(q => q.id === quizId);
      if (assignment) {
        try {
          const Job = (await import('../models/Job.js')).default;
          const job = await Job.findById(assignment.jobId).populate('postedBy', 'email');
          const emailService = await import('../services/emailService.js');

          if (job && job.postedBy) {
            await emailService.sendProctoringAlertEmail(
              job.postedBy.email,
              candidate.user?.name || 'Candidate',
              job.title,
              [`${type}: detected at ${new Date().toLocaleTimeString()}`]
            );
            console.log(`📩 Proctoring alert sent to ${job.postedBy.email} for ${candidate.user?.name}`);
          }
        } catch (emailError) {
          console.error('Failed to send initial proctoring alert:', emailError);
        }
      }
    }

    // Still check for overall cheating threshold
    const cheatingDetected = quizService.detectCheating(candidate.proctoringLog.filter(log => log.quizId === quizId));
    
    if (cheatingDetected) {
      // Add to cheatedQuizzes if not already recorded for this quiz
      const alreadyRecorded = candidate.cheatedQuizzes.some(q => q.quizId === quizId);
      if (!alreadyRecorded) {
        candidate.cheatedQuizzes.push({ quizId, cheatedAt: new Date() });
        candidate.cheatingStatus = 'rejected_cheating';

        // Check for 1-year ban (more than 2 quizzes = 3 or more)
        if (candidate.cheatedQuizzes.length >= 3) {
          const coolingPeriod = new Date();
          coolingPeriod.setFullYear(coolingPeriod.getFullYear() + 1);
          candidate.restrictionUntil = coolingPeriod;
          console.log(`🚫 Candidate ${candidate._id} restricted until ${coolingPeriod}`);
        }
      }
    }

    await candidate.save();

    res.json({ 
      message: 'Event logged', 
      cheating: cheatingDetected || false,
      restrictedUntil: candidate.restrictionUntil
    });
  } catch (err) {
    console.error('Proctoring log error:', err);
    res.status(500).json({ message: 'Error logging event' });
  }
});


/***********************************************************
 📌 6. Complete Quiz & Calculate Score
************************************************************/
router.post('/complete', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // Find quiz attempt & assignment
    const attempt = candidate.quizAttempts.find(a => a.quizId === quizId && a.status === 'in_progress');
    const assignment = candidate.quizAssignments.find(a => a.id === quizId);

    if (!attempt || !assignment) {
      return res.status(400).json({ message: 'Active quiz attempt not found' });
    }

    // Normalize question comparison (DB may store id as number, frontend sends string)
    const evaluatedAnswers = answers.map(answer => {
      const storedQuestion = assignment.questions.find(
        q => String(q.id) === String(answer.questionId)
      );

      if (!storedQuestion) {
        console.warn(`Stored question not found for ID: ${answer.questionId}`);
      }

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        difficulty: storedQuestion?.difficulty || 'medium', // Fallback
        isCorrect: storedQuestion && Number(answer.selectedAnswer) === Number(storedQuestion.correct),
        timeSpent: answer.timeSpent || 0,
        answeredAt: new Date()
      };
    });

    // Save evaluated answers
    attempt.answers = evaluatedAnswers;
    attempt.status = 'completed';
    assignment.status = 'completed';

    // Calculate weighted score using quizService
    const score = quizService.calculateQuizScore(evaluatedAnswers);
    attempt.score = score;
    candidate.quizScore = score; // store final score

    // Clear any active proctoring status
    // candidate.cheatingStatus = candidate.cheatingStatus === 'Monitoring' ? 'Clean' : candidate.cheatingStatus;

    await candidate.save();

    return res.json({
      message: 'Quiz completed successfully',
      score,
      totalQuestions: evaluatedAnswers.length,
      correctAnswers: evaluatedAnswers.filter(a => a.isCorrect).length
    });

  } catch (error) {
    console.error("❌ Quiz completion error:", error);
    res.status(500).json({ message: 'Server error completing quiz' });
  }
});



/***********************************************************
 📌 7. Get Candidate Quiz Results
************************************************************/
router.get('/results', authenticate, authorize('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ user: req.user._id });

    if (!candidate || candidate.quizAttempts.length === 0) {
      return res.status(404).json({ message: 'No quiz attempt found' });
    }

    // Get latest attempt
    const latestAttempt = candidate.quizAttempts[candidate.quizAttempts.length - 1];

    // Corrected: Match using assignment.id (not quizId)
    const assignment = candidate.quizAssignments.find(a =>
      String(a.id) === String(latestAttempt.quizId)
    );

    if (!assignment) {
      console.log('Debug: No assignment match found for quizId:', latestAttempt.quizId);
      return res.status(404).json({ message: 'Quiz assignment not found' });
    }

    // Fix: Generate detailed answers with correct mapping
    const detailedAnswers = latestAttempt.answers.map(ans => {
      const q = assignment.questions.find(q => String(q.id) === String(ans.questionId));

      return {
        questionId: ans.questionId,
        question: q?.question || 'Question not found',
        options: q?.options || [],
        selectedAnswer: q?.options?.[ans.selectedAnswer] ?? 'Not answered',
        correctAnswer: q?.options?.[q?.correct] ?? 'Unknown',
        difficulty: q?.difficulty ?? 'unknown',
        points: q?.points ?? 0,
        timeSpent: ans.timeSpent ?? 0,
        isCorrect: ans.isCorrect ?? false
      };
    });

    // Calculate stats
    const correctAnswers = detailedAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = detailedAnswers.length;
    const totalTime = detailedAnswers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);

    const difficultyStats = {
      easy: detailedAnswers.filter(a => a.difficulty === 'easy' && a.isCorrect).length,
      medium: detailedAnswers.filter(a => a.difficulty === 'medium' && a.isCorrect).length,
      hard: detailedAnswers.filter(a => a.difficulty === 'hard' && a.isCorrect).length,
      analytical: detailedAnswers.filter(a => a.difficulty === 'analytical' && a.isCorrect).length
    };

    return res.json({
      score: candidate.quizScore || latestAttempt.score,
      correctAnswers,
      totalQuestions,
      totalTime,
      averageTimePerQuestion: totalQuestions ? Math.round(totalTime / totalQuestions) : 0,
      difficultyStats,
      cheatingStatus: candidate.cheatingStatus || 'Clean',
      answers: detailedAnswers
    });

  } catch (err) {
    console.error("Results fetch error:", err);
    return res.status(500).json({ message: 'Error fetching results' });
  }
});



/***********************************************************
 📌 8. Recruiter View Results for Any Candidate
************************************************************/
router.get('/results/:candidateId', authenticate, authorize('recruiter'), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);

    res.json({
      candidate: candidate.user,
      quizScore: candidate.quizScore,
      attempts: candidate.quizAttempts,
      proctoring: candidate.proctoringLog
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidate results' });
  }
});

export default router;
