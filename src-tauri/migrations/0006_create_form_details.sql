CREATE TABLE IF NOT EXISTS form_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sense_type TEXT NOT NULL CHECK(sense_type IN ('visual','audio','smell','touch','taste')),
  description TEXT NOT NULL DEFAULT ''
);
