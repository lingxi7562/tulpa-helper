import { useEffect, useState } from 'react';
import { useStageStore } from '../../stores/useStageStore';
import { createDialogueEntry } from '../../db/database';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import DialogueDisplay from './DialogueDisplay';

const DRAFT_KEY = 'scribble-draft';

function loadDraft(): string {
  try { return localStorage.getItem(DRAFT_KEY) || ''; }
  catch { return ''; }
}
function saveDraft(text: string) {
  try { localStorage.setItem(DRAFT_KEY, text); }
  catch { /* noop */ }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); }
  catch { /* noop */ }
}

interface Props { onSaved?: () => void; }

export default function ScribbleInput({ onSaved }: Props) {
  const [text, setText] = useState(() => loadDraft());
  const [lastEntryId, setLastEntryId] = useState<number | null>(null);
  const [recentEntryIds, setRecentEntryIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const { activeStageId } = useStageStore();

  // 自动保存草稿（防抖 1s）
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(text), 1000);
    return () => clearTimeout(timer);
  }, [text]);

  const parseAndSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const parts = text.split(/(^|\s)(\/[tT])(?=\s|$)/g);
      const messages: { speaker: 'self' | 'tulpa'; content: string }[] = [];
      let speaker: 'self' | 'tulpa' = 'self';
      for (const part of parts) {
        if (/^\/[tT]$/.test(part)) { speaker = 'tulpa'; continue; }
        const trimmed = part.trim();
        if (trimmed) { messages.push({ speaker, content: trimmed }); speaker = 'self'; }
      }
      const entryId = await createDialogueEntry({ stage_id: activeStageId, text: text.trim(), messages });
      setLastEntryId(entryId);
      setRecentEntryIds(prev => [entryId, ...prev].slice(0, 5));
      setText('');
      clearDraft();
      onSaved?.();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="text-base font-black text-brand-900">随手记下此刻</h3><p className="mt-1 text-xs leading-6 text-brand-400">不必整理语言，真实的片刻本就珍贵。</p></div><Badge>速记</Badge></div>
      <Textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); parseAndSave(); } }} placeholder="我说的话……\n/T Ta 的回应……（/T 标记下一段为 Ta 的话）" className="min-h-32" />
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span className="text-[10px] leading-5 text-brand-400">在回应内容前加 <code className="rounded-md bg-brand-100 px-1.5 py-1 font-bold text-brand-700">/T</code>（只影响紧接的一段）· Ctrl+Enter 保存</span><Button onClick={parseAndSave} disabled={!text.trim() || saving} size="sm">{saving ? '保存中…' : '保存记录'}</Button></div>
      {recentEntryIds.length > 0 && (
        <div className="mt-4 space-y-3">
          {recentEntryIds.map(id => (
            <DialogueDisplay key={id} entryId={id} />
          ))}
        </div>
      )}
      {lastEntryId && recentEntryIds.length === 0 && <DialogueDisplay entryId={lastEntryId} />}
    </Card>
  );
}
