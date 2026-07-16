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
    <div className="bg-white border border-brand-200 rounded-2xl p-5 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-brand-900">🧬 性格特质蓝图</h3>
        <span className="text-xs text-brand-500 bg-brand-100 px-2 py-1 rounded-md">{traits.length} 项</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {traits.map((t) => (
          <span key={t.id} className="px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-full text-sm text-brand-800 flex items-center gap-2 group">
            {t.name}
            <button onClick={() => removeTrait(t.id)} className="text-brand-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
          </span>
        ))}
      </div>
      {showForm ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 border border-brand-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            placeholder="输入特质名称..."
          />
          <button onClick={handleAdd} className="bg-brand-900 text-white px-3 py-1.5 rounded-lg text-sm">保存</button>
          <button onClick={() => setShowForm(false)} className="text-brand-500 px-2 text-sm">取消</button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="w-full py-2.5 border border-dashed border-brand-300 rounded-lg text-sm text-brand-500 hover:bg-brand-50 transition-colors">
          + 添加新特质
        </button>
      )}
    </div>
  );
}
