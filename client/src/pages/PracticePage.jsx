import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Code2,
  History,
  RotateCcw,
  Sparkles,
  Layers,
} from 'lucide-react';
import PracticeSetup from '../components/practice/PracticeSetup';
import PracticeActiveSession from '../components/practice/PracticeActiveSession';
import PracticeSummary from '../components/practice/PracticeSummary';
import PracticeHistory from '../components/practice/PracticeHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  startPracticeSession,
  getActivePracticeSession,
  getPracticeSessionById,
  submitPracticeAnswer,
  toggleReviewFlag,
  finishPracticeSession,
  abandonActiveSession,
} from '../services/practiceService';
import toast from 'react-hot-toast';

const PracticePage = () => {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session');

  const [tab, setTab] = useState('setup'); // 'setup', 'active', 'summary', 'history'
  const [activeSession, setActiveSession] = useState(null);
  const [summarySession, setSummarySession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState(null);

  // Check for active session or requested session on mount
  useEffect(() => {
    const initPractice = async () => {
      setLoading(true);
      setError(null);
      try {
        if (sessionIdParam) {
          // If specific session requested (e.g. from history or link)
          const data = await getPracticeSessionById(sessionIdParam);
          if (data.success && data.session) {
            if (data.session.status === 'completed') {
              setSummarySession(data.session);
              setTab('summary');
            } else if (data.session.status === 'in-progress') {
              setActiveSession(data.session);
              setTab('active');
            }
          }
        } else {
          // Check if user has an active session in progress
          const activeData = await getActivePracticeSession();
          if (activeData.success && activeData.session) {
            setActiveSession(activeData.session);
          }
        }
      } catch (err) {
        console.error('Failed to initialize practice:', err);
      } finally {
        setLoading(false);
      }
    };

    initPractice();
  }, [sessionIdParam]);

  // Start new practice session
  const handleStartSession = async (payload) => {
    setIsStarting(true);
    try {
      const data = await startPracticeSession(payload);
      if (data.success && data.session) {
        setActiveSession(data.session);
        setTab('active');
        if (data.isPartial) {
          toast(
            data.message ||
              `Started session with all ${data.availableCount} available questions for this category.`,
            { icon: 'ℹ️', duration: 6000 }
          );
        } else if (data.resumed) {
          toast(data.message || 'Resumed active practice session', { icon: 'ℹ️' });
        } else {
          toast.success(data.message || 'Practice session started!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start practice session');
    } finally {
      setIsStarting(false);
    }
  };

  // Resume existing active session
  const handleResumeSession = () => {
    if (activeSession) {
      setTab('active');
    }
  };

  // Discard existing active session
  const handleDiscardActive = async () => {
    try {
      await abandonActiveSession();
      setActiveSession(null);
      toast.success('Active session discarded');
    } catch (err) {
      toast.error('Failed to discard active session');
    }
  };

  // Submit answer for active session
  const handleSubmitAnswer = async (answerData) => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const res = await submitPracticeAnswer(activeSession._id, answerData);
      if (res.success) {
        // Update local session answers
        setActiveSession((prev) => {
          if (!prev) return prev;
          const answers = [...(prev.answers || [])];
          const existingIdx = answers.findIndex(
            (a) => a.question.toString() === answerData.questionId.toString()
          );

          const newAnswer = {
            question: answerData.questionId,
            selectedOptionIndex: answerData.selectedAnswerIndex,
            isCorrect: res.isCorrect,
            status: res.isCorrect ? 'correct' : 'wrong',
            timeSpentSeconds: answerData.timeSpentSeconds,
            markedForReview: answerData.markedForReview,
          };

          if (existingIdx >= 0) {
            answers[existingIdx] = newAnswer;
          } else {
            answers.push(newAnswer);
          }

          return {
            ...prev,
            answers,
            score: res.sessionStats?.score ?? prev.score,
            accuracy: res.sessionStats?.accuracy ?? prev.accuracy,
          };
        });

        if (res.isCorrect) {
          toast.success('Correct answer! +20 points');
        } else {
          toast.error('Incorrect. Keep going!');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle mark for review
  const handleToggleReview = async (questionId, markedForReview) => {
    if (!activeSession) return;
    try {
      const res = await toggleReviewFlag(activeSession._id, {
        questionId,
        markedForReview,
      });

      if (res.success) {
        setActiveSession((prev) => {
          if (!prev) return prev;
          const answers = [...(prev.answers || [])];
          const existingIdx = answers.findIndex(
            (a) => a.question.toString() === questionId.toString()
          );

          if (existingIdx >= 0) {
            answers[existingIdx].markedForReview = markedForReview;
          } else {
            answers.push({
              question: questionId,
              status: 'skipped',
              markedForReview,
            });
          }

          return { ...prev, answers };
        });

        toast.success(res.message);
      }
    } catch (err) {
      toast.error('Failed to update review flag');
    }
  };

  // Finish active session
  const handleFinishSession = async () => {
    if (!activeSession) return;
    setIsFinishing(true);
    try {
      const res = await finishPracticeSession(activeSession._id);
      if (res.success && res.session) {
        setSummarySession(res.session);
        setActiveSession(null);
        setTab('summary');
        toast.success('Session completed! View your performance summary below.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finish session');
    } finally {
      setIsFinishing(false);
    }
  };

  // Select historical session for review
  const handleSelectHistorySession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await getPracticeSessionById(sessionId);
      if (res.success && res.session) {
        setSummarySession(res.session);
        setTab('summary');
      }
    } catch (err) {
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading practice workspace..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Tab Bar (Hidden during active session to minimize distraction) */}
      {tab !== 'active' && (
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTab('setup')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'setup'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Practice Setup</span>
          </button>

          <button
            onClick={() => setTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'history'
                ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Session History</span>
          </button>

          {summarySession && tab === 'summary' && (
            <span className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Session Review</span>
            </span>
          )}
        </div>
      )}

      {/* Render Active View based on tab */}
      {tab === 'setup' && (
        <PracticeSetup
          onStartSession={handleStartSession}
          onResumeSession={handleResumeSession}
          onDiscardActive={handleDiscardActive}
          activeSession={activeSession}
          isStarting={isStarting}
        />
      )}

      {tab === 'active' && activeSession && (
        <PracticeActiveSession
          session={activeSession}
          onSubmitAnswer={handleSubmitAnswer}
          onToggleReview={handleToggleReview}
          onFinishSession={handleFinishSession}
          isSubmitting={isSubmitting}
          isFinishing={isFinishing}
        />
      )}

      {tab === 'summary' && summarySession && (
        <PracticeSummary
          session={summarySession}
          onStartNew={() => setTab('setup')}
          onGoToHistory={() => setTab('history')}
        />
      )}

      {tab === 'history' && (
        <PracticeHistory
          onSelectSession={handleSelectHistorySession}
          onStartNew={() => setTab('setup')}
        />
      )}
    </div>
  );
};

export default PracticePage;
