import React, { useState } from 'react';
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
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const CATEGORIES = [
  'DSA',
  'Java',
  'Python',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'JavaScript',
  'React',
  'HR',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [3, 5, 10, 15, 20];
const TIMER_OPTIONS = [
  { label: 'No Limit (Untimed)', value: 0 },
  { label: '10 Minutes', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
];

const PracticeSetup = ({ onStartSession, onResumeSession, onDiscardActive, activeSession, isStarting }) => {
  const [mode, setMode] = useState('topic'); // 'topic' or 'mixed'
  const [category, setCategory] = useState('DSA');
  const [difficulty, setDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartSession({
      mode,
      category: mode === 'mixed' ? 'Mixed Topics' : category,
      difficulty,
      questionCount,
      timeLimitMinutes,
      forceNew: true,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Resume Active Session Banner if one exists */}
      {activeSession && (
        <Card className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/30 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Active Practice Session in Progress</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You have an unfinished session with{' '}
                  <span className="font-semibold text-amber-300">
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
                className="text-xs text-slate-400 hover:text-rose-400"
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
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5" />
          <span>Phase 4 Practice Mode</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configure Practice Session</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize your interview practice session with targeted topics, custom difficulty, question counts, and optional timed mode.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Practice Mode */}
        <Card className="bg-slate-900/80 border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>1. Select Practice Mode</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Topic Mode */}
            <div
              onClick={() => setMode('topic')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === 'topic'
                  ? 'bg-brand-600/15 border-brand-500 ring-1 ring-brand-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Topic-Focused</span>
                {mode === 'topic' && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Focus on a specific engineering domain like DSA, SQL, System Design, or Frameworks.
              </p>
            </div>

            {/* Mixed Mode */}
            <div
              onClick={() => setMode('mixed')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === 'mixed'
                  ? 'bg-brand-600/15 border-brand-500 ring-1 ring-brand-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Mixed Technical Challenge</span>
                {mode === 'mixed' && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulates real technical interview rounds with questions randomly selected across domains.
              </p>
            </div>
          </div>

          {/* Category Dropdown (if topic mode) */}
          {mode === 'topic' && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
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
          <Card className="bg-slate-900/80 border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </Card>

          {/* Question Count */}
          <Card className="bg-slate-900/80 border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Number of Questions
            </h3>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-1.5 sm:px-2 rounded-lg text-xs font-semibold border transition-all ${
                    questionCount === cnt
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {mode === 'mixed'
                ? 'Mixed mode selects from all 16+ available technical questions across domains.'
                : `Topic mode selects from ${category}. If the category has fewer questions than requested, all available questions will be included.`}
            </p>
          </Card>
        </div>

        {/* Step 3: Timer Configuration */}
        <Card className="bg-slate-900/80 border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>4. Session Time Limit</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TIMER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeLimitMinutes(opt.value)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                  timeLimitMinutes === opt.value
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm shadow-brand-500/20'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Summary Card & Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Summary: </span>
            <span>{mode === 'mixed' ? 'Mixed Topics' : category}</span> •{' '}
            <span>{difficulty} Difficulty</span> •{' '}
            <span>{questionCount} Questions</span> •{' '}
            <span>{timeLimitMinutes > 0 ? `${timeLimitMinutes} min limit` : 'Untimed'}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isStarting}
            icon={Play}
            className="w-full sm:w-auto"
          >
            Start Practice Session
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PracticeSetup;
