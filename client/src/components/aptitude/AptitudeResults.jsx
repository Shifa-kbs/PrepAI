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
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      };
    }
    if (acc >= 60) {
      return {
        label: 'Good Performance',
        color: 'bg-sky-50 text-sky-800 border-sky-300',
      };
    }
    return {
      label: 'Needs Practice',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
    };
  };

  const performanceMeta = getPerformanceBadge(accuracy);
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
      <Card className="relative overflow-hidden bg-white border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assessment Completed</span>
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${performanceMeta.color}`}
              >
                {performanceMeta.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Aptitude Assessment Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {session?.section || session?.category} • {session?.difficulty} Difficulty •{' '}
              {totalQuestions} Questions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Score Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
              <p className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">{totalScore}</p>
            </div>
            {/* Accuracy Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{accuracy}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-white border-slate-200 text-center shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Correct Answers</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{correctCount}</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 text-center shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Incorrect</p>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{wrongCount}</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 text-center shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Unanswered</p>
          <p className="text-xl font-extrabold text-slate-500 mt-1">{skippedCount}</p>
        </Card>

        <Card className="p-4 bg-white border-slate-200 text-center shadow-xs">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Taken</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {formatDuration(session?.timeTakenSeconds || 0)}
          </p>
        </Card>
      </div>

      {/* Recommended Topics Section */}
      {recommendedTopics.length > 0 ? (
        <Card className="bg-amber-50/60 border-amber-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold">Recommended Topics to Practise Next</h3>
          </div>
          <p className="text-xs text-slate-600">
            Based on your test attempt, strengthening accuracy in these areas will significantly improve
            your overall placement score:
          </p>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {recommendedTopics.map((top) => (
              <button
                key={top}
                onClick={() => onPracticeTopic && onPracticeTopic(top)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer group shadow-xs"
              >
                <span>{top}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="bg-emerald-50 border-emerald-200 p-4 flex items-center space-x-3 text-emerald-900 shadow-xs">
          <Sparkles className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="text-xs">
            <strong className="font-bold">High Proficiency Achieved:</strong> You scored 70%
            or higher across all tested topics in this assessment. Excellent work!
          </p>
        </Card>
      )}

      {/* Question-by-Question Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detailed Answer Review</h2>
            <p className="text-xs text-slate-500">
              Inspect your answers and study step-by-step mathematical & logical explanations.
            </p>
          </div>

          {/* Review Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'wrong'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'correct'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({correctCount})
            </button>
            {reviewCount > 0 && (
              <button
                onClick={() => setFilter('review')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'review'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Review ({reviewCount})
              </button>
            )}
          </div>
        </div>

        {/* Questions Accordion List */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const ans = answersMap.get(q._id.toString());
            const isCorrect = Boolean(ans?.isCorrect);
            const isSkipped = !ans || ans.status === 'skipped';
            const isExpanded = expandedId === q._id.toString();

            return (
              <Card
                key={q._id}
                className={`transition-all bg-white border-slate-200 shadow-xs ${
                  isExpanded ? 'ring-1 ring-sky-400' : ''
                }`}
              >
                <div
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : q._id.toString())}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-sky-600">
                        Q{idx + 1}. {q.topic || q.category}
                      </span>
                      {ans?.markedForReview && (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Flag className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                          Marked
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                      {q.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {isCorrect ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct</span>
                      </span>
                    ) : isSkipped ? (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        Unanswered
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect</span>
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Detailed Answer & Deduction */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                    {/* Full Question Statement */}
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {q.description}
                    </div>

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Options Evaluation:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(q.options || []).map((opt, optIdx) => {
                          const isUserChoice = ans && ans.selectedOptionIndex === optIdx;
                          const isRealCorrect = q.correctAnswerIndex === optIdx;

                          let style = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isRealCorrect) {
                            style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                          } else if (isUserChoice && !isRealCorrect) {
                            style = 'bg-rose-50 border-rose-300 text-rose-950';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${style}`}
                            >
                              <span className="font-bold shrink-0">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="flex-1 leading-snug">{opt}</span>
                              {isRealCorrect && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                  Correct
                                </span>
                              )}
                              {isUserChoice && !isRealCorrect && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded shrink-0">
                                  Your Choice
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-700">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Detailed Deduction & Shortcut:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            icon={History}
            onClick={onGoToHistory}
            className="text-xs font-bold flex-1 sm:flex-initial"
          >
            Session History
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={BookOpen}
            onClick={onStartNew}
            className="text-xs font-bold flex-1 sm:flex-initial"
          >
            Assessment Hub
          </Button>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={RotateCcw}
          onClick={onStartNew}
          className="text-xs font-bold w-full sm:w-auto"
        >
          Take Another Test
        </Button>
      </div>
    </div>
  );
};

export default AptitudeResults;
