import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getEntriesByType } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import type { Entry } from '../../db/schema';

interface Props { onSaved?: () => void; }

export default function SwitchingLog({ onSaved }: Props) {
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const [logs, setLogs] = useState<Entry[]>([]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await getEntriesByType(activeStageId, 'switch');
      setLogs(rows);
    } catch (error) { console.error(error); }
  }, [activeStageId]);

  useEffect(() => { load(); }, [load]);

  const parsedDuration = Number(duration);
  const durationValid = Number.isFinite(parsedDuration) && Number.isInteger(parsedDuration) && parsedDuration > 0;

  const handleSave = async () => {
    if (!durationValid || saving) return;
    setSaving(true);
    try {
      const mins = parsedDuration;
      await addEntry({
        stage_id: activeStageId,
        type: 'switch',
        title: `换位练习 · ${mins} 分钟`,
        content: notes.trim(),
        duration_seconds: mins * 60,
      });
      setDuration('');
      setNotes('');
      await load();
      onSaved?.();
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h3 className="font-black text-brand-900">换位练习</h3><p className="mt-1 text-xs leading-6 text-brand-400">记录每一次视角交换的体验。</p></div>
        <Badge variant="mature">{logs.length} 次</Badge>
      </div>
      {logs.length > 0 && (
        <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
          {(showAll ? logs : logs.slice(0, 8)).map(log => (
            <div key={log.id} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-brand-700">{log.title}</p>
                <span className="text-[10px] text-purple-400">{log.created_at?.slice(5, 16)}</span>
              </div>
              {log.content && <p className="mt-1 text-xs leading-5 text-brand-600">{log.content}</p>}
            </div>
          ))}
          {logs.length > 8 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full rounded-xl border border-dashed border-purple-200 py-1.5 text-[10px] font-bold text-purple-500 hover:bg-purple-50"
            >
              {showAll ? '收起' : `查看更多（还有 ${logs.length - 8} 条）`}
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
        <div className="flex items-center gap-2">
          <Input value={duration} onChange={e => setDuration(e.target.value)} placeholder="持续时长" type="number" min={1} step={1} disabled={saving} className="w-40" />
          <span className="text-xs text-brand-400">分钟</span>
        </div>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="练习感受…" disabled={saving} className="min-h-16" />
        <Button size="sm" onClick={handleSave} disabled={!durationValid || saving}>{saving ? '保存中…' : '记录'}</Button>
        <p className="mt-2 text-[10px] leading-relaxed text-amber-600">
          ⚠ 若出现持续不真实感、失控感或日常功能受影响，请暂停练习并寻求专业帮助。
        </p>
      </div>
    </Card>
  );
}
