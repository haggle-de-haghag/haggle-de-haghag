BEGIN TRANSACTION;

CREATE TEMPORARY TABLE migration (
    rule_access_id int,
    type varchar(16)
);
INSERT INTO migration (rule_access_id, type)
SELECT id, type
FROM rule_access;

ALTER TABLE rule_access DROP COLUMN type;
ALTER TABLE rule_access ADD COLUMN type varchar(16);

UPDATE rule_access SET type = mg.type
    FROM migration AS mg WHERE rule_access.id = mg.rule_access_id;
ALTER TABLE rule_access ALTER COLUMN type SET NOT NULL;

DROP CAST (varchar AS rule_access_type);
DROP TYPE rule_access_type;

COMMIT;

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
