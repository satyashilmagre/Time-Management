import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';

export default function GoalsManagementPage() {
  const [dailyGoals, setDailyGoals] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalType, setGoalType] = useState('daily'); // 'daily' | 'weekly'
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('');
  const [goalTargetMinutes, setGoalTargetMinutes] = useState(60);
  const [goalTargetHours, setGoalTargetHours] = useState(10);
  const [modalLoading, setModalLoading] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const [goalRes, catRes] = await Promise.all([
        apiRequest('/api/goals?type=all'),
        apiRequest('/api/categories'),
      ]);

      if (goalRes.success) {
        setDailyGoals(goalRes.daily_goals || []);
        setWeeklyGoals(goalRes.weekly_goals || []);
      }
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('loadGoals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle) return;
    setModalLoading(true);

    try {
      if (goalType === 'daily') {
        const res = await apiRequest('/api/goals/daily', {
          method: 'POST',
          body: {
            title: goalTitle,
            category_id: goalCategory ? parseInt(goalCategory, 10) : null,
            target_minutes: parseInt(goalTargetMinutes, 10),
          },
        });
        if (res.success) setDailyGoals([res.goal, ...dailyGoals]);
      } else {
        const res = await apiRequest('/api/goals/weekly', {
          method: 'POST',
          body: {
            title: goalTitle,
            category_id: goalCategory ? parseInt(goalCategory, 10) : null,
            target_hours: parseFloat(goalTargetHours),
          },
        });
        if (res.success) setWeeklyGoals([res.goal, ...weeklyGoals]);
      }

      setIsModalOpen(false);
      setGoalTitle('');
    } catch (err) {
      alert(err.message || 'Failed to create goal');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleDailyGoal = async (goal) => {
    try {
      const newStatus = !goal.is_completed;
      const res = await apiRequest(`/api/goals/daily/${goal.id}`, {
        method: 'PUT',
        body: {
          is_completed: newStatus,
          current_minutes: newStatus ? goal.target_minutes : 0,
        },
      });
      if (res.success) {
        setDailyGoals(dailyGoals.map((g) => (g.id === goal.id ? res.goal : g)));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteDaily = async (id) => {
    try {
      await apiRequest(`/api/goals/daily/${id}`, { method: 'DELETE' });
      setDailyGoals(dailyGoals.filter((g) => g.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleDeleteWeekly = async (id) => {
    try {
      await apiRequest(`/api/goals/weekly/${id}`, { method: 'DELETE' });
      setWeeklyGoals(weeklyGoals.filter((g) => g.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Goals & Intentional Planning
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Define daily and weekly productivity objectives and track live completion progress.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 glow-brand"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Daily Goals Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Daily Productivity Goals</h2>
            <p className="text-xs text-slate-400">Target minutes to achieve today</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {dailyGoals.filter((g) => g.is_completed).length} / {dailyGoals.length} Done
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {dailyGoals.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No daily goals yet. Click "Create New Goal" above!</p>
          ) : (
            dailyGoals.map((g) => {
              const pct = Math.min(100, Math.round(((g.current_minutes || 0) / (g.target_minutes || 1)) * 100));
              return (
                <div
                  key={g.id}
                  className={`rounded-xl border p-4 transition ${
                    g.is_completed
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-950 dark:bg-emerald-950/10'
                      : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleDailyGoal(g)}
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                          g.is_completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 hover:border-indigo-500 dark:border-slate-700'
                        }`}
                      >
                        {g.is_completed && <CheckCircle2 className="h-4 w-4" />}
                      </button>

                      <div>
                        <p className={`text-xs font-semibold ${g.is_completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {g.title}
                        </p>
                        <span className="text-[10px] text-slate-400">{g.category_name || 'General'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {g.current_minutes} / {g.target_minutes} min ({pct}%)
                      </span>
                      <button
                        onClick={() => handleDeleteDaily(g.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${g.is_completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Weekly Goals Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Weekly High-Yield Targets</h2>
            <p className="text-xs text-slate-400">Total deep focus hours targeted for the current week</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {weeklyGoals.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No weekly targets defined.</p>
          ) : (
            weeklyGoals.map((wg) => {
              const currentH = parseFloat(wg.current_hours) || 0;
              const targetH = parseFloat(wg.target_hours) || 1;
              const pct = Math.min(100, Math.round((currentH / targetH) * 100));
              return (
                <div key={wg.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{wg.title}</h4>
                      <span className="text-[10px] text-slate-400">{wg.category_name || 'Work'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {currentH}h / {targetH}h ({pct}%)
                      </span>
                      <button
                        onClick={() => handleDeleteWeekly(wg.id)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Goal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Goal Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGoalType('daily')}
                    className={`rounded-lg py-1.5 text-xs font-semibold ${
                      goalType === 'daily'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Daily Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoalType('weekly')}
                    className={`rounded-lg py-1.5 text-xs font-semibold ${
                      goalType === 'weekly'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Weekly Target
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Study System Design, Exercise 45m..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select Domain...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {goalType === 'daily' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Target Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={goalTargetMinutes}
                    onChange={(e) => setGoalTargetMinutes(parseInt(e.target.value, 10))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Target Duration (Hours per week)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={goalTargetHours}
                    onChange={(e) => setGoalTargetHours(parseFloat(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                >
                  {modalLoading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

