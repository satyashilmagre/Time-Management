import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Check, ArrowRight, Clock, Target, Sparkles, Moon, Sun } from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function OnboardingPage() {
  const { refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [dailyTargetHours, setDailyTargetHours] = useState(8.0);
  const [focusMin, setFocusMin] = useState(25);
  const [selectedPriorities, setSelectedPriorities] = useState(['Coding', 'Learning']);
  const [loading, setLoading] = useState(false);

  const togglePriority = (cat) => {
    if (selectedPriorities.includes(cat)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== cat));
    } else {
      setSelectedPriorities([...selectedPriorities, cat]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/auth/onboarding', {
        method: 'POST',
        body: {
          daily_target_hours: dailyTargetHours,
          theme,
          focus_min: focusMin,
        },
      });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding complete error:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-[#080c15] sm:px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Progress header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">Personalizing Your Setup</span>
          </div>
          <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Step {step} of 4
          </span>
        </div>

        {/* Step 1: Daily Target Hours */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">How many productive hours do you aim for daily?</h3>
              <p className="mt-1 text-xs text-slate-500">
                This helps calculate your daily target completion rate and remaining focus capacity.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[6, 8, 10].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setDailyTargetHours(hours)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                    dailyTargetHours === hours
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="font-mono text-2xl">{hours}h</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {hours === 6 ? 'Balanced' : hours === 8 ? 'Standard' : 'High Intensity'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Primary Focus Categories */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">Select your core focus domains</h3>
              <p className="mt-1 text-xs text-slate-500">
                Pick what matters most so the AI highlights improvements in these areas.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {['Coding', 'Work', 'Learning', 'Exercise', 'Personal', 'Family'].map((cat) => {
                const selected = selectedPriorities.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => togglePriority(cat)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${
                      selected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span>{cat}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:underline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pomodoro Focus Session Duration */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">Preferred Focus Session Interval</h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose the length of your single Pomodoro deep work blocks.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { min: 25, label: 'Classic Pomodoro' },
                { min: 45, label: 'Deep Focus' },
                { min: 60, label: 'Extended Sprint' },
              ].map((opt) => (
                <button
                  key={opt.min}
                  type="button"
                  onClick={() => setFocusMin(opt.min)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                    focusMin === opt.min
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <span className="font-mono text-2xl">{opt.min}m</span>
                  <span className="text-[11px] font-normal text-slate-500">{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:underline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Appearance */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">Select Your Workspace Theme</h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose light or dark mode. You can toggle this anytime in the header.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center rounded-xl border p-6 transition ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-slate-950 text-white font-bold'
                    : 'border-slate-200 bg-slate-900 text-slate-400'
                }`}
              >
                <Moon className="h-7 w-7 text-indigo-400 mb-2" />
                <span className="text-sm">Dark Mode (Recommended)</span>
                <span className="text-[10px] text-slate-400 mt-1">Reduces eye fatigue</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center rounded-xl border p-6 transition ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Sun className="h-7 w-7 text-amber-500 mb-2" />
                <span className="text-sm">Light Mode</span>
                <span className="text-[10px] text-slate-400 mt-1">Clean and crisp</span>
              </button>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-slate-500 hover:underline"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 disabled:opacity-50"
              >
                <span>{loading ? 'Preparing Workspace...' : 'Launch Dashboard'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
