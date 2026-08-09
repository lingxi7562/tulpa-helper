import { useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

type ResponseOrigin = 'constructed' | 'spontaneous' | 'uncertain';

const ORIGIN_OPTIONS: readonly { value: ResponseOrigin; label: string; hint: string }[] = [
  { value: 'constructed', label: '主动构造', hint: '我有意给出或练习这个回应' },
  { value: 'spontaneous', label: '自发出现', hint: '回应没有经过刻意安排就出现' },
  { value: 'uncertain', label: '不确定', hint: '先记录，不判断来源' },
];

export default function SignalInput() {
  const [text, setText] = useState('');
  const [origin, setOrigin] = useState<ResponseOrigin>('uncertain');
  const [saving, setSaving] = useState(false);
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const showToast = useToast(state => state.show);

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await addEntry({
        stage_id: activeStageId,
        type: 'signal',
        title: `${ORIGIN_OPTIONS.find(option => option.value === origin)?.label ?? '不确定'} · ${text.trim().slice(0, 42)}`,
        content: text.trim(),
        tags: JSON.stringify(['response-signal', `origin:${origin}`]),
      });
      setText('');
      setOrigin('uncertain');
      showToast('回应迹象已保存；标签只是描述，不是结论');
    } catch (error) {
      console.error(error);
      showToast('回应迹象保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5">
        <h3 className="font-black text-brand-900">回应迹象</h3>
        <p className="mt-1 text-xs leading-6 text-brand-400">记录那些微小的体验——head pressure、情绪波动、莫名念头……它们可能来自注意力、情绪、身体或关系互动；先观察，不必马上下结论。主动构造和自发出现都可以记录，不存在“必须选对”的答案。</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-3">
        <fieldset>
          <legend className="mb-2 text-[10px] font-bold text-brand-600">这次回应更接近哪种描述？</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ORIGIN_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setOrigin(option.value)}
                aria-pressed={origin === option.value}
                className={`rounded-xl border px-3 py-2 text-left transition ${origin === option.value ? 'border-sky-300 bg-sky-100 text-sky-900 ring-1 ring-sky-200' : 'border-brand-200 bg-white text-brand-600 hover:border-sky-200 hover:bg-sky-50'}`}
              >
                <span className="block text-xs font-bold">{option.label}</span>
                <span className="mt-1 block text-[10px] leading-5 opacity-75">{option.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="刚才好像感觉到……"
          className="min-h-24"
          disabled={saving}
        />
        <Button size="sm" onClick={handleSave} disabled={!text.trim() || saving}>
          {saving ? '保存中…' : '记录迹象'}
        </Button>
      </div>
    </Card>
  );
}
