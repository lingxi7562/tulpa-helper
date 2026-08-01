import { create } from 'zustand';
import { getStages, unlockStage, lockStage } from '../db/database';
import type { Stage } from '../db/schema';

interface StageState {
  stages: Stage[];
  activeStageId: string;
  loading: boolean;
  loadStages: () => Promise<void>;
  setActiveStage: (id: string) => void;
  unlock: (id: string) => Promise<void>;
  lock: (id: string) => Promise<void>;
}

export const useStageStore = create<StageState>((set, get) => {
  // 私有 helper：执行锁定状态变更后重载阶段（原始 unlock/lock 行为：catch 不 rethrow）
  const setStageLocked = async (fn: () => Promise<void>) => {
    set({ loading: true });
    try {
      await fn();
      await get().loadStages();
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  };

  return {
    stages: [],
    activeStageId: 'prep',
    loading: false,
    loadStages: async () => {
      set({ loading: true });
      try {
        const rows = await getStages();
        set({ stages: rows });
      } catch (error) {
        console.error(error);
      } finally {
        set({ loading: false });
      }
    },
    setActiveStage: (id) => set({ activeStageId: id }),
    unlock: async (id) => setStageLocked(() => unlockStage(id)),
    lock: async (id) => setStageLocked(() => lockStage(id)),
  };
});
