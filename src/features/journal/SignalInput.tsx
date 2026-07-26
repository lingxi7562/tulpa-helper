import { useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';

export default function SignalInput() {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();

  const handleSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await addEntry({
        stage_id: activeStageId,
        type: 'signal',
        title: text.trim().slice(0, 50),
        content: text.trim(),
      });
      setText('');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5">
        <h3 className="font-black text-brand-900">回应迹象</h3>
        <p className="mt-1 text-xs leading-6 text-brand-400">记录那些微小的信号——head pressure、情绪波动、莫名念头……它们可能正是 Ta 在尝试沟通。</p>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-3">
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
