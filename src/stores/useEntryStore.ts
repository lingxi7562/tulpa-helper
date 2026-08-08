import { create } from 'zustand';
import { getEntries, getEntryById, getEntryCount, searchEntries, getSearchEntryCount, createEntry, deleteEntry, updateEntry } from '../db/database';
import type { Entry, EntryType } from '../db/schema';

interface EntryState {
  entries: Entry[];
  totalEntries: number;
  revision: number;
  queryStageId: string | null;
  searchQuery: string;
  loading: boolean;
  loadError: boolean;
  loadEntries: (stageId?: string, limit?: number, offset?: number, append?: boolean, searchQuery?: string) => Promise<void>;
  addEntry: (e: { stage_id: string; type: EntryType; title: string; content?: string; tags?: string; duration_seconds?: number; mood?: number }) => Promise<number>;
  removeEntry: (id: number) => Promise<void>;
  updateEntry: (id: number, fields: { title?: string; content?: string; mood?: number; tags?: string }) => Promise<void>;
}

let latestLoadRequest = 0;

function entryMatchesQuery(entry: Entry, query: string): boolean {
  if (!query) return true;
  return `${entry.title}\n${entry.content}\n${entry.tags}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  totalEntries: 0,
  revision: 0,
  queryStageId: null,
  searchQuery: '',
  loading: false,
  loadError: false,
  loadEntries: async (stageId, limit = 50, offset = 0, append = false, searchQuery = '') => {
    const requestId = ++latestLoadRequest;
    const normalizedQuery = searchQuery.trim().slice(0, 120);
    set((state) => ({
      loading: true,
      loadError: false,
      entries: append ? state.entries : [],
      totalEntries: append ? state.totalEntries : 0,
    }));
    try {
      const [rows, totalEntries] = await Promise.all([
        normalizedQuery ? searchEntries(normalizedQuery, stageId, limit, offset) : getEntries(stageId, limit, offset),
        normalizedQuery ? getSearchEntryCount(normalizedQuery, stageId) : getEntryCount(stageId),
      ]);
      if (requestId !== latestLoadRequest) return;
      set((s) => ({
        entries: append ? [...s.entries, ...rows] : rows,
        totalEntries,
        queryStageId: append ? s.queryStageId : (stageId ?? null),
        searchQuery: append ? s.searchQuery : normalizedQuery,
        loadError: false,
        revision: s.revision + 1,
      }));
    } catch (error) {
      if (requestId === latestLoadRequest) {
        console.error(error);
        set({ loadError: true });
      }
    } finally {
      if (requestId === latestLoadRequest) set({ loading: false });
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
        const belongsToStage = state.queryStageId === null || state.queryStageId === e.stage_id;
        const belongsToQuery = created !== null
          && belongsToStage
          && (!state.searchQuery || entryMatchesQuery(created, state.searchQuery));
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
      set((s) => {
        const updatedEntries = s.entries.map(e => e.id === id ? { ...e, ...fields } as Entry : e);
        const filteredEntries = s.searchQuery
          ? updatedEntries.filter(entry => entryMatchesQuery(entry, s.searchQuery))
          : updatedEntries;
        return {
          entries: filteredEntries,
          totalEntries: filteredEntries.length < updatedEntries.length
            ? Math.max(0, s.totalEntries - 1)
            : s.totalEntries,
          revision: s.revision + 1,
        };
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
