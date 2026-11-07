# Time Intelligence – Understand Your Time. Improve Your Life.

**Time Intelligence** is an enterprise-grade, intelligent SaaS web platform for modern time management, productivity optimization, and intentional habit engineering. It empowers developers, students, freelancers, and high-performance teams to transform fragmented, unorganized hours into focused, goal-aligned achievement.

---

## 🚀 Live Services

- **Frontend Application**: [http://localhost:5173](http://localhost:5173) (Vite + React 18 + Tailwind CSS)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000) (Node.js + Express.js)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Database**: Cloud MySQL (Aiven) with automatic schema migrations & realistic data seeding

---

## 🔑 Demo Account Credentials

A pre-seeded demonstration account is immediately available for evaluation with 7 days of realistic activity logs, Pomodoro sessions, and goal tracking:

- **Email**: `demo@timeintelligence.io`
- **Password**: `password123`
- **One-Click Sign-In**: Available directly on the [Login Page](http://localhost:5173/login) via the "Sign In as Demo User" button.

---

## 🌟 Key Modules & Core Capabilities

### 1. Smart Dashboard
- **Real-Time Key Metrics**: Tracked Today, Productive Time, Unproductive/Wasted Time, Neutral Time, Focus Time, and Completed Goals.
- **Productivity Score Radial Gauge**: 0–100 score updated dynamically from verified activity ratios.
- **24-Hour Visual Hourly Area/Bar Chart**: Stacked hourly distribution showing productive vs. distraction intervals across all 24 hours.
- **Category Share Pie Chart**: Interactive breakdown of work, coding, learning, exercise, and entertainment.
- **Quick-Start Active Timer Form**: Immediate tracking without navigating away.

### 2. Activity Time Tracker & Timer Context
- **Timestamp Accuracy**: Timers calculate duration from synchronized UTC server timestamps rather than brittle browser intervals alone, surviving reloads, tab switches, and laptop sleeps.
- **Timer Controls**: Start, Pause, Resume, Stop, and Discard with prevention of overlapping active sessions.
- **Manual Activity Entry**: Offline or retrospective logging with custom date/time ranges, notes, and tags.

### 3. Activity History & Audit
- **Granular Search & Filters**: Filter by keyword, category, productivity classification, and date.
- **Record Management**: Edit activity duration and notes with modal dialogs; confirmable deletions.
- **Exporting**: Immediate CSV download of all filtered records.

### 4. 24-Hour Visual Daily Timeline
- **Continuous 24-Hour Ribbon**: Proportional visual strip mapping every minute of the day.
- **Day-Period Cards**: Morning (05:00–12:00), Afternoon (12:00–18:00), and Evening/Night (18:00–05:00) grouping.
- **Day-by-Day Navigation**: Seamless switching between past and future dates.

### 5. Daily Time Analysis & Wasted Time Detection
- **Proportional Audit**: Value vs. Wasted breakdown.
- **Distraction Engine**: Pinpoints excessive social media (>45 mins), entertainment spikes, and context switches.
- **Actionable Advice**: Tailored suggestions with priority badges (High, Medium, Low).

### 6. Transparent Productivity Score (0–100)
- **Mathematical Formula**:
  - **Productive Time Ratio (50%)**: Proportion of goal-aligned time vs. total hours.
  - **Focus Sessions (25%)**: Completed Pomodoro sprints (benchmark: 4–5 sessions/day).
  - **Goal Alignment (15%)**: Daily target completion percentage.
  - **Consistency Bonus (10%)**: Meeting daily baseline hours without extreme fragmented gaps.
- **"What-If" Simulator**: Interactive sliders to preview how adding focus sessions or cutting distractions elevates your score.

### 7. Distraction-Free Focus Mode (Pomodoro Timer)
- **Presets**: 25m Focus, 5m Short Break, 15m Long Break, and Custom Durations.
- **Synthesized Audio Bell Chime**: Web Audio API sine-wave bell cues on session completion.
- **Goal & Task Linkage**: Automatically updates progress bars on linked daily goals upon sprint completion.
- **Focus Streaks**: Tracks consecutive days of completed deep work.
- **Distraction-Free Fullscreen Mode**.

### 8. Weekly, Monthly & Yearly Reports
- **Weekly Analytics**: Week-over-week comparisons, peak day vs. low day analysis, score trend lines.
- **Monthly Reports**: Executive summaries, domain breakdown tables, and print-ready PDF view.
- **Yearly Reports**: 12-month volume trends, milestone counts, and long-term habits.

### 9. Goals Management & Planning
- **Daily Goals**: Target minutes with live percentage completion bars and toggle switches.
- **Weekly Targets**: Long-term hourly focus milestones.
- **Modal Creator**: Fast addition with category selection.

### 10. AI Productivity Assistant
- **Zero Hallucination**: Operates strictly on authorized activity records from the database.
- **Interactive Conversational Engine**: Ask questions about routines, distractions, and schedule advice.
- **Quick Prompt Pills**: One-click questions for schedule optimization and score improvement.

### 11. Settings, Billing & Support
- **Customizable Appearance**: Dark Mode and Light Mode with persistence.
- **Subscription Management**: Free, Pro ($12/mo), and Enterprise ($29/mo) with simulated instant upgrade.
- **Support & Knowledge Base**: Productivity guides, FAQs, and ticket submission.

---

## 🗄️ Database Architecture (MySQL)

Normalized relational schema designed for scale, user data isolation, and indexing:

| Table | Description |
|---|---|
| `users` | User accounts, hashed passwords, timezones, target hours, onboarding flags. |
| `user_settings` | Theme, Pomodoro durations, sound alerts, notification preferences. |
| `activity_categories`| Standard and user-defined categories with icons, colors, and classifications. |
| `activity_tags` | Custom user tags (`#DeepWork`, `#Meeting`, `#Research`). |
| `activities` | Granular activity logs with start/end datetimes, duration, and classification. |
| `activity_tag_relations` | Many-to-many relationship between activities and tags. |
| `active_timers` | Real-time active stopwatch record per user with server timestamp calculation. |
| `focus_sessions` | Completed Pomodoro sprints linked to daily goals and activity logs. |
| `daily_goals` | Daily minute targets with real-time progress tracking. |
| `weekly_goals` | Weekly hourly targets with progress tracking. |
| `productivity_scores`| Daily scores (0–100) with detailed JSON point factor breakdown. |
| `notifications` | In-app alerts, milestone notifications, and break reminders. |
| `ai_insights` | System-generated AI summaries and waste detection alerts. |
| `subscriptions` | Billing tiers (Free, Pro, Enterprise), status, and billing cycle. |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, MySQL2 with connection pool.
- **Database**: Cloud MySQL 8.0 with SSL encryption.
- **Styling**: Tailwind CSS with custom dark mode class support, responsive layouts, and modern SaaS typography inspired by Linear and Raycast.

---

## 🏁 Getting Started Locally

### 1. Backend Setup
```bash
cd backend
npm install
node src/server.js
```
The server will automatically run database migrations and seed default categories and the demo user on port `5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to explore all 22 pages.

