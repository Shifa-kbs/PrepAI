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
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 p-5 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-extrabold text-slate-900">
              Prep<span className="text-sky-500">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

          {/* Admin link for mobile */}
          {isAdmin && (
            <div className="pt-3 mt-3 border-t border-slate-200">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-1.5">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default MobileSidebar;
