-- V3 : Properly fix bytea columns that V2 converted to hex strings
-- V2 used ::text which converts bytea to hex like '\x48656c6c6f'
-- This migration drops the bad data and re-creates correct column types,
-- then the data will need to be re-imported

-- utility_lineup: drop and recreate with correct types
DELETE FROM pg_exec_lineup;
DELETE FROM favorite_lineup;
DELETE FROM utility_lineup;
DELETE FROM pg_exec;

-- Now alter columns from their current state to proper varchar/text
-- After V2, columns may be text containing hex strings - just reset types
ALTER TABLE utility_lineup ALTER COLUMN map_name TYPE VARCHAR(255);
ALTER TABLE utility_lineup ALTER COLUMN name TYPE VARCHAR(255);
ALTER TABLE utility_lineup ALTER COLUMN description TYPE TEXT;
ALTER TABLE utility_lineup ALTER COLUMN side TYPE VARCHAR(10);
ALTER TABLE utility_lineup ALTER COLUMN utility_type TYPE VARCHAR(20);
ALTER TABLE utility_lineup ALTER COLUMN throw_position TYPE VARCHAR(255);
ALTER TABLE utility_lineup ALTER COLUMN aim_position TYPE VARCHAR(255);
ALTER TABLE utility_lineup ALTER COLUMN image_url TYPE VARCHAR(255);
ALTER TABLE utility_lineup ALTER COLUMN video_url TYPE VARCHAR(255);

ALTER TABLE pg_exec ALTER COLUMN name TYPE VARCHAR(255);
ALTER TABLE pg_exec ALTER COLUMN map_name TYPE VARCHAR(255);
ALTER TABLE pg_exec ALTER COLUMN snapshot_json TYPE TEXT;

ALTER TABLE app_user ALTER COLUMN username TYPE VARCHAR(255);
