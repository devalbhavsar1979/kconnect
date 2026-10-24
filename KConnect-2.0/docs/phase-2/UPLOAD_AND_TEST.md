# Phase 2: upload and test on app.kconnect.in

Target: temporary staging only. All accounts/data are synthetic. No root-domain WordPress changes.
The upload ZIP includes production PHP dependencies and the React build. Composer and Node are not needed on Spaceship.

## 1. Create a database in cPanel

Open **Manage My Databases / MySQL Databases** (wording may vary). Create a NEW database named `kconnect_stage` and a new database user with a strong password. Add that user to that database with ALL PRIVILEGES on this database only. Copy the complete cPanel-prefixed database name and username; do not guess them. Do not use a WordPress database. Keep the password private.

The schema installer refuses an unrelated or partly installed database. This is intentional. Never use `migrate:fresh`, `db:wipe`, or destructive reset commands on hosting.

## 2. Upload the ZIP outside the public document root

In cPanel File Manager, open `/home/nljgfkqgux`. Create `kconnect-staging-private` if it does not exist. Upload the generated `phase2-...-upload.zip` from local `KConnect-2.0/artifacts` into that directory and extract it there. Select **Show Hidden Files** in File Manager settings.

The extracted layout must be:

```text
/home/nljgfkqgux/kconnect-staging-private/
  deployer/deploy.php
  deployer/ReleaseManager.php
  deployer/smoke-auth.php
  incoming/phase2-....tar.gz
  incoming/phase2-....tar.gz.sha256
  staging.json
  shared/.env.example
```

Do NOT extract the application tar.gz yourself and do NOT put this ZIP, vendor, .env, database files or Laravel source in `/home/nljgfkqgux/app.kconnect.in`.

If a Phase 1 private deployment already exists, preserve `shared/.env`, `shared/storage`, `releases`, `current.json` and backups. Replace only the reviewed deployer scripts and upload the new incoming archive. The ZIP has no `.env` and no live state. Review `staging.json` paths before replacing it.

## 3. Configure the private environment

In `shared`, copy `.env.example` to `.env` ONLY if `.env` does not exist. Edit that private file using File Manager. Use:

```dotenv
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://app.kconnect.in
APP_KEY=base64:PASTE_GENERATED_BASE64_KEY // base64:0a7bkdcmnZKDDxfBK5gZmrzI+Gd1b628rANOwt4ymeA=

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=PASTE_FULL_CPANEL_DATABASE_NAME
DB_USERNAME=PASTE_FULL_CPANEL_DATABASE_USERNAME
DB_PASSWORD="PASTE_PRIVATE_DATABASE_PASSWORD"
JWT_SECRET_KEY=PASTE_RANDOM_HEX_SECRET
READINESS_TOKEN=PASTE_DIFFERENT_RANDOM_HEX_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
PHASE2_SYNTHETIC_DATABASE=true
LOG_LEVEL=warning
```

Generate the three values in your own SSH terminal, one command at a time:

```bash
php -r 'echo "base64:".base64_encode(random_bytes(32)).PHP_EOL;' base64:0a7bkdcmnZKDDxfBK5gZmrzI+Gd1b628rANOwt4ymeA=

php -r 'echo bin2hex(random_bytes(32)).PHP_EOL;' e9f7ba490b1124b408cf7b7e5b0efec72f3c61451e932a11de873cad26785ac9

php -r 'echo bin2hex(random_bytes(32)).PHP_EOL;'cc9259a933914ee510c284a6bc350366ffa7ba47ccc313f600bd20e4b0d323dd

```

Copy the first entire line into APP_KEY, the second into JWT_SECRET_KEY and the third into READINESS_TOKEN. These outputs are secrets: do not paste them in chat, screenshots or GitHub. Preserve existing keys on later releases. Quote the database password as required by dotenv; escape quotes/backslashes if present. `READINESS_TABLES` is no longer used: Phase 2 always checks all 13 tables.

## 4. Check the public directory

The domain's document root stays `/home/nljgfkqgux/app.kconnect.in` and must be empty apart from `.well-known`, or already contain this application's managed Phase 1 bootstrap. If it contains a hosting placeholder, back up that specific placeholder outside the document root using File Manager before proceeding. Do not delete an existing application or WordPress files. Do not change the document root to the Laravel project.

If cPanel added PHP-handler directives to `.htaccess`, retain a backup and review the required handler before replacing it; the deployer refuses unexpected files. Ask for help with the exact refusal message rather than removing the whole directory.

## 5. Deploy from your existing SSH terminal

You can use your already working interactive SSH login. The initial prepared archive is `phase2-20261019-001.tar.gz`; use its exact filename below. For a later build substitute that build's new immutable release filename:

