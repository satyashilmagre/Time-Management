import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Clock,
  BarChart3,
  Brain,
  Shield,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Timer,
  Play,
  Award,
  Users,
  Target,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [activeFaq, setActiveFaq] = useState(null);

  // Interactive Live Demo State
  const [demoFocusHours, setDemoFocusHours] = useState(4);
  const [demoSocialHours, setDemoSocialHours] = useState(2);
  const potentialReclaim = Math.max(0, (demoSocialHours - 0.5) * 5).toFixed(1);
  const demoScore = Math.min(98, Math.max(40, Math.round((demoFocusHours / 7) * 60 + (3 - demoSocialHours) * 12)));

  const FAQS = [
    {
      q: 'How does Time Intelligence calculate my productivity score?',
      a: 'The productivity score is 100% transparent: Productive ratio (50%), Focus sessions completed (25%), Daily goal fulfillment (15%), and Target consistency (10%). We never invent arbitrary numbers.',
    },
    {
      q: 'Does Time Intelligence spy on my browser tabs or keystrokes?',
      a: 'No. Time Intelligence is built on intentional, privacy-first productivity. You maintain complete control over logged activities, classifications, and goal tracking without creepy invasive background surveillance.',
    },
    {
      q: 'Will my active timers be lost if I close my browser?',
      a: 'Never. Active timers calculate elapsed duration based on synchronized UTC server timestamps. You can close your laptop or switch phones, and your session resumes seamlessly.',
    },
    {
      q: 'Can I export my time logs and reports?',
      a: 'Yes! You can export full granular activity logs and monthly/yearly productivity summaries to CSV and print-ready PDF reports at any time.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#080c15] dark:text-slate-100 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#080c15]/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Time Intelligence
              </span>
              <span className="hidden text-[10px] font-medium text-indigo-600 dark:text-indigo-400 sm:inline sm:ml-2">
                SaaS Productivity OS
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300 md:flex">
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400">How It Works</a>
            <a href="#demo" className="hover:text-indigo-600 dark:hover:text-indigo-400">Interactive Demo</a>
            <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-indigo-400">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <span>Go to Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 glow-brand"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
          <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 blur-[130px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
            <span>Time Intelligence 2.0 – Understand Your Time. Improve Your Life.</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Your Time Is Your Most Valuable Asset.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Start Managing It Intelligently.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Track your activities, understand your habits, eliminate unnecessary distractions, and make every hour count with transparent productivity analytics.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 glow-brand"
            >
              <span>Start Free Today</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#demo"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-6 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span>Explore Interactive Demo</span>
              <Play className="h-3.5 w-3.5 fill-current text-indigo-500" />
            </a>
          </div>

          <p className="mt-3 text-xs text-slate-400">No credit card required • Instant demo account available</p>

          {/* Product Dashboard Preview Mockup */}
          <div className="relative mx-auto mt-14 max-w-5xl rounded-2xl border border-slate-200/90 bg-white/50 p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/50">
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-900 p-4 text-left shadow-inner dark:border-slate-800 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 font-mono text-xs text-slate-400">app.timeintelligence.io/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                    Productivity Score: 88/100
                  </span>
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-3">
                  <p className="text-[11px] font-medium text-slate-400">Tracked Today</p>
                  <p className="mt-1 font-mono text-xl font-bold text-white">6h 45m</p>
                </div>
                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3">
                  <p className="text-[11px] font-medium text-emerald-400">Productive Time</p>
                  <p className="mt-1 font-mono text-xl font-bold text-emerald-400">5h 20m</p>
                </div>
                <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3">
                  <p className="text-[11px] font-medium text-rose-400">Wasted Time</p>
                  <p className="mt-1 font-mono text-xl font-bold text-rose-400">45m</p>
                </div>
                <div className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-3">
                  <p className="text-[11px] font-medium text-indigo-400">Focus Sessions</p>
                  <p className="mt-1 font-mono text-xl font-bold text-indigo-400">5 Pomodoros</p>
                </div>
              </div>

              {/* Mock Timeline Bar */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/30 p-3">
                <p className="text-xs font-semibold text-slate-300 mb-2">24-Hour Visual Activity Timeline</p>
                <div className="flex h-6 w-full overflow-hidden rounded-lg bg-slate-800">
                  <div className="w-[15%] bg-purple-600/70" title="Sleep" />
                  <div className="w-[10%] bg-blue-600" title="Work (Morning Sprint)" />
                  <div className="w-[20%] bg-indigo-600" title="Deep Coding" />
                  <div className="w-[5%] bg-rose-500" title="Social Distraction" />
                  <div className="w-[25%] bg-indigo-600" title="API Development" />
                  <div className="w-[10%] bg-pink-600" title="Cardio & Workout" />
                  <div className="w-[15%] bg-slate-700" title="Evening Routine" />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productivity Statistics Banner */}
      <section className="border-y border-slate-200/80 bg-white py-12 dark:border-slate-800/80 dark:bg-[#0c121e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">2.4h</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Reclaimed Wasted Time Daily</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">+38%</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Focus Session Completion</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">100%</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Transparent Scoring Formula</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 sm:text-4xl">50,000+</p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Deep Work Hours Tracked</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Three Step Flow</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">How Time Intelligence Works</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From unorganized, fragmented hours into razor-sharp intentional productivity.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Clock className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">STEP 01</span>
              <h3 className="mt-1 text-lg font-bold">Track Activities & Focus Sprints</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Start one-click timers or log Pomodoro sprints linked to your real projects and learning objectives. Timers survive browser restarts.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">STEP 02</span>
              <h3 className="mt-1 text-lg font-bold">Uncover Time-Wasting Habits</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                The smart detection engine surfaces excessive social media blocks, context switches, and unplanned idle intervals with zero judgment.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Brain className="h-6 w-6" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400">STEP 03</span>
              <h3 className="mt-1 text-lg font-bold">AI Optimization & Daily Score</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Get personalized schedule recommendations from the AI assistant and track your daily productivity score from 0 to 100.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="demo" className="border-t border-slate-200/80 bg-slate-100/50 py-20 dark:border-slate-800/80 dark:bg-[#0c121e]/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Live Simulator</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Interactive Productivity Calculator</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Adjust the sliders below to see how optimizing habits transforms your weekly score and unlocks lost hours.
            </p>
          </div>

          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Daily Productive Focus Hours</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{demoFocusHours} hrs / day</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={demoFocusHours}
                    onChange={(e) => setDemoFocusHours(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-indigo-600 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Deep work, coding, learning, or business tasks</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Daily Social Media & Distraction Time</span>
                    <span className="font-mono text-rose-500">{demoSocialHours} hrs / day</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={demoSocialHours}
                    onChange={(e) => setDemoSocialHours(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-rose-500 cursor-pointer"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Unplanned browsing, passive feeds, social scrolling</p>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
                  <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-300">💡 AI Opportunity Calculation:</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Trimming your social media to 30 mins frees up <strong className="font-bold text-indigo-600 dark:text-indigo-400">{potentialReclaim} hours every week</strong>. That is equivalent to mastering a whole new framework or reading 18 books per year!
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-xs font-semibold text-slate-400 uppercase">Estimated Productivity Score</p>
                <div className="my-4 font-mono text-6xl font-black text-indigo-600 dark:text-indigo-400">
                  {demoScore}
                  <span className="text-xl text-slate-400">/100</span>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Weekly Reclaimable Hours</span>
                    <span className="font-mono font-bold text-emerald-500">+{potentialReclaim} hrs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Focus Stamina Rating</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {demoScore >= 80 ? 'Elite Focus' : demoScore >= 65 ? 'Balanced' : 'High Distraction Risk'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/signup"
                  className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
                >
                  Track Your Real Score Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Feature Suite</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Engineered for High Performers</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              All the tools required to track, analyze, and master your 24 hours.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Clock,
                title: 'Activity Time Tracking',
                desc: 'Timestamp-accurate active timers with pause/resume, category tagging, notes, and zero drift.',
              },
              {
                icon: BarChart3,
                title: 'Daily & Weekly Analytics',
                desc: 'Deep 24-hour bar distributions, peak focus hour recognition, and week-over-week productivity trends.',
              },
              {
                icon: TrendingUp,
                title: 'Transparent Productivity Score',
                desc: 'A 0–100 score calculated with real weightings. Understand exactly why your score changed.',
              },
              {
                icon: Timer,
                title: 'Distraction-Free Focus Mode',
                desc: 'Integrated Pomodoro timer with audio bell notifications, break cycles, and task linkage.',
              },
              {
                icon: Shield,
                title: 'Wasted Time Detection',
                desc: 'Spot excessive entertainment, unplanned context switching, and low-priority task sinks.',
              },
              {
                icon: Brain,
                title: 'AI Productivity Assistant',
                desc: 'An AI engine analyzing your actual time records to advise on schedule optimization and burnout prevention.',
              },
              {
                icon: Target,
                title: 'Goals & Daily Planning',
                desc: 'Define daily, weekly, and monthly targets with real-time percentage completion indicators.',
              },
              {
                icon: Layers,
                title: 'Export to CSV & PDF',
                desc: 'Export compliant activity records, weekly audits, and yearly reports with one click.',
              },
              {
                icon: Award,
                title: 'Focus Streaks & Milestones',
                desc: 'Build continuous deep work momentum with daily streaks and achievement milestones.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Identified Testimonials */}
      <section className="border-t border-slate-200/80 bg-white py-20 dark:border-slate-800/80 dark:bg-[#0c121e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Real Reviews</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Loved by Developers, Founders & Students</h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">(Sample customer feedback for demonstration)</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote: 'Time Intelligence helped me realize I was losing nearly 2 hours every single afternoon to mindless Twitter checks. Reclaiming that time allowed me to ship my side project in 3 weeks.',
                name: 'Sarah Lin',
                role: 'Senior Full Stack Engineer',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
              },
              {
                quote: 'The transparent productivity score is game-changing. Other apps give you a magic number with zero explanation. Here, I know exactly which focus blocks boosted my score.',
                name: 'Marcus Vance',
                role: 'Startup Founder & Solo Maker',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
              },
              {
                quote: 'The integrated Pomodoro timer connected to daily goals keeps me disciplined during exam periods. The AI suggestions on evening study schedules are surprisingly accurate.',
                name: 'Priya Sharma',
                role: 'CS & AI Graduate Researcher',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h4>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Simple Pricing</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Invest in Your Productivity</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Start completely free, or unlock advanced AI intelligence and team analytics.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Free Tier */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold">Free Forever</h3>
              <p className="mt-1 text-xs text-slate-500">Core tracking for individuals</p>
              <div className="my-6">
                <span className="font-mono text-4xl font-extrabold">$0</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Unlimited Activity Tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Pomodoro Focus Timer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Daily Productivity Score</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 7-Day History & Reports</li>
              </ul>
              <Link
                to="/signup"
                className="mt-8 block w-full rounded-xl border border-slate-300 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="relative rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl dark:bg-slate-900">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </span>
              <h3 className="text-lg font-bold">Pro Intelligence</h3>
              <p className="mt-1 text-xs text-slate-500">Complete AI optimization & deep reports</p>
              <div className="my-6">
                <span className="font-mono text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">$12</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Everything in Free</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> AI Productivity Assistant</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Wasted-Time Detection Engine</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> Unlimited History & Yearly Reports</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-500" /> CSV & PDF Report Exports</li>
              </ul>
              <Link
                to="/signup"
                className="mt-8 block w-full rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-semibold text-white shadow-md hover:bg-indigo-500 glow-brand"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold">Team & Business</h3>
              <p className="mt-1 text-xs text-slate-500">For teams seeking organizational focus</p>
              <div className="my-6">
                <span className="font-mono text-4xl font-extrabold">$29</span>
                <span className="text-xs text-slate-500"> / user / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Everything in Pro</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Team Focus Dashboards</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Custom Category Workflows</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Priority Support & Onboarding</li>
              </ul>
              <Link
                to="/signup"
                className="mt-8 block w-full rounded-xl border border-slate-300 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-slate-200/80 bg-slate-50/50 py-20 dark:border-slate-800/80 dark:bg-[#0c121e]/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Questions & Answers</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-5xl">
            Don’t Just Manage Your Time. Understand It.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-indigo-100 sm:text-base">
            Take complete control of your daily hours today. Sign up in under 30 seconds and start tracking immediately.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/signup"
              className="rounded-xl bg-white px-8 py-3.5 text-xs font-bold text-indigo-700 shadow-xl transition hover:bg-slate-100"
            >
              Start Free Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-12 dark:border-slate-800/80 dark:bg-[#080c15]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Time Intelligence</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} Time Intelligence Inc. Understand Your Time. Improve Your Life.
            </p>

            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
              <Link to="/support" className="hover:underline">Support</Link>
              <Link to="/billing" className="hover:underline">Pricing</Link>
              <Link to="/login" className="hover:underline">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
