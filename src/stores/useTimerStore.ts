import { create } from 'zustand';
import type { EntryType } from '../db/schema';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionType: EntryType;
  durationMinutes: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (seconds?: number) => void;
  tick: () => void;
  setSessionType: (t: EntryType) => void;
  setDurationMinutes: (mins: number) => void;
}

function loadDuration(): number {
  try {
    const v = parseInt(localStorage.getItem('pomodoro-minutes') || '25', 10);
    return Number.isInteger(v) && v >= 1 && v <= 60 ? v : 25;
  } catch {
    return 25;
  }
}

export const useTimerStore = create<TimerState>((set, get) => {
  const initial = loadDuration() * 60;

  return {
    timeLeft: initial,
    isRunning: false,
    sessionType: 'narration',
    durationMinutes: initial / 60,
    startTimer: () => set({ isRunning: true }),
    pauseTimer: () => set({ isRunning: false }),
    resetTimer: (seconds) => {
      const secs = seconds ?? get().durationMinutes * 60;
      set({ timeLeft: secs, isRunning: false });
    },
    tick: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),
    setSessionType: (t) => set({ sessionType: t }),
    setDurationMinutes: (mins) => {
      if (!Number.isFinite(mins)) return;
      const valid = Math.max(1, Math.min(60, Math.trunc(mins)));
      try { localStorage.setItem('pomodoro-minutes', String(valid)); } catch { /* ignore storage errors */ }
      set({ durationMinutes: valid, timeLeft: valid * 60, isRunning: false });
    },
  };
});
