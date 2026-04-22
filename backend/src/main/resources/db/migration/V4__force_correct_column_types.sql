-- V4 : Force correct column types by dropping and re-adding columns
-- Tables are empty so we can safely drop and recreate columns

-- Drop all columns that are bytea and recreate as correct types
-- utility_lineup
ALTER TABLE utility_lineup
    DROP COLUMN IF EXISTS map_name,
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS side,
    DROP COLUMN IF EXISTS utility_type,
    DROP COLUMN IF EXISTS throw_position,
    DROP COLUMN IF EXISTS aim_position,
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS video_url;

ALTER TABLE utility_lineup
    ADD COLUMN map_name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN description TEXT,
    ADD COLUMN side VARCHAR(10) NOT NULL DEFAULT '',
    ADD COLUMN utility_type VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN throw_position VARCHAR(255),
    ADD COLUMN aim_position VARCHAR(255),
    ADD COLUMN image_url VARCHAR(255),
    ADD COLUMN video_url VARCHAR(255);

-- pg_exec
ALTER TABLE pg_exec
    DROP COLUMN IF EXISTS name,
    DROP COLUMN IF EXISTS map_name,
    DROP COLUMN IF EXISTS snapshot_json;

ALTER TABLE pg_exec
    ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN map_name VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN snapshot_json TEXT NOT NULL DEFAULT '';

-- app_user
ALTER TABLE app_user
    DROP COLUMN IF EXISTS username;

ALTER TABLE app_user
    ADD COLUMN username VARCHAR(255) NOT NULL DEFAULT '';

ALTER TABLE app_user ADD CONSTRAINT app_user_username_unique UNIQUE (username);
