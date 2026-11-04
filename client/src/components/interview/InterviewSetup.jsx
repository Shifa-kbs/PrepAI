import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { getInterviewStatus } from '../../services/interviewService';

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

  const [aiStatus, setAiStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const res = await getInterviewStatus();
        if (isMounted && res.success) {
          setAiStatus(res.ai);
        }
      } catch (err) {
        console.warn('Could not fetch AI status:', err);
      } finally {
        if (isMounted) setLoadingStatus(false);
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="space-y-6 w-full">
      {/* Resume Active Session Banner if one exists */}
      {activeInterview && (
        <Card className="bg-amber-50 border-amber-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active AI Mock Interview in Progress</h3>
                <p className="text-xs text-slate-600 mt-1">
                  You have an unfinished interview session for{' '}
                  <span className="font-bold text-slate-900">{activeInterview.jobRole}</span>{' '}
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
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onResumeInterview}
                icon={Play}
                className="text-xs"
              >
                Resume Interview
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Honest AI Engine Status Callout */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs">AI Interviewer & Mentor Status:</span>
            {loadingStatus ? (
              <span className="text-[11px] text-slate-400">Detecting engine...</span>
            ) : aiStatus?.isOfflineMock ? (
              <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                ⚡ Offline Simulated AI Interviewer Active (Rule Engine - Zero Credits Required)
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                🟢 Live Google Gemini AI ({aiStatus?.model || 'gemini-1.5-flash'}) Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Interviews are conducted question-by-question with personalized follow-up challenges. After submission, you receive comprehensive mentoring: readiness score, missing concepts, and a weekly study roadmap.
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-2">
          <Bot className="w-3.5 h-3.5 text-sky-600" />
          <span>Interactive AI Mock Interviewer & Mentor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Configure AI Mock Interview</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Simulate realistic technical and behavioral interviews. Get instant structured critique and comprehensive hiring-readiness reports.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Job Role & Experience Level */}
        <Card className="bg-white border-slate-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-600" />
            <span>1. Target Job Role & Experience</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Engineering Role
              </label>
              <input
                type="text"
                required
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Frontend Engineer, Java Backend Lead"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            {/* Role Quick Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Suggestions:</span>
              {ROLE_SUGGESTIONS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setJobRole(role)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    jobRole === role
                      ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Experience Level */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Experience Level</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperienceLevel(exp)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      experienceLevel === exp
                        ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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
        <Card className="bg-white border-slate-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>2. Interview Format</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map((t) => (
              <div
                key={t.type}
                onClick={() => setInterviewType(t.type)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  interviewType === t.type
                    ? 'bg-sky-50/80 border-sky-400 ring-1 ring-sky-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{t.title}</span>
                  {interviewType === t.type && (
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Step 3: Difficulty & Question Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Difficulty */}
          <Card className="bg-white border-slate-200 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Interview Difficulty
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
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
          <Card className="bg-white border-slate-200 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Number of Questions
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    questionCount === cnt
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cnt} Qs
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Recommended: 5 questions provides a balanced 15–20 min mock interview experience.
            </p>
          </Card>
        </div>

        {/* Step 4: Specific Topics & Skills */}
        <Card className="bg-white border-slate-200 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-sky-600" />
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
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
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
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 flex-1 max-w-xs"
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">Summary: </span>
            <span className="text-sky-700 font-bold">{jobRole}</span> •{' '}
            <span>{interviewType} Format</span> •{' '}
            <span>{difficulty}</span> •{' '}
            <span>{questionCount} Questions</span>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isStarting}
            icon={Bot}
            className="w-full sm:w-auto shadow-sm"
          >
            Start AI Interview
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
