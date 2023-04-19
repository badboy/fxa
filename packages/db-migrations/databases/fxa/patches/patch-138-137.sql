-- SET NAMES utf8mb4 COLLATE utf8mb4_bin;

-- ALTER TABLE `recoveryKeys`
-- DROP COLUMN `recoveryKeyHint` VARCHAR(255),
-- ALGORITHM = INSTANT;

-- -- Decrement the schema version
-- UPDATE dbMetadata SET value = '137' WHERE name = 'schema-patch-level';
