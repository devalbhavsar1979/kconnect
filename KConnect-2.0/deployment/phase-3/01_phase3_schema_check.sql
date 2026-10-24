-- Phase 3 uses the tables/columns created in Phase 2. NO DDL or data mutation is needed.
-- Select your EXISTING staging database in phpMyAdmin and run this read-only check.
-- Do NOT reimport Phase 2 schema/seed SQL and do NOT clear existing users or files.
SELECT migration, batch FROM migrations WHERE migration = '2026_10_19_000001_create_domain_schema';
-- Expected: seven rows (users + six profile module tables).
SELECT table_name, engine, table_collation FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name IN
('users','academic_details','experience_entries','user_expertise','user_preferences','user_service_delivery','achievements')
ORDER BY table_name;
-- Expected: all listed unique indexes / foreign keys from the Phase 2 schema.
SELECT table_name, index_name, non_unique, column_name FROM information_schema.statistics
WHERE table_schema = DATABASE() AND table_name IN ('user_expertise','user_preferences','user_service_delivery') AND non_unique=0
ORDER BY table_name,index_name,seq_in_index;
SELECT table_name, column_name, referenced_table_name FROM information_schema.key_column_usage
WHERE table_schema = DATABASE() AND referenced_table_name='users'
AND table_name IN ('academic_details','experience_entries','user_expertise','user_preferences','user_service_delivery','achievements')
ORDER BY table_name;
