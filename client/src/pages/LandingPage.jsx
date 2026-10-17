import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Code2,
  Bot,
  BarChart3,
  Calendar,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Target,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Interview Question Bank',
      description: 'Access 500+ curated DSA, System Design, and CS core questions categorized by top tech companies.',
      badge: 'Comprehensive',
    },
    {
      icon: Code2,
      title: 'Practice Sessions',
      description: 'Solve timed coding problems with built-in test runners, instant feedback, and optimal solution guides.',
      badge: 'Interactive',
    },
    {
      icon: Bot,
      title: 'AI Mock Interviews',
      description: 'Simulate realistic technical and behavioral interviews with real-time AI feedback on your performance.',
      badge: 'AI Powered',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track topic mastery, speed metrics, accuracy trends, and readiness scores with dynamic charts.',
      badge: 'Insights',
    },
    {
      icon: Calendar,
      title: 'Personalized Study Plan',
      description: 'Get tailored daily preparation schedules optimized for your target interview timeline and skill level.',
      badge: 'Adaptive',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Prep<span className="text-brand-500">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" icon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-24 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/30 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Next-Generation Technical Interview Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Prepare Smarter.{' '}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Interview Better.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              PrepAI combines structured DSA practice, realistic AI mock interview simulations, and actionable analytics to elevate your engineering career.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" variant="primary" icon={ArrowRight} className="w-full sm:w-auto">
                  Start Preparing Now
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </a>
            </div>

            {/* Micro badges */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>500+ Curated Problems</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>AI Feedback Engine</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real Company Benchmarks</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Everything You Need to Ace Tech Interviews
            </h2>
            <p className="text-sm text-slate-400">
              Designed specifically for computer science students and software engineers aiming for top tech offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{feature.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-300">PrepAI</span>
            <span>&copy; {new Date().getFullYear()} PrepAI Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <Link to="/" className="hover:text-slate-200">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-200">Terms of Service</Link>
            <Link to="/" className="hover:text-slate-200">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
