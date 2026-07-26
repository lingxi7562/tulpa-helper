import { useState, useEffect } from 'react';
import { useFormStore } from '../../stores/useFormStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';

const SENSES = [
  { type: 'visual', label: '视觉', icon: '👁', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
  { type: 'audio', label: '听觉', icon: '👂', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
  { type: 'smell', label: '嗅觉', icon: '👃', bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  { type: 'touch', label: '触觉', icon: '✋', bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  { type: 'taste', label: '味觉', icon: '👅', bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
] as const;

type SenseType = typeof SENSES[number]['type'];

export default function FormBuilder() {
  const { formDetails, loadFormDetails, saveFormDetail, updateFormDetail, deleteFormDetail } = useFormStore();
  const [activeSense, setActiveSense] = useState<SenseType>('visual');
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { loadFormDetails(); }, [loadFormDetails]);

  const currentDetails = formDetails.filter(d => d.sense_type === activeSense);
  const activeSenseInfo = SENSES.find(s => s.type === activeSense)!;

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateFormDetail(editingId, draft.trim());
        setEditingId(null);
      } else {
        await saveFormDetail(activeSense, draft.trim());
      }
      setDraft('');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return;
    setDeletingId(id);
    try {
      await deleteFormDetail(id);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id: number, description: string) => {
    if (saving) return;
    setEditingId(id);
    setDraft(description);
  };

  const handleCancel = () => {
    setEditingId(null);
    setDraft('');
  };

  const switchSense = (sense: SenseType) => {
    if (saving) return;
    setActiveSense(sense);
    setEditingId(null);
    setDraft('');
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">形态设计</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">一个基础轮廓就足够——Ta 会自然长成自己的样子。</p>
        </div>
        <Badge variant={formDetails.length >= 5 ? 'prep' : 'prep'}>{formDetails.length} 项</Badge>
      </div>

      {formDetails.length >= 3 && (
        <p className="mb-3 text-center text-[10px] text-emerald-600 font-bold">✨ 已有基础轮廓，可以开始了</p>
      )}

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-brand-50 p-1">
        {SENSES.map(sense => {
          const count = formDetails.filter(d => d.sense_type === sense.type).length;
          return (
            <button
              key={sense.type}
              onClick={() => switchSense(sense.type)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                activeSense === sense.type
                  ? `${sense.bg} ${sense.text} ${sense.border} border shadow-sm`
                  : 'text-brand-500 hover:text-brand-800 border border-transparent'
              }`}
            >
              <span>{sense.icon}</span>
              <span>{sense.label}</span>
              {count > 0 && <span className="ml-0.5 rounded-full bg-white/70 px-1 text-[9px] tabular-nums">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="mb-4 space-y-2">
        {currentDetails.length ? currentDetails.map(detail => (
          <div
            key={detail.id}
            className={`group rounded-2xl border ${activeSenseInfo.border} ${activeSenseInfo.bg} p-3`}
          >
            {editingId === detail.id ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  className="min-h-20"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? '保存中…' : '保存'}</Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>取消</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-6 text-brand-700 flex-1">{detail.description}</p>
                <div className="flex gap-1 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(detail.id, detail.description)}
                    disabled={saving}
                    className="grid h-7 w-7 place-items-center rounded-full text-xs text-brand-500 hover:bg-white disabled:opacity-30"
                    aria-label="编辑"
                  >✎</button>
                  {deletingId === detail.id ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1 py-0.5">
                      <button
                        onClick={() => handleDelete(detail.id)}
                        disabled={deletingId !== detail.id}
                        className="grid h-7 min-w-7 place-items-center rounded-full bg-red-600 px-2 text-[10px] font-bold text-white"
                      >确认</button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="grid h-7 min-w-7 place-items-center rounded-full bg-white px-2 text-[10px] font-bold text-brand-600"
                      >取消</button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeletingId(detail.id)}
                      className="grid h-7 w-7 place-items-center rounded-full text-xs text-red-500 hover:bg-red-50"
                      aria-label="删除"
                    >×</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )) : (
          <p className="text-xs text-brand-400 py-2">不需要面面俱到——想到什么就记下什么。</p>
        )}
      </div>

      {editingId === null && (
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={`描述${activeSenseInfo.label}方面的形态细节...`}
            className="min-h-20"
          />
          <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
            {saving ? '保存中…' : `添加${activeSenseInfo.label}描述`}
          </Button>
        </div>
      )}
    </Card>
  );
}
