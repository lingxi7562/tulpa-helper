import { useRef, useState, type ChangeEvent } from 'react';
import { exportDatabaseSnapshot, importDatabaseSnapshot, type DatabaseBackup } from '../../db/database';
import { useEntryStore } from '../../stores/useEntryStore';
import { PRACTICE_FRAME_OPTIONS, type PracticeFrame, useProfileStore } from '../../stores/useProfileStore';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface BackupFile extends DatabaseBackup {
  format: 'tulpa-helper-backup';
  profile: { tulpaName: string; practiceFrame?: string; relationshipCompass?: string | null };
}

const ENTRY_TYPES = new Set([
  'trait', 'form', 'session', 'narration', 'devotion', 'dialogue', 'wonderland', 'signal',
  'imposition', 'switch', 'design', 'dialogue_session', 'practice', 'autonomy', 'resonance',
]);
const SENSE_TYPES = new Set(['visual', 'audio', 'smell', 'touch', 'taste']);
const PRACTICE_FRAMES = new Set(PRACTICE_FRAME_OPTIONS.map(option => option.value));

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isInteger(value: unknown, minimum = Number.MIN_SAFE_INTEGER, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum;
}

function isString(value: unknown, maximum = 100_000): value is string {
  return typeof value === 'string' && value.length <= maximum;
}

function isNullableString(value: unknown, maximum = 100_000): value is string | null {
  return value === null || isString(value, maximum);
}

function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false;
  const file = value as Partial<BackupFile>;
  const profile = file.profile as Partial<BackupFile['profile']> | undefined;
  const stages = file.stages;
  const entries = file.entries;
  const dialogueMessages = file.dialogueMessages;
  const traits = file.traits;
  const formDetails = file.formDetails;
  const deviations = file.deviations;
  const milestones = file.milestones;
  const impositionLevels = file.impositionLevels;
  if (!Array.isArray(stages) || !Array.isArray(entries) || !Array.isArray(dialogueMessages)
    || !Array.isArray(traits) || !Array.isArray(formDetails) || !Array.isArray(deviations)
    || !Array.isArray(milestones) || !Array.isArray(impositionLevels)) return false;
  const collections = [stages, entries, dialogueMessages, traits, formDetails, deviations, milestones, impositionLevels];
  if (!collections.every(collection => collection.length <= 100_000)) return false;

  return file.format === 'tulpa-helper-backup'
    && file.version === 1
    && isString(file.exportedAt, 100)
    && !Number.isNaN(Date.parse(file.exportedAt))
    && isString(profile?.tulpaName, 40)
    && (profile?.practiceFrame == null || (isString(profile.practiceFrame, 30) && PRACTICE_FRAMES.has(profile.practiceFrame)))
    && (profile?.relationshipCompass == null || isString(profile.relationshipCompass, 20_000))
    && stages.every(stage => isRecord(stage)
      && isString(stage.id, 40)
      && isString(stage.name, 100)
      && isInteger(stage.order, 0)
      && isString(stage.description, 10_000)
      && isNullableString(stage.unlocked_at, 100))
    && entries.every(entry => isRecord(entry)
      && isInteger(entry.id, 1)
      && isString(entry.stage_id, 40)
      && isString(entry.type, 40)
      && ENTRY_TYPES.has(entry.type)
      && isString(entry.title, 10_000)
      && isString(entry.content, 100_000)
      && isString(entry.tags, 100_000)
      && isString(entry.created_at, 100)
      && isInteger(entry.duration_seconds, 0)
      && (entry.mood === null || isInteger(entry.mood, -100, 100)))
    && dialogueMessages.every(message => isRecord(message)
      && isInteger(message.id, 1)
      && isInteger(message.entry_id, 1)
      && isString(message.speaker, 10)
      && (message.speaker === 'self' || message.speaker === 'tulpa')
      && isString(message.content, 100_000)
      && isInteger(message.seq, 0))
    && traits.every(trait => isRecord(trait)
      && isInteger(trait.id, 1)
      && isString(trait.name, 200)
      && isString(trait.description, 10_000)
      && isInteger(trait.weight, 1, 10)
      && isString(trait.category, 200))
    && formDetails.every(detail => isRecord(detail)
      && isInteger(detail.id, 1)
      && isString(detail.sense_type, 20)
      && SENSE_TYPES.has(detail.sense_type)
      && isString(detail.description, 100_000))
    && deviations.every(deviation => isRecord(deviation)
      && isInteger(deviation.id, 1)
      && isString(deviation.target_type, 20)
      && (deviation.target_type === 'trait' || deviation.target_type === 'form')
      && isInteger(deviation.target_id, 1)
      && isString(deviation.note, 100_000)
      && isString(deviation.created_at, 100))
    && milestones.every(milestone => isRecord(milestone)
      && isInteger(milestone.id, 1)
      && isString(milestone.stage_id, 40)
      && isString(milestone.title, 10_000)
      && isNullableString(milestone.achieved_at, 100)
      && isString(milestone.notes, 100_000))
    && impositionLevels.every(level => isRecord(level)
      && isString(level.sense_type, 20)
      && SENSE_TYPES.has(level.sense_type)
      && isInteger(level.level, 1, 4));
}

function readCompassPreference(): string | null {
  try { return localStorage.getItem('relationship-compass-v1'); }
  catch { return null; }
}

export default function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tulpaName = useProfileStore(state => state.tulpaName);
  const practiceFrame = useProfileStore(state => state.practiceFrame);
  const showToast = useToast(state => state.show);

  const handleExport = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const snapshot = await exportDatabaseSnapshot();
      const payload: BackupFile = {
        format: 'tulpa-helper-backup',
        profile: { tulpaName, practiceFrame, relationshipCompass: readCompassPreference() },
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
      if (typeof parsed.profile.practiceFrame === 'string' && PRACTICE_FRAMES.has(parsed.profile.practiceFrame)) {
        useProfileStore.getState().setPracticeFrame(parsed.profile.practiceFrame as PracticeFrame);
      }
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
          <p className="mt-1 max-w-2xl text-xs leading-6 text-brand-400">导出或合并 SQLite 记录、Tulpa 名称与实践视角。文件只在你的设备上生成，不会发送到网络。</p>
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
