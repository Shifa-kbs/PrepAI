import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, CheckCircle2, Bookmark, Sparkles, FilterX } from 'lucide-react';
import { getQuestions, getQuestionFilters } from '../services/questionService';
import QuestionCard from '../components/questions/QuestionCard';
import QuestionFilters from '../components/questions/QuestionFilters';
import QuestionPagination from '../components/questions/QuestionPagination';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import Card from '../components/common/Card';

const QuestionBankPage = () => {
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [company, setCompany] = useState('all');
  const [status, setStatus] = useState('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 9;

  // Data & UI State
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Quick stats derived from questions or backend
  const [stats, setStats] = useState({
    totalCount: 0,
    solvedCount: 0,
    savedCount: 0,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load available filter options once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const data = await getQuestionFilters();
        if (data.companies) {
          setAvailableCompanies(data.companies);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch Questions
  const fetchQuestionsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch,
        category,
        difficulty,
        company,
        status,
        saved: savedOnly ? 'true' : undefined,
      };

      const data = await getQuestions(params);
      if (data.success) {
        setQuestions(data.questions || []);
        if (data.pagination) {
          setPagination(data.pagination);
          setStats((prev) => ({
            ...prev,
            totalCount: data.pagination.total,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to fetch questions. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, category, difficulty, company, status, savedOnly]);

  useEffect(() => {
    fetchQuestionsList();
  }, [fetchQuestionsList]);

  // Reset page when dropdown filters change
  const handleCategoryChange = (val) => {
    setCategory(val);
    setPage(1);
  };

  const handleDifficultyChange = (val) => {
    setDifficulty(val);
    setPage(1);
  };

  const handleCompanyChange = (val) => {
    setCompany(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handleSavedOnlyChange = (val) => {
    setSavedOnly(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('all');
    setDifficulty('all');
    setCompany('all');
    setStatus('all');
    setSavedOnly(false);
    setPage(1);
  };

  const handleBookmarkToggle = (qId, isBookmarked) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q._id === qId) {
          return {
            ...q,
            userProgress: {
              ...q.userProgress,
              isBookmarked,
            },
          };
        }
        return q;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Curated Placement Question Bank</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Technical Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Browse, filter, and practice curated interview questions across DSA, Core CS, and Frameworks with instant sandbox execution.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-3">
          <Card className="px-3.5 py-2.5 bg-white border-slate-200 flex items-center space-x-3 shadow-xs">
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total in Bank</p>
              <p className="text-sm font-extrabold text-slate-900">{pagination.total}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Filter Component */}
      <QuestionFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={handleCategoryChange}
        difficulty={difficulty}
        setDifficulty={handleDifficultyChange}
        company={company}
        setCompany={handleCompanyChange}
        status={status}
        setStatus={handleStatusChange}
        savedOnly={savedOnly}
        setSavedOnly={handleSavedOnlyChange}
        availableCompanies={availableCompanies}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner label="Loading technical questions..." />
      ) : error ? (
        <ErrorMessage
          message={error}
          action={
            <button
              onClick={fetchQuestionsList}
              className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          }
        />
      ) : questions.length === 0 ? (
        <EmptyState
          icon={FilterX}
          title="No Questions Match Your Criteria"
          description="Try broadening your search query or resetting filters to see available technical questions."
          actionText="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          {/* Question Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((q) => (
              <QuestionCard
                key={q._id}
                question={q}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>

          {/* Pagination */}
          <QuestionPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(newPage) => setPage(newPage)}
            loading={loading}
          />
        </>
      )}
    </div>
  );
};

export default QuestionBankPage;
