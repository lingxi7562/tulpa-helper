import { useStats } from '../../hooks/useStats';
import Heatmap from '../../components/ui/Heatmap';
import { STAGES } from '../../constants/stages';

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
  const { totalSeconds, stageBreakdown, dailyDurations, heatmapData, consecutiveDays, loading } = useStats();

  if (loading) return <div className="flex h-full items-center justify-center bg-brand-50 text-sm text-brand-400"><span className="mr-3 h-2 w-2 animate-pulse rounded-full bg-brand-500" />正在整理共同的时光…</div>;

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_80%_0%,rgba(212,201,179,0.28),transparent_32%)]">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-[10px] font-bold tracking-[0.24em] text-brand-400">QUIET PROGRESS</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">时间的温柔回响</h2><p className="mt-2 text-sm text-brand-500">不追赶数字，只看见每一次认真相伴。</p></div>
          <button onClick={onClose} className="rounded-2xl border border-brand-200 bg-white/70 px-4 py-2.5 text-xs font-semibold text-brand-500 shadow-sm transition-all hover:bg-white hover:text-brand-900">← 返回</button>
        </div>

        <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-8 text-white shadow-[0_22px_60px_rgba(74,63,50,0.22)] sm:p-10">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[40px] border-white/[0.05]" /><div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-xs font-semibold tracking-[0.16em] text-brand-200">累计专注时长</p><div className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{formatDuration(totalSeconds)}</div><p className="mt-3 text-xs leading-6 text-brand-200">每一分钟，都让彼此的存在更加清晰。</p></div><div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur"><span className="text-3xl font-bold">{consecutiveDays}</span><span className="ml-2 text-xs text-brand-200">天连续陪伴</span></div></div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_16px_45px_rgba(74,63,50,0.08)]">
          <div className="mb-6"><h3 className="font-bold text-brand-900">各阶段时长</h3><p className="mt-1 text-xs text-brand-400">旅程中的注意力分布</p></div><div className="space-y-5">
            {stageBreakdown.map((s) => {
              const info = STAGES[s.stage_id as keyof typeof STAGES] || { name: s.stage_id, color: 'bg-brand-400' };
              const pct = totalSeconds > 0 ? (s.total / totalSeconds) * 100 : 0;
              return (
                <div key={s.stage_id}>
                  <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-brand-800">{info.name}</span><span className="text-brand-400">{formatDuration(s.total)}</span>
                  </div>
                  <svg className="h-2 w-full overflow-hidden rounded-full bg-brand-100" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden="true">
                    <rect width={pct} height="8" rx="4" className={info.color.replace('bg-', 'fill-')} />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_16px_45px_rgba(74,63,50,0.08)]">
          <div className="mb-6"><h3 className="font-bold text-brand-900">近 7 天趋势</h3><p className="mt-1 text-xs text-brand-400">无需每天完美，保持自己的节奏</p></div><div className="flex h-40 items-end gap-3 rounded-2xl bg-brand-50/60 px-3 pt-5">
            {dailyDurations.map((d) => {
              const maxVal = Math.max(...dailyDurations.map((x) => x.total), 1);
              const h = Math.max(4, (d.total / maxVal) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-brand-500">{Math.round(d.total / 60)}m</span>
                  <svg className="h-[100px] w-full overflow-visible drop-shadow-sm" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
                    <rect x="0" y={100 - h} width="20" height={h} rx="4" className="fill-brand-500 transition-all duration-500 hover:fill-brand-700" />
                  </svg>
                  <span className="text-[10px] text-brand-400">{d.day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div></div>

        <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_16px_45px_rgba(74,63,50,0.08)]">
          <div className="mb-6 flex items-end justify-between"><div><h3 className="font-bold text-brand-900">近 30 天</h3><p className="mt-1 text-xs text-brand-400">每一个有颜色的格子，都是一次靠近</p></div><span className="hidden text-[10px] text-brand-400 sm:block">少　<span className="inline-block h-3 w-3 rounded bg-brand-100" /> <span className="inline-block h-3 w-3 rounded bg-emerald-300" /> <span className="inline-block h-3 w-3 rounded bg-emerald-600" />　多</span></div>
          <Heatmap data={heatmapData.map((d) => ({ date: d.day, value: d.total }))} days={30} />
        </div>
      </div>
    </div>
  );
}
