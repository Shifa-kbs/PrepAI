const mongoose = require('mongoose');
const Question = require('../models/Question');
const QuestionProgress = require('../models/QuestionProgress');
const User = require('../models/User');

// Helper to safely escape regex characters
const escapeRegex = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Get paginated questions with search and filters
 * @route   GET /api/questions
 * @access  Public / Optional Auth
 */
const getQuestions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      difficulty,
      company,
      status,
      saved,
    } = req.query;

    const query = {};

    // 1. Category Filter
    if (category && category !== 'all') {
      const validCategories = [
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
      ];
      if (validCategories.includes(category)) {
        query.category = category;
      }
    }

    // 2. Difficulty Filter
    if (difficulty && difficulty !== 'all') {
      const validDifficulties = ['Easy', 'Medium', 'Hard'];
      if (validDifficulties.includes(difficulty)) {
        query.difficulty = difficulty;
      }
    }

    // 3. Company Tag Filter
    if (company && company !== 'all') {
      const sanitizedCompany = escapeRegex(company.trim());
      query.companyTags = { $regex: new RegExp(`^${sanitizedCompany}$`, 'i') };
    }

    // 4. Search Filter (by title or description)
    if (search && search.trim() !== '') {
      const sanitizedSearch = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    // 5. User Progress & Bookmark Filters (requires authenticated user)
    let userBookmarksSet = new Set();
    let userProgressMap = new Map();

    if (req.user) {
      // Load user bookmarks
      if (Array.isArray(req.user.bookmarks)) {
        req.user.bookmarks.forEach((bId) => {
          userBookmarksSet.add(bId.toString());
        });
      }

      // Load user progress records
      const progressDocs = await QuestionProgress.find({ user: req.user._id }).lean();
      progressDocs.forEach((p) => {
        userProgressMap.set(p.question.toString(), p);
        if (p.isBookmarked) {
          userBookmarksSet.add(p.question.toString());
        }
      });

      // Filter by Solved Status
      if (status && status !== 'all') {
        const solvedIds = [];
        const attemptedIds = [];
        const allProgressIds = [];

        progressDocs.forEach((p) => {
          const qIdStr = p.question.toString();
          allProgressIds.push(new mongoose.Types.ObjectId(qIdStr));
          if (p.status === 'solved') {
            solvedIds.push(new mongoose.Types.ObjectId(qIdStr));
          } else if (p.status === 'attempted') {
            attemptedIds.push(new mongoose.Types.ObjectId(qIdStr));
          }
        });

        if (status === 'solved') {
          query._id = { $in: solvedIds };
        } else if (status === 'attempted') {
          query._id = { $in: attemptedIds };
        } else if (status === 'unsolved') {
          // Questions with no progress or neither solved nor attempted
          query._id = { $nin: allProgressIds };
        }
      }

      // Filter by Saved/Bookmarked Status
      if (saved === 'true' || saved === 'saved') {
        const bookmarkedObjectIds = Array.from(userBookmarksSet).map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        if (query._id && query._id.$in) {
          // Intersect with existing $in if status filter was also set
          const existingInStrs = new Set(query._id.$in.map((id) => id.toString()));
          query._id = {
            $in: bookmarkedObjectIds.filter((bId) => existingInStrs.has(bId.toString())),
          };
        } else if (query._id && query._id.$nin) {
          query._id = {
            $in: bookmarkedObjectIds,
            $nin: query._id.$nin,
          };
        } else {
          query._id = { $in: bookmarkedObjectIds };
        }
      } else if (saved === 'false') {
        const bookmarkedObjectIds = Array.from(userBookmarksSet).map(
          (id) => new mongoose.Types.ObjectId(id)
        );
        if (query._id && query._id.$in) {
          query._id = {
            $in: query._id.$in,
            $nin: bookmarkedObjectIds,
          };
        } else {
          query._id = { $nin: bookmarkedObjectIds };
        }
      }
    } else {
      // If guest user filters by status or saved, return empty since they have no progress
      if ((status && status !== 'all') || saved === 'true' || saved === 'saved') {
        return res.status(200).json({
          success: true,
          questions: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      }
    }

    // Execute Query
    // IMPORTANT: sampleAnswer, explanation, and correctAnswerIndex are excluded by schema select: false
    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map questions with sanitization & attach user progress
    const sanitizedQuestions = questions.map((q) => {
      // Ensure sensitive fields are strictly stripped
      delete q.sampleAnswer;
      delete q.explanation;
      delete q.correctAnswerIndex;

      const qIdStr = q._id.toString();
      const progress = userProgressMap.get(qIdStr);
      const isBookmarked = userBookmarksSet.has(qIdStr);

      return {
        ...q,
        userProgress: progress
          ? {
              status: progress.status,
              attempts: progress.attempts,
              correctAttempts: progress.correctAttempts,
              incorrectAttempts: progress.incorrectAttempts,
              isBookmarked: Boolean(isBookmarked || progress.isBookmarked),
              notes: progress.notes || '',
              lastAttemptedAt: progress.lastAttemptedAt,
            }
          : {
              status: 'unsolved',
              attempts: 0,
              correctAttempts: 0,
              incorrectAttempts: 0,
              isBookmarked: Boolean(isBookmarked),
              notes: '',
              lastAttemptedAt: null,
            },
      };
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      questions: sanitizedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get dynamic filters (categories, difficulties, companyTags)
 * @route   GET /api/questions/filters
 * @access  Public
 */
const getQuestionFilters = async (req, res, next) => {
  try {
    const categories = [
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
    ];
    const difficulties = ['Easy', 'Medium', 'Hard'];

    const companyTags = await Question.distinct('companyTags');
    companyTags.sort();

    return res.status(200).json({
      success: true,
      categories,
      difficulties,
      companies: companyTags,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Public / Optional Auth
 */
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format',
      });
    }

    // Default fetch: sensitive fields (sampleAnswer, explanation, correctAnswerIndex) are NOT selected
    const questionDoc = await Question.findById(id).lean();

    if (!questionDoc) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    let userProgress = null;
    let isBookmarked = false;
    let hasAttempted = false;

    if (req.user) {
      // Check bookmarks
      if (Array.isArray(req.user.bookmarks)) {
        isBookmarked = req.user.bookmarks.some((bId) => bId.toString() === id);
      }

      // Check progress
      const progress = await QuestionProgress.findOne({
        user: req.user._id,
        question: id,
      }).lean();

      if (progress) {
        userProgress = {
          status: progress.status,
          attempts: progress.attempts,
          correctAttempts: progress.correctAttempts,
          incorrectAttempts: progress.incorrectAttempts,
          timeSpentSeconds: progress.timeSpentSeconds,
          notes: progress.notes || '',
          lastAttemptedAt: progress.lastAttemptedAt,
          isBookmarked: Boolean(isBookmarked || progress.isBookmarked),
        };
        if (progress.attempts > 0) {
          hasAttempted = true;
        }
      } else {
        userProgress = {
          status: 'unsolved',
          attempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          timeSpentSeconds: 0,
          notes: '',
          lastAttemptedAt: null,
          isBookmarked,
        };
      }
    }

    // Strictly ensure answer-sensitive fields are omitted before user submission
    delete questionDoc.sampleAnswer;
    delete questionDoc.explanation;
    delete questionDoc.correctAnswerIndex;

    // If the authenticated user has already submitted this question in the past,
    // we can provide explanation and sampleAnswer so they can review their completed work
    if (hasAttempted) {
      const solutionDoc = await Question.findById(id)
        .select('+explanation +sampleAnswer +correctAnswerIndex')
        .lean();
      questionDoc.explanation = solutionDoc.explanation;
      questionDoc.sampleAnswer = solutionDoc.sampleAnswer;
      questionDoc.correctAnswerIndex = solutionDoc.correctAnswerIndex;
    }

    return res.status(200).json({
      success: true,
      question: questionDoc,
      userProgress,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Submit answer to a question
 * @route   POST /api/questions/:id/submit
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { selectedAnswerIndex, action, revealSolution, timeSpentSeconds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format',
      });
    }

    const isRevealAction = action === 'reveal' || Boolean(revealSolution);

    if (
      !isRevealAction &&
      (typeof selectedAnswerIndex !== 'number' ||
        !Number.isInteger(selectedAnswerIndex) ||
        selectedAnswerIndex < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'selectedAnswerIndex must be a non-negative integer',
      });
    }

    // Securely retrieve the question with correct answer and explanation
    const question = await Question.findById(id).select(
      '+correctAnswerIndex +explanation +sampleAnswer'
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    if (
      !isRevealAction &&
      Array.isArray(question.options) &&
      question.options.length > 0 &&
      selectedAnswerIndex >= question.options.length
    ) {
      return res.status(400).json({
        success: false,
        message: `Selected answer index ${selectedAnswerIndex} is out of bounds (0-${question.options.length - 1})`,
      });
    }

    const isCorrect = !isRevealAction && selectedAnswerIndex === question.correctAnswerIndex;
    const parsedTime = typeof timeSpentSeconds === 'number' && timeSpentSeconds > 0
      ? Math.round(timeSpentSeconds)
      : 0;

    // Find or create user's QuestionProgress
    let progress = await QuestionProgress.findOne({
      user: req.user._id,
      question: question._id,
    });

    const wasAlreadySolved = progress?.status === 'solved';

    if (!progress) {
      progress = new QuestionProgress({
        user: req.user._id,
        question: question._id,
        status: isCorrect ? 'solved' : 'attempted',
        attempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        incorrectAttempts: isCorrect ? 0 : 1,
        timeSpentSeconds: parsedTime,
        lastAttemptedAt: new Date(),
      });
    } else {
      progress.attempts += 1;
      if (isCorrect) {
        progress.correctAttempts += 1;
        progress.status = 'solved';
      } else {
        if (!isRevealAction) {
          progress.incorrectAttempts += 1;
        }
        if (progress.status !== 'solved') {
          progress.status = 'attempted';
        }
      }
      progress.timeSpentSeconds += parsedTime;
      progress.lastAttemptedAt = new Date();
    }

    await progress.save();

    // Update user stats if solved for the first time
    if (isCorrect && !wasAlreadySolved) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'stats.questionsSolved': 1,
          'stats.prepScore': 20,
        },
      });
    }

    return res.status(200).json({
      success: true,
      isCorrect,
      isRevealed: isRevealAction,
      selectedAnswerIndex: isRevealAction ? undefined : selectedAnswerIndex,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation || '',
      sampleAnswer: question.sampleAnswer || '',
      progress: {
        status: progress.status,
        attempts: progress.attempts,
        correctAttempts: progress.correctAttempts,
        incorrectAttempts: progress.incorrectAttempts,
        timeSpentSeconds: progress.timeSpentSeconds,
        notes: progress.notes || '',
        lastAttemptedAt: progress.lastAttemptedAt,
        isBookmarked: Boolean(progress.isBookmarked),
      },
      message: isRevealAction
        ? 'Solution revealed. Review the explanation and sample solution below.'
        : isCorrect
        ? 'Correct answer! Great job.'
        : 'Incorrect answer. Review the explanation below.',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Toggle bookmark for a question
 * @route   POST /api/questions/:id/bookmark
 * @access  Private
 */
const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format',
      });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const user = await User.findById(req.user._id);
    const qObjectId = new mongoose.Types.ObjectId(id);

    const isCurrentlyBookmarked = user.bookmarks.some(
      (bId) => bId.toString() === id
    );

    let nextBookmarkedState = !isCurrentlyBookmarked;

    if (isCurrentlyBookmarked) {
      user.bookmarks = user.bookmarks.filter((bId) => bId.toString() !== id);
    } else {
      user.bookmarks.push(qObjectId);
    }

    await user.save();

    // Sync isBookmarked on QuestionProgress if it exists or upsert it
    await QuestionProgress.findOneAndUpdate(
      { user: req.user._id, question: qObjectId },
      { $set: { isBookmarked: nextBookmarkedState } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      isBookmarked: nextBookmarkedState,
      message: nextBookmarkedState
        ? 'Question bookmarked successfully'
        : 'Question removed from bookmarks',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update notes for a question
 * @route   PUT /api/questions/:id/notes
 * @access  Private
 */
const updateNotes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format',
      });
    }

    if (typeof notes !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Notes must be a string',
      });
    }

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const progress = await QuestionProgress.findOneAndUpdate(
      { user: req.user._id, question: id },
      { $set: { notes: notes.trim() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      notes: progress.notes,
      message: 'Notes saved successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get current user progress for a question
 * @route   GET /api/questions/:id/progress
 * @access  Private
 */
const getQuestionProgress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Question ID format',
      });
    }

    const progress = await QuestionProgress.findOne({
      user: req.user._id,
      question: id,
    });

    const isBookmarked = Array.isArray(req.user.bookmarks)
      ? req.user.bookmarks.some((bId) => bId.toString() === id)
      : false;

    return res.status(200).json({
      success: true,
      progress: progress || {
        status: 'unsolved',
        attempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        timeSpentSeconds: 0,
        notes: '',
        lastAttemptedAt: null,
        isBookmarked,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getQuestions,
  getQuestionFilters,
  getQuestionById,
  submitAnswer,
  toggleBookmark,
  updateNotes,
  getQuestionProgress,
};
