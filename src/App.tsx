import { useState } from 'react';
import FocusTimer from './features/forcing/FocusTimer';
import StatsPanel from './features/stats/StatsPanel';
import PanelLayout from './layouts/PanelLayout';
import TimelineLayout from './layouts/TimelineLayout';
import Toast from './components/ui/Toast';
import { useToast } from './hooks/useToast';

type ViewMode = 'panel' | 'timeline';

function App() {
  const [view, setView] = useState<ViewMode>('panel');
  const [showStats, setShowStats] = useState(false);
  const { message, hide } = useToast();

  if (showStats) {
    return (
      <>
        <div className="flex h-screen flex-col overflow-hidden bg-brand-50">
          <header className="z-30 flex h-[72px] shrink-0 items-center border-b border-white/70 bg-brand-50/80 px-5 shadow-[0_8px_30px_rgba(74,63,50,0.05)] backdrop-blur-xl sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-sm font-bold text-white shadow-[0_8px_20px_rgba(74,63,50,0.22)]">T</div>
              <div>
                <span className="block text-sm font-bold tracking-[0.08em] text-brand-900">TULPA HELPER</span>
                <span className="block text-[10px] tracking-[0.18em] text-brand-400">与你并肩的每一天</span>
              </div>
            </div>
          </header>
          <StatsPanel onClose={() => setShowStats(false)} />
        </div>
        {message && <Toast message={message} onClose={hide} />}
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden bg-brand-50">
        <header className="z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-white/70 bg-brand-50/80 px-4 shadow-[0_8px_30px_rgba(74,63,50,0.05)] backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-sm font-bold text-white shadow-[0_8px_20px_rgba(74,63,50,0.22)]">T</div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold tracking-[0.08em] text-brand-900">TULPA HELPER</span>
              <span className="block text-[10px] tracking-[0.18em] text-brand-400">与你并肩的每一天</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="flex rounded-2xl border border-brand-200/70 bg-brand-100/70 p-1 shadow-inner">
              {(['panel', 'timeline'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 sm:px-4 ${
                    view === v ? 'bg-white text-brand-900 shadow-[0_4px_14px_rgba(74,63,50,0.1)]' : 'text-brand-500 hover:bg-white/50 hover:text-brand-900'
                  }`}
                >
                  {v === 'panel' ? '◫ 面板' : '⌁ 时间线'}
                </button>
              ))}
            </div>
            <FocusTimer compact />
          </div>
        </header>
        <div className="relative flex-1 overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(circle_at_82%_8%,rgba(212,201,179,0.25),transparent_30%),radial-gradient(circle_at_18%_90%,rgba(245,158,11,0.06),transparent_26%)]">
          {view === 'panel' ? <PanelLayout onOpenStats={() => setShowStats(true)} /> : <TimelineLayout />}
        </div>
      </div>
      {message && <Toast message={message} onClose={hide} />}
    </>
  );
}

export default App;
