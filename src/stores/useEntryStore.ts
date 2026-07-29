import { create } from 'zustand';
import { getEntries, getEntryCount, createEntry, deleteEntry, updateEntry } from '../db/database';
import type { Entry, EntryType } from '../db/schema';

interface EntryState {
  entries: Entry[];
  totalEntries: number;
  loading: boolean;
  loadEntries: (stageId?: string, limit?: number, offset?: number, append?: boolean) => Promise<void>;
  addEntry: (e: { stage_id: string; type: EntryType; title: string; content?: string; tags?: string; duration_seconds?: number; mood?: number }) => Promise<number>;
  removeEntry: (id: number) => Promise<void>;
  updateEntry: (id: number, fields: { title?: string; content?: string; mood?: number; tags?: string }) => Promise<void>;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  totalEntries: 0,
  loading: false,
  loadEntries: async (stageId, limit = 50, offset = 0, append = false) => {
    set({ loading: true });
    try {
      const [rows, totalEntries] = await Promise.all([
        getEntries(stageId, limit, offset),
        getEntryCount(stageId),
      ]);
      set((s) => ({
        entries: append ? [...s.entries, ...rows] : rows,
        totalEntries,
      }));
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
      const [rows, totalEntries] = await Promise.all([
        getEntries(),
        getEntryCount(),
      ]);
      set({ entries: rows, totalEntries });
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
      set((s) => ({
        entries: s.entries.filter((e) => e.id !== id),
        totalEntries: Math.max(0, s.totalEntries - 1),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateEntry: async (id, fields) => {
    set({ loading: true });
    try {
      await updateEntry(id, fields);
      set((s) => ({ entries: s.entries.map(e => e.id === id ? { ...e, ...fields } as Entry : e) }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
