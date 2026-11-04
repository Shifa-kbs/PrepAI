import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Calculator,
  Brain,
  Code2,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Target,
  FileText,
  ChevronRight,
  AlertCircle,
  Award,
  Zap,
  Search,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import CURRICULUM from '../data/learningCurriculum';
import { saveLearningAssessment } from '../services/practiceService';
import toast from 'react-hot-toast';

const SUBJECT_ICONS = {
  Calculator,
  Brain,
  Code2,
  Layers,
  BookOpen,
};

const LearningPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTopicParam = searchParams.get('topic');
  const [selectedSubjectId, setSelectedSubjectId] = useState('quant');
  const [topicSearch, setTopicSearch] = useState('');
  const [activeTopic, setActiveTopic] = useState(() => {
    // Find initial topic from param or default to first topic
    if (selectedTopicParam) {
      for (const subj of CURRICULUM) {
        const found = subj.topics.find((t) => t.id === selectedTopicParam);
        if (found) return found;
      }
    }
    return CURRICULUM[0].topics[0];
  });

  const [lessonTab, setLessonTab] = useState('learn'); // 'learn', 'practice', 'test', 'analysis'

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState({});
  const [revealedHints, setRevealedHints] = useState({});

  // Topic Test state
  const [testAnswers, setTestAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [testResults, setTestResults] = useState(null);
  const timerRef = useRef(null);

  // Synchronize when activeTopic changes
  useEffect(() => {
    setPracticeAnswers({});
    setRevealedHints({});
    setTestAnswers({});
    setTestStarted(false);
    setTestSubmitted(false);
    setTestResults(null);
    setLessonTab('learn');
    if (timerRef.current) clearInterval(timerRef.current);
  }, [activeTopic?.id]);

  // Handle timer countdown during test
  useEffect(() => {
    if (testStarted && !testSubmitted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testStarted, testSubmitted]);

  const handleSelectTopic = (topic) => {
    setActiveTopic(topic);
    setSearchParams({ topic: topic.id });
  };

  const handlePracticeSelect = (qId, optionIdx) => {
    setPracticeAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const toggleHint = (qId) => {
    setRevealedHints((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleStartTopicTest = () => {
    setTestAnswers({});
    setTimeRemaining(600);
    setTestStarted(true);
    setTestSubmitted(false);
    setTestResults(null);
    setLessonTab('test');
    toast.success('Timed topic test started. Good luck!');
  };

  const handleTestSelect = (qId, optionIdx) => {
    if (testSubmitted) return;
    setTestAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const questions = activeTopic.topicTest || [];
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const selected = testAnswers[q.id];
      if (selected === undefined) {
        unanswered++;
      } else if (selected === q.correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSpentSeconds = 600 - timeRemaining;

    const results = {
      total,
      correct,
      incorrect,
      unanswered,
      score,
      timeSpentSeconds,
      passed: score >= 70,
    };

    setTestResults(results);
    setTestSubmitted(true);
    setLessonTab('analysis');

    try {
      const currentSubject = CURRICULUM.find((s) => s.subjectId === selectedSubjectId);
      await saveLearningAssessment({
        topicId: activeTopic.id,
        topicTitle: activeTopic.title,
        subjectName: currentSubject ? currentSubject.subjectName : activeTopic.category,
        totalQuestions: total,
        correctCount: correct,
        incorrectCount: incorrect,
        score,
        timeSpentSeconds,
        answers: testAnswers,
      });
      toast.success(`Topic test submitted & saved! Score: ${score}%`);
    } catch (saveErr) {
      console.warn('Could not persist topic test result to backend:', saveErr);
      toast.success(`Topic test submitted! Score: ${score}%`);
    }
  };

  const handleAutoSubmitTest = () => {
    toast('Time is up! Submitting your answers automatically.', { icon: '⏰' });
    handleSubmitTest();
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Learning Pathway</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Learning Studio & Topic Mastery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Follow the placement journey: <strong>Learn → Practise → Topic Test → Analyse → Revise → Full-Length Mock</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/practice">
            <Button variant="outline" size="sm" icon={Target}>
              Custom Practice
            </Button>
          </Link>
          <Link to="/aptitude">
            <Button variant="primary" size="sm" icon={ArrowRight}>
              Full Mock Tests
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Left Curriculum Sidebar, Right Lesson Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Subject & Topic Navigation (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Subject Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1 border border-slate-200/80">
            {CURRICULUM.map((subject) => {
              const IconComponent = SUBJECT_ICONS[subject.iconName] || BookOpen;
              const isSelected = selectedSubjectId === subject.subjectId;
              return (
                <button
                  key={subject.subjectId}
                  type="button"
                  onClick={() => {
                    setSelectedSubjectId(subject.subjectId);
                    if (subject.topics.length > 0) {
                      handleSelectTopic(subject.topics[0]);
                    }
                  }}
                  className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    isSelected
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{subject.subjectName}</span>
                </button>
              );
            })}
          </div>

          {/* Topics List for Current Subject */}
          <Card className="p-4 border-slate-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Curriculum Topics
              </p>
              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                {CURRICULUM.find((s) => s.subjectId === selectedSubjectId)?.topics.length || 0} Topics
              </span>
            </div>

            {/* Quick Filter Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics in this domain..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 placeholder-slate-400"
              />
              {topicSearch && (
                <button
                  type="button"
                  onClick={() => setTopicSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Scrollable Topics List */}
            <div className="max-h-[520px] overflow-y-auto space-y-1.5 pr-1">
              {(
                CURRICULUM.find((s) => s.subjectId === selectedSubjectId)?.topics || []
              )
                .filter(
                  (t) =>
                    !topicSearch.trim() ||
                    t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
                    t.summary.toLowerCase().includes(topicSearch.toLowerCase())
                )
                .map((t) => {
                  const isCurrent = activeTopic?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTopic(t)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-sky-50 text-sky-900 border-sky-300 shadow-xs ring-1 ring-sky-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className="text-xs font-bold truncate">{t.title}</span>
                          {t.badge && (
                            <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-1.5 py-0.2 rounded shrink-0">
                              {t.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{t.summary}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-sky-600' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
            </div>
          </Card>

          {/* Placement Journey Workflow Card */}
          <Card className="p-4 bg-gradient-to-br from-sky-50 to-white border-sky-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-600" />
              <span>Recommended Study Flow</span>
            </h3>
            <ol className="text-xs space-y-2 text-slate-700 font-medium list-decimal list-inside">
              <li>Read core concepts & formulas</li>
              <li>Solve untimed practice with hints</li>
              <li>Take the 10-min timed topic test</li>
              <li>Analyse performance & weak areas</li>
              <li>Attempt a full mock placement test</li>
            </ol>
          </Card>
        </div>

        {/* Right Column: Active Topic Studio (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Studio Header Bar */}
          <Card className="p-4 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {activeTopic.category}
                </span>
                <span className="text-xs text-slate-400">• {activeTopic.estimatedTime}</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">{activeTopic.title}</h2>
            </div>

            {/* Stage Selector Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setLessonTab('learn')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  lessonTab === 'learn'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Concept Lesson
              </button>
              <button
                type="button"
                onClick={() => setLessonTab('practice')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  lessonTab === 'practice'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Practice ({activeTopic.practiceQuestions?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setLessonTab('test')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  lessonTab === 'test'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Topic Test
              </button>
              <button
                type="button"
                onClick={() => setLessonTab('analysis')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  lessonTab === 'analysis'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Analysis & Revise
              </button>
            </div>
          </Card>

          {/* TAB 1: LEARN (Concept Lesson) */}
          {lessonTab === 'learn' && (
            <div className="space-y-4">
              <Card className="p-6 border-slate-200 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Concept Overview
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {activeTopic.concept.overview}
                  </p>
                </div>

                {/* Key Formulas Section */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>Essential Formulas & When to Use</span>
                  </h3>
                  <div className="space-y-2.5">
                    {activeTopic.concept.formulas.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          <span className="text-[10px] font-semibold bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                            Decision Rule
                          </span>
                        </div>
                        <div className="p-2 rounded bg-white border border-slate-200 font-mono text-xs font-bold text-sky-700">
                          {item.formula}
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong>When to use:</strong> {item.whenToUse}
                        </p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 italic">{item.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Shortcuts */}
                {activeTopic.concept.shortcuts && activeTopic.concept.shortcuts.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Speed Tricks & Mental Math Shortcuts</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeTopic.concept.shortcuts.map((sc, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1"
                        >
                          <h4 className="text-xs font-bold text-amber-900">{sc.title}</h4>
                          <p className="text-xs text-slate-700">{sc.tip}</p>
                          <p className="text-[11px] text-amber-800 italic">Example: {sc.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solved Examples */}
                {activeTopic.concept.solvedExamples && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Step-by-Step Solved Examples</span>
                    </h3>
                    <div className="space-y-3">
                      {activeTopic.concept.solvedExamples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs"
                        >
                          <p className="text-xs font-bold text-slate-900">
                            Example {idx + 1}: {ex.question}
                          </p>
                          <div className="space-y-1 pl-2 border-l-2 border-sky-400">
                            {ex.stepByStep.map((step, sIdx) => (
                              <p key={sIdx} className="text-xs text-slate-600">
                                {step}
                              </p>
                            ))}
                          </div>
                          <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block">
                            Final Answer: {ex.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation CTA */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Finished reviewing concepts and formulas?
                  </span>
                  <Button
                    variant="primary"
                    onClick={() => setLessonTab('practice')}
                    icon={ArrowRight}
                  >
                    Start Untimed Practice
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: PRACTISE (Untimed with Hints) */}
          {lessonTab === 'practice' && (
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs text-sky-800">
                <span>
                  <strong>Untimed Practice Mode:</strong> Try solving questions at your own pace. Reveal hints when stuck, then check your answers immediately.
                </span>
                <span className="font-semibold text-sky-900 shrink-0">
                  {Object.keys(practiceAnswers).length} of {activeTopic.practiceQuestions.length} answered
                </span>
              </div>

              {activeTopic.practiceQuestions.map((q, qIdx) => {
                const selected = practiceAnswers[q.id];
                const isAnswered = selected !== undefined;
                const isCorrect = selected === q.correctIndex;
                const showHint = revealedHints[q.id];

                return (
                  <Card key={q.id} className="p-5 border-slate-200 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Q{qIdx + 1}. {q.question}
                      </h4>
                      <button
                        type="button"
                        onClick={() => toggleHint(q.id)}
                        className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                      </button>
                    </div>

                    {/* Hint Box */}
                    {showHint && (
                      <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                        <strong>💡 Hint:</strong> {q.hint}
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        let optStyle = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                        if (isAnswered) {
                          if (optIdx === q.correctIndex) {
                            optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                          } else if (selected === optIdx) {
                            optStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handlePracticeSelect(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${optStyle}`}
                          >
                            <span className="font-bold mr-2 text-slate-500">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box (Revealed once answered) */}
                    {isAnswered && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50/70 border-rose-200 text-rose-900'
                        }`}
                      >
                        <p className="font-bold flex items-center gap-1">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Correct! Excellent intuition.</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Incorrect choice. Review the explanation:</span>
                            </>
                          )}
                        </p>
                        <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </Card>
                );
              })}

              <div className="pt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setLessonTab('learn')}>
                  ← Back to Concepts
                </Button>
                <Button variant="primary" onClick={handleStartTopicTest} icon={ArrowRight}>
                  Ready: Take Timed Topic Test →
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: TOPIC TEST (Timed Mode) */}
          {lessonTab === 'test' && (
            <div className="space-y-4">
              {!testStarted ? (
                <Card className="p-8 border-slate-200 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Timed Topic Test: {activeTopic.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This assessment evaluates your concept mastery under timed placement conditions. Answers are hidden until you submit.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-left">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Questions</span>
                      <span className="text-lg font-bold text-slate-900">
                        {activeTopic.topicTest?.length || 0}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Time Limit</span>
                      <span className="text-lg font-bold text-sky-600">10 Mins</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Pass Benchmark</span>
                      <span className="text-lg font-bold text-emerald-600">70%</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleStartTopicTest}
                    icon={Target}
                    className="shadow-sm"
                  >
                    Start Topic Test Now
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Test Status Banner */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Test in Progress: {activeTopic.title}
                      </h4>
                      <p className="text-xs text-slate-700">
                        Answered: {Object.keys(testAnswers).length} of {activeTopic.topicTest?.length || 0}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5 text-sm font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span>{formatTimer(timeRemaining)}</span>
                      </div>

                      <Button variant="primary" size="sm" onClick={handleSubmitTest}>
                        Submit Test
                      </Button>
                    </div>
                  </div>

                  {/* Test Questions */}
                  {activeTopic.topicTest?.map((q, idx) => {
                    const selected = testAnswers[q.id];
                    return (
                      <Card key={q.id} className="p-5 border-slate-200 space-y-3">
                        <h4 className="text-sm font-bold text-slate-900">
                          {idx + 1}. {q.question}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleTestSelect(q.id, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                                selected === optIdx
                                  ? 'bg-sky-50 text-sky-900 border-sky-400 font-bold shadow-xs'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <span className="font-bold mr-2 text-slate-400">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </Card>
                    );
                  })}

                  <div className="pt-2 flex justify-end">
                    <Button variant="primary" size="md" onClick={handleSubmitTest} icon={CheckCircle2}>
                      Submit Test Answers
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANALYSE & REVISE */}
          {lessonTab === 'analysis' && (
            <div className="space-y-4">
              {testResults ? (
                <Card className="p-6 border-slate-200 space-y-6">
                  <div className="text-center space-y-2">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
                        testResults.passed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-amber-50 border-amber-200 text-amber-600'
                      }`}
                    >
                      {testResults.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {testResults.passed ? 'Topic Test Passed!' : 'Needs Concept Revision'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Score: <strong>{testResults.score}%</strong> • Completed in{' '}
                      {Math.round(testResults.timeSpentSeconds / 60)}m {testResults.timeSpentSeconds % 60}s
                    </p>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Total Questions</span>
                      <span className="text-xl font-extrabold text-slate-900">{testResults.total}</span>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-700 block uppercase">Correct</span>
                      <span className="text-xl font-extrabold text-emerald-700">{testResults.correct}</span>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                      <span className="text-[10px] text-rose-700 block uppercase">Incorrect</span>
                      <span className="text-xl font-extrabold text-rose-700">{testResults.incorrect}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 block uppercase">Unanswered</span>
                      <span className="text-xl font-extrabold text-slate-600">{testResults.unanswered}</span>
                    </div>
                  </div>

                  {/* Detailed Solutions Breakdown */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-slate-900">Detailed Answer Review</h4>
                    {activeTopic.topicTest?.map((q, idx) => {
                      const selected = testAnswers[q.id];
                      const isCorrect = selected === q.correctIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {q.question}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <p>
                              Your Answer: <strong>{selected !== undefined ? q.options[selected] : 'Unanswered'}</strong>
                            </p>
                            <p className="text-emerald-700">
                              Correct Answer: <strong>{q.options[q.correctIndex]}</strong>
                            </p>
                            <p className="text-slate-500 pt-1 border-t border-slate-100">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommended Next Action */}
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-sky-900">Next Step in Learning Journey</h4>
                      <p className="text-xs text-slate-600">
                        {testResults.passed
                          ? 'Great job! Retest with fresh parameters or proceed to a Full-Length Mock Test.'
                          : 'Review weak formulas in the Concept Lesson and retest this topic to reinforce learning.'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={handleStartTopicTest} icon={RotateCcw}>
                        Retest Topic
                      </Button>
                      <Link to="/aptitude">
                        <Button variant="primary" size="sm" icon={ArrowRight}>
                          Full Mock Test
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 border-slate-200 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    No topic test taken yet for this session. Take the timed topic test to generate diagnostics.
                  </p>
                  <Button variant="primary" onClick={handleStartTopicTest} icon={Target}>
                    Start Timed Topic Test
                  </Button>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
