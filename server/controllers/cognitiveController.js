const CognitiveSession = require('../models/CognitiveSession');
const User = require('../models/User');

const DISCLAIMER_TEXT =
  'This cognitive assessment is for practice, cognitive agility training, and personal aptitude tracking only. It does not represent a standardized clinical, medical, or psychological IQ evaluation.';

/**
 * @desc    Submit a completed cognitive assessment session
 * @route   POST /api/cognitive/session
 * @access  Private
 */
const submitCognitiveSession = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Support both flat fields and nested scores/mode payloads
    const {
      activityType,
      mode,
      durationSeconds,
      timeSpentSeconds,
      scores = {},
      metadata = {},
    } = req.body;

    const resolvedMode = mode || activityType || 'full-battery';
    const normalizedActivityType = resolvedMode === 'battery' ? 'full-battery' : resolvedMode;

    const clamp = (val, max = 100) => Math.max(0, Math.min(max, Math.round(Number(val) || 0)));

    // Extract scores whether passed nested in scores object or at top level
    const overallScore = clamp(
      req.body.overallScore ??
      req.body.compositeScore ??
      scores.compositeScore ??
      scores.overallScore ??
      0
    );

    const digitSpanScore = clamp(
      req.body.digitSpanScore ??
      scores.digitSpan?.score ??
      scores.digitSpanScore ??
      0
    );

    const maxDigitSpan = Math.max(
      0,
      Math.round(
        Number(
          req.body.maxDigitSpan ??
          scores.digitSpan?.maxSpanForward ??
          scores.digitSpan?.maxSpan ??
          0
        ) || 0
      )
    );

    const patternScore = clamp(
      req.body.patternScore ??
      scores.patternRecognition?.score ??
      scores.patternScore ??
      0
    );

    const correctPatterns = Math.max(
      0,
      Math.round(
        Number(
          req.body.correctPatterns ??
          scores.patternRecognition?.correctQuestions ??
          scores.patternRecognition?.correctCount ??
          0
        ) || 0
      )
    );

    const totalPatterns = Math.max(
      1,
      Math.round(
        Number(
          req.body.totalPatterns ??
          scores.patternRecognition?.totalQuestions ??
          5
        ) || 5
      )
    );

    const estimationScore = clamp(
      req.body.estimationScore ??
      scores.numericalEstimation?.score ??
      scores.estimationScore ??
      0
    );

    const correctEstimations = Math.max(
      0,
      Math.round(
        Number(
          req.body.correctEstimations ??
          scores.numericalEstimation?.correctQuestions ??
          scores.numericalEstimation?.correctCount ??
          0
        ) || 0
      )
    );

    const totalEstimations = Math.max(
      1,
      Math.round(
        Number(
          req.body.totalEstimations ??
          scores.numericalEstimation?.totalQuestions ??
          8
        ) || 8
      )
    );

    const elapsedSeconds = Math.max(
      0,
      Math.round(Number(timeSpentSeconds ?? durationSeconds ?? 0) || 0)
    );

    const session = await CognitiveSession.create({
      user: userId,
      activityType: normalizedActivityType,
      mode: resolvedMode,
      digitSpanScore,
      maxDigitSpan,
      patternScore,
      correctPatterns,
      totalPatterns,
      estimationScore,
      correctEstimations,
      totalEstimations,
      overallScore,
      compositeScore: overallScore,
      scores,
      metadata,
      timeSpentSeconds: elapsedSeconds,
    });

    // Update user's lastActiveDate
    await User.findByIdAndUpdate(userId, {
      $set: { 'stats.lastActiveDate': new Date() },
    });

    const responseData = {
      ...session.toObject(),
      compositeScore: session.compositeScore || session.overallScore,
      overallScore: session.overallScore || session.compositeScore,
      mode: session.mode || session.activityType,
    };

    return res.status(201).json({
      success: true,
      message: 'Cognitive assessment completed and saved successfully.',
      disclaimer: DISCLAIMER_TEXT,
      session: responseData,
      data: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get user's cognitive assessment history
 * @route   GET /api/cognitive/history
 * @access  Private
 */
const getCognitiveHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      CognitiveSession.find({ user: userId })
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CognitiveSession.countDocuments({ user: userId }),
    ]);

    const sanitizedSessions = sessions.map((s) => ({
      ...s,
      compositeScore: s.compositeScore || s.overallScore,
      overallScore: s.overallScore || s.compositeScore,
      mode: s.mode || s.activityType,
    }));

    return res.status(200).json({
      success: true,
      disclaimer: DISCLAIMER_TEXT,
      sessions: sanitizedSessions,
      data: sanitizedSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get cognitive assessment aggregate statistics
 * @route   GET /api/cognitive/stats
 * @access  Private
 */
const getCognitiveStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await CognitiveSession.find({ user: userId }).lean();

    if (sessions.length === 0) {
      const emptyStats = {
        totalSessions: 0,
        avgOverallScore: 0,
        avgCompositeScore: 0,
        bestOverallScore: 0,
        bestCompositeScore: 0,
        bestDigitSpan: 0,
        avgDigitSpanScore: 0,
        avgPatternScore: 0,
        avgEstimationScore: 0,
      };
      return res.status(200).json({
        success: true,
        disclaimer: DISCLAIMER_TEXT,
        stats: emptyStats,
        data: emptyStats,
      });
    }

    const totalSessions = sessions.length;
    const avgOverallScore = Math.round(
      sessions.reduce((acc, s) => acc + (s.overallScore || s.compositeScore || 0), 0) / totalSessions
    );
    const bestOverallScore = Math.max(
      ...sessions.map((s) => s.overallScore || s.compositeScore || 0)
    );
    const bestDigitSpan = Math.max(...sessions.map((s) => s.maxDigitSpan || 0));

    const avgDigitSpanScore = Math.round(
      sessions.reduce((acc, s) => acc + (s.digitSpanScore || 0), 0) / totalSessions
    );
    const avgPatternScore = Math.round(
      sessions.reduce((acc, s) => acc + (s.patternScore || 0), 0) / totalSessions
    );
    const avgEstimationScore = Math.round(
      sessions.reduce((acc, s) => acc + (s.estimationScore || 0), 0) / totalSessions
    );

    const statsData = {
      totalSessions,
      avgOverallScore,
      avgCompositeScore: avgOverallScore,
      bestOverallScore,
      bestCompositeScore: bestOverallScore,
      bestDigitSpan,
      avgDigitSpanScore,
      avgPatternScore,
      avgEstimationScore,
    };

    return res.status(200).json({
      success: true,
      disclaimer: DISCLAIMER_TEXT,
      stats: statsData,
      data: statsData,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  submitCognitiveSession,
  getCognitiveHistory,
  getCognitiveStats,
};
