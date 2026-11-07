import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from './AuthContext';

const TimerContext = createContext();

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function TimerProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Sync active timer from server
  const fetchActiveTimer = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiRequest('/api/timer/active');
      if (res.success && res.activeTimer) {
        setActiveTimer(res.activeTimer);
        setElapsedSeconds(res.activeTimer.current_elapsed_seconds || 0);
      } else {
        setActiveTimer(null);
        setElapsedSeconds(0);
      }
    } catch (err) {
      console.error('Fetch timer error:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchActiveTimer();
    } else {
      setActiveTimer(null);
      setElapsedSeconds(0);
    }
  }, [isAuthenticated]);

  // Timestamp-based accurate interval updater
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (activeTimer && !activeTimer.is_paused) {
      intervalRef.current = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeTimer.start_time).getTime();
        const added = Math.max(0, Math.floor((now - start) / 1000));
        const total = (activeTimer.elapsed_before_pause || 0) + added;
        setElapsedSeconds(total);
      }, 1000);
    } else if (activeTimer && activeTimer.is_paused) {
      setElapsedSeconds(activeTimer.elapsed_before_pause || 0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer]);

  const startTimer = async ({ activity_name, category_id, productivity_classification, notes }) => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/timer/start', {
        method: 'POST',
        body: { activity_name, category_id, productivity_classification, notes },
      });
      if (res.success && res.activeTimer) {
        setActiveTimer(res.activeTimer);
        setElapsedSeconds(res.activeTimer.current_elapsed_seconds || 0);
        return res.activeTimer;
      }
    } finally {
      setLoading(false);
    }
  };

  const pauseTimer = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/timer/pause', { method: 'POST' });
      if (res.success && res.activeTimer) {
        setActiveTimer(res.activeTimer);
        setElapsedSeconds(res.activeTimer.current_elapsed_seconds || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const resumeTimer = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/timer/resume', { method: 'POST' });
      if (res.success && res.activeTimer) {
        setActiveTimer(res.activeTimer);
        setElapsedSeconds(res.activeTimer.current_elapsed_seconds || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/timer/stop', { method: 'POST' });
      setActiveTimer(null);
      setElapsedSeconds(0);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const discardTimer = async () => {
    setLoading(true);
    try {
      await apiRequest('/api/timer/discard', { method: 'POST' });
      setActiveTimer(null);
      setElapsedSeconds(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimerContext.Provider
      value={{
        activeTimer,
        elapsedSeconds,
        loading,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        discardTimer,
        fetchActiveTimer,
        formattedElapsed: formatTime(elapsedSeconds),
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  return useContext(TimerContext);
}
