# Hosting capability and deployment decision register

## Evidence levels

**Observed:** local source/Git metadata. **Advertised:** supplied Spaceship screenshot/public specifications. **Proposed:** migration design choice. **Pending:** account/runtime fact not checked.

## User confirmation and public HTTP observation (2026-10-19)

Latest domain/runtime update: user confirms **app.kconnect.in is connected**, document-root folder label **app.kconnect.in**, selected **web PHP 8.5**. Absolute document-root path still needs confirmation; do not infer it solely from the folder label. The target is now the subdomain, rather than `/app`. Web extensions/settings and exact patch version have not been observed. CLI remains 8.4.26: locate a matching CLI binary or explicitly validate the final dependencies and application on both versions before deployment. Do not change the root WordPress site's PHP settings as a side effect.

The initial public HTTPS HEAD check failed certificate hostname validation (curl 60). After the user confirmed SSL configuration, a strict HTTPS recheck succeeded on 2026-10-19 at 09:05 IST: HTTP 200, HTML content type, LiteSpeed, with no certificate-verification bypass. The prior hostname-validation blocker is resolved from this client. This verifies the public HTTPS endpoint, not deployment of K-CONNECT or application/API behavior.

Latest confirmation supersedes the earlier pending domain-role/plan questions: **Shared Hosting Essential**; SSH server `66.29.148.150`, port `21098`, username `nljgfkqgux`. Existing app is undeployed. New destination candidates are `app.kconnect.in` and `kconnect.in/app`. Synthetic test data only; no production migration.

The initial agent SSH preflight stopped on an unknown host key. Subsequently the user successfully connected interactively as `nljgfkqgux` on `server48` and supplied read-only command results. Agent/CI authentication and independent fingerprint verification are not established by those outputs.

User-supplied terminal evidence: PHP CLI 8.4.26, Zend OPcache 8.4.26; PHP at `/usr/local/bin/php`; `mysql`, `mariadb`, `tar`, `sha256sum` at `/usr/bin/`. `composer` produced no path (not found on PATH, not proof of absence everywhere). `mysql --version` identifies MariaDB **client** 11.4.13, client protocol label 15.2; the connected database server version is still unknown. Prefer the `mariadb` command because the mysql alias reports deprecation. Web-SAPI version remains pending.

Further user-supplied CLI evidence: required framework extensions are present (ctype, curl, dom, fileinfo, filter, hash, mbstring, openssl, pcre, PDO, session, tokenizer, xml), plus pdo_mysql. Other useful modules include bcmath, intl, gd, imagick, zip, Phar and sodium. PostgreSQL client extensions do not establish availability of a hosted PostgreSQL database. This extension list applies to CLI only.

`pwd` returned `/home/nljgfkqgux`. `public_html` exists at `/home/nljgfkqgux/public_html`, mode `drwxr-x---`, owner `nljgfkqgux`, group `nobody`. This listing does not prove the actual WordPress document root, available subdomain mapping or symlink support. The supplied `df -h` reports shared filesystem space (including 76G available on `/`), not this account's disk/inode quota or application resource limits. Do not use filesystem totals to size the Essential account. The mistyped `pd` command is immaterial; subsequent `pwd` succeeded.

### URL recommendation

Prefer `https://app.kconnect.in/` with its own public document root. Current React routes, Vite asset base, PWA `start_url`/`scope`, `/api/v1`, and `/uploads` assume root paths. A subdomain preserves those assumptions and separates the current WordPress site. The `/app` alternative requires coordinated router basename, build base, manifest/service-worker scope, API/file URL and WordPress rewrite changes with additional parity testing. The user offered both alternatives; no DNS, certificate or document-root change has been made.

- User supplied `https://www.kconnect.in/`; plan/endpoint and interactive SSH login are now confirmed as described above.
- User confirmed repository `https://github.com/devalbhavsar1979/kconnect.git`, matching the local origin.
- A read-only HTTPS HEAD request followed a 301 redirect from `www.kconnect.in` to `https://kconnect.in/`, which returned 200.
- Observed response headers include `server: LiteSpeed`, `x-redirect-by: WordPress` on the redirect, and an `api.w.org` REST link on the destination.
- This indicates a WordPress-related public site, not verified React/FastAPI baseline behavior. HTTP headers do not prove the hosting account owner, plan, PHP version or database version.
- Domain role is confirmed as the new hosting destination; existing app is undeployed. Preserve the root WordPress site; no replacement, document-root change or DNS change has occurred.
- The web browsing tool could not access the URL. A sandboxed curl request failed at its local proxy; the approved external read-only request succeeded. Do not interpret the sandbox failure as site downtime.

