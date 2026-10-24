# Phase 2 status — 2026-10-19

**Ready for staging upload/testing; live-host acceptance pending.** Implementation and local validation are delivered. The user authorized either direct deployment or a detailed upload guide. Direct SSH retry failed with `Permission denied (publickey,gssapi-keyex,gssapi-with-mic,password)`, so the upload route is provided. No remote files, database or domain settings were changed.

## Delivered

- Baseline migration for all 13 domain tables / 207 columns, UUID relationships, enums, JSON array conversion, UTC timestamps, binary text collation and original uniqueness/delete constraints.
- Seven API routes: register, login, refresh, logout, auth/me, users/me and read-only users/me/profile.
- Bcrypt/Python JWT compatibility, hashed refresh storage/revocation, active-user checks, exact-role middleware and ownership helper.
- Privileged public registration denied; registration field allowlist and compatible detail error envelope.
- Optional registration CV persistence in private shared storage with failure cleanup.
- Deterministic synthetic seed command, transactional insert-or-match users/reference importer and schema mapping/contracts documentation.
- Schema-aware deployment and code-only rollback, production archive, cPanel upload bundle, operator guide and host smoke-test script.
- PHP 8.4/8.5 + MariaDB CI workflow template updated inside KConnect-2.0. It is still inactive until integrated at repository root.

## Evidence

| Check | Observed result |
|---|---|
| Full PHP suite on PHP 8.4.26 / SQLite | 23 tests, 155 assertions passed |
| Schema/auth suite on local MariaDB 11.4.9 | 11 tests, 117 assertions passed |
| Python production-package test | Passed, including migration inclusion and secret/cache exclusion |
| Legacy bcrypt/JWT fixture | Python passlib/python-jose fixture verified by PHP; imported bcrypt login passed |
| Frontend parity | 128 baseline files checked; Phase 1 type-only exceptions emit identical JS; no Phase 2 frontend edits |
| Legacy source integrity | Baseline hash verification passed; 59 source operations / 40 UI routes / 13 tables inventory unchanged |
| Production Composer platform requirements | Passed on PHP 8.4.26; production-only dependencies packaged |
| Actual archive rehearsal | Extraction, schema install twice, config/route cache, readiness, deep link, API 404 and auth probes passed |
| Local HTTP smoke script against packaged release | All 14 checks passed; no passwords/tokens printed |
| Runner/smoke PHP syntax and workflow YAML | Passed |
| Live Spaceship/HTTPS/MariaDB | NOT RUN; SSH authentication failed |
| PHP 8.5 and GitHub-hosted matrix | Configured, NOT RUN |
| UI screenshots/full business workflows | NOT RUN; later phases still required |

MariaDB was initialized only inside ignored `.runtime`, bound to 127.0.0.1:33079 and shut down after testing. The official 11.4.9 ZIP checksum was verified as `802f9f40a9dca774a3ba62f39c21093942954f178d6d7d458dc51453929bcdda`. Initial full extraction hit local disk limits; minimal required binaries were extracted and reproducible old rehearsal copies removed. No source or release archive was removed. Windows sandbox temporary-directory restrictions required the packaging test to run outside the sandbox; it then passed.

## Release

- Release ID: `phase2-20261019-001`.
- Source: uncommitted worktree based on legacy commit `839332117ea29785e38aece16972d3778b14e187`; no GitHub commit/push/PR was created.
- Application archive: `artifacts/phase2-20261019-001.tar.gz`, 5,938 entries.
- Archive SHA-256: `c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e`.
- Operator bundle: `artifacts/phase2-20261019-001-upload.zip`, containing the same archive/checksum, private deployer, smoke script, environment example and upload guide.
- Upload ZIP SHA-256: `4e4bbc7aabf4cb8e5d3e6593dee40148fee8ccc86a22ccf4953014a38b98ed35`; ZIP integrity and embedded archive checksum verified.
- No private key, real credentials, real user data, local runtime or development dependencies are included.

## Remaining acceptance gates and limitations

1. Follow [UPLOAD_AND_TEST.md](UPLOAD_AND_TEST.md): create the dedicated synthetic cPanel database, configure private environment, upload and deploy the bundle.
2. Run the provided HTTPS smoke script, seed CLI and browser checklist on app.kconnect.in. Confirm real hosting PHP/SQL runtime, permissions and AutoSSL behavior.
3. Exercise a second release and rollback on the host. Local tests do not prove LiteSpeed/OPcache behavior.
4. Profile writes, file-download authorization, admin workflows and opportunities are later phases. Some dashboard requests after login will still return 404. This is not a complete production application.
5. Preserve the documented differences: privileged signup blocked, random refresh jti, validation wording/input redaction, private CV storage pending Phase 3 download routes, MariaDB trailing-space comparisons. No real-data conversion report exists because fresh synthetic data was selected.
6. Legacy service-worker API caching and inherited frontend dependency findings remain production qualification items; use a fresh online browser for staged tests. No claim of full visual/behavioral parity is made from source hashes alone.

The detailed design and role matrix are in [DESIGN_AND_CONTRACTS.md](DESIGN_AND_CONTRACTS.md). Phase 2 remains **ready for host acceptance**, not fully closed, until the hosting checks are recorded.
