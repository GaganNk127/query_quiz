import QuizQuestion from '../models/QuizQuestion.js';
import { generateAdaptiveQuiz, generateRoleSpecificQuiz, generateSyntheticQuizQuestions } from '../data/syntheticQuizGenerator.js';

// Generate quiz with balanced difficulty
export const generateQuiz = async (jobDescription = '', resumeText = '', role = 'Software Engineer') => {
  try {
    let quizQuestions;

    // Try to use database questions first
    const dbQuestions = await getQuestionsFromDatabase();
    if (dbQuestions.length > 0) {
      quizQuestions = selectBalancedQuestionsFromDB(dbQuestions);
    } else {
      // Fallback to synthetic data generation
      if (jobDescription && resumeText) {
        quizQuestions = generateAdaptiveQuiz(resumeText, jobDescription);
      } else {
        quizQuestions = generateRoleSpecificQuiz(role);
      }
    }

    // Shuffle questions for randomness
    return shuffleArray(quizQuestions);
  } catch (error) {
    console.error('Error generating quiz:', error);
    // Fallback to synthetic data if anything fails
    return generateRoleSpecificQuiz('Software Engineer');
  }
};

// Get questions from database with fallback
const getQuestionsFromDatabase = async () => {
  try {
    const easyQuestions = await QuizQuestion.find({ difficulty: 'easy' });
    const mediumQuestions = await QuizQuestion.find({ difficulty: 'medium' });
    const hardQuestions = await QuizQuestion.find({ difficulty: 'hard' });
    const analyticalQuestions = await QuizQuestion.find({ difficulty: 'analytical' });

    return [...easyQuestions, ...mediumQuestions, ...hardQuestions, ...analyticalQuestions];
  } catch (error) {
    console.error('Error fetching questions from database:', error);
    return [];
  }
};

// Select balanced questions from database
const selectBalancedQuestionsFromDB = (allQuestions) => {
  const easy = allQuestions.filter(q => q.difficulty === 'easy');
  const medium = allQuestions.filter(q => q.difficulty === 'medium');
  const hard = allQuestions.filter(q => q.difficulty === 'hard');
  const analytical = allQuestions.filter(q => q.difficulty === 'analytical');

  // Select questions based on requirements: 3 easy + 4 medium + 2 hard + 1 analytical
  const selectedQuestions = [
    ...getRandomItems(easy, 3),
    ...getRandomItems(medium, 4),
    ...getRandomItems(hard, 2),
    ...getRandomItems(analytical, 1)
  ];

  return selectedQuestions;
};

// Get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

// Shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Calculate quiz score based on difficulty points
export const calculateQuizScore = (answers) => {
  if (!answers || answers.length === 0) return 0;

  let totalScore = 0;
  let maxScore = 0;

  answers.forEach(answer => {
    // Points based on difficulty
    const points = getDifficultyPoints(answer.difficulty);
    maxScore += points;

    if (answer.isCorrect) {
      totalScore += points;
    }
  });

  // Return percentage score
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Get points for each difficulty level
const getDifficultyPoints = (difficulty) => {
  const pointsMap = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'analytical': 4
  };
  return pointsMap[difficulty] || 1;
};

// Detect cheating based on proctoring log
export const detectCheating = (proctoringLog) => {
  if (!proctoringLog || proctoringLog.length === 0) return false;

  const recentEvents = proctoringLog.filter(
    event => Date.now() - new Date(event.timestamp).getTime() < 600000 // Last 10 minutes
  );

  // Count different types of violations
  const violations = {
    multiple_faces: recentEvents.filter(e => e.type === 'multiple_faces').length,
    tab_switch: recentEvents.filter(e => e.type === 'tab_switch').length,
    window_minimize: recentEvents.filter(e => e.type === 'window_minimize').length,
    prohibited_object: recentEvents.filter(e => e.type === 'prohibited_object').length
  };

  // Cheating detection rules
  const cheatingRules = [
    violations.multiple_faces >= 3,
    violations.tab_switch >= 3,
    violations.window_minimize >= 3,
    violations.prohibited_object >= 2
  ];

  return cheatingRules.some(rule => rule);
};

// Validate quiz completion
export const validateQuizCompletion = (candidate) => {
  if (!candidate.quizAssigned) {
    return { valid: false, message: 'No quiz assigned' };
  }

  if (candidate.quizAnswers.length === 0) {
    return { valid: false, message: 'No answers submitted' };
  }

  if (candidate.cheatingStatus === 'rejected_cheating') {
    return { valid: false, message: 'Quiz rejected due to cheating' };
  }

  return { valid: true, message: 'Quiz can be completed' };
};

// Get quiz statistics
export const getQuizStatistics = async () => {
  try {
    const stats = await QuizQuestion.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgPoints: { $avg: '$points' }
        }
      }
    ]);

    const totalQuestions = await QuizQuestion.countDocuments();

    return {
      totalQuestions,
      byDifficulty: stats,
      categories: await QuizQuestion.distinct('category')
    };
  } catch (error) {
    console.error('Error getting quiz statistics:', error);
    throw error;
  }
};

// Generate quiz report
export const generateQuizReport = (candidate) => {
  const { quizAnswers, quizScore, cheatingStatus } = candidate;

  const report = {
    candidateId: candidate._id,
    quizScore,
    cheatingStatus,
    totalQuestions: quizAnswers.length,
    correctAnswers: quizAnswers.filter(ans => ans.isCorrect).length,
    incorrectAnswers: quizAnswers.filter(ans => !ans.isCorrect).length,
    timeSpent: quizAnswers.reduce((total, ans) => total + (ans.timeSpent || 0), 0),
    performanceByDifficulty: {},
    proctoringViolations: candidate.proctoringLog.length
  };

  // Calculate performance by difficulty
  ['easy', 'medium', 'hard', 'analytical'].forEach(difficulty => {
    const difficultyAnswers = quizAnswers.filter(ans => ans.difficulty === difficulty);
    const correct = difficultyAnswers.filter(ans => ans.isCorrect).length;

    report.performanceByDifficulty[difficulty] = {
      total: difficultyAnswers.length,
      correct,
      percentage: difficultyAnswers.length > 0
        ? Math.round((correct / difficultyAnswers.length) * 100)
        : 0
    };
  });

  return report;
};

export default {
  generateQuiz,
  calculateQuizScore,
  detectCheating,
  validateQuizCompletion,
  getQuizStatistics,
  generateQuizReport
};
