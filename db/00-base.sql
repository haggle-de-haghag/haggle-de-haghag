CREATE TABLE game (
     id SERIAL,
     title varchar(256) NOT NULL,
     game_key varchar(32) NOT NULL,
     master_key varchar(32) NOT NULL
);
CREATE UNIQUE INDEX ON game (game_key);
CREATE UNIQUE INDEX ON game (master_key);

CREATE TABLE player(
    id SERIAL,
    game_id integer NOT NULL,
    display_name varchar(256) NOT NULL,
    player_key varchar(32) NOT NULL
);
CREATE INDEX ON player (game_id);
CREATE UNIQUE INDEX ON player (player_key);

CREATE TABLE rule(
    id SERIAL,
    game_id integer NOT NULL,
    rule_number integer NOT NULL,
    title varchar(256) NOT NULL,
    text text NOT NULL,
    UNIQUE(game_id, rule_number)
);
CREATE INDEX ON rule (game_id);

CREATE TYPE rule_access_type AS ENUM (
    'ASSIGNED',
    'SHARED'
);
CREATE CAST (varchar AS rule_access_type) WITH INOUT AS IMPLICIT;

CREATE TABLE rule_access (
    id SERIAL,
    rule_id integer NOT NULL,
    player_id integer NOT NULL,
    type rule_access_type NOT NULL
);
CREATE INDEX ON rule_access (rule_id, player_id);

