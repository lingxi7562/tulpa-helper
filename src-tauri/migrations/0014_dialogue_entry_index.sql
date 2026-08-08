CREATE INDEX IF NOT EXISTS idx_dialogue_messages_entry_seq
  ON dialogue_messages (entry_id, seq, id);
