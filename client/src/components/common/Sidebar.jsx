import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Bot,
  BarChart3,
  Calendar,
  User,
  ShieldCheck,
  Lock,
  Brain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true },
  { name: 'Question Bank', path: '/questions', icon: BookOpen, enabled: true },
  { name: 'Practice', path: '/practice', icon: Code2, enabled: true },
  { name: 'Aptitude Assessment', path: '/aptitude', icon: Brain, enabled: true },
  { name: 'Mock Interview', path: '/interview', icon: Bot, enabled: true },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, enabled: true },
  { name: 'Study Plan', path: '/study-plan', icon: Calendar, enabled: true },
  { name: 'Profile', path: '/profile', icon: User, enabled: true },
];

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-slate-900/60 border-r border-slate-800/80 min-h-[calc(100vh-57px)] p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.enabled) {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </div>
                  </NavLink>
                );
              }

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-950/30 border border-transparent cursor-not-allowed group relative"
                  title={`${item.name} will be available in ${item.phase}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    {item.phase}
                  </span>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation Section (Visible only to authorized Admins) */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-500/80 mb-2">
              Administration
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-rose-400/80 hover:text-rose-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[9px] font-bold uppercase bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
