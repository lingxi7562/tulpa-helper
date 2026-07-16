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

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-brand-400">{format(timeLeft)}</span>
        {isRunning ? (
          <button onClick={pauseTimer} className="text-brand-600 font-semibold">⏸</button>
        ) : (
          <button onClick={startTimer} className="text-brand-600 font-semibold">▶</button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <div className="flex gap-2 p-1 bg-brand-100 rounded-lg mb-6">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setSessionType(t.value as EntryType)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              sessionType === t.value ? 'bg-white shadow-sm text-brand-900' : 'text-brand-500 hover:text-brand-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="text-5xl font-bold tracking-tighter text-brand-900 mb-6 tabular-nums">
        {format(timeLeft)}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => isRunning ? pauseTimer() : startTimer()}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-900 text-white font-medium hover:bg-brand-800 transition-transform active:scale-95"
        >
          {isRunning ? '⏸ 暂停' : '▶ 开始'}
        </button>
        <button
          onClick={() => resetTimer(25 * 60)}
          className="px-6 py-3 rounded-full bg-brand-100 text-brand-800 font-medium hover:bg-brand-200 transition-colors"
        >
          重置
        </button>
      </div>
    </div>
  );
}
