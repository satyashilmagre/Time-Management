import React from 'react';

export default function TimeBadge({ classification }) {
  const norm = (classification || 'productive').toLowerCase();

  if (norm === 'productive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Productive
      </span>
    );
  }

  if (norm === 'unproductive') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
        Unproductive
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
      Neutral
    </span>
  );
}
