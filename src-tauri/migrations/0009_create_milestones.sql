CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stage_id TEXT NOT NULL REFERENCES stages(id),
  title TEXT NOT NULL,
  achieved_at TEXT,
  notes TEXT DEFAULT ''
);
