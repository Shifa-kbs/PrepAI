import React, { useState, useEffect } from 'react';
import {
  History,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <History className="w-7 h-7 text-brand-400" />
            <span>Practice Session History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review your past practice rounds, analyze accuracy trends, and revisit detailed explanations.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onStartNew} icon={RotateCcw} className="text-xs">
          New Session
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading practice history..." />
      ) : error ? (
        <Card className="p-6 bg-slate-900 border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-300 font-medium">{error}</p>
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
          {sessions.map((session) => (
            <Card
              key={session._id}
              className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {session.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                    {session.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(session.completedAt)}
                  </span>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-300">
                  <span>
                    <strong className="text-white">{session.totalQuestions}</strong> Questions
                  </span>
                  <span>•</span>
                  <span>
                    Score: <strong className="text-brand-400">{session.score}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Accuracy: <strong className="text-emerald-400">{session.accuracy}%</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {formatDuration(session.timeTakenSeconds || 0)}
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectSession(session._id)}
                icon={ArrowRight}
                className="text-xs shrink-0"
              >
                Review Summary
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PracticeHistory;
