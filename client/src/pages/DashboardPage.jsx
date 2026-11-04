import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  CheckCircle2,
  Bot,
  Flame,
  BookOpen,
  Code2,
  Calendar,
  Sparkles,
  ArrowRight,
  Brain,
  GraduationCap,
} from 'lucide-react';
import Card from '../components/common/Card';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Preparation Score',
      value: user?.stats?.prepScore ?? 0,
      icon: Trophy,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      description: 'Overall placement readiness score',
    },
    {
      title: 'Questions Solved',
      value: user?.stats?.questionsSolved ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      description: 'DSA & Technical problems solved',
    },
    {
      title: 'Mock Interviews',
      value: user?.stats?.mockInterviewsCompleted ?? 0,
      icon: Bot,
      color: 'bg-sky-50 text-sky-600 border-sky-200',
      description: 'Completed AI mock sessions',
    },
    {
      title: 'Current Streak',
      value: `${user?.stats?.currentStreak ?? 0} Days`,
      icon: Flame,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      description: 'Consecutive preparation activity',
    },
  ];

  const quickActions = [
    {
      title: 'Learning Studio & Topic Mastery',
      description: 'Step-by-step concepts, formulas, mental math shortcuts, solved examples, and timed topic tests',
      icon: GraduationCap,
      phaseBadge: 'Curriculum',
      path: '/learning',
      ctaText: 'Open Learning Studio',
      enabled: true,
    },
    {
      title: 'Aptitude Assessment Hub',
      description: 'Practice Quantitative, Logical, and Verbal reasoning with full-length timed placement tests',
      icon: Brain,
      phaseBadge: 'Aptitude Tests',
      path: '/aptitude',
      ctaText: 'Open Aptitude Hub',
      enabled: true,
    },
    {
      title: 'Explore Question Bank',
      description: 'Browse, filter, and practice curated interview questions with instant verification and bookmarks',
      icon: BookOpen,
      phaseBadge: 'Question Bank',
      path: '/questions',
      ctaText: 'Open Question Bank',
      enabled: true,
    },
    {
      title: 'Technical Practice Sandbox',
      description: 'Solve timed coding problems with multi-language sandbox execution (Java, Python, C++, JavaScript)',
      icon: Code2,
      phaseBadge: 'Coding Sandbox',
      path: '/practice',
      ctaText: 'Start Coding Practice',
      enabled: true,
    },
    {
      title: 'AI Mock Interview & Mentor',
      description: 'Simulate live tech and HR interviews with real-time AI critique, readiness scores, and study roadmaps',
      icon: Bot,
      phaseBadge: 'AI Interview',
      path: '/interview',
      ctaText: 'Start AI Interview',
      enabled: true,
    },
    {
      title: 'Personalized Study Roadmap',
      description: 'Create an adaptive preparation schedule based on your progress, weak spots, and target companies',
      icon: Calendar,
      phaseBadge: 'Study Roadmap',
      path: '/study-plan',
      ctaText: 'Open Study Plan',
      enabled: true,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Placement Preparation Platform v1.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, <span className="text-sky-600">{user?.name || 'Developer'}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your preparation dashboard is ready. Follow your structured placement path: learn core concepts, practice with hints, test under timed conditions, and conduct interactive AI mock interviews.
          </p>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <span>Preparation Overview</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-bold">
            Real-time Metrics
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden bg-white border-slate-200 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Action Modules */}
      <div>
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <span>Preparation Modules</span>
          <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold">
            All Features Active
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.path} className="block group">
                <Card className="h-full relative overflow-hidden transition-all duration-200 border-slate-200 bg-white hover:border-sky-300 hover:shadow-md">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {action.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
                          {action.phaseBadge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="mt-3 inline-flex items-center text-xs text-sky-600 font-bold group-hover:text-sky-700">
                        <span>{action.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
