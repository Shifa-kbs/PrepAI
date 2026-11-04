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
  Code,
  Building2,
  Lightbulb,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import CodeEditor from './CodeEditor';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const PracticeActiveSession = ({
  session,
  onSubmitAnswer,
  onToggleReview,
  onFinishSession,
  isSubmitting,
  isFinishing,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [lastExecutionResult, setLastExecutionResult] = useState(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);

  // Time tracking per question
  const questionStartTimeRef = useRef(Date.now());

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];

  // Map of answers already submitted for quick lookup
  const answersMap = new Map();
  (session.answers || []).forEach((a) => {
    answersMap.set(a.question.toString(), a);
  });

  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion._id.toString()) : null;
  const isCurrentMarkedForReview = Boolean(currentAnswer?.markedForReview);
  const hasSubmittedCurrent = Boolean(currentAnswer && currentAnswer.status !== 'skipped');

  // Sync selected option and code when question changes or if previously answered
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    if (currentAnswer && currentAnswer.selectedOptionIndex !== undefined) {
      setSelectedOption(currentAnswer.selectedOptionIndex);
    } else {
      setSelectedOption(null);
    }

    if (currentAnswer && currentAnswer.userAnswer) {
      setSubmittedCode(currentAnswer.userAnswer);
    } else {
      setSubmittedCode(currentQuestion?.codeTemplate || '');
    }

    if (currentAnswer && currentAnswer.language) {
      setSelectedLanguage(currentAnswer.language);
    } else {
      setSelectedLanguage('javascript');
    }

    setLastExecutionResult(null);
  }, [currentIndex, currentAnswer, currentQuestion]);

  // Live Timer Countdown (if timed session)
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!session.timeLimitMinutes || session.timeLimitMinutes <= 0) return null;
    const totalSeconds = session.timeLimitMinutes * 60;
    const elapsed = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    return Math.max(0, totalSeconds - elapsed);
  });

  useEffect(() => {
    if (secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      toast.error('Time limit expired! Completing practice session.');
      onFinishSession();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Time limit expired! Completing practice session.');
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

  const handleSubmit = async () => {
    const isCoding = currentQuestion.type === 'coding';
    const isMcq = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0;

    if (isCoding) {
      if (!submittedCode || !submittedCode.trim()) {
        toast.error('Please write some code before submitting your solution');
        return;
      }
    } else if (isMcq) {
      if (selectedOption === null) {
        toast.error('Please select an answer option first');
        return;
      }
    }

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    await onSubmitAnswer({
      questionId: currentQuestion._id,
      selectedAnswerIndex: isMcq ? selectedOption : undefined,
      userAnswer: isCoding ? submittedCode : (selectedOption !== null ? String(selectedOption) : ''),
      code: isCoding ? submittedCode : undefined,
      language: isCoding ? selectedLanguage : undefined,
      timeSpentSeconds: timeSpent,
      markedForReview: isCurrentMarkedForReview,
    });
  };

  const handleReviewToggle = async () => {
    if (!currentQuestion) return;
    await onToggleReview(currentQuestion._id, !isCurrentMarkedForReview);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-500">
        No question found in this practice session.
      </div>
    );
  }

  const answeredCount = (session.answers || []).filter((a) => a.status !== 'skipped').length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Insufficient Questions Notice Banner if requested count > available count */}
      {session.requestedQuestions && session.totalQuestions < session.requestedQuestions && (
        <div className="flex items-start sm:items-center gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-semibold text-amber-900">Question Bank Notice:</strong> You requested{' '}
            {session.requestedQuestions} questions, but only {session.totalQuestions} eligible question{session.totalQuestions > 1 ? 's were' : ' was'} found for {session.category}. Practicing with all {session.totalQuestions} available question{session.totalQuestions > 1 ? 's' : ''}.
          </span>
        </div>
      )}

      {/* Top Header Card */}
      <Card className="bg-white border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Topic & Question Number */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {session.category}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  difficultyStyles[currentQuestion.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-1">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right: Live Timer & Finish Button */}
          <div className="flex items-center gap-3">
            {secondsRemaining !== null && (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                  secondsRemaining < 120
                    ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmFinish(true)}
              className="text-xs"
            >
              Finish Session
            </Button>
          </div>
        </div>

        {/* Question Navigator Pill Bar */}
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-thin">
          {questions.map((q, idx) => {
            const ans = answersMap.get(q._id.toString());
            const isAnswered = ans && ans.status !== 'skipped';
            const isFlagged = Boolean(ans?.markedForReview);
            const isCurrent = idx === currentIndex;

            let pillStyle = 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';

            if (isAnswered) {
              pillStyle = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
            } else if (isFlagged) {
              pillStyle = 'bg-amber-50 text-amber-700 border-amber-300 font-semibold';
            }

            if (isCurrent) {
              pillStyle += ' ring-2 ring-sky-500 border-sky-500 text-sky-800 font-bold';
            }

            return (
              <button
                key={q._id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-medium border flex items-center justify-center shrink-0 transition-all ${pillStyle}`}
                title={`Question ${idx + 1}${isFlagged ? ' (Marked for review)' : ''}${
                  isAnswered ? ' (Answered)' : ''
                }`}
              >
                {isFlagged ? <Flag className="w-3 h-3 text-amber-600" /> : idx + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Question Body Card */}
      <Card className="bg-white border-slate-200 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Problem Statement
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.title}
            </h2>
          </div>

          {/* Mark for review toggle */}
          <button
            type="button"
            onClick={handleReviewToggle}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isCurrentMarkedForReview
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isCurrentMarkedForReview ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">
              {isCurrentMarkedForReview ? 'Flagged for Review' : 'Mark for Review'}
            </span>
          </button>
        </div>

        {/* Company Tags */}
        {currentQuestion.companyTags && currentQuestion.companyTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
            </span>
            {currentQuestion.companyTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
          {currentQuestion.description}
        </div>

        {/* Interactive Code Editor for Coding Questions */}
        {currentQuestion.type === 'coding' ? (
          <div className="pt-2">
            <CodeEditor
              question={currentQuestion}
              initialCode={submittedCode || currentQuestion.codeTemplate}
              onChange={(code, lang) => {
                setSubmittedCode(code);
                if (lang) setSelectedLanguage(lang);
                if (lastExecutionResult && lastExecutionResult.code !== code) {
                  setLastExecutionResult(null);
                }
              }}
              onCodeSubmit={(code, allPassed, lang, res) => {
                setSubmittedCode(code);
                if (lang) setSelectedLanguage(lang);
                setLastExecutionResult({ code, language: lang || selectedLanguage, allPassed, res });
                if (allPassed) {
                  toast.success('All test cases passed! Submit your answer to save progress.');
                }
              }}
            />
          </div>
        ) : (
          currentQuestion.codeTemplate && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Code className="w-3.5 h-3.5 text-sky-600" />
                <span>Reference Code Context:</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto">
                <code>{currentQuestion.codeTemplate}</code>
              </pre>
            </div>
          )
        )}

        {/* Options Selection (MCQ) */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Your Answer:
            </p>

            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;

                let optionStyle =
                  'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700';

                if (isSelected) {
                  optionStyle =
                    'bg-sky-50 border-sky-500 text-sky-950 font-medium ring-1 ring-sky-500';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedOption(idx)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${optionStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Evaluated Result Feedback if already submitted */}
        {hasSubmittedCurrent && (
          <div
            className={`p-4 rounded-xl border flex items-start space-x-3 ${
              currentAnswer.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {currentAnswer.isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div className="space-y-1">
              <p className="text-xs font-bold">
                {currentAnswer.isCorrect ? 'Answer Recorded — Correct!' : 'Answer Recorded — Incorrect'}
              </p>
              <p className="text-xs text-slate-600">
                You can change your selection or proceed to the next question. Full solutions will be unlocked upon session completion.
              </p>
            </div>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              icon={ChevronLeft}
              className="text-xs flex-1 sm:flex-initial"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="text-xs flex-1 sm:flex-initial"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={
                currentQuestion.type === 'coding'
                  ? !submittedCode || !submittedCode.trim()
                  : (currentQuestion.options && currentQuestion.options.length > 0)
                    ? selectedOption === null
                    : false
              }
              icon={Send}
              className="w-full sm:w-auto text-xs"
            >
              {hasSubmittedCurrent ? 'Update Answer' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal for Finishing Session */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <Card className="max-w-md w-full bg-white border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Finish Practice Session?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You have answered <span className="font-semibold text-slate-900">{answeredCount}</span> of{' '}
              <span className="font-semibold text-slate-900">{questions.length}</span> questions. Unanswered questions will be counted as skipped.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmFinish(false)}
                className="text-xs"
              >
                Keep Practicing
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isFinishing}
                onClick={() => {
                  setShowConfirmFinish(false);
                  onFinishSession();
                }}
                className="text-xs"
              >
                Finish & See Results
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PracticeActiveSession;
