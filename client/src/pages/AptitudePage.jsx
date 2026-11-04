import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Brain,
  History,
  Layers,
  Sparkles,
  Trophy,
} from 'lucide-react';
import AptitudeWorkspace from '../components/aptitude/AptitudeWorkspace';
import AptitudeTestRoom from '../components/aptitude/AptitudeTestRoom';
import AptitudeResults from '../components/aptitude/AptitudeResults';
import AptitudeHistory from '../components/aptitude/AptitudeHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getAptitudeStats,
  startAptitudeSession,
  getActiveAptitudeSession,
  getAptitudeSessionById,
  submitAptitudeAnswer,
  toggleAptitudeReview,
  finishAptitudeSession,
  abandonActiveAptitudeSession,
} from '../services/aptitudeService';
import toast from 'react-hot-toast';

const AptitudePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('session');

  const [tab, setTab] = useState('workspace'); // 'workspace', 'test-room', 'results', 'history'
  const [stats, setStats] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [summarySession, setSummarySession] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Initialize Aptitude module data
  useEffect(() => {
    const initAptitude = async () => {
      setLoading(true);
      try {
        // 1. Fetch domain statistics & topic counts
        const statsRes = await getAptitudeStats();
        if (statsRes.success) {
          setStats(statsRes);
        }

        // 2. Check if deep-linked to a specific session
        if (sessionIdParam) {
          const detailRes = await getAptitudeSessionById(sessionIdParam);
          if (detailRes.success && detailRes.session) {
            if (detailRes.session.status === 'completed') {
              setSummarySession(detailRes.session);
              setSummaryData(detailRes.summary || null);
              setTab('results');
            } else if (detailRes.session.status === 'in-progress') {
              setActiveSession(detailRes.session);
              setTab('test-room');
            }
          }
        } else {
          // 3. Check for existing active aptitude session
          const activeRes = await getActiveAptitudeSession();
          if (activeRes.success && activeRes.session) {
            setActiveSession(activeRes.session);
          }
        }
      } catch (err) {
        console.error('Failed to initialize aptitude module:', err);
      } finally {
        setLoading(false);
      }
    };

    initAptitude();
  }, [sessionIdParam]);

  // Start new aptitude session
  const handleStartSession = async (payload) => {
    setIsStarting(true);
    try {
      const data = await startAptitudeSession(payload);
      if (data.success && data.session) {
        setActiveSession(data.session);
        setTab('test-room');

        if (data.isPartial) {
          toast(
            data.message ||
              `Started assessment with all ${data.availableCount} available questions for this criteria.`,
            { icon: 'ℹ️', duration: 5000 }
          );
        } else if (data.resumed) {
          toast.success('Resumed active assessment session');
        } else {
          toast.success(data.message || 'Assessment started! Best of luck.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start aptitude session');
    } finally {
      setIsStarting(false);
    }
  };

  // Resume active session
  const handleResumeSession = () => {
    if (activeSession) {
      setTab('test-room');
    }
  };

  // Discard active session
  const handleDiscardActive = async () => {
    try {
      await abandonActiveAptitudeSession();
      setActiveSession(null);
      toast.success('Active assessment discarded');
    } catch (err) {
      toast.error('Failed to discard active assessment');
    }
  };

  // Submit answer for active question
  const handleSubmitAnswer = async (answerData) => {
    if (!activeSession) return null;
    setIsSubmitting(true);
    try {
      const res = await submitAptitudeAnswer(activeSession._id, answerData);
      if (res.success) {
        // Update local session state
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

        return res;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record answer');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle mark for review
  const handleToggleReview = async (questionId, markedForReview) => {
    if (!activeSession) return;
    try {
      const res = await toggleAptitudeReview(activeSession._id, {
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

  // Complete active session
  const handleFinishSession = async () => {
    if (!activeSession) return;
    setIsFinishing(true);
    try {
      const res = await finishAptitudeSession(activeSession._id);
      if (res.success && res.session) {
        setSummarySession(res.session);
        setSummaryData(res.summary || null);
        setActiveSession(null);
        setTab('results');

        // Refresh aptitude stats to reflect newly solved questions
        const updatedStats = await getAptitudeStats();
        if (updatedStats.success) {
          setStats(updatedStats);
        }

        toast.success('Assessment submitted! View your score report below.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finish assessment');
    } finally {
      setIsFinishing(false);
    }
  };

  // Review a completed historical session
  const handleSelectHistorySession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await getAptitudeSessionById(sessionId);
      if (res.success && res.session) {
        setSummarySession(res.session);
        setSummaryData(res.summary || null);
        setTab('results');
        setSearchParams({ session: sessionId });
      }
    } catch (err) {
      toast.error('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  // Handle direct practice launch from weak topic recommendation
  const handlePracticeTopic = (topicName) => {
    // Locate which section contains this topic and find available count
    let targetSection = 'Quantitative Aptitude';
    let availableCount = 10;
    if (stats?.sections) {
      for (const [secName, secData] of Object.entries(stats.sections)) {
        if (secData.topics && secData.topics[topicName]) {
          targetSection = secName;
          availableCount = secData.topics[topicName]?.total || 10;
          break;
        }
      }
    }

    handleStartSession({
      category: targetSection,
      section: targetSection,
      mode: 'topic',
      topic: topicName,
      difficulty: 'All',
      questionCount: availableCount,
      timeLimitMinutes: 0,
    });
  };

  if (loading) {
    return <LoadingSpinner label="Loading aptitude assessment workspace..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Tab Bar (Hidden during active test to minimize distraction) */}
      {tab !== 'test-room' && (
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => {
              setTab('workspace');
              setSearchParams({});
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'workspace'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Brain className="w-4 h-4 text-sky-600" />
            <span>Aptitude Assessment Hub</span>
          </button>

          <button
            onClick={() => {
              setTab('history');
              setSearchParams({});
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              tab === 'history'
                ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Assessment History</span>
          </button>

          {summarySession && tab === 'results' && (
            <span className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assessment Report</span>
            </span>
          )}
        </div>
      )}

      {/* View Switcher */}
      {tab === 'workspace' && (
        <AptitudeWorkspace
          stats={stats}
          onStartSession={handleStartSession}
          onResumeSession={handleResumeSession}
          onDiscardActive={handleDiscardActive}
          activeSession={activeSession}
          isStarting={isStarting}
        />
      )}

      {tab === 'test-room' && activeSession && (
        <AptitudeTestRoom
          session={activeSession}
          onSubmitAnswer={handleSubmitAnswer}
          onToggleReview={handleToggleReview}
          onFinishSession={handleFinishSession}
          isSubmitting={isSubmitting}
          isFinishing={isFinishing}
        />
      )}

      {tab === 'results' && summarySession && (
        <AptitudeResults
          session={summarySession}
          summary={summaryData}
          onStartNew={() => {
            setTab('workspace');
            setSearchParams({});
          }}
          onGoToHistory={() => {
            setTab('history');
            setSearchParams({});
          }}
          onPracticeTopic={handlePracticeTopic}
        />
      )}

      {tab === 'history' && (
        <AptitudeHistory
          onSelectSession={handleSelectHistorySession}
          onStartNew={() => {
            setTab('workspace');
            setSearchParams({});
          }}
        />
      )}
    </div>
  );
};

export default AptitudePage;
