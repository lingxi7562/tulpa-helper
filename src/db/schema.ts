// === 枚举类型 ===
export type EntryType =
  | 'trait' | 'form' | 'session' | 'narration' | 'devotion'
  | 'dialogue' | 'wonderland' | 'signal' | 'imposition' | 'switch'
  | 'design' | 'dialogue_session' | 'practice';

export type Speaker = 'self' | 'tulpa';
export type SenseType = 'visual' | 'audio' | 'smell' | 'touch' | 'taste';

// === 数据行类型 ===
export interface Stage {
  id: string;
  name: string;
  order: number;
  description: string;
  unlocked_at: string | null;
}

export interface Entry {
  id: number;
  stage_id: string;
  type: EntryType;
  title: string;
  content: string;
  tags: string;
  created_at: string;
  duration_seconds: number;
  mood: number | null;
}

export interface DialogueMessage {
  id: number;
  entry_id: number;
  speaker: Speaker;
  content: string;
  seq: number;
}

export interface Trait {
  id: number;
  name: string;
  description: string;
  weight: number;
  category: string;
}

export interface FormDetail {
  id: number;
  sense_type: SenseType;
  description: string;
}

export interface Milestone {
  id: number;
  stage_id: string;
  title: string;
  achieved_at: string | null;
  notes: string;
}

// === SQL 建表 + 初始数据 ===
export const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    description TEXT DEFAULT '',
    unlocked_at TEXT
  )`,
  `INSERT OR IGNORE INTO stages (id, name, "order", description, unlocked_at) VALUES
    ('prep', '准备期', 1, '定义 tulpa 的基础蓝图', datetime('now','localtime')),
    ('create', '创建期', 2, '通过持续专注与交流赋予 tulpa 生命力', datetime('now','localtime')),
    ('dev', '发展期', 3, '培养独立性，深化连接', NULL),
    ('mature', '成熟期', 4, '高阶练习与长期维护', NULL)
  `,
  `CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id TEXT NOT NULL REFERENCES stages(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    duration_seconds INTEGER DEFAULT 0,
    mood INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS dialogue_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL CHECK(speaker IN ('self','tulpa')),
    content TEXT NOT NULL DEFAULT '',
    seq INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS traits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    weight INTEGER DEFAULT 5 CHECK(weight BETWEEN 1 AND 10),
    category TEXT DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS form_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sense_type TEXT NOT NULL CHECK(sense_type IN ('visual','audio','smell','touch','taste')),
    description TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id TEXT NOT NULL REFERENCES stages(id),
    title TEXT NOT NULL,
    achieved_at TEXT,
    notes TEXT DEFAULT ''
  )`,
];
