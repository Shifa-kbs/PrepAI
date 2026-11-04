const mongoose = require('mongoose');

const CognitiveSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        'full-battery',
        'digit-span',
        'pattern-recognition',
        'numerical-estimation',
        'battery',
        'full_battery',
        'digit_span',
        'pattern_recognition',
        'numerical_estimation',
      ],
      default: 'full-battery',
    },
    mode: {
      type: String,
      default: 'battery',
    },
    digitSpanScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    maxDigitSpan: {
      type: Number,
      min: 0,
      default: 0,
    },
    patternScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    correctPatterns: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalPatterns: {
      type: Number,
      min: 0,
      default: 5,
    },
    estimationScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    correctEstimations: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalEstimations: {
      type: Number,
      min: 0,
      default: 8,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    compositeScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scores: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CognitiveSessionSchema.pre('validate', function () {
  if (this.overallScore !== undefined && this.compositeScore === undefined) {
    this.compositeScore = this.overallScore;
  }
  if (this.compositeScore !== undefined && this.overallScore === undefined) {
    this.overallScore = this.compositeScore;
  }
  if (!this.overallScore && this.compositeScore) {
    this.overallScore = this.compositeScore;
  }
  if (!this.compositeScore && this.overallScore) {
    this.compositeScore = this.overallScore;
  }

  if (this.mode && !this.activityType) {
    this.activityType = this.mode === 'battery' ? 'full-battery' : this.mode;
  }
  if (this.activityType && !this.mode) {
    this.mode = this.activityType;
  }
});

CognitiveSessionSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('CognitiveSession', CognitiveSessionSchema);
