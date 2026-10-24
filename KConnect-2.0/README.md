# K-CONNECT 2.0

Active product changes: [Phase 2.2 details and deployment tracker](docs/phase-2.2/STATUS.md) (23 October 2026; not deployed).

Previous product changes: [Phase 2.1 change and deployment tracker](docs/phase-2.1/STATUS.md) (started 22 October 2026; not deployed).

Migration workspace created on 2026-10-19. All new migration work lives inside this directory. The parent application is a read-only reference, not a development target.

Current stage: **Phases 4 and 5 implemented together; combined manual FTP delta prepared.** The user confirmed Phase 3 profiles are working on hosting. Combined Phase 4/5 host acceptance is pending; no remote deployment is claimed.

- [Combined Phase 4/5 status](docs/phase-45/STATUS.md)
- [Combined changed-files FTP upgrade guide](docs/phase-45/UPLOAD_PHASE45.md)
- [All 59 legacy API operations mapped](docs/phase-45/API_COVERAGE.md)

- [Phase 3 implementation and validation](docs/phase-3/STATUS.md)
- [Phase 3 changed-files FTP upgrade guide](docs/phase-3/UPLOAD_PHASE3.md)
- [Phase 3 read-only SQL check](deployment/phase-3/01_phase3_schema_check.sql)

- [Phase 2 status and validation](docs/phase-2/STATUS.md)
- [Upload to app.kconnect.in and test](docs/phase-2/UPLOAD_AND_TEST.md)
- [FTP + phpMyAdmin deployment without SSH](docs/phase-2/FTP_UPLOAD_GUIDE.md)
- [Schema, authentication and authorization contracts](docs/phase-2/DESIGN_AND_CONTRACTS.md)

- [Phase 1 status and validation](docs/phase-1/STATUS.md)
- [Staging deployment runbook](deployment/README.md)
- [Workflow awaiting root activation](deployment/github/phase1.yml)

Staging target confirmed by user: `app.kconnect.in` temporarily. A dedicated private release directory and synthetic database are required; root WordPress remains untouched.

Local retry succeeded: isolated legacy dependencies installed on Python 3.11.9, dependency check passed, and actual FastAPI OpenAPI generation matches all 59 source operations. See `docs/phase-0/generated/runtime-openapi.json`. Database workflows/screenshots remain pending; source-derived capture fixtures are not yet observed HTTP responses.

User has confirmed Essential hosting, an SSH endpoint, and an undeployed legacy app. Phase 0 uses a fresh synthetic database. A 216-file isolated old-stack source copy is available in [baseline](baseline/README.md); original files remain unchanged. `app.kconnect.in` is the recommended destination, pending setup.

- [Phase 0 status and evidence](docs/phase-0/STATUS.md)
- [Generated API/UI baseline](docs/phase-0/generated/BASELINE.md)
- [Hosting and deployment decisions](docs/phase-0/HOSTING_AND_OPERATIONS.md)
- [Parity scenarios and known differences](docs/phase-0/PARITY_SPECIFICATION.md)
- [Data inventory and conversion risks](docs/phase-0/DATA_INVENTORY.md)
- [Original design](../docs/MIGRATION_DESIGN_SPACESHIP.md) and [original phase plan](../docs/MIGRATION_IMPLEMENTATION_PLAN.md), unchanged reference documents.

## Discovery tooling

From the parent repository:

```text
python KConnect-2.0/tools/discover.py
python KConnect-2.0/tools/verify_baseline.py
```

Python standard library only. These tools parse source without importing FastAPI, connecting to a database, starting servers, installing packages or calling external systems. Outputs stay inside this directory. Discovery refuses to overwrite its frozen source hash baseline if legacy source changes.

Generated JSON files are source-derived evidence, **not captured runtime OpenAPI or observed HTTP responses**. The contract capture matrix explicitly marks every endpoint pending. Synthetic fixtures use reserved example domains and invented IDs; they are not production exports or complete database seeds.

Local uploads are hashed without opening/rendering documents; shareable manifests omit original filenames and user IDs. Production secrets, database exports, personal records and raw authenticated network captures must never be added to this repository.

## Implementation boundary

Phase 1 was explicitly requested before Phase 0 fully closed. Outstanding runtime/access checks remain live-release gates. PHP source, frontend copy, tests and deployment tooling stay inside this workspace. No legacy source is changed. Three frontend type-only fixes emit identical JavaScript; see Phase 1 status. The CI workflow is not active until separately integrated at the repository root.
