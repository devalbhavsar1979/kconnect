# Phase 2.3 FTP deployment

Base release: `phase22-20261023-001`. New release: `phase23-20261024-001`.
Includes Applied/Saved responses in applications, migration of existing saved records, corrected Applied spelling, and attribute icons on the opportunity details page.
No SSH, Composer, Node, or Artisan is required on hosting.

## 1. Verify the base and prepare

Read `/home/nljgfkqgux/kconnect-staging-private/current.json`. Its release must be `phase22-20261023-001`. If different, stop: this delta needs a matching base. The hosted release has not been verified by the package creator.

Back up current.json, the application database, and public `.htaccess`, `sw.js`, `registerSW.js`, and `manifest.webmanifest`. Preserve private shared/.env and shared/storage.

In cPanel File Manager COPY the complete private folder:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase22-20261023-001`
to `/home/nljgfkqgux/kconnect-staging-private/releases/phase23-20261024-001`.
Confirm `backend/vendor/autoload.php` exists directly inside the new release, without another nested release folder.
In the NEW copy only, remove generated PHP cache files from backend/bootstrap/cache (config.php, packages.php, services.php, routes*.php), preserving the directory and .gitkeep.

## 2. Upload the private delta

Extract the ZIP locally. Upload the CONTENTS of
`upload-private/kconnect-staging-private/releases/phase23-20261024-001/`
to `/home/nljgfkqgux/kconnect-staging-private/releases/phase23-20261024-001/`.
Overwrite included files; do not use mirror/delete mode. Confirm zero failed transfers.
Never upload SQL, this guide, CHANGES.json, backend source, or credentials to the public web root.

## 3. Pause access and migrate

Schedule a brief maintenance window. Temporarily prepend these lines to the public `/home/nljgfkqgux/app.kconnect.in/.htaccess`, preserving the original file in your backup:

```apache
RewriteEngine On
RewriteRule ^ - [R=503,L]
```

Confirm both the site and an API URL return HTTP 503 before proceeding. Allow existing requests to finish, then take a final database export. Keep access paused until the new code is active. If the maintenance gate does not work, stop before changing the database.

In phpMyAdmin, select the existing application database. Run the included scripts in this exact order:

1. `sql/01_unify_opportunity_responses.sql`
2. `sql/03_correct_applied_status.sql`
3. `sql/02_verify_opportunity_responses.sql`

Stop on any error. Do not reseed. Confirm both migration markers, the Applied default, and zero missing_saved_records and old_status_records. Existing applications take precedence over legacy bookmarks. The legacy saved_opportunities table remains intact; new code uses applications only. MySQL ALTER statements auto-commit, so an SQL error may leave a partial schema update: keep maintenance enabled while resolving it.

## 4. Upload public assets and activate LAST

Upload CONTENTS of `upload-public/app.kconnect.in/` to `/home/nljgfkqgux/app.kconnect.in/`, overwriting included files. Retain old hashed assets. Public index.php and .htaccess are not included or replaced by this package.

Upload `activate-last/current.json` as `/home/nljgfkqgux/kconnect-staging-private/current.pending.json`. Rename the existing current.json to a backup name, then rename current.pending.json to current.json. Verify it points to `phase23-20261024-001`.

Restore the original public .htaccess to reopen access. Keep the database backup and previous release.

## 5. Acceptance checks

Use a fresh online browser session; close older tabs to allow the service worker to update.

- Sign in as SME and open an opportunity details page, including by direct URL.
- Check blue attribute icons across all four tabs and Key Information, on desktop and mobile.
- Save a suitable test opportunity: reload, confirm the Saved tab and one applications row with status exactly Saved for that applicant/opportunity.
- Apply to the same opportunity: confirm the SAME row ID has status exactly Applied, is in Applied, and is absent from Saved. Repeated clicks must not duplicate it.
- Confirm other users' responses are isolated and the admin application total excludes Saved rows.
- Check attachments and normal navigation. These checks create persistent records; use a test account/opportunity.

## Failure and rollback

Before SQL changes, rollback is restoring the prior pointer/public files. After SQL changes, do NOT restore phase 2.2 code alone: it treats Saved application rows as submitted applications. Keep maintenance enabled and correct forward, or restore the final pre-migration database export together with the old pointer/public files before reopening. Restoring a database after reopening can discard subsequent writes; reconcile those first. Do not run historical automatic code-only rollback for this transition.

## Validation and scope

Backend DomainTest passed (8 tests, 209 assertions). Frontend TypeScript, Vite, and PWA build passed. Archive integrity and file SHA-256 checks are verified by the packaging script. Hosted MySQL execution and browser acceptance remain pending. This package has not been uploaded or activated remotely. The manifest retains the baseline schema epoch for loader compatibility; use this manual guide for the required migrations.
