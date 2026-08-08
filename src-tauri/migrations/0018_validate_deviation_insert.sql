CREATE TRIGGER IF NOT EXISTS deviations_validate_insert
BEFORE INSERT ON deviations
FOR EACH ROW
WHEN (NEW.target_type = 'trait' AND NOT EXISTS (SELECT 1 FROM traits WHERE traits.id = NEW.target_id))
  OR (NEW.target_type = 'form' AND NOT EXISTS (SELECT 1 FROM form_details WHERE form_details.id = NEW.target_id))
BEGIN
  SELECT RAISE(ABORT, 'deviation target does not exist');
END;
