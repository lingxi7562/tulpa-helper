CREATE INDEX IF NOT EXISTS idx_traits_category
  ON traits (category, id DESC);
