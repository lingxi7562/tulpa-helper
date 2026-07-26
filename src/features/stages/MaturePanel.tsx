import { useState, useEffect, useCallback } from 'react';
import FocusTimer from '../forcing/FocusTimer';
import SwitchingLog from '../journal/SwitchingLog';
import PossessionLog from '../journal/PossessionLog';
import { getImpositionLevels, setImpositionLevel } from '../../db/database';
import { useStats } from '../../hooks/useStats';
import { STAGES } from '../../constants/stages';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Heatmap from '../../components/ui/Heatmap';
import { useFormStore } from '../../stores/useFormStore';

const SENSES = [
  { type: 'visual', label: '视觉', icon: '👁', priority: 'primary' as const },
  { type: 'audio', label: '听觉', icon: '👂', priority: 'primary' as const },
  { type: 'touch', label: '触觉', icon: '✋', priority: 'primary' as const },
  { type: 'smell', label: '嗅觉', icon: '👃', priority: 'secondary' as const },
  { type: 'taste', label: '味觉', icon: '👅', priority: 'secondary' as const },
] as const;

const IMPOSITION_STAGES = [
  { level: 1, name: '存在感', desc: '能感知 Ta 在身旁' },
  { level: 2, name: '闪现', desc: '偶尔捕捉到模糊轮廓' },
  { level: 3, name: '稳定', desc: '持续可见的清晰形态' },
  { level: 4, name: '不透明', desc: '无法看穿，完全清晰' },
] as const;

const MAX_LEVEL = 4;

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
}

