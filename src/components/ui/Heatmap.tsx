import { localDateKey, shiftLocalDate } from '../../lib/date';

interface DayData { date: string; value: number; }
interface Props { data: DayData[]; days?: number; }

function tone(value: number) {
  if (value === 0) return 'bg-brand-100';
  if (value < 300) return 'bg-emerald-100';
  if (value < 900) return 'bg-emerald-300';
  if (value < 1800) return 'bg-emerald-500';
  return 'bg-emerald-700';
}

export default function Heatmap({ data, days = 30 }: Props) {
  const count = Number.isFinite(days) ? Math.max(1, Math.min(366, Math.trunc(days))) : 30;
  const values = data.reduce<Record<string, number>>((map, item) => {
    const value = Number(item.value);
    map[item.date] = (map[item.date] || 0) + (Number.isFinite(value) ? Math.max(0, value) : 0);
    return map;
  }, {});
  const cells = Array.from({ length: count }, (_, index) => {
    const date = localDateKey(shiftLocalDate(new Date(), -(count - 1 - index)));
    return { date, value: values[date] || 0 };
  });
  return <div role="img" className="grid grid-cols-10 gap-2 sm:grid-cols-[repeat(15,minmax(0,1fr))]" aria-label={`${count} 天专注热力图`}>{cells.map(cell => <div key={cell.date} title={`${cell.date}: ${Math.round(cell.value / 60)} 分钟`} aria-label={`${cell.date}，${Math.round(cell.value / 60)} 分钟`} className={`aspect-square min-h-3 rounded-[6px] ring-1 ring-black/[.025] transition duration-200 hover:scale-125 hover:ring-2 hover:ring-white ${tone(cell.value)}`} />)}</div>;
}
