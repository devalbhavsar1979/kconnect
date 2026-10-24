# Phase 2.3 — Opportunity responses in applications

SME Apply Now stores `Applied`; Save for Later stores `Saved`. Both use `applications` exclusively. Applying after saving updates the same application ID and resets applied_at to the application time. Repeated requests create no duplicates, and saving cannot downgrade an application. Saved rows use applied_at as their initial response timestamp to retain the existing non-null schema.

Saved and Applied tabs use application status. Opportunity details read the same row, and the admin application count excludes saved responses. Legacy request values APPLIED and SAVED_FOR_LATER remain accepted and map to the new values.

The migration expands the status enum, converts existing APPLIED records, and copies legacy saved records only where no application exists. Other workflow statuses are preserved. The legacy table is retained for historical data but no longer read or written by opportunity endpoints.

## Deployment

Back up the database and pause writes. Run `php artisan migrate --force` from the backend before activating the updated backend and rebuilt frontend together. For an FTP/phpMyAdmin upgrade from phase 2.2, run `deployment/phase-2.3/01_unify_opportunity_responses.sql` instead, followed by `02_verify_opportunity_responses.sql`. Stop on SQL errors; do not reseed. The manual SQL assumes the phase 2.2 saved_opportunities table exists; the Laravel migration also supports its absence.

Do not roll back only the code to phase 2.2: it interprets Saved application rows as submitted applications. Data rollback requires an explicit migration. No hosted deployment has been performed.

## Validation

DomainTest: 8 tests, 209 assertions passed on SQLite, including save/apply transitions, tab separation, duplicate prevention, migration repeatability, existing application precedence, and admin counts. Production MySQL migration has not been executed.

Spelling correction: the additional migration converts any previously stored `Applid` values to `Applied`. For manual deployment, run `03_correct_applied_status.sql` after 01 (or directly if the original phase 2.3 migration was already applied), then run verification SQL.

Second change: opportunity detail attributes across all four tabs and Key Information now have small blue Lucide icons on pale blue circular backgrounds, matching the supplied reference style. Icons are decorative; attribute labels remain accessible.
