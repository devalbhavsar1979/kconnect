# Phase 2.4 ? Applications grouped by opportunity

Admin navigation: Opportunities > Applications (`/admin/applications`). The existing SUPER_ADMIN access policy applies to both the list and profile endpoints. SME opportunity browsing remains unchanged; My Applications is now implemented as described below.

The page reuses the opportunity card with an applicant section containing every Applied applicant for that opportunity. Saved and all other application statuses are excluded. Opportunities remain reviewable even when closed or hidden. Search by opportunity title, description, or organization; filter by opportunity type; pagination is by opportunity (12 per page), never truncating the applicants within a card.

Each applicant shows name, user role, latest degree ordered by completion year and month (undated degrees do not displace dated degrees), total experience in years/months from the earliest valid start month to the current month in Asia/Kolkata, and the union of skills across all experience entries. Skills are trimmed and deduplicated case-insensitively. Experience measures elapsed career span, including gaps, rather than adding overlapping jobs. Missing data displays Not specified; future start dates do not contribute to experience.

View Profile opens a read-only admin page with the summary, contact/basic profile fields, education, and experience history. API profile fields are explicitly selected; authentication secrets and private storage paths are excluded. Profile and application endpoints reject non-super-admin access. Summary queries are batched across each opportunity page.

No database schema change is required beyond phase 2.3. Backend changes: OpportunityController, AdministrationController, ApplicantProfiles service, and domain routes. Frontend changes: ApplicationsPage, ApplicantProfilePage, ApplicantSummary, routes, and optional applicant content in OpportunityCard.

Validation: DomainTest passed (9 tests, 239 assertions). Hosted deployment and browser acceptance are pending. FTP package prepared: artifacts/phase24-20261024-001-FTP-CHANGES.zip, based on phase23-20261024-001. No remote deployment has been performed. Frontend production build and package integrity checks passed.

## SME My Applications

The /applications route now shows only the authenticated user's submitted applications, excluding Saved, with the existing opportunity cards plus application status, cover note, and Applied on date (Asia/Kolkata). Later workflow statuses and closed/hidden opportunities remain in the application history. Details links are disabled when the opportunity is no longer publicly available. Search, opportunity type filtering, and pagination are supported; ordering is newest application first. The API ignores caller-supplied applicant IDs and scopes every result to the authenticated user. No database migration is required. The previous phase24-20261024-001 FTP archive is immutable and does not include this later change.

SME FTP update prepared: artifacts/phase24-20261024-002-FTP-CHANGES.zip; required base phase24-20261024-001. Upload guide: UPLOAD_PHASE24_SME.md. Checksums and archive integrity verified. Backend: 10 tests, 268 assertions passed; frontend production build passed. Not deployed remotely.
