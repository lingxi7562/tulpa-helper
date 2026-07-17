import { useEffect, useState } from 'react';
import { useEntryStore } from '../stores/useEntryStore';
import { STAGES } from '../constants/stages';

const TYPE_ICONS: Record<string, string> = {
  session: '⏱️', narration: '🗣️', dialogue: '💬',
  trait: '🧬', signal: '⚡', design: '🎨',
  dialogue_session: '💬', practice: '✍️',
  imposition: '👁', switch: '🔄',
};

export default function TimelineLayout() {
  const { entries, loadEntries, loading } = useEntryStore();
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  useEffect(() => {
    loadEntries(undefined, pageSize, 0).then(() => setHasMore(true));
  }, []);

  const loadMore = async () => {
    const before = entries.length;
    await loadEntries(undefined, pageSize, entries.length, true);
    const after = useEntryStore.getState().entries.length;
    if (after - before < pageSize) setHasMore(false);
  };

  return (
    <div className="relative z-10 h-full overflow-y-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl"><div className="mb-10"><p className="text-[10px] font-bold tracking-[0.24em] text-brand-400">OUR STORY</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">共同走过的时光</h2><p className="mt-2 text-sm text-brand-500">每一次专注、每一句对话，都在这里留下温度。</p></div>
      <div className="relative space-y-6 border-l border-brand-300/70 pl-7 sm:pl-10">
        {entries.map((entry) => {
          const stage = STAGES[entry.stage_id as keyof typeof STAGES] || { color: 'bg-brand-400' };
          const icon = TYPE_ICONS[entry.type] || '📝';
          return (
            <div key={entry.id} className="relative">
              <div className={`absolute -left-[34px] top-6 h-3.5 w-3.5 rounded-full border-[3px] border-brand-50 shadow-[0_0_0_3px_white] sm:-left-[47px] ${stage.color.split(' ')[0]}`} />
              <div className="group rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_12px_35px_rgba(74,63,50,0.07)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_45px_rgba(74,63,50,0.11)] sm:p-6">
                <div className="mb-2 flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-base">{icon}</span><h4 className="text-sm font-bold text-brand-900">{entry.title}</h4></div><span className="whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-400">{entry.created_at?.slice(5, 16)}</span>
                </div>
                {entry.content && (
                  <p className="ml-12 mt-1 line-clamp-2 text-sm leading-6 text-brand-600">{entry.content}</p>
                )}
                {entry.duration_seconds > 0 && (
                  <span className="ml-12 mt-2 block text-[10px] font-medium text-brand-400">
                    ⏱ {Math.round(entry.duration_seconds / 60)} 分钟
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full rounded-2xl border border-brand-200 bg-white/70 px-4 py-3 text-xs font-semibold text-brand-500 transition hover:bg-white hover:text-brand-900 hover:shadow-sm disabled:opacity-40"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        )}
        <div className="pl-1 text-xs font-semibold tracking-wider text-brand-400">这里，是旅程开始的地方</div>
      </div></div>
    </div>
  );
}
