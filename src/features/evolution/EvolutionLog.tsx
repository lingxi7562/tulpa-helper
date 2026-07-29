import { useCallback, useEffect, useState } from 'react';
import { createDeviation, deleteDeviation, getDeviations } from '../../db/database';
import type { Deviation, DeviationTargetType } from '../../db/schema';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';

interface Props {
  targetType: DeviationTargetType;
  targetId: number;
}

export default function EvolutionLog({ targetType, targetId }: Props) {
  const [notes, setNotes] = useState<Deviation[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    try { setNotes(await getDeviations(targetType, targetId)); }
    catch (error) { console.error(error); }
  }, [targetId, targetType]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      await createDeviation(targetType, targetId, draft.trim());
      setDraft('');
      await loadNotes();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (saving || !window.confirm('确定删除这条偏离记录？')) return;
    setSaving(true);
    try {
      await deleteDeviation(id);
      await loadNotes();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 border-t border-brand-200/60 pt-2">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
        aria-expanded={open}
      >
        {open ? '收起演化记录' : `演化记录${notes.length ? `（${notes.length}）` : ''}`}
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-xl bg-white/60 p-2">
          <p className="text-[10px] leading-5 text-brand-400">偏离最初设想是健康而自然的成长。记下 Ta 改变了什么，以及你何时发现。</p>
          {notes.map(note => (
            <div key={note.id} className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap text-[11px] leading-5 text-brand-700">{note.note}</p>
                <button type="button" onClick={() => handleDelete(note.id)} disabled={saving} className="shrink-0 text-[10px] text-red-400 hover:text-red-600 disabled:opacity-30" aria-label="删除偏离记录">×</button>
              </div>
              <p className="mt-1 text-[9px] font-bold text-emerald-500">{note.created_at?.slice(0, 16)}</p>
            </div>
          ))}
          <Textarea
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="偏离记录：Ta 变得更……；我在今天发现……"
            className="!min-h-16 text-xs"
            disabled={saving}
          />
          <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
            {saving ? '保存中…' : '添加偏离记录'}
          </Button>
        </div>
      )}
    </div>
  );
}
