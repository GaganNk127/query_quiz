import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  resumeText: {
    type: String,
    required: false,
    default: ''
  },
  resumeUrl: {
    type: String
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  quizAssigned: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number,
    default: 0
  },
  quizAssignments: [{
    id: {
      type: String,
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    jobTitle: {
      type: String,
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    questions: [{
      id: String,
      question: String,
      options: [String],
      correct: Number,
      difficulty: String,
      category: String,
      points: Number,
      timeLimit: Number
    }],
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'expired'],
      default: 'assigned'
    },
    timeLimit: {
      type: Number,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt'
    }
  }],
  quizAttempts: [{
    quizId: {
      type: String,
      required: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    answers: [{
      questionId: String,
      selectedAnswer: Number,
      isCorrect: Boolean,
      timeSpent: Number,
      answeredAt: {
        type: Date,
        default: Date.now
      }
    }],
    timeRemaining: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned', 'expired'],
      default: 'in_progress'
    }
  }],
  quizAnswers: [{
    questionId: Number,
    answer: String,
    isCorrect: Boolean,
    timeSpent: Number // in seconds
  }],
  cheatingStatus: {
    type: String,
    default: 'none',
    enum: ['none', 'warning', 'rejected_cheating']
  },
  proctoringLog: [{
    quizId: String,
    timestamp: Date,
    type: {
      type: String,
      enum: ['no_face', 'multiple_faces', 'head_turned', 'tab_switch', 'window_minimize', 'prohibited_object']
    },
    duration: Number
  }],
  shortlisted: {
    type: Boolean,
    default: false
  },
  shortlistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  shortlistedAt: Date,
  appliedJobs: [{
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager']
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  portfolio: String,
  github: String,
  linkedin: String
}, {
  timestamps: true
});

// Index for efficient queries
candidateSchema.index({ atsScore: -1 });
candidateSchema.index({ shortlisted: 1 });
candidateSchema.index({ cheatingStatus: 1 });

export default mongoose.model('Candidate', candidateSchema);
