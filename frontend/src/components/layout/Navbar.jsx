import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  Play,
  Pause,
  Square,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  Menu,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTimer } from '../../context/TimerContext';
import { apiRequest } from '../../api/apiClient';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeTimer, formattedElapsed, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await apiRequest('/api/notifications');
        if (res.success) {
          setNotifications(res.notifications.slice(0, 5));
          setUnreadCount(res.unreadCount || 0);
        }
      } catch (err) {}
    }
    loadNotifications();
  }, []);

  const handleStopTimer = async () => {
    await stopTimer();
    navigate('/history');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#090d16]/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Active Timer Pill in Header */}
        {activeTimer ? (
          <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/90 px-3 py-1.5 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <span className="relative flex h-2.5 w-2.5">
              {!activeTimer.is_paused && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${activeTimer.is_paused ? 'bg-amber-400' : 'bg-indigo-600 dark:bg-indigo-400'}`}></span>
            </span>

            <span className="max-w-[130px] truncate text-xs font-medium text-slate-800 dark:text-slate-200 sm:max-w-[200px]">
              {activeTimer.activity_name}
            </span>

            <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {formattedElapsed}
            </span>

            <div className="ml-1 flex items-center gap-1 border-l border-indigo-200 pl-2 dark:border-indigo-800">
              {activeTimer.is_paused ? (
                <button
                  onClick={resumeTimer}
                  title="Resume Timer"
                  className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  title="Pause Timer"
                  className="rounded p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/50"
                >
                  <Pause className="h-3.5 w-3.5 fill-current" />
                </button>
              )}
              <button
                onClick={handleStopTimer}
                title="Stop & Save Activity"
                className="rounded p-1 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            </div>
          </div>
        ) : (
          <Link
            to="/tracker"
            className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:text-indigo-400 sm:flex"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Ready to track</span>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Quick Start
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI Pill Button */}
        <Link
          to="/ai-assistant"
          className="hidden items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-all hover:shadow-sm dark:border-indigo-800/80 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-indigo-300 md:flex"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span>AI Assistant</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:w-96">
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Notifications</h4>
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all ({unreadCount} new)
                </Link>
              </div>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-500">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg p-2 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="line-clamp-2 text-slate-500 dark:text-slate-400">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full p-1 text-sm transition hover:ring-2 hover:ring-indigo-400/50"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'User'}
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
            )}
            <span className="hidden text-xs font-medium text-slate-700 dark:text-slate-300 md:inline">
              {user?.full_name || 'Account'}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:inline" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={() => setProfileOpen(false)}
            >
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.full_name}</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>
              <Link
                to="/billing"
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <CreditCard className="h-4 w-4 text-slate-400" />
                <span>Subscription & Billing</span>
              </Link>

              <div className="border-t border-slate-100 my-1 dark:border-slate-800"></div>

              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
