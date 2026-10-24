-- Phases 4 and 5 use the complete schema shipped in Phase 2. No DDL or reseeding.
-- Select the EXISTING app.kconnect.in database in phpMyAdmin before importing.
SELECT migration, batch FROM migrations WHERE migration='2026_10_19_000001_create_domain_schema';
-- Expect these six tables, all InnoDB.
SELECT table_name,engine FROM information_schema.tables WHERE table_schema=DATABASE()
AND table_name IN ('users','categories','organizations','opportunities','applications','opportunity_attachments') ORDER BY table_name;
-- Inspect the existing decimal, date/time and JSON columns; no ALTER is needed.
SELECT table_name,column_name,column_type,is_nullable FROM information_schema.columns WHERE table_schema=DATABASE()
AND ((table_name='opportunities' AND column_name IN ('fee_amount','event_date','start_time','end_time','delivery_modes','tags','target_audience','skills_required','status','visibility'))
OR (table_name='opportunity_attachments' AND column_name IN ('file_path','file_size_bytes','uploaded_at'))) ORDER BY table_name,ordinal_position;
-- Confirm relational constraints and category/application uniqueness.
SELECT table_name,column_name,referenced_table_name FROM information_schema.key_column_usage
WHERE table_schema=DATABASE() AND referenced_table_name IS NOT NULL
AND table_name IN ('organizations','opportunities','applications','opportunity_attachments') ORDER BY table_name,column_name;
SELECT table_name,index_name,column_name FROM information_schema.statistics WHERE table_schema=DATABASE() AND non_unique=0
AND table_name IN ('categories','applications') ORDER BY table_name,index_name,seq_in_index;
