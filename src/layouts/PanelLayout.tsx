import StageSidebar from '../features/stages/StageSidebar';
import PrepPanel from '../features/stages/PrepPanel';
import CreationPanel from '../features/stages/CreationPanel';
import DevelopmentPanel from '../features/stages/DevelopmentPanel';
import MaturePanel from '../features/stages/MaturePanel';
import Card from '../components/ui/Card';
import { useStageStore } from '../stores/useStageStore';

interface Props { onOpenStats: () => void; }

export default function PanelLayout({ onOpenStats }: Props) {
  const { activeStageId } = useStageStore();
  const renderPanel = () => {
    switch (activeStageId) {
      case 'prep': return <PrepPanel />;
      case 'create': return <CreationPanel />;
      case 'dev': return <DevelopmentPanel />;
      case 'mature': return <MaturePanel />;
      default: return <div className="panel-page"><Card><p className="text-sm text-brand-500">选择或解锁一个阶段，继续这段旅程。</p></Card></div>;
    }
  };
  return <div className="grid h-full min-h-0 grid-cols-[76px_minmax(0,1fr)] sm:grid-cols-[248px_minmax(0,1fr)]"><StageSidebar onOpenStats={onOpenStats} /><main className="relative z-10 min-w-0 overflow-y-auto overscroll-contain">{renderPanel()}</main></div>;
}
