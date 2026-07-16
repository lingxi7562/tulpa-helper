import StageSidebar from '../features/stages/StageSidebar';
import PrepPanel from '../features/stages/PrepPanel';
import CreationPanel from '../features/stages/CreationPanel';
import { useStageStore } from '../stores/useStageStore';

interface Props {
  onOpenStats: () => void;
}

export default function PanelLayout({ onOpenStats }: Props) {
  const { activeStageId } = useStageStore();

  const renderPanel = () => {
    switch (activeStageId) {
      case 'prep': return <PrepPanel />;
      case 'create': return <CreationPanel />;
      case 'dev': return <p className="p-8 text-brand-400">发展期 — 待实现</p>;
      case 'mature': return <p className="p-8 text-brand-400">成熟期 — 待实现</p>;
      default: return <p className="p-8 text-brand-400">选择或解锁一个阶段</p>;
    }
  };

  return (
    <div className="flex h-full">
      <StageSidebar onOpenStats={onOpenStats} />
      <main className="flex-1 overflow-y-auto bg-brand-50">
        {renderPanel()}
      </main>
    </div>
  );
}
