import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  Send,
  HelpCircle,
  Lightbulb,
  Code,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import {
  getQuestionById,
  submitAnswer,
  revealSolution,
  toggleBookmark,
} from '../services/questionService';
import QuestionNotes from '../components/questions/QuestionNotes';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const QuestionDetailPage = () => {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time spent tracking
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    let isMounted = true;
    startTimeRef.current = Date.now();

    const fetchQuestion = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuestionById(id);
        if (data.success && isMounted) {
          setQuestion(data.question);
          setUserProgress(data.userProgress);
          setIsBookmarked(Boolean(data.userProgress?.isBookmarked));

          // If the question was already solved/attempted in a past session,
          // question.explanation may have been returned by backend for review!
          if (data.question.explanation) {
            setSubmissionResult({
              isCorrect: data.userProgress?.status === 'solved',
              correctAnswerIndex: data.question.correctAnswerIndex,
              explanation: data.question.explanation,
              sampleAnswer: data.question.sampleAnswer,
            });
            if (data.question.correctAnswerIndex !== undefined) {
              setSelectedOption(data.question.correctAnswerIndex);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              'Failed to load question details. It might not exist or the server is unavailable.'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuestion();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    if (selectedOption === null) {
      toast.error('Please select an option before submitting!');
      return;
    }

    setIsSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await submitAnswer(id, {
        selectedAnswerIndex: selectedOption,
        timeSpentSeconds,
      });

      if (res.success) {
        setSubmissionResult({
          isCorrect: res.isCorrect,
          correctAnswerIndex: res.correctAnswerIndex,
          explanation: res.explanation,
          sampleAnswer: res.sampleAnswer,
        });

        setUserProgress(res.progress);

        if (res.isCorrect) {
          toast.success('Correct! Outstanding work! 🎉');
        } else {
          toast.error('Incorrect. Study the explanation to reinforce your learning.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reveal Solution
  const handleRevealSolution = async () => {
    setIsSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await revealSolution(id, { timeSpentSeconds });
      if (res.success) {
        setSubmissionResult({
          isCorrect: false,
          isRevealed: true,
          correctAnswerIndex: res.correctAnswerIndex,
          explanation: res.explanation,
          sampleAnswer: res.sampleAnswer,
        });

        setUserProgress(res.progress);
        if (res.correctAnswerIndex !== undefined) {
          setSelectedOption(res.correctAnswerIndex);
        }
        toast.success('Solution and explanation revealed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reveal solution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Bookmark
  const handleBookmarkToggle = async () => {
    if (bookmarkLoading) return;
    setBookmarkLoading(true);

    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      const res = await toggleBookmark(id);
      setIsBookmarked(res.isBookmarked);
      toast.success(res.message);
    } catch (err) {
      setIsBookmarked(prev);
      toast.error('Failed to toggle bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading question..." />;
  }

  if (error || !question) {
    return (
      <div className="space-y-4">
        <Link
          to="/questions"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Question Bank</span>
        </Link>
        <ErrorMessage message={error || 'Question not found'} />
      </div>
    );
  }

  const hasSubmitted = Boolean(submissionResult);
  const isSolved = userProgress?.status === 'solved';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Nav Breadcrumb & Bookmark Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/questions"
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Questions</span>
        </Link>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isBookmarked
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          <span>{isBookmarked ? 'Bookmarked' : 'Save Question'}</span>
        </button>
      </div>

      {/* Main Question Header Card */}
      <Card className="space-y-4 bg-slate-900/90 border-slate-800">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
            {question.category}
          </span>

          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              difficultyStyles[question.difficulty] || 'bg-slate-800 text-slate-300'
            }`}
          >
            {question.difficulty}
          </span>

          {question.type && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {question.type}
            </span>
          )}

          {/* Solved Status Badge */}
          {isSolved ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Solved
            </span>
          ) : userProgress?.status === 'attempted' ? (
            <span className="inline-flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 ml-auto">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Attempted ({userProgress.attempts} attempts)
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700 ml-auto">
              Not Attempted
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {question.title}
        </h1>

        {/* Company Tags */}
        {question.companyTags && question.companyTags.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>Target Companies:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {question.companyTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User Progress Stats if attempted */}
        {userProgress && userProgress.attempts > 0 && (
          <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-slate-800/60 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Attempts:</span>
              <span className="font-semibold text-slate-200">{userProgress.attempts}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Correct:</span>
              <span className="font-semibold text-emerald-400">{userProgress.correctAttempts}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Incorrect:</span>
              <span className="font-semibold text-rose-400">{userProgress.incorrectAttempts}</span>
            </span>
            {userProgress.timeSpentSeconds > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {Math.floor(userProgress.timeSpentSeconds / 60)}m{' '}
                  {userProgress.timeSpentSeconds % 60}s spent
                </span>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Question Description */}
      <Card className="bg-slate-900/60 border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-brand-400" />
          <span>Problem Statement</span>
        </div>
        <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
          {question.description}
        </div>

        {/* Optional Code Template Snippet */}
        {question.codeTemplate && (
          <div className="pt-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Code Context:</span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <code>{question.codeTemplate}</code>
            </pre>
          </div>
        )}
      </Card>

      {/* Answer Options Section */}
      {question.options && question.options.length > 0 && (
        <Card className="bg-slate-900/80 border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Select the Correct Answer</span>
              <span className="text-[10px] font-normal text-slate-400">
                (Choose one option and submit to verify)
              </span>
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected Verification</span>
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = submissionResult?.correctAnswerIndex === idx;
              const isUserChoice = submissionResult && isSelected;

              // Compute color state after submission
              let optionStyle =
                'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';

              if (hasSubmitted) {
                if (isCorrectAnswer) {
                  optionStyle =
                    'bg-emerald-500/10 border-emerald-500/60 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/10';
                } else if (isUserChoice && !submissionResult.isCorrect) {
                  optionStyle =
                    'bg-rose-500/10 border-rose-500/60 text-rose-300 font-medium';
                } else {
                  optionStyle = 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                optionStyle =
                  'bg-brand-600/20 border-brand-500 text-brand-200 font-medium ring-1 ring-brand-500';
              }

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${optionStyle}`}
                >
                  <div className="pt-0.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        hasSubmitted
                          ? isCorrectAnswer
                            ? 'bg-emerald-500 text-slate-950'
                            : isUserChoice
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                          : isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {opt}
                  </div>
                  {hasSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasSubmitted && isUserChoice && !submissionResult.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              {hasSubmitted
                ? 'Your answer has been evaluated. Review the explanation below or try again.'
                : 'Select an option to evaluate your answer or reveal the solution directly.'}
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!hasSubmitted && (
                <Button
                  variant="secondary"
                  onClick={handleRevealSolution}
                  isLoading={isSubmitting}
                  icon={Eye}
                  className="w-full sm:w-auto text-xs"
                >
                  Reveal Solution
                </Button>
              )}
              <Button
                onClick={handleSubmitAnswer}
                isLoading={isSubmitting}
                disabled={selectedOption === null}
                icon={Send}
                className="w-full sm:w-auto text-xs"
              >
                {hasSubmitted ? 'Re-Submit Answer' : 'Submit Answer'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Conceptual & Open-Ended Practice Card (for questions without MCQ options) */}
      {(!question.options || question.options.length === 0) && (
        <Card className="bg-slate-900/80 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-brand-400" />
              <span>Conceptual & Architectural Practice</span>
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Solution Verification</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Take a moment to formulate your solution, complexity trade-offs, or talking points in mind or in the notes section below, then reveal the verified model solution.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              {hasSubmitted ? 'Solution revealed below.' : 'Click below when you are ready to compare your thoughts.'}
            </p>

            <Button
              onClick={handleRevealSolution}
              isLoading={isSubmitting}
              icon={Eye}
              className="w-full sm:w-auto text-xs"
            >
              {hasSubmitted ? 'Refresh Solution' : 'Reveal Solution & Explanation'}
            </Button>
          </div>
        </Card>
      )}

      {/* Result & Explanation Banner (Shown ONLY after submission or reveal) */}
      {hasSubmitted && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Result Alert */}
          <div
            className={`p-4 sm:p-5 rounded-xl border flex items-start space-x-3.5 ${
              submissionResult.isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : submissionResult.isRevealed
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {submissionResult.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : submissionResult.isRevealed ? (
              <Lightbulb className="w-6 h-6 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold">
                {submissionResult.isCorrect
                  ? 'Correct Solution Verified!'
                  : submissionResult.isRevealed
                  ? 'Model Solution & Explanation Revealed'
                  : 'Incorrect Solution'}
              </h3>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                {submissionResult.isCorrect
                  ? 'Great job! Your answer matches the optimal technical solution.'
                  : submissionResult.isRevealed
                  ? 'Study the explanation and optimal formulation below to reinforce your interview mastery.'
                  : 'Your selected choice is not correct. Review the explanation and sample solution below.'}
              </p>
            </div>
          </div>

          {/* Detailed Solution / Explanation Card */}
          <Card className="bg-slate-900/90 border-brand-500/30 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-brand-300 pb-2 border-b border-slate-800">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Detailed Technical Solution & Explanation
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {submissionResult.explanation ||
                'No detailed explanation provided for this question.'}
            </div>

            {/* Sample Answer if present */}
            {submissionResult.sampleAnswer && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Key Takeaway / Optimal Formulation:
                </span>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed">
                  {submissionResult.sampleAnswer}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Question Notes Section */}
      <QuestionNotes
        questionId={id}
        initialNotes={userProgress?.notes || ''}
        onNotesSaved={(updatedNotes) => {
          setUserProgress((prev) => ({
            ...prev,
            notes: updatedNotes,
          }));
        }}
      />
    </div>
  );
};

export default QuestionDetailPage;
