import React from 'react';

export default function ScoreGauge({ score = 0, size = 120, strokeWidth = 10, label = 'Productivity' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let colorClass = 'text-indigo-600 dark:text-indigo-400';
  let badgeColor = 'text-indigo-600';
  let rating = 'Average';

  if (clampedScore >= 85) {
    colorClass = 'text-emerald-500';
    badgeColor = 'text-emerald-500';
    rating = 'Exceptional';
  } else if (clampedScore >= 70) {
    colorClass = 'text-indigo-500';
    badgeColor = 'text-indigo-500';
    rating = 'Productive';
  } else if (clampedScore >= 50) {
    colorClass = 'text-amber-500';
    badgeColor = 'text-amber-500';
    rating = 'Moderate';
  } else {
    colorClass = 'text-rose-500';
    badgeColor = 'text-rose-500';
    rating = 'Needs Focus';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] font-semibold uppercase text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className={`text-xs font-bold ${badgeColor}`}>{rating}</span>
        {label && <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>}
      </div>
    </div>
  );
}
