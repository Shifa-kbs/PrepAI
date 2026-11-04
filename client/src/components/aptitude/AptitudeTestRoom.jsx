import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building2,
  AlertTriangle,
  LogOut,
  LayoutGrid,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
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
      <div className="text-center py-16 text-slate-500">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <p className="text-base font-bold text-slate-900">No questions available</p>
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
      <Card className="bg-white border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Section & Mode Indicator */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              {session.section || session.category}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                difficultyStyles[currentQuestion.difficulty] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-slate-500 font-bold">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          {/* Right Side: Timer & Action */}
          <div className="flex items-center space-x-3">
            {secondsRemaining !== null && (
              <div
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  isTimerCritical
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : isTimerWarning
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-600" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="md:hidden flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
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
          <Card className="bg-white border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Question Header & Review Flag */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  {currentQuestion.topic || currentQuestion.category}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentQuestion.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleReviewToggle}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isCurrentMarkedForReview
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isCurrentMarkedForReview ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isCurrentMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {currentQuestion.description}
            </div>

            {/* MCQ Options Cards */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose the correct answer:
              </p>
              <div className="space-y-2.5">
                {(currentQuestion.options || []).map((optionText, idx) => {
                  const isSelected = selectedOption === idx;
                  const optionLabel = String.fromCharCode(65 + idx);

                  let optionStateClasses = 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
                  if (isSelected) {
                    optionStateClasses = 'bg-sky-50 border-sky-400 text-sky-950 font-bold ring-1 ring-sky-400 shadow-xs';
                  }

                  if (isPracticeMode && immediateResult) {
                    if (idx === immediateResult.correctAnswerIndex) {
                      optionStateClasses = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                    } else if (isSelected && !immediateResult.isCorrect) {
                      optionStateClasses = 'bg-rose-50 border-rose-400 text-rose-950';
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
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
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
                className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
                  immediateResult.isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold text-sm">
                  {immediateResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Correct Answer! (+20 Points)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600" />
                      <span>Incorrect Choice</span>
                    </>
                  )}
                </div>

                {immediateResult.explanation && (
                  <div className="text-xs text-slate-800 leading-relaxed pt-2 border-t border-slate-200 whitespace-pre-line">
                    <strong className="text-slate-900 block mb-1">Step-by-Step Explanation:</strong>
                    {immediateResult.explanation}
                  </div>
                )}
              </div>
            )}

            {/* Navigation & Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={currentIndex === 0}
                  onClick={handlePrev}
                  className="text-xs font-bold"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentIndex === questions.length - 1}
                  onClick={handleNext}
                  className="text-xs font-bold"
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
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Clear Choice
                  </Button>
                )}

                {isPracticeMode && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handlePracticeSubmit}
                    isLoading={isSubmitting}
                    disabled={selectedOption === null}
                    className="text-xs font-bold"
                  >
                    Check Answer
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Question Palette */}
        <div
          className={`md:col-span-4 lg:col-span-3 space-y-4 ${
            showPaletteMobile ? 'block' : 'hidden md:block'
          }`}
        >
          <Card className="bg-white border-slate-200 p-4 space-y-4 shadow-xs sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Question Palette
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-slate-200" />
                <span>Unattempted ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded ring-2 ring-sky-500 bg-white" />
                <span>Current</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-1.5 pt-2 max-h-72 overflow-y-auto">
              {questions.map((q, idx) => {
                const ans = answersMap.get(q._id.toString());
                const isAnswered = ans && ans.status !== 'skipped';
                const isMarked = Boolean(ans?.markedForReview);
                const isCurrent = idx === currentIndex;

                let pillColor = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isAnswered) {
                  pillColor = 'bg-emerald-500 text-white font-bold border-emerald-500';
                }
                if (isMarked) {
                  pillColor = 'bg-amber-500 text-white font-bold border-amber-500';
                }
                if (isCurrent) {
                  pillColor += ' ring-2 ring-sky-500 ring-offset-1 font-black';
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowPaletteMobile(false);
                    }}
                    className={`h-8 rounded-lg text-xs font-medium border flex items-center justify-center transition-all cursor-pointer ${pillColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowConfirmFinish(true)}
              className="w-full text-xs font-bold mt-2"
            >
              Finish & View Results
            </Button>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card className="max-w-md w-full bg-white border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Submit Assessment?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You have answered <strong className="text-slate-900">{answeredCount}</strong> of{' '}
              <strong className="text-slate-900">{questions.length}</strong> questions. Are you sure you
              want to submit and conclude this session?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmFinish(false)}
                className="text-xs"
              >
                Continue Assessment
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isFinishing}
                onClick={() => {
                  setShowConfirmFinish(false);
                  onFinishSession();
                }}
                className="text-xs font-bold"
              >
                Yes, Submit Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AptitudeTestRoom;
