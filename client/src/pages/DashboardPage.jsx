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
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  Brain,
} from 'lucide-react';
import Card from '../components/common/Card';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Preparation Score',
      value: user?.stats?.prepScore ?? 0,
      max: 1000,
      icon: Trophy,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      description: 'Overall interview readiness score',
    },
    {
      title: 'Questions Solved',
      value: user?.stats?.questionsSolved ?? 0,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      description: 'DSA & Technical problems solved',
    },
    {
      title: 'Mock Interviews',
      value: user?.stats?.mockInterviewsCompleted ?? 0,
      icon: Bot,
      color: 'from-brand-500/20 to-indigo-500/10 text-brand-400 border-brand-500/30',
      description: 'Completed AI mock sessions',
    },
    {
      title: 'Current Streak',
      value: `${user?.stats?.currentStreak ?? 0} Days`,
      icon: Flame,
      color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
      description: 'Consecutive preparation activity',
    },
  ];

  const quickActions = [
    {
      title: 'Aptitude Assessment',
      description: 'Practice Quantitative, Logical, and Verbal reasoning with full-length timed placement tests',
      icon: Brain,
      phaseBadge: 'Aptitude Hub',
      path: '/aptitude',
      ctaText: 'Open Aptitude Assessment',
      enabled: true,
    },
    {
      title: 'Explore Question Bank',
      description: 'Browse, filter, and practice curated interview questions with instant verification',
      icon: BookOpen,
      phaseBadge: 'Question Bank',
      path: '/questions',
      ctaText: 'Open Question Bank',
      enabled: true,
    },
    {
      title: 'Start Practice Session',
      description: 'Solve timed technical problems with instant test feedback and track accuracy',
      icon: Code2,
      phaseBadge: 'Technical Practice',
      path: '/practice',
      ctaText: 'Start Practice Session',
      enabled: true,
    },
    {
      title: 'Schedule AI Mock Session',
      description: 'Simulate live tech interviews with real-time AI critique',
      icon: Bot,
      phaseBadge: 'Phase 5 Active',
      path: '/interview',
      ctaText: 'Start AI Interview',
      enabled: true,
    },
    {
      title: 'Personalized Study Roadmap',
      description: 'Create an adaptive preparation schedule based on your progress and mastery',
      icon: Calendar,
      phaseBadge: 'Phase 6 Active',
      path: '/study-plan',
      ctaText: 'Open Study Plan',
      enabled: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900/40 via-slate-900 to-slate-900 border border-brand-500/20 p-6 sm:p-8">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 6 Active: Analytics, Study Plans & Admin Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="bg-gradient-to-r from-brand-300 to-indigo-200 bg-clip-text text-transparent">{user?.name || 'Developer'}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your prep dashboard is ready. Browse technical interview questions, test your solutions, track bookmarks, and review detailed explanations.
          </p>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <span>Preparation Overview</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Real-time Metrics</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">{stat.title}</p>
                    <p className="text-2xl font-black text-white mt-2 tracking-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${stat.color}`}>
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
        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
          <span>Preparation Modules</span>
          <span className="text-[10px] bg-brand-500/10 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded">Phase 3 Active</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            if (action.enabled) {
              return (
                <Link key={action.title} to={action.path} className="block group">
                  <Card className="h-full relative overflow-hidden transition-all duration-200 hover:border-brand-500/40 hover:bg-slate-900/90">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-brand-300 transition-colors">
                            {action.title}
                          </h3>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {action.phaseBadge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{action.description}</p>
                        <div className="mt-3 inline-flex items-center text-xs text-brand-400 font-semibold group-hover:text-brand-300">
                          <span>{action.ctaText || 'Get Started'}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            }

            return (
              <Card key={action.title} className="group relative overflow-hidden bg-slate-950/40 border-slate-800/80">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-300">{action.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-500 border border-slate-700">
                        {action.phaseBadge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{action.description}</p>
                    <div className="mt-3 inline-flex items-center text-xs text-slate-600 font-medium cursor-not-allowed">
                      <span>Module Locked</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1 text-slate-700" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
