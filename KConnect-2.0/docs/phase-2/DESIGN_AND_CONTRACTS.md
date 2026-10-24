# Phase 2 implementation and contract record

All changes are inside KConnect-2.0. This phase implements schema and authentication only. The React runtime source is unchanged from the Phase 1 parity-approved copy.

## Schema

`tools/export_schema.py` loads the isolated legacy SQLAlchemy model metadata without connecting to PostgreSQL. It generates an explicit Laravel migration and `schema-mapping.json`: 13 tables and 207 columns. Review that migration as source; it is not regenerated at deployment.

| PostgreSQL representation | MariaDB representation/rule |
|---|---|
| UUID | UUID strings in CHAR(36); generated v4; original IDs retained by importer |
| Named enums | MariaDB ENUM with the same string members |
| Arrays | JSON arrays; preserve order and null versus empty array; nullable arrays remain nullable |
| Timezone timestamps | DATETIME(6), UTC application and connection timezone; JSON user timestamps emitted in UTC |
| Date/time | DATE / TIME(6); birth date serialized YYYY-MM-DD |
| Numeric(12,2) | DECIMAL(12,2), not floating point |
| Unique and foreign keys | Preserved, including one expertise/preferences/service-delivery record per user and opportunity/applicant uniqueness |
| Text comparison | utf8mb4_bin on all tables, preserving case-sensitive email/category comparisons |

MariaDB utf8mb4_bin ignores trailing spaces in comparisons, unlike PostgreSQL text equality. Validated email input cannot contain trailing spaces. Future category writes/imports must reject or reconcile trailing-space collisions; this is an explicit remaining data migration qualification case. SQLAlchemy callable defaults for arrays/UUIDs are application defaults, not legacy database defaults. Future domain services must supply empty arrays when omitted, as the original ORM did. No fictitious category foreign key is added: opportunities keep their legacy category string.

Schema installation is permitted only in staging/testing with PHASE2_SYNTHETIC_DATABASE=true. An initial database must be empty. Subsequent runs require the baseline migration record. A partial MariaDB DDL failure is not assumed transactional: stop, investigate and provision another empty synthetic database rather than destroying partial data. This phase has no production importer or automatic down migrations.

## API coverage

| Method | Path | Result |
|---|---|---|
| POST | /api/v1/auth/register | Multipart fields/optional PDF,DOC,DOCX up to 5 MiB; 201 token pair |
| POST | /api/v1/auth/login | JSON email/password; 200 token pair |
| POST | /api/v1/auth/refresh | JSON refresh_token; 200 access_token + token_type |
| POST | /api/v1/auth/logout | JSON refresh_token; idempotent 204; revoke stored refresh hash |
| GET | /api/v1/auth/me | Active bearer-authenticated user |
| GET | /api/v1/users/me | Same current-user representation |
| GET | /api/v1/users/me/profile | Same current-user representation; writes are Phase 3 |

Token pairs contain access_token, refresh_token, token_type="bearer". HS256 access claims retain sub/user_type/type/exp; refresh retains sub/type/exp and adds random jti to avoid legacy same-second duplicate sessions. Access defaults to 30 minutes, refresh to 7 days. Only SHA-256 refresh hashes are persisted. Logout revokes refresh, not an already issued access token, matching legacy behavior. Disabled accounts fail login and token use. Middleware reloads the active database user rather than trusting the role claim.

Laravel's model uses the password_hash column, UUID identity and excludes password_hash from JSON. Python-generated passlib $2b$ bcrypt hashes are verified directly by PHP; legacy python-jose HS256 fixtures decode in the new JWT service. Passwords retain bcrypt's legacy 72-byte truncation behavior. No deployed legacy sessions/data need importing because a fresh synthetic database was selected.

## Authorization

| Operation | Allowed |
|---|---|
| Public registration | SME, PROFESSIONAL_SERVICE_PROVIDER, VENDOR, TRAINER, FREELANCER, CONSULTANT |
| Public registration as ADMIN/SUPER_ADMIN | Denied 403, intentional security correction required by plan |
| Current user | Valid access bearer + active database user |
| Role middleware | Exact list of database roles; no implicit SUPER_ADMIN override |
| Ownership helper | Exact owner UUID; another user receives 404, even if privileged |
| Synthetic privileged accounts | Private CLI seed command, staging/testing/local only |

Registration uses an explicit field allowlist: injected is_active/is_verified/password_hash/id fields do not influence the account. No public role mutation endpoint is implemented in this phase. Role/ownership helpers are tested now; later domain endpoints must apply them and add their own route-level tests.

## Errors, uploads and deliberate differences

Business errors retain the {detail: string} shape and known duplicate/password/disabled-account messages. Field validation returns 422 with {detail: [{type, loc: ["body", field], msg}]}, matching the frontend's error handling. Laravel validation wording is not byte-identical to Pydantic, and rejected input values/passwords are not echoed. Registration additionally validates email and schema string lengths instead of allowing malformed input to become a database/serialization 500.

Registration CVs are named by server-generated user UUID and stored under private shared/storage/app/uploads/cvs, outside the public web root. Failed registrations remove newly written files. The existing cv_file_path string is retained. Authorized file serving/download behavior is Phase 3; this release does not claim CV downloads work. Extension/size acceptance retains the legacy rules; content scanning is not introduced.

The old service worker's GET API cache remains unchanged to preserve frontend scope. Auth responses send no-store, but service-worker Cache API behavior needs its own later correction/acceptance. This release is for synthetic staging only, not production qualification.

## Fixtures and initial importer

`php artisan kconnect:seed-staging` prompts for a private password and creates deterministic IDs for five roles plus one category/organization. Reruns preserve existing accounts/passwords. It is not a production admin provisioning flow.

`php artisan kconnect:import-references /private/path/export.json` accepts an object with users/categories/organizations arrays. Each row supplies its preserved UUID. User rows require first_name,last_name,email,password_hash,user_type; category rows require name; organization rows require organization_name,created_by. Additional fields must be actual columns. Timestamps normalize to UTC. Passwords must be existing bcrypt hashes, never plaintext. Files, refresh tokens and other domain tables are deliberately excluded.

Import inserts missing records in dependency order within one transaction. Existing IDs must match every supplied field; differences or constraint failures roll back the entire import. Output reports only inserted/matched counts. Repeatability/conflict tests use synthetic data; no real data import has occurred.

## Deployment and recovery

Artifacts include migrations and declare phase2-baseline. The deployer understands only the exact baseline migration; future schema epochs require new review. It verifies the public root before applying migrations. Phase 1 and this additive Phase 2 baseline are code-rollback compatible; rollback never drops new tables or users. Per-release caches use the persistent private environment/storage. SSH and HTTPS verification remain enabled.

The nested GitHub workflow includes PHP 8.4/8.5 and a MariaDB 11.4 service. It remains inactive until installed at repository root. The manual upload bundle carries the same production archive plus the private runner and smoke script. See UPLOAD_AND_TEST.md.

Reference documentation: [Laravel migrations](https://laravel.com/framework/docs/13.x/migrations) and [PHP JWT library](https://github.com/googleapis/php-jwt). Package versions are locked in composer.lock.
