import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const PracticeSummary = ({ session, onStartNew, onGoToHistory }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'wrong', 'correct', 'review'
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
      <Card className="relative overflow-hidden bg-gradient-to-r from-brand-900/40 via-slate-900 to-slate-900 border-brand-500/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Session Completed</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Performance Summary</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {session.category} • {session.difficulty} Difficulty • {questions.length} Questions
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Score Pill */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Score</p>
              <p className="text-2xl sm:text-3xl font-black text-brand-400 mt-1">
                {session.score}
              </p>
            </div>
            {/* Accuracy Pill */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                {session.accuracy}%
              </p>
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
          <p className="text-xs text-slate-400 font-medium">Skipped</p>
          <p className="text-xl font-extrabold text-slate-400 mt-1">{skippedCount}</p>
        </Card>

        <Card className="p-4 bg-slate-900/80 border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">Time Taken</p>
          <p className="text-xl font-extrabold text-indigo-300 mt-1">
            {formatDuration(session.timeTakenSeconds || 0)}
          </p>
        </Card>
      </div>

      {/* Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onStartNew}
            icon={RotateCcw}
            className="text-xs"
          >
            Start Another Session
          </Button>
          <Link to="/questions">
            <Button variant="outline" size="sm" icon={BookOpen} className="text-xs">
              Question Bank
            </Button>
          </Link>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onGoToHistory}
          icon={History}
          className="text-xs"
        >
          View Practice History
        </Button>
      </div>

      {/* Question Review Section */}
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
                filter === 'all' ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'wrong' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wrong ({wrongCount})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'correct' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Correct ({correctCount})
            </button>
            {reviewCount > 0 && (
              <button
                onClick={() => setFilter('review')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  filter === 'review' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flagged ({reviewCount})
              </button>
            )}
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const ans = answersMap.get(q._id.toString());
            const isCorrect = Boolean(ans?.isCorrect);
            const isSkipped = !ans || ans.status === 'skipped';
            const isExpanded = expandedId === q._id;

            return (
              <Card
                key={q._id}
                className="bg-slate-900/80 border-slate-800 transition-all hover:border-slate-700 space-y-3"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q._id)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start space-x-3">
                    <span className="mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isSkipped ? (
                        <HelpCircle className="w-5 h-5 text-slate-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Question {idx + 1}
                        </span>
                        <span className="text-xs px-2 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                          {q.category}
                        </span>
                        {ans?.markedForReview && (
                          <span className="flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-semibold">
                            <Flag className="w-2.5 h-2.5 mr-1" />
                            Flagged
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">{q.title}</h3>
                    </div>
                  </div>

                  <button className="p-1 rounded text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Details: Problem, Options, and Solutions */}
                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t border-slate-800/80 text-xs text-slate-200 animate-in fade-in duration-200">
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{q.description}</p>

                    {/* Options list */}
                    {q.options && q.options.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                          Options Evaluation:
                        </p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isCorrectOpt = q.correctAnswerIndex === optIdx;
                            const isUserSelection = ans && ans.selectedOptionIndex === optIdx;

                            let optBorder = 'border-slate-800/80 bg-slate-950/40 text-slate-400';
                            if (isCorrectOpt) {
                              optBorder = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold';
                            } else if (isUserSelection && !isCorrect) {
                              optBorder = 'border-rose-500/40 bg-rose-500/10 text-rose-300';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${optBorder}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span>{opt}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isUserSelection && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrectOpt && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                      <Check className="w-3 h-3" /> Correct
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Explanation Card */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-brand-500/20 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-brand-300 font-bold text-xs">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>Technical Explanation</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {/* Key Takeaway / Sample Answer */}
                    {q.sampleAnswer && (
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          Optimal Formulation:
                        </span>
                        <p className="text-xs font-mono text-emerald-300 leading-relaxed">
                          {q.sampleAnswer}
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
    </div>
  );
};

export default PracticeSummary;
