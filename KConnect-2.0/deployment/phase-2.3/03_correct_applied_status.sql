-- Run after 01, including databases that previously used the misspelled status.
ALTER TABLE applications MODIFY status ENUM('Applied','Saved','Applid','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN') NOT NULL DEFAULT 'Applied';
UPDATE applications SET status='Applied' WHERE status IN ('Applid','APPLIED');
ALTER TABLE applications MODIFY status ENUM('Applied','Saved','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN') NOT NULL DEFAULT 'Applied';
INSERT INTO migrations (migration, batch)
SELECT '2026_10_24_000002_correct_applied_status', COALESCE(MAX(batch),0)+1 FROM migrations
HAVING NOT EXISTS (SELECT 1 FROM migrations WHERE migration='2026_10_24_000002_correct_applied_status');
