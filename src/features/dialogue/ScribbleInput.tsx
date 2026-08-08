import { useEffect, useRef, useState } from 'react';
import { useStageStore } from '../../stores/useStageStore';
import { useProfileStore } from '../../stores/useProfileStore';
import { useToast } from '../../hooks/useToast';
import { useEntryStore } from '../../stores/useEntryStore';
import { parseDialogueText } from '../../lib/dialogue';
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
  const { addEntry } = useEntryStore();
  const { show } = useToast();
  const tulpaName = useProfileStore(state => state.tulpaName) || 'Ta';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动保存草稿（防抖 1s）
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(text), 1000);
    return () => clearTimeout(timer);
  }, [text]);

  const insertTMarker = () => {
    const el = textareaRef.current;
    const marker = '\n/T ';
    if (!el) { setText(t => t + marker); return; }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    const next = text.slice(0, start) + marker + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + marker.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const previewMessages = parseDialogueText(text);

  const parseAndSave = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      const content = text.trim();
      const entryId = await addEntry({
        stage_id: activeStageId,
        type: 'dialogue',
        title: Array.from(content).slice(0, 50).join(''),
        content,
        tags: '[]',
      });
      setLastEntryId(entryId);
      setRecentEntryIds(prev => [entryId, ...prev].slice(0, 5));
      setText('');
      clearDraft();
      onSaved?.();
    } catch (error) {
      console.error(error);
      show('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4"><div><h3 className="text-base font-black text-brand-900">随手记下此刻</h3><p className="mt-1 text-xs leading-6 text-brand-400">不必整理语言，真实的片刻本就珍贵。</p></div><Badge>速记</Badge></div>
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={insertTMarker}
          className="rounded-full border border-brand-200 bg-white px-2.5 py-1 text-[10px] font-bold text-brand-500 hover:text-brand-800"
          title="在光标处插入 /T，标记下一段为 Ta 的发言"
        >＋ 插入 <code className="rounded-md bg-brand-100 px-1 font-bold">/T</code></button>
        <span className="text-[10px] leading-5 text-brand-400">Ctrl+Enter 保存</span>
      </div>
      <Textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); parseAndSave(); } }} placeholder="我说的话……\n/T Ta 的回应……（/T 之后的内容会标记为 Tulpa 的发言，直到下一个 /T 或文本结束）" className="min-h-32" />
      {previewMessages.length > 1 && (
        <div className="mt-3 rounded-xl border border-brand-100 bg-white/70 p-2">
          <p className="mb-1.5 text-[9px] font-bold text-brand-400">拆分预览</p>
          <div className="space-y-1">
            {previewMessages.map((msg, i) => (
              <p key={i} className={`text-[10px] leading-5 ${msg.speaker === 'tulpa' ? 'text-purple-500' : 'text-brand-600'}`}>
                <span className="mr-1 font-bold">{msg.speaker === 'tulpa' ? tulpaName : '你'}</span>
                {msg.content}
              </p>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><span className="text-[10px] leading-5 text-brand-400"><code className="rounded-md bg-brand-100 px-1.5 py-1 font-bold text-brand-700">/T</code> 之后的内容会被标记为 Tulpa 的发言，直到下一个 <code className="rounded-md bg-brand-100 px-1.5 py-1 font-bold text-brand-700">/T</code> 或文本结束</span><Button onClick={parseAndSave} disabled={!text.trim() || saving} size="sm">{saving ? '保存中…' : '保存记录'}</Button></div>
      <p className="mt-2 text-[10px] leading-5 text-brand-400">
        💭 担心这只是自己的想象？先把它记下来，允许不确定，也不急着归因。
      </p>
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