```bash
cd /home/nljgfkqgux/kconnect-staging-private
chmod 700 shared
chmod 600 shared/.env
php -v
php deployer/deploy.php deploy staging.json incoming/phase2-20261019-001.tar.gz "$(cat incoming/phase2-20261019-001.tar.gz.sha256)"
```

Use PHP CLI 8.4 or 8.5. Deployment verifies the checksum and every file, builds the private configuration/routes, installs the baseline migration, switches the release pointer and checks HTTPS readiness. Success prints JSON containing the release ID. Readiness checks database access and all 13 tables. The database installer runs only after the public-root ownership checks pass. MariaDB DDL is not transactional: if migration fails halfway, the live pointer remains unchanged, but partial new tables can remain. Use a new empty synthetic database after investigating; never blindly reset the old one.

If checksum, permissions, configuration or readiness fails, stop and share only the error text. Do not retry by deleting state files. Inspect private `shared/storage/logs/laravel.log` without sharing secrets. A failed first activation can retain `maintenance.json`; reconcile the pointer and probe the intended release before clearing maintenance, following the Phase 1 recovery runbook.

## 6. Create synthetic test users

After deployment succeeds, run:

```bash
cd /home/nljgfkqgux/kconnect-staging-private
export KCONNECT_SHARED_PATH=/home/nljgfkqgux/kconnect-staging-private/shared
release=$(php -r '$s=json_decode(file_get_contents("current.json"),true); echo $s["release"];')
cd "releases/$release/backend"
php artisan migrate:status
php artisan kconnect:seed-staging
```

The seed command prompts privately for a test password of at least 12 characters. Choose it yourself. It creates `sme@example.test`, `professional_service_provider@example.test`, `admin@example.test`, `super_admin@example.test` and `freelancer@example.test`. Existing fixture passwords are preserved on repeat runs. No real emails are sent. The privileged accounts are CLI-created only.

## 7. Run server and browser tests

```bash
php /home/nljgfkqgux/kconnect-staging-private/deployer/smoke-auth.php https://app.kconnect.in
```

Expect PASS for health, registration, duplicate rejection, privileged-role rejection, all current-user routes, missing/wrong credentials, login, refresh, logout and rejected revoked refresh. The script leaves one identifiable synthetic account and revokes its issued sessions. It never prints passwords or tokens.

Then use a fresh browser profile or incognito window at `https://app.kconnect.in`:

1. Check the existing login and registration screens and visual layout.
2. Register a new SME with no CV, then another with a small PDF/DOC/DOCX; confirm successful sign-in. Try a duplicate email and mismatched passwords.
3. Sign out, then sign in with the seed SME account and your private test password. Reload and check that authentication persists. Sign out again.
4. Verify `/health` returns `{"status":"healthy"}` and `/api/v1/not-implemented` returns JSON 404, while a frontend deep link loads the React shell.
5. Confirm `/.env`, `/vendor/autoload.php` and `/uploads/private.pdf` are unavailable. Confirm AutoSSL still works.

Profile writes, CV download routes, dashboard statistics, admin management, opportunities and applications are NOT implemented in Phase 2. Their API calls may return 404 after login. This is a staged authentication release, not a complete application release. Do not assess those workflows as Phase 2 completion.

The preserved legacy service worker caches GET API responses; use a clean online browser for these tests. Cross-account/offline cache behavior must be corrected or explicitly accepted before production; HTTP no-store alone does not override service-worker Cache API behavior.

## 8. Repeat release and recovery

Upload a newly built immutable release ID using the same procedure. Preserve `.env`, storage and database. The baseline migration is idempotent once its migration record exists. Run the smoke test again. For a previously successful compatible release:

```bash
cd /home/nljgfkqgux/kconnect-staging-private
php deployer/deploy.php rollback staging.json
```

Rollback switches code only. It never drops tables or discards newly registered users. Restoring Phase 1 makes auth APIs unavailable again while retaining Phase 2 data. First deployment has no previous release. For repeat staging releases, take a cPanel database backup first and keep a private backup of shared storage. No cleanup or database restore is automated.

## 9. Future GitHub automation

The reviewed workflow remains at `KConnect-2.0/deployment/github/phase1.yml`. It is intentionally inactive until installed at repository-root `.github/workflows/kconnect-v2.yml`; existing root files remain untouched. Configure the staging environment, SSH identity, pinned known-hosts and variables described in `deployment/README.md`. The workflow tests SQLite and MariaDB on PHP 8.4/8.5, packages once and can deploy that same artifact manually. Run the initial cPanel procedure before enabling automated promotion.
