CREATE INDEX IF NOT EXISTS idx_deviations_target
  ON deviations (target_type, target_id, created_at DESC, id DESC);
