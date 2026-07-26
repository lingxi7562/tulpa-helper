import { useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { createDialogueMessage } from '../../db/database';
import type { EntryType } from '../../db/schema';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import DialogueDisplay from './DialogueDisplay';

interface Props { onSaved?: () => void; }

export default function ScribbleInput({ onSaved }: Props) {
  const [text, setText] = useState('');
  const [lastEntryId, setLastEntryId] = useState<number | null>(null);
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();
  const parseAndSave = async () => {
    if (!text.trim()) return;
    const entryId = await addEntry({ stage_id: activeStageId, type: 'dialogue' as EntryType, title: text.slice(0, 50), content: text });
    const parts = text.split(/(\/[tT]\s*)/g); let speaker: 'self' | 'tulpa' = 'self'; let seq = 0;
    for (const part of parts) { if (/^\/[tT]\s*$/.test(part)) { speaker = 'tulpa'; continue; } const trimmed = part.trim(); if (trimmed) { await createDialogueMessage({ entry_id: entryId, speaker, content: trimmed, seq: seq++ }); speaker = 'self'; } }
    setLastEntryId(entryId);
    setText(''); onSaved?.();
  };
  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="text-base font-black text-brand-900">随手记下此刻</h3><p className="mt-1 text-xs leading-6 text-brand-400">不必整理语言，真实的片刻本就珍贵。</p></div><Badge>速记</Badge></div>
      <Textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); parseAndSave(); } }} placeholder="写下你们刚刚说过的话，或一个微小的感受……" className="min-h-32" />
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span className="text-[10px] leading-5 text-brand-400">用 <code className="rounded-md bg-brand-100 px-1.5 py-1 font-bold text-brand-700">/T</code> 标记回应 · Ctrl+Enter 保存</span><Button onClick={parseAndSave} disabled={!text.trim()} size="sm">保存记录</Button></div>
      {lastEntryId && <DialogueDisplay entryId={lastEntryId} />}
    </Card>
  );
}
