import { useStats } from '../../hooks/useStats';
import Heatmap from '../../components/ui/Heatmap';

const STAGE_NAMES: Record<string, { name: string; color: string }> = {
  prep:   { name: '准备期', color: 'bg-emerald-500' },
  create: { name: '创建期', color: 'bg-amber-500' },
  dev:    { name: '发展期', color: 'bg-blue-500' },
  mature: { name: '成熟期', color: 'bg-purple-500' },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} 小时 ${m} 分钟`;
  return `${m} 分钟`;
}

interface Props {
  onClose: () => void;
}

export default function StatsPanel({ onClose }: Props) {
  const { totalSeconds, stageBreakdown, dailyDurations, consecutiveDays, loading } = useStats();

  if (loading) return <div className="p-8 text-brand-400">加载中...</div>;

  return (
    <div className="h-full overflow-y-auto bg-brand-50">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-900">📊 时间统计</h2>
          <button onClick={onClose} className="text-brand-400 hover:text-brand-800">✕ 关闭</button>
        </div>

        <div className="bg-white border border-brand-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-4xl font-bold text-brand-900">{formatDuration(totalSeconds)}</div>
          <p className="text-sm text-brand-500 mt-2">累计专注时长 · 连续 {consecutiveDays} 天</p>
        </div>

        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-brand-900 mb-4">各阶段时长</h3>
          <div className="space-y-3">
            {stageBreakdown.map((s) => {
              const info = STAGE_NAMES[s.stage_id] || { name: s.stage_id, color: 'bg-brand-400' };
              const pct = totalSeconds > 0 ? (s.total / totalSeconds) * 100 : 0;
              return (
                <div key={s.stage_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-brand-800">{info.name}</span>
                    <span className="text-brand-500">{formatDuration(s.total)}</span>
                  </div>
                  <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
                    <div className={`h-full ${info.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-brand-900 mb-4">近 7 天趋势</h3>
          <div className="flex items-end gap-3 h-32">
            {dailyDurations.map((d) => {
              const maxVal = Math.max(...dailyDurations.map((x) => x.total), 1);
              const h = Math.max(4, (d.total / maxVal) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-brand-500">{Math.round(d.total / 60)}m</span>
                  <div className="w-full bg-emerald-300 rounded-t-sm transition-all" style={{ height: `${h}px` }} />
                  <span className="text-[10px] text-brand-400">{d.day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-brand-900 mb-4">近 30 天</h3>
          <Heatmap data={dailyDurations.map((d) => ({ date: d.day, value: d.total }))} days={30} />
        </div>
      </div>
    </div>
  );
}
