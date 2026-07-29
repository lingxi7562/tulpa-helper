import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useEntryStore } from '../../stores/useEntryStore';
import { useStageStore } from '../../stores/useStageStore';

export default function QuickNarration() {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const addEntry = useEntryStore(state => state.addEntry);
  const activeStageId = useStageStore(state => state.activeStageId);
  const showToast = useToast(state => state.show);

  const handleSave = async () => {
    const content = text.trim();
    if (!content || saving) return;
    setSaving(true);
    try {
      await addEntry({
        stage_id: activeStageId,
        type: 'narration',
        title: content.slice(0, 50),
        content,
      });
      setText('');
      showToast('随手记已保存');
    } catch (error) {
      console.error(error);
      showToast('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-brand-200 bg-white/75 px-1.5 shadow-sm sm:max-w-80">
      <span className="shrink-0 pl-2 text-[10px] font-bold text-brand-500">随手记</span>
      <input
        value={text}
        onChange={event => setText(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSave();
          }
        }}
        placeholder="今天和 Ta 聊了..."
        disabled={saving}
        className="min-w-0 flex-1 bg-transparent px-2 text-xs text-brand-700 outline-none placeholder:text-brand-300"
        aria-label="快速记录被动 forcing 叙述"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!text.trim() || saving}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-900 text-xs text-white hover:bg-brand-700 disabled:opacity-30"
        title="保存随手记"
        aria-label="保存随手记"
      >
        {saving ? '…' : '↑'}
      </button>
    </div>
  );
}
