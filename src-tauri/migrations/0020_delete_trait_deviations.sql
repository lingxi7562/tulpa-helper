CREATE TRIGGER IF NOT EXISTS traits_delete_deviations
AFTER DELETE ON traits
FOR EACH ROW
BEGIN
  DELETE FROM deviations WHERE target_type = 'trait' AND target_id = OLD.id;
END;
