import { useEffect } from 'react';
import { useStageStore } from '../../stores/useStageStore';
import { STAGES } from '../../constants/stages';
import Button from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';

interface Props { onOpenStats: () => void; onNavigate?: () => void; }

export default function StageSidebar({ onOpenStats, onNavigate }: Props) {
  const { stages, activeStageId, setActiveStage, loadStages, unlock, loading, loadError } = useStageStore();
  const showToast = useToast(state => state.show);
  useEffect(() => { loadStages(); }, [loadStages]);

  const handleStageClick = (stageId: string, visited: boolean) => {
    setActiveStage(stageId);
    onNavigate?.();
    // 访问时间仍然写入，供备份和旅程回顾使用；它不是能力门槛。
    if (!visited) {
      void unlock(stageId).then(ok => {
        if (!ok) showToast('章节访问已打开，但访问时间未能保存');
      });
    }
  };

  return (
    <aside aria-busy={loading} className="relative z-40 flex min-h-0 w-full flex-col overflow-hidden border-r border-brand-200/80 bg-white/58 backdrop-blur-md">
      <div className="overflow-y-auto px-2 py-5 sm:px-4 sm:py-7">
        <div className="mb-4 hidden items-center gap-2 px-3 sm:flex"><span className="h-px w-5 bg-brand-300" /><span className="eyebrow">探索路径</span></div>
        {loadError && !loading && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/70 p-3">
            <p role="alert" className="text-[11px] font-bold leading-5 text-red-600">阶段列表加载失败。</p>
            <Button size="sm" variant="secondary" onClick={() => void loadStages()} className="mt-2 w-full">重试</Button>
          </div>
        )}
        <nav className="space-y-2" aria-label="探索章节">
          {stages.map((stage) => {
            const info = STAGES[stage.id as keyof typeof STAGES];
            const visited = !!stage.unlocked_at;
            const active = activeStageId === stage.id;
            return (
              <Button key={stage.id} variant="ghost" onClick={() => handleStageClick(stage.id, visited)} disabled={loading} aria-current={active ? 'page' : undefined} aria-label={stage.name} className={`relative h-auto w-full !justify-center !rounded-2xl !px-2 !py-3 sm:!justify-start sm:!px-3 ${active ? `${info?.bg} ${info?.text} ring-1 ring-inset ${info?.border} shadow-[0_8px_20px_rgba(63,57,49,.07)]` : 'text-brand-600'}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-lg shadow-sm">{info?.icon}</span>
                <span className="hidden min-w-0 flex-1 truncate text-left sm:block">{stage.name}</span>
              </Button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto border-t border-brand-200/70 p-2 sm:p-4"><Button variant="ghost" fullWidth onClick={onOpenStats} className="!justify-center !rounded-2xl sm:!justify-start" icon="◔"><span className="hidden sm:inline">时间统计</span></Button></div>
    </aside>
  );
}
