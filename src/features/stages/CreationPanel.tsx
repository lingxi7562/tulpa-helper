import { useEffect } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import ScribbleInput from '../dialogue/ScribbleInput';
import { useEntryStore } from '../../stores/useEntryStore';
import { STAGES } from '../../constants/stages';

export default function CreationPanel() {
  const { entries, loadEntries } = useEntryStore();

  useEffect(() => { loadEntries('create'); }, []);

  const stats = {
    sessions: entries.filter(e => e.type === 'session' || e.type === 'narration').length,
    dialogue: entries.filter(e => e.type === 'dialogue').length,
    signals: entries.filter(e => e.type === 'signal').length,
  };

  return (
    <div className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-8 animate-[fadeIn_0.5s_ease-out] sm:px-8 sm:py-10">
      <div className="relative mb-8 overflow-hidden rounded-[32px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-brand-50 p-6 shadow-[0_20px_55px_rgba(245,158,11,0.1)] sm:p-8">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.07]">{STAGES.create.icon}</div>
        <div className="relative flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(245,158,11,0.15)]">{STAGES.create.icon}</span><div><p className="mb-1 text-[10px] font-bold tracking-[0.24em] text-amber-600">CHAPTER 02</p><h2 className="text-2xl font-bold tracking-tight text-brand-900 sm:text-3xl">{STAGES.create.name}</h2><p className="mt-1 text-sm leading-6 text-brand-500">在持续的专注与交流里，感受生命力逐渐清晰。</p></div></div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[{ icon: '⏱', label: '专注会话', value: `${stats.sessions}`, unit: '次' }, { icon: '💬', label: '对话记录', value: `${stats.dialogue}`, unit: '条' }, { icon: '⚡', label: '回应迹象', value: `${stats.signals}`, unit: '次' }, { icon: '🔥', label: '连续坚持', value: '—', unit: '统计中' }].map((item) => (
          <div key={item.label} className="group rounded-[22px] border border-amber-200/50 bg-white/80 p-4 shadow-[0_10px_30px_rgba(74,63,50,0.06)] transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_16px_38px_rgba(245,158,11,0.1)]"><div className="mb-3 flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-base">{item.icon}</span><span className="text-2xl font-bold text-brand-900">{item.value}</span></div><div className="text-xs font-bold text-brand-700">{item.label}</div><div className="mt-0.5 text-[10px] text-brand-400">{item.unit}</div></div>
        ))}
      </div>

      <FocusTimer
        sessionTypes={[
          { label: 'Narration', value: 'narration' },
          { label: 'Active Forcing', value: 'session' },
        ]}
      />

      <ScribbleInput />
    </div>
  );
}
