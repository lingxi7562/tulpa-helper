import { create } from 'zustand';
import { getEntries, createEntry, deleteEntry } from '../db/database';
import type { Entry, EntryType } from '../db/schema';

interface EntryState {
  entries: Entry[];
  loading: boolean;
  loadEntries: (stageId?: string) => Promise<void>;
  addEntry: (e: { stage_id: string; type: EntryType; title: string; content?: string; tags?: string; duration_seconds?: number; mood?: number }) => Promise<number>;
  removeEntry: (id: number) => Promise<void>;
}

export const useEntryStore = create<EntryState>((set) => ({
  entries: [],
  loading: false,
  loadEntries: async (stageId) => {
    set({ loading: true });
    const rows: any[] = await getEntries(stageId);
    set({ entries: rows, loading: false });
  },
  addEntry: async (e) => {
    const id = await createEntry(e);
    return id;
  },
  removeEntry: async (id) => {
    await deleteEntry(id);
  },
}));
