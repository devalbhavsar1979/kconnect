SHOW CREATE TABLE saved_opportunities;
SELECT migration, batch FROM migrations WHERE migration = '2026_10_23_000001_create_saved_opportunities';
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saved_opportunities';
