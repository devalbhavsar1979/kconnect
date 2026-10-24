# Spaceship staging release runbook

**Phase 2 update:** use [the current upload and test guide](../docs/phase-2/UPLOAD_AND_TEST.md) for schema/auth releases. The Phase 1 instructions below remain historical context. Phase 2 requires JWT_SECRET_KEY and PHASE2_SYNTHETIC_DATABASE=true, installs the baseline into an empty synthetic database, checks all 13 tables, and supports code-only rollback across the additive Phase 1/2 boundary. Never use the old empty-schema assumptions for the new release.

## Scope and layout

Approved staging hostname: `https://app.kconnect.in` (temporary staging use). Public root: `/home/nljgfkqgux/app.kconnect.in`. Proposed private root: `/home/nljgfkqgux/kconnect-staging-private`.

```text
kconnect-staging-private/
  staging.json                 private-root/public-root/base-url configuration
  deployer/                    deploy.php and ReleaseManager.php
  shared/.env                  persistent app key, synthetic DB credentials, readiness token
  shared/storage/              logs/cache/sessions/views and future uploads
  incoming/                    uploaded archive, initially .partial
  releases/<release-id>/       immutable package, per-release compiled config/routes
  current.json                 atomic release pointer, previous release and schema epoch
  maintenance.json             transient maintenance gate; retained on unresolved failure
  deployments.jsonl            release IDs/timestamps; no credentials
  deploy.lock                  OS flock; released when deploy process exits
app.kconnect.in/
  index.php                    stable loader; reads current.json on each request
  .htaccess                    asset/API/SPA dispatch; private files denied
  .kconnect-owned              ownership marker for managed public root
  assets/                      append-only content-hashed frontend assets
  workbox-<hash>.js             retained worker dependencies for old tabs
```

Only the generated public bootstrap and public assets belong in the web root. Do not upload the Laravel project root there. Symlinks are not required: shared storage/environment paths are supplied explicitly at CLI/web bootstrap. New code runs from a new absolute path, reducing dependence on OPcache resets. Stale responses are detected by the readiness release ID; no shared-service restart is assumed.

## One-time provisioning (not executed)

1. Confirm the private directory does not already contain another application. Create distinct private and public staging roots owned by the hosting account; public root must be empty except `.well-known`, or already managed by this exact bootstrap.
2. Create a **synthetic staging MariaDB database and restricted user** in cPanel. There is no production import. Phase 1 does not create domain tables.
3. Place `deploy.php` and `ReleaseManager.php` in the private `deployer/` directory. Copy `staging.spaceship.json` to private `staging.json`. Review all absolute paths before executing.
4. Create private `shared/.env` using `backend/.env.example`; set APP_ENV=staging, APP_DEBUG=false, APP_URL, stable randomly generated APP_KEY, database credentials, and a random READINESS_TOKEN of at least 32 characters. Keep READINESS_TABLES empty in Phase 1; Phase 2 will define required schema gates. Do not put secrets in chat or Git.
5. Confirm key-based noninteractive SSH, pinned known-hosts, the chosen PHP CLI path, proc_open, Phar, curl, pdo_mysql, write permissions and database access. Web PHP 8.5 must be tested as well as CLI 8.4.
6. Install reviewed workflow at repository-root `.github/workflows/kconnect-v2.yml` only when root integration is authorized. Its current nested location is deliberately inactive.

No cleanup of an existing web root is automated. A placeholder index or unrelated site triggers refusal; review and relocate it explicitly outside the deploy script. Do not delete WordPress files or alter the main domain.

## Build and local tests

Use PHP 8.4 with Composer, Node 22 and Python 3.12 in CI. On Windows, `tools/bootstrap-php.ps1` installs portable tools inside `.runtime` after checksum verification. Prefix `php`/Composer commands with their portable paths when they are not on PATH.

From KConnect-2.0:

```text
composer install --working-dir=backend
npm ci --prefix frontend
node tools/verify_frontend_parity.cjs
npm run build --prefix frontend
```

Ensure `backend/bootstrap/cache`, `backend/storage/logs`, `backend/storage/framework/cache/data`, sessions/views and `backend/resources/spa` exist. Copy `frontend/dist/` contents into `backend/resources/spa/` for integration tests. Then:

