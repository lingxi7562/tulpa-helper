import { useState } from 'react';
import FocusTimer from './features/forcing/FocusTimer';
import StatsPanel from './features/stats/StatsPanel';
import PanelLayout from './layouts/PanelLayout';
import TimelineLayout from './layouts/TimelineLayout';
import Toast from './components/ui/Toast';
import Button from './components/ui/Button';
import { useToast } from './hooks/useToast';
import { useEntryStore } from './stores/useEntryStore';
import { useStageStore } from './stores/useStageStore';
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
  const { message, show, hide } = useToast();
  const celebrationLevel = useMilestoneStore(s => s.level);
  const dismissCelebration = useMilestoneStore(s => s.dismiss);
  const [showNarration, setShowNarration] = useState(false);
  const [narrationText, setNarrationText] = useState('');
  const [savingNarration, setSavingNarration] = useState(false);
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();

  const handleNarrationSave = async () => {
    if (!narrationText.trim() || savingNarration) return;
    setSavingNarration(true);
    try {
      await addEntry({
        stage_id: activeStageId,
        type: 'narration',
        title: narrationText.trim().slice(0, 50),
        content: narrationText.trim(),
      });
      show('叙述已记录');
      setNarrationText('');
      setShowNarration(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNarration(false);
    }
  };

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
              <div className="relative">
                <button
                  onClick={() => setShowNarration(!showNarration)}
                  className={`flex h-10 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold transition ${showNarration ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-brand-200 bg-white/75 text-brand-500 hover:text-brand-800'}`}
                  title="快速叙述"
                >
                  <span className="text-base leading-none">💬</span>
                  <span className="hidden sm:inline">叙述</span>
                </button>
                {showNarration && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-brand-200 bg-white p-3 shadow-lg">
                    <p className="mb-2 text-[10px] font-bold text-brand-400">随时随地，记下想对 Ta 说的话</p>
                    <textarea
                      autoFocus
                      value={narrationText}
                      onChange={e => setNarrationText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleNarrationSave();
                        }
                      }}
                      placeholder="今天的天气真好……"
                      className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs text-brand-700 placeholder:text-brand-300 focus:border-purple-400 focus:outline-none"
                      rows={3}
                      disabled={savingNarration}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-brand-400">Ctrl+Enter 保存</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setShowNarration(false); setNarrationText(''); }}
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold text-brand-400 hover:bg-brand-50"
                          disabled={savingNarration}
                        >取消</button>
                        <button
                          onClick={handleNarrationSave}
                          disabled={savingNarration || !narrationText.trim()}
                          className="rounded-full bg-purple-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-purple-700 disabled:opacity-40"
                        >{savingNarration ? '保存中…' : '保存'}</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
