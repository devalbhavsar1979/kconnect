# Phase 1: foundation and automated staging release

Date: 2026-10-19. Status: **local implementation and rehearsal complete; live staging acceptance pending**.

The user explicitly requested Phase 1 despite remaining Phase 0 runtime/access gates, accepts PHP limits provisionally, and selected **app.kconnect.in temporarily as staging**. No server deployment or GitHub workflow activation has occurred. All new files are under KConnect-2.0; legacy files remain read-only.

## Delivered

| Area | Implementation |
|---|---|
| Backend | Laravel 13.37.0, Composer lockfile; PHP compatibility resolved against CLI 8.4.26 |
| Runtime tooling | Checksum-verified portable PHP/Composer under ignored `.runtime/`; no system installation |
| Routing | `/health` contract, protected `/internal/readiness`, JSON unknown API errors, React deep-link shell, safe public asset handling |
| Readiness | Token required; DB SELECT 1, optional required tables, writable storage and frontend build; release identity included |
| Frontend | Existing React source copied; three type-only corrections; emitted JavaScript unchanged |
| Packaging | Production-only Composer dependencies, frontend build, release/file hashes; excludes environment secrets, logs, cached config and development dependencies |
| Deployment | Pinned SSH transfer to `.partial`, checksum/manifest validation, serialized deploy, separate private/public roots, shared config/storage, environment-local cache preparation |
| Activation | Stable public loader reads atomic release-state JSON; maintenance gate; HTTPS readiness/release probes; failed probe restores compatible prior release |
| Rollback | Prior artifact activation, retained immutable assets/workbox files, no destructive down migrations or automatic pruning |
| CI | Reviewable GitHub Actions workflow: PHP 8.4/8.5 test matrix; one artifact; gated staging job |

Phase 1 deliberately implements no login/profile/business APIs. Their existing frontend screens render, but their API operations return JSON 404 until later phases. This is a foundation, not a functioning replacement application.

## Validation evidence

- React `tsc -b && vite build`: passed after compile-only type corrections.
- Frontend parity verifier: **128 files** checked; all differences restricted to three type declarations and identical emitted JavaScript. This is not a browser screenshot comparison.
- PHP tests: **10 tests / 33 assertions** passed. Includes health, API JSON, readiness authorization/schema failure, deep links, missing assets, two releases/rollback, bad checksum, low disk, failed smoke rollback, existing-site protection and truncated transfer.
- Python packaging test: passed; secret/log/cache exclusions, immutable release IDs and dev-dependency rejection.
- Composer platform checks: passed on local PHP 8.4.26. Composer resolution reported no advisories at install time.
- Real production archive extracted/prepared with environment-local `config:cache` and `route:cache`; Laravel-kernel probes passed for health, readiness, deep link and API 404. Uses synthetic SQLite connectivity locally; not a hosted MariaDB or HTTPS result.
- Original-file hash verification remains the preservation check from Phase 0; it must pass before handoff.

## Existing frontend build corrections

| File | Change | Runtime effect |
|---|---|---|
| `frontend/src/types/index.ts` | Add SUPER_ADMIN to UserType union | None; existing guards already use this value |
| `OrgIdentitySection.tsx` | Accept existing optional hint prop in FieldProps | None; rendering unchanged, hint remains unused |
| `PersonalInfoCard.tsx` | Mark gender-label map partial | None; preserves existing missing OTHER display behavior |

No package versions were upgraded in frontend package-lock.json. npm reported **15 existing advisories (1 low, 6 moderate, 8 high)**. Record for targeted security triage before release; no blanket audit fix was run. Original PWA icon availability and authenticated-cache behavior remain Phase 0/6 concerns.

## Actual release gates

1. User's interactive SSH works, but agent batch authentication still fails. Supply a dedicated CI-compatible key through GitHub environment secrets or a configured agent; never commit credentials.
2. Configure the approved staging public root `/home/nljgfkqgux/app.kconnect.in` and proposed separate private root `/home/nljgfkqgux/kconnect-staging-private`. Deployment refuses a nonempty unowned public root; review any existing files before provisioning.
3. Provide a synthetic MariaDB database/user and private shared environment; verify server version and web PHP 8.5 modules. PHP limits are provisionally accepted, with upload validation deferred.
4. Install the reviewed deployment runner and settings privately. Validate proc_open, Phar, PHP CLI, permissions, rewrite rules and real HTTPS probes on Spaceship.
5. Activate the workflow at repository-root `.github/workflows/`. It currently lives under `KConnect-2.0/deployment/github/` to obey the untouched-legacy-root requirement; GitHub will NOT execute it there. Root workflow activation is a separate explicit integration step.
6. Run actual hosted two-release/rollback and failure checks. CI PHP 8.5 and Linux execution are configured but have not run locally.

No PR was opened: changes remain uncommitted inside the new workspace, and repository-root workflow activation/remote publishing have not been performed. A draft PR description is provided for review.

Phase 1 must remain in progress until live staging checks pass. Foundation tests do not establish full application parity or complete Phase 0.
