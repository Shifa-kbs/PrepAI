import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Clock,
  Target,
  AlertCircle,
  Sliders,
  ChevronDown,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getStudyPlan,
  createOrUpdatePlan,
  toggleTaskCompletion,
  addCustomTask,
  deleteTask,
} from '../services/studyPlanService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_CATEGORIES = [
  'DSA',
  'Java',
  'Python',
  'JavaScript',
  'React',
  'SQL',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'HR',
];

const StudyPlanPage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [filterWeek, setFilterWeek] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state for creating/updating plan
  const [formData, setFormData] = useState({
    goal: 'Software Engineer Interview Prep',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    studyHoursPerWeek: 10,
    preferredDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
    targetCategories: ['DSA', 'React', 'SQL'],
  });

  // Form state for adding custom task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'DSA',
    day: 'Mon',
    estimatedMinutes: 30,
    week: 1,
  });

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudyPlan();
      if (res && res.success) {
        setPlan(res.data);
        if (res.data) {
          setFormData({
            goal: res.data.goal || '',
            targetDate: res.data.targetDate ? res.data.targetDate.split('T')[0] : '',
            studyHoursPerWeek: res.data.studyHoursPerWeek || 10,
            preferredDays: res.data.preferredDays || ['Mon', 'Wed', 'Fri'],
            targetCategories: res.data.targetCategories || ['DSA'],
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch study plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day);
      const updated = exists
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      return { ...prev, preferredDays: updated };
    });
  };

  const handleToggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.targetCategories.includes(cat);
      const updated = exists
        ? prev.targetCategories.filter((c) => c !== cat)
        : [...prev.targetCategories, cat];
      return { ...prev, targetCategories: updated };
    });
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (formData.preferredDays.length === 0) {
      toast.error('Please select at least one study day per week.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await createOrUpdatePlan(formData);
      if (res.success) {
        setPlan(res.data);
        setShowConfigModal(false);
        toast.success(res.message || 'Study plan generated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate study plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      // Optimistic update
      setPlan((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.tasks.map((t) =>
          t._id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        const comp = updatedTasks.filter((t) => t.isCompleted).length;
        const prog = updatedTasks.length > 0 ? Math.round((comp / updatedTasks.length) * 100) : 0;
        return {
          ...prev,
          tasks: updatedTasks,
          completedTasks: comp,
          progress: prog,
        };
      });

      const res = await toggleTaskCompletion(taskId);
      if (res.success) {
        setPlan(res.data);
      }
    } catch (err) {
      toast.error('Failed to update task status.');
      fetchPlan();
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await addCustomTask(newTask);
      if (res.success) {
        setPlan(res.data);
        setShowAddTaskModal(false);
        setNewTask({
          title: '',
          description: '',
          category: 'Algorithms',
          day: 'Mon',
          estimatedMinutes: 30,
          week: 1,
        });
        toast.success('Custom task added to your plan!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTask(taskId);
      if (res.success) {
        setPlan(res.data);
        toast.success('Task removed from plan');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading personalized study plan..." />;
  }

  // Filter tasks
  const filteredTasks = (plan?.tasks || []).filter((task) => {
    if (filterWeek !== 'all' && task.week !== parseInt(filterWeek, 10)) {
      return false;
    }
    if (filterStatus === 'completed' && !task.isCompleted) return false;
    if (filterStatus === 'pending' && task.isCompleted) return false;
    return true;
  });

  // Total unique weeks
  const totalWeeks = Array.from(new Set((plan?.tasks || []).map((t) => t.week))).sort((a, b) => a - b);

  // Days remaining calculation
  let daysRemaining = null;
  if (plan?.targetDate) {
    const diff = new Date(plan.targetDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Study Plan
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Adaptive Schedule
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Tailored preparation curriculum aligned with your interview targets and topic mastery.
          </p>
        </div>

        {plan && (
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4 text-brand-400" />
              <span>Regenerate Plan</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Task</span>
            </Button>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* If No Plan Exists: Initial Setup Onboarding Form */}
      {!plan ? (
        <Card className="max-w-2xl mx-auto p-6 sm:p-8 bg-slate-900/80 border-slate-800">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mx-auto text-brand-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Create Your Preparation Roadmap</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              PrepAI analyzes your topic strengths and target date to create a balanced schedule.
            </p>
          </div>

          <form onSubmit={handleSavePlan} className="space-y-6">
            <Input
              label="Preparation Goal"
              placeholder="e.g. SDE II at Meta, Frontend Specialist, Full Stack Engineer"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Interview Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Weekly Study Hours ({formData.studyHoursPerWeek} hrs/week)
                </label>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={formData.studyHoursPerWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, studyHoursPerWeek: Number(e.target.value) })
                  }
                  className="w-full accent-brand-500 mt-2"
                />
              </div>
            </div>

            {/* Preferred Study Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Preferred Study Days
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const selected = formData.preferredDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Topics */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Target Topics & Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const selected = formData.targetCategories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Generating Curriculum...' : 'Generate Personalized Study Plan'}
            </Button>
          </form>
        </Card>
      ) : (
        /* Plan View */
        <div className="space-y-6">
          {/* Plan Overview Banner */}
          <Card className="border-slate-800/80 bg-slate-900/60 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 font-semibold">
                    {plan.generationSource === 'ai' ? '🤖 AI Structured' : '⚡ Performance-Optimized'}
                  </span>
                  {daysRemaining !== null && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                      {daysRemaining} days remaining
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{plan.goal}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {plan.studyHoursPerWeek} hrs/week
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Days: {(plan.preferredDays || []).join(', ')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    Topics: {(plan.targetCategories || []).join(', ')}
                  </span>
                </div>
              </div>

              {/* Progress Dial */}
              <div className="flex items-center space-x-6 shrink-0 lg:border-l lg:border-slate-800 lg:pl-6">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white">{plan.progress}%</span>
                    <span className="text-xs text-slate-400">completed</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {plan.completedTasks} of {plan.totalTasks} tasks done
                  </p>
                  <div className="w-36 bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter by Week:
              </span>
              <button
                onClick={() => setFilterWeek('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterWeek === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                All Weeks
              </button>
              {totalWeeks.map((w) => (
                <button
                  key={w}
                  onClick={() => setFilterWeek(w.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    filterWeek === w.toString()
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Week {w}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Task Checklist */}
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No tasks match your filter</p>
              <p className="text-xs text-slate-500 mt-1">Adjust your week or status filters above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                    task.isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0 pr-4">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task._id)}
                      className={`mt-0.5 shrink-0 transition-transform hover:scale-110 ${
                        task.isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            task.isCompleted ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                          {task.category}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Week {task.week} • {task.day}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {task.estimatedMinutes}m
                        </span>
                      </div>

                      {task.description && (
                        <p
                          className={`text-xs ${
                            task.isCompleted ? 'text-slate-500' : 'text-slate-400'
                          } leading-relaxed`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regenerate Plan Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-xl w-full p-6 bg-slate-900 border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-400" />
                <span>Update Preparation Schedule</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <Input
                label="Target Goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Weekly Hours ({formData.studyHoursPerWeek}h)
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="40"
                    value={formData.studyHoursPerWeek}
                    onChange={(e) =>
                      setFormData({ ...formData, studyHoursPerWeek: Number(e.target.value) })
                    }
                    className="w-full accent-brand-500 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Study Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const selected = formData.preferredDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          selected ? 'bg-brand-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => {
                    const selected = formData.targetCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleToggleCategory(cat)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${
                          selected ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Regenerating...' : 'Regenerate Plan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <Card className="max-w-md w-full p-6 bg-slate-900 border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add Custom Task</span>
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <Input
                label="Task Title"
                placeholder="e.g. Implement LRU Cache in Python"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows="2"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Notes, references, or specific questions to solve..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    {ALL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scheduled Day
                  </label>
                  <select
                    value={newTask.day}
                    onChange={(e) => setNewTask({ ...newTask, day: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    {ALL_DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={newTask.estimatedMinutes}
                    onChange={(e) =>
                      setNewTask({ ...newTask, estimatedMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Week</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newTask.week}
                    onChange={(e) => setNewTask({ ...newTask, week: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddTaskModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Task'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudyPlanPage;
