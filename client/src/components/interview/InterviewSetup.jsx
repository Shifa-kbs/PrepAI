import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  Briefcase,
  Code2,
  GraduationCap,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

const ROLE_SUGGESTIONS = [
  'Full Stack Developer',
  'Frontend Engineer (React)',
  'Backend Developer (Node.js/Java)',
  'Software Engineer (DSA & Problem Solving)',
  'DevOps & Cloud Engineer',
  'Data Engineer / SQL Specialist',
];

const INTERVIEW_TYPES = [
  {
    type: 'Mixed',
    title: 'Mixed Technical & Behavioral',
    desc: 'Comprehensive interview simulating real industry rounds with coding, architecture, and STAR behavioral scenarios.',
  },
  {
    type: 'Technical',
    title: 'Pure Technical Focus',
    desc: 'Deep dive into algorithms, programming concepts, database internals, and system design trade-offs.',
  },
  {
    type: 'Behavioral',
    title: 'HR & Behavioral Focus',
    desc: 'Evaluates communication, conflict resolution, ownership, leadership, and STAR methodology responses.',
  },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const EXPERIENCE_LEVELS = [
  'Fresher (0-1 yrs)',
  'Junior (1-3 yrs)',
  'Mid (3-5 yrs)',
];
const QUESTION_COUNTS = [3, 5, 7, 10];

const SUGGESTED_TOPICS = [
  'React',
  'Node.js',
  'SQL & Databases',
  'System Design',
  'DSA & Algorithms',
  'REST APIs',
  'JavaScript Internals',
  'Git & CI/CD',
  'Concurrency & Threads',
  'STAR Behavioral',
];

const InterviewSetup = ({
  onStartInterview,
  onResumeInterview,
  onDiscardActive,
  activeInterview,
  isStarting,
}) => {
  const [jobRole, setJobRole] = useState('Full Stack Developer');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Medium');
  const [experienceLevel, setExperienceLevel] = useState('Fresher (0-1 yrs)');
  const [selectedTopics, setSelectedTopics] = useState(['React', 'Node.js', 'SQL & Databases']);
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleAddCustomTopic = (e) => {
    e.preventDefault();
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics([...selectedTopics, customTopic.trim()]);
      setCustomTopic('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartInterview({
      jobRole: jobRole.trim(),
      interviewType,
      difficulty,
      experienceLevel,
      topics: selectedTopics,
      questionCount,
      forceNew: true,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Resume Active Session Banner if one exists */}
      {activeInterview && (
        <Card className="bg-gradient-to-r from-purple-500/10 via-slate-900 to-slate-900 border-purple-500/30 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Active AI Mock Interview in Progress</h3>
                <p className="text-xs text-slate-300 mt-1">
                  You have an unfinished interview session for{' '}
                  <span className="font-semibold text-purple-300">{activeInterview.jobRole}</span>{' '}
                  ({activeInterview.interviewType} • {activeInterview.difficulty} •{' '}
                  {activeInterview.totalQuestions} questions).
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
                onClick={onResumeInterview}
                icon={Play}
                className="text-xs bg-purple-600 hover:bg-purple-500 border-purple-500"
              >
                Resume Interview
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Bot className="w-3.5 h-3.5" />
          <span>Phase 5 AI Mock Interview Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Configure AI Mock Interview</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simulate a real-world technical or behavioral interview with our intelligent AI interviewer. Get instant structured critique and comprehensive hiring-board reports.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Job Role & Experience Level */}
        <Card className="bg-slate-900/80 border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <span>1. Target Job Role & Experience</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Engineering Role
              </label>
              <input
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Frontend Engineer, Java Backend Lead"
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-700 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Role Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Suggestions:</span>
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setJobRole(role)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    jobRole === role
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Experience Level */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Experience Level</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperienceLevel(exp)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      experienceLevel === exp
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Step 2: Interview Type */}
        <Card className="bg-slate-900/80 border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>2. Interview Format</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map((t) => (
              <div
                key={t.type}
                onClick={() => setInterviewType(t.type)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  interviewType === t.type
                    ? 'bg-purple-600/15 border-purple-500 ring-1 ring-purple-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{t.title}</span>
                  {interviewType === t.type && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Step 3: Difficulty & Question Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty */}
          <Card className="bg-slate-900/80 border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Interview Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    difficulty === diff
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20'
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
              4. Number of Questions
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    questionCount === cnt
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Recommended: 5 questions provides a balanced 15–20 min mock interview experience.
            </p>
          </Card>
        </div>

        {/* Step 4: Specific Topics & Skills */}
        <Card className="bg-slate-900/80 border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span>5. Focus Skills & Technical Topics</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500 font-semibold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? `✓ ${topic}` : `+ ${topic}`}
                </button>
              );
            })}
          </div>

          {/* Add custom topic */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Add custom topic (e.g. GraphQL, Redis, Kafka)"
              className="px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 flex-1 max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomTopic}
              className="text-xs"
            >
              Add Topic
            </Button>
          </div>
        </Card>

        {/* Summary Card & Start Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">Summary: </span>
            <span className="text-purple-300 font-medium">{jobRole}</span> •{' '}
            <span>{interviewType} Format</span> •{' '}
            <span>{difficulty}</span> •{' '}
            <span>{questionCount} Questions</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isStarting}
            icon={Bot}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-purple-500/40"
          >
            Start AI Interview
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
