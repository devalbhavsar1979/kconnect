# Phase 2 deployment using FTP and phpMyAdmin — no SSH

This package already contains the compiled React build and production PHP vendor dependencies. No Composer, npm, Artisan, cron job or web installer is needed on the server. PHP loads the environment and routes normally without precompiled caches. Your existing `.env` is preserved; none is included in this package.

Use the package for **temporary synthetic staging at https://app.kconnect.in**. It implements Phase 2 authentication/schema, not later profile/admin/opportunity APIs.

## 1. Download and extract locally

Extract `phase2-20261019-001-FTP.zip` on your computer. It contains:

```text
upload-private/kconnect-staging-private/  -> private application and empty writable folders
upload-public/app.kconnect.in/            -> public index, .htaccess and built assets
activate-last/current.json                -> activation file; upload LAST
sql/01_schema.sql                         -> tables + Laravel migration-history marker
sql/02_synthetic_data.sql                 -> optional test users/category/organization
sql/03_verify_import.sql                  -> read-only import checks
FTP_UPLOAD_GUIDE.md
SHA256SUMS.json
```

`LOCAL_TEST_LOGINS.txt` is provided separately alongside the extracted local package in KConnect-2.0/artifacts/ftp-phase2-20261019-001. Keep it on your computer. It contains a randomly generated staging password; it is excluded from the ZIP and every upload folder. Do not upload it to hosting or put it in Git.

## 2. Create/select the database in cPanel

If your existing `.env` already names a NEW EMPTY staging database, use that database. Otherwise create a dedicated database and database user in cPanel, grant the user privileges on that database only, and update DB_DATABASE/DB_USERNAME/DB_PASSWORD in the existing private `.env` using File Manager. Use full cPanel-prefixed names. No `CREATE DATABASE` SQL is supplied because shared-hosting databases/users must be provisioned through cPanel.

Open **cPanel → phpMyAdmin**, click the correct staging database in the left sidebar, and check it is empty. Do not select the WordPress database.

1. Choose **Import**, select local `sql/01_schema.sql`, and click **Import/Go**. Expect 14 tables: 13 application tables plus `migrations`.
2. Import `sql/02_synthetic_data.sql` the same way. This creates five synthetic users, one category and one organization. Other domain tables remain empty for later phases.
3. Import `sql/03_verify_import.sql`, or paste it into the SQL tab. Confirm 14 tables, the baseline migration record, five users, one category and one organization.

If the Phase 2 schema was already successfully installed, SKIP 01_schema.sql and use the verification file first. Do not rerun the schema file over existing tables. It deliberately contains no DROP TABLE or foreign-key bypass. MariaDB DDL is not transactional: if the first schema import fails partway, stop and investigate or create another new empty staging database; do not blindly retry or reset an existing database.

The synthetic-data file can be imported again: it preserves existing rows/passwords. On a previously seeded database the password in the new local login file may therefore not apply. Duplicate UUID/email/name rows are left as-is, not reconciled or overwritten. Use a fresh database if you need the exact supplied fixtures. Do not use this seed file to import production data.

## 3. Upload private files first

Connect with your normal FTP client using the hosting account's FTP details, preferably FTP over TLS when available. Use binary/automatic transfer mode so PHP/asset bytes stay intact. Show hidden files.

Upload the CONTENTS of local:

```text
upload-private/kconnect-staging-private/
```

to:

```text
/home/nljgfkqgux/kconnect-staging-private/
```

An FTP client may show this location as `/kconnect-staging-private` or relative to its account home; the absolute cPanel path above is authoritative. If your FTP account is restricted to the public document root, use cPanel File Manager to upload/extract the private folder outside that root, or use an FTP account with access to the account home. Never move the private application into the public directory to work around the restriction.

Preserve existing `shared/.env`, uploaded documents and logs. This package contains only empty shared subdirectories with `.gitkeep`, not an environment file. Preserve any existing release folders, `current.json` and `maintenance.json`. Do not use an FTP “mirror/delete destination files” option.

