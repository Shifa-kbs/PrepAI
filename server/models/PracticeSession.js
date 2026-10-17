const mongoose = require('mongoose');

const PracticeSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mode: {
    type: String,
    enum: ['topic', 'mixed', 'assessment', 'section-test', 'full-test'],
    default: 'topic',
  },
  moduleType: {
    type: String,
    enum: ['technical', 'aptitude', 'company-mock'],
    default: 'technical',
    index: true,
  },
  section: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
    default: 'Mixed Topics',
  },
  difficulty: {
    type: String,
    enum: ['All', 'Easy', 'Medium', 'Hard'],
    default: 'All',
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  requestedQuestions: {
    type: Number,
  },
  timeLimitMinutes: {
    type: Number,
    default: 0, // 0 means untimed
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
    index: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    },
  ],
  answers: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
      },
      selectedOptionIndex: {
        type: Number,
      },
      userAnswer: {
        type: String,
        default: '',
      },
      isCorrect: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ['correct', 'wrong', 'skipped'],
        default: 'skipped',
      },
      timeSpentSeconds: {
        type: Number,
        default: 0,
      },
      markedForReview: {
        type: Boolean,
        default: false,
      },
      answeredAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
  accuracy: {
    type: Number,
    default: 0,
  },
  timeTakenSeconds: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('PracticeSession', PracticeSessionSchema);
