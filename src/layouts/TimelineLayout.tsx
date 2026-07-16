import { useEffect } from 'react';
import { useEntryStore } from '../stores/useEntryStore';

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  prep:   { label: '🌱 准备期', color: 'bg-emerald-500 border-emerald-200' },
  create: { label: '✨ 创建期', color: 'bg-amber-500 border-amber-200' },
  dev:    { label: '🗣️ 发展期', color: 'bg-blue-500 border-blue-200' },
  mature: { label: '🤝 成熟期', color: 'bg-purple-500 border-purple-200' },
};

const TYPE_ICONS: Record<string, string> = {
  session: '⏱️', narration: '🗣️', dialogue: '💬',
  trait: '🧬', signal: '⚡', design: '🎨',
  dialogue_session: '💬', practice: '✍️',
  imposition: '👁', switch: '🔄',
};

export default function TimelineLayout() {
  const { entries, loadEntries } = useEntryStore();

  useEffect(() => { loadEntries(); }, []);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 h-full overflow-y-auto">
      <div className="relative pl-8 border-l-2 border-brand-200 space-y-6">
        {entries.map((entry) => {
          const stage = STAGE_LABELS[entry.stage_id] || { color: 'bg-brand-400' };
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
        <div className="text-xs text-brand-400 font-medium pl-1">旅程开始</div>
      </div>
    </div>
  );
}
