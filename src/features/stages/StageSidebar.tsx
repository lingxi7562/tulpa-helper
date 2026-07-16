import { useEffect } from 'react';
import { useStageStore } from '../../stores/useStageStore';
import { STAGES } from '../../constants/stages';

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
            const stageInfo = STAGES[s.id as keyof typeof STAGES];
            const colors = stageInfo || { bg: '', border: '', text: '' };
            return (
              <button
                key={s.id}
                onClick={async () => {
                  if (!isUnlocked) await unlock(s.id);
                  setActiveStage(s.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all
                  ${!isUnlocked ? 'opacity-40 cursor-pointer' : 'hover:bg-brand-100'}
                  ${isActive && isUnlocked ? `${colors.bg} ${colors.border} border shadow-sm font-semibold` : 'border border-transparent'}
                `}
              >
                <span className="text-base">{stageInfo?.icon}</span>
                <span className={`flex-1 ${isActive ? colors.text : 'text-brand-800'}`}>{s.name}</span>
                {!isUnlocked && <span className="text-xs text-brand-300">🔒</span>}
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
