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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Prep<span className="text-sky-500">AI</span>
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
        <section className="relative pt-20 pb-24 px-6 overflow-hidden bg-gradient-to-b from-sky-50/50 via-white to-white">
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold shadow-xs">
              <Target className="w-3.5 h-3.5 text-sky-500" />
              <span>Next-Generation Technical Placement & Interview Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Prepare Smarter.{' '}
              <span className="text-sky-600">
                Interview Better.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              PrepAI guides you from foundational concepts to practice, topic tests, AI mock interviews, and full-length placement tests with actionable analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" variant="primary" icon={ArrowRight} className="w-full sm:w-auto shadow-md">
                  Start Preparing Now
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Learning Journey
                </Button>
              </a>
            </div>

            {/* Micro badges */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>500+ Curated Problems</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                <span>Structured Topic Lessons</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI Interview Evaluations</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Complete Placement Preparation Journey
            </h2>
            <p className="text-sm text-slate-600">
              Structured step-by-step guidance designed specifically for software engineering candidates aiming for top-tier offers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="flex flex-col justify-between space-y-4 border-slate-200/80 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
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
      <footer className="bg-slate-50 border-t border-slate-200 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-sky-500 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">PrepAI</span>
            <span>&copy; {new Date().getFullYear()} PrepAI Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-500 font-medium">
            <Link to="/" className="hover:text-slate-800">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-800">Terms of Service</Link>
            <Link to="/" className="hover:text-slate-800">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
