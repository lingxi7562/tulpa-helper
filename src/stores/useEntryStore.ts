import { create } from 'zustand';
import { getEntries, getEntryById, getEntryCount, createEntry, deleteEntry, updateEntry } from '../db/database';
import type { Entry, EntryType } from '../db/schema';

interface EntryState {
  entries: Entry[];
  totalEntries: number;
  revision: number;
  queryStageId: string | null;
  loading: boolean;
  loadEntries: (stageId?: string, limit?: number, offset?: number, append?: boolean) => Promise<void>;
  addEntry: (e: { stage_id: string; type: EntryType; title: string; content?: string; tags?: string; duration_seconds?: number; mood?: number }) => Promise<number>;
  removeEntry: (id: number) => Promise<void>;
  updateEntry: (id: number, fields: { title?: string; content?: string; mood?: number; tags?: string }) => Promise<void>;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  totalEntries: 0,
  revision: 0,
  queryStageId: null,
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
        queryStageId: append ? s.queryStageId : (stageId ?? null),
        revision: s.revision + 1,
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
      let created: Entry | null = null;
      try {
        created = await getEntryById(id);
      } catch (refreshError) {
        console.error(refreshError);
      }
      set((state) => {
        const belongsToQuery = state.queryStageId === null || state.queryStageId === e.stage_id;
        return {
          entries: belongsToQuery && created
            ? [created, ...state.entries.filter(entry => entry.id !== created?.id)]
            : state.entries,
          totalEntries: belongsToQuery ? state.totalEntries + 1 : state.totalEntries,
          revision: state.revision + 1,
        };
      });
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
        revision: s.revision + 1,
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
      set((s) => ({
        entries: s.entries.map(e => e.id === id ? { ...e, ...fields } as Entry : e),
        revision: s.revision + 1,
      }));
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
