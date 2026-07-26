import { create } from 'zustand';
import { getTotalDuration } from '../db/database';

const THRESHOLDS = [10, 50, 100] as const;
const STORAGE_KEY = 'milestones-celebrated';

function getCelebrated(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markCelebrated(level: number) {
  try {
    const celebrated = getCelebrated();
    if (!celebrated.includes(level)) {
      celebrated.push(level);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(celebrated));
    }
  } catch { /* noop */ }
}

interface MilestoneState {
  level: number | null;
  checkAndCelebrate: () => Promise<void>;
  dismiss: () => void;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  level: null,

  checkAndCelebrate: async () => {
    // 如果已有庆祝正在进行，跳过
    if (get().level !== null) return;

    const totalSeconds = await getTotalDuration();
    const totalHours = Math.floor(totalSeconds / 3600);
    const celebrated = getCelebrated();

    for (const threshold of THRESHOLDS) {
      if (totalHours >= threshold && !celebrated.includes(threshold)) {
        markCelebrated(threshold);
        set({ level: threshold });
        return;
      }
    }
  },

  dismiss: () => set({ level: null }),
}));
