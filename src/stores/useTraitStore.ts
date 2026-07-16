import { create } from 'zustand';
import { getTraits, createTrait, deleteTrait } from '../db/database';
import type { Trait } from '../db/schema';

interface TraitState {
  traits: Trait[];
  loading: boolean;
  loadTraits: () => Promise<void>;
  addTrait: (t: { name: string; description?: string; weight?: number }) => Promise<void>;
  removeTrait: (id: number) => Promise<void>;
}

export const useTraitStore = create<TraitState>((set) => ({
  traits: [],
  loading: false,
  loadTraits: async () => {
    set({ loading: true });
    try {
      const rows = await getTraits();
      set({ traits: rows });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  addTrait: async (t) => {
    set({ loading: true });
    try {
      await createTrait(t);
      const rows = await getTraits();
      set({ traits: rows });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  removeTrait: async (id) => {
    set({ loading: true });
    try {
      await deleteTrait(id);
      const rows = await getTraits();
      set({ traits: rows });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
