import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  ChevronDown,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function HelpSupportPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const GUIDES = [
    {
      title: 'Mastering the 25-Minute Pomodoro Sprint',
      desc: 'How to structure deep work blocks without mental exhaustion or distraction fatigue.',
      readTime: '4 min read',
    },
    {
      title: 'How Time Intelligence Calculates Your Productivity Score',
      desc: 'A breakdown of the 4 transparent factors and how to lift your average above 90.',
      readTime: '3 min read',
    },
    {
      title: 'Eliminating the 1:30 PM Energy Slump',
      desc: 'Scientific strategies to avoid post-lunch dopamine and social media scrolling.',
      readTime: '5 min read',
    },
  ];

  const FAQS = [
    {
      q: 'Will closing the browser lose my active timer?',
      a: 'No. The timer runs on server-timestamp offsets. When you return or refresh, the exact elapsed seconds will be synchronized instantly.',
    },
    {
      q: 'How do I export my data for tax or client billing?',
      a: 'Head to Activity History or Monthly Reports and click the "Export CSV" or "Print / PDF" button. It exports all durations, classifications, and project notes.',
    },
    {
      q: 'Can I add custom categories and color codes?',
      a: 'Yes, in the Activity Tracker or via the API, you can define customized categories with unique icons and colors.',
    },
    {
      q: 'How does the AI assistant protect my privacy?',
      a: 'The AI assistant only analyzes authorized aggregated numbers within your isolated user account. No personal activity data is shared with third parties.',
    },
  ];

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Help, Knowledge Base & Support
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Productivity guides, system documentation, and direct developer support.
        </p>
      </div>

      {/* Recommended Guides */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Productivity Best Practices</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="h-3.5 w-3.5" />
                  Guide
                </span>
                <span>{g.readTime}</span>
              </div>
              <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">{g.title}</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* FAQ Accordion */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Frequently Asked Questions
          </h3>

          <div className="mt-4 space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {activeFaq === i && (
                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Ticket Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
            Submit a Support Request
          </h3>

          {submitted && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              <span>Your message has been dispatched to our engineering team!</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Topic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                <option value="general">General Inquiry</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing & Subscription</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your question..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide any relevant details..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 glow-brand"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Support Ticket</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

