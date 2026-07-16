import Database from '@tauri-apps/plugin-sql';
import { MIGRATIONS, type Entry, type EntryType, type Speaker, type Stage, type Trait } from './schema';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load('sqlite:tulpa.db');
    for (const sql of MIGRATIONS) {
      await db.execute(sql);
    }
  }
  return db;
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
  const where = stageId ? 'WHERE stage_id = $1' : '';
  const params = stageId ? [stageId] : [];
  return d.select(`SELECT * FROM entries ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`, params);
}

export async function createEntry(entry: {
  stage_id: string; type: EntryType; title: string; content?: string;
  tags?: string; duration_seconds?: number; mood?: number;
}) {
  const d = await getDb();
  const result = await d.execute(
    `INSERT INTO entries (stage_id, type, title, content, tags, duration_seconds, mood)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [entry.stage_id, entry.type, entry.title, entry.content || '',
     entry.tags || '[]', entry.duration_seconds || 0, entry.mood || null]
  );
  return result.lastInsertId as number;
}

export async function deleteEntry(id: number) {
  const d = await getDb();
  await d.execute('DELETE FROM entries WHERE id = $1', [id]);
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

export async function deleteTrait(id: number) {
  const d = await getDb();
  await d.execute('DELETE FROM traits WHERE id = $1', [id]);
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

// === CRUD：milestones ===
export async function getMilestones(stageId?: string) {
  const d = await getDb();
  const where = stageId ? 'WHERE stage_id = $1' : '';
  const params = stageId ? [stageId] : [];
  return d.select(`SELECT * FROM milestones ${where} ORDER BY achieved_at DESC`, params);
}

// === 统计查询 ===
export async function getTotalDuration(): Promise<number> {
  const d = await getDb();
  const rows: any[] = await d.select('SELECT COALESCE(SUM(duration_seconds), 0) as total FROM entries WHERE duration_seconds > 0');
  return rows[0]?.total || 0;
}

export async function getDurationByStage(): Promise<{ stage_id: string; total: number }[]> {
  const d = await getDb();
  return d.select('SELECT stage_id, SUM(duration_seconds) as total FROM entries WHERE duration_seconds > 0 GROUP BY stage_id');
}

export async function getDailyDurations(days: number = 7): Promise<{ day: string; total: number }[]> {
  const d = await getDb();
  return d.select(
    `SELECT date(created_at) as day, SUM(duration_seconds) as total
     FROM entries WHERE duration_seconds > 0 AND created_at >= date('now','-' || $1 || ' days')
     GROUP BY day ORDER BY day`,
    [days]
  );
}

export async function getConsecutiveDays(): Promise<number> {
  const d = await getDb();
  const rows: any[] = await d.select(
    `SELECT DISTINCT date(created_at) as day FROM entries WHERE duration_seconds > 0 ORDER BY day DESC`
  );
  if (!rows.length) return 0;
  let count = 1;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = 1; i < rows.length; i++) {
    const expected = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    if (expected !== rows[i]?.day) break;
    count++;
  }
  return rows[0]?.day === today ? count : 0;
}
