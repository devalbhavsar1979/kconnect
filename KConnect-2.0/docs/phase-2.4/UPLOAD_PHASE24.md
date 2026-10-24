# Phase 2.4 FTP deployment

Required active release: `phase23-20261024-001`.
New release: `phase24-20261024-001`.

Includes the admin Opportunities > Applications list with grouped applicants and read-only View Profile pages. No database changes, Composer, Node, SSH, or Artisan are required on hosting.

## 1. Confirm the base and back up

Read `/home/nljgfkqgux/kconnect-staging-private/current.json` in cPanel. Its release must be `phase23-20261024-001`. If different, stop and request a package for that active release. The hosted release has not been checked by the package creator.

Back up current.json and public sw.js, registerSW.js, and manifest.webmanifest. Preserve shared/.env, shared/storage, and the existing release. Keep a current database backup.

In phpMyAdmin, select the application database and run `sql/01_phase24_preflight.sql`. It is read-only. Confirm both phase 2.3 migration markers exist, status supports Applied and Saved, and old_status_records is zero. If either migration is missing, complete phase 2.3 first. Zero applied_records is valid but means the new page will initially be empty.

## 2. Copy the current release

In cPanel File Manager COPY the full folder:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase23-20261024-001`
to:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase24-20261024-001`.

Confirm backend/vendor/autoload.php is directly within the new release, without an extra nested release folder.
In the NEW copy only, remove generated PHP files from backend/bootstrap/cache (config.php, packages.php, services.php, routes*.php). Preserve the directory and .gitkeep. Clearing the copied route cache is necessary for the new application/profile API endpoints.

## 3. Upload the delta

Extract the ZIP locally. Upload folder CONTENTS to these matching destinations:

| Local folder | Remote destination |
| --- | --- |
| upload-private/kconnect-staging-private/releases/phase24-20261024-001/ | /home/nljgfkqgux/kconnect-staging-private/releases/phase24-20261024-001/ |
| upload-public/app.kconnect.in/ | /home/nljgfkqgux/app.kconnect.in/ |

Overwrite included files and confirm zero failed transfers. Retain older hashed assets; do not use mirror/delete mode. Public index.php and .htaccess are not replaced. Keep SQL, documentation, CHANGES.json, and backend files outside the public root. This ZIP is a delta and requires the complete server-side copy in step 2.

## 4. Activate LAST

Upload activate-last/current.json as `/home/nljgfkqgux/kconnect-staging-private/current.pending.json`.
Rename current.json to a backup name, then rename current.pending.json to current.json. A brief 503 is possible between renames. Verify the new pointer names phase24-20261024-001.

## 5. Verify

Use a fresh online browser session. Close older tabs so the service worker can update.

- Sign in as SUPER_ADMIN. Open Opportunities > Applications (`/admin/applications`).
- Confirm opportunities with Applied responses appear, including closed opportunities; Saved responses do not appear.
- Confirm multiple applicants appear within one opportunity card, with name, role, latest degree, experience, and combined skills.
- Check search, type filtering, pagination, and mobile layout.
- Open View Profile for each of two different applicants and confirm the matching profile, education, and experience. Verify direct navigation to a profile URL works.
- Confirm SME accounts cannot access admin application/profile endpoints and existing opportunity browsing still works.

Experience is the elapsed time from the earliest valid experience start month to today, including gaps. Degree selection uses the latest completion year/month; missing data is shown as Not specified.

## Rollback

Restore the backed-up phase 2.3 current.json and public service-worker/manifest files. Retain new hashed assets. No database rollback is needed: phase 2.4 changes no schema or data. This code-only rollback applies to phase 2.3, not phase 2.2.

## Package validation

Backend tests passed: 9 tests, 239 assertions. Frontend TypeScript, Vite, and PWA build passed. Packaging verifies base manifests, archive integrity, and checksums. Hosted browser acceptance remains pending. Nothing has been uploaded or activated remotely.
