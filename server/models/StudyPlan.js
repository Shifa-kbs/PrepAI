const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  difficulty: {
    type: String,
    enum: ['All', 'Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  day: {
    type: String,
    default: 'Monday',
  },
  week: {
    type: Number,
    default: 1,
  },
  estimatedMinutes: {
    type: Number,
    default: 45,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

const StudyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  goal: {
    type: String,
    required: true,
    default: 'Full Stack Software Engineer Preparation',
    trim: true,
  },
  targetDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days ahead
  },
  studyHoursPerWeek: {
    type: Number,
    default: 10,
    min: 1,
    max: 60,
  },
  preferredDays: [
    {
      type: String,
      trim: true,
    },
  ],
  targetCategories: [
    {
      type: String,
      trim: true,
    },
  ],
  scheduleType: {
    type: String,
    enum: ['weekly', 'daily'],
    default: 'weekly',
  },
  tasks: [TaskSchema],
  totalTasks: {
    type: Number,
    default: 0,
  },
  completedTasks: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'rule-based'],
    default: 'rule-based',
  },
  lastGeneratedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to calculate completion percentage before saving
StudyPlanSchema.pre('save', function (next) {
  if (this.tasks && this.tasks.length > 0) {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter((t) => t.isCompleted).length;
    this.progress = Math.round((this.completedTasks / this.totalTasks) * 100);
  } else {
    this.totalTasks = 0;
    this.completedTasks = 0;
    this.progress = 0;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
