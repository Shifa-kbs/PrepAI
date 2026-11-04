import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'DSA',
  'Java',
  'Python',
  'C++',
  'JavaScript',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
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
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
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
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter: Saved/Bookmarked Only Toggle */}
        <button
          type="button"
          onClick={() => setSavedOnly(!savedOnly)}
          className={`flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            savedOnly
              ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${savedOnly ? 'bg-amber-500' : 'bg-slate-400'}`} />
          <span>Bookmarked Only</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold transition-all shrink-0 cursor-pointer"
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
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option
                key={cat}
                value={cat === 'All Categories' ? 'all' : cat}
              >
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
          >
            {DIFFICULTIES.map((diff) => (
              <option
                key={diff}
                value={diff === 'All Difficulties' ? 'all' : diff}
              >
                {diff}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Company
          </label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
          >
            <option value="all">
              All Companies
            </option>
            {availableCompanies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Solved Status Filter */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
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