export default function MaturePanel() {
  const [levels, setLevels] = useState<{ sense_type: string; level: number }[]>([]);
  const [editingSense, setEditingSense] = useState<string | null>(null);
  const [savingSense, setSavingSense] = useState<string | null>(null);
  const { heatmapData, stageBreakdown, totalSeconds, refresh } = useStats();
  const { formDetails, loadFormDetails } = useFormStore();

  const loadLevels = useCallback(async () => {
    try { setLevels(await getImpositionLevels()); } catch (e) { console.error(e); }
  }, []);
  useEffect(() => { loadLevels(); }, [loadLevels]);
  useEffect(() => { loadFormDetails(); }, [loadFormDetails]);

  const handleLevel = async (sense: string, level: number) => {
    if (savingSense !== null) return;
    setSavingSense(sense);
    try {
      await setImpositionLevel(sense, level);
      await loadLevels();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSense(null);
    }
  };

  const toggleEdit = (sense: string) => {
    if (savingSense !== null) return;
    setEditingSense(current => current === sense ? null : sense);
  };

  return (
    <div className="panel-page space-y-5">
      <Card hoverable={false} padding="lg" className="relative border-purple-200/70 bg-gradient-to-br from-purple-50 via-white to-brand-50">
        <div className="pointer-events-none absolute -right-7 -top-10 text-[128px] opacity-[.055]">{STAGES.mature.icon}</div>
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_10px_24px_rgba(139,92,246,.14)]">{STAGES.mature.icon}</span>
          <div>
            <Badge variant="mature">CHAPTER 04</Badge>
            <h1 className="mt-3 text-2xl font-black text-brand-900 sm:text-3xl">{STAGES.mature.name}</h1>
            <p className="mt-1 text-sm leading-6 text-brand-500">并肩探索高阶练习，也认真珍惜平凡的日常。</p>
          </div>
        </div>
      </Card>

      <FocusTimer
        sessionTypes={[{ label: 'Imposition', value: 'imposition' }, { label: 'Switching', value: 'switch' }, { label: 'Possession', value: 'practice' }]}
        onComplete={refresh}
      />

      <Card hoverable={false}>
        <div className="mb-5">
          <h3 className="font-black text-brand-900">Imposition 感官练习</h3>
          <p className="mt-1 text-xs text-brand-400">一次只专注一种感受，缓慢建立清晰度。</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SENSES.map(sense => {
            const lvl = levels.find(l => l.sense_type === sense.type);
            const lv = lvl?.level ?? 1;
            const editing = editingSense === sense.type;
            const isSaving = savingSense === sense.type;
            return (
              <div
                key={sense.type}
                className={`rounded-2xl border p-4 text-center ${
                  sense.priority === 'secondary'
                    ? 'border-purple-50 bg-purple-50/30 opacity-75'
                    : 'border-purple-100 bg-purple-50/50'
                }`}
              >
                <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-white text-lg shadow-sm">{sense.icon}</span>
                <p className="text-xs font-black text-brand-700">{sense.label}</p>
                {editing ? (
                  <div className="mt-2">
                    {(() => {
                      const formForSense = formDetails.filter(d => d.sense_type === sense.type);
                      return formForSense.length > 0 ? (
                        <div className="mb-2 mt-1 max-h-16 overflow-y-auto rounded-lg bg-white/70 p-1.5 text-left">
                          {formForSense.slice(0, 2).map(d => (
                            <p key={d.id} className="text-[10px] leading-relaxed text-brand-500">&quot;{d.description.slice(0, 40)}{d.description.length > 40 ? '…' : ''}&quot;</p>
                          ))}
                          {formForSense.length > 2 && <p className="text-[9px] text-brand-400">+{formForSense.length - 2} 条</p>}
                        </div>
                      ) : (
                        <p className="mb-2 mt-1 text-[9px] text-brand-400">准备期未记录{sense.label}描述</p>
                      );
                    })()}
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleLevel(sense.type, Math.max(1, lv - 1))}
                        disabled={isSaving || lv <= 1}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white text-lg font-bold text-purple-600 hover:bg-purple-100 disabled:opacity-30"
                        aria-label="减少等级"
                      >−</button>
                      <span className="min-w-[2em] text-center text-xs font-black text-purple-700 tabular-nums">
                        {isSaving ? '…' : (IMPOSITION_STAGES[lv - 1]?.name || lv)}
                      </span>
                      <button
                        onClick={() => handleLevel(sense.type, Math.min(MAX_LEVEL, lv + 1))}
                        disabled={isSaving || lv >= MAX_LEVEL}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white text-lg font-bold text-purple-600 hover:bg-purple-100 disabled:opacity-30"
                        aria-label="增加等级"
                      >+</button>
                    </div>
                    <p className="mt-1 text-[9px] text-purple-400">{IMPOSITION_STAGES[lv - 1]?.desc}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleEdit(sense.type)}
                    disabled={savingSense !== null}
                    className="mt-2 inline-flex min-h-8 items-center justify-center rounded-full px-2 text-[10px] font-black tracking-wider text-purple-400 hover:text-purple-600 disabled:opacity-30"
                  >{IMPOSITION_STAGES[lv - 1]?.name || `LEVEL ${String(lv).padStart(2, '0')}`}</button>
                )}
                {sense.priority === 'secondary' && (
                  <span className="mt-1 block text-[9px] text-purple-300">进阶</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <SwitchingLog onSaved={refresh} />
      <PossessionLog onSaved={refresh} />

      <Card hoverable={false}>
        <div className="mb-5">
          <h3 className="font-black text-brand-900">日常陪伴</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">长久关系由寻常日子组成。</p>
        </div>
        <Heatmap data={heatmapData.map(item => ({ date: item.day, value: item.total }))} days={30} />
      </Card>

      <Card hoverable={false}>
        <div className="mb-5">
          <h3 className="font-black text-brand-900">历程概览</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">总时长 {formatDuration(totalSeconds)}</p>
        </div>
        <div className="space-y-3">
          {stageBreakdown.length > 0 ? stageBreakdown.map(item => {
            const id = item.stage_id as keyof typeof STAGES;
            const info = STAGES[id];
            const rawPct = totalSeconds > 0 ? (item.total / totalSeconds) * 100 : 0;
            const displayPct = Math.round(rawPct);
            const width = rawPct > 0 ? Math.max(rawPct, 1) : 0;
            return (
              <div key={item.stage_id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-brand-700">{info?.name ?? item.stage_id}</span>
                  <span className="text-[10px] text-brand-400">{formatDuration(item.total)} · {displayPct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-brand-100">
                  <div className={`h-full rounded-full ${info?.color ?? 'bg-brand-400'} transition-all duration-700`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          }) : <p className="text-xs text-brand-400">完成专注后，这里会出现阶段分布。</p>}
        </div>
      </Card>
    </div>
  );
}
