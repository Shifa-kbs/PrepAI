import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'DSA',
  'Java',
  'Python',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'JavaScript',
  'React',
  'Web Development',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'HR',
];

const DIFFICULTIES = ['All Difficulties', 'Easy', 'Medium', 'Hard'];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Solved', value: 'solved' },
  { label: 'Attempted', value: 'attempted' },
  { label: 'Unsolved', value: 'unsolved' },
];

const QuestionFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  difficulty,
  setDifficulty,
  company,
  setCompany,
  status,
  setStatus,
  savedOnly,
  setSavedOnly,
  availableCompanies = [],
  onReset,
}) => {
  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'all' ||
    difficulty !== 'all' ||
    company !== 'all' ||
    status !== 'all' ||
    savedOnly === true;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg shadow-black/20">
      {/* Top Row: Search & Saved Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by title, keyword, or concept..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter: Saved/Bookmarked Only Toggle */}
        <button
          type="button"
          onClick={() => setSavedOnly(!savedOnly)}
          className={`flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all shrink-0 ${
            savedOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${savedOnly ? 'bg-amber-400' : 'bg-slate-500'}`} />
          <span>Bookmarked Only</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-medium transition-all shrink-0"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Bottom Row: Dropdown Selects */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat === 'All Categories' ? 'all' : cat}
                className="bg-slate-900 text-slate-200"
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {DIFFICULTIES.map((diff) => (
              <option
                key={diff}
                value={diff === 'All Difficulties' ? 'all' : diff}
                className="bg-slate-900 text-slate-200"
              >
                {diff}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Company
          </label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">
              All Companies
            </option>
            {availableCompanies.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Solved Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-slate-900 text-slate-200"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuestionFilters;
