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
    <div className="max-w-2xl mx-auto py-8 px-4 h-full overflow-y-auto">
      <div className="relative pl-8 border-l-2 border-brand-200 space-y-6">
        {entries.map((entry) => {
          const stage = STAGES[entry.stage_id as keyof typeof STAGES] || { color: 'bg-brand-400' };
          const icon = TYPE_ICONS[entry.type] || '📝';
          return (
            <div key={entry.id} className="relative">
              <div className={`absolute -left-[33px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${stage.color.split(' ')[0]}`} />
              <div className="bg-white border border-brand-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-brand-900 text-sm">{icon} {entry.title}</h4>
                  <span className="text-[10px] text-brand-400">{entry.created_at?.slice(5, 16)}</span>
                </div>
                {entry.content && (
                  <p className="text-sm text-brand-800/70 mt-1 line-clamp-2">{entry.content}</p>
                )}
                {entry.duration_seconds > 0 && (
                  <span className="text-[10px] text-brand-400 mt-1 block">
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
            className="w-full rounded-lg border border-brand-200 bg-white px-4 py-2 text-xs font-medium text-brand-500 hover:text-brand-900 disabled:opacity-40"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        )}
        <div className="text-xs text-brand-400 font-medium pl-1">旅程开始</div>
      </div>
    </div>
  );
}
