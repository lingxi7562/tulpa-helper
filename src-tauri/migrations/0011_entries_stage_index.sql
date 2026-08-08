CREATE INDEX IF NOT EXISTS idx_entries_stage_created
  ON entries (stage_id, created_at DESC, id DESC);
