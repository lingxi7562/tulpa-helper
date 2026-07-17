import { useState } from 'react';
import { useTraitStore } from '../../stores/useTraitStore';

export default function TraitManager() {
  const { traits, addTrait, removeTrait } = useTraitStore();
  const [name, setName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addTrait({ name: name.trim(), weight: 5 });
    setName('');
    setShowForm(false);
  };

  return (
    <div className="mb-5 rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_16px_45px_rgba(74,63,50,0.08)] sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div><h3 className="font-bold text-brand-900">性格特质蓝图</h3><p className="mt-1 text-xs text-brand-400">用温柔而清晰的词语描绘独特个性</p></div>
        <span className="rounded-full bg-stage-prep/10 px-3 py-1 text-xs font-bold text-emerald-700">{traits.length} 项</span>
      </div>
      <div className="mb-5 flex min-h-8 flex-wrap gap-2">
        {traits.map((t) => (
          <span key={t.id} className="group flex items-center gap-2 rounded-full border border-brand-200 bg-gradient-to-b from-white to-brand-50 px-3.5 py-2 text-sm text-brand-800 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300">
            {t.name}
            <button onClick={() => removeTrait(t.id)} className="text-brand-300 opacity-50 transition-all hover:text-red-500 group-hover:opacity-100">×</button>
          </span>
        ))}
      </div>
      {showForm ? (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-brand-50 p-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="min-w-40 flex-1 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/40"
            placeholder="输入特质名称..."
          />
          <button onClick={handleAdd} className="rounded-xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white">保存</button>
          <button onClick={() => setShowForm(false)} className="px-2 text-sm text-brand-500 hover:text-brand-900">取消</button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full rounded-2xl border border-dashed border-brand-300 py-3 text-sm font-medium text-brand-500 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800">
          + 添加新特质
        </button>
      )}
    </div>
  );
}
