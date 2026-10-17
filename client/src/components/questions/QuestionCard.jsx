import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  Clock,
  Circle,
  Building2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import Card from '../common/Card';
import { toggleBookmark } from '../../services/questionService';
import toast from 'react-hot-toast';

const difficultyStyles = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const categoryBadgeStyles = {
  DSA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Java: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Python: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  SQL: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DBMS: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Operating Systems': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Computer Networks': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  OOP: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  JavaScript: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  React: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  HR: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const QuestionCard = ({ question, onBookmarkToggle }) => {
  const isBookmarkedInitially = Boolean(question.userProgress?.isBookmarked);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitially);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    setIsBookmarked(Boolean(question.userProgress?.isBookmarked));
  }, [question.userProgress?.isBookmarked]);

  const status = question.userProgress?.status || 'unsolved';
  const attempts = question.userProgress?.attempts || 0;
  const hasNotes = Boolean(question.userProgress?.notes);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkLoading) return;

    setBookmarkLoading(true);
    // Optimistic toggle
    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      const res = await toggleBookmark(question._id);
      setIsBookmarked(res.isBookmarked);
      toast.success(res.message || (res.isBookmarked ? 'Bookmarked' : 'Bookmark removed'));
      if (onBookmarkToggle) {
        onBookmarkToggle(question._id, res.isBookmarked);
      }
    } catch (err) {
      setIsBookmarked(prev);
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <Card className="group relative transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category */}
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                categoryBadgeStyles[question.category] ||
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {question.category}
            </span>

            {/* Difficulty */}
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                difficultyStyles[question.difficulty] ||
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {question.difficulty}
            </span>

            {/* Type */}
            {question.type && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                {question.type}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            disabled={bookmarkLoading}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Question'}
            className={`p-1.5 rounded-lg border transition-all ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform ${
                isBookmarked ? 'fill-amber-400 scale-105' : ''
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <Link to={`/questions/${question._id}`} className="block group-hover:text-brand-400 transition-colors">
          <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug">
            {question.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {question.description}
        </p>

        {/* Company Tags */}
        {question.companyTags && question.companyTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
              <Building2 className="w-3 h-3" />
            </span>
            {question.companyTags.slice(0, 3).map((comp) => (
              <span
                key={comp}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
              >
                {comp}
              </span>
            ))}
            {question.companyTags.length > 3 && (
              <span className="text-[10px] text-slate-500">
                +{question.companyTags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Solved status & action */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {status === 'solved' ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Solved
            </span>
          ) : status === 'attempted' ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Clock className="w-3 h-3 mr-1" />
              Attempted ({attempts})
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
              <Circle className="w-2.5 h-2.5 mr-1 text-slate-500" />
              Not Attempted
            </span>
          )}

          {hasNotes && (
            <span
              title="You have personal notes on this question"
              className="p-1 rounded bg-slate-800 text-brand-400 border border-brand-500/20"
            >
              <FileText className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* View / Solve Link */}
        <Link
          to={`/questions/${question._id}`}
          className="inline-flex items-center text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition-colors"
        >
          <span>{status === 'solved' ? 'Review' : 'Solve'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
};

export default QuestionCard;
