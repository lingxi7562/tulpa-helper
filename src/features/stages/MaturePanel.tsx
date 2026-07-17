import FocusTimer from '../forcing/FocusTimer';
import { STAGES } from '../../constants/stages';

export default function MaturePanel() {
  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-purple-200/70 bg-gradient-to-br from-purple-50 via-white to-brand-50 p-6 shadow-[0_20px_55px_rgba(139,92,246,0.09)] sm:p-8">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.07]">{STAGES.mature.icon}</div><div className="relative flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(139,92,246,0.14)]">{STAGES.mature.icon}</span><div><p className="mb-1 text-[10px] font-bold tracking-[0.24em] text-purple-600">CHAPTER 04</p><h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{STAGES.mature.name}</h2><p className="mt-1 text-sm leading-6 text-brand-500">并肩探索高阶练习，也认真珍惜平凡的日常。</p></div></div>
      </div>

      <FocusTimer
        sessionTypes={[
          { label: 'Imposition', value: 'imposition' },
          { label: 'Switching', value: 'switch' },
          { label: 'Possession', value: 'practice' },
        ]}
      />

      <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_16px_45px_rgba(74,63,50,0.08)] sm:p-6">
        <div className="mb-5"><h3 className="font-bold text-brand-900">Imposition 感官练习</h3><p className="mt-1 text-xs text-brand-400">一次只专注一种感受，缓慢建立清晰度</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: '👁', label: '视觉' },
            { icon: '👂', label: '听觉' },
            { icon: '✋', label: '触觉' },
            { icon: '👃', label: '嗅觉' },
          ].map((sense) => (
            <div key={sense.label} className="group rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/70 to-white p-4 text-center transition-all hover:-translate-y-1 hover:border-purple-200 hover:shadow-md">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm transition-transform group-hover:scale-110">{sense.icon}</div><div className="text-xs font-bold text-brand-700">{sense.label}</div><div className="mt-1 text-[9px] font-bold tracking-wider text-purple-400">LEVEL 01</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[{ icon: '🔄', title: 'Switching', copy: '记录每一次视角交换的体验' }, { icon: '✍️', title: 'Possession', copy: '收集合作与控制练习的进展' }].map((item) => <div key={item.title} className="rounded-[24px] border border-purple-200/40 bg-white/75 p-5 shadow-[0_12px_35px_rgba(74,63,50,0.06)] transition-all hover:-translate-y-1 hover:bg-white"><span className="mb-3 block text-xl">{item.icon}</span><h3 className="font-bold text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-5 text-brand-400">{item.copy} · 即将开放</p></div>)}
      </div>

      <div className="rounded-[24px] border border-purple-200/40 bg-gradient-to-r from-purple-50/80 to-white p-5 shadow-sm"><h3 className="font-bold text-brand-900">📅 日常陪伴</h3><p className="mt-1 text-xs leading-5 text-brand-400">长久关系由寻常日子组成 · 热力图与周统计即将开放</p>
      </div>
    </div>
  );
}
