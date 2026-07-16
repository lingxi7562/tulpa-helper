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
        <div className="h-screen flex flex-col">
          <header className="h-14 bg-white border-b border-brand-200 flex items-center px-6 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-900 rounded-md flex items-center justify-center text-white text-xs font-bold">T</div>
              <span className="font-semibold text-brand-900">Tulpa Helper</span>
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
      <div className="h-screen flex flex-col">
        <header className="h-14 bg-white border-b border-brand-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-900 rounded-md flex items-center justify-center text-white text-xs font-bold">T</div>
            <span className="font-semibold text-brand-900">Tulpa Helper</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-brand-100 p-1 rounded-lg">
              {(['panel', 'timeline'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    view === v ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500 hover:text-brand-900'
                  }`}
                >
                  {v === 'panel' ? '📋 面板' : '📅 时间线'}
                </button>
              ))}
            </div>
            <FocusTimer compact />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          {view === 'panel' ? <PanelLayout onOpenStats={() => setShowStats(true)} /> : <TimelineLayout />}
        </div>
      </div>
      {message && <Toast message={message} onClose={hide} />}
    </>
  );
}

export default App;
