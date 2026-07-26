import { useEffect, useState } from 'react';
import { useEntryStore } from '../stores/useEntryStore';
import { STAGES } from '../constants/stages';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import IconButton from '../components/ui/IconButton';

const TYPE_ICONS: Record<string, string> = { session: '⏱️', narration: '🗣️', dialogue: '💬', trait: '🧬', signal: '⚡', design: '🎨', dialogue_session: '💬', practice: '✍️', imposition: '👁', switch: '🔄' };

export default function TimelineLayout() {
  const { entries, loadEntries, loading, removeEntry } = useEntryStore();
  const [hasMore, setHasMore] = useState(true); const pageSize = 50;
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const handleDelete = async (id: number) => {
    await removeEntry(id);
    setConfirmingDelete(null);
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
            return <article key={entry.id} className="group relative animate-[pageEnter_.45s_var(--ease)_both]" style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}><span className={`absolute -left-[34px] top-6 h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-[0_0_0_3px_#FDFBF7] sm:-left-[47px] ${stage?.color || 'bg-brand-400'}`} /><Card><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-base">{icon}</span><div className="min-w-0"><h2 className="truncate text-sm font-black text-brand-900">{entry.title}</h2>{stage && <Badge variant={stageId} className="mt-1 !border-0 !bg-transparent !p-0">{stage.name}</Badge>}</div></div><div className="flex shrink-0 items-center gap-2"><time className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-400">{entry.created_at?.slice(5, 16)}</time>{confirmingDelete === entry.id ? (<div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1"><span className="text-[10px] font-bold text-red-600">Delete?</span><button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="inline-flex items-center justify-center rounded-full border border-red-600 bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">Delete</button><button onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }} className="inline-flex items-center justify-center rounded-full border border-brand-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-brand-600">Cancel</button></div>) : (<IconButton label="Delete entry" icon="×" size="sm" onClick={(e) => { e.stopPropagation(); setConfirmingDelete(entry.id); }} className="opacity-0 group-hover:opacity-100 !h-7 !w-7 !text-[10px]" />)}</div></div>{entry.content && <p className="ml-[52px] mt-3 line-clamp-2 text-sm leading-6 text-brand-600">{entry.content}</p>}{entry.duration_seconds > 0 && <p className="ml-[52px] mt-2 text-[10px] font-bold text-brand-400">⏱ {Math.round(entry.duration_seconds / 60)} 分钟</p>}</Card></article>;
          })}
          {!entries.length && !loading && <Card><p className="text-sm text-brand-400">旅程还很安静。完成一次专注后，故事会从这里开始。</p></Card>}
          {hasMore && entries.length > 0 && <Button variant="secondary" fullWidth onClick={loadMore} disabled={loading}>{loading ? '加载中…' : '加载更多'}</Button>}
          <p className="pt-2 text-xs font-bold tracking-wider text-brand-400">这里，是旅程开始的地方。</p>
        </div>
      </div>
    </main>
  );
}
