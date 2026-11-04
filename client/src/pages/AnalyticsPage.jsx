import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Bot,
  Code2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getUserAnalytics } from '../services/analyticsService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserAnalytics();
      if (res && res.success) {
        setAnalytics(res.data);
      } else {
        setError(res?.message || 'Failed to load performance analytics.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" label="Compiling performance analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-xl mx-auto space-y-4">
        <ErrorMessage message={error} />
        <div className="text-center">
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  const {
    practiceOverview,
    questionMetrics,
    mockInterviewMetrics,
    cognitiveMetrics,
    scoreTrends,
    topicPerformance,
    recentActivity,
  } = analytics || {};

  const hasActivity =
    practiceOverview?.totalSessions > 0 ||
    mockInterviewMetrics?.totalInterviews > 0 ||
    cognitiveMetrics?.totalSessions > 0 ||
    questionMetrics?.questionsAttempted > 0;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Performance Analytics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" /> Live Persisted Metrics
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time evaluation data from your coding sessions, answers, topic tests, and AI mock interviews.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-sky-600" />
            <span>Practice</span>
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/interview')}
            className="flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>Mock Interview</span>
          </Button>
        </div>
      </div>

      {!hasActivity ? (
        <EmptyState
          icon={BarChart3}
          title="No Preparation Activity Yet"
          description="Complete coding tasks or take an AI mock interview to generate your real-time performance analytics."
          actionText="Start Coding Practice"
          onAction={() => navigate('/practice')}
        />
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Accuracy & Solved */}
            <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Question Accuracy
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    {questionMetrics?.accuracy}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {questionMetrics?.correctAnswers} correct of {questionMetrics?.questionsAttempted} attempted
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, questionMetrics?.accuracy || 0)}%` }}
                />
              </div>
            </Card>

            {/* Practice Sessions */}
            <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Practice Sessions
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    {practiceOverview?.completedSessions}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {practiceOverview?.totalSessions}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Avg score: <span className="text-sky-700 font-bold">{practiceOverview?.averageScore}%</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      practiceOverview?.totalSessions > 0
                        ? Math.round(
                            (practiceOverview.completedSessions / practiceOverview.totalSessions) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </Card>

            {/* Mock Interviews */}
            <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Mock Interviews
                  </p>
                  <p className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                    {mockInterviewMetrics?.completedInterviews}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {mockInterviewMetrics?.totalInterviews}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Avg rating: <span className="text-indigo-700 font-bold">{mockInterviewMetrics?.averageScore}/100</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, mockInterviewMetrics?.averageScore || 0)}%`,
                  }}
                />
              </div>
            </Card>

            {/* Best Score & Solved Unique */}
            <Card className="relative overflow-hidden border-slate-200 bg-white shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Best Evaluation
                  </p>
                  <p className="text-3xl font-black text-amber-600 mt-2 tracking-tight">
                    {Math.max(practiceOverview?.bestScore || 0, mockInterviewMetrics?.bestScore || 0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {questionMetrics?.solvedQuestions} unique questions solved
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-200">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(practiceOverview?.bestScore || 0, mockInterviewMetrics?.bestScore || 0)
                    )}%`,
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Historical Cognitive Assessment Metrics (if user has existing records) */}
          {cognitiveMetrics && cognitiveMetrics.totalSessions > 0 && (
            <Card className="border-sky-200 bg-sky-50/50 p-5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-sky-100 text-sky-700 border border-sky-300">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Historical Cognitive & Working Memory Archive</h3>
                    <p className="text-xs text-slate-600">Persisted digit span, pattern recognition, and speed metrics</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white text-sky-800 border border-sky-200 w-fit">
                  {cognitiveMetrics.totalSessions} Historical Test{cognitiveMetrics.totalSessions > 1 ? 's' : ''} Recorded
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs text-slate-500">Average Composite Score</span>
                  <p className="text-xl font-extrabold text-sky-700 mt-1">{cognitiveMetrics.averageScore} / 100</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs text-slate-500">Best Battery Score</span>
                  <p className="text-xl font-extrabold text-emerald-600 mt-1">{cognitiveMetrics.bestScore} / 100</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-xs text-slate-500">Peak Digit Span Memory</span>
                  <p className="text-xl font-extrabold text-amber-600 mt-1">{cognitiveMetrics.bestDigitSpan} Digits</p>
                </div>
              </div>
            </Card>
          )}

          {/* Charts & Topic Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Trends Chart */}
            <Card className="lg:col-span-2 border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    <span>Practice Score Trends Over Time</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historical evaluation scores across your completed practice sessions
                  </p>
                </div>
              </div>

              {scoreTrends && scoreTrends.length > 0 ? (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        domain={[0, 100]}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#0f172a',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(val) => [`${val}%`, 'Score']}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${item.title} (${item.date})` : label;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#38bdf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg">
                  <Clock className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Not Enough Session History</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Complete at least one practice session to start visualizing your score trajectory.
                  </p>
                </div>
              )}
            </Card>

            {/* Topic Accuracy Breakdown */}
            <Card className="border-slate-200 bg-white shadow-xs flex flex-col">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Topic Mastery</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Accuracy by category based on your submissions
              </p>

              {topicPerformance?.all && topicPerformance.all.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
                  {topicPerformance.all.map((topic) => (
                    <div key={topic.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                          {topic.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400">
                            {topic.correct}/{topic.attempted}
                          </span>
                          <span
                            className={`font-bold ${
                              topic.accuracy >= 70
                                ? 'text-emerald-600'
                                : topic.accuracy >= 40
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {topic.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            topic.accuracy >= 70
                              ? 'bg-emerald-500'
                              : topic.accuracy >= 40
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${topic.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg">
                  <Target className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">No Category Data Yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Solve questions across topics to populate mastery indicators.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Strengths & Areas to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-emerald-200 bg-white shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Top Strengths</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Topics where you consistently score ≥70% accuracy.
              </p>

              {topicPerformance?.strengths && topicPerformance.strengths.length > 0 ? (
                <div className="space-y-2.5">
                  {topicPerformance.strengths.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.category}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.solved} questions mastered • {item.attempted} attempts
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {item.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Keep practicing to reveal and lock in your top strength areas.
                </p>
              )}
            </Card>

            {/* Areas Requiring Improvement */}
            <Card className="border-amber-200 bg-white shadow-xs">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Areas to Prioritize</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Topics with &lt;70% accuracy recommended for your personalized study plan.
              </p>

              {topicPerformance?.needsImprovement && topicPerformance.needsImprovement.length > 0 ? (
                <div className="space-y-2.5">
                  {topicPerformance.needsImprovement.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{item.category}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.correct} correct of {item.attempted} attempts
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-amber-700 px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                          {item.accuracy}%
                        </span>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => navigate('/study-plan')}
                          className="text-[11px] text-sky-600 hover:text-sky-700"
                        >
                          Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Great job! No weak topics detected, or more submissions needed.
                </p>
              )}
            </Card>
          </div>

          {/* Combined Recent Activity Feed */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Recent Activity History</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Chronological log of your practice sessions and AI mock evaluations
            </p>

            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          item.type === 'practice'
                            ? 'bg-sky-50 text-sky-600 border border-sky-200'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        }`}
                      >
                        {item.type === 'practice' ? (
                          <Code2 className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">{item.title}</p>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              item.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.date).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pl-11 sm:pl-0">
                      {item.score !== undefined && item.score !== null && (
                        <div className="text-right">
                          <span className="text-xs font-black text-slate-900">{item.score}%</span>
                          <p className="text-[10px] text-slate-400">score</p>
                        </div>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          navigate(item.type === 'practice' ? `/practice` : `/interview`)
                        }
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No recent sessions found.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
