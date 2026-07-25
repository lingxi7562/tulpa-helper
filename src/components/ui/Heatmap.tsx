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
  const values = data.reduce<Record<string, number>>((map, item) => ({ ...map, [item.date]: (map[item.date] || 0) + item.value }), {});
  const cells = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.now() - (days - 1 - index) * 86400000).toISOString().slice(0, 10);
    return { date, value: values[date] || 0 };
  });
  return <div className="grid grid-cols-10 gap-2 sm:grid-cols-[repeat(15,minmax(0,1fr))]" aria-label={`${days} 天专注热力图`}>{cells.map(cell => <div key={cell.date} title={`${cell.date}: ${Math.round(cell.value / 60)} 分钟`} aria-label={`${cell.date}，${Math.round(cell.value / 60)} 分钟`} className={`aspect-square min-h-3 rounded-[6px] ring-1 ring-black/[.025] transition duration-200 hover:scale-125 hover:ring-2 hover:ring-white ${tone(cell.value)}`} />)}</div>;
}
