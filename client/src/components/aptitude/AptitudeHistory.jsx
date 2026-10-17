import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-400" />
            <span>Aptitude Assessment History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review past test scores, accuracy trends, and step-by-step explanations.
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Full Aptitude Test'].map(
            (sec) => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  sectionFilter === sec
                    ? 'bg-brand-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sec === 'All' ? 'All Sections' : sec.replace(' Aptitude', '').replace(' Ability', '')}
              </button>
            )
          )}
        </div>
      </div>

      {/* History List */}
      {filteredSessions.length === 0 ? (
        <Card className="text-center py-16 bg-slate-900/60 border-slate-800 space-y-4">
          <Award className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Assessment History Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't completed any aptitude assessments in this section yet. Take a section test
              or topic practice to record your first score!
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onStartNew} className="text-xs font-semibold">
            Start First Assessment
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((s) => {
            const accuracy = s.accuracy || 0;
            const isHighAccuracy = accuracy >= 70;
            const isModerate = accuracy >= 40 && accuracy < 70;

            return (
              <Card
                key={s._id}
                className="bg-slate-900/90 border-slate-800 hover:border-slate-700 transition-all p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {s.section || s.category}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {s.mode === 'topic' ? 'Practice' : 'Timed Test'}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.difficulty}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(s.completedAt)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatTime(s.timeTakenSeconds || 0)}</span>
                      </span>
                      <span>{s.totalQuestions} Questions</span>
                    </div>
                  </div>

                  {/* Right Score & Review Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-base font-black text-white">{s.score} pts</p>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p
                        className={`text-base font-black ${
                          isHighAccuracy
                            ? 'text-emerald-400'
                            : isModerate
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {s.accuracy}%
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={BookOpen}
                      onClick={() => onSelectSession(s._id)}
                      className="text-xs font-semibold"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} Total Attempts)
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs"
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
