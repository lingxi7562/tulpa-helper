import { useEffect } from 'react';
import ScribbleInput from '../dialogue/ScribbleInput';
import FocusTimer from '../forcing/FocusTimer';
import AutonomyLog from '../journal/AutonomyLog';
import WonderlandEditor from '../wonderland/WonderlandEditor';
import ResonanceTracker from '../journal/ResonanceTracker';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useTraitStore } from '../../stores/useTraitStore';
import { useFormStore } from '../../stores/useFormStore';

const SENSES_MAP: Record<string, { icon: string; style: string }> = {
  visual: { icon: '👁', style: 'border-purple-200 bg-purple-50 text-purple-700' },
  audio: { icon: '👂', style: 'border-blue-200 bg-blue-50 text-blue-700' },
  smell: { icon: '👃', style: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  touch: { icon: '✋', style: 'border-amber-200 bg-amber-50 text-amber-700' },
  taste: { icon: '👅', style: 'border-rose-200 bg-rose-50 text-rose-700' },
};

export default function DevelopmentPanel() {
  const { traits, loadTraits } = useTraitStore();
  useEffect(() => { loadTraits(); }, [loadTraits]);
  const { formDetails, loadFormDetails } = useFormStore();
  useEffect(() => { loadFormDetails(); }, [loadFormDetails]);

  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.dev.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(59,130,246,.14)]">{STAGES.dev.icon}</span><div><Badge variant="dev">CHAPTER 03</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.dev.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">倾听独立的声音，在相互理解中深化连接。</p></div></div></Card>
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
      <FocusTimer sessionTypes={[{ label: '对话会话', value: 'dialogue_session' }]} />
      <ScribbleInput />
      <AutonomyLog />
      <WonderlandEditor stageId="dev" />
      <ResonanceTracker />
    </div>
  );
}
