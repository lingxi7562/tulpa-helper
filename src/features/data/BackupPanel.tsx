import { useRef, useState, type ChangeEvent } from 'react';
import { exportDatabaseSnapshot, importDatabaseSnapshot, type DatabaseBackup } from '../../db/database';
import { useEntryStore } from '../../stores/useEntryStore';
import { useProfileStore } from '../../stores/useProfileStore';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface BackupFile extends DatabaseBackup {
  format: 'tulpa-helper-backup';
  profile: { tulpaName: string; relationshipCompass?: string | null };
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false;
  const file = value as Partial<BackupFile>;
  const profile = file.profile as Partial<BackupFile['profile']> | undefined;
  const collections = [file.stages, file.entries, file.dialogueMessages, file.traits, file.formDetails, file.deviations, file.milestones, file.impositionLevels];
  return file.format === 'tulpa-helper-backup'
    && file.version === 1
    && typeof file.exportedAt === 'string'
    && typeof profile?.tulpaName === 'string'
    && collections.every(collection => Array.isArray(collection) && collection.length <= 100_000)
    && Array.isArray(file.stages)
    && Array.isArray(file.entries)
    && Array.isArray(file.dialogueMessages)
    && Array.isArray(file.traits)
    && Array.isArray(file.formDetails)
    && Array.isArray(file.deviations)
    && Array.isArray(file.milestones)
    && Array.isArray(file.impositionLevels);
}

function readCompassPreference(): string | null {
  try { return localStorage.getItem('relationship-compass-v1'); }
  catch { return null; }
}

export default function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tulpaName = useProfileStore(state => state.tulpaName);
  const showToast = useToast(state => state.show);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const snapshot = await exportDatabaseSnapshot();
      const payload: BackupFile = {
        format: 'tulpa-helper-backup',
        profile: { tulpaName, relationshipCompass: readCompassPreference() },
        ...snapshot,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tulpa-helper-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      showToast('备份已导出到本地文件；应用不会上传它。');
    } catch (error) {
      console.error(error);
      showToast('导出失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;
    if (file.size > 20 * 1024 * 1024) {
      showToast('备份文件超过 20MB，已拒绝读取');
      return;
    }
    if (!window.confirm('导入会合并备份中的新记录，不会删除当前数据；相同 ID 的本地记录会保留。继续吗？')) return;
    setBusy(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackupFile(parsed)) throw new Error('Invalid Tulpa Helper backup');
      await importDatabaseSnapshot(parsed);
      if (parsed.profile.tulpaName.trim()) useProfileStore.getState().setTulpaName(parsed.profile.tulpaName);
      if (typeof parsed.profile.relationshipCompass === 'string') {
        try { localStorage.setItem('relationship-compass-v1', parsed.profile.relationshipCompass); }
        catch { /* preference restore is optional */ }
      }
      await useEntryStore.getState().loadEntries(undefined, 200, 0);
      showToast('备份已合并；现有本地记录未被删除。');
    } catch (error) {
      console.error(error);
      showToast('导入失败：文件格式无效或数据无法写入');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card hoverable={false}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-brand-900">本地数据备份</h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-brand-400">导出或合并 SQLite 记录与 Tulpa 名称。文件只在你的设备上生成，不会发送到网络。</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button size="sm" onClick={handleExport} disabled={busy}>{busy ? '处理中…' : '导出备份'}</Button>
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>合并备份</Button>
          <input ref={inputRef} type="file" accept="application/json,.json" onChange={handleImport} className="hidden" />
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-5 text-brand-400">导入采用“只新增、不覆盖、不删除”策略；建议在更换设备或升级前先导出一份。</p>
    </Card>
  );
}
