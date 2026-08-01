import { useEffect } from 'react';
import { useTimerStore } from '../../stores/useTimerStore';
import { useStageStore } from '../../stores/useStageStore';
import { getSessionTypeLabel, SESSION_TYPES_BY_STAGE, type StageId } from '../../constants/stages';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import IconButton from '../../components/ui/IconButton';

interface Props {
  compact?: boolean;
}

const DURATION_OPTIONS = [15, 25, 30, 50];

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function FocusTimer({ compact = false }: Props) {
  const {
    phase,
    timeLeft,
    isRunning,
    sessionType,
    durationMinutes,
    activeRun,
    startTimer,
    pauseTimer,
    resetTimer,
    setSessionType,
    setDurationMinutes,
  } = useTimerStore();
  const activeStageId = useStageStore(state => state.activeStageId) as StageId;
  const stageTypes = SESSION_TYPES_BY_STAGE[activeStageId] ?? SESSION_TYPES_BY_STAGE.prep;
  const controlsLocked = phase !== 'idle';

  useEffect(() => {
    if (phase !== 'idle' || stageTypes.some(option => option.value === sessionType)) return;
    setSessionType(stageTypes[0].value);
  }, [phase, sessionType, setSessionType, stageTypes]);

  const handleStart = () => startTimer({
    stageId: activeStageId,
    completionMode: compact ? 'auto' : 'prompt',
  });

  const shownType = activeRun?.sessionType ?? sessionType;
  const types = activeRun && !stageTypes.some(option => option.value === activeRun.sessionType)
    ? [{ label: getSessionTypeLabel(activeRun.stageId, activeRun.sessionType), value: activeRun.sessionType }, ...stageTypes]
    : stageTypes;
  const totalSeconds = activeRun?.durationSeconds ?? durationMinutes * 60;
  const progress = Math.max(0, Math.min(100, (timeLeft / totalSeconds) * 100));
  const actionLabel = isRunning ? '暂停' : phase === 'paused' ? '继续' : phase === 'saving' ? '保存中' : phase === 'completed' ? '待保存' : '开始';

  if (compact) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-full border border-brand-200 bg-white/75 px-2 pl-3 shadow-sm backdrop-blur-sm">
        <span className={`h-2 w-2 rounded-full ${isRunning ? 'animate-pulse bg-amber-500' : phase === 'paused' ? 'bg-amber-400' : 'bg-brand-300'}`} />
        <span className="hidden text-[11px] font-bold text-brand-500 md:inline">专注</span>
        <span className="text-xs font-black tabular-nums text-brand-900">{formatTime(timeLeft)}</span>
        <IconButton
          label={actionLabel}
          icon={isRunning ? 'Ⅱ' : '▶'}
          size="sm"
          variant={isRunning ? 'light' : 'dark'}
          onClick={isRunning ? pauseTimer : handleStart}
          disabled={phase === 'completed' || phase === 'saving'}
          className="!h-7 !w-7 !text-[9px]"
        />
      </div>
    );
  }

  return (
    <Card hoverable={false} className="relative" padding="lg">
      <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="relative flex flex-col items-center">
        <div className="mb-7 flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand-200 bg-brand-100/70 p-1">
          {types.map(type => (
            <Button
              key={type.value}
              variant={shownType === type.value ? 'secondary' : 'ghost'}
              size="sm"
              disabled={controlsLocked}
              onClick={() => setSessionType(type.value)}
              className={`whitespace-nowrap ${shownType === type.value ? '!border-white !bg-white' : ''}`}
            >
              {type.label}
            </Button>
          ))}
        </div>
        <div className="relative mb-7 grid h-48 w-48 place-items-center rounded-full bg-white shadow-[0_18px_45px_rgba(63,57,49,.13)]">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 192 192" aria-hidden="true">
            <circle cx="96" cy="96" r="87" fill="none" stroke="#EAE4D6" strokeWidth="8" />
            <circle cx="96" cy="96" r="87" fill="none" stroke="#5C4F3C" strokeWidth="8" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress} className="transition-all duration-700" />
          </svg>
          <div className={`absolute inset-6 rounded-full border border-brand-200/60 ${isRunning ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`} />
          <div className="relative text-center">
            <p className="eyebrow">沉浸专注</p>
            <strong className="mt-1 block text-4xl tracking-[-.06em] text-brand-900 tabular-nums">{formatTime(timeLeft)}</strong>
            <p className="mt-1 text-[10px] text-brand-400">{isRunning ? '保持呼吸，留在此刻' : phase === 'paused' ? '已暂停，按自己的节奏继续' : '准备好便开始吧'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            size="lg"
            onClick={isRunning ? pauseTimer : handleStart}
            icon={isRunning ? 'Ⅱ' : '▶'}
            disabled={phase === 'completed' || phase === 'saving'}
          >
            {actionLabel}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => resetTimer()} disabled={phase === 'completed' || phase === 'saving'}>重置</Button>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px] text-brand-400">时长</span>
          {DURATION_OPTIONS.map(minutes => (
            <button
              key={minutes}
              onClick={() => setDurationMinutes(minutes)}
              disabled={controlsLocked}
              className={`min-h-7 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all disabled:opacity-30 ${durationMinutes === minutes ? 'bg-brand-900 text-white' : 'text-brand-500 hover:text-brand-800'}`}
            >
              {minutes}′
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
