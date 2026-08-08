CREATE INDEX IF NOT EXISTS idx_milestones_stage_achieved
  ON milestones (stage_id, achieved_at DESC, id DESC);
