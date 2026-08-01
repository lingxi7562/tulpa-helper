import { create } from 'zustand';
import type { EntryType } from '../db/schema';

export type TimerPhase = 'idle' | 'running' | 'paused' | 'completed' | 'saving';
export type CompletionMode = 'auto' | 'prompt';

export interface TimerRun {
  id: string;
  stageId: string;
  sessionType: EntryType;
  durationSeconds: number;
  startedAtMs: number;
  deadlineAtMs: number;
  completionMode: CompletionMode;
}

interface StartTimerInput {
  stageId: string;
  completionMode: CompletionMode;
}

interface TimerState {
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  sessionType: EntryType;
  durationMinutes: number;
  activeRun: TimerRun | null;
  pendingRun: TimerRun | null;
  summaryDraft: string;
  saveError: string;
  startTimer: (input: StartTimerInput) => void;
  pauseTimer: () => void;
  resetTimer: (seconds?: number) => void;
  syncClock: (nowMs?: number) => void;
  claimPendingSave: () => TimerRun | null;
  saveFailed: (message: string) => void;
  saveSucceeded: () => void;
  setSummaryDraft: (value: string) => void;
  setSessionType: (type: EntryType) => void;
  setDurationMinutes: (minutes: number) => void;
}

const TIMER_STORAGE_KEY = 'pomodoro-timer-state-v2';

function loadDuration(): number {
  try {
    const value = parseInt(localStorage.getItem('pomodoro-minutes') || '25', 10);
    return Number.isInteger(value) && value >= 1 && value <= 60 ? value : 25;
  } catch {
    return 25;
  }
}

function makeRunId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function isTimerRun(value: unknown): value is TimerRun {
  if (!value || typeof value !== 'object') return false;
  const run = value as Partial<TimerRun>;
  return typeof run.id === 'string'
    && typeof run.stageId === 'string'
    && typeof run.sessionType === 'string'
    && typeof run.durationSeconds === 'number'
    && Number.isFinite(run.durationSeconds)
    && run.durationSeconds > 0
    && typeof run.startedAtMs === 'number'
    && Number.isFinite(run.startedAtMs)
    && typeof run.deadlineAtMs === 'number'
    && Number.isFinite(run.deadlineAtMs)
    && (run.completionMode === 'auto' || run.completionMode === 'prompt');
}

function loadPersistedState(durationMinutes: number): Partial<TimerState> {
  try {
    const parsed = JSON.parse(localStorage.getItem(TIMER_STORAGE_KEY) || '{}') as Record<string, unknown>;
    const activeRun = isTimerRun(parsed.activeRun) ? parsed.activeRun : null;
    const pendingRun = isTimerRun(parsed.pendingRun) ? parsed.pendingRun : null;
    const summaryDraft = typeof parsed.summaryDraft === 'string' ? parsed.summaryDraft : '';
    const sessionType = typeof parsed.sessionType === 'string' ? parsed.sessionType as EntryType : 'narration';
    const phase = parsed.phase;

    if (phase === 'running' && activeRun) {
      const remaining = Math.max(0, Math.ceil((activeRun.deadlineAtMs - Date.now()) / 1000));
      if (remaining > 0) {
        return { phase: 'running', isRunning: true, timeLeft: remaining, activeRun, pendingRun: null, summaryDraft, sessionType };
      }
      return { phase: 'completed', isRunning: false, timeLeft: 0, activeRun: null, pendingRun: activeRun, summaryDraft, sessionType };
    }

    if (phase === 'paused' && activeRun) {
      const storedTimeLeft = Number(parsed.timeLeft);
      const timeLeft = Number.isFinite(storedTimeLeft) && storedTimeLeft > 0
        ? Math.ceil(storedTimeLeft)
        : activeRun.durationSeconds;
      return { phase: 'paused', isRunning: false, timeLeft, activeRun, pendingRun: null, summaryDraft, sessionType };
    }

    if ((phase === 'completed' || phase === 'saving') && pendingRun) {
      return { phase: 'completed', isRunning: false, timeLeft: 0, activeRun: null, pendingRun, summaryDraft, sessionType };
    }
  } catch {
    // A corrupt or unavailable localStorage entry should not prevent startup.
  }

  return {
    phase: 'idle',
    isRunning: false,
    timeLeft: durationMinutes * 60,
    activeRun: null,
    pendingRun: null,
    summaryDraft: '',
    sessionType: 'narration',
  };
}

