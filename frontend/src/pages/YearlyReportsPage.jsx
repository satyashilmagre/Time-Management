import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Calendar,
  Download,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';

export default function YearlyReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadYearly = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/analytics/yearly?year=${year}`);
      if (res.success) setData(res);
    } catch (err) {
      console.error('loadYearly error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadYearly();
  }, [year]);

  const monthlyTrend = data?.monthly_trend || [];
  const totalYearHours = monthlyTrend.reduce((acc, m) => acc + (m.total_hours || 0), 0).toFixed(1);
  const totalProdHours = monthlyTrend.reduce((acc, m) => acc + (m.productive_hours || 0), 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Yearly Productivity Review ({year})
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            High-level annual performance patterns, seasonal consistency, and milestone achievements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Annual Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500">Annual Logged Hours</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
            {totalYearHours} hrs
          </p>
          <span className="mt-1 block text-[10px] text-slate-400">Total investment in {year}</span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-950 dark:bg-emerald-950/20">
          <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400">Productive Hours</p>
          <p className="mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {totalProdHours} hrs
          </p>
          <span className="mt-1 block text-[10px] text-emerald-600/80">Skill & Project execution</span>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-950 dark:bg-indigo-950/20">
          <p className="text-[11px] font-medium text-indigo-800 dark:text-indigo-400">Annual Productive Yield</p>
          <p className="mt-1 font-mono text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {totalYearHours > 0 ? Math.round((totalProdHours / totalYearHours) * 100) : 85}%
          </p>
          <span className="mt-1 block text-[10px] text-indigo-600/80">High performance benchmark</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500">Deep Work Sessions</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-900 dark:text-white">
            180+
          </p>
          <span className="mt-1 block text-[10px] text-slate-400">Pomodoros completed</span>
        </div>
      </div>

      {/* 12-Month Bar Distribution Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Volume Across {year}</h3>
        <p className="text-[11px] text-slate-400">Productive vs Unproductive hours per calendar month</p>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrend}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="productive_hours" name="Productive (Hours)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="unproductive_hours" name="Unproductive (Hours)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

