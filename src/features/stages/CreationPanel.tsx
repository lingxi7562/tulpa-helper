import { useEffect, useState } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import ScribbleInput from '../dialogue/ScribbleInput';
import { useEntryStore } from '../../stores/useEntryStore';
import { getStageTypeCounts, getConsecutiveDays } from '../../db/database';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import SignalInput from '../journal/SignalInput';
import TraitSummary from '../traits/TraitSummary';
import FormSummary from '../form/FormSummary';

export default function CreationPanel() {
  const { loadEntries } = useEntryStore();
  const entryRevision = useEntryStore(state => state.revision);
  useEffect(() => { loadEntries('create'); }, [loadEntries]);

  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ session: 0, narration: 0, dialogue: 0, signal: 0 });
  const [consecutiveDays, setConsecutiveDays] = useState<number>(0);

  useEffect(() => {
    getStageTypeCounts('create').then(setTypeCounts).catch(console.error);
    getConsecutiveDays().then(setConsecutiveDays).catch(console.error);
  }, [entryRevision]);

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
      <Card hoverable={false} padding="lg" className="relative border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.create.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(245,158,11,.14)]">{STAGES.create.icon}</span><div><Badge variant="create">CHAPTER 02</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.create.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">在持续的陪伴与交流里，让关系按自己的节奏展开。</p></div></div></Card>
      <TraitSummary />
      <FormSummary />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map(item => <Card key={item.label} padding="sm"><div className="mb-4 flex items-start justify-between gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50">{item.icon}</span><strong className="text-2xl text-brand-900">{item.value}</strong></div><p className="text-xs font-black text-brand-700">{item.label}</p><p className="mt-1 text-[10px] text-brand-400">{item.unit}</p></Card>)}</div>
      <SignalInput />
      <FocusTimer />
      <ScribbleInput />
    </div>
  );
}
