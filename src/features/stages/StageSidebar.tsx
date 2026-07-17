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
    <aside className="relative z-10 flex w-[76px] shrink-0 flex-col border-r border-brand-200/70 bg-white/55 backdrop-blur-sm sm:w-64">
      <div className="px-2 py-6 sm:px-5 sm:py-8">
        <div className="mb-5 hidden items-center gap-2 px-2 text-[10px] font-bold tracking-[0.24em] text-brand-400 sm:flex"><span className="h-px w-5 bg-brand-300" />成长旅程</div>
        <nav className="space-y-2">
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
                className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border px-2 py-3.5 text-left text-sm transition-all duration-300 sm:justify-start sm:px-4
                  ${!isUnlocked ? 'cursor-pointer opacity-40 grayscale' : 'hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_8px_24px_rgba(74,63,50,0.08)]'}
                  ${isActive && isUnlocked ? `${colors.bg} ${colors.border} font-semibold shadow-[0_10px_28px_rgba(74,63,50,0.1)] before:absolute before:bottom-2 before:left-0 before:top-2 before:w-1 before:rounded-r-full before:bg-current` : 'border-transparent'}
                `}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-lg shadow-sm transition-transform duration-300 group-hover:scale-110 ${isActive ? colors.text : ''}`}>{stageInfo?.icon}</span>
                <span className={`hidden flex-1 sm:block ${isActive ? colors.text : 'text-brand-800'}`}>{s.name}</span>
                {!isUnlocked && <span className="hidden text-[10px] text-brand-300 sm:block">锁定</span>}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-brand-200/70 p-2 sm:p-5">
        <button onClick={onOpenStats} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-transparent px-2 py-3 text-left text-xs font-semibold text-brand-500 transition-all hover:border-brand-200 hover:bg-white hover:text-brand-900 hover:shadow-sm sm:justify-start sm:px-4">
          <span className="text-base">◔</span><span className="hidden sm:inline">时间统计</span>
        </button>
      </div>
    </aside>
  );
}
