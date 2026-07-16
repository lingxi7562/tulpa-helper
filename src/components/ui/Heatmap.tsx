interface DayData {
  date: string;
  value: number;
}

interface Props {
  data: DayData[];
  days?: number;
}

function getColor(value: number): string {
  if (value === 0) return 'bg-gray-100';
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
    <div className="flex gap-1 flex-wrap">
      {cells.map((c) => (
        <div
          key={c.date}
          title={`${c.date}: ${Math.round(c.value / 60)}分钟`}
          className={`w-3 h-3 rounded-sm ${getColor(c.value)}`}
        />
      ))}
    </div>
  );
}
