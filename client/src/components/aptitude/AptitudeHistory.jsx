import React, { useState, useEffect } from 'react';
import {
  History,
  Clock,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { getAptitudeHistory } from '../../services/aptitudeService';
import toast from 'react-hot-toast';

const AptitudeHistory = ({ onSelectSession, onStartNew }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sectionFilter, setSectionFilter] = useState('All');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getAptitudeHistory({ page, limit: 10 });
        if (data.success) {
          setSessions(data.sessions || []);
          setPagination(data.pagination);
        }
      } catch (err) {
        toast.error('Failed to load assessment history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  const filteredSessions = sessions.filter((s) => {
    if (sectionFilter === 'All') return true;
    return (s.section || s.category) === sectionFilter;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return <LoadingSpinner label="Loading aptitude assessment history..." />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <span>Aptitude Assessment History</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review past test scores, accuracy trends, and step-by-step explanations.
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Full Aptitude Test'].map(
            (sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  sectionFilter === sec
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec === 'All' ? 'All Sections' : sec.replace(' Aptitude', '').replace(' Ability', '')}
              </button>
            )
          )}
        </div>
      </div>

      {/* History Session Cards */}
      {filteredSessions.length === 0 ? (
        <Card className="text-center py-16 bg-white border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto text-sky-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Assessment Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't completed any aptitude assessments in this category yet. Take your first timed
              section test or full-length placement mock.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onStartNew} className="text-xs font-bold">
            Start Assessment Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((sessionItem) => {
            const isCompleted = sessionItem.status === 'completed';
            const accuracy = sessionItem.accuracy ?? 0;
            const score = sessionItem.score ?? 0;

            let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (accuracy >= 80) badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
            else if (accuracy >= 60) badgeColor = 'bg-sky-50 text-sky-800 border-sky-300';
            else if (accuracy > 0) badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';

            return (
              <Card
                key={sessionItem._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-slate-200 hover:border-sky-300 hover:shadow-md transition-all shadow-xs"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-sky-600">
                      {sessionItem.section || sessionItem.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sessionItem.mode === 'topic' ? 'Practice Mode' : 'Timed Assessment'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {sessionItem.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTime(sessionItem.timeTakenSeconds || 0)}</span>
                    </span>
                    <span>•</span>
                    <span>{sessionItem.totalQuestions} Questions</span>
                    <span>•</span>
                    <span>{formatDate(sessionItem.completedAt || sessionItem.createdAt)}</span>
                  </div>
                </div>

                {/* Score & View CTA */}
                <div className="flex items-center space-x-4 shrink-0 sm:border-l sm:border-slate-100 sm:pl-5">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-slate-900">{score} pts</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                        {accuracy}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {isCompleted ? 'Assessment Finished' : 'Incomplete Session'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectSession(sessionItem._id)}
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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-500">
          <span>
            Showing Page {page} of {pagination.totalPages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AptitudeHistory;
