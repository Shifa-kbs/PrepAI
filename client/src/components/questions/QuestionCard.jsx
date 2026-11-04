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
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const categoryBadgeStyles = {
  DSA: 'bg-sky-50 text-sky-700 border-sky-200',
  Java: 'bg-orange-50 text-orange-700 border-orange-200',
  Python: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'C++': 'bg-blue-50 text-blue-700 border-blue-200',
  JavaScript: 'bg-amber-50 text-amber-800 border-amber-200',
  SQL: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  DBMS: 'bg-teal-50 text-teal-800 border-teal-200',
  'Operating Systems': 'bg-purple-50 text-purple-700 border-purple-200',
  'Computer Networks': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  OOP: 'bg-pink-50 text-pink-700 border-pink-200',
  'Quantitative Aptitude': 'bg-sky-50 text-sky-800 border-sky-200',
  'Logical Reasoning': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Verbal Ability': 'bg-violet-50 text-violet-800 border-violet-200',
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
    <Card className="group relative transition-all duration-200 border-slate-200 hover:border-sky-300 hover:shadow-md bg-white flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category */}
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                categoryBadgeStyles[question.category] ||
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {question.category}
            </span>

            {/* Difficulty */}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                difficultyStyles[question.difficulty] ||
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {question.difficulty}
            </span>

            {/* Type */}
            {question.type && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
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
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 transition-transform ${
                isBookmarked ? 'fill-amber-500 text-amber-500 scale-105' : ''
              }`}
            />
          </button>
        </div>

        {/* Title */}
        <Link to={`/questions/${question._id}`} className="block group-hover:text-sky-600 transition-colors">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">
            {question.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {question.description}
        </p>

        {/* Company Tags */}
        {question.companyTags && question.companyTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Building2 className="w-3 h-3" />
            </span>
            {question.companyTags.slice(0, 3).map((comp) => (
              <span
                key={comp}
                className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
              >
                {comp}
              </span>
            ))}
            {question.companyTags.length > 3 && (
              <span className="text-[10px] font-medium text-slate-400">
                +{question.companyTags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Solved status & action */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          {status === 'solved' ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
              Solved
            </span>
          ) : status === 'attempted' ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Clock className="w-3 h-3 mr-1 text-amber-600" />
              Attempted ({attempts})
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              <Circle className="w-2.5 h-2.5 mr-1 text-slate-400" />
              Not Attempted
            </span>
          )}

          {hasNotes && (
            <span
              title="You have personal notes on this question"
              className="p-1 rounded bg-sky-50 text-sky-600 border border-sky-200"
            >
              <FileText className="w-3 h-3" />
            </span>
          )}
        </div>

        {/* View / Solve Link */}
        <Link
          to={`/questions/${question._id}`}
          className="inline-flex items-center text-xs font-bold text-sky-600 group-hover:text-sky-700 transition-colors"
        >
          <span>{status === 'solved' ? 'Review' : 'Solve'}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
};

export default QuestionCard;