| Capability | Current evidence | Verification needed before Phase 1 |
|---|---|---|
| Provider stack | Essential plan user-confirmed; advertised LiteSpeed, CloudLinux, PHP/MariaDB | Exact account runtime versions and resource limits |
| PHP web + CLI | User: web 8.5 selected; CLI 8.4.26 at /usr/local/bin/php | Exact web patch/modules; matching CLI or explicit dual-version validation |
| Extensions | User CLI list includes required framework modules and pdo_mysql | Equivalent web-SAPI modules and final Composer platform requirements |
| MariaDB | Client 11.4.13 reported by user | Actual server version, charset/collation, privileges, SQL mode/timezone |
| SSH/SFTP | Interactive user login succeeds; agent/CI login not verified | Independently verified host fingerprint, key-based CI login, permitted commands/SFTP |
| Packaging tools | tar and sha256sum located; Composer not on PATH | Archive/checksum execution and platform checks; package dependencies in CI |
| Public root | User confirmed /home/nljgfkqgux/app.kconnect.in | Public-only release layout mechanics, rewrites and Authorization forwarding |
| Release activation | Pending | Symlink, rename and filesystem boundaries as seen by LiteSpeed |
| Persistent files | Home path known; public_html owned by account | Writable private shared path, account disk/inode quota, storage-link policy |
| PHP limits | Pending | Memory, request/body/time limits and 10 MB multipart uploads |
| OPcache | Extension present in CLI version output | Web enablement/settings and fresh code after deployment |
| Cron | Advertised | Minimum interval, max execution and simultaneous-job restrictions |
| Backups | Backup manager advertised | Export/restore tools, restore permissions, encrypted off-host copy destination |
| TLS/DNS | app.kconnect.in strict HTTPS check passed, HTTP 200 on 2026-10-19 | Separate staging setup and application-route validation still pending |
| Resources | Pending | CPU, memory, entry process/concurrency, I/O and DB connection limits |

Account command evidence above was supplied by the user. The agent has performed a public HTTPS HEAD check and an unsuccessful strict SSH preflight; no account changes or successful agent-authenticated probes have occurred.

## Decisions

### Confirmed domain root and proposed release layout

User confirmed the absolute document root: `/home/nljgfkqgux/app.kconnect.in`. Domain: `https://app.kconnect.in/`. This resolves path discovery, not rewrite, symlink, storage-write or release-switch verification.

Proposed account layout (not created):

```text
/home/nljgfkqgux/
  app.kconnect.in/             public document root only
  kconnect-private/
    releases/<release-id>/    Laravel source and production dependencies
    shared/.env              server-only environment configuration
    shared/storage/          persistent application storage
```

The public directory will expose the React build, public assets, routing configuration and a Laravel public entry point wired to the selected private release. Laravel source, vendor directory, environment files, logs and backups stay outside it. Check proposed private directory names for collisions before provisioning.

If the domain can target a versioned release's public directory through a supported pointer, prefer that arrangement after verifying the host's symlink policy. Otherwise retain the confirmed root and use maintenance-protected activation of matched public assets and the private release entry-point reference. Do not claim atomic or zero-downtime switching for this fallback. Final mechanics require host validation; nothing has been changed remotely.

| ID | Decision | Status and rationale |
|---|---|---|
| D01 | GitHub Actions as CI candidate | GitHub origin observed and user-confirmed; workflow rights and deployment secrets support pending |
| D02 | Build and package outside Spaceship | Proposed; prevents shared-host dependency/build load |
| D03 | Same artifact staging -> production | Proposed; frontend uses relative `/api/v1`, avoiding environment-specific rebuilds |
| D04 | SSH/SFTP archive transfer | Proposed pending account verification; no unencrypted FTP |
| D05 | Versioned private releases + shared storage/config | Proposed pending public-root and symlink checks |
| D06 | Atomic current pointer | Conditional; otherwise maintenance-mode verified directory activation |
| D07 | Separate staging database/storage and hostname | Required; exact resources pending |
| D08 | All future application source under KConnect-2.0 | Confirmed user requirement; supersedes prior sibling `backend-php/` suggestion at legacy root |
| D09 | Preserve JWT contract and unchanged React UI | Confirmed design; session cutover policy still pending |

Provider evidence: [Spaceship specifications](https://www.spaceship.com/en-GB/web-hosting/). Runtime candidate requirements: [Laravel 13 deployment](https://laravel.com/framework/docs/13.x/deployment). These links were reviewed during design; no exact account version is inferred from them.

## Operator collection checklist

Collect non-secret version/limit outputs or panel values. Do not paste passwords, `.env`, private keys or full connection strings into chat. Use secure access mechanisms for any eventual remote execution.

- Plan name; region; SSH enabled state; PHP selector and CLI version.
- Installed extensions and MariaDB version/settings.
- Staging domain and separate database/storage availability.
- Ability to use a public-only document root and safe release switch.
- Backup/restore privileges and supported deployment transport.
- Existing production URL and designated baseline test environment.

## Workload and operational acceptance (not yet agreed)

| Parameter | Value | Owner needed |
|---|---|---|
| Typical/peak simultaneous requests | Pending | Product/operator |
| Largest expected search dataset | Pending | Data owner |
| Current API latency p50/p95 and error rate | Pending measurement | Technical lead |
| Upload throughput and storage growth | Pending measurement | Operator |
| Acceptable cutover downtime | Pending | Product owner |
| RPO / RTO | Pending | Product/data owner |
| Backup retention and destination | Pending | Operator |
| Cutover and restore executor | Unassigned | Operator |

Do not treat the current Axios 15-second timeout as a performance target. Capture measured baseline and agree thresholds before qualification. Code rollback and cross-database post-write recovery remain separate procedures.
