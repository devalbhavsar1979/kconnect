-- Upgrade from phase 2.2. Pause application writes while running this script.
ALTER TABLE applications MODIFY status ENUM('Applied','Saved','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN') NOT NULL DEFAULT 'Applied';
START TRANSACTION;
UPDATE applications SET status = 'Applied' WHERE status = 'APPLIED';
INSERT INTO applications (id, opportunity_id, applicant_id, status, applied_at, updated_at)
SELECT UUID(), s.opportunity_id, s.user_id, 'Saved', s.updated_at, s.updated_at
FROM saved_opportunities s
WHERE NOT EXISTS (
 SELECT 1 FROM applications a WHERE a.opportunity_id = s.opportunity_id AND a.applicant_id = s.user_id
);
INSERT INTO migrations (migration, batch)
SELECT '2026_10_24_000001_unify_opportunity_responses', COALESCE(MAX(batch),0)+1 FROM migrations
HAVING NOT EXISTS (SELECT 1 FROM migrations WHERE migration='2026_10_24_000001_unify_opportunity_responses');
COMMIT;
