import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { navItems } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const MobileSidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 border-r border-slate-800 p-5 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-white">PrepAI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.enabled) {
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
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
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-950/40 cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <span className="text-[10px] font-semibold bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  {item.phase}
                </span>
              </div>
            );
          })}

          {/* Admin link for mobile */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-slate-800">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-500/80 mb-1.5">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-rose-400/80 hover:text-rose-200 hover:bg-slate-800'
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
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
