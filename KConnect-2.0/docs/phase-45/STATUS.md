# Combined Phases 4 and 5

Release candidate: phase45-20261020-001. Base: phase3-20261020-001, which the user confirmed is deployed and working. Implementation is inside KConnect-2.0 only. Hosting acceptance for this combined release is pending; no remote deployment is claimed.

FTP ZIP SHA-256: `8154466f62f2de30209b26d568184ba1dfa4d4fbfc9c029487b115c1e2641173` (287,350 bytes). The package rehearsal passed the exact overlay/manifest checks and simultaneous attachment uploads (five accepted, sixth rejected). Desktop/mobile browser checks passed admin lists, category creation, opportunity edit/save/reload/preview/publish, and a fully loaded regular-user detail dialog. Captures were visually inspected.

## Delivered

- Administration: SUPER_ADMIN-only users list/detail/update with verification/deactivation and role updates; organization CRUD with linked-opportunity counts and deletion conflicts; category CRUD with name uniqueness and soft deactivation; dashboard counts.
- Opportunities: administrator list/detail/create/update; DRAFT/CLOSED publication, archive and draft-only deletion; organization associations; attachment upload/delete with five-file and 10 MiB limits; private file serving for SUPER_ADMIN.
- Regular-user opportunities: OPEN + VISIBLE_TO_ALL only, card/detail shape, joined organization names, pagination, search across title/description/tags/skills, delivery/type/expertise/location/category/date/duration filters, applied/closing-soon tabs and fee/deadline/newest sorting with null ordering.
- Existing general dashboard, application, organization and user-list placeholders retain their exact successful response bodies and role boundaries. No application-submission feature or new UI was added.
- Thirty remaining legacy API operations added. All 59 legacy operations now map to concrete routes, including earlier phases; see API_COVERAGE.md.
- Insert-or-match importer covers all thirteen domain tables, including profile arrays, opportunities, attachments, legacy application records, timestamps, decimals and hashed refresh tokens. Explicit path mappings are required for absolute legacy upload references. Imports are transactional and reject mismatching existing rows. It does not copy files; file-content reconciliation and full snapshot qualification belong to Phase 6. It is not required for this FTP deployment or the user's fresh synthetic database.

## Compatibility and intentional differences

Original React source and compiled assets remain unchanged, including preview behavior, placeholder pages and existing form validation. New draft writes require at least one opening, as in FastAPI; imported zero opening counts remain zero and display Unlimited. Creation forces DRAFT regardless of requested status. Partial PUT can explicitly change status, as in the legacy editor. Category deactivation does not remove free-text opportunity categories. Ordinary ADMIN is not SUPER_ADMIN.

Full opportunity fee_amount is serialized as a two-decimal string; list cards expose a number. Arrays remain JSON lists. Opportunity file paths are canonical relative private-upload paths rather than absolute server paths, and document reads require SUPER_ADMIN. Filename and stored-path handling prevents traversal. Files are removed only after database commit; new files are removed if the database write fails. Opportunity row locks serialize the count-and-upload operation.

Missing organizations and linked application deletion now produce controlled 404/409 responses instead of database errors. Null in nonnullable fields and out-of-range storage values produce 422. Error wording is not byte-for-byte Pydantic output. Laravel accepts trailing-slash variants without reproducing FastAPI's redirect hop. These are transport/error/security differences; no UI layout was changed.

Source behavior retained: closing-soon includes past deadlines; array search retains SQL wildcard semantics and comma-joined values; form-only rules are not invented as additional API publishing requirements. Text comparisons use lowercase LIKE; extreme array-search strings beyond the configured 16 MiB aggregate are outside local qualification. Existing MariaDB collation differences from PostgreSQL and legacy PWA API caching remain Phase 6 qualification items. Testing uses fresh online browser contexts.

## Validation

- Full SQLite suite: 37 tests / 618 assertions passed.
- New administration/opportunities/importer suite on MariaDB 11.4.9: 6 tests / 174 assertions passed.
- All 59 legacy operations checked for concrete routes; every protected legacy operation tested for unauthenticated denial, and admin routes checked for SUPER_ADMIN middleware.
- Full import fixture covers all thirteen tables, repeats without duplication, and rejects mismatches without overwriting records.
- Original-source hashes unchanged. Frontend parity checks all 128 files; earlier compile-only corrections still emit identical JavaScript.
- Exact-artifact HTTP/browser rehearsal and concurrency results: artifacts/phase45-validation.json. Desktop/mobile screenshots: artifacts/phase45-browser. These are local PHP 8.4.26/MariaDB 11.4.9/Edge evidence, not hosted LiteSpeed performance or a pixel comparison with a running old-stack deployment.

## Delivery

One combined changed-files-only ZIP, a read-only phpMyAdmin SQL check, and UPLOAD_PHASE45.md. Twelve release files are added/modified. No schema, dependency or frontend changes; no credentials, .env or user uploads included. Existing production vendor/frontend files come from a server-side copy of the working Phase 3 release. Activate only after the overlay has fully uploaded; retain Phase 3 for pointer rollback.

Finish the hosting acceptance checklist before treating Phases 4/5 as fully accepted. Phase 6 still covers complete old/new response qualification, all UI routes, PWA/session/cache behavior, representative data/file migration, hosting load/performance, backup restore and post-write recovery. This release does not imply Phase 6 or production cutover is complete.
