CREATE TRIGGER IF NOT EXISTS form_details_delete_deviations
AFTER DELETE ON form_details
FOR EACH ROW
BEGIN
  DELETE FROM deviations WHERE target_type = 'form' AND target_id = OLD.id;
END;
