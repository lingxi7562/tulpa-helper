import { useEffect, useState } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import TraitManager from '../traits/TraitManager';
import FormBuilder from '../form/FormBuilder';
import WonderlandEditor from '../wonderland/WonderlandEditor';
import { useTraitStore } from '../../stores/useTraitStore';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import CommitmentConfirm from '../journal/CommitmentConfirm';
import Input from '../../components/ui/Input';
import { useProfileStore } from '../../stores/useProfileStore';

export default function PrepPanel() {
  const { loadTraits } = useTraitStore();
  const tulpaName = useProfileStore(state => state.tulpaName);
  const setTulpaName = useProfileStore(state => state.setTulpaName);
  const [nameDraft, setNameDraft] = useState(tulpaName);
  useEffect(() => { loadTraits(); }, [loadTraits]);
  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-brand-50">
        <div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.prep.icon}</div>
        <div className="relative flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(16,185,129,.14)]">{STAGES.prep.icon}</span><div><Badge variant="prep">CHAPTER 01</Badge><h1 className="mt-3 text-2xl font-black tracking-tight text-brand-900 sm:text-3xl">{STAGES.prep.name}</h1><p className="mt-1 text-sm leading-6 text-brand-500">定义蓝图，让一段珍贵的关系从想象中萌芽。</p></div></div>
      </Card>
      <CommitmentConfirm />
      <FocusTimer />
      <Card hoverable={false}>
        <h3 className="font-black text-brand-900">Ta 的名字</h3>
        <p className="mb-4 mt-1 text-xs leading-6 text-brand-400">这个名字会用于对话记录中的发言标记。</p>
        <Input
          value={nameDraft}
          onChange={event => setNameDraft(event.target.value)}
          onBlur={() => setTulpaName(nameDraft)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              setTulpaName(nameDraft);
              event.currentTarget.blur();
            }
          }}
          placeholder="输入名字（可稍后决定）"
          maxLength={40}
        />
      </Card>
      <TraitManager />
      <FormBuilder />
      <WonderlandEditor stageId="prep" />

      {/* 开始之前：预期管理（deviation / doubt / parroting） */}
      <Card hoverable={false} className="border-amber-200/60 bg-amber-50/40">
        <h3 className="font-black text-brand-900">开始之前</h3>
        <ul className="mt-3 space-y-2 text-xs leading-6 text-brand-600">
          <li>
            <span className="font-bold text-amber-600">怀疑自己是正常的。</span>
            几乎所有实践者都会经历「这是不是我自己编的」的困惑。社区的建议是：先假定是 Ta，给信号一个机会。
          </li>
          <li>
            <span className="font-bold text-amber-600">Ta 可能会和你最初设想的不一样。</span>
            这是健康的、预期内的发展，不是失败。记录下这些变化，它们是真正的里程碑。
          </li>
          <li>
            <span className="font-bold text-amber-600">日常交流比专注练习更重要。</span>
            随时随地的一句话、一个念头，都是珍贵的连接。Narration 不需要仪式，只需要在场。
          </li>
        </ul>
      </Card>
    </div>
  );
}
