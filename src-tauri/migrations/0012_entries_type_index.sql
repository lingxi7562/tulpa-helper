CREATE INDEX IF NOT EXISTS idx_entries_type_created
  ON entries (type, created_at DESC, id DESC);
