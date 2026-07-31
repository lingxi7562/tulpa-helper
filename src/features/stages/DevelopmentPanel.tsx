import ScribbleInput from '../dialogue/ScribbleInput';
import FocusTimer from '../forcing/FocusTimer';
import AutonomyLog from '../journal/AutonomyLog';
import WonderlandEditor from '../wonderland/WonderlandEditor';
import ResonanceTracker from '../journal/ResonanceTracker';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TraitSummary from '../traits/TraitSummary';
import FormSummary from '../form/FormSummary';

export default function DevelopmentPanel() {
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-brand-50"><div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.dev.icon}</div><div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(59,130,246,.14)]">{STAGES.dev.icon}</span><div><Badge variant="dev">CHAPTER 03</Badge><h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.dev.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">倾听独立的声音，在相互理解中深化连接。</p></div></div></Card>
      <TraitSummary />
      <FormSummary />
      <FocusTimer sessionTypes={[{ label: '对话会话', value: 'dialogue_session' }]} />
      <ScribbleInput />
      <AutonomyLog />
      <WonderlandEditor stageId="dev" variant="dev" />
      <ResonanceTracker />
    </div>
  );
}
