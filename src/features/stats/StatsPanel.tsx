import { useStats } from '../../hooks/useStats';
import Heatmap from '../../components/ui/Heatmap';
import { STAGES } from '../../constants/stages';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import MilestoneList from '../journal/MilestoneList';
import { formatDuration } from '../../lib/format';
import BackupPanel from '../data/BackupPanel';
import { useMilestoneStore } from '../../stores/useMilestoneStore';

interface Props { onClose: () => void; }

export default function StatsPanel({ onClose }: Props) {
  const { totalSeconds, stageBreakdown, dailyDurations, heatmapData, consecutiveDays, loading, error, refresh } = useStats();
  const celebrationsEnabled = useMilestoneStore(state => state.celebrationsEnabled);
  const setCelebrationsEnabled = useMilestoneStore(state => state.setCelebrationsEnabled);
  if (loading) return <main className="grid h-full place-items-center"><div className="flex items-center gap-3 text-sm font-semibold text-brand-400"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />正在整理共同的时光…</div></main>;
  return (
    <main className="h-full overflow-y-auto overscroll-contain">
      <div className="panel-page space-y-5">
        {error && (
          <Card hoverable={false} className="border-red-200/70 bg-red-50/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="alert" className="text-xs font-bold text-red-500">统计数据加载失败，请稍后重试。</p>
              <Button size="sm" variant="secondary" onClick={refresh}>重试</Button>
            </div>
          </Card>
        )}
        <header className="mb-8 flex items-end justify-between gap-4"><div><p className="eyebrow">Quiet Progress</p><h1 className="mt-3 text-3xl font-black tracking-tight text-brand-900">时间的温柔回响</h1><p className="mt-2 text-sm text-brand-500">不追赶数字，只看见每一次认真相伴。</p></div><Button variant="secondary" onClick={onClose} icon="←">返回</Button></header>
        <Card hoverable={false} padding="lg" className="relative border-brand-700 bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white shadow-[0_24px_60px_rgba(63,57,49,.22)]"><div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[42px] border-white/[.045]" /><div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-xs font-bold tracking-[.16em] text-brand-200">已记录的陪伴时光</p><strong className="mt-3 block text-4xl tracking-tight sm:text-5xl">{formatDuration(totalSeconds)}</strong><p className="mt-3 text-xs leading-6 text-brand-200">这是投入时间的记录，不是能力、关系或进展的评分。</p></div><div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur"><strong className="text-3xl">{consecutiveDays}</strong><span className="ml-2 text-xs text-brand-200">天有记录 · 仅供回顾</span></div></div></Card>
        <Card hoverable={false} className="border-amber-200/70 bg-amber-50/35">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-brand-900">时间标记（可选）</h2>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-brand-500">默认不弹出小时庆祝，避免把数字当成关系进展。开启后只会在达到 10 / 50 / 100 小时时显示一次可关闭的记录提示。</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-brand-700">
              <input type="checkbox" checked={celebrationsEnabled} onChange={event => setCelebrationsEnabled(event.target.checked)} className="accent-amber-600" />
              开启时间标记
            </label>
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card hoverable={false}><div className="mb-6"><h2 className="font-black text-brand-900">各阶段时长</h2><p className="mt-1 text-xs text-brand-400">旅程中的注意力分布</p></div><div className="space-y-5">{stageBreakdown.length ? stageBreakdown.map(item => { const id = item.stage_id as keyof typeof STAGES; const info = STAGES[id]; const percentage = totalSeconds > 0 ? item.total / totalSeconds * 100 : 0; return <div key={item.stage_id}><div className="mb-2 flex items-center justify-between gap-2"><Badge variant={info ? id : 'neutral'}>{info?.name || item.stage_id}</Badge><span className="text-xs text-brand-400">{formatDuration(item.total)}</span></div><div className="h-2 overflow-hidden rounded-full bg-brand-100"><div className={`h-full rounded-full ${info?.color || 'bg-brand-400'}`} style={{ width: `${percentage}%` }} /></div></div>; }) : <p className="text-xs text-brand-400">完成专注后，这里会出现阶段分布。</p>}</div></Card>
          <Card hoverable={false}><div className="mb-5"><h2 className="font-black text-brand-900">近 7 天趋势</h2><p className="mt-1 text-xs text-brand-400">无需每天完美，保持自己的节奏。</p></div><div className="flex h-44 items-end gap-2 rounded-2xl bg-brand-50/75 px-3 pb-3 pt-5">{dailyDurations.length ? dailyDurations.map(item => { const REF_MAX = 28800; const height = Math.min(100, Math.max(4, (item.total / REF_MAX) * 100)); return <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="text-[9px] text-brand-500">{Math.round(item.total / 60)}m</span><div className="w-full max-w-8 rounded-t-lg bg-brand-500 shadow-sm transition-colors hover:bg-brand-700" style={{ height: `${height}%` }} /><span className="text-[9px] text-brand-400">{item.day.slice(5)}</span></div>; }) : <div className="grid h-full w-full place-items-center text-xs text-brand-400">本周还没有专注记录</div>}</div></Card>
        </div>
        <Card hoverable={false}><div className="mb-6 flex items-end justify-between gap-4"><div><h2 className="font-black text-brand-900">近 30 天</h2><p className="mt-1 text-xs text-brand-400">每一个有颜色的格子，都是一次靠近。</p></div><span className="hidden text-[10px] text-brand-400 sm:block">少　<span className="inline-block h-3 w-3 rounded bg-brand-100" /> <span className="inline-block h-3 w-3 rounded bg-emerald-300" /> <span className="inline-block h-3 w-3 rounded bg-emerald-700" />　多</span></div><Heatmap data={heatmapData.map(item => ({ date: item.day, value: item.total }))} days={30} /></Card>
        <MilestoneList />
        <BackupPanel />
      </div>
    </main>
  );
}
