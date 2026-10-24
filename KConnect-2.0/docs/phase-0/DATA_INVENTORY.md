# Data and file discovery

## Scope

**Scope update, 2026-10-19:** user confirmed no deployed existing application and selected a fresh synthetic database. Live production export/import, production row reconciliation and production file transfer are not required. The source-derived conversion concerns below remain relevant to designing the MariaDB schema and equivalent behavior; all actual runtime validation will use synthetic records. Earlier references to obtaining a live inventory are historical contingencies, not current prerequisites.

An isolated source-only reference exists under `baseline/legacy`. PostgreSQL 18.6 is installed locally with a running service, but no database connection, creation or migration has been performed. Its suitability against the declared PostgreSQL 15 baseline must be established first. Never repurpose an existing local database.

Only the local checkout was inspected. No `.env` secrets, database connections, SQL execution, production exports or uploaded document contents were opened. File bytes were read only for SHA-256 inventory. Local files are not proof of the production dataset.

`generated/model-inventory.json` records all 13 table definitions, mapped fields, enum expressions, defaults, relationships and declared constraints. `generated/schema-inventory.json` records validation/schema classes separately; schema classes are not tables.

| Tables | Dependency / parity concern |
|---|---|
| users | Parent UUIDs, bcrypt hashes, roles/statuses, email uniqueness, timestamps |
| refresh_tokens | User FK, hash/revoked/expiry; session transfer decision pending |
| academic_details, experience_entries | User ownership, date/order/null semantics; experience skills array |
| user_expertise, user_preferences, user_service_delivery | One/user uniqueness, arrays, upsert semantics |
| achievements | User FK, file path/display metadata and cleanup |
| organizations | Creator FK; organization-name fields and category conventions |
| categories | Category identifiers/uniqueness; do not invent FKs for plain-text category fields |
| opportunities | Organization/creator references, arrays/enums/decimal/date fields |
| opportunity_attachments | Opportunity FK and two-root storage issue |
| applications | Opportunity/applicant FKs and unique pair; preserve records despite placeholder APIs |

## PostgreSQL dependencies beyond type conversion

- `ARRAY`, dialect UUIDs, named enums and PostgreSQL migration SQL.
- Array `.any()` membership and `array_to_string()` substring search.
- `ON CONFLICT DO UPDATE` in expertise/preferences/service delivery.
- Explicit `NULLS LAST` ordering in academic/experience/opportunity queries.
- Timestamp timezone behavior, `ILIKE`/collation, exact decimals and field serialization.
- Migration 014 includes table/type drops; it is not a safe data conversion script.

## Local file evidence

`generated/local-upload-inventory.json` records both `backend/uploads` and root `uploads`, counts, byte totals, file extension and SHA-256. Relative paths are represented by SHA-256 to avoid publishing filenames or user IDs. This is sufficient for local change detection, not for matching DB file paths. Secure production reconciliation will require the real paths in an access-controlled manifest.

No files were copied, renamed or deleted. Source preservation manifest intentionally excludes uploads and secrets; upload hashes provide a separate local file baseline.

## Outstanding live inventory

Obtain via a designated read-only account or sanitized export: exact DB version, actual Alembic revision, table/column/constraint/index definitions, per-table counts, schema drift, orphaned FKs, duplicate emails under target collation, array values/nulls/order, invalid dates, database size and file-reference counts. Record export consistency and timezone settings.

Reference plan: import users and independent lookups first; then organizations/profile children; opportunities; attachments/applications. Handle refresh tokens according to the approved session decision. Determine the exact graph from verified live constraints before implementation. Stage into an empty target and never merge production rows by email automatically.

A complete import must reconcile every row and referenced file. Missing source files and source defects need explicit exception records; silent drops or repaired values are forbidden.
