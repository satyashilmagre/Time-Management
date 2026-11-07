import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Info,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { formatTime } from '../context/TimerContext';
import TimeBadge from '../components/common/TimeBadge';

export default function DailyTimelinePage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  const loadTimeline = async (dateStr) => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/analytics/daily?date=${dateStr}`);
      if (res.success) {
        setDailyData(res);
        if (res.activities && res.activities.length > 0) {
          setActiveItem(res.activities[0]);
        } else {
          setActiveItem(null);
        }
      }
    } catch (err) {
      console.error('loadTimeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline(selectedDate);
  }, [selectedDate]);

  const changeDay = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const pad = (n) => String(n).padStart(2, '0');
    const newStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    setSelectedDate(newStr);
  };

  const activities = dailyData?.activities || [];

  // Group activities into Morning (05:00 - 12:00), Afternoon (12:00 - 18:00), Evening / Night (18:00 - 05:00)
  const morning = [];
  const afternoon = [];
  const evening = [];

  activities.forEach((act) => {
    const startHour = new Date(act.start_time).getHours();
    if (startHour >= 5 && startHour < 12) morning.push(act);
    else if (startHour >= 12 && startHour < 18) afternoon.push(act);
    else evening.push(act);
  });

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            24-Hour Visual Daily Timeline
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            A chronological timeline of where your hours flowed throughout the day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDay(-1)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />

          <button
            onClick={() => changeDay(1)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 24-Hour Continuous Timeline Ribbon */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Continuous 24-Hour Ribbon
        </h3>

        {/* The 24-hour proportional strip */}
        <div className="relative mt-4 h-12 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center">
          {activities.map((act) => {
            const start = new Date(act.start_time);
            const startSec = start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds();
            const durSec = act.duration_seconds || 1800;
            const leftPct = (startSec / 86400) * 100;
            const widthPct = Math.max(1, (durSec / 86400) * 100);

            let bgClass = 'bg-indigo-500';
            if (act.productivity_classification === 'productive') bgClass = 'bg-emerald-500';
            else if (act.productivity_classification === 'unproductive') bgClass = 'bg-rose-500';
            else bgClass = 'bg-amber-500';

            return (
              <div
                key={act.id}
                onClick={() => setActiveItem(act)}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                title={`${act.name} (${formatTime(durSec)})`}
                className={`absolute top-1 bottom-1 cursor-pointer rounded-md ${bgClass} opacity-85 transition hover:scale-y-110 hover:opacity-100`}
              />
            );
          })}
        </div>

        {/* Hour markers */}
        <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
          <span>00:00 (12 AM)</span>
          <span>06:00 (6 AM)</span>
          <span>12:00 (12 PM)</span>
          <span>18:00 (6 PM)</span>
          <span>24:00 (12 AM)</span>
        </div>
      </div>

      {/* Split Period Blocks (Morning, Afternoon, Evening) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Morning Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Sun className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Morning (05:00 – 12:00)
            </h3>
          </div>
          <div className="mt-3 space-y-2.5">
            {morning.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No activities tracked in morning</p>
            ) : (
              morning.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setActiveItem(act)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                    activeItem?.id === act.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">{act.name}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {formatTime(act.duration_seconds)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <TimeBadge classification={act.productivity_classification} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Afternoon Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Sunset className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Afternoon (12:00 – 18:00)
            </h3>
          </div>
          <div className="mt-3 space-y-2.5">
            {afternoon.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No activities tracked in afternoon</p>
            ) : (
              afternoon.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setActiveItem(act)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                    activeItem?.id === act.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">{act.name}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {formatTime(act.duration_seconds)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <TimeBadge classification={act.productivity_classification} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evening / Night Block */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Moon className="h-4 w-4 text-purple-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Evening & Night (18:00 – 05:00)
            </h3>
          </div>
          <div className="mt-3 space-y-2.5">
            {evening.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No activities tracked in evening</p>
            ) : (
              evening.map((act) => (
                <div
                  key={act.id}
                  onClick={() => setActiveItem(act)}
                  className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                    activeItem?.id === act.id
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                      : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 dark:text-white">{act.name}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {formatTime(act.duration_seconds)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{new Date(act.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <TimeBadge classification={act.productivity_classification} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Selected Item Detail Drawer Card */}
      {activeItem && (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Selected Activity Inspector
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {activeItem.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeItem.description || 'No additional notes logged for this session.'}
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono text-xl font-black text-indigo-600 dark:text-indigo-400">
                {formatTime(activeItem.duration_seconds)}
              </span>
              <div className="mt-1">
                <TimeBadge classification={activeItem.productivity_classification} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
