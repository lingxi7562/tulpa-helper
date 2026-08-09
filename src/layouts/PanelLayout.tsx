import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPanel = () => {
    switch (activeStageId) {
      case 'prep': return <PrepPanel />;
      case 'create': return <CreationPanel />;
      case 'dev': return <DevelopmentPanel />;
      case 'mature': return <MaturePanel />;
      default: return <div className="panel-page"><Card><p className="text-sm text-brand-500">选择一个章节，继续这段旅程。</p></Card></div>;
    }
  };

  return (
    <div className="relative h-full min-h-0">
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="absolute left-3 top-3 z-30 grid h-10 w-10 place-items-center rounded-xl border border-brand-200 bg-white/90 shadow-sm backdrop-blur-sm sm:hidden"
        aria-label="打开导航"
      >
        <span className="text-base">☰</span>
      </button>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 z-40 bg-brand-900/30 backdrop-blur-sm sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 z-50 h-full w-64 animate-[pageEnter_.25s_var(--ease)_both] sm:hidden">
            <div className="relative h-full">
              <StageSidebar onOpenStats={() => { setSidebarOpen(false); onOpenStats(); }} onNavigate={() => setSidebarOpen(false)} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-brand-500 shadow-sm"
                aria-label="关闭导航"
              >×</button>
            </div>
          </div>
        </>
      )}

      {/* Single render — sidebar fixed on desktop, drawer on mobile */}
      <div className="flex h-full min-h-0">
        <div className="hidden h-full sm:block">
          <StageSidebar onOpenStats={onOpenStats} />
        </div>
        <main className="relative z-10 min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pt-14 sm:pt-0">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}
