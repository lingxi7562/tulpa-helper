interface DayData {
  date: string;
  value: number;
}

interface Props {
  data: DayData[];
  days?: number;
}

function getColor(value: number): string {
  if (value === 0) return 'bg-brand-100';
  if (value < 300) return 'bg-emerald-100';
  if (value < 900) return 'bg-emerald-300';
  if (value < 1800) return 'bg-emerald-400';
  return 'bg-emerald-600';
}

export default function Heatmap({ data, days = 30 }: Props) {
  const map: Record<string, number> = {};
  data.forEach((d) => { map[d.date] = (map[d.date] || 0) + d.value; });

  const cells: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    cells.push({ date: d, value: map[d] || 0 });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {cells.map((c) => (
        <div
          key={c.date}
          title={`${c.date}: ${Math.round(c.value / 60)}分钟`}
          className={`h-4 w-4 rounded-[5px] ring-1 ring-black/[0.02] transition-all duration-200 hover:z-10 hover:scale-150 hover:ring-2 hover:ring-white ${getColor(c.value)}`}
        />
      ))}
    </div>
  );
}
