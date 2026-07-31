import { useState, useEffect, useCallback } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { getAutonomyEntries } from '../../db/database';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import type { Entry } from '../../db/schema';

const DRAFT_KEY_PREFIX = 'autonomy-draft-';

function loadDraft(stageId: string): string {
  try { return localStorage.getItem(DRAFT_KEY_PREFIX + stageId) || ''; }
  catch { return ''; }
}

function saveDraft(stageId: string, text: string) {
  try { localStorage.setItem(DRAFT_KEY_PREFIX + stageId, text); }
  catch { /* noop */ }
}

function clearDraft(stageId: string) {
  try { localStorage.removeItem(DRAFT_KEY_PREFIX + stageId); }
  catch { /* noop */ }
}

export default function AutonomyLog() {
  const { addEntry, removeEntry, updateEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const [logs, setLogs] = useState<Entry[]>([]);
  const [draft, setDraft] = useState(() => loadDraft(activeStageId));
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const rows = await getAutonomyEntries(activeStageId);
      setLogs(rows);
    } catch (error) {
      console.error(error);
    }
  }, [activeStageId]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  useEffect(() => {
    setDraft(loadDraft(activeStageId));
  }, [activeStageId]);

  useEffect(() => {
    // 编辑模式下跳过草稿自动保存，避免覆盖已存草稿
    if (editingId === null) {
      const timer = setTimeout(() => saveDraft(activeStageId, draft), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeStageId, draft, editingId]);

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        const content = draft.trim();
        await updateEntry(editingId, { content, title: Array.from(content).slice(0, 50).join('') });
        setEditingId(null);
      } else {
        const content = draft.trim();
        await addEntry({
          stage_id: activeStageId,
          type: 'autonomy',
          title: Array.from(content).slice(0, 50).join(''),
          content,
        });
      }
      setDraft('');
      clearDraft(activeStageId);
      await loadLogs();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (id: number, content: string) => {
    setDraft(content);
    setEditingId(id);
    setDeletingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await removeEntry(id);
      if (editingId === id) { setEditingId(null); setDraft(''); }
      setDeletingId(null);
      await loadLogs();
    } catch (error) {
      console.error(error);
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
          {(showAll ? logs : logs.slice(0, 10)).map(log => (
            <div key={log.id} className="group rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1 text-xs leading-6 text-brand-700">{log.content}</p>
                <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  {deletingId === log.id ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1 py-0.5">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="grid h-6 min-w-6 place-items-center rounded-full bg-red-600 px-2 text-[10px] font-bold text-white"
                      >确认</button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-2 text-[10px] font-bold text-brand-600"
                      >取消</button>
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(log.id, log.content)}
                        className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-blue-500 hover:bg-white"
                        aria-label="编辑"
                      >✎</button>
                      <button
                        onClick={() => setDeletingId(log.id)}
                        className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-red-500 hover:bg-red-50"
                        aria-label="删除"
                      >×</button>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-1 text-[10px] font-bold text-blue-400">{log.created_at?.slice(0, 16)}</p>
            </div>
          ))}
          {logs.length > 10 && (
            <button
              onClick={() => setShowAll(v => !v)}
              className="w-full rounded-xl border border-dashed border-blue-200 py-1.5 text-[10px] font-bold text-blue-500 hover:bg-blue-50"
            >
              {showAll ? '收起' : `查看更多（还有 ${logs.length - 10} 条）`}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
        {editingId !== null && (
          <p className="text-[10px] font-bold text-blue-500">正在编辑——保存将更新原记录</p>
        )}
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ta 今天主动说了什么？做了什么决定？——哪怕很小……"
          className="min-h-20"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
            {saving ? '保存中…' : editingId !== null ? '保存修改' : '记录'}
          </Button>
          {editingId !== null && (
            <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setDraft(loadDraft(activeStageId)); }} disabled={saving}>取消</Button>
          )}
        </div>
      </div>
    </Card>
  );
}
