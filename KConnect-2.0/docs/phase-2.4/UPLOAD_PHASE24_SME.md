# Phase 2.4 SME My Applications FTP update

Required active release: `phase24-20261024-001`.
New release: `phase24-20261024-002`.

Adds SME My Applications at /applications, with opportunity cards showing application status, cover note, and Applied on date. The existing admin applications and profiles are preserved. No database changes, Composer, Node, SSH, or Artisan are required on hosting.

## 1. Confirm the base and back up

Read `/home/nljgfkqgux/kconnect-staging-private/current.json` in cPanel. Its release must be `phase24-20261024-001`. If different, stop and request a package for that active release. The hosted release has not been checked by the package creator.

Back up current.json and public sw.js, registerSW.js, and manifest.webmanifest. Preserve shared/.env, shared/storage, and the existing release. Keep a current database backup.

In phpMyAdmin, select the application database and run `sql/01_phase24_preflight.sql`. It is read-only. Confirm both phase 2.3 migration markers exist, status supports Applied and Saved, and old_status_records is zero. If either migration is missing, complete phase 2.3 first. Zero applied_records is valid but means the new page will initially be empty.

## 2. Copy the current release

In cPanel File Manager COPY the full folder:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase24-20261024-001`
to:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase24-20261024-002`.

Confirm backend/vendor/autoload.php is directly within the new release, without an extra nested release folder.
In the NEW copy only, remove generated PHP files from backend/bootstrap/cache (config.php, packages.php, services.php, routes*.php). Preserve the directory and .gitkeep. Clearing the copied route cache is necessary to replace the old My Applications placeholder API.

## 3. Upload the delta

Extract the ZIP locally. Upload folder CONTENTS to these matching destinations:

| Local folder | Remote destination |
| --- | --- |
| upload-private/kconnect-staging-private/releases/phase24-20261024-002/ | /home/nljgfkqgux/kconnect-staging-private/releases/phase24-20261024-002/ |
| upload-public/app.kconnect.in/ | /home/nljgfkqgux/app.kconnect.in/ |

Overwrite included files and confirm zero failed transfers. Retain older hashed assets; do not use mirror/delete mode. Public index.php and .htaccess are not replaced. Keep SQL, documentation, CHANGES.json, and backend files outside the public root. This ZIP is a delta and requires the complete server-side copy in step 2.

## 4. Activate LAST

Upload activate-last/current.json as `/home/nljgfkqgux/kconnect-staging-private/current.pending.json`.
Rename current.json to a backup name, then rename current.pending.json to current.json. A brief 503 is possible between renames. Verify the new pointer names phase24-20261024-002.

## 5. Verify

Use a fresh online browser session. Close older tabs so the service worker can update.

- Sign in as an SME and open My Applications (`/applications`), including by direct URL.
- Confirm only that account's submitted applications appear. Saved-only opportunities must be absent.
- Confirm every card shows the current application status, cover note (or No cover note provided), and Applied on date in Asia/Kolkata.
- Confirm newest applications appear first. Check search, type filtering, pagination, and mobile layout.
- Sign in as a different SME and confirm their own applications appear without the first user's private notes.
- Submitted applications remain visible after review or opportunity closure; View Details is disabled for opportunities no longer publicly available.
- Verify the admin Applications list and View Profile pages still work.


## Rollback

Restore the backed-up phase24-20261024-001 current.json and public service-worker/manifest files. Retain new hashed assets. No database rollback is needed: phase 2.4 changes no schema or data. This code-only rollback returns to the initial phase 2.4 release, where SME My Applications was a placeholder.

## Package validation

Backend tests passed: 10 tests, 268 assertions. Frontend TypeScript, Vite, and PWA build passed. Packaging verifies base manifests, archive integrity, and checksums. Hosted browser acceptance remains pending. Nothing has been uploaded or activated remotely.
