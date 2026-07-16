import { useState } from 'react';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';
import { createDialogueMessage } from '../../db/database';

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
      type: 'dialogue' as any,
      title: text.slice(0, 50),
      content: text,
    });
    const parts = text.split(/(\/T\s)/);
    let speaker: 'self' | 'tulpa' = 'self';
    let seq = 0;
    for (const part of parts) {
      if (part === '/T ') { speaker = 'tulpa'; continue; }
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
    <div className="bg-white border border-brand-200 rounded-2xl p-4 shadow-sm">
      <div className="text-xs text-brand-400 mb-2">
        输入内容，用 <code className="bg-brand-100 px-1 rounded">/T</code> 标记 tulpa 的回应
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
        className="w-full border border-brand-200 rounded-lg p-3 text-sm resize-none outline-none focus:border-brand-500 min-h-[80px]"
        placeholder="记录你与 tulpa 的交流… (Ctrl+Enter 保存)"
      />
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-brand-300">Ctrl+Enter 保存并解析</span>
        <button
          onClick={parseAndSave}
          disabled={!text.trim()}
          className="bg-brand-900 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-brand-800 disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  );
}
