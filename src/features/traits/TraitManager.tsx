import { useState } from 'react';
import { useTraitStore } from '../../stores/useTraitStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import IconButton from '../../components/ui/IconButton';
import EvolutionLog from '../evolution/EvolutionLog';
import { useToast } from '../../hooks/useToast';

const TIER_MAP: Record<number, { label: string; color: string; activeColor: string }> = {
  8: { label: '核心', color: 'text-amber-500', activeColor: 'border-amber-500 bg-amber-500 text-white' },
  5: { label: '重要', color: 'text-blue-500', activeColor: 'border-blue-500 bg-blue-500 text-white' },
  2: { label: '一般', color: 'text-gray-400', activeColor: 'border-gray-400 bg-gray-400 text-white' },
};

const WEIGHT_TIERS = [8, 5, 2] as const;

function weightToTier(weight: number) {
  if (weight >= 7) return TIER_MAP[8];
  if (weight >= 4) return TIER_MAP[5];
  return TIER_MAP[2];
}

function nextTierWeight(weight: number) {
  if (weight >= 7) return 5;
  if (weight >= 4) return 2;
  return 8;
}

export default function TraitManager() {
  const { traits, addTrait, removeTrait, updateTrait, loadTraits, loadError } = useTraitStore();
  const showToast = useToast(state => state.show);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [editingWeight, setEditingWeight] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await addTrait({ name: name.trim(), weight, description: description.trim() });
      setName('');
      setDescription('');
      setWeight(5);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      showToast('保存特质失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTierCycle = async (id: number) => {
    const trait = traits.find(t => t.id === id);
    if (!trait || updatingId === id) return;
    setUpdatingId(id);
    try {
      await updateTrait(id, { weight: nextTierWeight(trait.weight) });
    } catch (error) {
      console.error(error);
      showToast('更新特质失败，请重试');
    } finally {
      setUpdatingId(null);
      setEditingWeight(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await removeTrait(id);
    } catch (error) {
      console.error(error);
      showToast('删除特质失败，请重试');
    } finally {
      setDeletingId(null);
      setEditingWeight(null);
    }
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">性格特质蓝图</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">用温柔而清晰的词语描绘独特个性。</p>
        </div>
        <Badge variant="prep">{traits.length} 项</Badge>
      </div>

      {loadError && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/70 p-3">
          <p role="alert" className="text-xs font-bold text-red-600">特质资料加载失败。</p>
          <Button size="sm" variant="secondary" onClick={() => void loadTraits()} className="mt-2">重试</Button>
        </div>
      )}

      <div className="mb-5 space-y-2">
        {traits.length ? traits.map(trait => (
          <div key={trait.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="group flex flex-wrap items-center gap-1.5 text-xs font-bold leading-5 text-emerald-700">
              <span>{trait.name}</span>
              {trait.description && <span className="text-[10px] font-medium text-emerald-600/70">— {trait.description}</span>}
              {editingWeight === trait.id ? (
                <button
                  onClick={() => handleTierCycle(trait.id)}
                  disabled={updatingId === trait.id}
                  className={`rounded-full bg-white/70 px-2 py-1 text-[10px] ${weightToTier(trait.weight).color} disabled:opacity-50`}
                  title="点击切换重要程度"
                >
                  {updatingId === trait.id ? '更新中…' : weightToTier(trait.weight).label}
                </button>
              ) : (
                <button
                  onClick={() => setEditingWeight(trait.id)}
                  className={`rounded-full bg-white/60 px-1.5 text-[10px] ${weightToTier(trait.weight).color}`}
                  title="点击调整重要程度"
                >
                  · {weightToTier(trait.weight).label}
                </button>
              )}
              <span className="ml-auto">
                {deletingId === trait.id ? (
                  <span className="inline-flex items-center gap-1">
                    <button onClick={() => handleDelete(trait.id)} className="rounded-full bg-red-600 px-2 py-1 text-[10px] text-white">确认</button>
                    <button onClick={() => setDeletingId(null)} className="rounded-full bg-white px-2 py-1 text-[10px] text-brand-600">取消</button>
                  </span>
                ) : (
                  <IconButton label={`删除${trait.name}`} icon="×" size="sm" variant="danger" onClick={() => { setDeletingId(trait.id); setEditingWeight(null); }} className="!h-7 !w-7 !text-xs opacity-50 group-hover:opacity-100" />
                )}
              </span>
            </div>
            <EvolutionLog targetType="trait" targetId={trait.id} />
          </div>
        )) : (
          <p className="text-xs text-brand-400">还没有特质，从一个最重要的词开始。</p>
        )}
      </div>

      {showForm ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="输入特质名称..."
              className="min-w-0 flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
              <Button onClick={() => setShowForm(false)} variant="ghost" size="sm" disabled={saving}>取消</Button>
            </div>
          </div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ta 是怎样的？温柔、好奇、固执……（可留空，特质会自然演化）"
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs text-brand-700 placeholder:text-brand-300 focus:border-emerald-400 focus:outline-none"
            rows={2}
            disabled={saving}
          />
          <div className="flex items-center gap-3 px-1">
            <span className="shrink-0 text-[11px] font-bold text-brand-500">重要程度</span>
            <div className="flex flex-1 gap-1.5" role="group" aria-label="重要程度">
              {WEIGHT_TIERS.map(tierWeight => {
                const tier = TIER_MAP[tierWeight];
                const selected = weight === tierWeight;
                return (
                  <button
                    key={tierWeight}
                    type="button"
                    onClick={() => setWeight(tierWeight)}
                    disabled={saving}
                    aria-pressed={selected}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${selected ? tier.activeColor : `border-current bg-transparent ${tier.color}`}`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-1 text-[10px] text-brand-400">💡 这只是起点——Ta 可能会自然演化成与设想不同的样子，这并非坏事。</p>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="secondary" fullWidth className="border-dashed">＋ 添加新特质</Button>
      )}
    </Card>
  );
}
