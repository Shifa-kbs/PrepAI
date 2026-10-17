const mongoose = require('mongoose');
const PracticeSession = require('../models/PracticeSession');
const Question = require('../models/Question');
const QuestionProgress = require('../models/QuestionProgress');
const User = require('../models/User');

/**
 * Helper to sanitize question documents (stripping solution fields)
 */
const sanitizeQuestion = (q) => {
  if (!q) return null;
  const doc = q.toObject ? q.toObject() : { ...q };
  delete doc.correctAnswerIndex;
  delete doc.sampleAnswer;
  delete doc.explanation;
  return doc;
};

/**
 * @desc    Start or resume a practice session
 * @route   POST /api/practice/start
 * @access  Private
 */
const startSession = async (req, res, next) => {
  try {
    const {
      mode = 'topic',
      category = 'DSA',
      difficulty = 'All',
      questionCount = 10,
      timeLimitMinutes = 0,
      forceNew = false,
    } = req.body;

    // Validate questionCount as a positive integer
    let parsedCount = 10;
    if (questionCount !== undefined && questionCount !== null) {
      const num = Number(questionCount);
      if (!Number.isInteger(num) || num <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Question count must be a positive integer greater than 0',
        });
      }
      parsedCount = num;
    }
    const count = Math.min(50, parsedCount);

    // Check if user already has an active in-progress session
    const existingActive = await PracticeSession.findOne({
      user: req.user._id,
      status: 'in-progress',
    });

    if (existingActive) {
      if (!forceNew) {
        // Return existing active session with populated and sanitized questions
        const activeWithQuestions = await PracticeSession.findById(existingActive._id)
          .populate('questions')
          .lean();

        activeWithQuestions.questions = (activeWithQuestions.questions || []).map((q) =>
          sanitizeQuestion(q)
        );

        return res.status(200).json({
          success: true,
          resumed: true,
          message: 'Resuming active practice session',
          session: activeWithQuestions,
        });
      } else {
        // User explicitly wants to discard existing session
        existingActive.status = 'abandoned';
        await existingActive.save();
      }
    }

    const {
      topic,
      type,
      reviewMistakes = false,
    } = req.body;

    // Build question selection filter
    const query = {};

    if (mode === 'topic' && category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All' && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (topic && topic !== 'All' && topic !== 'all') {
      query.topic = topic;
    }

    if (type && type !== 'All' && type !== 'all') {
      query.type = type;
    }

    // Fetch candidate matching questions (excluding solutions)
    const matchingQuestions = await Question.find(query)
      .select('-correctAnswerIndex -sampleAnswer -explanation')
      .lean();

    if (!matchingQuestions || matchingQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions found matching the selected category and difficulty criteria.',
      });
    }

    const availableCount = matchingQuestions.length;
    const isPartial = availableCount < count;

    // Fisher-Yates shuffle helper
    const shuffleArray = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Load user's question progress to prioritize unattempted & review questions
    const matchingIds = matchingQuestions.map((q) => q._id);
    const userProgress = await QuestionProgress.find({
      user: req.user._id,
      question: { $in: matchingIds },
    }).lean();

    const progressMap = new Map();
    userProgress.forEach((p) => progressMap.set(p.question.toString(), p));

    const unattempted = [];
    const wrongOrAttempted = [];
    const solved = [];

    matchingQuestions.forEach((q) => {
      const prog = progressMap.get(q._id.toString());
      if (!prog || prog.attempts === 0) {
        unattempted.push(q);
      } else if (prog.status === 'attempted' || prog.incorrectAttempts > prog.correctAttempts) {
        wrongOrAttempted.push(q);
      } else {
        solved.push(q);
      }
    });

    // Sort already attempted questions so least recently attempted appear first
    const sortByLastAttempt = (a, b) => {
      const timeA = progressMap.get(a._id.toString())?.lastAttemptedAt || 0;
      const timeB = progressMap.get(b._id.toString())?.lastAttemptedAt || 0;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    };

    wrongOrAttempted.sort(sortByLastAttempt);
    solved.sort(sortByLastAttempt);

    let prioritizedPool = [];
    if (reviewMistakes) {
      // User specifically requested to review previous mistakes
      prioritizedPool = [
        ...shuffleArray(wrongOrAttempted),
        ...shuffleArray(unattempted),
        ...solved,
      ];
    } else {
      // Standard practice: prioritize fresh unattempted questions first,
      // followed by mistakes that need reinforcement, followed by solved
      prioritizedPool = [
        ...shuffleArray(unattempted),
        ...shuffleArray(wrongOrAttempted),
        ...solved,
      ];
    }

    // Ensure strictly unique questions within the session using a Set
    const seenIds = new Set();
    const selectedQuestions = [];

    for (const q of prioritizedPool) {
      const idStr = q._id.toString();
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr);
        selectedQuestions.push(q);
        if (selectedQuestions.length === count) break;
      }
    }

    const questionIds = selectedQuestions.map((q) => q._id);
    const sessionCategory = mode === 'mixed' ? 'Mixed Topics' : category;

    // Create new PracticeSession
    const session = new PracticeSession({
      user: req.user._id,
      mode,
      category: sessionCategory,
      difficulty,
      totalQuestions: selectedQuestions.length,
      requestedQuestions: count,
      timeLimitMinutes: Math.max(0, parseInt(timeLimitMinutes, 10) || 0),
      status: 'in-progress',
      questions: questionIds,
      answers: [],
      score: 0,
      accuracy: 0,
      timeTakenSeconds: 0,
      startedAt: new Date(),
    });

    await session.save();

    // Attach sanitized questions to response
    const sessionData = session.toObject();
    sessionData.questions = selectedQuestions.map((q) => sanitizeQuestion(q));

    const responseMessage = isPartial
      ? `Requested ${count} questions, but only ${availableCount} eligible question${availableCount > 1 ? 's were' : ' was'} found for ${sessionCategory}. Started session with all ${availableCount} available question${availableCount > 1 ? 's' : ''}.`
      : 'Practice session started successfully';

    return res.status(201).json({
      success: true,
      resumed: false,
      isPartial,
      requestedCount: count,
      availableCount,
      message: responseMessage,
      session: sessionData,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get currently active practice session for the logged-in user
 * @route   GET /api/practice/active
 * @access  Private
 */
const getActiveSession = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOne({
      user: req.user._id,
      status: 'in-progress',
    })
      .populate('questions')
      .lean();

    if (!session) {
      return res.status(200).json({
        success: true,
        session: null,
      });
    }

    // Check if time limit has expired (if timed)
    if (session.timeLimitMinutes > 0) {
      const elapsedSeconds = (Date.now() - new Date(session.startedAt).getTime()) / 1000;
      if (elapsedSeconds >= session.timeLimitMinutes * 60) {
        // Auto-complete the expired session
        const sessionDoc = await PracticeSession.findById(session._id);
        const correctCount = sessionDoc.answers.filter((a) => a.isCorrect).length;
        const totalAttempted = sessionDoc.answers.length;

        sessionDoc.status = 'completed';
        sessionDoc.completedAt = new Date();
        sessionDoc.timeTakenSeconds = Math.round(elapsedSeconds);
        sessionDoc.accuracy =
          totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
        sessionDoc.score = correctCount * 20;

        await sessionDoc.save();

        return res.status(200).json({
          success: true,
          session: null,
          message: 'Previous session timed out and was completed.',
        });
      }
    }

    // Sanitize questions
    session.questions = (session.questions || []).map((q) => sanitizeQuestion(q));

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get a specific practice session by ID
 * @route   GET /api/practice/:id
 * @access  Private
 */
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await PracticeSession.findById(id).lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found',
      });
    }

    // Authorization: User can only access their own session
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this practice session',
      });
    }

    // If completed: populate questions with answers/explanations for review
    // If in-progress: strictly sanitize questions
    if (session.status === 'completed') {
      const populatedSession = await PracticeSession.findById(id)
        .populate({
          path: 'questions',
          select: '+correctAnswerIndex +sampleAnswer +explanation',
        })
        .lean();

      return res.status(200).json({
        success: true,
        session: populatedSession,
      });
    } else {
      const populatedSession = await PracticeSession.findById(id)
        .populate('questions')
        .lean();

      populatedSession.questions = (populatedSession.questions || []).map((q) =>
        sanitizeQuestion(q)
      );

      return res.status(200).json({
        success: true,
        session: populatedSession,
      });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Submit an answer for a question within an active practice session
 * @route   POST /api/practice/:id/answer
 * @access  Private
 */
const submitSessionAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      questionId,
      selectedAnswerIndex,
      userAnswer = '',
      timeSpentSeconds = 0,
      markedForReview = false,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID or question ID format',
      });
    }

    const session = await PracticeSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found',
      });
    }

    // Authorization check
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit answers for this session',
      });
    }

    // State check
    if (session.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit answer. Session is already ${session.status}`,
      });
    }

    // Verify question belongs to this session
    const isQuestionInSession = session.questions.some(
      (qId) => qId.toString() === questionId.toString()
    );

    if (!isQuestionInSession) {
      return res.status(400).json({
        success: false,
        message: 'Question does not belong to this practice session',
      });
    }

    // Fetch question with correct answer for validation
    const question = await Question.findById(questionId).select(
      '+correctAnswerIndex +explanation +sampleAnswer'
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in database',
      });
    }

    const hasOptions = Array.isArray(question.options) && question.options.length > 0;
    let isCorrect = false;

    if (hasOptions) {
      if (
        typeof selectedAnswerIndex !== 'number' ||
        !Number.isInteger(selectedAnswerIndex) ||
        selectedAnswerIndex < 0 ||
        selectedAnswerIndex >= question.options.length
      ) {
        return res.status(400).json({
          success: false,
          message: 'A valid selectedAnswerIndex option is required for MCQ questions',
        });
      }
      isCorrect = selectedAnswerIndex === question.correctAnswerIndex;
    } else {
      isCorrect = true; // Conceptual self-evaluation
    }

    const parsedTime = Math.max(0, parseInt(timeSpentSeconds, 10) || 0);

    // Update or insert answer in session without duplicate entries
    const existingAnswerIdx = session.answers.findIndex(
      (a) => a.question.toString() === questionId.toString()
    );

    const answerPayload = {
      question: question._id,
      selectedOptionIndex: hasOptions ? selectedAnswerIndex : undefined,
      userAnswer: typeof userAnswer === 'string' ? userAnswer : '',
      isCorrect,
      status: isCorrect ? 'correct' : 'wrong',
      timeSpentSeconds: parsedTime,
      markedForReview: Boolean(markedForReview),
      answeredAt: new Date(),
    };

    if (existingAnswerIdx >= 0) {
      session.answers[existingAnswerIdx] = answerPayload;
    } else {
      session.answers.push(answerPayload);
    }

    // Recalculate session running metrics
    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const attemptedCount = session.answers.length;

    session.score = correctCount * 20;
    session.accuracy =
      attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    session.timeTakenSeconds = session.answers.reduce(
      (acc, curr) => acc + (curr.timeSpentSeconds || 0),
      0
    );

    await session.save();

    // Synchronize per-user QuestionProgress
    let progress = await QuestionProgress.findOne({
      user: req.user._id,
      question: question._id,
    });

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
        progress.incorrectAttempts += 1;
        if (progress.status !== 'solved') {
          progress.status = 'attempted';
        }
      }
      progress.timeSpentSeconds += parsedTime;
      progress.lastAttemptedAt = new Date();
    }
    await progress.save();

    return res.status(200).json({
      success: true,
      isCorrect,
      selectedAnswerIndex,
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation || '',
      sampleAnswer: question.sampleAnswer || '',
      sessionStats: {
        score: session.score,
        accuracy: session.accuracy,
        totalAttempted: attemptedCount,
        correctCount,
        totalQuestions: session.totalQuestions,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Toggle mark for review on a question in an active session
 * @route   PUT /api/practice/:id/review
 * @access  Private
 */
const toggleMarkForReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, markedForReview = true } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID or question ID',
      });
    }

    const session = await PracticeSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found',
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const existingAnswer = session.answers.find(
      (a) => a.question.toString() === questionId.toString()
    );

    if (existingAnswer) {
      existingAnswer.markedForReview = Boolean(markedForReview);
    } else {
      session.answers.push({
        question: questionId,
        status: 'skipped',
        markedForReview: Boolean(markedForReview),
      });
    }

    await session.save();

    return res.status(200).json({
      success: true,
      markedForReview: Boolean(markedForReview),
      message: markedForReview ? 'Question marked for review' : 'Question unflagged',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Finish/complete a practice session and generate summary
 * @route   POST /api/practice/:id/finish
 * @access  Private
 */
const finishSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID format',
      });
    }

    const session = await PracticeSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Practice session not found',
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // If already completed, return existing completed session
    if (session.status === 'completed') {
      const completedSession = await PracticeSession.findById(id)
        .populate({
          path: 'questions',
          select: '+correctAnswerIndex +sampleAnswer +explanation',
        })
        .lean();

      return res.status(200).json({
        success: true,
        session: completedSession,
        alreadyCompleted: true,
      });
    }

    const correctCount = session.answers.filter((a) => a.isCorrect).length;
    const attemptedCount = session.answers.filter((a) => a.status !== 'skipped').length;
    const wrongCount = session.answers.filter((a) => a.status === 'wrong').length;
    const skippedCount = Math.max(0, session.totalQuestions - attemptedCount);
    const reviewCount = session.answers.filter((a) => a.markedForReview).length;

    const elapsedSeconds = Math.round(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
    );

    session.status = 'completed';
    session.completedAt = new Date();
    session.timeTakenSeconds = Math.max(session.timeTakenSeconds, elapsedSeconds);
    session.accuracy =
      attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    session.score = correctCount * 20;

    await session.save();

    // Update User preparation stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.prepScore': session.score },
      $set: { 'stats.lastActiveDate': new Date() },
    });

    // Populate questions with solutions for final review
    const finishedWithSolutions = await PracticeSession.findById(id)
      .populate({
        path: 'questions',
        select: '+correctAnswerIndex +sampleAnswer +explanation',
      })
      .lean();

    return res.status(200).json({
      success: true,
      session: finishedWithSolutions,
      summary: {
        totalQuestions: session.totalQuestions,
        attemptedCount,
        correctCount,
        wrongCount,
        skippedCount,
        reviewCount,
        score: session.score,
        accuracy: session.accuracy,
        timeTakenSeconds: session.timeTakenSeconds,
      },
      message: 'Practice session completed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get practice session history for current user
 * @route   GET /api/practice/history
 * @access  Private
 */
const getSessionHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {
      user: req.user._id,
      status: 'completed',
    };

    const total = await PracticeSession.countDocuments(query);
    const sessions = await PracticeSession.find(query)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('category difficulty mode totalQuestions score accuracy timeTakenSeconds completedAt answers')
      .lean();

    // Map summary indicators for history cards
    const mappedSessions = sessions.map((s) => {
      const correctCount = (s.answers || []).filter((a) => a.isCorrect).length;
      return {
        _id: s._id,
        category: s.category,
        difficulty: s.difficulty,
        mode: s.mode,
        totalQuestions: s.totalQuestions,
        correctCount,
        score: s.score,
        accuracy: s.accuracy,
        timeTakenSeconds: s.timeTakenSeconds,
        completedAt: s.completedAt,
      };
    });

    return res.status(200).json({
      success: true,
      sessions: mappedSessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Abandon active session
 * @route   POST /api/practice/abandon
 * @access  Private
 */
const abandonActiveSession = async (req, res, next) => {
  try {
    const session = await PracticeSession.findOneAndUpdate(
      { user: req.user._id, status: 'in-progress' },
      { $set: { status: 'abandoned' } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: session ? 'Active session abandoned' : 'No active session to abandon',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  startSession,
  getActiveSession,
  getSessionById,
  submitSessionAnswer,
  toggleMarkForReview,
  finishSession,
  getSessionHistory,
  abandonActiveSession,
};
