import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Building2,
  Lightbulb,
  AlertTriangle,
  LogOut,
  Sparkles,
  LayoutGrid,
  Check,
  RotateCcw,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const AptitudeTestRoom = ({
  session,
  onSubmitAnswer,
  onToggleReview,
  onFinishSession,
  isSubmitting,
  isFinishing,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState(false);
  const [immediateResult, setImmediateResult] = useState(null); // Used only in topic practice mode

  const questionStartTimeRef = useRef(Date.now());

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];

  const isPracticeMode = session.mode === 'topic';

  // Map of answers already submitted for quick lookup
  const answersMap = new Map();
  (session.answers || []).forEach((a) => {
    const qIdStr = a.question.toString ? a.question.toString() : a.question;
    answersMap.set(qIdStr, a);
  });

  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion._id.toString()) : null;
  const isCurrentMarkedForReview = Boolean(currentAnswer?.markedForReview);
  const hasSubmittedCurrent = Boolean(currentAnswer && currentAnswer.status !== 'skipped');

  // Sync selected option when current question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setImmediateResult(null);

    if (currentAnswer && currentAnswer.selectedOptionIndex !== undefined) {
      setSelectedOption(currentAnswer.selectedOptionIndex);
      if (isPracticeMode && currentAnswer.status) {
        setImmediateResult({
          isCorrect: currentAnswer.isCorrect,
          selectedAnswerIndex: currentAnswer.selectedOptionIndex,
        });
      }
    } else {
      setSelectedOption(null);
    }
  }, [currentIndex, currentAnswer, isPracticeMode]);

  // Live Countdown Timer (if timed test)
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!session.timeLimitMinutes || session.timeLimitMinutes <= 0) return null;
    const totalSeconds = session.timeLimitMinutes * 60;
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  });

  useEffect(() => {
    if (secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      toast.error('Time limit has expired! Submitting your assessment...');
      onFinishSession();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Time limit expired! Auto-submitting assessment...');
          onFinishSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onFinishSession]);

  const formatTimer = (totalSecs) => {
    if (totalSecs === null) return null;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Option selection
  const handleSelectOption = (idx) => {
    setSelectedOption(idx);
    // In formal assessment mode, auto-save choice to keep session synced
    if (!isPracticeMode && currentQuestion) {
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
      onSubmitAnswer({
        questionId: currentQuestion._id,
        selectedAnswerIndex: idx,
        timeSpentSeconds: timeSpent,
        markedForReview: isCurrentMarkedForReview,
      });
    }
  };

  // Manual submit in practice mode
  const handlePracticeSubmit = async () => {
    if (selectedOption === null) {
      toast.error('Please select an option first');
      return;
    }

    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    const res = await onSubmitAnswer({
      questionId: currentQuestion._id,
      selectedAnswerIndex: selectedOption,
      timeSpentSeconds: timeSpent,
      markedForReview: isCurrentMarkedForReview,
    });

    if (res) {
      setImmediateResult(res);
    }
  };

  // Toggle mark for review
  const handleReviewToggle = async () => {
    if (!currentQuestion) return;
    await onToggleReview(currentQuestion._id, !isCurrentMarkedForReview);
  };

  // Clear chosen selection
  const handleClearSelection = () => {
    setSelectedOption(null);
    setImmediateResult(null);
  };

  // Navigate next / prev
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-16 text-slate-400">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-base font-semibold text-white">No questions available</p>
        <p className="text-xs text-slate-500 mt-1">This assessment session has no question data.</p>
      </div>
    );
  }

  // Question counts for palette
  const answeredCount = (session.answers || []).filter((a) => a.status !== 'skipped').length;
  const reviewCount = (session.answers || []).filter((a) => a.markedForReview).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  const isTimerCritical = secondsRemaining !== null && secondsRemaining < 60;
  const isTimerWarning = secondsRemaining !== null && secondsRemaining < 300 && !isTimerCritical;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Status Bar */}
      <Card className="bg-slate-900/95 border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Section & Mode Indicator */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
              {session.section || session.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                difficultyStyles[currentQuestion.difficulty] || 'bg-slate-800 text-slate-300'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Right Side: Timer & Action */}
          <div className="flex items-center space-x-3">
            {secondsRemaining !== null && (
              <div
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  isTimerCritical
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isTimerWarning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950/80 text-slate-200 border-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-brand-400" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="md:hidden flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Palette</span>
            </button>

            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={() => setShowConfirmFinish(true)}
              className="text-xs font-bold"
            >
              Submit Test
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Grid: Question Content (Left) & Question Palette (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Question & Options */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
            {/* Question Header & Review Flag */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  {currentQuestion.topic || currentQuestion.category}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {currentQuestion.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleReviewToggle}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isCurrentMarkedForReview
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentMarkedForReview ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isCurrentMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
              {currentQuestion.description}
            </div>

            {/* MCQ Options Cards */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose the correct answer:
              </p>
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((optionText, idx) => {
                  const isSelected = selectedOption === idx;
                  const optionLabel = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'

                  // In practice mode after submission, highlight correct/wrong
                  let optionStateClasses = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (isSelected) {
                    optionStateClasses = 'bg-brand-600/20 border-brand-500 text-white shadow-sm shadow-brand-500/10';
                  }

                  if (isPracticeMode && immediateResult) {
                    if (idx === immediateResult.correctAnswerIndex) {
                      optionStateClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !immediateResult.isCorrect) {
                      optionStateClasses = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full flex items-start space-x-3.5 p-4 rounded-xl border text-left text-sm transition-all cursor-pointer ${optionStateClasses}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs border ${
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-400'
                            : 'bg-slate-900 text-slate-400 border-slate-700'
                        }`}
                      >
                        {optionLabel}
                      </span>
                      <span className="flex-1 mt-0.5 leading-relaxed">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Immediate Explanation Banner in Practice Mode */}
            {isPracticeMode && immediateResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 animate-fade-in ${
                  immediateResult.isCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {immediateResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Correct Answer! (+20 Points)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>Incorrect Choice</span>
                    </>
                  )}
                </div>

                {immediateResult.explanation && (
                  <div className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800 whitespace-pre-line">
                    <strong className="text-white block mb-1">Step-by-Step Explanation:</strong>
                    {immediateResult.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Navigation & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={currentIndex === 0}
                  onClick={handlePrev}
                  className="text-xs font-semibold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === questions.length - 1}
                  onClick={handleNext}
                  className="text-xs font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {selectedOption !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear Choice
                  </Button>
                )}

                {isPracticeMode && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    isLoading={isSubmitting}
                    disabled={selectedOption === null}
                    onClick={handlePracticeSubmit}
                    className="text-xs font-bold"
                  >
                    Verify Answer
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Question Palette (Sticky on desktop) */}
        <div
          className={`md:col-span-4 lg:col-span-3 ${
            showPaletteMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <Card className="bg-slate-900 border-slate-800 p-4 space-y-4 md:sticky md:top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-brand-400" />
                <span>Question Palette</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                {answeredCount}/{questions.length} Answered
              </span>
            </div>

            {/* Palette Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-brand-400" />
                <span>Current</span>
              </div>
            </div>

            {/* Palette Number Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const ans = answersMap.get(q._id.toString());
                const isAnswered = Boolean(ans && ans.status !== 'skipped');
                const isReview = Boolean(ans && ans.markedForReview);
                const isCurrent = currentIndex === idx;

                let paletteColor = 'bg-slate-800 text-slate-400 border-slate-700';
                if (isAnswered) {
                  paletteColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                }
                if (isReview) {
                  paletteColor = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                }
                if (isCurrent) {
                  paletteColor += ' ring-2 ring-brand-400 ring-offset-2 ring-offset-slate-900';
                }

                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPaletteMobile(false);
                    }}
                    className={`h-9 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer ${paletteColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Test Completion Button */}
            <div className="pt-2">
              <Button
                variant="danger"
                size="md"
                onClick={() => setShowConfirmFinish(true)}
                isLoading={isFinishing}
                className="w-full text-xs font-bold"
              >
                Finish & Submit Assessment
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Submit Assessment?</h4>
                <p className="text-xs text-slate-400">Review your test progress before submitting.</p>
              </div>
            </div>

            {/* Summary Counts */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs">
              <div>
                <p className="text-slate-400 font-medium">Answered</p>
                <p className="text-lg font-black text-emerald-400 mt-0.5">{answeredCount}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">For Review</p>
                <p className="text-lg font-black text-amber-400 mt-0.5">{reviewCount}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Unanswered</p>
                <p className="text-lg font-black text-rose-400 mt-0.5">{unansweredCount}</p>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. Unanswered
                questions will receive 0 marks.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmFinish(false)}
                className="text-xs"
              >
                Return to Test
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={isFinishing}
                onClick={async () => {
                  setShowConfirmFinish(false);
                  await onFinishSession();
                }}
                className="text-xs font-bold px-5"
              >
                Yes, Submit Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeTestRoom;
