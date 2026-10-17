const mongoose = require('mongoose');

const QuestionProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['attempted', 'solved', 'review'],
    default: 'attempted',
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  correctAttempts: {
    type: Number,
    default: 0,
  },
  incorrectAttempts: {
    type: Number,
    default: 0,
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  lastAttemptedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  isBookmarked: {
    type: Boolean,
    default: false,
    index: true,
  },
});

// Compound unique index ensuring one progress entry per user per question
QuestionProgressSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('QuestionProgress', QuestionProgressSchema);
