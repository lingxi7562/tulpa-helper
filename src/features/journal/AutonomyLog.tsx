import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getAutonomyEntries } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import type { Entry } from '../../db/schema';

export default function AutonomyLog() {
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const [logs, setLogs] = useState<Entry[]>([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      const rows = await getAutonomyEntries(activeStageId);
      setLogs(rows);
    } catch (error) {
      console.error(error);
    }
  }, [activeStageId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      const content = draft.trim();
      await addEntry({
        stage_id: activeStageId,
        type: 'autonomy',
        title: content.slice(0, 50),
        content,
      });
      setDraft('');
      await loadLogs();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">自主性观察</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">记录 ta 主动表达与独立选择的时刻。</p>
        </div>
        <Badge variant="dev">{logs.length} 条</Badge>
      </div>

      {logs.length > 0 && (
        <div className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {logs.slice(0, 10).map(log => (
            <div key={log.id} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-xs leading-6 text-brand-700">{log.content}</p>
              <p className="mt-1 text-[10px] font-bold text-blue-400">{log.created_at?.slice(0, 16)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ta 今天主动说了什么？做了什么决定？——哪怕很小……"
          className="min-h-20"
        />
        <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
          {saving ? '保存中…' : '记录'}
        </Button>
      </div>
    </Card>
  );
}
