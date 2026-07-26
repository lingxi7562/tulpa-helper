import { useState } from 'react';
import FocusTimer from './features/forcing/FocusTimer';
import StatsPanel from './features/stats/StatsPanel';
import PanelLayout from './layouts/PanelLayout';
import TimelineLayout from './layouts/TimelineLayout';
import Toast from './components/ui/Toast';
import Button from './components/ui/Button';
import { useToast } from './hooks/useToast';
import MilestoneCelebrate from './features/stats/MilestoneCelebrate';
import { useMilestoneStore } from './stores/useMilestoneStore';

type ViewMode = 'panel' | 'timeline';

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-brand-900 text-sm font-black text-white shadow-[0_9px_22px_rgba(63,57,49,.2)]">T</div>
      <div className="hidden min-w-0 sm:block">
        <span className="block truncate text-[13px] font-black tracking-[.12em] text-brand-900">TULPA HELPER</span>
        <span className="block truncate text-[10px] tracking-[.16em] text-brand-400">与你并肩的每一天</span>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<ViewMode>('panel');
  const [showStats, setShowStats] = useState(false);
  const { message, hide } = useToast();
  const celebrationLevel = useMilestoneStore(s => s.level);
  const dismissCelebration = useMilestoneStore(s => s.dismiss);

  return (
    <>
      <div className="app-surface grid h-dvh grid-rows-[72px_minmax(0,1fr)] overflow-hidden">
        <header className="relative z-50 flex h-[72px] items-center justify-between border-b border-brand-200/75 bg-[#fdfbf7]/85 px-4 shadow-[0_8px_28px_rgba(63,57,49,.045)] backdrop-blur-xl sm:px-7">
          <Brand />
          {!showStats && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center rounded-full border border-brand-200 bg-brand-100/75 p-1 shadow-inner">
                <Button variant={view === 'panel' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('panel')} className={view === 'panel' ? 'border-white bg-white' : ''}>◫ <span className="hidden sm:inline">面板</span></Button>
                <Button variant={view === 'timeline' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('timeline')} className={view === 'timeline' ? 'border-white bg-white' : ''}>⌁ <span className="hidden sm:inline">时间线</span></Button>
              </div>
              <FocusTimer compact />
            </div>
          )}
          {showStats && <span className="rounded-full bg-brand-100 px-3 py-1.5 text-[11px] font-bold text-brand-500">时间统计</span>}
        </header>
        <div className="relative z-10 min-h-0 overflow-hidden">
          {showStats ? <StatsPanel onClose={() => setShowStats(false)} /> : view === 'panel' ? <PanelLayout onOpenStats={() => setShowStats(true)} /> : <TimelineLayout />}
        </div>
      </div>
      {message && <Toast message={message} onClose={hide} />}
      {celebrationLevel !== null && (
        <MilestoneCelebrate level={celebrationLevel} onClose={dismissCelebration} />
      )}
    </>
  );
}

export default App;
