-- Taste Board posts no longer require dish metadata. Keep legacy columns and data for API compatibility.
ALTER TABLE lockets
  MODIFY COLUMN dish_name VARCHAR(80) NULL;
