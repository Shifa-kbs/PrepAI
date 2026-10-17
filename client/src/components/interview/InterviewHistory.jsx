import React, { useState, useEffect } from 'react';
import {
  History,
  Bot,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { getMockInterviewHistory } from '../../services/interviewService';
import toast from 'react-hot-toast';

const InterviewHistory = ({ onSelectInterview, onStartNew }) => {
  const [interviews, setInterviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getMockInterviewHistory({ page, limit: 10 });
      if (res.success) {
        setInterviews(res.interviews || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      toast.error('Failed to load mock interview history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading interview history..." />;
  }

  if (interviews.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No Mock Interviews Yet"
        description="You have not completed any AI Mock Interviews yet. Start an interview to practice real-world questions and receive structured feedback."
        actionLabel="Start AI Mock Interview"
        onAction={onStartNew}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Mock Interview History</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your past AI mock interviews, track performance progression, and inspect detailed hiring feedback.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onStartNew}
          icon={Bot}
          className="text-xs bg-purple-600 hover:bg-purple-500 border-purple-500/30"
        >
          New Mock Interview
        </Button>
      </div>

      <div className="space-y-3">
        {interviews.map((item) => (
          <Card
            key={item._id}
            className="bg-slate-900/80 border-slate-800 p-5 hover:border-purple-500/30 transition-all cursor-pointer group"
            onClick={() => onSelectInterview(item._id)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.jobRole}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.interviewType}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {item.difficulty}
                  </span>
                </div>

                {item.finalReport?.summary && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.finalReport.summary}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {item.completedAt
                        ? new Date(item.completedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{item.totalQuestions} Questions</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Score
                  </span>
                  <span className="text-xl font-black text-white">
                    {item.overallScore || 0}
                    <span className="text-xs text-slate-500 font-semibold">/100</span>
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => fetchHistory(pagination.page - 1)}
            className="text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-slate-400 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchHistory(pagination.page + 1)}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
