import { create } from 'zustand';

const TULPA_NAME_KEY = 'tulpa-name';

function loadTulpaName(): string {
  try { return localStorage.getItem(TULPA_NAME_KEY)?.trim() || ''; }
  catch { return ''; }
}

interface ProfileState {
  tulpaName: string;
  setTulpaName: (name: string) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  tulpaName: loadTulpaName(),
  setTulpaName: (name) => {
    const trimmed = name.trim();
    try {
      if (trimmed) localStorage.setItem(TULPA_NAME_KEY, trimmed);
      else localStorage.removeItem(TULPA_NAME_KEY);
    } catch { /* noop */ }
    set({ tulpaName: trimmed });
  },
}));
