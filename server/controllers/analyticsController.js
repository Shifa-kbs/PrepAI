const mongoose = require('mongoose');
const PracticeSession = require('../models/PracticeSession');
const QuestionProgress = require('../models/QuestionProgress');
const MockInterview = require('../models/MockInterview');
const Question = require('../models/Question');
const User = require('../models/User');

/**
 * @desc    Get comprehensive user performance analytics
 * @route   GET /api/analytics
 * @access  Private
 */
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Practice Sessions Metrics
    const practiceSessions = await PracticeSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const totalSessions = practiceSessions.length;
    const completedSessions = practiceSessions.filter((s) => s.status === 'completed');

    const averagePracticeScore = completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length
        )
      : 0;

    const bestPracticeScore = completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.score || 0))
      : 0;

    // Running score trends (chronological)
    const scoreTrends = completedSessions
      .slice()
      .sort(
        (a, b) =>
          new Date(a.completedAt || a.startedAt || a.createdAt) -
          new Date(b.completedAt || b.startedAt || b.createdAt)
      )
      .map((s, idx) => {
        const d = new Date(s.completedAt || s.startedAt || s.createdAt);
        return {
          date: d.toISOString().split('T')[0],
          formattedDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: s.score || 0,
          title: s.category || `Session #${idx + 1}`,
          category: s.category || 'Practice',
          totalQuestions: s.totalQuestions || 0,
        };
      });

    // 2. Question Progress & Accuracy (Scoped uniquely to user)
    const progressRecords = await QuestionProgress.find({ user: userId })
      .populate('question', 'title category difficulty')
      .lean();

    const questionsAttempted = progressRecords.length;
    const solvedQuestions = progressRecords.filter((p) => p.status === 'solved').length;
    const correctAnswers = progressRecords.reduce(
      (acc, p) => acc + (p.correctAttempts || (p.status === 'solved' ? 1 : 0)),
      0
    );
    const totalAttempts = progressRecords.reduce((acc, p) => acc + (p.attempts || 1), 0);

    const accuracy = totalAttempts > 0
      ? Math.round((correctAnswers / totalAttempts) * 100)
      : (questionsAttempted > 0 ? Math.round((solvedQuestions / questionsAttempted) * 100) : 0);

    // 3. Mock Interview Metrics
    const mockInterviews = await MockInterview.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const totalInterviews = mockInterviews.length;
    const completedInterviews = mockInterviews.filter((m) => m.status === 'completed');

    const avgMockScore = completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((acc, m) => acc + (m.overallScore || 0), 0) /
            completedInterviews.length
        )
      : 0;

    const bestMockScore = completedInterviews.length > 0
      ? Math.max(...completedInterviews.map((m) => m.overallScore || 0))
      : 0;

    // 4. Topic-wise Performance, Strengths & Areas to Improve
    const categoryStatsMap = {};

    progressRecords.forEach((p) => {
      const cat = p.question?.category || 'General';
      if (!categoryStatsMap[cat]) {
        categoryStatsMap[cat] = {
          category: cat,
          attempted: 0,
          solved: 0,
          correct: 0,
          totalAttempts: 0,
        };
      }
      categoryStatsMap[cat].attempted += 1;
      if (p.status === 'solved') categoryStatsMap[cat].solved += 1;
      categoryStatsMap[cat].correct += (p.correctAttempts || (p.status === 'solved' ? 1 : 0));
      categoryStatsMap[cat].totalAttempts += (p.attempts || 1);
    });

    // Factor in practice session categories if available
    practiceSessions.forEach((s) => {
      if (s.category && s.category !== 'Mixed Topics') {
        const cat = s.category;
        if (!categoryStatsMap[cat]) {
          categoryStatsMap[cat] = {
            category: cat,
            attempted: 0,
            solved: 0,
            correct: 0,
            totalAttempts: 0,
          };
        }
      }
    });

    const topicBreakdown = Object.values(categoryStatsMap).map((cat) => {
      const acc = cat.totalAttempts > 0
        ? Math.round((cat.correct / cat.totalAttempts) * 100)
        : (cat.attempted > 0 ? Math.round((cat.solved / cat.attempted) * 100) : 0);

      return {
        category: cat.category,
        attempted: cat.attempted,
        solved: cat.solved,
        correct: cat.correct,
        accuracy: acc,
      };
    });

    const topicStrengths = topicBreakdown
      .filter((t) => t.accuracy >= 70)
      .sort((a, b) => b.accuracy - a.accuracy);

    const areasToImprove = topicBreakdown
      .filter((t) => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);

    // 5. Unified Recent Activity (Chronological)
    const recentActivity = [];

    practiceSessions.slice(0, 10).forEach((s) => {
      recentActivity.push({
        id: s._id,
        type: 'practice',
        title: `Practice: ${s.category || 'Mixed Topics'}`,
        date: s.completedAt || s.startedAt || s.createdAt,
        status: s.status,
        score: s.score,
      });
    });

    mockInterviews.slice(0, 10).forEach((m) => {
      recentActivity.push({
        id: m._id,
        type: 'interview',
        title: `Mock Interview: ${m.jobRole}`,
        date: m.completedAt || m.createdAt,
        status: m.status,
        score: m.overallScore,
      });
    });

    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    const responseData = {
      practiceOverview: {
        totalSessions,
        completedSessions: completedSessions.length,
        averageScore: averagePracticeScore,
        bestScore: bestPracticeScore,
      },
      questionMetrics: {
        questionsAttempted,
        solvedQuestions,
        correctAnswers,
        accuracy,
      },
      mockInterviewMetrics: {
        totalInterviews,
        completedInterviews: completedInterviews.length,
        averageScore: avgMockScore,
        bestScore: bestMockScore,
      },
      scoreTrends,
      topicPerformance: {
        all: topicBreakdown,
        strengths: topicStrengths,
        needsImprovement: areasToImprove,
      },
      recentActivity: recentActivity.slice(0, 10),
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      analytics: responseData,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserAnalytics,
};
