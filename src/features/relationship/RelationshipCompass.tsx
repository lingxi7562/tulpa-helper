import { useEffect, useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { useTimerStore } from '../../stores/useTimerStore';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';

type Pace = 'steady' | 'light' | 'pause';
type CheckInValue = 'comfortable' | 'uncertain' | 'overwhelmed';

interface CompassState {
  pace: Pace;
  willingness: CheckInValue;
  comfort: CheckInValue;
  pauseSignal: string;
  lastCheckInAt: string | null;
}

const STORAGE_KEY = 'relationship-compass-v1';
const DEFAULT_STATE: CompassState = {
  pace: 'steady',
  willingness: 'comfortable',
  comfort: 'comfortable',
  pauseSignal: '暂停一下',
  lastCheckInAt: null,
};

const PACE_OPTIONS: { value: Pace; label: string; hint: string }[] = [
  { value: 'steady', label: '按原计划', hint: '保持轻松节奏' },
  { value: 'light', label: '轻量进行', hint: '缩短或降低要求' },
  { value: 'pause', label: '暂停一下', hint: '先回到当下' },
];

const CHECK_IN_OPTIONS: { value: CheckInValue; label: string }[] = [
  { value: 'comfortable', label: '比较自在' },
  { value: 'uncertain', label: '有些摇摆' },
  { value: 'overwhelmed', label: '需要停一下' },
];

function loadState(): CompassState {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<CompassState>;
    return {
      ...DEFAULT_STATE,
      ...stored,
      pace: stored.pace === 'light' || stored.pace === 'pause' ? stored.pace : DEFAULT_STATE.pace,
      willingness: stored.willingness === 'uncertain' || stored.willingness === 'overwhelmed' ? stored.willingness : DEFAULT_STATE.willingness,
      comfort: stored.comfort === 'uncertain' || stored.comfort === 'overwhelmed' ? stored.comfort : DEFAULT_STATE.comfort,
      pauseSignal: typeof stored.pauseSignal === 'string' && stored.pauseSignal.trim() ? stored.pauseSignal.trim().slice(0, 40) : DEFAULT_STATE.pauseSignal,
      lastCheckInAt: typeof stored.lastCheckInAt === 'string' && !Number.isNaN(Date.parse(stored.lastCheckInAt)) ? stored.lastCheckInAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: CompassState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* local persistence is optional; the check-in can still be saved to SQLite */ }
}

function optionClass(selected: boolean) {
  return selected
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200'
    : 'border-brand-200 bg-white text-brand-600 hover:border-brand-300 hover:bg-brand-50';
}

export default function RelationshipCompass() {
  const [state, setState] = useState<CompassState>(() => loadState());
  const [note, setNote] = useState('');
  const [showGrounding, setShowGrounding] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const timerPhase = useTimerStore(timer => timer.phase);
  const pauseTimer = useTimerStore(timer => timer.pauseTimer);
  const showToast = useToast(toast => toast.show);

  useEffect(() => { saveState(state); }, [state]);

  const update = <K extends keyof CompassState>(key: K, value: CompassState[K]) => {
    setState(previous => ({ ...previous, [key]: value }));
  };

  const markPause = () => {
    update('pace', 'pause');
    if (timerPhase === 'running') pauseTimer();
    showToast('已标记暂停：先照顾当下，再决定是否继续。');
  };

  const saveCheckIn = async () => {
    if (saving) return;
    setSaving(true);
    const checkedAt = new Date().toISOString();
    try {
      const lines = [
        `节奏：${PACE_OPTIONS.find(option => option.value === state.pace)?.label ?? '按原计划'}`,
        `继续意愿：${CHECK_IN_OPTIONS.find(option => option.value === state.willingness)?.label ?? '比较自在'}`,
        `相处感受：${CHECK_IN_OPTIONS.find(option => option.value === state.comfort)?.label ?? '比较自在'}`,
        `暂停信号：${state.pauseSignal.trim() || DEFAULT_STATE.pauseSignal}`,
        note.trim() ? `备注：${note.trim()}` : '备注：无',
      ];
      await addEntry({
        stage_id: activeStageId,
        type: 'practice',
        title: '关系罗盘自检',
        content: lines.join('\n'),
        tags: JSON.stringify(['relationship-compass', 'check-in']),
      });
      setState(previous => ({ ...previous, lastCheckInAt: checkedAt }));
      setNote('');
      showToast('已保存这次自检；它是观察记录，不是评分。');
    } catch (error) {
      console.error(error);
      showToast('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverable={false} className="border-purple-200/70 bg-gradient-to-br from-purple-50/70 via-white to-brand-50/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="neutral">关系罗盘</Badge>
          <h3 className="mt-3 font-black text-brand-900">先照顾关系里的安全感</h3>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-brand-500">
            把体验当作体验来记录，不必急着证明它是什么。练习可以调整、暂停或结束；你的现实生活、安全与自主选择始终优先。
          </p>
        </div>
        {state.lastCheckInAt && <span className="shrink-0 text-[10px] text-brand-400">上次自检 {new Date(state.lastCheckInAt).toLocaleDateString('zh-CN')}</span>}
      </div>

      <div className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-brand-700">今天想用什么节奏？</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {PACE_OPTIONS.map(option => (
              <button key={option.value} type="button" onClick={() => update('pace', option.value)} className={`rounded-xl border px-3 py-2 text-left transition ${optionClass(state.pace === option.value)}`} aria-pressed={state.pace === option.value}>
                <span className="block text-xs font-bold">{option.label}</span>
                <span className="mt-1 block text-[10px] opacity-75">{option.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-xs font-bold text-brand-700">我愿意继续吗？</legend>
            <div className="flex flex-wrap gap-2">
              {CHECK_IN_OPTIONS.map(option => <button key={option.value} type="button" onClick={() => update('willingness', option.value)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${optionClass(state.willingness === option.value)}`} aria-pressed={state.willingness === option.value}>{option.label}</button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-bold text-brand-700">此刻相处感觉如何？</legend>
            <div className="flex flex-wrap gap-2">
              {CHECK_IN_OPTIONS.map(option => <button key={option.value} type="button" onClick={() => update('comfort', option.value)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${optionClass(state.comfort === option.value)}`} aria-pressed={state.comfort === option.value}>{option.label}</button>)}
            </div>
          </fieldset>
        </div>

        <Input label="约定的暂停信号" value={state.pauseSignal} onChange={event => update('pauseSignal', event.target.value)} maxLength={40} hint="可以是一句话、一个手势，或只是关掉练习。" />
        <Textarea label="可选备注" value={note} onChange={event => setNote(event.target.value)} maxLength={1000} placeholder="今天发生了什么？只写你愿意留下的部分。" className="min-h-20" />

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={saveCheckIn} disabled={saving}>{saving ? '保存中…' : '保存这次自检'}</Button>
          <Button size="sm" variant="secondary" onClick={markPause} disabled={state.pace === 'pause' && timerPhase !== 'running'}>现在暂停</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowGrounding(value => !value)} aria-expanded={showGrounding}>{showGrounding ? '收起回到当下' : '需要回到当下？'}</Button>
        </div>

        {showGrounding && (
          <div className="rounded-2xl border border-purple-100 bg-white/80 p-4 text-xs leading-6 text-brand-600">
            <p className="font-bold text-brand-800">一个简单的回到当下练习</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>双脚触地，慢慢呼气，看看周围的光线和物体。</li>
              <li>说出你看到的 5 件、触到的 4 件、听到的 3 件事。</li>
              <li>喝口水、伸展一下，再决定今天是否继续。</li>
            </ol>
            <p className="mt-3 text-[10px] text-brand-400">如果体验持续造成明显痛苦、影响日常功能或带来安全风险，请暂停练习并联系可信任的人或专业支持。</p>
          </div>
        )}
      </div>
    </Card>
  );
}
