import { useEffect } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import TraitManager from '../traits/TraitManager';
import { useTraitStore } from '../../stores/useTraitStore';
import { STAGES } from '../../constants/stages';

const PREP_SESSION_TYPES = [
  { label: '蓝图设计', value: 'design' },
];

export default function PrepPanel() {
  const { loadTraits } = useTraitStore();

  useEffect(() => { loadTraits(); }, []);

  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-brand-50 p-6 shadow-[0_20px_55px_rgba(16,185,129,0.09)] sm:p-8">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.07]">{STAGES.prep.icon}</div>
        <div className="relative flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(16,185,129,0.14)]">{STAGES.prep.icon}</span><div><p className="mb-1 text-[10px] font-bold tracking-[0.24em] text-emerald-600">CHAPTER 01</p><h2 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">{STAGES.prep.name}</h2><p className="mt-1 text-sm leading-6 text-brand-500">定义蓝图，让一段珍贵的关系从想象中萌芽。</p></div></div>
      </div>

      <FocusTimer sessionTypes={PREP_SESSION_TYPES} />

      <TraitManager />

      <div className="grid gap-4 sm:grid-cols-2">
        {[{ icon: '🎨', title: '形态设计', copy: '慢慢勾勒熟悉的轮廓与细节' }, { icon: '🏡', title: 'Wonderland', copy: '为你们构建一处安心相见的地方' }].map((item) => (
          <div key={item.title} className="group rounded-[24px] border border-brand-200/70 bg-white/70 p-5 shadow-[0_12px_35px_rgba(74,63,50,0.06)] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_42px_rgba(74,63,50,0.1)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-xl transition-transform group-hover:rotate-3 group-hover:scale-105">{item.icon}</div><h3 className="font-bold text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-6 text-brand-400">{item.copy} · 即将开放</p>
          </div>
        ))}
      </div>
    </div>
  );
}
