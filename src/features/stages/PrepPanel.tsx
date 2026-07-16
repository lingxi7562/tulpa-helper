import { useEffect } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import TraitManager from '../traits/TraitManager';
import { useTraitStore } from '../../stores/useTraitStore';

const PREP_SESSION_TYPES = [
  { label: '蓝图设计', value: 'design' },
];

export default function PrepPanel() {
  const { loadTraits } = useTraitStore();

  useEffect(() => { loadTraits(); }, []);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-brand-900">🌱 准备期</h2>
        <p className="text-brand-500 text-sm mt-1">定义蓝图，构建基础。</p>
      </div>

      <FocusTimer sessionTypes={PREP_SESSION_TYPES} />

      <TraitManager />

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-4">🎨 形态设计</h3>
        <p className="text-sm text-brand-400">形态设计器 — 后续迭代</p>
      </div>

      <div className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-brand-900 mb-4">🏡 Wonderland 初始构建</h3>
        <p className="text-sm text-brand-400">Wonderland 编辑器 — 后续迭代</p>
      </div>
    </div>
  );
}
