import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Square,
  Trash2,
  Clock,
  PlusCircle,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useTimer, formatTime } from '../context/TimerContext';
import { apiRequest } from '../api/apiClient';
import TimeBadge from '../components/common/TimeBadge';

export default function ActivityTrackerPage() {
  const { activeTimer, elapsedSeconds, formattedElapsed, startTimer, pauseTimer, resumeTimer, stopTimer, discardTimer } = useTimer();
  const navigate = useNavigate();

  const [mode, setMode] = useState('timer'); // 'timer' | 'manual'
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Timer Form
  const [activityName, setActivityName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [classification, setClassification] = useState('productive');
  const [notes, setNotes] = useState('');

  // Manual Form
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [manualClassification, setManualClassification] = useState('productive');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('09:00');
  const [manualEndTime, setManualEndTime] = useState('10:30');
  const [manualNotes, setManualNotes] = useState('');
  const [manualTags, setManualTags] = useState('');
  const [manualSuccess, setManualSuccess] = useState('');
  const [manualError, setManualError] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          apiRequest('/api/categories'),
          apiRequest('/api/categories/tags'),
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (tagRes.success) setTags(tagRes.tags || []);
      } catch (err) {}
    }
    loadMeta();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!activityName) return;
    await startTimer({
      activity_name: activityName,
      category_id: categoryId ? parseInt(categoryId, 10) : null,
      productivity_classification: classification,
      notes,
    });
  };

  const handleStop = async () => {
    const res = await stopTimer();
    navigate('/history');
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualError('');
    setManualSuccess('');

    try {
      const sDateTime = new Date(`${manualDate}T${manualStartTime}:00`);
      const eDateTime = new Date(`${manualDate}T${manualEndTime}:00`);
      const diffSec = Math.max(0, Math.round((eDateTime - sDateTime) / 1000));

      if (diffSec <= 0) {
        setManualError('End time must be after start time.');
        return;
      }

      const tagArray = manualTags.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await apiRequest('/api/activities', {
        method: 'POST',
        body: {
          name: manualName,
          category_id: manualCategory ? parseInt(manualCategory, 10) : null,
          productivity_classification: manualClassification,
          description: manualNotes,
          start_time: sDateTime,
          end_time: eDateTime,
          duration_seconds: diffSec,
          date: manualDate,
          tags: tagArray,
        },
      });

      if (res.success) {
        setManualSuccess('Activity logged successfully!');
        setManualName('');
        setManualNotes('');
        setManualTags('');
        setTimeout(() => setManualSuccess(''), 4000);
      }
    } catch (err) {
      setManualError(err.message || 'Failed to record activity.');
    }
  };

  const quickPresets = [
    { name: 'Deep Coding & Implementation', cat: 'Coding', class: 'productive' },
    { name: 'Architecture & System Design', cat: 'Work', class: 'productive' },
    { name: 'Technical Reading / Research', cat: 'Learning', class: 'productive' },
    { name: 'Cardio & Strength Training', cat: 'Exercise', class: 'productive' },
    { name: 'Team Sprint Standup', cat: 'Work', class: 'productive' },
    { name: 'Afternoon Rest / Stretch', cat: 'Personal', class: 'neutral' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activity Time Tracker
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Precision time tracking with timestamp synchronization and category intelligence.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setMode('timer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === 'timer'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Live Timer</span>
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              mode === 'manual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {mode === 'timer' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Stopwatch / Controller Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
            {activeTimer ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {activeTimer.is_paused ? 'Timer Paused' : 'Timer Running'}
                </span>

                <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
                  {activeTimer.activity_name}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Category: {activeTimer.category_name || 'General'}
                  </span>
                  <span>•</span>
                  <TimeBadge classification={activeTimer.productivity_classification} />
                </div>

                <div className="my-8 font-mono text-7xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 sm:text-8xl">
                  {formattedElapsed}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {activeTimer.is_paused ? (
                    <button
                      onClick={resumeTimer}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Resume Timer</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-semibold text-amber-700 shadow hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    >
                      <Pause className="h-4 w-4 fill-current" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={handleStop}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-rose-500"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    <span>Stop & Save to History</span>
                  </button>

                  <button
                    onClick={discardTimer}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Discard</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStart} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g. Refactoring Authentication APIs..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Productivity Classification
                    </label>
                    <select
                      value={classification}
                      onChange={(e) => setClassification(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <option value="productive">Productive (Goal & work related)</option>
                      <option value="neutral">Neutral (Health, personal, travel)</option>
                      <option value="unproductive">Unproductive (Passive distraction)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Notes & Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key accomplishments or details to record..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 glow-brand"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Activity Timer</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Preset Launchers Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">One-Click Presets</h3>
            <p className="text-[11px] text-slate-400">Launch standard productivity blocks instantly</p>

            <div className="mt-4 space-y-2">
              {quickPresets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const matchedCat = categories.find((c) => c.name === preset.cat);
                    setActivityName(preset.name);
                    if (matchedCat) setCategoryId(String(matchedCat.id));
                    setClassification(preset.class);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{preset.name}</p>
                    <span className="text-[10px] text-slate-400">{preset.cat}</span>
                  </div>
                  <Play className="h-3.5 w-3.5 text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Manual Activity Creation Form */
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Log Past Activity Manually</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manually enter activities completed offline or on other devices.
          </p>

          {manualSuccess && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
              <CheckCircle className="h-4 w-4" />
              <span>{manualSuccess}</span>
            </div>
          )}

          {manualError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200">
              <AlertCircle className="h-4 w-4" />
              <span>{manualError}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Activity Title</label>
              <input
                type="text"
                required
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="e.g. Client Design Presentation..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Classification</label>
                <select
                  value={manualClassification}
                  onChange={(e) => setManualClassification(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                >
                  <option value="productive">Productive</option>
                  <option value="neutral">Neutral</option>
                  <option value="unproductive">Unproductive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Date</label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                <input
                  type="time"
                  required
                  value={manualStartTime}
                  onChange={(e) => setManualStartTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">End Time</label>
                <input
                  type="time"
                  required
                  value={manualEndTime}
                  onChange={(e) => setManualEndTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
              <input
                type="text"
                value={manualTags}
                onChange={(e) => setManualTags(e.target.value)}
                placeholder="Deep Work, Sprint, UI/UX"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Notes</label>
              <textarea
                rows={2}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Summary of what was achieved..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
            >
              Save Activity Record
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
