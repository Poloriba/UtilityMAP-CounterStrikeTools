-- V2 : Fix column types - bytea -> varchar/text
-- Caused by Hibernate ddl-auto=update creating wrong types on PostgreSQL
-- Use convert_from for proper bytea -> text conversion

ALTER TABLE utility_lineup ALTER COLUMN map_name TYPE VARCHAR(255) USING convert_from(map_name, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN name TYPE VARCHAR(255) USING convert_from(name, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN description TYPE TEXT USING convert_from(description, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN side TYPE VARCHAR(10) USING convert_from(side, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN utility_type TYPE VARCHAR(20) USING convert_from(utility_type, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN throw_position TYPE VARCHAR(255) USING convert_from(throw_position, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN aim_position TYPE VARCHAR(255) USING convert_from(aim_position, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN image_url TYPE VARCHAR(255) USING convert_from(image_url, 'UTF8');
ALTER TABLE utility_lineup ALTER COLUMN video_url TYPE VARCHAR(255) USING convert_from(video_url, 'UTF8');

ALTER TABLE pg_exec ALTER COLUMN name TYPE VARCHAR(255) USING convert_from(name, 'UTF8');
ALTER TABLE pg_exec ALTER COLUMN map_name TYPE VARCHAR(255) USING convert_from(map_name, 'UTF8');
ALTER TABLE pg_exec ALTER COLUMN snapshot_json TYPE TEXT USING convert_from(snapshot_json, 'UTF8');

ALTER TABLE app_user ALTER COLUMN username TYPE VARCHAR(255) USING convert_from(username, 'UTF8');
