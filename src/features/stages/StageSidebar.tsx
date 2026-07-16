import { useEffect } from 'react';
import { useStageStore } from '../../stores/useStageStore';

const STAGE_ICONS: Record<string, string> = {
  prep: '🌱', create: '✨', dev: '🗣️', mature: '🤝',
};
const STAGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  prep:  { bg: 'bg-emerald-50',  border: 'border-emerald-300', text: 'text-emerald-700' },
  create:{ bg: 'bg-amber-50',    border: 'border-amber-300',   text: 'text-amber-700' },
  dev:   { bg: 'bg-blue-50',     border: 'border-blue-300',    text: 'text-blue-700' },
  mature:{ bg: 'bg-purple-50',   border: 'border-purple-300',  text: 'text-purple-700' },
};

interface Props {
  onOpenStats: () => void;
}

export default function StageSidebar({ onOpenStats }: Props) {
  const { stages, activeStageId, setActiveStage, loadStages, unlock } = useStageStore();

  useEffect(() => { loadStages(); }, []);

  return (
    <aside className="w-56 bg-brand-50 border-r border-brand-200 flex flex-col shrink-0">
      <div className="p-4 pt-6">
        <div className="text-xs font-bold text-brand-400 mb-4 tracking-wider">阶段导航</div>
        <nav className="space-y-1">
          {stages.map((s) => {
            const isUnlocked = !!s.unlocked_at;
            const isActive = activeStageId === s.id;
            const colors = STAGE_COLORS[s.id] || { bg: '', border: '', text: '' };
            return (
              <button
                key={s.id}
                disabled={!isUnlocked}
                onClick={() => setActiveStage(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all
                  ${!isUnlocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-brand-100'}
                  ${isActive && isUnlocked ? `${colors.bg} ${colors.border} border shadow-sm font-semibold` : 'border border-transparent'}
                `}
              >
                <span className="text-base">{STAGE_ICONS[s.id]}</span>
                <span className={`flex-1 ${isActive ? colors.text : 'text-brand-800'}`}>{s.name}</span>
                {!isUnlocked && (
                  <span className="text-xs text-brand-300 cursor-pointer" onClick={(e) => { e.stopPropagation(); unlock(s.id); }}>🔓</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-brand-200">
        <button onClick={onOpenStats} className="w-full text-left text-xs text-brand-500 hover:text-brand-800 transition-colors">
          📊 时间统计
        </button>
      </div>
    </aside>
  );
}
