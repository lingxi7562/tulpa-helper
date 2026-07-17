import { useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { createDialogueMessage } from '../../db/database';
import type { EntryType } from '../../db/schema';

interface Props {
  onSaved?: () => void;
}

export default function ScribbleInput({ onSaved }: Props) {
  const [text, setText] = useState('');
  const { addEntry } = useEntryStore();
  const { activeStageId } = useStageStore();

  const parseAndSave = async () => {
    if (!text.trim()) return;
    const entryId = await addEntry({
      stage_id: activeStageId,
      type: 'dialogue' as EntryType,
      title: text.slice(0, 50),
      content: text,
    });
    const parts = text.split(/(\/[tT]\s*)/g);
    let speaker: 'self' | 'tulpa' = 'self';
    let seq = 0;
    for (const part of parts) {
      if (/^\/[tT]\s*$/.test(part)) { speaker = 'tulpa'; continue; }
      const trimmed = part.trim();
      if (trimmed) {
        await createDialogueMessage({ entry_id: entryId, speaker, content: trimmed, seq: seq++ });
        speaker = 'self';
      }
    }
    setText('');
    onSaved?.();
  };

  return (
    <div className="group rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_16px_45px_rgba(74,63,50,0.08)] transition-all duration-300 hover:shadow-[0_20px_55px_rgba(74,63,50,0.12)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div><h3 className="font-bold text-brand-900">随手记下此刻</h3><p className="mt-1 text-xs leading-relaxed text-brand-400">不必整理语言，真实的片刻本就珍贵</p></div>
        <span className="rounded-xl bg-brand-100 px-2.5 py-1.5 text-[10px] font-bold text-brand-600">速记</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            parseAndSave();
          }
        }}
        className="min-h-[112px] w-full resize-none rounded-2xl border border-brand-200/80 bg-brand-50/60 p-4 text-sm leading-7 text-brand-900 outline-none transition-all placeholder:text-brand-300 focus:border-brand-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(212,201,179,0.22)]"
        placeholder="写下你们刚刚说过的话，或一个微小的感受……"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[10px] leading-5 text-brand-400">用 <code className="rounded-md bg-brand-100 px-1.5 py-0.5 font-bold text-brand-600">/T</code> 标记回应 · Ctrl+Enter 保存</span>
        <button
          onClick={parseAndSave}
          disabled={!text.trim()}
          className="rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(74,63,50,0.2)] transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:translate-y-0 disabled:opacity-30 disabled:shadow-none"
        >
          保存
        </button>
      </div>
    </div>
  );
}
