import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  TrendingUp,
  Target,
  Sparkles,
  Play,
  Square,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useTimer, formatTime } from '../context/TimerContext';
import ScoreGauge from '../components/common/ScoreGauge';
import TimeBadge from '../components/common/TimeBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeTimer, formattedElapsed, startTimer, pauseTimer, resumeTimer, stopTimer } = useTimer();

  const [dailyData, setDailyData] = useState(null);
  const [weeklyComparison, setWeeklyComparison] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Start Timer Form State
  const [quickActivityName, setQuickActivityName] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickClassification, setQuickClassification] = useState('productive');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dailyRes, weeklyRes, catRes] = await Promise.all([
        apiRequest('/api/analytics/daily'),
        apiRequest('/api/analytics/weekly'),
        apiRequest('/api/categories'),
      ]);

      if (dailyRes.success) setDailyData(dailyRes);
      if (weeklyRes.success) setWeeklyComparison(weeklyRes);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Load dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleStartQuickTimer = async (e) => {
    e.preventDefault();
    if (!quickActivityName) return;
    await startTimer({
      activity_name: quickActivityName,
      category_id: quickCategory ? parseInt(quickCategory, 10) : null,
      productivity_classification: quickClassification,
    });
    setQuickActivityName('');
    await loadDashboard();
  };

  const handleStopQuickTimer = async () => {
    await stopTimer();
    await loadDashboard();
  };

  const summary = dailyData?.summary || {
    total_time_seconds: 0,
    productive_time_seconds: 0,
    neutral_time_seconds: 0,
    unproductive_time_seconds: 0,
    focus_time_seconds: 0,
    remaining_available_seconds: 86400,
    remaining_work_seconds: 28800,
    productivity_score: 85,
    completed_tasks: 0,
    total_goals: 0,
    activities_count: 0,
  };

  const categoryBreakdown = (dailyData?.category_breakdown || []).map((c) => ({
    name: c.name,
    value: Math.round(c.duration_seconds / 60),
    color: c.color || '#6366f1',
  }));

  // Safe fallback if category breakdown is empty
  const pieData = categoryBreakdown.length > 0 ? categoryBreakdown : [
    { name: 'Work', value: 240, color: '#3b82f6' },
    { name: 'Coding', value: 180, color: '#6366f1' },
    { name: 'Learning', value: 60, color: '#10b981' },
    { name: 'Personal', value: 45, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting & Quick Refresh */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Here is your real-time productivity breakdown and activity intelligence for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Live</span>
          </button>
          <Link
            to="/focus"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Launch Pomodoro</span>
          </Link>
        </div>
      </div>

      {/* Live Timer Control Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white p-5 shadow-xs dark:border-indigo-950/80 dark:from-indigo-950/40 dark:via-purple-950/20 dark:bg-slate-900">
        {activeTimer ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {activeTimer.is_paused ? 'Paused' : 'Active Tracking'}
                  </span>
                  <TimeBadge classification={activeTimer.productivity_classification} />
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {activeTimer.activity_name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {formattedElapsed}
              </div>

              <div className="flex items-center gap-1.5">
                {activeTimer.is_paused ? (
                  <button
                    onClick={resumeTimer}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-700 shadow hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  >
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                )}
                <button
                  onClick={handleStopQuickTimer}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-rose-500"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop & Save</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartQuickTimer} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                required
                value={quickActivityName}
                onChange={(e) => setQuickActivityName(e.target.value)}
                placeholder="What are you working on right now? (e.g. Building API, Writing Docs, Reading)..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={quickClassification}
                onChange={(e) => setQuickClassification(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="productive">Productive</option>
                <option value="neutral">Neutral</option>
                <option value="unproductive">Unproductive</option>
              </select>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 glow-brand"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Timer</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tracked Today</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-slate-900 dark:text-white">
            {formatTime(summary.total_time_seconds)}
          </p>
          <span className="mt-1 block text-[10px] text-slate-400">{summary.activities_count} activities</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Productive Time</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatTime(summary.productive_time_seconds)}
          </p>
          <span className="mt-1 block text-[10px] text-emerald-600/80">
            {summary.total_time_seconds > 0
              ? `${Math.round((summary.productive_time_seconds / summary.total_time_seconds) * 100)}% of tracked`
              : '0%'}
          </span>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-xs dark:border-rose-950 dark:bg-rose-950/20">
          <p className="text-[11px] font-medium text-rose-700 dark:text-rose-400">Unproductive Time</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatTime(summary.unproductive_time_seconds)}
          </p>
          <span className="mt-1 block text-[10px] text-rose-600/80">Wasted / Distractions</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Neutral Time</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-slate-700 dark:text-slate-300">
            {formatTime(summary.neutral_time_seconds)}
          </p>
          <span className="mt-1 block text-[10px] text-slate-400">Meals, breaks, sleep</span>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">Focus Time</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatTime(summary.focus_time_seconds)}
          </p>
          <span className="mt-1 block text-[10px] text-indigo-600/80">
            {summary.focus_sessions_count || 0} Pomodoro blocks
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Goal Completion</p>
          <p className="mt-2 font-mono text-xl font-extrabold text-slate-900 dark:text-white">
            {summary.completed_tasks}/{summary.total_goals}
          </p>
          <span className="mt-1 block text-[10px] text-slate-400">
            {summary.total_goals > 0
              ? `${Math.round((summary.completed_tasks / summary.total_goals) * 100)}% achieved`
              : 'No goals set'}
          </span>
        </div>
      </div>

      {/* Main Charts & Score Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Productivity Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Productivity Score</h3>
              <p className="text-[11px] text-slate-400">Calculated across 4 performance factors</p>
            </div>
            <Link
              to="/productivity-score"
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Formula
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-center">
            <ScoreGauge score={summary.productivity_score} size={150} strokeWidth={12} label="Today's Rating" />

            <div className="mt-6 w-full space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Productive Ratio (50pts max)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {dailyData?.score_breakdown?.productive_ratio_points || 42} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Focus Sessions (25pts max)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {dailyData?.score_breakdown?.focus_sessions_points || 20} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Goal Completion (15pts max)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {dailyData?.score_breakdown?.goal_completion_points || 15} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consistency Bonus (10pts max)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {dailyData?.score_breakdown?.consistency_points || 10} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 24-Hour Visual Hourly Area/Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hourly Time Distribution</h3>
              <p className="text-[11px] text-slate-400">Minutes logged across each hour of the day</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Productive
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Distraction
              </span>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData?.hourly_distribution || []}>
                <XAxis dataKey="hourLabel" stroke="#94a3b8" fontSize={10} tickLine={false} interval={2} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="productiveMinutes" name="Productive (min)" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="unproductiveMinutes" name="Wasted (min)" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="neutralMinutes" name="Neutral (min)" fill="#94a3b8" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Distribution & Goal Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Category Breakdown Pie */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Distribution</h3>
          <p className="text-[11px] text-slate-400">Time spent per category today</p>

          <div className="mt-4 flex h-48 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val) => `${val} mins`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-1.5 text-xs">
            {pieData.slice(0, 4).map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-600 dark:text-slate-300">{p.name}</span>
                </div>
                <span className="font-mono text-slate-800 dark:text-slate-200">{p.value}m</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Goal Progress List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Daily Goals</h3>
              <p className="text-[11px] text-slate-400">Target minutes vs tracked minutes</p>
            </div>
            <Link to="/goals" className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">
              Manage Goals
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {(dailyData?.goals || []).length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">No goals configured for today. Set one in Goals Management!</p>
            ) : (
              (dailyData?.goals || []).map((goal) => {
                const pct = Math.min(100, Math.round((goal.current_minutes / (goal.target_minutes || 1)) * 100));
                return (
                  <div key={goal.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {goal.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Target className="h-4 w-4 text-indigo-500" />
                        )}
                        <span className={`font-semibold ${goal.is_completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {goal.title}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {goal.current_minutes} / {goal.target_minutes} min ({pct}%)
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.is_completed ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
