SHOW CREATE TABLE applications;
SELECT status, COUNT(*) AS records FROM applications GROUP BY status;
SELECT migration, batch FROM migrations WHERE migration IN ('2026_10_24_000001_unify_opportunity_responses','2026_10_24_000002_correct_applied_status');
-- Expected: zero missing saved records. Existing applications take precedence.
SELECT COUNT(*) AS missing_saved_records FROM saved_opportunities s
WHERE NOT EXISTS (SELECT 1 FROM applications a WHERE a.opportunity_id=s.opportunity_id AND a.applicant_id=s.user_id);

-- Expected: zero.
SELECT COUNT(*) AS old_status_records FROM applications WHERE BINARY status IN ('APPLIED','Applid');
