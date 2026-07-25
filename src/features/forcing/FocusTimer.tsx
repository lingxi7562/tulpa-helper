import { useEffect } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { useToast } from '../../hooks/useToast';
import type { EntryType } from '../../db/schema';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import IconButton from '../../components/ui/IconButton';

interface Props { compact?: boolean; sessionTypes?: { label: string; value: string }[]; onComplete?: () => void; }

export default function FocusTimer({ compact, sessionTypes, onComplete }: Props) {
  const { timeLeft, isRunning, sessionType, startTimer, pauseTimer, resetTimer, tick, setSessionType } = useTimerStore();
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const { show } = useToast();

  useEffect(() => { if (!isRunning || timeLeft <= 0) return; const id = setInterval(tick, 1000); return () => clearInterval(id); }, [isRunning, timeLeft, tick]);
  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return;
    const completeSession = async () => {
      pauseTimer();
      try {
        await addEntry({ stage_id: activeStageId, type: sessionType as EntryType, title: `${sessionType} 完成`, duration_seconds: 25 * 60, content: `番茄钟完成：${sessionType}` });
        show('番茄钟完成！'); onComplete?.();
      } catch (error) { console.error(error); } finally { resetTimer(25 * 60); }
    };
    completeSession();
  }, [timeLeft, isRunning, activeStageId, sessionType, addEntry, show, onComplete, pauseTimer, resetTimer]);

  const types = sessionTypes || [{ label: 'Narration', value: 'narration' }, { label: 'Active Forcing', value: 'session' }];
  const format = (sec: number) => `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;
  const progress = Math.max(0, Math.min(100, (timeLeft / 1500) * 100));

  if (compact) return (
    <div className="flex h-10 items-center gap-2 rounded-full border border-brand-200 bg-white/75 px-2 pl-3 shadow-sm backdrop-blur-sm">
      <span className={`h-2 w-2 rounded-full ${isRunning ? 'animate-pulse bg-amber-500' : 'bg-brand-300'}`} />
      <span className="hidden text-[11px] font-bold text-brand-500 md:inline">专注</span><span className="text-xs font-black tabular-nums text-brand-900">{format(timeLeft)}</span>
      <IconButton label={isRunning ? '暂停' : '开始'} icon={isRunning ? 'Ⅱ' : '▶'} size="sm" variant={isRunning ? 'light' : 'dark'} onClick={isRunning ? pauseTimer : startTimer} className="!h-7 !w-7 !text-[9px]" />
    </div>
  );

  return (
    <Card hoverable={false} className="relative" padding="lg">
      <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <div className="mb-7 flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand-200 bg-brand-100/70 p-1">
          {types.map(type => <Button key={type.value} variant={sessionType === type.value ? 'secondary' : 'ghost'} size="sm" onClick={() => setSessionType(type.value as EntryType)} className={`whitespace-nowrap ${sessionType === type.value ? '!border-white !bg-white' : ''}`}>{type.label}</Button>)}
        </div>
        <div className="relative mb-7 grid h-48 w-48 place-items-center rounded-full bg-white shadow-[0_18px_45px_rgba(63,57,49,.13)]">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 192 192" aria-hidden="true"><circle cx="96" cy="96" r="87" fill="none" stroke="#EAE4D6" strokeWidth="8" /><circle cx="96" cy="96" r="87" fill="none" stroke="#5C4F3C" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} className="transition-all duration-700" /></svg>
          <div className={`absolute inset-6 rounded-full border border-brand-200/60 ${isRunning ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`} />
          <div className="relative text-center"><p className="eyebrow">沉浸专注</p><strong className="mt-1 block text-4xl tracking-[-.06em] text-brand-900 tabular-nums">{format(timeLeft)}</strong><p className="mt-1 text-[10px] text-brand-400">{isRunning ? '保持呼吸，留在此刻' : '准备好便开始吧'}</p></div>
        </div>
        <div className="flex gap-3"><Button size="lg" onClick={isRunning ? pauseTimer : startTimer} icon={isRunning ? 'Ⅱ' : '▶'}>{isRunning ? '暂停' : '开始'}</Button><Button size="lg" variant="secondary" onClick={() => resetTimer(1500)}>重置</Button></div>
      </div>
    </Card>
  );
}
