import { useState, useEffect, useCallback } from 'react';
import { getMilestones, createMilestone, deleteMilestone } from '../../db/database';
import { useStageStore } from '../../stores/useStageStore';
import type { Milestone } from '../../db/schema';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input, { Textarea } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

export default function MilestoneList() {
  const { activeStageId } = useStageStore();
  const showToast = useToast(state => state.show);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try { setMilestones(await getMilestones(activeStageId) as Milestone[]); }
    catch (e) { console.error(e); setLoadError(true); }
  }, [activeStageId]);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await createMilestone(activeStageId, title.trim(), notes.trim());
      setTitle('');
      setNotes('');
      setShowForm(false);
      await load();
    } catch (e) { console.error(e); showToast('里程碑保存失败，请重试'); }
    finally { setSaving(false); }
  };

  const handleCancel = () => {
    setTitle('');
    setNotes('');
    setShowForm(false);
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">成长里程碑</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">记录旅途中值得铭记的节点。</p>
        </div>
        <Badge>{milestones.length} 项</Badge>
      </div>
      {loadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/70 p-3">
          <p role="alert" className="text-xs font-bold text-red-600">里程碑加载失败。</p>
          <button type="button" onClick={() => void load()} className="mt-1 text-[10px] font-bold text-red-700 underline hover:text-red-900">重试</button>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mb-4 max-h-56 space-y-2 overflow-y-auto">
          {milestones.map(m => (
            <div key={m.id} className="group flex items-start gap-3 rounded-2xl border border-brand-200 bg-white p-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-500">✦</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-brand-900">{m.title}</p>
                {m.notes && <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-brand-600">{m.notes}</p>}
                <p className="text-[10px] font-bold text-brand-400">{m.achieved_at?.slice(0, 16)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                {deletingId === m.id ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1 py-0.5">
                    <button
                      onClick={async () => {
                        try {
                          await deleteMilestone(m.id);
                          setDeletingId(null);
                          await load();
                        } catch (e) { console.error(e); showToast('里程碑删除失败，请重试'); }
                      }}
                      className="grid h-6 min-w-6 place-items-center rounded-full bg-red-600 px-2 text-[10px] font-bold text-white"
                    >确认</button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="grid h-6 min-w-6 place-items-center rounded-full bg-white px-2 text-[10px] font-bold text-brand-600"
                    >取消</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setDeletingId(m.id)}
                    className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-red-500 hover:bg-red-50"
                    aria-label="删除里程碑"
                  >×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
          <Input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="里程碑名称…" disabled={saving} />
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="备注…" disabled={saving} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!title.trim() || saving}>{saving ? '保存中…' : '记录'}</Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>取消</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="secondary" fullWidth className="border-dashed">＋ 添加里程碑</Button>
      )}
    </Card>
  );
}
