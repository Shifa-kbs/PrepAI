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
import CodeEditor from '../components/practice/CodeEditor';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
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

  // Handle Coding Submission & Persistence
  const handleCodingSubmit = async (code, allPassed, lang) => {
    setIsSubmitting(true);
    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    try {
      const res = await submitAnswer(id, {
        code,
        language: lang || 'javascript',
        timeSpentSeconds,
      });

      if (res.success) {
        setUserProgress(res.progress);
        if (res.isCorrect) {
          setSubmissionResult({
            isCorrect: true,
            explanation: res.explanation,
            sampleAnswer: res.sampleAnswer,
          });
          toast.success('🎉 Outstanding! All test cases passed and progress recorded!');
        } else {
          setSubmissionResult({
            isCorrect: false,
            explanation: res.explanation,
            sampleAnswer: res.sampleAnswer,
          });
          toast.error('Some test cases failed. Progress recorded. Review the test outputs and retry!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record coding progress.');
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
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
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
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Questions</span>
        </Link>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          disabled={bookmarkLoading}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            isBookmarked
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span>{isBookmarked ? 'Bookmarked' : 'Save Question'}</span>
        </button>
      </div>

      {/* Main Question Header Card */}
      <Card className="space-y-4 bg-white border-slate-200 shadow-xs">
        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            {question.category}
          </span>

          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              difficultyStyles[question.difficulty] || 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {question.difficulty}
          </span>

          {question.type && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {question.type}
            </span>
          )}

          {/* Solved Status Badge */}
          {isSolved ? (
            <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Solved
            </span>
          ) : userProgress?.status === 'attempted' ? (
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 ml-auto">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Attempted ({userProgress.attempts} attempts)
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 ml-auto">
              Not Attempted
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {question.title}
        </h1>

        {/* Company Tags */}
        {question.companyTags && question.companyTags.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>Target Companies:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {question.companyTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User Progress Stats if attempted */}
        {userProgress && userProgress.attempts > 0 && (
          <div className="flex flex-wrap items-center gap-4 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Attempts:</span>
              <span className="font-bold text-slate-900">{userProgress.attempts}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Correct:</span>
              <span className="font-bold text-emerald-600">{userProgress.correctAttempts}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Incorrect:</span>
              <span className="font-bold text-rose-600">{userProgress.incorrectAttempts}</span>
            </span>
            {userProgress.timeSpentSeconds > 0 && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
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
      <Card className="bg-white border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-sky-600" />
          <span>Problem Statement</span>
        </div>
        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
          {question.description}
        </div>

        {/* Interactive Code Editor for Coding Questions */}
        {question.type === 'coding' ? (
          <div className="pt-3">
            <CodeEditor
              question={question}
              initialCode={question.codeTemplate}
              onCodeSubmit={handleCodingSubmit}
            />
          </div>
        ) : (
          question.codeTemplate && (
            <div className="pt-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-2">
                <Code className="w-3.5 h-3.5 text-sky-600" />
                <span>Reference Code Context:</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 text-xs font-mono overflow-x-auto">
                <code>{question.codeTemplate}</code>
              </pre>
            </div>
          )
        )}
      </Card>

      {/* Answer Options Section */}
      {question.options && question.options.length > 0 && (
        <Card className="bg-white border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Select the Correct Answer</span>
              <span className="text-[10px] font-normal text-slate-400">
                (Choose one option and submit to verify)
              </span>
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected Verification</span>
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = submissionResult?.correctAnswerIndex === idx;
              const isUserChoice = submissionResult && isSelected;

              let optionStyle =
                'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';

              if (hasSubmitted) {
                if (isCorrectAnswer) {
                  optionStyle =
                    'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-xs';
                } else if (isUserChoice && !submissionResult.isCorrect) {
                  optionStyle =
                    'bg-rose-50 border-rose-400 text-rose-900 font-medium';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle =
                  'bg-sky-50 border-sky-400 text-sky-900 font-bold ring-1 ring-sky-400 shadow-xs';
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
                            ? 'bg-emerald-600 text-white'
                            : isUserChoice
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-400'
                          : isSelected
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </div>
                  <div className="flex-1 text-xs sm:text-sm leading-relaxed">
                    {opt}
                  </div>
                  {hasSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {hasSubmitted && isUserChoice && !submissionResult.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              {hasSubmitted
                ? 'Your answer has been evaluated. Review the explanation below or try again.'
                : 'Select an option to evaluate your answer or reveal the solution directly.'}
            </p>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!hasSubmitted && (
                <Button
                  variant="outline"
                  onClick={handleRevealSolution}
                  isLoading={isSubmitting}
                  icon={Eye}
                  className="w-full sm:w-auto text-xs"
                >
                  Reveal Solution
                </Button>
              )}
              <Button
                variant="primary"
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

      {/* Conceptual & Open-Ended Practice Card */}
      {(!question.options || question.options.length === 0) && (
        <Card className="bg-white border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-sky-600" />
              <span>Conceptual & Architectural Practice</span>
            </h2>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solution Verification</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Take a moment to formulate your solution, complexity trade-offs, or talking points in mind or in the notes section below, then reveal the verified model solution.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              {hasSubmitted ? 'Solution revealed below.' : 'Click below when you are ready to compare your thoughts.'}
            </p>

            <Button
              variant="primary"
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

      {/* Result & Explanation Banner */}
      {hasSubmitted && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Result Alert */}
          <div
            className={`p-4 sm:p-5 rounded-xl border flex items-start space-x-3.5 ${
              submissionResult.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : submissionResult.isRevealed
                ? 'bg-sky-50 border-sky-200 text-sky-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {submissionResult.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : submissionResult.isRevealed ? (
              <Lightbulb className="w-6 h-6 text-sky-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-bold">
                {submissionResult.isCorrect
                  ? 'Correct Solution Verified!'
                  : submissionResult.isRevealed
                  ? 'Model Solution & Explanation Revealed'
                  : 'Incorrect Solution'}
              </h3>
              <p className="text-xs mt-1 text-slate-700 leading-relaxed">
                {submissionResult.isCorrect
                  ? 'Great job! Your answer matches the optimal technical solution.'
                  : submissionResult.isRevealed
                  ? 'Study the explanation and optimal formulation below to reinforce your interview mastery.'
                  : 'Your selected choice is not correct. Review the explanation and sample solution below.'}
              </p>
            </div>
          </div>

          {/* Detailed Solution / Explanation Card */}
          <Card className="bg-white border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 pb-2 border-b border-slate-100">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Technical Solution & Explanation
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
              {submissionResult.explanation ||
                'No detailed explanation provided for this question.'}
            </div>

            {/* Sample Answer if present */}
            {submissionResult.sampleAnswer && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Key Takeaway / Optimal Formulation:
                </span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-emerald-800 leading-relaxed">
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
