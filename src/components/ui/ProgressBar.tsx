interface Props {
  value: number;
  max?: number;
  color?: string;
  label?: string;
}

export default function ProgressBar({ value, max = 100, color = 'bg-brand-500', label }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {label && <div className="text-xs text-brand-500 mb-1">{label}</div>}
      <div className="h-2 bg-brand-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
