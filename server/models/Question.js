const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
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
      'HR',
    ],
    index: true,
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    index: true,
  },
  companyTags: [{ type: String, index: true }],
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
    enum: ['conceptual', 'coding', 'mcq'],
    default: 'conceptual',
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

module.exports = mongoose.model('Question', QuestionSchema);
