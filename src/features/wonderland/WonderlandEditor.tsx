import { useState, useEffect, useCallback } from 'react';
import { getWonderlandEntries } from '../../db/database';
import { useEntryStore } from '../../stores/useEntryStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import type { Entry } from '../../db/schema';

export default function WonderlandEditor() {
  const { addEntry } = useEntryStore();
  const [versions, setVersions] = useState<Entry[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Entry | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const loadVersions = useCallback(async () => {
    try {
      const rows = await getWonderlandEntries();
      setVersions(rows);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      const content = draft.trim();
      await addEntry({
        stage_id: 'prep',
        type: 'wonderland',
        title: content.slice(0, 50),
        content,
      });
      setDraft('');
      setCurrentVersion(null);
      await loadVersions();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectVersion = (entry: Entry) => {
    if (saving) return;
    setCurrentVersion(entry);
    setDraft(entry.content);
  };

  const handleNew = () => {
    if (saving) return;
    setCurrentVersion(null);
    setDraft('');
  };

  const versionLabel = (entry: Entry) => {
    const idx = versions.findIndex(v => v.id === entry.id);
    return idx >= 0 ? `v${versions.length - idx}` : '';
  };

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">Wonderland 心象空间</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">为你们构建一处安心相见的地方。</p>
        </div>
        <Badge variant="prep">{versions.length} 版</Badge>
      </div>

      {versions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={handleNew}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              !currentVersion ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-white text-brand-500 hover:text-brand-800'
            }`}
          >
            ＋ 新版本
          </button>
          {versions.map((v, i) => (
            <button
              key={v.id}
              onClick={() => handleSelectVersion(v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                currentVersion?.id === v.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-white text-brand-500 hover:text-brand-800'
              }`}
            >
              v{versions.length - i} · {v.created_at?.slice(5, 10)}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-3">
        {currentVersion && (
          <p className="text-[10px] font-bold text-brand-400">
            正在查看 {versionLabel(currentVersion)} · 保存将创建新版本
          </p>
        )}
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="描述你们的心象空间——光线、气味、声音、温度……"
          className="min-h-32"
        />
        <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
          {saving ? '保存中…' : currentVersion ? '保存为新版本' : '保存'}
        </Button>
      </div>
    </Card>
  );
}
