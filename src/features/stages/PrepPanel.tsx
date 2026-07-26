import { useEffect } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import TraitManager from '../traits/TraitManager';
import { useTraitStore } from '../../stores/useTraitStore';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CommitmentConfirm from '../journal/CommitmentConfirm';

const PREP_SESSION_TYPES = [{ label: '蓝图设计', value: 'design' }];

export default function PrepPanel() {
  const { loadTraits } = useTraitStore();
  useEffect(() => { loadTraits(); }, [loadTraits]);
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-brand-50">
        <div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.prep.icon}</div>
        <div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(16,185,129,.14)]">{STAGES.prep.icon}</span><div><Badge variant="prep">CHAPTER 01</Badge><h1 className="mt-3 text-2xl font-black tracking-tight text-brand-900 sm:text-3xl">{STAGES.prep.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">定义蓝图，让一段珍贵的关系从想象中萌芽。</p></div></div>
      </Card>
      <FocusTimer sessionTypes={PREP_SESSION_TYPES} />
      <TraitManager />
      <div className="grid gap-4 sm:grid-cols-2">{[{ icon: '🎨', title: '形态设计', copy: '慢慢勾勒熟悉的轮廓与细节' }, { icon: '🏡', title: 'Wonderland', copy: '为你们构建一处安心相见的地方' }].map(item => <Card key={item.title}><span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand-100 text-xl">{item.icon}</span><h3 className="font-black text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-6 text-brand-400">{item.copy} · 即将开放</p></Card>)}</div>
      <CommitmentConfirm />
    </div>
  );
}
