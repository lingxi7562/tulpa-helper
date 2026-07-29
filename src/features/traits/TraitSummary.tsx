import { useEffect } from 'react';
import Card from '../../components/ui/Card';
import { useTraitStore } from '../../stores/useTraitStore';

const TIER_MAP: Record<number, { label: string; color: string }> = {
  8: { label: '核心', color: 'text-amber-600' },
  5: { label: '重要', color: 'text-blue-600' },
  2: { label: '一般', color: 'text-gray-400' },
};

function weightToTier(weight: number) {
  if (weight >= 7) return TIER_MAP[8];
  if (weight >= 4) return TIER_MAP[5];
  return TIER_MAP[2];
}

export default function TraitSummary() {
  const { traits, loadTraits } = useTraitStore();

  useEffect(() => { loadTraits(); }, [loadTraits]);

  if (traits.length === 0) return null;

  return (
    <Card padding="sm" hoverable={false}>
      <p className="mb-2 text-[10px] font-bold text-brand-400">性格蓝图 · 只读</p>
      <div className="flex flex-wrap gap-1.5">
        {traits.map(trait => (
          <span
            key={trait.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
          >
            {trait.name}
            <span className={`rounded-full bg-white/70 px-1.5 text-[10px] ${weightToTier(trait.weight).color}`}>
              {weightToTier(trait.weight).label}
            </span>
          </span>
        ))}
      </div>
    </Card>
  );
}
