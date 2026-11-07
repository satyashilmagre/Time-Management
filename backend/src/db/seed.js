const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const DEFAULT_CATEGORIES = [
  { name: 'Work', color: '#3b82f6', icon: 'Briefcase', default_classification: 'productive' },
  { name: 'Learning', color: '#10b981', icon: 'BookOpen', default_classification: 'productive' },
  { name: 'Coding', color: '#6366f1', icon: 'Code', default_classification: 'productive' },
  { name: 'Exercise', color: '#ec4899', icon: 'Activity', default_classification: 'productive' },
  { name: 'Sleep', color: '#8b5cf6', icon: 'Moon', default_classification: 'neutral' },
  { name: 'Entertainment', color: '#f59e0b', icon: 'Film', default_classification: 'unproductive' },
  { name: 'Social Media', color: '#ef4444', icon: 'Share2', default_classification: 'unproductive' },
  { name: 'Personal', color: '#06b6d4', icon: 'User', default_classification: 'neutral' },
  { name: 'Family', color: '#14b8a6', icon: 'Heart', default_classification: 'neutral' },
  { name: 'Travel', color: '#64748b', icon: 'Navigation', default_classification: 'neutral' },
  { name: 'Other', color: '#94a3b8', icon: 'Tag', default_classification: 'neutral' },
];

const DEFAULT_TAGS = [
  { name: 'Deep Work', color: '#6366f1' },
  { name: 'Meeting', color: '#3b82f6' },
  { name: 'Research', color: '#10b981' },
  { name: 'Bug Fixing', color: '#f59e0b' },
  { name: 'Reading', color: '#06b6d4' },
  { name: 'Urgent', color: '#ef4444' },
];

