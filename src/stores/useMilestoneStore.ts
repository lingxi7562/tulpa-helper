import { create } from 'zustand';
import { getTotalDuration, getMilestones, createMilestone } from '../db/database';
import type { Milestone } from '../db/schema';

const THRESHOLDS = [10, 50, 100] as const;
const CELEBRATIONS_KEY = 'time-milestone-celebrations-v1';

function loadCelebrationsEnabled(): boolean {
  try { return localStorage.getItem(CELEBRATIONS_KEY) === 'enabled'; }
  catch { return false; }
}

function milestoneTitle(hours: number): string {
  return `时间标记 · ${hours} 小时`;
}

interface MilestoneState {
  level: number | null;
  celebrationsEnabled: boolean;
  checkAndCelebrate: () => Promise<void>;
  dismiss: () => void;
  setCelebrationsEnabled: (enabled: boolean) => void;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  level: null,
  celebrationsEnabled: loadCelebrationsEnabled(),

  checkAndCelebrate: async () => {
    if (!get().celebrationsEnabled || get().level !== null) return;

    const totalSeconds = await getTotalDuration();
    const totalHours = Math.floor(totalSeconds / 3600);

    // 从 milestones 表查询已创建的自动里程碑
    const existing = await getMilestones() as Milestone[];
    const existingTitles = new Set(existing.map(m => m.title));

    for (const threshold of THRESHOLDS) {
      const legacyTitle = threshold === 10
        ? '每一小时的陪伴都算数'
        : threshold === 50
          ? '五十个小时，我们一起走过'
          : '一百个小时，感谢这份坚持';
      if (totalHours >= threshold && !existingTitles.has(milestoneTitle(threshold)) && !existingTitles.has(legacyTitle)) {
        // 写入 milestones 表，与手动里程碑合流
        await createMilestone('mature', milestoneTitle(threshold), `可选时间记录：累计陪伴 ${threshold} 小时`);
        set({ level: threshold });
        return;
      }
    }
  },

  dismiss: () => set({ level: null }),

  setCelebrationsEnabled: (enabled) => {
    try { localStorage.setItem(CELEBRATIONS_KEY, enabled ? 'enabled' : 'disabled'); }
    catch { /* the preference is optional */ }
    set({ celebrationsEnabled: enabled, level: null });
  },
}));
