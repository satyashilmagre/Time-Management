import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Shield,
  Download,
  Check,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionBillingPage() {
  const { user, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState({ plan: 'free', status: 'active' });
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSub() {
      try {
        const res = await apiRequest('/api/user/profile');
        if (res.success && res.subscription) {
          setSubscription(res.subscription);
        }
      } catch (err) {}
    }
    loadSub();
  }, []);

  const handleSelectPlan = async (planKey) => {
    setLoadingPlan(planKey);
    setMessage('');
    try {
      const res = await apiRequest('/api/user/subscription', {
        method: 'POST',
        body: { plan: planKey, billing_cycle: billingCycle },
      });
      if (res.success && res.subscription) {
        setSubscription(res.subscription);
        await refreshUser();
        setMessage(`Successfully switched to ${planKey.toUpperCase()} plan!`);
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setLoadingPlan('');
    }
  };

  const PLANS = [
    {
      key: 'free',
      name: 'Free Forever',
      priceMonthly: 0,
      priceYearly: 0,
      desc: 'Essential activity tracking & daily Pomodoro timer.',
      features: [
        'Unlimited Manual & Live Timers',
        'Daily Productivity Score',
        'Standard Category Tagging',
        '7-Day History & Audit',
      ],
    },
    {
      key: 'pro',
      name: 'Pro Intelligence',
      priceMonthly: 12,
      priceYearly: 10,
      desc: 'Advanced AI assistant, distraction detection & exports.',
      features: [
        'Everything in Free',
        'AI Productivity Assistant & Ask AI',
        'Wasted Time & Distraction Engine',
        'Unlimited History & Year Review',
        'CSV & PDF Printable Exports',
        'Custom Pomodoro Presets',
      ],
      popular: true,
    },
    {
      key: 'enterprise',
      name: 'Team & Business',
      priceMonthly: 29,
      priceYearly: 24,
      desc: 'Organizational focus and aggregated team productivity.',
      features: [
        'Everything in Pro',
        'Team Focus Dashboards',
        'Shared Workspace Workflows',
        'Dedicated Priority Support',
        'Enterprise Single Sign-On (SSO)',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Subscription & Billing
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your SaaS subscription tier, billing period, and invoice records.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Current Subscription Banner */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 p-6 shadow-xs dark:border-indigo-950 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Current Active Tier
            </span>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
              {subscription.plan?.toUpperCase()} Plan ({subscription.status || 'Active'})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {subscription.plan === 'pro'
                ? 'Full AI productivity capabilities and unlimited analytics unlocked.'
                : 'Free tier active. Upgrade to unlock full AI schedule optimization.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ● Active Account
            </span>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-lg px-4 py-1.5 transition ${
              billingCycle === 'monthly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 transition ${
              billingCycle === 'yearly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <span>Annual (Save 20%)</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = subscription.plan === plan.key;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.key}
              className={`relative rounded-3xl border p-6 transition flex flex-col justify-between ${
                plan.popular
                  ? 'border-2 border-indigo-600 bg-white shadow-lg dark:bg-slate-900'
                  : 'border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Recommended
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{plan.desc}</p>

                <div className="my-6">
                  <span className="font-mono text-4xl font-black">${price}</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.key)}
                    disabled={loadingPlan === plan.key}
                    className={`w-full rounded-xl py-2.5 text-xs font-semibold text-white shadow transition ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 glow-brand'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                    }`}
                  >
                    {loadingPlan === plan.key ? 'Updating...' : `Switch to ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Receipts History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          Payment Receipts & Invoices
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[11px] font-semibold uppercase text-slate-400 dark:border-slate-800">
              <tr>
                <th className="py-2.5">Date</th>
                <th className="py-2.5">Description</th>
                <th className="py-2.5">Amount</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3 text-slate-600 dark:text-slate-300">Nov 01, 2026</td>
                <td className="py-3 font-medium text-slate-800 dark:text-slate-200">Time Intelligence Pro Monthly</td>
                <td className="py-3 font-mono font-semibold">$12.00</td>
                <td className="py-3">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Paid
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => alert('Receipt downloaded')}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

