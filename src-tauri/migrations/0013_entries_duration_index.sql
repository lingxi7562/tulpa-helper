CREATE INDEX IF NOT EXISTS idx_entries_duration_created
  ON entries (created_at DESC)
  WHERE duration_seconds > 0 AND type != 'switch';
