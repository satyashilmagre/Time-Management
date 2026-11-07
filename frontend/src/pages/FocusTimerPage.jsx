import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Flame,
  Award,
  Target,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';

export default function FocusTimerPage() {
  const [sessionType, setSessionType] = useState('focus'); // 'focus' | 'short_break' | 'long_break' | 'custom'
  const [customMinutes, setCustomMinutes] = useState(30);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Association with goal or activity
  const [activityName, setActivityName] = useState('Deep Focus Sprint');
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Stats
  const [stats, setStats] = useState({
    today_sessions: 4,
    today_focus_seconds: 6000,
    current_streak_days: 5,
  });
  const [history, setHistory] = useState([]);

  const timerRef = useRef(null);

  // Play audio bell synthesis using Web Audio API (cross-browser without external files)
  const playBellSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  const loadData = async () => {
    try {
      const [statsRes, histRes, goalRes] = await Promise.all([
        apiRequest('/api/focus/stats'),
        apiRequest('/api/focus/history?limit=10'),
        apiRequest('/api/goals?type=daily'),
      ]);

      if (statsRes.success) setStats(statsRes);
      if (histRes.success) setHistory(histRes.sessions || []);
      if (goalRes.success) setGoals(goalRes.daily_goals || []);
    } catch (err) {
      console.error('Focus load data error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Interval timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  const setTimerMode = (type, minutes) => {
    setIsRunning(false);
    setSessionType(type);
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleCompleteSession = async () => {
    playBellSound();
    try {
      await apiRequest('/api/focus/complete', {
        method: 'POST',
        body: {
          session_type: sessionType === 'custom' ? 'focus' : sessionType,
          target_duration_seconds: totalSeconds,
          actual_duration_seconds: totalSeconds - secondsLeft || totalSeconds,
          activity_name: activityName,
          goal_id: selectedGoalId ? parseInt(selectedGoalId, 10) : null,
          log_as_activity: true,
        },
      });
      await loadData();
    } catch (err) {
      console.error('Complete session error:', err);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-slate-900 p-8 text-white' : ''}`}>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Distraction-Free Focus Mode (Pomodoro)
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Train your concentration stamina with timed deep work sprints and deliberate recovery cycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-500" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            <span>{soundEnabled ? 'Bell On' : 'Muted'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Streaks & Today Focus Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-950 dark:bg-amber-950/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">Focus Streak</p>
            <p className="font-mono text-xl font-black text-amber-900 dark:text-amber-200">
              {stats.current_streak_days} Consecutive Days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300">Today's Completed Sprints</p>
            <p className="font-mono text-xl font-black text-indigo-900 dark:text-indigo-200">
              {stats.today_sessions} Sessions ({Math.round(stats.today_focus_seconds / 60)} mins)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Daily Focus Target</p>
            <p className="font-mono text-xl font-black text-emerald-900 dark:text-emerald-200">
              {Math.min(100, Math.round((stats.today_sessions / 5) * 100))}% (Target: 5)
            </p>
          </div>
        </div>
      </div>

      {/* Main Focus Clock Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Interval Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setTimerMode('focus', 25)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              sessionType === 'focus'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            25m Focus Sprint
          </button>
          <button
            onClick={() => setTimerMode('short_break', 5)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              sessionType === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            5m Short Break
          </button>
          <button
            onClick={() => setTimerMode('long_break', 15)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              sessionType === 'long_break'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            15m Long Break
          </button>
          <button
            onClick={() => setTimerMode('custom', customMinutes)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              sessionType === 'custom'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            Custom ({customMinutes}m)
          </button>
        </div>

        {/* Big Digital Countdown */}
        <div className="my-10 flex flex-col items-center justify-center">
          <div className="font-mono text-8xl font-black tracking-tight text-slate-900 dark:text-white sm:text-9xl">
            {pad(minutes)}:{pad(seconds)}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{sessionType.toUpperCase().replace('_', ' ')}</span>
            <span>•</span>
            <span>{progressPercent}% Complete</span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sessionType === 'focus'
                  ? 'bg-indigo-600'
                  : sessionType === 'short_break'
                  ? 'bg-emerald-500'
                  : 'bg-purple-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-bold text-white shadow-lg transition ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-500 glow-brand'
            }`}
          >
            {isRunning ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Goal / Task Association Drawer */}
        <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Associate Session with Goal</h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Session Activity Name..."
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">Link to a Daily Goal...</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recent Focus History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Completed Focus Sprints</h3>
        <div className="mt-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No focus sessions recorded yet today.</p>
          ) : (
            history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{h.activity_name || 'Focus Session'}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
                    {h.session_type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(h.actual_duration_seconds / 60)} mins
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(h.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

