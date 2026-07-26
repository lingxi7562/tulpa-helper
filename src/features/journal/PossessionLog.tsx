import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getEntriesByTag } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import type { Entry } from '../../db/schema';

const BODY_PARTS = ['手部', '手臂', '头部', '全身', '其他'];

interface Props { onSaved?: () => void; }

export default function PossessionLog({ onSaved }: Props) {
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const [logs, setLogs] = useState<Entry[]>([]);
  const [part, setPart] = useState('手部');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await getEntriesByTag(activeStageId, 'practice', 'possession');
      setLogs(rows);
    } catch (error) { console.error(error); }
  }, [activeStageId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!notes.trim() || saving) return;
    setSaving(true);
    try {
      const content = notes.trim();
      await addEntry({
        stage_id: activeStageId,
        type: 'practice',
        title: `附身练习 · ${part}`,
        content,
        tags: JSON.stringify(['possession', `part:${part}`]),
      });
      setNotes('');
      await load();
      onSaved?.();
    } catch (error) { console.error(error); }
    finally { setSaving(false); }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div><h3 className="font-black text-brand-900">附身练习</h3><p className="mt-1 text-xs leading-6 text-brand-400">收集合作与控制练习的进展。</p></div>
        <Badge variant="mature">{logs.length} 次</Badge>
      </div>
      {logs.length > 0 && (
        <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
          {logs.slice(0, 8).map(log => (
            <div key={log.id} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-brand-700">{log.title}</p>
                <span className="text-[10px] text-purple-400">{log.created_at?.slice(5, 16)}</span>
              </div>
              {log.content && <p className="mt-1 text-xs leading-5 text-brand-600">{log.content}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
        <div className="flex flex-wrap gap-1.5">
          {BODY_PARTS.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => !saving && setPart(p)}
              disabled={saving}
              aria-pressed={part === p}
              className={`min-h-8 rounded-full px-3 py-1 text-xs font-bold transition-all disabled:opacity-50 ${part === p ? 'bg-purple-500 text-white' : 'border border-brand-200 bg-white text-brand-500 hover:border-purple-300'}`}
            >{p}</button>
          ))}
        </div>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="练习部位与进展…" disabled={saving} className="min-h-16" />
        <Button size="sm" onClick={handleSave} disabled={!notes.trim() || saving}>{saving ? '保存中…' : '记录'}</Button>
        <p className="mt-2 text-[10px] leading-relaxed text-amber-600">
          ⚠ 若出现持续不真实感、失控感或日常功能受影响，请暂停练习并寻求专业帮助。
        </p>
      </div>
    </Card>
  );
}
