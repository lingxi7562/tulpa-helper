import { useEffect, useState } from 'react';
import { useEntryStore } from '../stores/useEntryStore';
import { STAGES } from '../constants/stages';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import IconButton from '../components/ui/IconButton';
import EntryForm from '../components/ui/EntryForm';

const TYPE_ICONS: Record<string, string> = { session: '⏱️', narration: '🗣️', dialogue: '💬', trait: '🧬', signal: '⚡', design: '🎨', dialogue_session: '💬', practice: '✍️', imposition: '👁', switch: '🔄', autonomy: '🧠', resonance: '💗', wonderland: '🏡', devotion: '📜' };

export default function TimelineLayout() {
  const { entries, loadEntries, loading, removeEntry, updateEntry } = useEntryStore();
  const [hasMore, setHasMore] = useState(true); const pageSize = 50;
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // 编辑和删除互斥：开始一个操作时清除另一个
  const startEdit = (id: number) => {
    if (savingEdit) return;
    setConfirmingDelete(null);
    setEditingId(editingId === id ? null : id);
  };
  const startDelete = (id: number) => {
    setEditingId(null);
    setConfirmingDelete(confirmingDelete === id ? null : id);
  };

  const handleDelete = async (id: number) => {
    try {
      await removeEntry(id);
      setConfirmingDelete(null);
    } catch {
      // keep confirmation visible on failure
    }
  };

  const handleEditSave = async (title: string, content: string) => {
    if (editingId === null) return;
    setSavingEdit(true);
    try {
      await updateEntry(editingId, { title, content });
      setEditingId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => { loadEntries(undefined, pageSize, 0).then(() => setHasMore(true)); }, [loadEntries]);
  const loadMore = async () => { const before = entries.length; await loadEntries(undefined, pageSize, entries.length, true); if (useEntryStore.getState().entries.length - before < pageSize) setHasMore(false); };

  return (
    <main className="relative z-10 h-full overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-4xl px-4 py-9 sm:px-8 sm:py-12">
        <header className="mb-10 animate-[pageEnter_.45s_var(--ease)_both]"><p className="eyebrow">Our Story</p><h1 className="mt-3 text-3xl font-black tracking-tight text-brand-900">共同走过的时光</h1><p className="mt-2 text-sm leading-6 text-brand-500">每一次专注、每一句对话，都在这里留下温度。</p></header>
        <div className="relative ml-2 space-y-5 border-l border-brand-300/80 pl-7 sm:ml-4 sm:pl-10">
          {entries.map((entry, index) => {
            const stageId = entry.stage_id as keyof typeof STAGES; const stage = STAGES[stageId]; const icon = TYPE_ICONS[entry.type] || '📝';
            return (
              <article key={entry.id} className="group relative animate-[pageEnter_.45s_var(--ease)_both]" style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}>
                <span className={`absolute -left-[34px] top-6 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-[0_0_0_3px_#FDFBF7] sm:-left-[47px] ${stage?.color || 'bg-brand-400'}`} />
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-base">{icon}</span>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-black text-brand-900">{entry.title}</h2>
                        {stage && <Badge variant={stageId} className="mt-1 !border-0 !bg-transparent !p-0">{stage.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <time className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-400">{entry.created_at?.slice(5, 16)}</time>
                      {confirmingDelete === entry.id ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1">
                          <span className="text-[10px] font-bold text-red-600">删除？</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="grid h-7 min-w-7 place-items-center rounded-full bg-red-600 px-2 text-[10px] font-bold text-white">删除</button>
                          <button onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }} className="grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-[10px] font-bold text-brand-600">取消</button>
                        </div>
                      ) : (
                        <>
                          <IconButton label="编辑记录" icon="✎" size="sm" onClick={(e) => { e.stopPropagation(); startEdit(entry.id); }} disabled={savingEdit} className="!h-7 !w-7 !text-[10px] opacity-60 sm:opacity-0 sm:group-hover:opacity-100" />
                          <IconButton label="删除记录" icon="×" size="sm" onClick={(e) => { e.stopPropagation(); startDelete(entry.id); }} disabled={savingEdit} className="!h-7 !w-7 !text-[10px] opacity-60 sm:opacity-0 sm:group-hover:opacity-100" />
                        </>
                      )}
                    </div>
                  </div>
                  {editingId === entry.id ? (
                    <div className="mt-3">
                      <EntryForm entry={entry} onSave={handleEditSave} onCancel={() => setEditingId(null)} saving={savingEdit} />
                    </div>
                  ) : (
                    <>
                      {entry.content && <p className="ml-[52px] mt-3 line-clamp-2 text-sm leading-6 text-brand-600">{entry.content}</p>}
                      {entry.duration_seconds > 0 && <p className="ml-[52px] mt-2 text-[10px] font-bold text-brand-400">⏱ {Math.round(entry.duration_seconds / 60)} 分钟</p>}
                    </>
                  )}
                </Card>
              </article>
            );
          })}
          {!entries.length && !loading && <Card><p className="text-sm text-brand-400">旅程还很安静。完成一次专注后，故事会从这里开始。</p></Card>}
          {hasMore && entries.length > 0 && <Button variant="secondary" fullWidth onClick={loadMore} disabled={loading}>{loading ? '加载中…' : '加载更多'}</Button>}
          <p className="pt-2 text-xs font-bold tracking-wider text-brand-400">这里，是旅程开始的地方。</p>
        </div>
      </div>
    </main>
  );
}