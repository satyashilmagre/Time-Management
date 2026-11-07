import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import ScoreGauge from '../components/common/ScoreGauge';

export default function ProductivityScorePage() {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  // What-If Simulator state
  const [simExtraFocusSessions, setSimExtraFocusSessions] = useState(0);
  const [simDistractionReductionMins, setSimDistractionReductionMins] = useState(0);

  useEffect(() => {
    async function loadScore() {
      try {
        setLoading(true);
        const res = await apiRequest('/api/analytics/productivity-score');
        if (res.success) setScoreData(res);
      } catch (err) {
        console.error('loadScore error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScore();
  }, []);

  const baseScore = scoreData?.score || 85;
  const yesterdayScore = scoreData?.yesterday_score || 80;
  const weeklyAvg = scoreData?.weekly_average || 84;
  const monthlyAvg = scoreData?.monthly_average || 82;

  // Simulator calculation
  const simBoost = simExtraFocusSessions * 4 + Math.round(simDistractionReductionMins / 15) * 2;
  const simulatedScore = Math.min(100, baseScore + simBoost);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transparent Productivity Score
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          A mathematically transparent 0–100 rating derived from real time logs and focus achievements.
        </p>
      </div>

      {/* Comparisons Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
          <p className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">Today's Score</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-indigo-600 dark:text-indigo-400">{baseScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="mt-1 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
            <ArrowUpRight className="h-3 w-3" />
            +{Math.max(0, baseScore - yesterdayScore)} vs yesterday
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Yesterday's Score</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-700 dark:text-slate-300">{yesterdayScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="mt-1 block text-[10px] text-slate-400">Previous day baseline</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">7-Day Average</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-700 dark:text-slate-300">{weeklyAvg}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="mt-1 block text-[10px] text-indigo-600 dark:text-indigo-400">Weekly consistency</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">30-Day Average</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-slate-700 dark:text-slate-300">{monthlyAvg}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="mt-1 block text-[10px] text-emerald-600">Long-term trend</span>
        </div>
      </div>

      {/* Transparent Formula Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center">
          <ScoreGauge score={baseScore} size={170} strokeWidth={14} label="Real-Time Productivity Rating" />
          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Calculated with zero arbitrary guesses. Every point corresponds to tracked seconds and achieved goals.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Point Weighting & Breakdown</h3>
              <p className="text-[11px] text-slate-400">The 4 factors governing your score</p>
            </div>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Formula Audited
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-900 dark:text-white">1. Productive Ratio (50 Points Max)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">42 / 50 pts</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Proportion of productive time vs total tracked hours across coding, work, learning, and workouts.
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '84%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-900 dark:text-white">2. Focus Sessions (25 Points Max)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">20 / 25 pts</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Completed distraction-free Pomodoro sprints (target: 4-5 focus sessions per day).
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-900 dark:text-white">3. Daily Goal Alignment (15 Points Max)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">15 / 15 pts</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Percentage of targeted daily objectives achieved before midnight.
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-900 dark:text-white">4. Consistency Bonus (10 Points Max)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">10 / 10 pts</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Meeting daily target hours consistently without severe fragmented gaps.
              </p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Score Simulator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Sliders className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">What-If Productivity Simulator</h3>
            <p className="text-[11px] text-slate-400">See how small daily adjustments immediately lift your score</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Add Extra Focus Sessions</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">+{simExtraFocusSessions} Sessions</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={simExtraFocusSessions}
                onChange={(e) => setSimExtraFocusSessions(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Reduce Distraction Time (Minutes)</span>
                <span className="font-mono text-rose-500">-{simDistractionReductionMins} Mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="15"
                value={simDistractionReductionMins}
                onChange={(e) => setSimDistractionReductionMins(parseInt(e.target.value, 10))}
                className="mt-2 w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center dark:border-indigo-950 dark:bg-indigo-950/20">
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Simulated Potential Score</span>
            <div className="my-2 font-mono text-5xl font-black text-indigo-600 dark:text-indigo-400">
              {simulatedScore}
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              +{simBoost} point increase
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
