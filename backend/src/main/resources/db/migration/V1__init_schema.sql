-- V1 : Schéma initial UtilityMAP

DROP TABLE IF EXISTS pg_exec_lineup CASCADE;
DROP TABLE IF EXISTS favorite_lineup CASCADE;
DROP TABLE IF EXISTS pg_exec CASCADE;
DROP TABLE IF EXISTS utility_lineup CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE utility_lineup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_name VARCHAR(255) NOT NULL,
    side VARCHAR(10) NOT NULL,
    utility_type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    throw_position VARCHAR(255),
    aim_position VARCHAR(255),
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE favorite_lineup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES app_user(id),
    lineup_id UUID NOT NULL REFERENCES utility_lineup(id),
    UNIQUE (user_id, lineup_id)
);

CREATE TABLE pg_exec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    map_name VARCHAR(255) NOT NULL,
    snapshot_json TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pg_exec_lineup (
    exec_id UUID NOT NULL REFERENCES pg_exec(id),
    lineup_id UUID NOT NULL REFERENCES utility_lineup(id),
    PRIMARY KEY (exec_id, lineup_id)
);
