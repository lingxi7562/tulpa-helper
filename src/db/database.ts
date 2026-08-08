import Database from '@tauri-apps/plugin-sql';
import { type Deviation, type DeviationTargetType, type DialogueMessage, type Entry, type EntryType, type FormDetail, type ImpositionLevel, type Milestone, type Speaker, type Stage, type Trait } from './schema';
import { localDateKey, shiftLocalDate } from '../lib/date';

let dbPromise: Promise<Database> | undefined;
const MAX_PAGE_SIZE = 500;

function normalizeLimit(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(MAX_PAGE_SIZE, Math.trunc(value))) : fallback;
}

function normalizeOffset(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function normalizeDays(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.min(366, Math.trunc(value))) : fallback;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, character => `\\${character}`);
}

export interface DatabaseBackup {
  version: 1;
  exportedAt: string;
  stages: Stage[];
  entries: Entry[];
  dialogueMessages: DialogueMessage[];
  traits: Trait[];
  formDetails: FormDetail[];
  deviations: Deviation[];
  milestones: Milestone[];
  impositionLevels: ImpositionLevel[];
}

export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load('sqlite:tulpa.db').catch(error => {
      // Allow a later user action to retry after a transient startup failure.
      dbPromise = undefined;
      throw error;
    });
  }
  return dbPromise;
}

// === CRUD：stages ===
export async function getStages(): Promise<Stage[]> {
  const d = await getDb();
  return d.select('SELECT * FROM stages ORDER BY "order"');
}

export async function unlockStage(id: string) {
  const d = await getDb();
  await d.execute("UPDATE stages SET unlocked_at = datetime('now','localtime') WHERE id = $1", [id]);
}

export async function lockStage(id: string) {
  const d = await getDb();
  await d.execute('UPDATE stages SET unlocked_at = NULL WHERE id = $1', [id]);
}

