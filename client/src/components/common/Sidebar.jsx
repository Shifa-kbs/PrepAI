import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Code2,
  Bot,
  BarChart3,
  Calendar,
  User,
  ShieldCheck,
  Lock,
  Brain,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, enabled: true },
  { name: 'Learning Studio', path: '/learn', icon: BookOpen, enabled: true },
  { name: 'Question Bank', path: '/questions', icon: Layers, enabled: true },
  { name: 'Practice Sandbox', path: '/practice', icon: Code2, enabled: true },
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
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-57px)] p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation Section (Visible only to authorized Admins) */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-2">
              Administration
            </p>
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                      : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span>Admin Dashboard</span>
                </div>
                <span className="text-[9px] font-bold uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
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
