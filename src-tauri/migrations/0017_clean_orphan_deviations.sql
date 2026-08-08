DELETE FROM deviations
WHERE (target_type = 'trait' AND NOT EXISTS (SELECT 1 FROM traits WHERE traits.id = deviations.target_id))
   OR (target_type = 'form' AND NOT EXISTS (SELECT 1 FROM form_details WHERE form_details.id = deviations.target_id));
