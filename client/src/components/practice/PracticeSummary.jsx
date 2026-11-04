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
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const PracticeSummary = ({ session, onStartNew, onGoToHistory }) => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const questions = session.questions || [];
  const answers = session.answers || [];

  const answersMap = new Map();
  answers.forEach((a) => {
    answersMap.set(a.question.toString ? a.question.toString() : a.question._id.toString(), a);
  });

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const attemptedCount = answers.filter((a) => a.status !== 'skipped').length;
  const wrongCount = answers.filter((a) => a.status === 'wrong').length;
  const skippedCount = Math.max(0, session.totalQuestions - attemptedCount);
  const reviewCount = answers.filter((a) => a.markedForReview).length;

  const formatDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

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
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session Completed</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Performance Summary</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {session.category} • {session.difficulty} Difficulty • {questions.length} Questions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
              <p className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">
                {session.score}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {session.accuracy}%
              </p>
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
            {formatDuration(session.timeTakenSeconds || 0)}
          </p>
        </Card>
      </div>

      {/* Question-by-Question Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Detailed Answer Review</h2>
            <p className="text-xs text-slate-500">
              Inspect your answers and study verified technical solutions and explanations.
            </p>
          </div>

          {/* Filter pills */}
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
                        Q{idx + 1}. {q.category}
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
                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {q.description}
                    </div>

                    {/* Options Breakdown if MCQ */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Options Evaluation:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
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
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-700">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>Detailed Solution & Explanation:</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
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
            Configure Practice
          </Button>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={RotateCcw}
          onClick={onStartNew}
          className="text-xs font-bold w-full sm:w-auto"
        >
          Start Another Session
        </Button>
      </div>
    </div>
  );
};

export default PracticeSummary;
