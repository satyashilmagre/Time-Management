import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Lock,
  Bell,
  Volume2,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function AccountSettingsPage() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { user, refreshUser } = useAuth();

  // Settings State
  const [pomodoroFocusMin, setPomodoroFocusMin] = useState(25);
  const [pomodoroShortBreak, setPomodoroShortBreak] = useState(5);
  const [pomodoroLongBreak, setPomodoroLongBreak] = useState(15);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [settingsMsg, setSettingsMsg] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await apiRequest('/api/user/profile');
        if (res.success && res.settings) {
          const s = res.settings;
          setPomodoroFocusMin(s.pomodoro_focus_min || 25);
          setPomodoroShortBreak(s.pomodoro_short_break_min || 5);
          setPomodoroLongBreak(s.pomodoro_long_break_min || 15);
          setSoundEnabled(s.sound_enabled !== undefined ? !!s.sound_enabled : true);
          setEmailNotifs(s.email_notifications !== undefined ? !!s.email_notifications : true);
          setPushNotifs(s.push_notifications !== undefined ? !!s.push_notifications : true);
        }
      } catch (err) {}
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsMsg('');
    try {
      await apiRequest('/api/user/settings', {
        method: 'PUT',
        body: {
          theme,
          pomodoro_focus_min: pomodoroFocusMin,
          pomodoro_short_break_min: pomodoroShortBreak,
          pomodoro_long_break_min: pomodoroLongBreak,
          sound_enabled: soundEnabled,
          email_notifications: emailNotifs,
          push_notifications: pushNotifs,
        },
      });
      setSettingsMsg('Settings updated successfully!');
      setTimeout(() => setSettingsMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save settings');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await apiRequest('/api/user/change-password', {
        method: 'POST',
        body: { current_password: currentPassword, new_password: newPassword },
      });
      setPasswordMsg({ type: 'success', text: 'Password successfully changed!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  const handleExportData = async () => {
    try {
      const csv = await apiRequest('/api/export/csv');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-intelligence-export-${Date.now()}.csv`;
      a.click();
    } catch (e) {
      alert('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account Settings & Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Configure timer intervals, visual themes, sound alerts, and security options.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Workspace & Timer Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Timer & Focus Preferences</h3>
            {settingsMsg && (
              <span className="text-xs font-semibold text-emerald-600">{settingsMsg}</span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Focus Sprint (Min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={pomodoroFocusMin}
                  onChange={(e) => setPomodoroFocusMin(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Short Break (Min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={pomodoroShortBreak}
                  onChange={(e) => setPomodoroShortBreak(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Long Break (Min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={pomodoroLongBreak}
                  onChange={(e) => setPomodoroLongBreak(parseInt(e.target.value, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Sound Audio Cues</p>
                  <p className="text-[11px] text-slate-400">Play bell chime when focus intervals finish</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Email Productivity Digests</p>
                  <p className="text-[11px] text-slate-400">Receive weekly summaries and streak reports</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifs}
                  onChange={(e) => setEmailNotifs(e.target.checked)}
                  className="h-4 w-4 accent-indigo-600"
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Security & Password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Security & Password Update
          </h3>

          {passwordMsg.text && (
            <div
              className={`mt-3 rounded-xl p-3 text-xs ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Data Export & Danger Zone */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          Data Portability & Archival
        </h3>
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Export All Data</p>
            <p className="text-[11px] text-slate-400">Download complete CSV copy of all logged activities and scores</p>
          </div>
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
          >
            <Download className="h-4 w-4" />
            <span>Download All Records (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

