import { create } from 'zustand';
import type { EntryType } from '../db/schema';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionType: EntryType;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (seconds?: number) => void;
  tick: () => void;
  setSessionType: (t: EntryType) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  timeLeft: 25 * 60,
  isRunning: false,
  sessionType: 'narration',
  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),
  resetTimer: (seconds = 25 * 60) => set({ timeLeft: seconds, isRunning: false }),
  tick: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),
  setSessionType: (t) => set({ sessionType: t }),
}));
