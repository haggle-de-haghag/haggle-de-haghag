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
