import { useEffect, useState } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import ScribbleInput from '../dialogue/ScribbleInput';
import { useEntryStore } from '../../stores/useEntryStore';
import { getStageTypeCounts, getConsecutiveDays } from '../../db/database';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useTraitStore } from '../../stores/useTraitStore';
import { useFormStore } from '../../stores/useFormStore';
import SignalInput from '../journal/SignalInput';

const SENSES_MAP: Record<string, { icon: string; style: string }> = {
  visual: { icon: '👁', style: 'border-purple-200 bg-purple-50 text-purple-700' },
  audio: { icon: '👂', style: 'border-blue-200 bg-blue-50 text-blue-700' },
  smell: { icon: '👃', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  touch: { icon: '✋', style: 'border-amber-200 bg-amber-50 text-amber-700' },
  taste: { icon: '👅', style: 'border-rose-200 bg-rose-50 text-rose-700' },
};

export default function CreationPanel() {
  const { loadEntries } = useEntryStore();
  useEffect(() => { loadEntries('create'); }, [loadEntries]);
  const { traits, loadTraits } = useTraitStore();
  useEffect(() => { loadTraits(); }, [loadTraits]);
  const { formDetails, loadFormDetails } = useFormStore();
  useEffect(() => { loadFormDetails(); }, [loadFormDetails]);

  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ session: 0, narration: 0, dialogue: 0, signal: 0 });
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);

  useEffect(() => {
    getStageTypeCounts('create').then(setTypeCounts).catch(console.error);
    getConsecutiveDays().then(setConsecutiveDays).catch(console.error);
  }, []);

  const stats = {
    sessions: (typeCounts.session || 0) + (typeCounts.narration || 0),
    dialogue: typeCounts.dialogue || 0,
    signals: typeCounts.signal || 0,
  };

  const items = [
    { icon: '⏱', label: '专注会话', value: stats.sessions, unit: '次' },
    { icon: '💬', label: '对话记录', value: stats.dialogue, unit: '条' },
    { icon: '⚡', label: '回应迹象', value: stats.signals, unit: '次' },
    { icon: '🔥', label: '连续坚持', value: consecutiveDays > 0 ? consecutiveDays : '—', unit: consecutiveDays > 0 ? '天' : '统计中' },
  ];
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.create.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(245,158,11,.14)]">{STAGES.create.icon}</span><div><Badge variant="create">CHAPTER 02</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.create.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">在持续的专注与交流里，感受生命力逐渐清晰。</p></div></div></Card>
      {traits.length > 0 && (
        <Card padding="sm">
          <p className="mb-2 text-[10px] font-bold text-brand-400">你的蓝图</p>
          <div className="flex flex-wrap gap-1.5">
            {traits.map(trait => (
              <span key={trait.id} className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                {trait.name}
              </span>
            ))}
          </div>
        </Card>
      )}
      {formDetails.length > 0 && (
        <Card padding="sm">
          <p className="mb-2 text-[10px] font-bold text-brand-400">Ta 的样子</p>
          <div className="flex flex-wrap gap-1.5">
            {formDetails.map(d => {
              const sense = SENSES_MAP[d.sense_type];
              return (
                <span key={d.id} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${sense?.style || 'border-brand-200 bg-brand-50 text-brand-600'}`}>
                  <span className="text-[10px]">{sense?.icon || ''}</span>
                  {d.description.slice(0, 20)}{d.description.length > 20 ? '…' : ''}
                </span>
              );
            })}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map(item => <Card key={item.label} padding="sm"><div className="mb-4 flex items-start justify-between gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50">{item.icon}</span><strong className="text-2xl text-brand-900">{item.value}</strong></div><p className="text-xs font-black text-brand-700">{item.label}</p><p className="mt-1 text-[10px] text-brand-400">{item.unit}</p></Card>)}</div>
      <SignalInput />
      <FocusTimer sessionTypes={[{ label: 'Narration', value: 'narration' }, { label: 'Active Forcing', value: 'session' }]} />
      <ScribbleInput />
    </div>
  );
}
