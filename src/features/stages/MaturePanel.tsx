import FocusTimer from '../forcing/FocusTimer';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function MaturePanel() {
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-purple-200/70 bg-gradient-to-br from-purple-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.mature.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(139,92,246,.14)]">{STAGES.mature.icon}</span><div><Badge variant="mature">CHAPTER 04</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.mature.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">并肩探索高阶练习，也认真珍惜平凡的日常。</p></div></div></Card>
      <FocusTimer sessionTypes={[{ label: 'Imposition', value: 'imposition' }, { label: 'Switching', value: 'switch' }, { label: 'Possession', value: 'practice' }]} />
      <Card hoverable={false}><div className="mb-5"><h3 className="font-black text-brand-900">Imposition 感官练习</h3><p className="mt-1 text-xs text-brand-400">一次只专注一种感受，缓慢建立清晰度。</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ icon: '👁', label: '视觉' }, { icon: '👂', label: '听觉' }, { icon: '✋', label: '触觉' }, { icon: '👃', label: '嗅觉' }].map(sense => <div key={sense.label} className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 text-center"><span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm">{sense.icon}</span><p className="text-xs font-black text-brand-700">{sense.label}</p><p className="mt-1 text-[9px] font-black tracking-wider text-purple-400">LEVEL 01</p></div>)}</div></Card>
      <div className="grid gap-4 sm:grid-cols-2">{[{ icon: '🔄', title: 'Switching', copy: '记录每一次视角交换的体验' }, { icon: '✍️', title: 'Possession', copy: '收集合作与控制练习的进展' }].map(item => <Card key={item.title}><span className="mb-3 block text-xl">{item.icon}</span><h3 className="font-black text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-5 text-brand-400">{item.copy} · 即将开放</p></Card>)}</div>
      <Card className="border-purple-200/50 bg-gradient-to-r from-purple-50/80 to-white"><h3 className="font-black text-brand-900">📅 日常陪伴</h3><p className="mt-1 text-xs leading-5 text-brand-400">长久关系由寻常日子组成 · 热力图与周统计即将开放</p></Card>
    </div>
  );
}