const durationMinutes = loadDuration();
const persisted = loadPersistedState(durationMinutes);

export const useTimerStore = create<TimerState>((set, get) => ({
  phase: 'idle',
  timeLeft: durationMinutes * 60,
  isRunning: false,
  sessionType: 'narration',
  durationMinutes,
  activeRun: null,
  pendingRun: null,
  summaryDraft: '',
  saveError: '',
  ...persisted,

  startTimer: ({ stageId, completionMode }) => {
    const state = get();
    if (state.phase === 'completed' || state.phase === 'saving' || state.phase === 'running') return;

    const now = Date.now();
    if (state.phase === 'paused' && state.activeRun) {
      set({
        phase: 'running',
        isRunning: true,
        activeRun: { ...state.activeRun, deadlineAtMs: now + state.timeLeft * 1000 },
        saveError: '',
      });
      return;
    }

    const durationSeconds = state.durationMinutes * 60;
    set({
      phase: 'running',
      isRunning: true,
      timeLeft: durationSeconds,
      activeRun: {
        id: makeRunId(),
        stageId,
        sessionType: state.sessionType,
        durationSeconds,
        startedAtMs: now,
        deadlineAtMs: now + durationSeconds * 1000,
        completionMode,
      },
      pendingRun: null,
      summaryDraft: '',
      saveError: '',
    });
  },

  pauseTimer: () => {
    const state = get();
    if (state.phase !== 'running' || !state.activeRun) return;
    const remaining = Math.max(0, Math.ceil((state.activeRun.deadlineAtMs - Date.now()) / 1000));
    if (remaining <= 0) {
      state.syncClock();
      return;
    }
    set({ phase: 'paused', isRunning: false, timeLeft: remaining });
  },

  resetTimer: (seconds) => {
    const state = get();
    if (state.phase === 'completed' || state.phase === 'saving') return;
    set({
      phase: 'idle',
      isRunning: false,
      timeLeft: seconds ?? state.durationMinutes * 60,
      activeRun: null,
      pendingRun: null,
      summaryDraft: '',
      saveError: '',
    });
  },

  syncClock: (nowMs = Date.now()) => {
    const state = get();
    if (state.phase !== 'running' || !state.activeRun) return;
    const remaining = Math.max(0, Math.ceil((state.activeRun.deadlineAtMs - nowMs) / 1000));
    if (remaining > 0) {
      if (remaining !== state.timeLeft) set({ timeLeft: remaining });
      return;
    }
    set({
      phase: 'completed',
      isRunning: false,
      timeLeft: 0,
      pendingRun: state.activeRun,
      activeRun: null,
      saveError: '',
    });
  },

  claimPendingSave: () => {
    const state = get();
    if (state.phase !== 'completed' || !state.pendingRun) return null;
    set({ phase: 'saving', isRunning: false, saveError: '' });
    return state.pendingRun;
  },

  saveFailed: (message) => {
    if (!get().pendingRun) return;
    set({ phase: 'completed', isRunning: false, saveError: message });
  },

  saveSucceeded: () => {
    const state = get();
    set({
      phase: 'idle',
      isRunning: false,
      timeLeft: state.durationMinutes * 60,
      activeRun: null,
      pendingRun: null,
      summaryDraft: '',
      saveError: '',
    });
  },

  setSummaryDraft: (summaryDraft) => set({ summaryDraft }),
  setSessionType: (sessionType) => {
    if (get().phase === 'idle') set({ sessionType });
  },
  setDurationMinutes: (minutes) => {
    if (get().phase !== 'idle' || !Number.isFinite(minutes)) return;
    const valid = Math.max(1, Math.min(60, Math.trunc(minutes)));
    try {
      localStorage.setItem('pomodoro-minutes', String(valid));
    } catch {
      // Keep the in-memory preference when persistent storage is unavailable.
    }
    set({ durationMinutes: valid, timeLeft: valid * 60 });
  },
}));

useTimerStore.subscribe((state) => {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
      phase: state.phase,
      timeLeft: state.timeLeft,
      sessionType: state.sessionType,
      activeRun: state.activeRun,
      pendingRun: state.pendingRun,
      summaryDraft: state.summaryDraft,
    }));
  } catch {
    // Timer operation remains available even when localStorage cannot be written.
  }
});
