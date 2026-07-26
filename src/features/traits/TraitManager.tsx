import { useState } from 'react';
import { useTraitStore } from '../../stores/useTraitStore';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import IconButton from '../../components/ui/IconButton';

export default function TraitManager() {
  const { traits, addTrait, removeTrait, updateTrait } = useTraitStore();
  const [name, setName] = useState('');
  const [weight, setWeight] = useState(5);
  const [showForm, setShowForm] = useState(false);
  const [editingWeight, setEditingWeight] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addTrait({ name: name.trim(), weight });
    setName('');
    setWeight(5);
    setShowForm(false);
  };

  const handleWeightAdjust = async (id: number, delta: number) => {
    const trait = traits.find(t => t.id === id);
    if (!trait || updatingId !== null) return;
    const newWeight = Math.min(10, Math.max(1, trait.weight + delta));
    if (newWeight === trait.weight) return;
    setUpdatingId(id);
    try {
      await updateTrait(id, { weight: newWeight });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await removeTrait(id);
    } catch (error) {
      console.error(error);
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

      <div className="mb-5 flex min-h-9 flex-wrap gap-2">
        {traits.length ? traits.map(trait => (
          <div
            key={trait.id}
            className="group relative inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 pl-3.5 pr-1.5 text-xs font-bold leading-5 text-emerald-700"
          >
            {trait.name}
            {editingWeight === trait.id ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-white/70 px-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleWeightAdjust(trait.id, -1); }}
                  disabled={updatingId === trait.id || trait.weight <= 1}
                  className="grid h-7 w-7 place-items-center rounded-full text-sm text-emerald-600 hover:bg-emerald-100 disabled:opacity-30"
                  aria-label="减少权重"
                >−</button>
                <span className="min-w-[1.2em] text-center text-xs tabular-nums">{trait.weight}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleWeightAdjust(trait.id, +1); }}
                  disabled={updatingId === trait.id || trait.weight >= 10}
                  className="grid h-7 w-7 place-items-center rounded-full text-sm text-emerald-600 hover:bg-emerald-100 disabled:opacity-30"
                  aria-label="增加权重"
                >+</button>
              </span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setEditingWeight(trait.id); }}
                className="ml-0.5 rounded-full bg-white/60 px-1.5 text-[10px] tabular-nums leading-5 text-emerald-600 hover:bg-white"
                title="点击调整权重"
              >
                · {trait.weight}
              </button>
            )}
            {deletingId === trait.id ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5">
                <span className="text-[10px] font-bold text-red-600">删除？</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(trait.id); }}
                  className="grid h-7 min-w-7 place-items-center rounded-full bg-red-600 px-2 text-[10px] font-bold text-white"
                >确认</button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                  className="grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-[10px] font-bold text-brand-600"
                >取消</button>
              </span>
            ) : (
              <IconButton
                label={`删除${trait.name}`}
                icon="×"
                size="sm"
                variant="danger"
                onClick={() => { setDeletingId(trait.id); setEditingWeight(null); }}
                className="!h-7 !w-7 !text-xs opacity-40 group-hover:opacity-100"
              />
            )}
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
              <Button onClick={handleAdd} size="sm">保存</Button>
              <Button onClick={() => setShowForm(false)} variant="ghost" size="sm">取消</Button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-1">
            <label htmlFor="trait-weight" className="text-[11px] font-bold text-brand-500 shrink-0">重要程度</label>
            <input
              id="trait-weight"
              type="range"
              min={1}
              max={10}
              step={1}
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="h-1.5 flex-1 appearance-none rounded-full bg-brand-200 accent-emerald-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-emerald-500"
            />
            <span className="w-5 text-center text-xs font-black tabular-nums text-brand-700">{weight}</span>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="secondary" fullWidth className="border-dashed">＋ 添加新特质</Button>
      )}
    </Card>
  );
}
