import { create } from 'zustand';
import { getEntries, createEntry, deleteEntry } from '../db/database';
import type { Entry, EntryType } from '../db/schema';

interface EntryState {
  entries: Entry[];
  loading: boolean;
  loadEntries: (stageId?: string, limit?: number, offset?: number, append?: boolean) => Promise<void>;
  addEntry: (e: { stage_id: string; type: EntryType; title: string; content?: string; tags?: string; duration_seconds?: number; mood?: number }) => Promise<number>;
  removeEntry: (id: number) => Promise<void>;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  loading: false,
  loadEntries: async (stageId, limit = 50, offset = 0, append = false) => {
    set({ loading: true });
    try {
      const rows = await getEntries(stageId, limit, offset);
      set((s) => ({ entries: append ? [...s.entries, ...rows] : rows }));
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
  addEntry: async (e) => {
    set({ loading: true });
    try {
      const id = await createEntry(e);
      const rows = await getEntries();
      set({ entries: rows });
      return id;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  removeEntry: async (id) => {
    set({ loading: true });
    try {
      await deleteEntry(id);
      set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },
}));
