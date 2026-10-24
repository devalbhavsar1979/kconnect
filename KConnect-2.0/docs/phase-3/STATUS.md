# Phase 3: profiles and uploads

Implemented inside KConnect-2.0 only. User subsequently confirmed uploading phase3-20261020-001-FTP-CHANGES and testing profiles successfully on hosting. Local desktop/mobile browser checks also passed login, photo display, all six tabs, and education save/reload against the exact package. The local browser harness was corrected to let PHP's built-in server serve static assets directly, matching the hosting static-file layout; no release change was required.

## Scope delivered

Twenty-one additional profile API operations: personal information update, completion percentage, photo upload, academic and experience CRUD, expertise/preferences/service-delivery read and save, and achievements CRUD with optional attachments. The existing profile read endpoint continues to serve the same user response. One authenticated file route serves owner-only photos, CVs and achievement documents.

React source, compiled frontend, Composer dependencies, database schema, public bootstrap and environment configuration are unchanged. The delta preserves the original Phase 2 compiled assets and production vendor files byte for byte. Original application source remains untouched.

Ownership is enforced in every collection update/delete and file lookup. Singleton saves lock the parent user to serialize writes. Uploads use private shared storage; replacement names are unique. Database failures clean up the new file, and old files are removed only after successful commits. Failed cleanup is logged without exposing paths. Photo limit is 2 MiB, achievement attachment limit 10 MiB; PHP request limits must also accommodate these sizes.

## Compatibility decisions

- Existing form fields, routes, methods, response shapes, array/default behavior and collection ordering are retained, including real multipart PUT for achievement edits.
- Profile completion uses the original fifteen fields and half-even rounding.
- Existing image and attachment URLs work without frontend changes through a signed, HttpOnly, SameSite=Strict cookie scoped to /uploads. The cookie cannot authenticate API calls. API authentication continues to require a bearer token. Logout clears the file cookie; token expiry and account-active checks still apply.
- Security corrections: profile edits cannot promote a user to administrator; files are no longer publicly readable; photos are checked as actual JPEG/PNG images. These intentionally tighten legacy behavior without changing normal profile workflows.
- Invalid nulls in nonnullable fields return validation errors instead of database errors. Validation text is not byte-for-byte Pydantic parity. Achievement extension/client MIME acceptance matches legacy behavior, but untrusted formats are served as downloads with nosniff and sandbox headers.
- The legacy service worker API cache remains unchanged and requires separate production qualification. Use a fresh online browser for hosting acceptance. Existing overview placeholder cards remain as designed; this phase does not add later-phase application features.

## Validation

- Full PHP suite on SQLite: 30 tests, 254 assertions passed.
- Authentication/profile suite on local MariaDB 11.4.9: 18 tests, 216 assertions passed.
- Frontend parity: 128 files checked; previous compile-only corrections emit identical JavaScript.
- Frozen baseline check: original source hashes unchanged; inventory remains 59 API operations, 40 UI routes and 13 tables.
- Packaged HTTP/browser rehearsal results are recorded in artifacts/phase3-validation.json. The rehearsal imports the Phase 2 SQL into a fresh local database, applies the actual delta to the frozen Phase 2 release, checks every manifest hash, and tests file ownership, native cookie access and multipart replacement/clear through the HTTP server. Browser captures are under artifacts/phase3-browser. It does not establish hosted performance or LiteSpeed behavior, or pixel parity against a running FastAPI deployment.

## Manual deployment

Use artifacts/phase3-20261020-001-FTP-CHANGES.zip with UPLOAD_PHASE3.md. It contains twelve added/changed release files plus activation JSON, change manifest, guide and read-only SQL. It deliberately excludes vendor, frontend assets, .env, user uploads and credentials.

The operator must copy the existing Phase 2 release to the new Phase 3 release directory on hosting before uploading the overlay. Clear generated bootstrap caches in that new copy, overlay the changed files, then switch current.json last. The unchanged old release is the rollback target. No table creation, ALTER statements or synthetic reseeding are required; do not rerun the Phase 2 schema/seed scripts against the working database.

Host acceptance follows the checklist in UPLOAD_PHASE3.md, including file replacement through the unchanged browser UI, persistence after reload, cross-account isolation and Phase 2 authentication regression checks.
