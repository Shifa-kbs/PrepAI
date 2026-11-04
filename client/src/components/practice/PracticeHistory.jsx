import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  RotateCcw,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { getPracticeHistory } from '../../services/practiceService';

const PracticeHistory = ({ onSelectSession, onStartNew }) => {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPracticeHistory({ page, limit: 10 });
      if (data.success) {
        setSessions(data.sessions || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch practice history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(pagination.page);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-7 h-7 text-sky-600" />
            <span>Practice Session History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your past practice rounds, analyze accuracy trends, and revisit detailed explanations.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onStartNew} icon={RotateCcw} className="text-xs font-bold">
          New Session
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading practice history..." />
      ) : error ? (
        <Card className="p-6 bg-white border-rose-200 text-center space-y-3 shadow-xs">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-sm text-rose-800 font-bold">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchHistory(1)}>
            Retry
          </Button>
        </Card>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Practice Sessions Yet"
          description="Complete your first practice round to see performance history, scores, and accuracy metrics here."
          actionText="Start Practice Session"
          onAction={onStartNew}
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => {
            const isCompleted = sess.status === 'completed';
            const answeredCount = (sess.answers || []).filter((a) => a.status !== 'skipped').length;
            const accuracy = sess.accuracy ?? 0;

            let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (accuracy >= 80) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
            else if (accuracy >= 50) badgeColor = 'bg-sky-50 text-sky-800 border-sky-300';
            else if (accuracy > 0) badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';

            return (
              <Card
                key={sess._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-slate-200 hover:border-sky-300 hover:shadow-md transition-all shadow-xs"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-sky-600">
                      {sess.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sess.mode === 'mixed' ? 'Mixed Placement Test' : 'Topic Practice'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sess.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDuration(sess.timeTakenSeconds || 0)}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {answeredCount} of {sess.totalQuestions} Questions Answered
                    </span>
                    <span>•</span>
                    <span>{formatDate(sess.completedAt || sess.createdAt)}</span>
                  </div>
                </div>

                {/* Score & View CTA */}
                <div className="flex items-center space-x-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-5">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{sess.score || 0} pts</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {accuracy}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {isCompleted ? 'Finished' : 'Incomplete'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectSession(sess._id)}
                    className="text-xs font-bold"
                  >
                    <span>Review</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PracticeHistory;
