import { create } from 'zustand';
import { getTotalDuration, getMilestones, createMilestone } from '../db/database';
import type { Milestone } from '../db/schema';

const THRESHOLDS = [10, 50, 100] as const;

function milestoneTitle(hours: number): string {
  if (hours === 10) return '每一小时的陪伴都算数';
  if (hours === 50) return '五十个小时，我们一起走过';
  return '一百个小时，感谢这份坚持';
}

interface MilestoneState {
  level: number | null;
  checkAndCelebrate: () => Promise<void>;
  dismiss: () => void;
}

export const useMilestoneStore = create<MilestoneState>((set, get) => ({
  level: null,

  checkAndCelebrate: async () => {
    if (get().level !== null) return;

    const totalSeconds = await getTotalDuration();
    const totalHours = Math.floor(totalSeconds / 3600);

    // 从 milestones 表查询已创建的自动里程碑
    const existing = await getMilestones() as Milestone[];
    const existingTitles = existing.map(m => m.title);

    for (const threshold of THRESHOLDS) {
      if (totalHours >= threshold && !existingTitles.includes(milestoneTitle(threshold))) {
        // 写入 milestones 表，与手动里程碑合流
        await createMilestone('mature', milestoneTitle(threshold), `自动达成：累计专注 ${threshold} 小时`);
        set({ level: threshold });
        return;
      }
    }
  },

  dismiss: () => set({ level: null }),
}));
