import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  History,
  CalendarDays,
  BarChart2,
  TrendingUp,
  Timer,
  PieChart,
  CalendarRange,
  Calendar,
  Target,
  Sparkles,
  Bell,
  User,
  Settings,
  CreditCard,
  HelpCircle,
  X,
  Zap,
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

const NAV_GROUPS = [
  {
    title: 'Core Tracking',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Activity Tracker', path: '/tracker', icon: Clock },
      { name: 'Activity History', path: '/history', icon: History },
      { name: 'Daily Timeline', path: '/timeline', icon: CalendarDays },
    ],
  },
  {
    title: 'Time Intelligence',
    items: [
      { name: 'Time Analysis', path: '/analysis', icon: BarChart2 },
      { name: 'Productivity Score', path: '/productivity-score', icon: TrendingUp },
      { name: 'Focus Mode (Pomodoro)', path: '/focus', icon: Timer },
      { name: 'Weekly Analytics', path: '/weekly', icon: PieChart },
      { name: 'Monthly Reports', path: '/monthly', icon: CalendarRange },
      { name: 'Yearly Reports', path: '/yearly', icon: Calendar },
    ],
  },
  {
    title: 'Optimization',
    items: [
      { name: 'Goals & Planning', path: '/goals', icon: Target },
      { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, badge: 'Smart' },
      { name: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      { name: 'My Profile', path: '/profile', icon: User },
      { name: 'Account Settings', path: '/settings', icon: Settings },
      { name: 'Subscription & Billing', path: '/billing', icon: CreditCard },
      { name: 'Help & Support', path: '/support', icon: HelpCircle },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { activeTimer, formattedElapsed } = useTimer();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0c121e] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-5 dark:border-slate-800/80">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Time Intelligence
              </span>
              <span className="block text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                Productivity OS
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <h5 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.title}
              </h5>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded bg-gradient-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer mini widget */}
        {activeTimer && (
          <div className="border-t border-slate-200/80 p-3 dark:border-slate-800/80">
            <Link
              to="/tracker"
              className="block rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2.5 text-xs transition hover:border-indigo-300 dark:border-indigo-900/50 dark:bg-indigo-950/30"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Active Tracker</span>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {formattedElapsed}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-600 dark:text-slate-400">
                {activeTimer.activity_name}
              </p>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