```text
php backend/vendor/bin/phpunit -c backend/phpunit.xml
python -m unittest discover -s tests -v
composer install --working-dir=backend --no-dev --prefer-dist --optimize-autoloader
composer check-platform-reqs --working-dir=backend --no-dev
python tools/package_release.py --release RELEASE_ID --commit COMMIT_ID
php tools/rehearse_release.php artifacts/RELEASE_ID.tar.gz
```

The rehearsal creates an isolated ignored directory under artifacts and uses SQLite in memory only for connectivity checks. It does not contact hosting or migrate a database. PHPUnit is removed by --no-dev; reinstall development dependencies before rerunning PHP tests.

## GitHub environment

Create GitHub environment `staging` with appropriate protection rules. Variables: DEPLOY_HOST=66.29.148.150, DEPLOY_PORT=21098, DEPLOY_USER=nljgfkqgux, STAGING_PRIVATE_ROOT=/home/nljgfkqgux/kconnect-staging-private, REMOTE_PHP=/usr/local/bin/php (verify selected CLI).

Secrets: SSH_PRIVATE_KEY (dedicated unattended deployment identity), SSH_KNOWN_HOSTS (independently verified entry including port). Do not copy a passphrase-protected interactive key into CI and expect batch mode to prompt; use an approved CI identity/agent arrangement. The existing personal key is never embedded in source.

Build/test runs on changes once the workflow is activated. `workflow_dispatch` with deploy_staging=true promotes the tested artifact from that same run after both PHP matrix jobs pass. No rebuild occurs during promotion. Environment concurrency plus server flock serialize deployments. Linux runners install production packages; no dependency downloads or frontend compilation happen on shared hosting.

The SSH transport uploads to a `.partial` filename, renames only after a completed transfer, and supplies the expected SHA-256 to the private runner. Unknown host keys and authentication failures stop before deployment. Remote settings must already exist; transport does not invent credentials or change domain configuration.

## Activation, probes and rollback

The runner verifies checksum, manifest paths/hashes, schema epoch and disk headroom. It extracts to a new release ID, prepares shared directories and per-release configuration/routes, then copies additive immutable assets. Old hashed assets and workbox dependencies remain for existing tabs; no retention deletion is implemented in Phase 1.

For activation it writes a maintenance marker with an ephemeral probe hash, atomically replaces current.json, and checks health/readiness over HTTPS. Only the deploy probe can bypass maintenance. TLS verification remains enabled; redirects are rejected so a different application cannot satisfy probes. Readiness must return the expected release ID and successfully reach the database.

On smoke failure with a previous release, the old pointer is restored and probed before maintenance is cleared. If that probe fails, maintenance stays enabled. First-release failure also keeps maintenance enabled for operator inspection. Automated schema migrations are prohibited in Phase 1; manifests must declare an empty migration list and `phase1-no-schema` epoch.

After a successful deployment, a compatible prior release can be restored with:

```text
php /home/nljgfkqgux/kconnect-staging-private/deployer/deploy.php rollback /home/nljgfkqgux/kconnect-staging-private/staging.json
```

Rollback is code-only; it never restores a database or runs destructive down migrations. Phase 2 must extend compatibility gates before database changes ship.

## Interrupted/failing deployment recovery

- Transfer/checksum/disk failures leave the live pointer unchanged. Retry with a complete artifact.
- Preparation failures leave an unactivated release directory. Do not reuse its immutable ID; inspect and rebuild with a new ID.
- A first-bootstrap interruption may leave public files without the ownership marker. Reconcile the generated files explicitly; do not blindly delete a nonempty root to bypass protection.
- An interruption during activation leaves maintenance.json and potentially the new pointer. Inspect current.json, release logs and readiness. Restore/probe the intended release before clearing maintenance. The deployer refuses further automatic activation while unresolved maintenance exists.
- Disk headroom uses filesystem free bytes, not cPanel account quotas/inodes. These need host validation; write failures must be treated as failures, not successful deployment. Backups and retention remain operator responsibilities until later phases.

## Acceptance still required on Spaceship

Verify actual web PHP version/extensions, .htaccess authorization and API/SPA errors, AutoSSL challenge access, DB readiness, two consecutive releases, prior release rollback, failed smoke recovery, stale-asset requests and host quota behavior. Local filesystem tests do not replace these checks.
