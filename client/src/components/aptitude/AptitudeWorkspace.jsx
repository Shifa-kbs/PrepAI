import React, { useState } from 'react';
import {
  Calculator,
  GitBranch,
  BookOpen,
  Trophy,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Flame,
  ChevronRight,
  X,
  Target,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const sectionMeta = {
  'Quantitative Aptitude': {
    icon: Calculator,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    description: 'Master arithmetic, percentages, ratios, speed, time & work, interest, and combinatorics.',
    defaultTimeMinutes: 20,
  },
  'Logical Reasoning': {
    icon: GitBranch,
    color: 'from-indigo-500/20 to-cyan-500/10 border-indigo-500/30 text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    description: 'Solve syllogisms, seating arrangements, blood relations, patterns, clocks, and critical logic.',
    defaultTimeMinutes: 20,
  },
  'Verbal Ability': {
    icon: BookOpen,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    description: 'Strengthen reading comprehension, sentence correction, grammar rules, and vocabulary in context.',
    defaultTimeMinutes: 15,
  },
};

const AptitudeWorkspace = ({
  stats,
  onStartSession,
  onResumeSession,
  onDiscardActive,
  activeSession,
  isStarting,
}) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [modalMode, setModalMode] = useState('section-test'); // 'topic' or 'section-test'
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);

  const sections = stats?.sections || {};

  // Open configuration modal
  const handleOpenConfig = (sectionName, mode = 'section-test') => {
    const isFull = sectionName === 'Full Aptitude Test';
    setSelectedSection(sectionName);
    setModalMode(mode);
    setSelectedTopic('All');
    setSelectedDifficulty('All');
    
    if (isFull) {
      setQuestionCount(15);
      setTimeLimitMinutes(30);
    } else {
      const defaultTime = sectionMeta[sectionName]?.defaultTimeMinutes || 20;
      setQuestionCount(mode === 'topic' ? 5 : 10);
      setTimeLimitMinutes(mode === 'topic' ? 0 : defaultTime);
    }
  };

  const handleCloseModal = () => {
    setSelectedSection(null);
  };

  // Launch test or practice session
  const handleLaunch = () => {
    if (!selectedSection) return;

    const isFull = selectedSection === 'Full Aptitude Test';
    const payload = {
      moduleType: 'aptitude',
      category: isFull ? 'Full Aptitude Test' : selectedSection,
      section: selectedSection,
      mode: modalMode === 'topic' ? 'topic' : isFull ? 'full-test' : 'section-test',
      topic: selectedTopic !== 'All' ? selectedTopic : undefined,
      difficulty: selectedDifficulty,
      questionCount,
      timeLimitMinutes: modalMode === 'topic' ? 0 : timeLimitMinutes,
    };

    onStartSession(payload);
    handleCloseModal();
  };

  const isFullAptitude = selectedSection === 'Full Aptitude Test';
  const currentSectionData = !isFullAptitude && selectedSection ? sections[selectedSection] : null;
  const availableTopics = currentSectionData ? Object.keys(currentSectionData.topics || {}) : [];
  const maxAvailable = isFullAptitude
    ? stats?.totalAptitudeQuestions || 46
    : currentSectionData?.total || 15;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Active Session Alert Banner */}
      {activeSession && (
        <Card className="bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 border-brand-500/40 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                    Active Assessment in Progress
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {activeSession.mode === 'topic' ? 'Practice Mode' : 'Timed Test'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {activeSession.category} • {activeSession.totalQuestions} Questions (
                  {(activeSession.answers || []).length} Answered)
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                onClick={onResumeSession}
                className="text-xs font-semibold"
              >
                Resume Assessment
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={onDiscardActive}
                className="text-xs text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
              >
                Discard
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Target className="w-3.5 h-3.5" />
            <span>Dedicated Placement Aptitude Module</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Master Campus Placement Aptitude
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Practice section-by-section or challenge yourself with realistic full-length timed
            assessments. Every question features verified solutions and step-by-step mathematical &
            logical deductions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{stats?.totalAptitudeQuestions || 46} Curated Questions</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Real Countdown Timer & Auto-Submit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              <span>Topic-Wise Weak Area Diagnostics</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section Workspaces Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Section Workspaces</h2>
            <p className="text-xs text-slate-400">
              Select a core aptitude domain to practice specific topics or attempt a timed section test.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(sectionMeta).map(([sectionName, meta]) => {
            const Icon = meta.icon;
            const data = sections[sectionName] || {
              total: 0,
              solved: 0,
              attempted: 0,
              topics: {},
              difficulties: {},
            };
            const solvedPercent =
              data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
            const topicsList = Object.keys(data.topics || {});

            return (
              <Card
                key={sectionName}
                className="flex flex-col justify-between bg-slate-900/90 border-slate-800/80 hover:border-slate-700 transition-all p-5 sm:p-6"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} border flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${meta.badge}`}
                    >
                      {data.total} Questions
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white">{sectionName}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  {/* Progress Tracker */}
                  <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Domain Mastery</span>
                      <span className="font-semibold text-slate-200">
                        {data.solved} / {data.total} Solved ({solvedPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${solvedPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Topics Preview Chips */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Included Topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {topicsList.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50"
                        >
                          {t}
                        </span>
                      ))}
                      {topicsList.length > 4 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                          +{topicsList.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-5 mt-5 border-t border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenConfig(sectionName, 'topic')}
                    className="text-xs font-semibold"
                  >
                    Topic Practice
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Clock}
                    onClick={() => handleOpenConfig(sectionName, 'section-test')}
                    className="text-xs font-semibold"
                  >
                    Timed Test
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Full-Length Timed Assessment Banner */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950/60 border-brand-500/30 p-6 sm:p-7">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Full-Length Placement Mock</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Complete Placement Aptitude Assessment
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Experience the actual hiring test format used by top IT companies (TCS NQT, Infosys,
              Cognizant, Accenture, and Amazon). Balanced selection across Quantitative, Logical, and
              Verbal Ability with strict countdown timing.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              icon={Play}
              onClick={() => handleOpenConfig('Full Aptitude Test', 'section-test')}
              className="text-sm font-bold shadow-lg shadow-brand-600/30 px-6 py-3"
            >
              Start Full Assessment
            </Button>
          </div>
        </div>
      </Card>

      {/* Configuration Modal */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-brand-400">
                  Assessment Setup
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">{selectedSection}</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Mode Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-400" />
                <span>Mode of Operation</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('section-test');
                    setTimeLimitMinutes(isFullAptitude ? 30 : 20);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    modalMode === 'section-test'
                      ? 'bg-brand-600/20 border-brand-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span>Timed Assessment</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Formal test. Countdown timer. Answers hidden until submission.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalMode('topic');
                    setTimeLimitMinutes(0);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    modalMode === 'topic'
                      ? 'bg-brand-600/20 border-brand-500/50 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Topic Practice</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    Untimed study mode. Instant feedback with full step-by-step explanations.
                  </p>
                </button>
              </div>
            </div>

            {/* Topic Filter (Only for single section) */}
            {!isFullAptitude && availableTopics.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="All">All Topics ({currentSectionData?.total || 0} questions)</option>
                  {availableTopics.map((top) => (
                    <option key={top} value={top}>
                      {top} ({currentSectionData.topics[top]} questions)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Difficulty</label>
              <div className="grid grid-cols-4 gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                      selectedDifficulty === diff
                        ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                        : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {diff === 'All' ? 'Mixed' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Question Count</label>
                <span className="text-slate-400">Available: {maxAvailable}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, maxAvailable].map((cnt) => {
                  const isAvailable = maxAvailable >= cnt;
                  return (
                    <button
                      key={cnt}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setQuestionCount(cnt)}
                      className={`py-2 rounded-lg text-xs font-bold border text-center transition-all ${
                        questionCount === cnt
                          ? 'bg-brand-600 text-white border-brand-500'
                          : isAvailable
                          ? 'bg-slate-950/50 text-slate-300 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-950/20 text-slate-600 border-slate-800/40 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {cnt === maxAvailable && cnt > 15 ? `Max (${cnt})` : `${cnt} Qs`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timer Limit Configuration (for assessment mode) */}
            {modalMode === 'section-test' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Time Limit</label>
                  <span className="text-amber-400 font-semibold">{timeLimitMinutes} Minutes</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeLimitMinutes(mins)}
                      className={`py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                        timeLimitMinutes === mins
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Rules Banner */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-400" />
                <span>Assessment Instructions</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>Score: +20 points per correct answer (No negative marking).</li>
                <li>Mark questions for review to easily jump back via the Question Palette.</li>
                {modalMode === 'section-test' && (
                  <li>Automatic submission will trigger immediately when the timer expires.</li>
                )}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={handleCloseModal} className="text-xs">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={Play}
                isLoading={isStarting}
                onClick={handleLaunch}
                className="text-xs font-bold px-5"
              >
                {modalMode === 'topic' ? 'Start Practice' : 'Begin Assessment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeWorkspace;
