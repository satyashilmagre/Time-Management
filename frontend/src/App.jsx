import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TimerProvider } from './context/TimerContext';
import AppLayout from './components/layout/AppLayout';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';

// Authenticated Pages
import DashboardPage from './pages/DashboardPage';
import ActivityTrackerPage from './pages/ActivityTrackerPage';
import ActivityHistoryPage from './pages/ActivityHistoryPage';
import DailyTimelinePage from './pages/DailyTimelinePage';
import TimeAnalysisPage from './pages/TimeAnalysisPage';
import ProductivityScorePage from './pages/ProductivityScorePage';
import FocusTimerPage from './pages/FocusTimerPage';
import WeeklyAnalyticsPage from './pages/WeeklyAnalyticsPage';
import MonthlyReportsPage from './pages/MonthlyReportsPage';
import YearlyReportsPage from './pages/YearlyReportsPage';
import GoalsManagementPage from './pages/GoalsManagementPage';
import AiAssistantPage from './pages/AiAssistantPage';
import NotificationsPage from './pages/NotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import SubscriptionBillingPage from './pages/SubscriptionBillingPage';
import HelpSupportPage from './pages/HelpSupportPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TimerProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* Protected Routes inside AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/tracker" element={<ActivityTrackerPage />} />
                <Route path="/history" element={<ActivityHistoryPage />} />
                <Route path="/timeline" element={<DailyTimelinePage />} />
                <Route path="/analysis" element={<TimeAnalysisPage />} />
                <Route path="/productivity-score" element={<ProductivityScorePage />} />
                <Route path="/focus" element={<FocusTimerPage />} />
                <Route path="/weekly" element={<WeeklyAnalyticsPage />} />
                <Route path="/monthly" element={<MonthlyReportsPage />} />
                <Route path="/yearly" element={<YearlyReportsPage />} />
                <Route path="/goals" element={<GoalsManagementPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/settings" element={<AccountSettingsPage />} />
                <Route path="/billing" element={<SubscriptionBillingPage />} />
                <Route path="/support" element={<HelpSupportPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TimerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
