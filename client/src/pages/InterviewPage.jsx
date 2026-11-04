import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  History,
  Sparkles,
  Layers,
  Award,
} from 'lucide-react';
import InterviewSetup from '../components/interview/InterviewSetup';
import InterviewRoom from '../components/interview/InterviewRoom';
import InterviewReport from '../components/interview/InterviewReport';
import InterviewHistory from '../components/interview/InterviewHistory';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  startMockInterview,
  getActiveMockInterview,
  getMockInterviewById,
  submitInterviewAnswer,
  skipInterviewQuestion,
  finishMockInterview,
  abandonMockInterview,
} from '../services/interviewService';
import toast from 'react-hot-toast';

const InterviewPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const interviewIdParam = searchParams.get('interview');

  const [tab, setTab] = useState('setup'); // 'setup', 'room', 'report', 'history'
  const [activeInterview, setActiveInterview] = useState(null);
  const [completedInterview, setCompletedInterview] = useState(null);
  const [finalReport, setFinalReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [setupError, setSetupError] = useState(null);

  // Initialize: Check for query param interview or existing active interview
  useEffect(() => {
    const initInterview = async () => {
      setLoading(true);
      try {
        if (interviewIdParam) {
          const res = await getMockInterviewById(interviewIdParam);
          if (res.success && res.interview) {
            if (res.interview.status === 'completed') {
              setCompletedInterview(res.interview);
              setFinalReport(res.interview.finalReport);
              setTab('report');
            } else if (res.interview.status === 'in-progress') {
              setActiveInterview(res.interview);
              setTab('room');
            }
          }
        } else {
          const activeRes = await getActiveMockInterview();
          if (activeRes.success && activeRes.interview) {
            setActiveInterview(activeRes.interview);
          }
        }
      } catch (err) {
        console.error('Failed to initialize interview workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    initInterview();
  }, [interviewIdParam]);

  // Start new mock interview
  const handleStartInterview = async (payload) => {
    setIsStarting(true);
    setEvalError(null);
    setSetupError(null);
    try {
      const data = await startMockInterview(payload);
      if (data.success && data.interview) {
        setActiveInterview(data.interview);
        setTab('room');
        toast.success(data.message || 'AI Mock Interview started!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start mock interview';
      setSetupError(msg);
      toast.error(msg);
    } finally {
      setIsStarting(false);
    }
  };

  // Resume active interview
  const handleResumeInterview = () => {
    if (activeInterview) {
      setTab('room');
    }
  };

  // Discard active interview
  const handleDiscardActive = async () => {
    try {
      await abandonMockInterview();
      setActiveInterview(null);
      toast.success('Active mock interview discarded');
    } catch (err) {
      toast.error('Failed to discard active interview');
    }
  };

  // Submit answer for evaluation
  const handleSubmitAnswer = async (questionIndex, userAnswer) => {
    if (!activeInterview) return null;
    setIsSubmitting(true);
    setEvalError(null);
    try {
      const res = await submitInterviewAnswer(activeInterview._id, {
        questionIndex,
        userAnswer,
      });

      if (res.success) {
        setActiveInterview(res.interview);
        toast.success('Answer evaluated!');
        return res;
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'AI evaluation failed. Please verify your answer or retry.';
      setEvalError(errMsg);
      toast.error(errMsg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip question
  const handleSkipQuestion = async (questionIndex) => {
    if (!activeInterview) return;
    try {
      const res = await skipInterviewQuestion(activeInterview._id, { questionIndex });
      if (res.success) {
        setActiveInterview(res.interview);
        toast('Question skipped', { icon: '⏭️' });
      }
    } catch (err) {
      toast.error('Failed to skip question');
    }
  };

  // Finish interview and generate final report
  const handleFinishInterview = async () => {
    if (!activeInterview) return;
    setIsFinishing(true);
    setEvalError(null);
    try {
      const res = await finishMockInterview(activeInterview._id);
      if (res.success && res.interview) {
        setCompletedInterview(res.interview);
        setFinalReport(res.report || res.interview.finalReport);
        setActiveInterview(null);
        setTab('report');
        toast.success('Interview completed! Executive report generated.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete interview');
    } finally {
      setIsFinishing(false);
    }
  };

  // View historical interview report
  const handleSelectHistoryInterview = async (interviewId) => {
    setLoading(true);
    try {
      const res = await getMockInterviewById(interviewId);
      if (res.success && res.interview) {
        setCompletedInterview(res.interview);
        setFinalReport(res.interview.finalReport);
        setTab('report');
      }
    } catch (err) {
      toast.error('Failed to load interview report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading AI interview studio..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Tab Bar (Hidden during active interview room to keep candidate focused) */}
      {tab !== 'room' && (
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setTab('setup')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'setup'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interview Setup</span>
          </button>

          <button
            onClick={() => setTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === 'history'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Interview History</span>
          </button>

          {completedInterview && tab === 'report' && (
            <span className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              <Award className="w-3.5 h-3.5 text-sky-600" />
              <span>Executive Report</span>
            </span>
          )}
        </div>
      )}

      {/* Render Active View */}
      {tab === 'setup' && (
        <div className="space-y-4">
          {setupError && (
            <div>
              <ErrorMessage message={setupError} onRetry={() => setSetupError(null)} />
            </div>
          )}
          <InterviewSetup
            onStartInterview={handleStartInterview}
            onResumeInterview={handleResumeInterview}
            onDiscardActive={handleDiscardActive}
            activeInterview={activeInterview}
            isStarting={isStarting}
          />
        </div>
      )}

      {tab === 'room' && activeInterview && (
        <InterviewRoom
          interview={activeInterview}
          onSubmitAnswer={handleSubmitAnswer}
          onSkipQuestion={handleSkipQuestion}
          onFinishInterview={handleFinishInterview}
          isSubmitting={isSubmitting}
          isFinishing={isFinishing}
          evalError={evalError}
          onRetrySubmit={() => {}}
        />
      )}

      {tab === 'report' && completedInterview && (
        <InterviewReport
          interview={completedInterview}
          report={finalReport}
          onStartNew={() => setTab('setup')}
          onGoToHistory={() => setTab('history')}
          onGoToDashboard={() => navigate('/dashboard')}
        />
      )}

      {tab === 'history' && (
        <InterviewHistory
          onSelectInterview={handleSelectHistoryInterview}
          onStartNew={() => setTab('setup')}
        />
      )}
    </div>
  );
};

export default InterviewPage;