Confirm this exact file exists after upload:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/phase2-20261019-001/backend/vendor/autoload.php
```

The package reuses the same tested Phase 2 release ID and bytes as the earlier archive. If this release folder already exists with a compiled bootstrap/cache/config.php or routes cache from a previous SSH deployment, preserve the already-working release and configuration. For a clean FTP installation the shipped bootstrap/cache contains only .gitkeep: do not add local or stale compiled config files. If an existing immutable folder differs, stop and use a new reviewed release instead of overwriting live source.

## 4. Verify the existing .env and permissions

Your existing `.env` belongs here:

```text
/home/nljgfkqgux/kconnect-staging-private/shared/.env
```

If you created it elsewhere, move it to that private location using File Manager. Do not put `.env` in the public root. Verify APP_ENV=staging, APP_DEBUG=false, APP_URL=https://app.kconnect.in, APP_KEY, DB_CONNECTION=mysql, DB_HOST=localhost, your DB credentials, JWT_SECRET_KEY and READINESS_TOKEN. Keep your existing generated keys. JWT_SECRET_KEY and READINESS_TOKEN each need at least 32 characters. Do not share these values. PHASE2_SYNTHETIC_DATABASE=true is retained for compatibility with a future automated deployment, but this FTP path runs no migration command.

PHP must be 8.4 or 8.5 with the previously checked PDO MySQL and other required extensions enabled. Use cPanel to set permissions if required: private shared directory 700, `.env` 600, private release directories 750/files 640, public directories 755/files 644. The PHP process must run as the hosting account and be able to write shared/storage and release/backend/bootstrap/cache. Never use 777.

## 5. Upload public assets and bootstrap

Upload the CONTENTS of:

```text
upload-public/app.kconnect.in/
```

to the existing document root:

```text
/home/nljgfkqgux/app.kconnect.in/
```

Transfer `assets/` and `workbox-*.js` first; transfer `.htaccess`, `.kconnect-owned` and `index.php` afterward. Do not upload the outer `upload-public` folder itself. Do not upload SQL, ZIPs, credentials, vendor or backend source here. Preserve `.well-known` for SSL and existing hashed assets needed by older tabs.

Back up an existing placeholder index/.htaccess outside the public root before replacing it. If .htaccess contains cPanel-managed PHP-version handler directives, retain the applicable handler block alongside the supplied routing rules; do not change the selected PHP version accidentally. Do not touch `/home/nljgfkqgux/public_html` or the root-domain WordPress files.

## 6. Activate LAST through FTP rename

Only continue once phpMyAdmin import succeeded and the FTP transfer queue has no failed files. The private `current.json` selects the active release.

1. Download and keep a local backup of existing private `current.json`, if present. Do not overwrite it during the bulk upload.
2. Upload local `activate-last/current.json` to private root with the temporary name `current.pending.json`.
3. In File Manager/FTP rename the old `current.json` to `current.previous.json` (preserve an existing backup under another name), then rename `current.pending.json` to `current.json`. A brief HTTP 503 between the two renames is expected. Do not edit an active pointer while it is being transferred.

On a first deployment only the second rename is needed. The supplied pointer has no previous-release ID; retain your manual backup for rollback. FTP deployment does not provide the automated deployer's lock, checksum enforcement or rollback probes. Avoid concurrent deployment and verify transfer completion before activation. If `maintenance.json` already exists from a failed earlier deployment, stop and investigate that failure before changing it; this package does not remove maintenance automatically.

## 7. Test entirely through the browser

Use a fresh online browser/incognito session. The preserved legacy service worker can cache API GETs, so do not reuse an old offline session for acceptance testing.

1. Open `https://app.kconnect.in/health`: expect `{"status":"healthy"}`.
2. Open `https://app.kconnect.in`: expect the original React login/registration UI.
3. Sign in as `sme@example.test` using the password from your LOCAL_TEST_LOGINS.txt. Reload and verify the session persists; sign out.
4. Register another synthetic SME with a new email, then sign in/out. Repeat with a small PDF/DOC/DOCX CV. Check duplicate email and mismatched-password feedback.
5. In browser Developer Tools → Network, confirm `/api/v1/auth/login` and `/api/v1/auth/me` return 200. No password_hash should appear in current-user JSON. Do not share screenshots containing tokens.
6. Open `/api/v1/not-implemented`: expect JSON 404. `/.env` and `/vendor/autoload.php` must be denied, not downloaded.
7. Check phpMyAdmin users contains the newly registered account and refresh_tokens contains only token hashes, not raw tokens.

Seed emails: sme@example.test, professional_service_provider@example.test, admin@example.test, super_admin@example.test, freelancer@example.test. Public ADMIN/SUPER_ADMIN registration is blocked; their seed accounts are for later role tests. Profile writes, CV downloads, dashboard statistics, admin management and opportunity APIs remain later-phase work and can still return 404 after login.

Health alone does not prove database access; successful login/current-user and registration are the required database checks. `/internal/readiness` requires your existing private header token; it is not a public browser page.

## 8. Troubleshooting/rollback without SSH

- 503 immediately: check private current.json points at the fully uploaded release, public index.php has the correct private absolute path, and no unresolved maintenance.json exists.
- 500: inspect private shared/storage/logs/laravel.log through File Manager; verify `.env`, PHP extensions and writable storage/bootstrap/cache. Never enable public APP_DEBUG or upload phpinfo/debug scripts.
- Login fails: verify SQL import, full cPanel DB names, correct local test password and that old seed accounts did not preserve a different password.
- Assets missing: retry failed FTP transfers and confirm files are directly under document-root/assets, not a duplicated outer directory.
- Deep links fail: confirm hidden .htaccess uploaded and the selected PHP handler is preserved.
- Rollback: upload the saved previous pointer as a temporary JSON file and rename it into current.json after checking that previous release still exists. This changes code only, never drops tables or accounts. For a first install there is no prior application pointer; restore your backed-up public placeholder if needed.

Do not automatically run migrate:fresh, delete shared/storage or replace secrets. This guide does not require any SSH command.
