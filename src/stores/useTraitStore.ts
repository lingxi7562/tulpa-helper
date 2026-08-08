import { create } from 'zustand';
import { getTraits, createTrait, deleteTrait, updateTrait } from '../db/database';
import type { Trait } from '../db/schema';

interface TraitState {
  traits: Trait[];
  loading: boolean;
  loadError: boolean;
  loadTraits: () => Promise<void>;
  addTrait: (t: { name: string; description?: string; weight?: number }) => Promise<void>;
  removeTrait: (id: number) => Promise<void>;
  updateTrait: (id: number, fields: { name?: string; description?: string; weight?: number; category?: string }) => Promise<void>;
}

export const useTraitStore = create<TraitState>((set) => ({
  traits: [],
  loading: false,
  loadError: false,
  loadTraits: async () => {
    set({ loading: true, loadError: false });
    try {
      const rows = await getTraits();
      set({ traits: rows, loadError: false });
    } catch (error) {
      console.error(error);
      set({ loadError: true });
    } finally {
      set({ loading: false });
    }
  },
  addTrait: async (t) => {
    set({ loading: true });
    try {
      await createTrait(t);
      const rows = await getTraits();
      set({ traits: rows, loadError: false });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  removeTrait: async (id) => {
    set({ loading: true });
    try {
      await deleteTrait(id);
      const rows = await getTraits();
      set({ traits: rows, loadError: false });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateTrait: async (id, fields) => {
    set({ loading: true });
    try {
      await updateTrait(id, fields);
      const rows = await getTraits();
      set({ traits: rows, loadError: false });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
