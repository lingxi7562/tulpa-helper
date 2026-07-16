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
  activeStageId: 'create',
  loading: false,
  loadStages: async () => {
    set({ loading: true });
    const rows: any[] = await getStages();
    set({ stages: rows, loading: false });
  },
  setActiveStage: (id) => set({ activeStageId: id }),
  unlock: async (id) => {
    await unlockStage(id);
    await get().loadStages();
  },
  lock: async (id) => {
    await lockStage(id);
    await get().loadStages();
  },
}));
