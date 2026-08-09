import { create } from 'zustand';

const TULPA_NAME_KEY = 'tulpa-name';
const PRACTICE_FRAME_KEY = 'practice-frame';

export type PracticeFrame = 'undecided' | 'practice-first' | 'plurality' | 'spiritual';

export const PRACTICE_FRAME_OPTIONS: readonly { value: PracticeFrame; label: string; hint: string }[] = [
  { value: 'undecided', label: '暂不设定', hint: '先体验，再决定如何理解' },
  { value: 'practice-first', label: '以实践为主', hint: '关注互动、注意力与生活影响' },
  { value: 'plurality', label: '使用多元语言', hint: '可使用 host、headmate、switch 等词' },
  { value: 'spiritual', label: '灵性或象征', hint: '按自己的信念理解这段体验' },
];

function loadTulpaName(): string {
  try { return localStorage.getItem(TULPA_NAME_KEY)?.trim() || ''; }
  catch { return ''; }
}

function loadPracticeFrame(): PracticeFrame {
  try {
    const value = localStorage.getItem(PRACTICE_FRAME_KEY);
    return PRACTICE_FRAME_OPTIONS.some(option => option.value === value)
      ? value as PracticeFrame
      : 'undecided';
  } catch { return 'undecided'; }
}

interface ProfileState {
  tulpaName: string;
  practiceFrame: PracticeFrame;
  setTulpaName: (name: string) => void;
  setPracticeFrame: (frame: PracticeFrame) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  tulpaName: loadTulpaName(),
  practiceFrame: loadPracticeFrame(),
  setTulpaName: (name) => {
    const trimmed = name.trim();
    try {
      if (trimmed) localStorage.setItem(TULPA_NAME_KEY, trimmed);
      else localStorage.removeItem(TULPA_NAME_KEY);
    } catch { /* noop */ }
    set({ tulpaName: trimmed });
  },
  setPracticeFrame: (frame) => {
    const safeFrame = PRACTICE_FRAME_OPTIONS.some(option => option.value === frame) ? frame : 'undecided';
    try { localStorage.setItem(PRACTICE_FRAME_KEY, safeFrame); }
    catch { /* noop */ }
    set({ practiceFrame: safeFrame });
  },
}));
