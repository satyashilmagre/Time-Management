import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Send,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/notifications');
      if (res.success) setNotifications(res.notifications || []);
    } catch (err) {
      console.error('loadNotifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/all/read', { method: 'PATCH' });
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await apiRequest('/api/notifications/all', { method: 'DELETE' });
      setNotifications([]);
    } catch (e) {}
  };

  const handleSendTestReminder = async () => {
    try {
      await apiRequest('/api/notifications/test', {
        method: 'POST',
        body: {
          title: 'Hydration & Posture Check',
          message: 'You have been in focused sprint mode for 50 minutes. Stand up, drink a glass of water, and rest your eyes.',
          type: 'reminder',
          link: '/focus',
        },
      });
      await loadNotifications();
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notifications & Smart Alerts
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review focus streak milestones, daily review alerts, and break reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSendTestReminder}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Dispatch Test Reminder</span>
          </button>

          <button
            onClick={handleMarkAllAsRead}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            Mark all read
          </button>

          <button
            onClick={handleClearAll}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900 dark:text-rose-400"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <p className="p-8 text-center text-xs text-slate-400">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">All caught up!</p>
              <p className="text-[11px] text-slate-400">No active alerts or unread notifications.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between p-4 transition ${
                  n.is_read ? 'opacity-70' : 'bg-indigo-50/20 dark:bg-indigo-950/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    n.is_read ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                  }`}>
                    <Bell className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {n.link && (
                  <Link
                    to={n.link}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <span>View</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

