CREATE TABLE token (
    id SERIAL,
    game_id integer NOT NULL,
    title varchar(256) NOT NULL,
    text text NOT NULL
);
CREATE INDEX ON token (game_id);

CREATE TABLE player_token (
    id SERIAL,
    player_id integer NOT NULL,
    token_id integer NOT NULL,
    amount integer NOT NULL
);
CREATE UNIQUE INDEX ON player_token(player_id, token_id);