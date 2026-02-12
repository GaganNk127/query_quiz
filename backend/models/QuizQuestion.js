import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correct: {
    type: Number,
    required: true,
    min: 0,
    max: 3 // 0-3 for 4 options
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard', 'analytical']
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'behavioral', 'problem_solving', 'logical_reasoning']
  },
  points: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 60 // seconds
  }
}, {
  timestamps: true
});

// Static method to get questions by difficulty
quizQuestionSchema.statics.getByDifficulty = function(difficulty) {
  return this.find({ difficulty });
};

// Static method to get random questions
quizQuestionSchema.statics.getRandomQuestions = function(count, difficulty = null) {
  const query = difficulty ? { difficulty } : {};
  return this.aggregate([
    { $match: query },
    { $sample: { size: count } }
  ]);
};

export default mongoose.model('QuizQuestion', quizQuestionSchema);
