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

export const useStageStore = create<StageState>((set, get) => ({
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
  unlock: async (id) => {
    set({ loading: true });
    try {
      await unlockStage(id);
      await get().loadStages();
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  lock: async (id) => {
    set({ loading: true });
    try {
      await lockStage(id);
      await get().loadStages();
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
