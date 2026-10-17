import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  History,
  Flag,
  HelpCircle,
  Lightbulb,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const AptitudeResults = ({
  session,
  summary,
  onStartNew,
  onGoToHistory,
  onPracticeTopic,
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'wrong', 'correct', 'review'
  const [expandedId, setExpandedId] = useState(null);

  const questions = session?.questions || [];
  const answers = session?.answers || [];

  // Build lookup map for fast answer retrieval
  const answersMap = new Map();
  answers.forEach((a) => {
    const qIdStr = a.question?._id ? a.question._id.toString() : a.question?.toString();
    answersMap.set(qIdStr, a);
  });

  // Calculate metrics
  const correctCount =
    summary?.correctCount ?? answers.filter((a) => a.isCorrect).length;
  const attemptedCount =
    summary?.attemptedCount ?? answers.filter((a) => a.status !== 'skipped').length;
  const wrongCount =
    summary?.wrongCount ?? answers.filter((a) => a.status === 'wrong').length;
  const skippedCount =
    summary?.skippedCount ?? Math.max(0, (session?.totalQuestions || 0) - attemptedCount);
  const reviewCount =
    summary?.reviewCount ?? answers.filter((a) => a.markedForReview).length;

  const totalQuestions = session?.totalQuestions || questions.length || 1;
  const accuracy = session?.accuracy ?? Math.round((correctCount / Math.max(1, attemptedCount)) * 100);
  const totalScore = session?.score ?? correctCount * 20;

  const formatDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  // Performance Rating Tag
  const getPerformanceBadge = (acc) => {
    if (acc >= 80) {
      return {
        label: 'Excellent Mastery',
        color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      };
    }
    if (acc >= 60) {
      return {
        label: 'Good Performance',
        color: 'bg-brand-500/10 text-brand-300 border-brand-500/20',
      };
    }
    return {
      label: 'Needs Practice',
      color: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    };
  };

  const performanceMeta = getPerformanceBadge(accuracy);

  // Topic breakdown
  const topicBreakdown = summary?.topicBreakdown || [];
  const recommendedTopics = summary?.recommendedTopics || [];

  // Filtered review questions
  const filteredQuestions = questions.filter((q) => {
    const ans = answersMap.get(q._id.toString());
    if (filter === 'correct') return ans && ans.isCorrect;
    if (filter === 'wrong') return ans && ans.status === 'wrong';
    if (filter === 'review') return ans && ans.markedForReview;
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Hero Performance Card */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950/60 border-brand-500/30 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assessment Completed</span>
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${performanceMeta.color}`}
              >
                {performanceMeta.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Aptitude Assessment Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {session?.section || session?.category} • {session?.difficulty} Difficulty •{' '}
              {totalQuestions} Questions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Score Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
              <p className="text-2xl sm:text-3xl font-black text-brand-400 mt-1">{totalScore}</p>
            </div>
            {/* Accuracy Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{accuracy}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-slate-900/80 border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Correct Answers</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{correctCount}</p>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Incorrect</p>
          <p className="text-xl font-extrabold text-rose-400 mt-1">{wrongCount}</p>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Unanswered</p>
          <p className="text-xl font-extrabold text-slate-400 mt-1">{skippedCount}</p>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Time Taken</p>
          <p className="text-xl font-extrabold text-indigo-300 mt-1">
            {formatDuration(session?.timeTakenSeconds || 0)}
          </p>
        </Card>
      </div>

      {/* Recommended Topics Section */}
      {recommendedTopics.length > 0 ? (
        <Card className="bg-slate-900/90 border-amber-500/30 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Recommended Topics to Practise Next</h3>
          </div>
          <p className="text-xs text-slate-300">
            Based on your test attempt, strengthening accuracy in these areas will significantly improve
            your overall placement score:
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {recommendedTopics.map((top) => (
              <button
                key={top}
                onClick={() => onPracticeTopic && onPracticeTopic(top)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer group"
              >
                <span>{top}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="bg-slate-900/90 border-emerald-500/30 p-4 flex items-center space-x-3 text-emerald-300">
          <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
          <p className="text-xs">
            <strong className="font-bold text-white">High Proficiency Achieved:</strong> You scored 70%
            or higher across all tested topics in this assessment. Excellent work!
          </p>
        </Card>
      )}

      {/* Topic-Wise Performance Table */}
      {topicBreakdown.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-400" />
            <span>Topic-Wise Performance Breakdown</span>
          </h2>

          <Card className="overflow-hidden bg-slate-900/90 border-slate-800 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Topic</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4 text-center">Questions</th>
                    <th className="py-3 px-4 text-center">Correct</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topicBreakdown.map((item) => {
                    const isStrong = item.accuracy >= 70;
                    const isModerate = item.accuracy >= 40 && item.accuracy < 70;

                    return (
                      <tr key={item.topic} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white">{item.topic}</td>
                        <td className="py-3 px-4 text-slate-400">{item.category}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{item.total}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-400">
                          {item.correct}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isStrong
                                    ? 'bg-emerald-400'
                                    : isModerate
                                    ? 'bg-amber-400'
                                    : 'bg-rose-400'
                                }`}
                                style={{ width: `${item.accuracy}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-200">{item.accuracy}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isStrong
                                ? 'bg-emerald-500/10 text-emerald-300'
                                : isModerate
                                ? 'bg-amber-500/10 text-amber-300'
                                : 'bg-rose-500/10 text-rose-300'
                            }`}
                          >
                            {isStrong ? 'Strong' : isModerate ? 'Moderate' : 'Needs Practice'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onStartNew}
            icon={RotateCcw}
            className="text-xs font-semibold"
          >
            Take Another Assessment
          </Button>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGoToHistory}
          icon={History}
          className="text-xs"
        >
          View Aptitude History
        </Button>
      </div>

      {/* Question-by-Question Solution Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-400" />
            <span>Question-by-Question Solution Review</span>
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-brand-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'wrong'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Incorrect ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'correct'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({correctCount})
            </button>
            <button
              onClick={() => setFilter('review')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'review'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flagged ({reviewCount})
            </button>
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/40 rounded-xl border border-slate-800">
              No questions found in this filter category.
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const ans = answersMap.get(q._id.toString());
              const isCorrect = Boolean(ans && ans.isCorrect);
              const isWrong = Boolean(ans && ans.status === 'wrong');
              const isSkipped = !ans || ans.status === 'skipped';
              const isFlagged = Boolean(ans && ans.markedForReview);
              const isExpanded = expandedId === q._id.toString();

              const userChoiceIdx = ans?.selectedOptionIndex;
              const correctChoiceIdx = q.correctAnswerIndex;

              return (
                <div
                  key={q._id}
                  className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all"
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q._id.toString())}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                      {/* Status Icon */}
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                      {isWrong && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                      {isSkipped && <HelpCircle className="w-5 h-5 text-slate-500 shrink-0" />}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{q.title}</span>
                          {isFlagged && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              <Flag className="w-2.5 h-2.5 fill-amber-400" />
                              <span>Review</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {q.topic || q.category} • {q.difficulty}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isCorrect
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : isWrong
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isCorrect ? '+20 Marks' : '0 Marks'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content View */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800/80 bg-slate-950/60 space-y-4 text-xs">
                      {/* Problem Statement */}
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                        {q.description}
                      </div>

                      {/* Options Comparison */}
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Answer Choices
                          </p>
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isThisCorrect = optIdx === correctChoiceIdx;
                              const isThisUserChoice = optIdx === userChoiceIdx;

                              let optBg = 'bg-slate-900/60 border-slate-800 text-slate-400';
                              if (isThisCorrect) {
                                optBg = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 font-semibold';
                              } else if (isThisUserChoice && !isThisCorrect) {
                                optBg = 'bg-rose-500/15 border-rose-500/50 text-rose-200';
                              }

                              return (
                                <div
                                  key={optIdx}
                                  className={`flex items-start justify-between p-3 rounded-lg border text-xs ${optBg}`}
                                >
                                  <div className="flex items-start space-x-2.5">
                                    <span className="font-bold shrink-0">
                                      {String.fromCharCode(65 + optIdx)}.
                                    </span>
                                    <span>{opt}</span>
                                  </div>

                                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                                    {isThisUserChoice && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                        Your Answer
                                      </span>
                                    )}
                                    {isThisCorrect && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-0.5">
                                        <Check className="w-3 h-3" />
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step Detailed Explanation */}
                      {q.explanation && (
                        <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/20 space-y-1.5">
                          <div className="flex items-center space-x-1.5 text-brand-400 font-bold">
                            <Lightbulb className="w-4 h-4" />
                            <span>Step-by-Step Mathematical & Logical Deduction</span>
                          </div>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                            {q.explanation}
                          </p>
                        </div>
                      )}

                      {/* Company Tags */}
                      {Array.isArray(q.companyTags) && q.companyTags.length > 0 && (
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Frequently asked at: {q.companyTags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeResults;
