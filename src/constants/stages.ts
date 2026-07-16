export const STAGES = {
  prep:  { id: 'prep',  name: '准备期', icon: '🌱', color: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  create:{ id: 'create', name: '创建期', icon: '✨', color: 'bg-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-700' },
  dev:   { id: 'dev',    name: '发展期', icon: '🗣️', color: 'bg-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-300',    text: 'text-blue-700' },
  mature:{ id: 'mature', name: '成熟期', icon: '🤝', color: 'bg-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-300',  text: 'text-purple-700' },
} as const;

export type StageId = keyof typeof STAGES;
