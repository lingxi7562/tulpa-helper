import { useState, useEffect, useCallback } from 'react';
import { getWonderlandEntries } from '../../db/database';
import { useEntryStore } from '../../stores/useEntryStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Textarea } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import type { Entry } from '../../db/schema';

const DRAFT_KEY_PREFIX = 'wonderland-draft-';

function loadDraft(stageId: string): string {
  try { return localStorage.getItem(DRAFT_KEY_PREFIX + stageId) || ''; }
  catch { return ''; }
}

function saveDraft(stageId: string, text: string) {
  try { localStorage.setItem(DRAFT_KEY_PREFIX + stageId, text); }
  catch { /* noop */ }
}

function clearDraft(stageId: string) {
  try { localStorage.removeItem(DRAFT_KEY_PREFIX + stageId); }
  catch { /* noop */ }
}

interface Props {
  stageId?: string;
  variant?: 'prep' | 'dev';
}

export default function WonderlandEditor({ stageId = 'prep', variant = 'prep' }: Props) {
  const { addEntry, removeEntry } = useEntryStore();
  const showToast = useToast(state => state.show);
  const [versions, setVersions] = useState<Entry[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<Entry | null>(null);
  const [draft, setDraft] = useState(() => loadDraft(stageId));
  const [saving, setSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(() => loadDraft(stageId));

  const loadVersions = useCallback(async () => {
    setLoadError(false);
    try {
      const rows = await getWonderlandEntries(stageId);
      setVersions(rows);
    } catch (error) {
      console.error(error);
      setLoadError(true);
    }
  }, [stageId]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  // 自动保存草稿到 localStorage（防抖 1s）
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(stageId, draft), 1000);
    return () => clearTimeout(timer);
  }, [draft, stageId]);

  // 离开页面时若有未保存草稿，提示用户
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (draft.trim() && draft !== lastSavedContent) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [draft, lastSavedContent]);

  const handleDeleteVersion = async (id: number) => {
    if (saving) return;
    if (!window.confirm('确定删除此版本？此操作不可撤销。')) return;
    setSaving(true);
    try {
      await removeEntry(id);
      if (currentVersion?.id === id) {
        setCurrentVersion(null);
        setDraft('');
        clearDraft(stageId);
      }
      await loadVersions();
    } catch (error) {
      console.error(error);
      showToast('Wonderland 保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      const content = draft.trim();
      await addEntry({
        stage_id: stageId,
        type: 'wonderland',
        title: Array.from(content).slice(0, 50).join(''),
        content,
      });
      setDraft('');
      clearDraft(stageId);
      setLastSavedContent('');
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
    clearDraft(stageId);
    setLastSavedContent('');
  };

  const versionLabel = (entry: Entry) => {
    const idx = versions.findIndex(v => v.id === entry.id);
    return idx >= 0 ? `v${versions.length - idx}` : '';
  };

  // 上一版本：versions 按 created_at DESC 排序，currentVersion 的上一版本是数组中紧随其后的更旧一条
  const prevVersion = currentVersion
    ? versions[versions.findIndex(v => v.id === currentVersion.id) + 1] ?? null
    : null;
  const [showDiff, setShowDiff] = useState(false);

  const diffLines = (() => {
    if (!currentVersion || !prevVersion) return [];
    const a = prevVersion.content.split('\n');
    const b = currentVersion.content.split('\n');
    const max = Math.max(a.length, b.length);
    const lines: { kind: 'same' | 'add' | 'del'; text: string }[] = [];
    for (let i = 0; i < max; i++) {
      if (i < a.length && i < b.length) {
        lines.push(a[i] === b[i] ? { kind: 'same', text: a[i] } : { kind: 'del', text: a[i] });
        if (a[i] !== b[i]) lines.push({ kind: 'add', text: b[i] });
      } else if (i < a.length) {
        lines.push({ kind: 'del', text: a[i] });
      } else {
        lines.push({ kind: 'add', text: b[i] });
      }
    }
    return lines.filter(l => l.kind !== 'same').slice(0, 30);
  })();

  return (
    <Card hoverable={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-brand-900">{variant === 'dev' ? 'Wonderland 互动记录' : 'Wonderland 心象空间'}</h3>
          <p className="mt-1 text-xs leading-6 text-brand-400">{variant === 'dev' ? '记录你们在这里一起做过的事——散步、交谈、飞行……' : '为你们构建一处安心相见的地方。'}</p>
        </div>
        <Badge variant="prep">{versions.length} 版</Badge>
      </div>
      {loadError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50/70 p-3">
          <p role="alert" className="text-xs font-bold text-red-600">Wonderland 版本加载失败。</p>
          <button type="button" onClick={() => void loadVersions()} className="mt-1 text-[10px] font-bold text-red-700 underline hover:text-red-900">重试</button>
        </div>
      )}

      {currentVersion && prevVersion && (
        <div className="mb-4">
          <button
            onClick={() => setShowDiff(v => !v)}
            className="text-[10px] font-bold text-brand-500 hover:text-brand-800"
          >
            {showDiff ? '收起对比 ▲' : `对比上一版本（${versionLabel(prevVersion)} → ${versionLabel(currentVersion)}）▼`}
          </button>
          {showDiff && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-brand-100 bg-white/70 p-3">
              {diffLines.length > 0 ? diffLines.map((l, i) => (
                <p key={i} className={`text-[10px] leading-5 ${l.kind === 'add' ? 'text-emerald-600' : l.kind === 'del' ? 'text-red-400 line-through' : 'text-brand-400'}`}>
                  {l.kind === 'add' ? '+ ' : l.kind === 'del' ? '− ' : '  '}{l.text || ' '}
                </p>
              )) : (
                <p className="text-[10px] text-brand-400">两版本内容相同</p>
              )}
            </div>
          )}
        </div>
      )}

      {versions.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={handleNew}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
              !currentVersion ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-white text-brand-500 hover:text-brand-800'
            }`}
          >
            ＋ 新版本
          </button>
          {versions.length > 5 ? (
            <select
              value={currentVersion?.id ?? ''}
              onChange={e => {
                const v = versions.find(x => String(x.id) === e.target.value);
                if (v) handleSelectVersion(v);
              }}
              className="max-w-56 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 focus:border-emerald-400 focus:outline-none"
            >
              <option value="">选择历史版本…</option>
              {versions.map((v, i) => (
                <option key={v.id} value={v.id}>
                  v{versions.length - i} · {v.created_at?.slice(5, 10)} · {v.content.slice(0, 30)}{v.content.length > 30 ? '…' : ''}
                </option>
              ))}
            </select>
          ) : (
            versions.map((v, i) => (
              <span key={v.id} className="inline-flex items-center gap-0.5">
                <button
                  onClick={() => handleSelectVersion(v)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${
                    currentVersion?.id === v.id ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-brand-200 bg-white text-brand-500 hover:text-brand-800'
                  }`}
                >
                  v{versions.length - i} · {v.created_at?.slice(5, 10)}
                </button>
                {currentVersion?.id !== v.id && (
                  <button
                    onClick={() => handleDeleteVersion(v.id)}
                    disabled={saving}
                    title="删除此版本"
                    aria-label="删除此版本"
                    className="grid h-5 w-5 place-items-center rounded-full text-[10px] text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >×</button>
                )}
              </span>
            ))
          )}
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
          placeholder={variant === 'dev' ? '今天在 Wonderland 里，你们一起……' : '描述你们的心象空间——光线、气味、声音、温度……'}
          className="min-h-32"
        />
        <Button size="sm" onClick={handleSave} disabled={!draft.trim() || saving}>
          {saving ? '保存中…' : currentVersion ? '保存为新版本' : '保存'}
        </Button>
      </div>
    </Card>
  );
}
