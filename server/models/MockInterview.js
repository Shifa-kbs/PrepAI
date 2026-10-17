const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobRole: {
    type: String,
    required: true,
    trim: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Fresher (0-1 yrs)', 'Junior (1-3 yrs)', 'Mid (3-5 yrs)'],
    default: 'Fresher (0-1 yrs)',
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'HR', 'Behavioral', 'Mixed'],
    default: 'Mixed',
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
    required: true,
  },
  topics: [
    {
      type: String,
      trim: true,
    },
  ],
  totalQuestions: {
    type: Number,
    required: true,
    default: 5,
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  overallScore: {
    type: Number,
    default: 0,
  },
  summaryFeedback: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
  },
  questions: [
    {
      questionText: { type: String, required: true },
      category: { type: String, default: 'General' },
      difficulty: { type: String, default: 'Medium' },
      contextHint: { type: String, default: '' },
      userAnswer: { type: String, default: '' },
      score: { type: Number, default: 0 },
      relevanceScore: { type: Number, default: 0 },
      clarityScore: { type: Number, default: 0 },
      depthScore: { type: Number, default: 0 },
      aiFeedback: { type: String, default: '' },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestedImprovements: [{ type: String }],
      followUpQuestion: { type: String, default: null },
      status: {
        type: String,
        enum: ['unanswered', 'answered', 'skipped'],
        default: 'unanswered',
      },
      isFollowUp: { type: Boolean, default: false },
      answeredAt: { type: Date },
    },
  ],
  finalReport: {
    overallScore: { type: Number, default: 0 },
    technicalKnowledge: { type: Number, default: 0 },
    answerRelevance: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    communicationClarity: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    topStrengths: [{ type: String }],
    keyAreasForImprovement: [{ type: String }],
    recommendedTopicsToPractice: [{ type: String }],
    suggestedNextSteps: [{ type: String }],
    generatedAt: { type: Date },
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
    index: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

MockInterviewSchema.index({ user: 1, status: 1 });
MockInterviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
