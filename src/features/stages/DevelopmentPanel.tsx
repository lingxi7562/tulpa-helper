import ScribbleInput from '../dialogue/ScribbleInput';
import FocusTimer from '../forcing/FocusTimer';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function DevelopmentPanel() {
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.dev.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(59,130,246,.14)]">{STAGES.dev.icon}</span><div><Badge variant="dev">CHAPTER 03</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.dev.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">倾听独立的声音，在相互理解中深化连接。</p></div></div></Card>
      <FocusTimer sessionTypes={[{ label: '对话会话', value: 'dialogue_session' }]} />
      <ScribbleInput />
      <div className="grid gap-4 sm:grid-cols-3">{[{ icon: '🧠', title: '自主性观察', copy: '记录主动表达与独立选择' }, { icon: '🏡', title: '空间互动', copy: '收藏心象空间里的活动' }, { icon: '💗', title: '情感共振', copy: '留意每日共鸣的细微变化' }].map(item => <Card key={item.title}><span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-lg">{item.icon}</span><h3 className="text-sm font-black text-brand-900">{item.title}</h3><p className="mt-1 text-xs leading-5 text-brand-400">{item.copy} · 即将开放</p></Card>)}</div>
    </div>
  );
}