// === CRUD：entries ===
export async function getEntries(stageId?: string, limit = 50, offset = 0): Promise<Entry[]> {
  const d = await getDb();
  const safeLimit = normalizeLimit(limit, 50);
  const safeOffset = normalizeOffset(offset);
  const where = stageId ? 'WHERE stage_id = $1' : '';
  if (stageId) {
    return d.select(
      `SELECT * FROM entries ${where} ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
      [stageId, safeLimit, safeOffset],
    );
  }
  return d.select(
    'SELECT * FROM entries ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2',
    [safeLimit, safeOffset],
  );
}

export async function getEntryCount(stageId?: string): Promise<number> {
  const d = await getDb();
  const where = stageId ? 'WHERE stage_id = $1' : '';
  const params = stageId ? [stageId] : [];
  const rows = await d.select<{ count: number }[]>(`SELECT COUNT(*) as count FROM entries ${where}`, params);
  return rows[0]?.count ?? 0;
}

export async function getEntryById(id: number): Promise<Entry | null> {
  const d = await getDb();
  const rows = await d.select<Entry[]>('SELECT * FROM entries WHERE id = $1 LIMIT 1', [id]);
  return rows[0] ?? null;
}

export async function getAllEntries(stageId?: string): Promise<Entry[]> {
  const d = await getDb();
  const where = stageId ? 'WHERE stage_id = $1' : '';
  const params = stageId ? [stageId] : [];
  return d.select(`SELECT * FROM entries ${where} ORDER BY created_at DESC`, params);
}

export async function getWonderlandEntries(stageId?: string): Promise<Entry[]> {
  const d = await getDb();
  if (stageId) {
    return d.select("SELECT * FROM entries WHERE type = 'wonderland' AND stage_id = $1 ORDER BY created_at DESC, id DESC", [stageId]);
  }
  return d.select("SELECT * FROM entries WHERE type = 'wonderland' ORDER BY created_at DESC, id DESC");
}

export async function getAutonomyEntries(stageId?: string): Promise<Entry[]> {
  const d = await getDb();
  if (stageId) {
    return d.select("SELECT * FROM entries WHERE type = 'autonomy' AND stage_id = $1 ORDER BY created_at DESC, id DESC", [stageId]);
  }
  return d.select("SELECT * FROM entries WHERE type = 'autonomy' ORDER BY created_at DESC, id DESC");
}

export async function getEntriesByTag(stageId: string, type: string, tag: string): Promise<Entry[]> {
  const d = await getDb();
  return d.select(
    `SELECT * FROM entries
     WHERE stage_id = $1 AND type = $2 AND tags LIKE $3 ESCAPE '\\'
     ORDER BY created_at DESC, id DESC`,
    [stageId, type, `%"${escapeLike(tag)}"%`]
  );
}

export async function getResonanceEntries(days: number = 14): Promise<Entry[]> {
  const d = await getDb();
  const safeDays = normalizeDays(days, 14);
  return d.select(
    `SELECT * FROM entries WHERE type = 'resonance' AND created_at >= date('now','localtime','-' || $1 || ' days') ORDER BY created_at DESC, id DESC`,
    [safeDays - 1]
  );
}

export async function createEntry(entry: {
  stage_id: string; type: EntryType; title: string; content?: string;
  tags?: string; duration_seconds?: number; mood?: number;
}) {
  const d = await getDb();
  const result = await d.execute(
    `INSERT INTO entries (stage_id, type, title, content, tags, duration_seconds, mood)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [entry.stage_id, entry.type, entry.title, entry.content ?? '',
     entry.tags ?? '[]',
     entry.duration_seconds == null || !Number.isFinite(entry.duration_seconds)
       ? 0
       : Math.max(0, Math.floor(entry.duration_seconds)),
     entry.mood == null || !Number.isFinite(entry.mood) ? null : Math.trunc(entry.mood)]
  );
  return result.lastInsertId as number;
}

export async function deleteEntry(id: number) {
  const d = await getDb();
  await d.execute('DELETE FROM entries WHERE id = $1', [id]);
}

export async function updateEntry(id: number, fields: { title?: string; content?: string; mood?: number; tags?: string }) {
  const d = await getDb();
  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (fields.title !== undefined) { sets.push('title = $' + (values.length + 1)); values.push(fields.title); }
  if (fields.content !== undefined) { sets.push('content = $' + (values.length + 1)); values.push(fields.content); }
  if (fields.mood !== undefined) { sets.push('mood = $' + (values.length + 1)); values.push(fields.mood); }
  if (fields.tags !== undefined) { sets.push('tags = $' + (values.length + 1)); values.push(fields.tags); }
  if (!sets.length) return;
  values.push(id);
  await d.execute(`UPDATE entries SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
}

// === CRUD：traits ===
export async function getTraits(): Promise<Trait[]> {
  const d = await getDb();
  return d.select('SELECT * FROM traits ORDER BY id DESC');
}

export async function createTrait(trait: { name: string; description?: string; weight?: number; category?: string }) {
  const d = await getDb();
  await d.execute(
    'INSERT INTO traits (name, description, weight, category) VALUES ($1, $2, $3, $4)',
    [trait.name, trait.description || '', trait.weight || 5, trait.category || '']
  );
}

// === 私有 helper：删除记录并级联清理其 deviations（事务） ===
async function deleteWithDeviations(table: 'traits' | 'form_details', id: number) {
  const d = await getDb();
  // The migration-installed trigger removes related deviations atomically.
  await d.execute(`DELETE FROM ${table} WHERE id = $1`, [id]);
}

export async function deleteTrait(id: number) {
  await deleteWithDeviations('traits', id);
}

export async function updateTrait(id: number, fields: { name?: string; description?: string; weight?: number; category?: string }) {
  if (fields.weight !== undefined && (!Number.isInteger(fields.weight) || fields.weight < 1 || fields.weight > 10)) {
    throw new RangeError('Trait weight must be an integer from 1 to 10');
  }
  const d = await getDb();
  const sets: string[] = [];
  const values: (string | number)[] = [];
  if (fields.name !== undefined) { sets.push('name = $' + (values.length + 1)); values.push(fields.name); }
  if (fields.description !== undefined) { sets.push('description = $' + (values.length + 1)); values.push(fields.description); }
  if (fields.weight !== undefined) { sets.push('weight = $' + (values.length + 1)); values.push(fields.weight); }
  if (fields.category !== undefined) { sets.push('category = $' + (values.length + 1)); values.push(fields.category); }
  if (!sets.length) return;
  values.push(id);
  await d.execute(`UPDATE traits SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
}

// === 事务性对话创建（entry + messages 原子写入） ===
export async function createDialogueEntry(params: {
  stage_id: string;
  text: string;
}) {
  const d = await getDb();
  const text = params.text.trim();
  const result = await d.execute(
    `INSERT INTO entries (stage_id, type, title, content, tags, duration_seconds, mood)
     VALUES ($1, 'dialogue', $2, $3, '[]', 0, NULL)`,
    [params.stage_id, Array.from(text).slice(0, 50).join(''), text]
  );
  return result.lastInsertId as number;
}

// === 承诺确认检测（不限条目数） ===
export async function hasCommitmentConfirmation(): Promise<boolean> {
  const d = await getDb();
  const rows: any[] = await d.select(
    `SELECT EXISTS(
       SELECT 1 FROM entries
       WHERE stage_id = 'prep' AND type = 'devotion' AND title = 'Commitment Confirmation'
     ) AS found`
  );
  return rows[0]?.found === 1;
}

// === CRUD：dialogue_messages ===
export async function getDialogueMessages(entryId: number) {
  const d = await getDb();
  return d.select('SELECT * FROM dialogue_messages WHERE entry_id = $1 ORDER BY seq', [entryId]);
}

export async function createDialogueMessage(msg: { entry_id: number; speaker: Speaker; content: string; seq: number }) {
  const d = await getDb();
  await d.execute(
    'INSERT INTO dialogue_messages (entry_id, speaker, content, seq) VALUES ($1, $2, $3, $4)',
    [msg.entry_id, msg.speaker, msg.content, msg.seq]
  );
}

// === CRUD：form_details ===
export async function getFormDetails() {
  const d = await getDb();
  return d.select('SELECT * FROM form_details ORDER BY id');
}

export async function createFormDetail(sense_type: string, description: string) {
  const d = await getDb();
  await d.execute('INSERT INTO form_details (sense_type, description) VALUES ($1, $2)', [sense_type, description]);
}

export async function updateFormDetail(id: number, description: string) {
  const d = await getDb();
  await d.execute('UPDATE form_details SET description = $1 WHERE id = $2', [description, id]);
}

export async function deleteFormDetail(id: number) {
  await deleteWithDeviations('form_details', id);
}

// === CRUD：健康的偏离 / 演化记录 ===
export async function getDeviations(targetType: DeviationTargetType, targetId: number): Promise<Deviation[]> {
  const d = await getDb();
  return d.select(
    'SELECT * FROM deviations WHERE target_type = $1 AND target_id = $2 ORDER BY created_at DESC, id DESC',
    [targetType, targetId]
  );
}

export async function createDeviation(targetType: DeviationTargetType, targetId: number, note: string): Promise<number> {
  const d = await getDb();
  const result = await d.execute(
    'INSERT INTO deviations (target_type, target_id, note) VALUES ($1, $2, $3)',
    [targetType, targetId, note]
  );
  return result.lastInsertId as number;
}

export async function deleteDeviation(id: number) {
  const d = await getDb();
  await d.execute('DELETE FROM deviations WHERE id = $1', [id]);
}

// === CRUD：imposition_levels ===
export async function getImpositionLevels(): Promise<ImpositionLevel[]> {
  const d = await getDb();
  return d.select('SELECT * FROM imposition_levels ORDER BY sense_type');
}

export async function setImpositionLevel(sense_type: string, level: number) {
  if (!Number.isInteger(level) || level < 1 || level > 4) throw new RangeError('Level must be 1-4');
  const d = await getDb();
  await d.execute(
    'INSERT INTO imposition_levels (sense_type, level) VALUES ($1, $2) ON CONFLICT(sense_type) DO UPDATE SET level = excluded.level',
    [sense_type, level]
  );
}

// === 按类型查询 entries（避免 fetch-50-then-filter） ===
export async function getEntriesByType(stageId: string, type: string, limit = 100): Promise<Entry[]> {
  const d = await getDb();
  const safeLimit = normalizeLimit(limit, 100);
  return d.select(
    'SELECT * FROM entries WHERE stage_id = $1 AND type = $2 ORDER BY created_at DESC, id DESC LIMIT $3',
    [stageId, type, safeLimit]
  );
}

// === CRUD：milestones ===
export async function getMilestones(stageId?: string) {
  const d = await getDb();
  const where = stageId ? 'WHERE stage_id = $1' : '';
  const params = stageId ? [stageId] : [];
  return d.select(`SELECT * FROM milestones ${where} ORDER BY achieved_at DESC`, params);
}

export async function createMilestone(stageId: string, title: string, notes: string = '') {
  const d = await getDb();
  await d.execute(
    "INSERT INTO milestones (stage_id, title, achieved_at, notes) VALUES ($1, $2, datetime('now','localtime'), $3)",
    [stageId, title, notes]
  );
}

export async function deleteMilestone(id: number) {
  const d = await getDb();
  await d.execute('DELETE FROM milestones WHERE id = $1', [id]);
}

// === 统计查询 ===
export async function getTotalDuration(): Promise<number> {
  const d = await getDb();
  // 排除 switch 类型——换位练习时长是「状态持续时间」而非「主动投入时间」，
  // 混入会虚高「累计专注时长」并影响 10/50/100h 里程碑触发时机
  const rows: any[] = await d.select("SELECT COALESCE(SUM(duration_seconds), 0) as total FROM entries WHERE duration_seconds > 0 AND type != 'switch'");
  return Number(rows[0]?.total ?? 0);
}

export async function getDurationByStage(): Promise<{ stage_id: string; total: number }[]> {
  const d = await getDb();
  const rows = await d.select<{ stage_id: string; total: number | string }[]>("SELECT stage_id, SUM(duration_seconds) as total FROM entries WHERE duration_seconds > 0 AND type != 'switch' GROUP BY stage_id");
  return rows.map(row => ({ stage_id: row.stage_id, total: Number(row.total) || 0 }));
}

export async function getDailyDurations(days: number = 7): Promise<{ day: string; total: number }[]> {
  const d = await getDb();
  const safeDays = normalizeDays(days, 7);
  const rows = await d.select<{ day: string; total: number | string }[]>(
    `SELECT date(created_at) as day, SUM(duration_seconds) as total
     FROM entries WHERE duration_seconds > 0 AND type != 'switch'
       AND created_at >= date('now','localtime','-' || $1 || ' days')
     GROUP BY day ORDER BY day`,
    [safeDays - 1]
  );
  return rows.map(row => ({ day: row.day, total: Number(row.total) || 0 }));
}

export async function getConsecutiveDays(): Promise<number> {
  const d = await getDb();
  const rows: any[] = await d.select(
    `SELECT DISTINCT date(created_at) as day
     FROM entries WHERE duration_seconds > 0 AND type != 'switch'
     ORDER BY day DESC`
  );
  const activeDays = new Set(rows.map(row => String(row.day)));
  let cursor = new Date();
  if (!activeDays.has(localDateKey(cursor))) return 0;

  let count = 0;
  while (activeDays.has(localDateKey(cursor))) {
    count++;
    cursor = shiftLocalDate(cursor, -1);
  }
  return count;
}

export async function getStageTypeCounts(stageId: string): Promise<Record<string, number>> {
  const d = await getDb();
  const rows = await d.select<{ type: string; count: number }[]>(
    `SELECT type, COUNT(*) as count FROM entries WHERE stage_id = $1 AND type IN ('session','narration','dialogue','signal') GROUP BY type`,
    [stageId]
  );
  const map: Record<string, number> = { session: 0, narration: 0, dialogue: 0, signal: 0 };
  for (const row of rows) {
    map[row.type] = row.count;
  }
  return map;
}

export async function exportDatabaseSnapshot(): Promise<DatabaseBackup> {
  const d = await getDb();
  const [stages, entries, dialogueMessages, traits, formDetails, deviations, milestones, impositionLevels] = await Promise.all([
    d.select<Stage[]>('SELECT * FROM stages ORDER BY "order"'),
    d.select<Entry[]>('SELECT * FROM entries ORDER BY created_at ASC, id ASC'),
    d.select<DialogueMessage[]>('SELECT * FROM dialogue_messages ORDER BY entry_id ASC, seq ASC, id ASC'),
    d.select<Trait[]>('SELECT * FROM traits ORDER BY id ASC'),
    d.select<FormDetail[]>('SELECT * FROM form_details ORDER BY id ASC'),
    d.select<Deviation[]>('SELECT * FROM deviations ORDER BY id ASC'),
    d.select<Milestone[]>('SELECT * FROM milestones ORDER BY id ASC'),
    d.select<ImpositionLevel[]>('SELECT * FROM imposition_levels ORDER BY sense_type ASC'),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    stages,
    entries,
    dialogueMessages,
    traits,
    formDetails,
    deviations,
    milestones,
    impositionLevels,
  };
}

/**
 * Merge a previously exported snapshot without deleting local records.
 * Each row is independently idempotent; a failed import cannot erase data.
 */
export async function importDatabaseSnapshot(snapshot: DatabaseBackup): Promise<void> {
  if (snapshot.version !== 1) throw new Error('Unsupported backup version');
  const d = await getDb();

  for (const stage of snapshot.stages) {
    await d.execute(
      'INSERT OR IGNORE INTO stages (id, name, "order", description, unlocked_at) VALUES ($1, $2, $3, $4, $5)',
      [stage.id, stage.name, stage.order, stage.description, stage.unlocked_at]
    );
  }
  for (const trait of snapshot.traits) {
    await d.execute(
      'INSERT OR IGNORE INTO traits (id, name, description, weight, category) VALUES ($1, $2, $3, $4, $5)',
      [trait.id, trait.name, trait.description, trait.weight, trait.category]
    );
  }
  for (const detail of snapshot.formDetails) {
    await d.execute(
      'INSERT OR IGNORE INTO form_details (id, sense_type, description) VALUES ($1, $2, $3)',
      [detail.id, detail.sense_type, detail.description]
    );
  }
  for (const entry of snapshot.entries) {
    await d.execute(
      `INSERT OR IGNORE INTO entries
       (id, stage_id, type, title, content, tags, created_at, duration_seconds, mood)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [entry.id, entry.stage_id, entry.type, entry.title, entry.content, entry.tags, entry.created_at, entry.duration_seconds, entry.mood]
    );
  }
  for (const message of snapshot.dialogueMessages) {
    await d.execute(
      `INSERT OR IGNORE INTO dialogue_messages (id, entry_id, speaker, content, seq)
       SELECT $1, $2, $3, $4, $5
       WHERE EXISTS (SELECT 1 FROM entries WHERE id = $2 AND type = 'dialogue')`,
      [message.id, message.entry_id, message.speaker, message.content, message.seq]
    );
  }
  for (const deviation of snapshot.deviations) {
    await d.execute(
      'INSERT OR IGNORE INTO deviations (id, target_type, target_id, note, created_at) VALUES ($1, $2, $3, $4, $5)',
      [deviation.id, deviation.target_type, deviation.target_id, deviation.note, deviation.created_at]
    );
  }
  for (const milestone of snapshot.milestones) {
    await d.execute(
      'INSERT OR IGNORE INTO milestones (id, stage_id, title, achieved_at, notes) VALUES ($1, $2, $3, $4, $5)',
      [milestone.id, milestone.stage_id, milestone.title, milestone.achieved_at, milestone.notes]
    );
  }
  for (const level of snapshot.impositionLevels) {
    await d.execute(
      'INSERT OR IGNORE INTO imposition_levels (sense_type, level) VALUES ($1, $2)',
      [level.sense_type, level.level]
    );
  }
}