async function seedDatabase() {
  const conn = await pool.getConnection();
  try {
    console.log('[Seeder] Checking and seeding default categories...');
    for (const cat of DEFAULT_CATEGORIES) {
      const [existing] = await conn.query(
        'SELECT id FROM activity_categories WHERE name = ? AND user_id IS NULL',
        [cat.name]
      );
      if (existing.length === 0) {
        await conn.query(
          'INSERT INTO activity_categories (user_id, name, color, icon, default_classification, is_default) VALUES (NULL, ?, ?, ?, ?, TRUE)',
          [cat.name, cat.color, cat.icon, cat.default_classification]
        );
      }
    }

    // Check demo user
    const [demoUserCheck] = await conn.query('SELECT id FROM users WHERE email = ?', ['demo@timeintelligence.io']);
    let demoUserId;

    if (demoUserCheck.length === 0) {
      console.log('[Seeder] Creating demo user (demo@timeintelligence.io / password123)...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [userResult] = await conn.query(
        `INSERT INTO users (email, password_hash, full_name, avatar_url, role, timezone, daily_target_hours, onboarding_completed)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [
          'demo@timeintelligence.io',
          hashedPassword,
          'Alex Morgan',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          'SaaS Architect & Developer',
          'UTC',
          8.00,
        ]
      );
      demoUserId = userResult.insertId;

      // Settings
      await conn.query(
        `INSERT INTO user_settings (user_id, theme, pomodoro_focus_min, pomodoro_short_break_min, pomodoro_long_break_min, sound_enabled, email_notifications, push_notifications, daily_reminder_time)
         VALUES (?, 'dark', 25, 5, 15, TRUE, TRUE, TRUE, '08:30')`,
        [demoUserId]
      );

      // Subscription
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      await conn.query(
        `INSERT INTO subscriptions (user_id, plan, status, billing_cycle, current_period_end)
         VALUES (?, 'pro', 'active', 'monthly', ?)`,
        [demoUserId, nextMonth]
      );

      // Seed user default tags
      for (const tag of DEFAULT_TAGS) {
        await conn.query(
          'INSERT INTO activity_tags (user_id, name, color) VALUES (?, ?, ?)',
          [demoUserId, tag.name, tag.color]
        );
      }

      // Fetch category IDs
      const [cats] = await conn.query('SELECT id, name FROM activity_categories WHERE user_id IS NULL');
      const catMap = {};
      cats.forEach(c => { catMap[c.name] = c.id; });

      // Generate seed activities for today and the last 6 days
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const formatDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      // Sample activity logs for 7 days
      const days = [0, 1, 2, 3, 4, 5, 6];
      for (const dOffset of days) {
        const curDay = new Date(now);
        curDay.setDate(curDay.getDate() - dOffset);
        const dateStr = formatDate(curDay);

        const sampleDayActivities = [
          {
            name: 'Morning Architecture Planning & Review',
            cat: 'Work',
            startH: 9, startM: 0,
            durMin: 90,
            classification: 'productive',
            desc: 'Planned system architecture, REST endpoints, and schema design.',
          },
          {
            name: 'React Frontend Development & Components',
            cat: 'Coding',
            startH: 10, startM: 45,
            durMin: 120,
            classification: 'productive',
            desc: 'Built reusable UI components, Tailwind themes, and responsive layouts.',
          },
          {
            name: 'Lunch & Relaxing Break',
            cat: 'Personal',
            startH: 13, startM: 0,
            durMin: 45,
            classification: 'neutral',
            desc: 'Healthy lunch and afternoon stretch.',
          },
          {
            name: 'Social Media Scrolling & News',
            cat: 'Social Media',
            startH: 13, startM: 45,
            durMin: 40,
            classification: 'unproductive',
            desc: 'Browsed Twitter and TechCrunch feeds.',
          },
          {
            name: 'API Controller Integration & Database Indexing',
            cat: 'Coding',
            startH: 14, startM: 30,
            durMin: 105,
            classification: 'productive',
            desc: 'Optimized MySQL query plans and added composite indexes.',
          },
          {
            name: 'System Design Patterns Video Lecture',
            cat: 'Learning',
            startH: 16, startM: 30,
            durMin: 50,
            classification: 'productive',
            desc: 'Studied event-driven architecture and caching strategies.',
          },
          {
            name: 'Evening Jog & Cardio',
            cat: 'Exercise',
            startH: 18, startM: 0,
            durMin: 45,
            classification: 'productive',
            desc: '5km outdoor run.',
          },
          {
            name: 'YouTube Tech Documentaries',
            cat: 'Entertainment',
            startH: 20, startM: 30,
            durMin: 60,
            classification: 'unproductive',
            desc: 'Watched software history documentaries.',
          },
        ];

        let prodSec = 0;
        let neutSec = 0;
        let unprodSec = 0;

        for (const act of sampleDayActivities) {
          const sTime = new Date(curDay);
          sTime.setHours(act.startH, act.startM, 0, 0);
          const eTime = new Date(sTime);
          eTime.setMinutes(eTime.getMinutes() + act.durMin);
          const durSec = act.durMin * 60;

          if (act.classification === 'productive') prodSec += durSec;
          else if (act.classification === 'neutral') neutSec += durSec;
          else unprodSec += durSec;

          await conn.query(
            `INSERT INTO activities (user_id, category_id, name, description, start_time, end_time, duration_seconds, productivity_classification, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              demoUserId,
              catMap[act.cat] || null,
              act.name,
              act.desc,
              sTime,
              eTime,
              durSec,
              act.classification,
              dateStr,
            ]
          );
        }

        // Add focus sessions for each day
        const focusCount = 4 + (dOffset % 3);
        for (let f = 0; f < focusCount; f++) {
          const fTime = new Date(curDay);
          fTime.setHours(9 + f * 2, 15, 0, 0);
          await conn.query(
            `INSERT INTO focus_sessions (user_id, session_type, target_duration_seconds, actual_duration_seconds, activity_name, completed, completed_at)
             VALUES (?, 'focus', 1500, 1500, 'Deep Work Session', TRUE, ?)`,
            [demoUserId, fTime]
          );
        }

        // Productivity score for day
        // Formula: productive ratio * 60 + focus sessions * 20 + goal fulfillment * 20
        const totalSec = prodSec + neutSec + unprodSec;
        const prodRatio = totalSec > 0 ? prodSec / totalSec : 0;
        const scoreVal = Math.min(100, Math.round(prodRatio * 70 + (focusCount >= 4 ? 20 : 10) + 10));

        const breakdown = {
          productive_time_factor: Math.round(prodRatio * 60),
          focus_sessions_factor: focusCount >= 4 ? 20 : 12,
          goal_alignment_factor: 15,
          consistency_bonus: 5,
          total_hours_tracked: (totalSec / 3600).toFixed(1),
          productive_hours: (prodSec / 3600).toFixed(1),
          wasted_hours: (unprodSec / 3600).toFixed(1),
        };

        await conn.query(
          `INSERT INTO productivity_scores (user_id, date, score, productive_seconds, neutral_seconds, unproductive_seconds, focus_seconds, goals_completed, goals_total, breakdown_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, 4, 5, ?)`,
          [demoUserId, dateStr, scoreVal, prodSec, neutSec, unprodSec, focusCount * 1500, JSON.stringify(breakdown)]
        );
      }

      // Seed Daily Goals
      const todayStr = formatDate(now);
      const demoDailyGoals = [
        { title: 'Write Clean Architecture Backend APIs', target_minutes: 180, current_minutes: 180, cat: 'Coding', completed: true },
        { title: 'System Design Deep Dive', target_minutes: 60, current_minutes: 50, cat: 'Learning', completed: false },
        { title: 'Daily Workout / Cardio', target_minutes: 45, current_minutes: 45, cat: 'Exercise', completed: true },
        { title: 'Keep Social Media Under 45 Minutes', target_minutes: 45, current_minutes: 40, cat: 'Social Media', completed: true },
        { title: 'Review Codebase & PRs', target_minutes: 60, current_minutes: 60, cat: 'Work', completed: true },
      ];

      for (const g of demoDailyGoals) {
        await conn.query(
          `INSERT INTO daily_goals (user_id, title, category_id, target_minutes, current_minutes, target_date, is_completed)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [demoUserId, g.title, catMap[g.cat] || null, g.target_minutes, g.current_minutes, todayStr, g.completed]
        );
      }

      // Seed Weekly Goals
      const demoWeeklyGoals = [
        { title: 'Total Deep Work Hours', target_hours: 30.0, current_hours: 24.5, cat: 'Work', completed: false },
        { title: 'Productivity Application Development', target_hours: 15.0, current_hours: 12.0, cat: 'Coding', completed: false },
        { title: 'Exercise at least 4 times', target_hours: 4.0, current_hours: 3.5, cat: 'Exercise', completed: false },
        { title: 'Read Technology Book', target_hours: 5.0, current_hours: 5.0, cat: 'Learning', completed: true },
      ];

      for (const wg of demoWeeklyGoals) {
        await conn.query(
          `INSERT INTO weekly_goals (user_id, title, category_id, target_hours, current_hours, week_start_date, is_completed)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [demoUserId, wg.title, catMap[wg.cat] || null, wg.target_hours, wg.current_hours, todayStr, wg.completed]
        );
      }

      // Seed AI Insights
      const sampleAiInsights = [
        {
          type: 'daily_summary',
          title: 'Daily Productivity Surge: Peak 9 AM - 12 PM',
          content: 'You logged 6.8 hours of productive focus today with zero major interruptions during your morning deep work block. Your highest sustained concentration occurred between 9:00 AM and 11:30 AM.',
          tip: 'Protect your 9 AM to 12 PM window tomorrow by scheduling all recurring team meetings after 2:30 PM.',
        },
        {
          type: 'waste_detection',
          title: 'Distraction Pattern: Post-Lunch Social Media',
          content: 'Detected 40 minutes of unplanned social media and news browsing immediately after lunch (1:45 PM). Over a 5-day work week, this equates to 3 hours and 20 minutes of lost potential focus time.',
          tip: 'Replace the 1:30 PM social browsing cue with a 15-minute brisk walk or audiobook session to avoid dopamine fatigue.',
        },
        {
          type: 'recommendation',
          title: 'Goal Momentum: 80% Daily Goal Completion',
          content: 'You have completed 4 out of 5 daily goals today! Your learning goal is 83% complete with just 10 minutes remaining to reach your target.',
          tip: 'Complete a quick 10-minute flash reading session before 9 PM to achieve a 100% daily completion streak.',
        },
      ];

      for (const ai of sampleAiInsights) {
        await conn.query(
          `INSERT INTO ai_insights (user_id, type, title, content, actionable_tip)
           VALUES (?, ?, ?, ?, ?)`,
          [demoUserId, ai.type, ai.title, ai.content, ai.tip]
        );
      }

      // Seed Notifications
      const sampleNotifications = [
        {
          title: 'Focus Streak Milestone!',
          message: 'Awesome work! You completed 4 focus sessions in a row today.',
          type: 'achievement',
          link: '/focus',
        },
        {
          title: 'Daily Review Ready',
          message: 'Your productivity score reached 88/100 today. View your breakdown report.',
          type: 'report',
          link: '/productivity-score',
        },
        {
          title: 'Goal Reminder',
          message: 'Only 10 minutes left to achieve your System Design learning goal.',
          type: 'goal',
          link: '/goals',
        },
      ];

      for (const n of sampleNotifications) {
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, ?, ?)`,
          [demoUserId, n.title, n.message, n.type, n.link]
        );
      }

      console.log('[Seeder] Demo user and demo data seeded successfully!');
    } else {
      console.log('[Seeder] Demo user already exists.');
    }
  } catch (err) {
    console.error('[Seeder] Error during seed:', err);
  } finally {
    conn.release();
  }
}

module.exports = { seedDatabase, DEFAULT_CATEGORIES };
