const mongoose = require('mongoose');
const MockInterview = require('../models/MockInterview');
const User = require('../models/User');
const aiInterviewService = require('../services/aiInterviewService');

/**
 * @desc    Start or resume an AI mock interview
 * @route   POST /api/interview/start
 * @access  Private
 */
const startInterview = async (req, res, next) => {
  try {
    const {
      jobRole = 'Full Stack Developer',
      interviewType = 'Mixed',
      difficulty = 'Medium',
      experienceLevel = 'Fresher (0-1 yrs)',
      topics = [],
      questionCount = 5,
      forceNew = false,
    } = req.body;

    // 1. Validation
    if (!jobRole || typeof jobRole !== 'string' || jobRole.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job role is required and must be a valid text string',
      });
    }

    const countNum = Number(questionCount);
    if (!Number.isInteger(countNum) || countNum < 1 || countNum > 10) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be a positive integer between 1 and 10',
      });
    }

    const validTypes = ['Technical', 'Behavioral', 'HR', 'Mixed'];
    const normalizedType = interviewType === 'HR' ? 'Behavioral' : interviewType;
    if (!validTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: 'Interview type must be Technical, Behavioral, or Mixed',
      });
    }

    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be Easy, Medium, or Hard',
      });
    }

    // 2. Active Session Management
    const existingActive = await MockInterview.findOne({
      user: req.user._id,
      status: 'in-progress',
    });

    if (existingActive) {
      if (!forceNew) {
        return res.status(200).json({
          success: true,
          resumed: true,
          message: 'Resuming active mock interview',
          interview: existingActive,
        });
      } else {
        existingActive.status = 'abandoned';
        await existingActive.save();
      }
    }

    // Parse topics array
    let normalizedTopics = [];
    if (Array.isArray(topics)) {
      normalizedTopics = topics.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof topics === 'string' && topics.trim()) {
      normalizedTopics = topics.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // 3. Generate Questions using AI Service
    let generatedQuestions;
    try {
      generatedQuestions = await aiInterviewService.generateInterviewQuestions({
        jobRole: jobRole.trim(),
        interviewType: normalizedType,
        difficulty,
        experienceLevel,
        topics: normalizedTopics,
        questionCount: countNum,
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'AI Provider failed to generate interview questions. Please retry.',
      });
    }

    // 4. Create and Persist MockInterview
    const interview = new MockInterview({
      user: req.user._id,
      jobRole: jobRole.trim(),
      experienceLevel,
      interviewType: normalizedType,
      difficulty,
      topics: normalizedTopics,
      totalQuestions: generatedQuestions.length,
      currentQuestionIndex: 0,
      overallScore: 0,
      questions: generatedQuestions.map((q) => ({
        questionText: q.questionText,
        category: q.category,
        difficulty: q.difficulty || difficulty,
        contextHint: q.contextHint || '',
        userAnswer: '',
        score: 0,
        status: 'unanswered',
      })),
      status: 'in-progress',
      startedAt: new Date(),
    });

    await interview.save();

    return res.status(201).json({
      success: true,
      resumed: false,
      message: 'AI Mock Interview session generated successfully',
      interview,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get current in-progress mock interview for logged-in user
 * @route   GET /api/interview/active
 * @access  Private
 */
const getActiveInterview = async (req, res, next) => {
  try {
    const interview = await MockInterview.findOne({
      user: req.user._id,
      status: 'in-progress',
    }).lean();

    return res.status(200).json({
      success: true,
      interview: interview || null,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get specific mock interview by ID
 * @route   GET /api/interview/:id
 * @access  Private
 */
const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const interview = await MockInterview.findById(id).lean();

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found',
      });
    }

    // User ownership verification
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this mock interview',
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Submit candidate answer for the current question and evaluate with AI
 * @route   POST /api/interview/:id/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex, userAnswer = '' } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const interview = await MockInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found',
      });
    }

    // Ownership check
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit answers for this interview',
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot submit answer. Interview is already ${interview.status}`,
      });
    }

    const qIdx = Number(questionIndex);
    if (!Number.isInteger(qIdx) || qIdx < 0 || qIdx >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid questionIndex. Must be between 0 and ${interview.questions.length - 1}`,
      });
    }

    const targetQuestion = interview.questions[qIdx];

    // Evaluate answer using AI Service
    let evaluationResult;
    try {
      evaluationResult = await aiInterviewService.evaluateAnswer({
        jobRole: interview.jobRole,
        interviewType: interview.interviewType,
        difficulty: targetQuestion.difficulty || interview.difficulty,
        questionText: targetQuestion.questionText,
        category: targetQuestion.category,
        userAnswer: typeof userAnswer === 'string' ? userAnswer : '',
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'AI evaluation failed. Please retry submitting your answer.',
      });
    }

    // Duplicate submission protection: update target question in-place without duplicating entries
    targetQuestion.userAnswer = typeof userAnswer === 'string' ? userAnswer.trim() : '';
    targetQuestion.score = evaluationResult.overallScore;
    targetQuestion.relevanceScore = evaluationResult.relevanceScore;
    targetQuestion.clarityScore = evaluationResult.clarityScore;
    targetQuestion.depthScore = evaluationResult.depthScore;
    targetQuestion.aiFeedback = evaluationResult.feedback;
    targetQuestion.strengths = evaluationResult.strengths || [];
    targetQuestion.weaknesses = evaluationResult.weaknesses || [];
    targetQuestion.suggestedImprovements = evaluationResult.suggestedImprovements || [];
    targetQuestion.followUpQuestion = evaluationResult.followUpQuestion || null;
    targetQuestion.status = 'answered';
    targetQuestion.answeredAt = new Date();

    // Check if an AI follow-up question should be added and interview length allows it (max 10 questions)
    if (
      evaluationResult.followUpQuestion &&
      !targetQuestion.isFollowUp &&
      interview.questions.length < 10 &&
      qIdx === interview.questions.length - 1
    ) {
      interview.questions.push({
        questionText: evaluationResult.followUpQuestion,
        category: targetQuestion.category,
        difficulty: targetQuestion.difficulty || interview.difficulty,
        contextHint: 'Follow-up exploration: expand on your previous answer with greater technical depth.',
        userAnswer: '',
        score: 0,
        status: 'unanswered',
        isFollowUp: true,
      });
      interview.totalQuestions = interview.questions.length;
    }

    // Recalculate average overallScore across answered questions
    const answered = interview.questions.filter((q) => q.status === 'answered');
    if (answered.length > 0) {
      interview.overallScore = Math.round(
        answered.reduce((acc, curr) => acc + (curr.score || 0), 0) / answered.length
      );
    }

    // Advance question index
    interview.currentQuestionIndex = Math.min(interview.questions.length, qIdx + 1);

    await interview.save();

    const isFinished = interview.currentQuestionIndex >= interview.questions.length;

    return res.status(200).json({
      success: true,
      evaluation: evaluationResult,
      questionIndex: qIdx,
      nextQuestionIndex: interview.currentQuestionIndex,
      isFinished,
      interview,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Skip the current question in an active mock interview
 * @route   POST /api/interview/:id/skip
 * @access  Private
 */
const skipQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const interview = await MockInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found',
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Interview is already ${interview.status}`,
      });
    }

    const qIdx = Number(questionIndex);
    if (!Number.isInteger(qIdx) || qIdx < 0 || qIdx >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid questionIndex',
      });
    }

    interview.questions[qIdx].status = 'skipped';
    interview.questions[qIdx].userAnswer = '[Skipped by candidate]';
    interview.questions[qIdx].score = 0;
    interview.currentQuestionIndex = Math.min(interview.questions.length, qIdx + 1);

    await interview.save();

    const isFinished = interview.currentQuestionIndex >= interview.questions.length;

    return res.status(200).json({
      success: true,
      message: 'Question skipped',
      nextQuestionIndex: interview.currentQuestionIndex,
      isFinished,
      interview,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Finish/complete the mock interview and generate comprehensive final report
 * @route   POST /api/interview/:id/finish
 * @access  Private
 */
const finishInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const interview = await MockInterview.findById(id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found',
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Idempotent: If already completed, return existing report
    if (interview.status === 'completed') {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true,
        interview,
        report: interview.finalReport,
      });
    }

    // Mark remaining unanswered questions as skipped
    interview.questions.forEach((q) => {
      if (q.status === 'unanswered') {
        q.status = 'skipped';
        q.userAnswer = '[Skipped / Unanswered]';
        q.score = 0;
      }
    });

    // Generate Comprehensive Final Report with AI
    let finalReport;
    try {
      finalReport = await aiInterviewService.generateFinalReport({
        jobRole: interview.jobRole,
        interviewType: interview.interviewType,
        difficulty: interview.difficulty,
        experienceLevel: interview.experienceLevel,
        questions: interview.questions,
      });
    } catch (aiErr) {
      return res.status(503).json({
        success: false,
        message: aiErr.message || 'AI synthesis failed for the final report. Please retry finishing the interview.',
      });
    }

    // Save final report into interview document
    interview.finalReport = {
      overallScore: finalReport.overallScore,
      technicalKnowledge: finalReport.technicalKnowledge,
      answerRelevance: finalReport.answerRelevance,
      problemSolving: finalReport.problemSolving,
      communicationClarity: finalReport.communicationClarity,
      evaluationStatus: finalReport.evaluationStatus || (finalReport.overallScore === null ? 'Not Evaluated' : 'Completed'),
      answeredCount: finalReport.answeredCount ?? 0,
      skippedCount: finalReport.skippedCount ?? 0,
      totalQuestions: finalReport.totalQuestions ?? interview.questions.length,
      summary: finalReport.summary,
      topStrengths: finalReport.topStrengths || [],
      keyAreasForImprovement: finalReport.keyAreasForImprovement || [],
      missingConcepts: finalReport.missingConcepts || [],
      recommendedTopicsToPractice: finalReport.recommendedTopicsToPractice || [],
      suggestedNextSteps: finalReport.suggestedNextSteps || [],
      studyRoadmap: finalReport.studyRoadmap || [],
      disclaimer: finalReport.disclaimer || '',
      provider: finalReport.provider || '',
      isSimulated: Boolean(finalReport.isSimulated),
      generatedAt: new Date(),
    };

    interview.overallScore = finalReport.overallScore;
    interview.summaryFeedback = {
      strengths: finalReport.topStrengths || [],
      weaknesses: finalReport.keyAreasForImprovement || [],
      recommendations: finalReport.suggestedNextSteps || [],
    };
    interview.status = 'completed';
    interview.completedAt = new Date();

    await interview.save();

    // Increment user preparation stats (only award score if genuine evaluation occurred)
    const prepScoreInc = (typeof finalReport.overallScore === 'number' && !isNaN(finalReport.overallScore))
      ? Math.round(finalReport.overallScore / 2)
      : 0;

    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.mockInterviewsCompleted': 1,
        'stats.prepScore': prepScoreInc,
      },
      $set: { 'stats.lastActiveDate': new Date() },
    });

    return res.status(200).json({
      success: true,
      message: 'Mock interview completed successfully',
      interview,
      report: interview.finalReport,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get finalized interview report by ID
 * @route   GET /api/interview/:id/report
 * @access  Private
 */
const getInterviewReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const interview = await MockInterview.findById(id).lean();

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview not found',
      });
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (interview.status !== 'completed' || !interview.finalReport) {
      return res.status(400).json({
        success: false,
        message: 'Interview is not yet completed. Final report is only available after completion.',
      });
    }

    return res.status(200).json({
      success: true,
      interview,
      report: interview.finalReport,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get mock interview history for current user
 * @route   GET /api/interview/history
 * @access  Private
 */
const getInterviewHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {
      user: req.user._id,
      status: 'completed',
    };

    const total = await MockInterview.countDocuments(query);
    const interviews = await MockInterview.find(query)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('jobRole interviewType difficulty experienceLevel totalQuestions overallScore completedAt finalReport.summary')
      .lean();

    return res.status(200).json({
      success: true,
      interviews,
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
 * @desc    Abandon currently active mock interview
 * @route   POST /api/interview/abandon
 * @access  Private
 */
const abandonActiveInterview = async (req, res, next) => {
  try {
    const interview = await MockInterview.findOneAndUpdate(
      { user: req.user._id, status: 'in-progress' },
      { $set: { status: 'abandoned' } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: interview ? 'Active mock interview abandoned' : 'No active mock interview to abandon',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get AI Interview Engine Status (Live Gemini vs Simulated AI)
 * @route   GET /api/interview/status
 * @access  Private
 */
const getInterviewStatus = async (req, res) => {
  const status = aiInterviewService.getAIStatus();
  return res.status(200).json({
    success: true,
    ...status,
  });
};

module.exports = {
  getInterviewStatus,
  startInterview,
  getActiveInterview,
  getInterviewById,
  submitAnswer,
  skipQuestion,
  finishInterview,
  getInterviewReport,
  getInterviewHistory,
  abandonActiveInterview,
};
