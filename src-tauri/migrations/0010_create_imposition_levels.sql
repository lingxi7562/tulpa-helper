CREATE TABLE IF NOT EXISTS imposition_levels (
  sense_type TEXT PRIMARY KEY CHECK(sense_type IN ('visual','audio','smell','touch','taste')),
  level INTEGER NOT NULL DEFAULT 1 CHECK(level BETWEEN 1 AND 10)
);
