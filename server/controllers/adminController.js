const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const PracticeSession = require('../models/PracticeSession');
const MockInterview = require('../models/MockInterview');
const QuestionProgress = require('../models/QuestionProgress');

/**
 * @desc    Get platform-wide statistics from real database records
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });

    const totalQuestions = await Question.countDocuments();
    const totalPracticeSessions = await PracticeSession.countDocuments();
    const completedPracticeSessions = await PracticeSession.countDocuments({ status: 'completed' });

    const totalMockInterviews = await MockInterview.countDocuments();
    const completedMockInterviews = await MockInterview.countDocuments({ status: 'completed' });

    const completedInterviewDocs = await MockInterview.find({ status: 'completed' }, 'overallScore').lean();
    const averageScore = completedInterviewDocs.length > 0
      ? Math.round(
          completedInterviewDocs.reduce((acc, m) => acc + (m.overallScore || 0), 0) /
            completedInterviewDocs.length
        )
      : 0;

    // Category distribution of questions
    const categoryCounts = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Difficulty distribution
    const difficultyCounts = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    // User roles breakdown
    const roleCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const statsData = {
      users: {
        total: totalUsers,
        students,
        admins,
      },
      questions: {
        total: totalQuestions,
      },
      practiceSessions: {
        total: totalPracticeSessions,
        completed: completedPracticeSessions,
      },
      mockInterviews: {
        total: totalMockInterviews,
        completed: completedMockInterviews,
        averageScore,
      },
      categoryCounts: categoryCounts.map((c) => ({ category: c._id, count: c.count })),
      difficultyCounts: difficultyCounts.map((d) => ({ difficulty: d._id, count: d.count })),
      roleCounts: roleCounts.map((r) => ({ role: r._id, count: r.count })),
    };

    return res.status(200).json({
      success: true,
      stats: statsData,
      data: statsData,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get paginated users with safe search (strictly excluding sensitive credentials)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search = '', role } = req.query;
    const query = {};

    if (search.trim()) {
      const escaped = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (role && (role === 'student' || role === 'admin')) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password -resetPasswordToken -resetPasswordExpire') // Strictly sanitize sensitive credentials
      .lean();

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update a user's role (with self-demotion prevention)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    if (!role || !['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be student or admin',
      });
    }

    // Safety: Prevent admin from demoting or removing their own admin access
    if (req.user._id.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot modify their own administrative access',
      });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    targetUser.role = role;
    await targetUser.save();

    const sanitizedUser = targetUser.toObject();
    delete sanitizedUser.password;
    delete sanitizedUser.resetPasswordToken;
    delete sanitizedUser.resetPasswordExpire;

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: sanitizedUser,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get questions for admin management (including solution fields)
 * @route   GET /api/admin/questions
 * @access  Private (Admin only)
 */
const getAdminQuestions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search = '', category, difficulty } = req.query;
    const query = {};

    if (search.trim()) {
      const escaped = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      query.$or = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
      ];
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All' && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('+sampleAnswer +explanation +correctAnswerIndex')
      .lean();

    return res.status(200).json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Create new question in question bank
 * @route   POST /api/admin/questions
 * @access  Private (Admin only)
 */
const createQuestion = async (req, res, next) => {
  try {
    const {
      title,
      category,
      difficulty,
      description,
      sampleAnswer,
      explanation = '',
      options = [],
      correctAnswerIndex,
      type = 'conceptual',
      companyTags = [],
      codeTemplate = '',
    } = req.body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question title is required' });
    }

    const validCategories = [
      'DSA', 'Java', 'Python', 'SQL', 'DBMS', 'Operating Systems',
      'Computer Networks', 'OOP', 'JavaScript', 'React', 'HR'
    ];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Difficulty must be Easy, Medium, or Hard' });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question description is required' });
    }

    if (!sampleAnswer || typeof sampleAnswer !== 'string' || sampleAnswer.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Sample answer is required' });
    }

    if (type === 'mcq') {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ success: false, message: 'MCQ questions require at least 2 options' });
      }
      if (typeof correctAnswerIndex !== 'number' || correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
        return res.status(400).json({
          success: false,
          message: 'Valid correctAnswerIndex is required for MCQ questions',
        });
      }
    }

    const question = new Question({
      title: title.trim(),
      category,
      difficulty,
      description: description.trim(),
      sampleAnswer: sampleAnswer.trim(),
      explanation: explanation ? explanation.trim() : '',
      options: Array.isArray(options) ? options : [],
      correctAnswerIndex: typeof correctAnswerIndex === 'number' ? correctAnswerIndex : undefined,
      type,
      companyTags: Array.isArray(companyTags) ? companyTags : [],
      codeTemplate: codeTemplate ? codeTemplate.trim() : '',
      createdBy: req.user._id,
    });

    await question.save();

    return res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question,
      data: question,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update question by ID
 * @route   PUT /api/admin/questions/:id
 * @access  Private (Admin only)
 */
const updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const question = await Question.findById(id).select('+sampleAnswer +explanation +correctAnswerIndex');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const {
      title,
      category,
      difficulty,
      description,
      sampleAnswer,
      explanation,
      options,
      correctAnswerIndex,
      type,
      companyTags,
      codeTemplate,
    } = req.body;

    if (title !== undefined) question.title = title.trim();
    if (category !== undefined) question.category = category;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (description !== undefined) question.description = description.trim();
    if (sampleAnswer !== undefined) question.sampleAnswer = sampleAnswer.trim();
    if (explanation !== undefined) question.explanation = explanation.trim();
    if (options !== undefined) question.options = options;
    if (correctAnswerIndex !== undefined) question.correctAnswerIndex = correctAnswerIndex;
    if (type !== undefined) question.type = type;
    if (companyTags !== undefined) question.companyTags = companyTags;
    if (codeTemplate !== undefined) question.codeTemplate = codeTemplate;

    await question.save();

    return res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question,
      data: question,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Delete question by ID
 * @route   DELETE /api/admin/questions/:id
 * @access  Private (Admin only)
 */
const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid question ID' });
    }

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      id,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPlatformStats,
  getUsers,
  updateUserRole,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
