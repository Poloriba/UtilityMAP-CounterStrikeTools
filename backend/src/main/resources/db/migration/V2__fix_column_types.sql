-- V2 : Fix column types - bytea -> varchar/text
-- Caused by Hibernate ddl-auto=update creating wrong types on PostgreSQL

ALTER TABLE utility_lineup ALTER COLUMN map_name TYPE VARCHAR(255) USING map_name::text;
ALTER TABLE utility_lineup ALTER COLUMN name TYPE VARCHAR(255) USING name::text;
ALTER TABLE utility_lineup ALTER COLUMN description TYPE TEXT USING description::text;
ALTER TABLE utility_lineup ALTER COLUMN side TYPE VARCHAR(10) USING side::text;
ALTER TABLE utility_lineup ALTER COLUMN utility_type TYPE VARCHAR(20) USING utility_type::text;
ALTER TABLE utility_lineup ALTER COLUMN throw_position TYPE VARCHAR(255) USING throw_position::text;
ALTER TABLE utility_lineup ALTER COLUMN aim_position TYPE VARCHAR(255) USING aim_position::text;
ALTER TABLE utility_lineup ALTER COLUMN image_url TYPE VARCHAR(255) USING image_url::text;
ALTER TABLE utility_lineup ALTER COLUMN video_url TYPE VARCHAR(255) USING video_url::text;

ALTER TABLE pg_exec ALTER COLUMN name TYPE VARCHAR(255) USING name::text;
ALTER TABLE pg_exec ALTER COLUMN map_name TYPE VARCHAR(255) USING map_name::text;
ALTER TABLE pg_exec ALTER COLUMN snapshot_json TYPE TEXT USING snapshot_json::text;

ALTER TABLE app_user ALTER COLUMN username TYPE VARCHAR(255) USING username::text;
