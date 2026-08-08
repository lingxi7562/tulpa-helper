import { useEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEntryStore } from '../stores/useEntryStore';
import { STAGES } from '../constants/stages';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import IconButton from '../components/ui/IconButton';
import EntryForm from '../components/ui/EntryForm';
import Button from '../components/ui/Button';

const TYPE_ICONS: Record<string, string> = { session: '⏱️', narration: '🗣️', dialogue: '💬', trait: '🧬', signal: '⚡', design: '🎨', dialogue_session: '💬', practice: '✍️', imposition: '👁', switch: '🔄', autonomy: '🧠', resonance: '💗', wonderland: '🏡', devotion: '📜' };
const PAGE_SIZE = 200;
const LOAD_MORE_THRESHOLD = 600;

export default function TimelineLayout() {
  const { entries, totalEntries, loadEntries, loading, loadError, removeEntry, updateEntry } = useEntryStore();
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingPageRef = useRef(false);
  const loadingTokenRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchInput.trim().slice(0, 120)), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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
    } catch { /* keep confirmation visible on failure */ }
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

  // 首次只加载一页，后续滚动到底部时追加；搜索变化会丢弃旧结果。
  useEffect(() => {
    const token = ++loadingTokenRef.current;
    loadingPageRef.current = true;
    scrollRef.current?.scrollTo({ top: 0 });
    loadEntries(undefined, PAGE_SIZE, 0, false, searchQuery).finally(() => {
      if (token === loadingTokenRef.current) loadingPageRef.current = false;
    });
  }, [loadEntries, searchQuery]);

  const handleScroll = () => {
    const element = scrollRef.current;
    if (!element || loadingPageRef.current || loading || entries.length >= totalEntries) return;
    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceToBottom > LOAD_MORE_THRESHOLD) return;

    const token = ++loadingTokenRef.current;
    loadingPageRef.current = true;
    loadEntries(undefined, PAGE_SIZE, entries.length, true, searchQuery).finally(() => {
      if (token === loadingTokenRef.current) loadingPageRef.current = false;
    });
  };

  const handleRetry = () => {
    const append = entries.length > 0 && entries.length < totalEntries;
    const token = ++loadingTokenRef.current;
    loadingPageRef.current = true;
    loadEntries(undefined, PAGE_SIZE, append ? entries.length : 0, append, searchQuery).finally(() => {
      if (token === loadingTokenRef.current) loadingPageRef.current = false;
    });
  };

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 140,
    overscan: 5,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  return (
    <main ref={scrollRef} onScroll={handleScroll} aria-busy={loading} className="relative z-10 h-full overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-4xl px-4 py-9 sm:px-8 sm:py-12">
        <header className="mb-10 animate-[pageEnter_.45s_var(--ease)_both]"><p className="eyebrow">Our Story</p><h1 className="mt-3 text-3xl font-black tracking-tight text-brand-900">共同走过的时光</h1><p className="mt-2 text-sm leading-6 text-brand-500">每一次专注、每一句对话，都在这里留下温度。</p></header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <label className="min-w-0 flex-1">
            <span className="sr-only">搜索记录</span>
            <input
              type="search"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="搜索标题、正文或标签"
              maxLength={120}
              className="ui-input w-full"
              aria-label="搜索记录"
            />
          </label>
          {searchInput && <button type="button" onClick={() => setSearchInput('')} className="rounded-full px-3 py-2 text-xs font-bold text-brand-500 hover:bg-brand-100 hover:text-brand-800">清除</button>}
          {searchQuery && <span className="text-[10px] font-bold text-brand-400">找到 {totalEntries} 条</span>}
        </div>

        {loadError && !loading && (
          <Card hoverable={false} className="mb-5 border-red-200/70 bg-red-50/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="alert" className="text-sm font-semibold text-red-600">记录加载失败，数据仍保留在本地。请重试。</p>
              <Button size="sm" variant="secondary" onClick={handleRetry}>重试</Button>
            </div>
          </Card>
        )}

        {!entries.length && loading && (
          <Card hoverable={false}><p className="text-sm text-brand-400">正在整理本地记录…</p></Card>
        )}

        {!entries.length && !loading && !loadError && (
          <Card><p className="text-sm text-brand-400">{searchQuery ? `没有找到包含“${searchQuery}”的记录。` : '旅程还很安静。完成一次专注后，故事会从这里开始。'}</p></Card>
        )}

        <div
          className="relative ml-2 border-l border-brand-300/80 pl-7 sm:ml-4 sm:pl-10"
          style={{ height: entries.length > 0 ? `${virtualizer.getTotalSize()}px` : 'auto' }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const entry = entries[virtualItem.index];
            const stageId = entry.stage_id as keyof typeof STAGES;
            const stage = STAGES[stageId];
            const icon = TYPE_ICONS[entry.type] || '📝';

            return (
              <article
                key={entry.id}
                ref={(node) => virtualizer.measureElement(node)}
                data-index={virtualItem.index}
                className="group absolute left-0 top-0 w-full"
                style={{ transform: `translateY(${virtualItem.start}px)` }}
              >
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
                          <IconButton label="编辑记录" icon="✎" size="sm" onClick={(e) => { e.stopPropagation(); startEdit(entry.id); }} disabled={savingEdit} className="!h-7 !w-7 !text-[10px] opacity-60 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />
                          <IconButton label="删除记录" icon="×" size="sm" onClick={(e) => { e.stopPropagation(); startDelete(entry.id); }} disabled={savingEdit} className="!h-7 !w-7 !text-[10px] opacity-60 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />
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
        </div>

        {entries.length > 0 && (
          <p className="pt-2 text-center text-[10px] font-bold text-brand-400">
            已加载 {entries.length} / 共 {totalEntries} 条
          </p>
        )}

        {entries.length > 0 && (
          <p className="pt-2 text-xs font-bold tracking-wider text-brand-400">这里，是旅程开始的地方。</p>
        )}
      </div>
    </main>
  );
}
