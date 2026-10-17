const mongoose = require('mongoose');

const generateSlug = (title, category) => {
  const base = `${category || 'general'}-${title || 'question'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base;
};

const QuestionSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Question title is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'DSA',
      'Java',
      'Python',
      'SQL',
      'DBMS',
      'Operating Systems',
      'Computer Networks',
      'OOP',
      'JavaScript',
      'React',
      'Web Development',
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
      'HR',
    ],
    index: true,
  },
  topic: {
    type: String,
    trim: true,
    default: '',
    index: true,
  },
  subtopic: {
    type: String,
    trim: true,
    default: '',
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    index: true,
  },
  companyTags: [{ type: String, index: true }],
  tags: [{ type: String, index: true }],
  description: {
    type: String,
    required: [true, 'Question description is required'],
  },
  codeTemplate: {
    type: String,
    default: '',
  },
  sampleAnswer: {
    type: String,
    required: [true, 'Sample answer is required'],
    select: false, // Protected: never returned to student by default
  },
  explanation: {
    type: String,
    select: false, // Protected: never returned to student by default
  },
  options: [{ type: String }],
  correctAnswerIndex: {
    type: Number,
    select: false, // Protected: never returned to student by default
  },
  type: {
    type: String,
    enum: ['conceptual', 'coding', 'mcq', 'sql', 'output-prediction', 'scenario'],
    default: 'conceptual',
    index: true,
  },
  constraints: [{ type: String }],
  examples: [
    {
      input: { type: String, default: '' },
      output: { type: String, default: '' },
      explanation: { type: String, default: '' },
    },
  ],
  testCases: [
    {
      input: { type: String, default: '' },
      expectedOutput: { type: String, default: '' },
      isHidden: { type: Boolean, default: false },
    },
  ],
  source: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate slug before validation if missing
QuestionSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title, this.category);
  }
  next();
});

// Compound indexes for optimal query performance
QuestionSchema.index({ category: 1, difficulty: 1 });
QuestionSchema.index({ category: 1, topic: 1 });
QuestionSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('Question', QuestionSchema);

