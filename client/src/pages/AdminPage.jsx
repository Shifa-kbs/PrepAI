import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Code2,
  Bot,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getPlatformStats,
  getUsers,
  updateUserRole,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../services/adminService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ALL_CATEGORIES = [
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

const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'users' | 'questions'

  // Platform Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // User Management State
  const [users, setUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // Questions Management State
  const [questions, setQuestions] = useState([]);
  const [questionPagination, setQuestionPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionCatFilter, setQuestionCatFilter] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Modals
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    category: 'DSA',
    difficulty: 'Medium',
    companyTags: '',
    sampleAnswer: '',
    explanation: '',
    type: 'conceptual',
  });

  // Load stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await getPlatformStats();
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch platform metrics.');
    } finally {
      setStatsLoading(false);
    }
  };

  // Load users
  const fetchUsers = async (page = 1) => {
    try {
      setUsersLoading(true);
      const res = await getUsers({
        page,
        limit: 10,
        search: userSearch,
        role: userRoleFilter,
      });
      if (res && res.success) {
        setUsers(res.data.users);
        setUserPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Load questions
  const fetchQuestions = async (page = 1) => {
    try {
      setQuestionsLoading(true);
      const res = await getAdminQuestions({
        page,
        limit: 10,
        search: questionSearch,
        category: questionCatFilter,
      });
      if (res && res.success) {
        setQuestions(res.data.questions);
        setQuestionPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load questions.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(1);
    } else if (activeTab === 'questions') {
      fetchQuestions(1);
    }
  }, [activeTab]);

  // Handle user role change
  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    const confirmMsg = `Are you sure you want to change this user's role to "${newRole}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        toast.success(res.message);
        fetchUsers(userPagination.page);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  // Handle Question Create / Edit
  const handleOpenCreateModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      title: '',
      description: '',
      category: 'DSA',
      difficulty: 'Medium',
      companyTags: '',
      sampleAnswer: '',
      explanation: '',
      type: 'conceptual',
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      title: q.title || '',
      description: q.description || '',
      category: q.category || 'DSA',
      difficulty: q.difficulty || 'Medium',
      companyTags: (q.companyTags || []).join(', '),
      sampleAnswer: q.sampleAnswer || '',
      explanation: q.explanation || '',
      type: q.type || 'conceptual',
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      ...questionForm,
      companyTags: questionForm.companyTags
        ? questionForm.companyTags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    try {
      if (editingQuestion) {
        const res = await updateQuestion(editingQuestion._id, payload);
        if (res.success) {
          toast.success('Question updated successfully!');
        }
      } else {
        const res = await createQuestion(payload);
        if (res.success) {
          toast.success('Question created successfully!');
        }
      }
      setShowQuestionModal(false);
      fetchQuestions(questionPagination.page);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    }
  };

  const handleDeleteQuestion = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await deleteQuestion(id);
      if (res.success) {
        toast.success('Question deleted successfully!');
        fetchQuestions(questionPagination.page);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Portal
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Authenticated Administrator
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Platform governance, real database metrics, user permissions, and question bank administration.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Questions
          </button>
        </div>
      </div>

      {/* Tab 1: Platform Overview & Database Statistics */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Real-Time Database Records</span>
            </h2>
            <Button
              size="xs"
              variant="outline"
              onClick={fetchStats}
              disabled={statsLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </Button>
          </div>

          {statsLoading && !stats ? (
            <LoadingSpinner label="Loading database records..." />
          ) : (
            <>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Users */}
                <Card className="border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Registered Users
                      </p>
                      <p className="text-3xl font-black text-slate-900 mt-2">
                        {stats?.users?.total ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {stats?.users?.students ?? 0} students • {stats?.users?.admins ?? 0} admins
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Questions */}
                <Card className="border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question Bank
                      </p>
                      <p className="text-3xl font-black text-emerald-600 mt-2">
                        {stats?.questions?.total ?? 0}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        DSA & technical interview questions
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Practice Sessions */}
                <Card className="border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Practice Sessions
                      </p>
                      <p className="text-3xl font-black text-indigo-600 mt-2">
                        {stats?.practiceSessions?.completed ?? 0}
                        <span className="text-sm font-normal text-slate-400 ml-1">
                          / {stats?.practiceSessions?.total ?? 0}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Completed coding workouts
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                      <Code2 className="w-5 h-5" />
                    </div>
                  </div>
                </Card>

                {/* Mock Interviews */}
                <Card className="border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Mock Interviews
                      </p>
                      <p className="text-3xl font-black text-amber-600 mt-2">
                        {stats?.mockInterviews?.completed ?? 0}
                        <span className="text-sm font-normal text-slate-400 ml-1">
                          / {stats?.mockInterviews?.total ?? 0}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Avg score: {stats?.mockInterviews?.averageScore ?? 0}/100
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                      <Bot className="w-5 h-5" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Security & Access Hygiene Notice */}
              <Card className="border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">Administrator Security Safeguards</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      All admin endpoints require valid JWT authentication and role verification. Passwords, hashes, and secrets are strictly excluded from all API responses. Self-demotion is blocked to prevent administrative lockouts.
                    </p>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Safe search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <Button size="xs" onClick={() => fetchUsers(1)}>
                Search
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  fetchUsers(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <Card className="border-slate-200 bg-white overflow-hidden p-0 shadow-xs">
            {usersLoading ? (
              <div className="py-12">
                <LoadingSpinner label="Loading users..." />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No users matched your search criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Joined</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const isSelf = currentUser?._id === u._id || currentUser?.id === u._id;
                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center space-x-2">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.2 rounded font-semibold">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                u.role === 'admin'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Self-Protected
                              </span>
                            ) : (
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => handleRoleToggle(u._id, u.role)}
                                className={
                                  u.role === 'admin'
                                    ? 'text-amber-700 hover:text-amber-800'
                                    : 'text-sky-600 hover:text-sky-700'
                                }
                              >
                                {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {userPagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Page {userPagination.page} of {userPagination.totalPages} ({userPagination.total} total)
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={userPagination.page <= 1}
                    onClick={() => fetchUsers(userPagination.page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={userPagination.page >= userPagination.totalPages}
                    onClick={() => fetchUsers(userPagination.page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Question Bank Content Management */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Actions & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions by title or keyword..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchQuestions(1)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <Button size="xs" onClick={() => fetchQuestions(1)}>
                Search
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={questionCatFilter}
                onChange={(e) => {
                  setQuestionCatFilter(e.target.value);
                  fetchQuestions(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="">All Categories</option>
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Question</span>
              </Button>
            </div>
          </div>

          {/* Question Table */}
          <Card className="border-slate-200 bg-white overflow-hidden p-0 shadow-xs">
            {questionsLoading ? (
              <div className="py-12">
                <LoadingSpinner label="Loading questions..." />
              </div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No questions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Question Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Difficulty</th>
                      <th className="px-4 py-3">Pass Rate</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q) => (
                      <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 max-w-xs truncate">
                          {q.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                            {q.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : q.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {q.stats?.passRate !== undefined ? `${q.stats.passRate}%` : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleOpenEditModal(q)}
                              className="text-slate-600 hover:text-slate-900"
                              title="Edit question"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleDeleteQuestion(q._id, q.title)}
                              className="text-rose-600 hover:text-rose-700"
                              title="Delete question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {questionPagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs text-slate-500">
                <span>
                  Page {questionPagination.page} of {questionPagination.totalPages} ({questionPagination.total} total)
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={questionPagination.page <= 1}
                    onClick={() => fetchQuestions(questionPagination.page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={questionPagination.page >= questionPagination.totalPages}
                    onClick={() => fetchQuestions(questionPagination.page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Question Create / Edit Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <Card className="max-w-2xl w-full p-6 bg-white border-slate-200 space-y-4 my-8 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <span>{editingQuestion ? 'Edit Question' : 'Add New Question'}</span>
              </h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <Input
                label="Question Title"
                placeholder="e.g. Invert Binary Tree"
                value={questionForm.title}
                onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={questionForm.category}
                    onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={questionForm.difficulty}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, difficulty: e.target.value })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {ALL_DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description (Markdown supported)
                </label>
                <textarea
                  rows="4"
                  value={questionForm.description}
                  onChange={(e) =>
                    setQuestionForm({ ...questionForm, description: e.target.value })
                  }
                  required
                  placeholder="Problem statement, inputs, outputs, and constraints..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <Input
                label="Company Tags (comma-separated)"
                placeholder="Google, Amazon, Microsoft"
                value={questionForm.companyTags}
                onChange={(e) => setQuestionForm({ ...questionForm, companyTags: e.target.value })}
              />

              {/* Solution fields (only visible/editable by admin) */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Admin Protected Solution Fields
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sample Answer / Solution Code
                  </label>
                  <textarea
                    rows="3"
                    value={questionForm.sampleAnswer}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, sampleAnswer: e.target.value })
                    }
                    required
                    placeholder="Reference solution implementation or answer..."
                    className="w-full bg-slate-50 font-mono border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Explanation
                  </label>
                  <textarea
                    rows="2"
                    value={questionForm.explanation}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, explanation: e.target.value })
                    }
                    placeholder="Time and space complexity breakdown..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowQuestionModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
