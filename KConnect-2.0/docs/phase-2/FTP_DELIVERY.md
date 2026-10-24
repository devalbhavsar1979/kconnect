# FTP delivery record

This is an alternative packaging/deployment path for the existing Phase 2 release. No business API or frontend source changes were made. The user's previously created private `.env` is reused and excluded from the deliverables.

Application source archive: `phase2-20261019-001.tar.gz`, SHA-256 `c70837f9ce6f2bf6355a452d1186c620d4da6a9e0832addb9ba57755573c9f2e`.

Prepared outputs under `artifacts/ftp-phase2-20261019-001`:

- `sql/01_schema.sql`: real MariaDB SHOW CREATE output from the Laravel migration, ordered by dependencies, plus the migration-history record. No database creation/drop, schema reset or disabled foreign-key checks.
- `sql/02_synthetic_data.sql`: five deterministic synthetic roles, category and organization, bcrypt password hashes. Reimports preserve existing rows/passwords. Requires a fresh synthetic database for exact credential/fixture parity.
- `sql/03_verify_import.sql`: read-only counts, migration record and collation checks for phpMyAdmin.
- `LOCAL_TEST_LOGINS.txt`: random plaintext test password, local-only and excluded from FTP ZIP/upload directories. Not version-controlled.
- `upload-private/`: complete production backend/vendor/React resources and empty writable directories.
- `upload-public/`: only the public bootstrap, routing rules and built immutable assets.
- `activate-last/current.json`: separate release pointer to rename into place after complete transfer and SQL import.

The schema contains 14 tables: 13 domain tables plus Laravel's migration history. SQL is exported from local MariaDB 11.4.9, imported into a second new database and compared with the original Laravel-created schema. Synthetic data is imported twice and the generated password verified. `tools/rehearse_ftp.py` additionally imports the literal SQL files and tests the actual uncached FTP layout through local HTTP, including all five seeded logins and the existing authentication smoke test. Detailed results are written to ignored `artifacts/ftp-validation.json` when that rehearsal passes.

No remote database/files changed, no SSH commands used, and no host acceptance is claimed. PHP/LiteSpeed routing and real FTP transfer completion still need the browser checks in [FTP_UPLOAD_GUIDE.md](FTP_UPLOAD_GUIDE.md). Manual FTP activation has no automatic deployment lock, checksum enforcement or rollback probing; preserve the previous pointer and avoid concurrent changes. The existing automated deployment flow remains available for later use.

## Observed validation

The complete FTP rehearsal passed on local MariaDB 11.4.9 / PHP 8.4.26: literal schema SQL imported; literal seed SQL imported twice; all five seed users logged in; authenticated readiness passed; all 14 HTTP authentication smoke checks passed. No Artisan/Composer/migration command was run against the FTP deployment layout. Only the hard-coded hosting private path was adapted to the local rehearsal directory. The temporary HTTP server and local MariaDB were stopped afterward.

Final ZIP: `artifacts/phase2-20261019-001-FTP.zip`, 9,183,499 bytes, 5,960 entries. SHA-256: `4f87e45f78976c7b6a01149e8b8bf65a89d2653d95a32e4a9644b3f599bd4ee6`. Every payload checksum was verified during rehearsal; `.env` and the local plaintext login file are excluded.
