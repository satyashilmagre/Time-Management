import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { formatTime } from '../context/TimerContext';

export default function TimeAnalysisPage() {
  const [dailyData, setDailyData] = useState(null);
  const [wastedData, setWastedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        const [dRes, wRes] = await Promise.all([
          apiRequest('/api/analytics/daily'),
          apiRequest('/api/analytics/wasted-time'),
        ]);
        if (dRes.success) setDailyData(dRes);
        if (wRes.success) setWastedData(wRes);
      } catch (err) {
        console.error('loadAnalysis error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, []);

  const summary = dailyData?.summary || {
    total_time_seconds: 0,
    productive_time_seconds: 0,
    neutral_time_seconds: 0,
    unproductive_time_seconds: 0,
  };

  const totalSec = summary.total_time_seconds || 1;
  const prodPct = Math.round((summary.productive_time_seconds / totalSec) * 100);
  const unprodPct = Math.round((summary.unproductive_time_seconds / totalSec) * 100);
  const neutPct = Math.round((summary.neutral_time_seconds / totalSec) * 100);

  const categories = dailyData?.category_breakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Daily Time Analysis & Value Audit
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Transform unorganized hours into high-yield, goal-aligned productivity.
        </p>
      </div>

      {/* High-Level Proportional Audit Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Time Allocation</h3>
        <p className="text-[11px] text-slate-400">Distribution across productive, neutral, and unproductive activities</p>

        <div className="mt-4 flex h-6 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div style={{ width: `${prodPct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Productive: ${prodPct}%`} />
          <div style={{ width: `${neutPct}%` }} className="bg-slate-400 transition-all duration-500" title={`Neutral: ${neutPct}%`} />
          <div style={{ width: `${unprodPct}%` }} className="bg-rose-500 transition-all duration-500" title={`Unproductive: ${unprodPct}%`} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-950 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Productive Hours</span>
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{prodPct}%</span>
            </div>
            <p className="mt-1 font-mono text-xl font-black text-emerald-700 dark:text-emerald-300">
              {formatTime(summary.productive_time_seconds)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600/80">Coding, work, learning & exercise</p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Neutral Hours</span>
              <span className="font-mono text-sm font-bold text-slate-500">{neutPct}%</span>
            </div>
            <p className="mt-1 font-mono text-xl font-black text-slate-800 dark:text-slate-200">
              {formatTime(summary.neutral_time_seconds)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Meals, breaks, personal care, sleep</p>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5 dark:border-rose-950 dark:bg-rose-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">Wasted Hours</span>
              <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">{unprodPct}%</span>
            </div>
            <p className="mt-1 font-mono text-xl font-black text-rose-700 dark:text-rose-300">
              {formatTime(summary.unproductive_time_seconds)}
            </p>
            <p className="mt-1 text-[11px] text-rose-600/80">Passive feeds, entertainment, distractions</p>
          </div>
        </div>
      </div>

      {/* Category Consumption Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Domain Breakdown</h3>
          <p className="text-[11px] text-slate-400">Total duration consumed per activity domain</p>

          <div className="mt-4 space-y-3">
            {categories.map((cat, i) => {
              const catSec = cat.duration_seconds || 0;
              const catPct = Math.round((catSec / totalSec) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="font-mono text-slate-500">
                      {formatTime(catSec)} ({catPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${catPct}%`, backgroundColor: cat.color || '#6366f1' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wasted Time Detection & Opportunities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Wasted Time & Distraction Detection
              </h3>
              <p className="text-[11px] text-slate-400">Surfacing low-priority sinks and recovery opportunities</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(wastedData?.recommendations || []).map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      rec.priority === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {rec.priority} Priority
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
