import ScribbleInput from '../dialogue/ScribbleInput';
import FocusTimer from '../forcing/FocusTimer';
import { STAGES } from '../../constants/stages';

export default function DevelopmentPanel() {
  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-brand-50 p-6 shadow-[0_20px_55px_rgba(59,130,246,0.09)] sm:p-8">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.07]">{STAGES.dev.icon}</div><div className="relative flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(59,130,246,0.14)]">{STAGES.dev.icon}</span><div><p className="mb-1 text-[10px] font-bold tracking-[0.24em] text-blue-600">CHAPTER 03</p><h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">{STAGES.dev.name}</h2><p className="mt-1 text-sm leading-6 text-brand-500">倾听独立的声音，在相互理解中深化连接。</p></div></div>
      </div>

      <FocusTimer
        sessionTypes={[{ label: '对话会话', value: 'dialogue_session' }]}
      />

      <ScribbleInput />

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ icon: '🧠', title: '自主性观察', copy: '记录主动表达与独立选择' }, { icon: '🏡', title: '空间互动', copy: '收藏心象空间里的活动' }, { icon: '💗', title: '情感共振', copy: '留意每日共鸣的细微变化' }].map((item) => (
          <div key={item.title} className="group rounded-[24px] border border-blue-200/40 bg-white/75 p-5 shadow-[0_12px_35px_rgba(74,63,50,0.06)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:bg-white"><span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">{item.icon}</span><h3 className="text-sm font-bold text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-5 text-brand-400">{item.copy} · 即将开放</p></div>
        ))}
      </div>
    </div>
  );
}
