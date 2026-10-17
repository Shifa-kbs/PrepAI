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
  ArrowUpRight,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
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
    return <LoadingSpinner fullScreen label="Compiling performance analytics..." />;
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
    scoreTrends,
    topicPerformance,
    recentActivity,
  } = analytics || {};

  const hasActivity =
    practiceOverview?.totalSessions > 0 ||
    mockInterviewMetrics?.totalInterviews > 0 ||
    questionMetrics?.questionsAttempted > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Performance Analytics
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Persisted Metrics
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time evaluation data from your coding sessions, answers, and AI mock interviews.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/practice')}
            className="flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4 text-brand-400" />
            <span>Practice</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/interview')}
            className="flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-white" />
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
            <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Question Accuracy
                  </p>
                  <p className="text-3xl font-black text-white mt-2 tracking-tight">
                    {questionMetrics?.accuracy}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {questionMetrics?.correctAnswers} correct of {questionMetrics?.questionsAttempted} attempted
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, questionMetrics?.accuracy || 0)}%` }}
                />
              </div>
            </Card>

            {/* Practice Sessions */}
            <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Practice Sessions
                  </p>
                  <p className="text-3xl font-black text-white mt-2 tracking-tight">
                    {practiceOverview?.completedSessions}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      / {practiceOverview?.totalSessions}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Avg score: <span className="text-brand-300 font-semibold">{practiceOverview?.averageScore}%</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
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
            <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mock Interviews
                  </p>
                  <p className="text-3xl font-black text-white mt-2 tracking-tight">
                    {mockInterviewMetrics?.completedInterviews}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      / {mockInterviewMetrics?.totalInterviews}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Avg rating: <span className="text-indigo-300 font-semibold">{mockInterviewMetrics?.averageScore}/100</span>
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, mockInterviewMetrics?.averageScore || 0)}%`,
                  }}
                />
              </div>
            </Card>

            {/* Best Score & Solved Unique */}
            <Card className="relative overflow-hidden border-slate-800/80 bg-slate-900/60">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Best Evaluation
                  </p>
                  <p className="text-3xl font-black text-amber-400 mt-2 tracking-tight">
                    {Math.max(practiceOverview?.bestScore || 0, mockInterviewMetrics?.bestScore || 0)}%
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {questionMetrics?.solvedQuestions} unique questions solved
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
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

          {/* Charts & Topic Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score Trends Chart */}
            <Card className="lg:col-span-2 border-slate-800/80 bg-slate-900/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    <span>Practice Score Trends Over Time</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Historical evaluation scores across your completed practice sessions
                  </p>
                </div>
              </div>

              {scoreTrends && scoreTrends.length > 0 ? (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="formattedDate"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        domain={[0, 100]}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#f8fafc',
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
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#c7d2fe' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
                  <Clock className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Not Enough Session History</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Complete at least one practice session to start visualizing your score trajectory.
                  </p>
                </div>
              )}
            </Card>

            {/* Topic Accuracy Breakdown */}
            <Card className="border-slate-800/80 bg-slate-900/60 flex flex-col">
              <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Topic Mastery</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Accuracy by category based on your submissions
              </p>

              {topicPerformance?.all && topicPerformance.all.length > 0 ? (
                <div className="flex-1 space-y-3 overflow-y-auto max-h-64 pr-1">
                  {topicPerformance.all.map((topic) => (
                    <div key={topic.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300 truncate max-w-[140px]">
                          {topic.category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-500">
                            {topic.correct}/{topic.attempted}
                          </span>
                          <span
                            className={`font-bold ${
                              topic.accuracy >= 70
                                ? 'text-emerald-400'
                                : topic.accuracy >= 40
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {topic.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-lg">
                  <Target className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">No Category Data Yet</p>
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
            <Card className="border-emerald-500/20 bg-slate-900/60">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Top Strengths</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Topics where you consistently score ≥70% accuracy.
              </p>

              {topicPerformance?.strengths && topicPerformance.strengths.length > 0 ? (
                <div className="space-y-2.5">
                  {topicPerformance.strengths.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{item.category}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.solved} questions mastered • {item.attempted} attempts
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        {item.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Keep practicing to reveal and lock in your top strength areas.
                </p>
              )}
            </Card>

            {/* Areas Requiring Improvement */}
            <Card className="border-amber-500/20 bg-slate-900/60">
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Areas to Prioritize</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Topics with &lt;70% accuracy recommended for your personalized study plan.
              </p>

              {topicPerformance?.needsImprovement && topicPerformance.needsImprovement.length > 0 ? (
                <div className="space-y-2.5">
                  {topicPerformance.needsImprovement.map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{item.category}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {item.correct} correct of {item.attempted} attempts
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {item.accuracy}%
                        </span>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => navigate('/study-plan')}
                          className="text-[11px] text-brand-400 hover:text-brand-300"
                        >
                          Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4 text-center">
                  Great job! No weak topics detected, or more submissions needed.
                </p>
              )}
            </Card>
          </div>

          {/* Combined Recent Activity Feed */}
          <Card className="border-slate-800/80 bg-slate-900/60">
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Recent Activity History</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Chronological log of your practice sessions and AI mock evaluations
            </p>

            {recentActivity && recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-800/80">
                {recentActivity.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          item.type === 'practice'
                            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
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
                          <p className="text-xs font-bold text-white">{item.title}</p>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                              item.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
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
                          <span className="text-xs font-black text-white">{item.score}%</span>
                          <p className="text-[10px] text-slate-500">score</p>
                        </div>
                      )}
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          navigate(item.type === 'practice' ? `/practice` : `/interview`)
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
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
