-- Persist Supabase object paths and normalized image metadata.
ALTER TABLE lockets
  ADD COLUMN thumbnail_url VARCHAR(500) NULL AFTER image_url,
  ADD COLUMN image_width INT NULL AFTER thumbnail_url,
  ADD COLUMN image_height INT NULL AFTER image_width,
  ADD COLUMN image_bytes INT NULL AFTER image_height,
  ADD COLUMN thumbnail_bytes INT NULL AFTER image_bytes;
