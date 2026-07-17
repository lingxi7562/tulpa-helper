import { useEffect } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { useToast } from '../../hooks/useToast';
import type { EntryType } from '../../db/schema';

interface Props {
  compact?: boolean;
  sessionTypes?: { label: string; value: string }[];
  onComplete?: () => void;
}

export default function FocusTimer({ compact, sessionTypes, onComplete }: Props) {
  const { timeLeft, isRunning, sessionType, startTimer, pauseTimer, resetTimer, tick, setSessionType } = useTimerStore();
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const { show } = useToast();

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, timeLeft, tick]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      const completeSession = async () => {
        pauseTimer();
        try {
          await addEntry({
            stage_id: activeStageId,
            type: sessionType as EntryType,
            title: `${sessionType} 完成`,
            duration_seconds: 25 * 60,
            content: `番茄钟完成：${sessionType}`,
          });
          show('番茄钟完成！');
          onComplete?.();
        } catch (e) {
          console.error(e);
        } finally {
          resetTimer(25 * 60);
        }
      };
      completeSession();
    }
  }, [timeLeft, isRunning]);

  const types = sessionTypes || [
    { label: 'Narration', value: 'narration' },
    { label: 'Active Forcing', value: 'session' },
  ];

  const format = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = Math.max(0, Math.min(100, (timeLeft / (25 * 60)) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-200/70 bg-white/70 px-2.5 py-2 text-xs shadow-sm backdrop-blur-sm sm:px-3">
        <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'animate-pulse bg-stage-create' : 'bg-brand-300'}`} />
        <span className="hidden font-medium text-brand-500 sm:inline">专注</span>
        <span className="font-bold tabular-nums text-brand-800">{format(timeLeft)}</span>
        {isRunning ? (
          <button onClick={pauseTimer} className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 font-semibold text-brand-700 transition hover:bg-brand-200">Ⅱ</button>
        ) : (
          <button onClick={startTimer} className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-900 pl-0.5 text-[9px] font-semibold text-white transition hover:bg-brand-700">▶</button>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(74,63,50,0.09)] backdrop-blur-sm sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-stage-create/10 blur-3xl" />
      <div className="mb-7 flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-brand-200/60 bg-brand-100/70 p-1.5 shadow-inner">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setSessionType(t.value as EntryType)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300 ${
              sessionType === t.value ? 'bg-white text-brand-900 shadow-[0_4px_12px_rgba(74,63,50,0.1)]' : 'text-brand-500 hover:text-brand-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="relative mb-7 flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-[0_16px_40px_rgba(74,63,50,0.14)]">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 176 176" aria-hidden="true">
          <circle cx="88" cy="88" r="80" fill="none" stroke="#EAE4D6" strokeWidth="9" />
          <circle cx="88" cy="88" r="80" fill="none" stroke="#6B5D4A" strokeWidth="9" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-[9px] rounded-full bg-gradient-to-br from-white to-brand-50" />
        <div className={`absolute inset-5 rounded-full border border-brand-200/60 ${isRunning ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`} />
        <div className="relative text-center">
          <div className="text-[10px] font-bold tracking-[0.2em] text-brand-400">沉浸专注</div>
          <div className="mt-1 text-4xl font-bold tracking-[-0.06em] text-brand-900 tabular-nums">{format(timeLeft)}</div>
          <div className="mt-1 text-[10px] text-brand-400">{isRunning ? '保持呼吸，留在此刻' : '准备好便开始吧'}</div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => isRunning ? pauseTimer() : startTimer()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-900 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,63,50,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(74,63,50,0.28)] active:scale-95"
        >
          {isRunning ? '⏸ 暂停' : '▶ 开始'}
        </button>
        <button
          onClick={() => resetTimer(25 * 60)}
          className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-3.5 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100"
        >
          重置
        </button>
      </div>
    </div>
  );
}
