# Phase 2.2 FTP deployment

Required current release: `phase21-20261022-001`.
New release: `phase22-20261023-001`.

This is a manual FTP/cPanel package. No SSH, Composer, Node or Artisan is needed on hosting.

## 1. Check the base and back up

Open `/home/nljgfkqgux/kconnect-staging-private/current.json`. Its `release` must be `phase21-20261022-001`. If different, do not apply this delta; provide the actual release ID for a matching package.

Download current.json, export the application database through phpMyAdmin, and save copies of public sw.js, registerSW.js and manifest.webmanifest. Preserve shared/.env and shared/storage.

## 2. Apply the database update FIRST

In phpMyAdmin select the existing application database and import `sql/01_saved_opportunities.sql`. This creates only the linked saved_opportunities table and records its migration. It does not modify existing applications or reseed data. Stop if any SQL error appears.

Run `sql/02_verify_saved_opportunities.sql`. Confirm the table, two foreign keys, composite primary key and migration marker exist before proceeding. The SQL must succeed before activating the new code.

## 3. Copy the current release on the server

In cPanel File Manager COPY:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase21-20261022-001`
to:
`/home/nljgfkqgux/kconnect-staging-private/releases/phase22-20261023-001`

Check that backend/vendor/autoload.php is directly under the new release, without an extra nested release directory.

In the NEW copy only, remove generated PHP files from backend/bootstrap/cache (config.php, packages.php, services.php, routes*.php). Preserve the directory and .gitkeep. Do not remove caches in the active release.

## 4. Upload files

Extract the ZIP locally.

| Local folder contents | Remote destination |
| --- | --- |
| upload-private/kconnect-staging-private/releases/phase22-20261023-001/ | /home/nljgfkqgux/kconnect-staging-private/releases/phase22-20261023-001/ |
| upload-public/app.kconnect.in/ | /home/nljgfkqgux/app.kconnect.in/ |

Upload contents into the matching directories and overwrite included files. Retain old hashed assets; do not use mirror/delete mode. Confirm no failed transfers. Public index.php and .htaccess are not replaced. SQL, guides and CHANGES.json stay outside the public document root.

## 5. Activate LAST

Upload `activate-last/current.json` to `/home/nljgfkqgux/kconnect-staging-private/current.pending.json`.
Rename the existing current.json to a backup name, then rename current.pending.json to current.json. A brief 503 between renames is possible.

## 6. Check the site

Use a fresh online browser session and sign in. Existing tabs may need closing/reopening for the service worker update.

- Open /opportunities and View Details. Confirm a full page at /opportunities/<UUID>, four tabs and the right panel.
- Check desktop/mobile layout, organization details, actual database dates, fees and attachment downloads.
- Save an opportunity, reload, and find it under Saved for Later.
- Apply to that opportunity and reload. Confirm Applied, one application record, and removal from Saved for Later. Use a suitable test opportunity/account: these actions persist real records.
- Check sharing links and direct navigation to the details URL.

## Rollback

Restore the saved previous current.json and backed-up public service-worker/manifest files. Keep new hashed assets. Keep saved_opportunities and existing applications: no database deletion or restore is needed for code rollback.

## Package notes

Organization records currently have no logo field, so the card uses a building icon. No vendor dependencies or credentials are included. This package uses the existing baseline schema epoch for compatibility and declares its additional required migration in the release manifest; deploy through this manual guide, not the historical automatic release manager.

Frontend production build and backend API checks passed during implementation. Visual browser and hosted acceptance remain pending. No remote deployment has been performed.
