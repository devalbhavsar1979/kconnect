-- Read-only checks. No migrations or data changes for phase 2.4.
SELECT migration FROM migrations WHERE migration IN (
 '2026_10_24_000001_unify_opportunity_responses',
 '2026_10_24_000002_correct_applied_status'
);
SHOW COLUMNS FROM applications LIKE 'status';
SELECT status, COUNT(*) AS records FROM applications GROUP BY status;
-- Expected: zero. Resolve incomplete phase 2.3 migration before activation.
SELECT COUNT(*) AS old_status_records FROM applications WHERE BINARY status IN ('APPLIED','Applid');
SELECT COUNT(*) AS applied_records FROM applications WHERE BINARY status = 'Applied';
