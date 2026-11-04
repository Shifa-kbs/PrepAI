import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  Target,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { getQuestionAvailability } from '../../services/practiceService';

const CATEGORIES = [
  'DSA',
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [5, 10, 15, 20, 30, 50, 100];
const TIMER_OPTIONS = [
  { label: 'No Limit (Untimed)', value: 0 },
  { label: '10 Minutes', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes', value: 60 },
];

const PracticeSetup = ({ onStartSession, onResumeSession, onDiscardActive, activeSession, isStarting }) => {
  const [mode, setMode] = useState('topic'); // 'topic' or 'mixed'
  const [category, setCategory] = useState('DSA');
  const [difficulty, setDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);
  const [reviewMistakes, setReviewMistakes] = useState(false);
  const [availableCount, setAvailableCount] = useState(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Live availability query
  useEffect(() => {
    let isMounted = true;
    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const res = await getQuestionAvailability({
          mode,
          category: mode === 'mixed' ? 'Mixed Topics' : category,
          difficulty: difficulty !== 'All' ? difficulty : undefined,
        });
        if (isMounted && res.success) {
          setAvailableCount(res.availableCount);
        }
      } catch (err) {
        console.warn('Failed to fetch availability:', err);
      } finally {
        if (isMounted) setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
    return () => {
      isMounted = false;
    };
  }, [mode, category, difficulty]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartSession({
      mode,
      category: mode === 'mixed' ? 'Mixed Topics' : category,
      difficulty,
      questionCount,
      timeLimitMinutes,
      reviewMistakes,
      forceNew: true,
    });
  };

  const isFewerThanRequested = availableCount !== null && availableCount > 0 && questionCount > availableCount;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Resume Active Session Banner if one exists */}
      {activeSession && (
        <Card className="bg-amber-50/80 border-amber-300 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Practice Session in Progress</h3>
                <p className="text-xs text-slate-600 mt-1">
                  You have an unfinished session with{' '}
                  <span className="font-bold text-amber-800">
                    {activeSession.totalQuestions} questions
                  </span>{' '}
                  ({activeSession.category} • {activeSession.difficulty}).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscardActive}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onResumeSession}
                icon={Play}
                className="text-xs"
              >
                Resume Session
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-2">
          <Target className="w-3.5 h-3.5 text-sky-500" />
          <span>Practice & Mock Test Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Configure Practice Session</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize your targeted placement practice session with verified question selection, multi-language sandbox, and real-time timers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Practice Mode */}
        <Card className="border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>1. Select Practice Mode</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Topic Mode */}
            <div
              onClick={() => setMode('topic')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === 'topic'
                  ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Topic-Focused Practice</span>
                {mode === 'topic' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Focus on a specific engineering domain like DSA, SQL, DBMS, or Core CS.
              </p>
            </div>

            {/* Mixed Mode */}
            <div
              onClick={() => setMode('mixed')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === 'mixed'
                  ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Mixed Technical Placement Test</span>
                {mode === 'mixed' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simulates real full-length placement exams with questions selected across all categories.
              </p>
            </div>
          </div>

          {/* Category Dropdown (if topic mode) */}
          {mode === 'topic' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 hover:border-slate-400 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Card>

        {/* Step 2: Difficulty & Question Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty */}
          <Card className="border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Target Difficulty
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    difficulty === diff
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </Card>

          {/* Question Count */}
          <Card className="border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Number of Questions
              </h3>
              {availableCount !== null && (
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {isLoadingAvailability ? 'Checking...' : `${availableCount} Available`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all text-center ${
                    questionCount === cnt
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>

            {/* Clear explanation if available count is less than requested */}
            {isFewerThanRequested && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> You requested {questionCount} questions, but {availableCount} eligible questions are available for {mode === 'mixed' ? 'Mixed Topics' : category}. Starting now will include all {availableCount} available questions without duplicates.
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={reviewMistakes}
                  onChange={(e) => setReviewMistakes(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <span className="font-medium">Prioritize previously attempted mistakes & unsolved problems</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Step 3: Timer Configuration */}
        <Card className="border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>4. Session Time Limit</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeLimitMinutes(opt.value)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                  timeLimitMinutes === opt.value
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Summary Card & Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-700">
            <span className="font-bold text-slate-900">Target Session: </span>
            <span className="font-semibold text-sky-700">{mode === 'mixed' ? 'Mixed Topics' : category}</span> •{' '}
            <span>{difficulty} Difficulty</span> •{' '}
            <span className="font-bold">{isFewerThanRequested ? `${availableCount} Available (Max)` : `${questionCount} Questions`}</span> •{' '}
            <span>{timeLimitMinutes > 0 ? `${timeLimitMinutes} min limit` : 'Untimed'}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isStarting}
            icon={Play}
            className="w-full sm:w-auto shadow-sm"
          >
            Start Practice Session
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PracticeSetup;
