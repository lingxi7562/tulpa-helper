import { create } from 'zustand';
import { getStages, unlockStage, lockStage } from '../db/database';
import type { Stage } from '../db/schema';

interface StageState {
  stages: Stage[];
  activeStageId: string;
  loading: boolean;
  loadStages: () => Promise<boolean>;
  setActiveStage: (id: string) => void;
  unlock: (id: string) => Promise<boolean>;
  lock: (id: string) => Promise<boolean>;
}

export const useStageStore = create<StageState>((set, get) => {
  // 私有 helper：执行锁定状态变更后重载阶段（原始 unlock/lock 行为：catch 不 rethrow）
  const setStageLocked = async (fn: () => Promise<void>): Promise<boolean> => {
    set({ loading: true });
    try {
      await fn();
      if (!(await get().loadStages())) return false;
      return true;
    } catch (error) {
      console.error(error);
      return false;
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
        return true;
      } catch (error) {
        console.error(error);
        return false;
      } finally {
        set({ loading: false });
      }
    },
    setActiveStage: (id) => set({ activeStageId: id }),
    unlock: (id) => setStageLocked(() => unlockStage(id)),
    lock: (id) => setStageLocked(() => lockStage(id)),
  };
});
