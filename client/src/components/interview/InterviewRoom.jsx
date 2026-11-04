import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  FastForward,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const InterviewRoom = ({
  interview,
  onSubmitAnswer,
  onSkipQuestion,
  onFinishInterview,
  isSubmitting,
  isFinishing,
  evalError,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const recognitionRef = useRef(null);

  const questions = interview.questions || [];
  const currentIndex = Math.min(interview.currentQuestionIndex || 0, Math.max(0, questions.length - 1));
  const currentQuestion = questions[currentIndex];

  // Initialize Web Speech API safely
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition || null;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }

          if (finalTranscript) {
            setAnswerText((prev) => {
              const cleaned = prev ? prev.trim() + ' ' + finalTranscript.trim() : finalTranscript.trim();
              return cleaned;
            });
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError('Microphone permission denied. You can continue by typing your answer.');
          } else if (event.error !== 'no-speech') {
            setSpeechError(`Voice input paused (${event.error}). Feel free to continue typing.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition initialization failed:', err);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Sync state when current question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.userAnswer && currentQuestion.status === 'answered') {
      setAnswerText(currentQuestion.userAnswer);
    } else {
      setAnswerText('');
    }
    setLatestEvaluation(null);
  }, [currentIndex]);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.error('Voice input is not supported by your browser. Please type your answer.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {}
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
      }
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim()) {
      toast.error('Please enter or speak your answer before submitting.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    const res = await onSubmitAnswer(currentIndex, answerText.trim());
    if (res && res.evaluation) {
      setLatestEvaluation(res.evaluation);
    }
  };

  const handleSkip = async () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
    await onSkipQuestion(currentIndex);
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const progressPercent = Math.round(((currentIndex) / Math.max(1, questions.length)) * 100);

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-500">
        No active question found in this interview session.
      </div>
    );
  }

  const isCurrentAnswered = currentQuestion.status === 'answered';

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header Card */}
      <Card className="bg-white border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {interview.jobRole}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {interview.interviewType}
              </span>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                  difficultyStyles[currentQuestion.difficulty] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-slate-500 font-bold ml-1">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-48 sm:w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right Action: End Interview Early Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmFinish(true)}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-slate-200"
              icon={LogOut}
            >
              End Interview Early
            </Button>
          </div>
        </div>

        {/* Question Navigator Pill Bar */}
        <div className="flex items-center gap-1.5 pt-4 mt-4 border-t border-slate-100 overflow-x-auto pb-1">
          {questions.map((q, idx) => {
            const isAnswered = q.status === 'answered';
            const isSkipped = q.status === 'skipped';
            const isCurrent = idx === currentIndex;

            let pillStyle = 'bg-slate-50 text-slate-600 border-slate-200';

            if (isAnswered) {
              pillStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
            } else if (isSkipped) {
              pillStyle = 'bg-slate-100 text-slate-400 border-slate-200';
            }

            if (isCurrent) {
              pillStyle += ' ring-2 ring-sky-500 border-sky-500 bg-sky-50 text-sky-900 font-extrabold';
            }

            return (
              <div
                key={idx}
                className={`w-8 h-8 rounded-lg text-xs font-medium border flex items-center justify-center shrink-0 ${pillStyle}`}
                title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : isSkipped ? ' (Skipped)' : ''}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Question Card */}
      <Card className="bg-white border-slate-200 space-y-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                Interviewer Question #{currentIndex + 1}
              </span>
              {currentQuestion.isFollowUp && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                  Follow-Up Challenge
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
        </div>

        {/* Context Hint */}
        {currentQuestion.contextHint && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-700">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 mr-1">Interviewer Focus:</span>
              <span>{currentQuestion.contextHint}</span>
            </div>
          </div>
        )}

        {/* Answer Area */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span>Your Interview Response</span>
              {isListening && (
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Listening... speak clearly</span>
                </span>
              )}
            </label>

            <div className="flex items-center space-x-3 text-slate-500">
              <span>{wordCount} words</span>
              <span>{answerText.length} chars</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={7}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Structure your answer clearly. Explain your technical approach, implementation details, real-world trade-offs, or use the STAR method for behavioral responses..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white leading-relaxed placeholder:text-slate-400 resize-y"
            />
          </div>

          {/* Voice Input Control & Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              {speechSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400 animate-pulse'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-rose-600" />
                      <span>Stop Voice Input</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-sky-600" />
                      <span>Record Answer with Voice</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <MicOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Voice input unsupported on this browser; typing is fully enabled.</span>
                </span>
              )}

              {answerText && (
                <button
                  type="button"
                  onClick={() => setAnswerText('')}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {speechError && (
              <span className="text-[11px] text-amber-700 font-medium">{speechError}</span>
            )}
          </div>
        </div>

        {/* Provider Error Alert with Retry */}
        {evalError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>AI Provider Notification</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{evalError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              icon={RefreshCw}
              className="text-xs"
            >
              Retry Answer Evaluation
            </Button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            disabled={isSubmitting}
            icon={FastForward}
            className="text-xs w-full sm:w-auto"
          >
            Skip Question
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!answerText.trim() || isSubmitting}
            icon={Send}
            className="w-full sm:w-auto text-xs shadow-sm"
          >
            Submit Answer & Get AI Feedback
          </Button>
        </div>
      </Card>

      {/* Immediate Evaluation Feedback Card (if evaluated) */}
      {(latestEvaluation || isCurrentAnswered) && (
        <Card className="bg-white border-slate-200 p-5 space-y-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">Interviewer Critique & Evaluation</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
              Score: {latestEvaluation?.overallScore ?? currentQuestion.score ?? 0} / 100
            </span>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Relevance</span>
              <span className="text-sm font-black text-slate-900">
                {latestEvaluation?.relevanceScore ?? currentQuestion.relevanceScore ?? 0}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Clarity</span>
              <span className="text-sm font-black text-slate-900">
                {latestEvaluation?.clarityScore ?? currentQuestion.clarityScore ?? 0}%
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Depth</span>
              <span className="text-sm font-black text-slate-900">
                {latestEvaluation?.depthScore ?? currentQuestion.depthScore ?? 0}%
              </span>
            </div>
          </div>

          {/* Coherent Feedback */}
          <div className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {latestEvaluation?.feedback ?? currentQuestion.aiFeedback}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Observed Strengths:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                {(latestEvaluation?.strengths || currentQuestion.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Areas to Elevate:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                {(latestEvaluation?.weaknesses || currentQuestion.weaknesses || []).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Next / Finish Button */}
          <div className="flex items-center justify-end pt-2">
            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setLatestEvaluation(null);
                }}
                className="text-xs"
              >
                <span>Proceed to Next Question</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={onFinishInterview}
                isLoading={isFinishing}
                className="text-xs"
                icon={Award}
              >
                Complete Interview & View Executive Report
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Ending Early */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card className="max-w-md w-full bg-white border-slate-200 p-6 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3 text-amber-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">End Interview Early?</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently on Question <strong className="text-slate-900">{currentIndex + 1}</strong> of{' '}
              <strong className="text-slate-900">{questions.length}</strong>. Ending now will generate your performance report based on your answered questions.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmFinish(false)}
                className="text-xs"
              >
                Continue Interview
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isFinishing}
                onClick={() => {
                  setShowConfirmFinish(false);
                  onFinishInterview();
                }}
                className="text-xs"
              >
                End & Generate Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
