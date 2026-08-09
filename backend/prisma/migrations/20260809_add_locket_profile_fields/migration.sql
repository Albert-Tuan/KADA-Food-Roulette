-- Locket + Profile structured MVP fields.
ALTER TABLE users
  ADD COLUMN bio VARCHAR(160) NULL AFTER avatar_url;

ALTER TABLE lockets
  ADD COLUMN dish_name VARCHAR(80) NULL AFTER image_url,
  ADD COLUMN restaurant_name VARCHAR(120) NULL AFTER dish_name,
  ADD COLUMN note VARCHAR(280) NULL AFTER restaurant_name,
  ADD COLUMN rating INT NULL AFTER note,
  ADD COLUMN tags JSON NOT NULL DEFAULT (JSON_ARRAY()) AFTER rating,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at,
  ADD COLUMN deleted_at DATETIME NULL AFTER updated_at;

UPDATE lockets
SET dish_name = 'Món ăn'
WHERE dish_name IS NULL OR TRIM(dish_name) = '';

ALTER TABLE lockets
  MODIFY COLUMN dish_name VARCHAR(80) NOT NULL,
  ADD CONSTRAINT chk_lockets_rating CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  ADD INDEX idx_lockets_deleted_at (deleted_at);
