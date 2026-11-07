import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Brain,
  Lightbulb,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';

export default function AiAssistantPage() {
  const [dailyInsights, setDailyInsights] = useState([]);
  const [weeklyOverview, setWeeklyOverview] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your AI Time Intelligence Assistant. I analyze your authorized activity data to help you eliminate hidden distractions, optimize deep work blocks, and achieve your daily goals without guesswork. How can I help you today?`,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    async function loadAiData() {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          apiRequest('/api/ai/daily-insights', { method: 'POST' }),
          apiRequest('/api/ai/weekly-analysis', { method: 'POST' }),
        ]);
        if (dailyRes.success) setDailyInsights(dailyRes.insights || []);
        if (weeklyRes.success) setWeeklyOverview(weeklyRes.weekly_overview);
      } catch (e) {
        console.error('Failed to load initial AI insights:', e);
      }
    }
    loadAiData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = async (promptToSend) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await apiRequest('/api/ai/ask', {
        method: 'POST',
        body: { prompt: text },
      });

      if (res.success && res.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error querying your productivity logs. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Analyze where my time went today and identify waste.',
    'Recommend an optimized daily schedule for tomorrow.',
    'How is my productivity score calculated and how can I reach 95?',
    'What is my single biggest distraction pattern this week?',
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Productivity Assistant
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Personalized scheduling recommendations and distraction detection grounded in your verified time logs.
        </p>
      </div>

      {/* Automated Daily Insights Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {dailyInsights.map((insight, i) => (
          <div
            key={i}
            className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Lightbulb className="h-4 w-4" />
              <h3 className="text-xs font-bold">{insight.title}</h3>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {insight.content}
            </p>
            {insight.actionable_tip && (
              <div className="mt-3 rounded-lg bg-indigo-50/70 p-2 text-[11px] font-medium text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                💡 {insight.actionable_tip}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Chat Window */}
      <div className="flex h-[520px] flex-col rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Intelligence Engine Active</h4>
              <p className="text-[10px] text-slate-400">Connected to your activities & goal records</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Zero Hallucination Guaranteed
          </span>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`max-w-xl rounded-2xl px-4 py-3 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:0.2s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Analyzing logged metrics...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Prompt Suggestion Pills */}
        <div className="border-t border-slate-100 px-6 py-2 dark:border-slate-800">
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(p)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask anything about your time, productivity patterns, or routine..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow hover:bg-indigo-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

