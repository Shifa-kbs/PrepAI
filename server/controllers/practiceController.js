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
 * Shared helper to compute rich post-test analytics including topic breakdown & recommendations
 */
const computeSessionSummary = (sess, qs) => {
  const answers = sess.answers || [];
  const correct = answers.filter((a) => a.isCorrect).length;
  const attempted = answers.filter((a) => a.status !== 'skipped').length;
  const wrong = answers.filter((a) => a.status === 'wrong').length;
  const skipped = Math.max(0, sess.totalQuestions - attempted);
  const review = answers.filter((a) => a.markedForReview).length;

  const topicStats = {};
  (qs || []).forEach((q) => {
    const qTopic = q.topic || q.category || 'General';
    if (!topicStats[qTopic]) {
      topicStats[qTopic] = {
        topic: qTopic,
        category: q.category,
        total: 0,
        correct: 0,
      };
    }
    topicStats[qTopic].total += 1;
    const ans = answers.find(
      (a) => a.question.toString() === q._id.toString()
    );
    if (ans && ans.isCorrect) {
      topicStats[qTopic].correct += 1;
    }
  });

  const topicBreakdown = Object.values(topicStats).map((t) => ({
    ...t,
    accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
  }));

  const recommendedTopics = topicBreakdown
    .filter((t) => t.accuracy < 70)
    .map((t) => t.topic);

  return {
    totalQuestions: sess.totalQuestions,
    attemptedCount: attempted,
    correctCount: correct,
    wrongCount: wrong,
    skippedCount: skipped,
    reviewCount: review,
    score: sess.score,
    accuracy: sess.accuracy,
    timeTakenSeconds: sess.timeTakenSeconds,
    topicBreakdown,
    recommendedTopics,
  };
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
    const count = Math.min(150, parsedCount);

    const {
      topic,
      type,
      reviewMistakes = false,
      moduleType = 'technical',
      section,
    } = req.body;

    // Check if user already has an active in-progress session for this module type
    const activeQuery = {
      user: req.user._id,
      status: 'in-progress',
    };
    if (moduleType) {
      activeQuery.moduleType = moduleType;
    }
    const existingActive = await PracticeSession.findOne(activeQuery);

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
          message: 'Resuming active session',
          session: activeWithQuestions,
        });
      } else {
        // User explicitly wants to discard existing session
        existingActive.status = 'abandoned';
        await existingActive.save();
      }
    }

    // Build question selection filter
    const query = {};

    const isFullAptitude =
      category === 'Full Aptitude Test' ||
      category === 'Aptitude' ||
      section === 'Full Aptitude Test';

    if (isFullAptitude) {
      query.category = {
        $in: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'],
      };
    } else if (mode !== 'mixed' && category && category !== 'All' && category !== 'all') {
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
    let matchingQuestions = await Question.find(query)
      .select('-correctAnswerIndex -sampleAnswer -explanation')
      .lean();

    const relaxedFiltersApplied = [];

    // Fallback relaxation step 1: If database has very few questions, ensure seeded
    if (!matchingQuestions || matchingQuestions.length === 0) {
      const totalQCount = await Question.countDocuments();
      if (totalQCount < 50) {
        try {
          const { seedDatabase } = require('../data/seedData');
          await seedDatabase({ skipDisconnect: true });
          matchingQuestions = await Question.find(query)
            .select('-correctAnswerIndex -sampleAnswer -explanation')
            .lean();
        } catch (seedErr) {
          console.warn('Auto-seed fallback error in practiceController:', seedErr.message);
        }
      }
    }

    // Fallback relaxation step 2: Relax topic if specified
    if ((!matchingQuestions || matchingQuestions.length === 0) && query.topic) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.topic;
      const fallback = await Question.find(relaxedQuery)
        .select('-correctAnswerIndex -sampleAnswer -explanation')
        .lean();
      if (fallback && fallback.length > 0) {
        matchingQuestions = fallback;
        relaxedFiltersApplied.push(`expanded from topic "${topic}" to all topics in ${category}`);
      }
    }

    // Fallback relaxation step 3: Relax difficulty if specified
    if ((!matchingQuestions || matchingQuestions.length === 0) && query.difficulty) {
      const relaxedQuery = { ...query };
      delete relaxedQuery.difficulty;
      delete relaxedQuery.topic;
      const fallback = await Question.find(relaxedQuery)
        .select('-correctAnswerIndex -sampleAnswer -explanation')
        .lean();
      if (fallback && fallback.length > 0) {
        matchingQuestions = fallback;
        relaxedFiltersApplied.push(`adjusted difficulty from "${difficulty}" to all available difficulties in ${category}`);
      }
    }

    // Fallback relaxation step 4: For aptitude tests, fallback to all aptitude domains
    if ((!matchingQuestions || matchingQuestions.length === 0) && (isFullAptitude || moduleType === 'aptitude')) {
      const fallback = await Question.find({
        category: { $in: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'] },
      })
        .select('-correctAnswerIndex -sampleAnswer -explanation')
        .lean();
      if (fallback && fallback.length > 0) {
        matchingQuestions = fallback;
        relaxedFiltersApplied.push('included questions across all Aptitude sections');
      }
    }

    if (!matchingQuestions || matchingQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found matching ${category || 'the selected criteria'}. Please select another domain or difficulty.`,
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

    if (isFullAptitude && count > 1) {
      // Balanced selection across Quantitative Aptitude, Logical Reasoning, and Verbal Ability
      const quantPool = prioritizedPool.filter((q) => q.category === 'Quantitative Aptitude');
      const logicalPool = prioritizedPool.filter((q) => q.category === 'Logical Reasoning');
      const verbalPool = prioritizedPool.filter((q) => q.category === 'Verbal Ability');

      const targetPerSec = Math.floor(count / 3);
      const remainder = count % 3;

      const pickFrom = (pool, num) => {
        const picked = [];
        for (const q of pool) {
          const idStr = q._id.toString();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            picked.push(q);
            if (picked.length === num) break;
          }
        }
        return picked;
      };

      const quantPick = pickFrom(quantPool, targetPerSec + (remainder > 0 ? 1 : 0));
      const logicalPick = pickFrom(logicalPool, targetPerSec + (remainder > 1 ? 1 : 0));
      const verbalPick = pickFrom(verbalPool, targetPerSec);

      selectedQuestions.push(...quantPick, ...logicalPick, ...verbalPick);

      // If still need more to satisfy count, fill from remaining pool
      if (selectedQuestions.length < count) {
        for (const q of prioritizedPool) {
          const idStr = q._id.toString();
          if (!seenIds.has(idStr)) {
            seenIds.add(idStr);
            selectedQuestions.push(q);
            if (selectedQuestions.length === count) break;
          }
        }
      }
    } else {
      for (const q of prioritizedPool) {
        const idStr = q._id.toString();
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          selectedQuestions.push(q);
          if (selectedQuestions.length === count) break;
        }
      }
    }

    const questionIds = selectedQuestions.map((q) => q._id);
    const sessionCategory = mode === 'mixed' ? 'Mixed Topics' : category;

    const resolvedModuleType =
      moduleType ||
      (isFullAptitude || category.includes('Aptitude') || category.includes('Reasoning') || category.includes('Verbal')
        ? 'aptitude'
        : 'technical');

    const resolvedSection =
      section ||
      (isFullAptitude
        ? 'Full Aptitude Test'
        : category);

    // Create new PracticeSession
    const session = new PracticeSession({
      user: req.user._id,
      mode,
      moduleType: resolvedModuleType,
      section: resolvedSection,
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

    let responseMessage = 'Practice session started successfully';
    if (relaxedFiltersApplied.length > 0) {
      responseMessage = `Note: We ${relaxedFiltersApplied.join(' and ')} to provide questions for your session.`;
    } else if (isPartial) {
      responseMessage = `Requested ${count} questions, but only ${availableCount} eligible question${availableCount > 1 ? 's were' : ' was'} found for ${sessionCategory}. Started session with all ${availableCount} available question${availableCount > 1 ? 's' : ''}.`;
    }

    return res.status(201).json({
      success: true,
      resumed: false,
      isPartial,
      requestedCount: count,
      availableCount,
      relaxedFiltersApplied,
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
    const activeQuery = {
      user: req.user._id,
      status: 'in-progress',
    };
    if (req.query.moduleType) {
      activeQuery.moduleType = req.query.moduleType;
    }

    const session = await PracticeSession.findOne(activeQuery)
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
        summary: computeSessionSummary(session, populatedSession.questions),
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

    const isTimed = session.timeLimitMinutes > 0;
    const isAssessment =
      session.mode === 'assessment' ||
      session.mode === 'section-test' ||
      session.mode === 'full-test' ||
      (session.moduleType === 'aptitude' && isTimed);

    // Strict server-side timer validation with 15-second network buffer
    if (isTimed) {
      const elapsedSeconds =
        (Date.now() - new Date(session.startedAt).getTime()) / 1000;
      if (elapsedSeconds > session.timeLimitMinutes * 60 + 15) {
        return res.status(400).json({
          success: false,
          expired: true,
          message:
            'Time limit for this assessment has expired. Please submit and finish your test.',
        });
      }
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
    let executionResult = null;

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
    } else if (question.type === 'coding' || req.body.code) {
      const submittedCode = req.body.code || userAnswer || '';
      const submittedLang = req.body.language || 'javascript';
      if (submittedCode.trim()) {
        let testCases = Array.isArray(question.testCases) && question.testCases.length > 0
          ? question.testCases
          : [];

        // If testCases is empty on the DB document, lookup static questions
        if (testCases.length === 0) {
          try {
            const { allQuestions } = require('../data/questions');
            const staticQ = allQuestions.find(
              (q) => q.slug === question.slug || q.title === question.title
            );
            if (staticQ && Array.isArray(staticQ.testCases) && staticQ.testCases.length > 0) {
              testCases = staticQ.testCases;
            }
          } catch {}
        }

        // Fallback to examples if no explicit test cases defined
        if (testCases.length === 0 && Array.isArray(question.examples) && question.examples.length > 0) {
          testCases = question.examples.map((ex) => ({
            input: ex.input || '',
            expectedOutput: ex.output || '',
            isHidden: false,
          }));
        }

        const { executeCode } = require('../services/codeExecutionService');
        executionResult = await executeCode({
          language: submittedLang,
          code: submittedCode,
          testCases,
        });

        if (executionResult && executionResult.isUnavailable) {
          return res.status(503).json({
            success: false,
            isUnavailable: true,
            message: executionResult.summary,
            error: executionResult.error,
          });
        }

        isCorrect = Boolean(executionResult && executionResult.allPassed && executionResult.totalTests > 0);
      } else {
        isCorrect = false;
      }
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
      language: req.body.language || 'javascript',
      executionResult: executionResult || undefined,
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

    // Synchronize per-user QuestionProgress without double-counting on answer update
    const wasPreviouslyAnsweredInSession =
      existingAnswerIdx >= 0 && session.answers[existingAnswerIdx].status !== 'skipped';
    const previousWasCorrect =
      wasPreviouslyAnsweredInSession && session.answers[existingAnswerIdx].isCorrect;

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
      if (!wasPreviouslyAnsweredInSession) {
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
      } else {
        // Answer was changed within the current active session
        if (previousWasCorrect !== isCorrect) {
          if (isCorrect) {
            progress.correctAttempts += 1;
            progress.incorrectAttempts = Math.max(0, progress.incorrectAttempts - 1);
            progress.status = 'solved';
          } else {
            progress.correctAttempts = Math.max(0, progress.correctAttempts - 1);
            progress.incorrectAttempts += 1;
          }
        }
      }
      progress.timeSpentSeconds += parsedTime;
      progress.lastAttemptedAt = new Date();
    }
    await progress.save();

    // During timed assessments, strictly prevent leaking answer keys or explanations
    if (isAssessment) {
      return res.status(200).json({
        success: true,
        isAssessment: true,
        selectedAnswerIndex,
        message: 'Answer recorded successfully',
        sessionStats: {
          totalAttempted: attemptedCount,
          totalQuestions: session.totalQuestions,
        },
      });
    }

    return res.status(200).json({
      success: true,
      isAssessment: false,
      isCorrect,
      executionResult,
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

    // If already completed, return existing completed session with summary
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
        summary: computeSessionSummary(session, completedSession.questions),
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
      summary: computeSessionSummary(session, finishedWithSolutions.questions),
      message: 'Assessment completed successfully',
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
    if (req.query.moduleType) {
      query.moduleType = req.query.moduleType;
    }

    const total = await PracticeSession.countDocuments(query);
    const sessions = await PracticeSession.find(query)
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('category difficulty mode moduleType section totalQuestions score accuracy timeTakenSeconds completedAt answers')
      .lean();

    // Map summary indicators for history cards
    const mappedSessions = sessions.map((s) => {
      const correctCount = (s.answers || []).filter((a) => a.isCorrect).length;
      return {
        _id: s._id,
        category: s.category,
        difficulty: s.difficulty,
        mode: s.mode,
        moduleType: s.moduleType || 'technical',
        section: s.section || s.category,
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

/**
 * @desc    Get aptitude section statistics, question counts, and user solved progress
 * @route   GET /api/practice/aptitude/stats
 * @access  Private
 */
const getAptitudeStats = async (req, res, next) => {
  try {
    const aptitudeCategories = [
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Verbal Ability',
    ];

    const questions = await Question.find({
      category: { $in: aptitudeCategories },
    })
      .select('category topic difficulty slug')
      .lean();

    const questionIds = questions.map((q) => q._id);
    const progressList = await QuestionProgress.find({
      user: req.user._id,
      question: { $in: questionIds },
    }).lean();

    const progressMap = new Map();
    progressList.forEach((p) => {
      progressMap.set(p.question.toString(), p);
    });

    const sections = {};
    aptitudeCategories.forEach((cat) => {
      sections[cat] = {
        name: cat,
        total: 0,
        solved: 0,
        attempted: 0,
        difficulties: { Easy: 0, Medium: 0, Hard: 0 },
        topics: {},
      };
    });

    questions.forEach((q) => {
      const sec = sections[q.category];
      if (sec) {
        sec.total += 1;
        if (q.difficulty && sec.difficulties[q.difficulty] !== undefined) {
          sec.difficulties[q.difficulty] += 1;
        }
        const top = q.topic || 'General';
        sec.topics[top] = (sec.topics[top] || 0) + 1;

        const prog = progressMap.get(q._id.toString());
        if (prog) {
          if (prog.status === 'solved') {
            sec.solved += 1;
          } else if (prog.attempts > 0) {
            sec.attempted += 1;
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      sections,
      totalAptitudeQuestions: questions.length,
      data: {
        sections,
        totalAptitudeQuestions: questions.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Execute code in sandboxed environment against test cases
 * @route   POST /api/practice/run-code
 * @access  Private
 */
const executeCodingChallenge = async (req, res, next) => {
  try {
    const { language = 'javascript', code = '', testCases = [], questionId } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source code is required to execute test cases.',
      });
    }

    let casesToRun = Array.isArray(testCases) ? testCases : [];
    if (casesToRun.length === 0 && questionId) {
      const Question = require('../models/Question');
      const q = await Question.findById(questionId);
      if (q && Array.isArray(q.testCases) && q.testCases.length > 0) {
        casesToRun = q.testCases;
      }
    }

    const { executeCode } = require('../services/codeExecutionService');
    const result = await executeCode({ language, code, testCases: casesToRun });

    if (result && result.isUnavailable) {
      return res.status(503).json({
        success: false,
        isUnavailable: true,
        message: result.summary,
        ...result,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Code execution failed',
    });
  }
};

/**
 * @desc    Get live available question count for category/filters before test start
 * @route   GET /api/practice/availability
 * @access  Private
 */
const getQuestionAvailability = async (req, res, next) => {
  try {
    const { category, difficulty, topic, type, mode, section } = req.query;
    const isFullAptitude =
      category === 'Full Aptitude Test' ||
      category === 'Aptitude' ||
      section === 'Full Aptitude Test';

    const query = {};
    if (isFullAptitude) {
      query.category = { $in: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'] };
    } else if (mode !== 'mixed' && category && category !== 'All' && category !== 'all' && category !== 'Mixed Topics') {
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

    const availableCount = await Question.countDocuments(query);
    return res.status(200).json({
      success: true,
      availableCount,
      query,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * @desc    Save completed learning studio topic test results to database
 * @route   POST /api/practice/learning-result
 * @access  Private
 */
const saveLearningAssessment = async (req, res, next) => {
  try {
    const {
      topicId,
      topicTitle,
      subjectName,
      totalQuestions = 5,
      correctCount = 0,
      incorrectCount = 0,
      score = 0,
      timeSpentSeconds = 0,
      answers = {},
    } = req.body;

    const session = new PracticeSession({
      user: req.user._id,
      mode: 'topic',
      moduleType: 'learning',
      section: topicTitle || topicId || 'Learning Topic Test',
      category: subjectName || 'Aptitude',
      difficulty: 'Medium',
      totalQuestions: Number(totalQuestions) || 5,
      requestedQuestions: Number(totalQuestions) || 5,
      timeLimitMinutes: 10,
      status: 'completed',
      questions: [],
      answers: [],
      score: Number(score) || 0,
      accuracy: Number(score) || 0,
      timeTakenSeconds: Number(timeSpentSeconds) || 0,
      startedAt: new Date(Date.now() - (Number(timeSpentSeconds) || 0) * 1000),
      completedAt: new Date(),
    });

    await session.save();

    // Increment user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        'stats.questionsSolved': Number(correctCount) || 0,
        'stats.prepScore': Math.round((Number(score) || 0) / 4),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Learning assessment result saved to profile and analytics',
      sessionId: session._id,
      session,
    });
  } catch (err) {
    return next(err);
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
  getAptitudeStats,
  computeSessionSummary,
  executeCodingChallenge,
  getQuestionAvailability,
  saveLearningAssessment,
};
