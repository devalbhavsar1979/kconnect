# K-CONNECT: phased Laravel/MariaDB migration plan

Date: 2026-10-19 (Asia/Calcutta)  
Status: Planned; no implementation phase has started.  
Design authority: [Migration design](MIGRATION_DESIGN_SPACESHIP.md)

## 1. Delivery rules

1. Preserve UI and existing functionality. No redesign, feature additions or frontend framework migration.
2. Implement in small reviewable phases with explicit entry/exit evidence. Passing one phase does not imply later phases are complete.
3. Keep the current Python application operational and separate from the new PHP backend until cutover. No production dual writes.
4. Build deployment automation early and exercise it throughout development on staging.
5. Use fixtures and parity tests as acceptance evidence, not developer impressions. Record intentional exceptions separately.
6. Current authorization is documentation only. Future work starts with Phase 0 after development is requested; do not generate framework scaffolding now.

## 2. Phase overview

| Phase | Outcome | Dependencies | Indicative developer effort | Status |
|---|---|---|---:|---|
| 0 | Verified hosting and behavior baseline | Account/read access and representative system | 2-3 days | Not started |
| 1 | Laravel foundation and staging deployment automation | Phase 0 | 3-4 days | Not started |
| 2 | Database foundation, authentication and permissions | Phase 1 | 3-5 days | Not started |
| 3 | All profile modules and upload behavior | Phase 2 | 4-6 days | Not started |
| 4 | Admin users, organizations and categories | Phase 2; integration with Phase 3 | 2-3 days | Not started |
| 5 | Opportunities, dashboards and placeholder parity | Phases 3-4 | 4-6 days | Not started |
| 6 | Full data rehearsal, parity and operational validation | Phases 1-5 | 4-6 days | Not started |
| 7 | Controlled production cutover and observation | Phase 6 | 1-2 active days plus observation | Not started |
| Total | | | 23-35 active days | |

This refines the earlier preliminary 22-34 day estimate to include early automation and explicit release gates. It is approximately 5-7 working weeks for an experienced developer, not a fixed quote. Provider delays, unknown data quality, decisions and observation time are additional. Re-estimate after Phase 0. Role names below are responsibilities, not assignments to particular people.

## 3. Phase 0: discovery and parity baseline

**Entry:** design available; read access to target hosting and a representative existing environment. Production reads must not expose secrets or user data in logs.

Tasks:

- Verify every hosting capability in design section 8; record actual values and evidence. Confirm candidate PHP/Laravel version and MariaDB collation.
- Choose CI provider, deployment transport, public-root layout, activation fallback, staging domain and separate staging database/storage.
- Capture runtime route/schema inventory for 58 route declarations plus health. Resolve differences from source before freezing the specification.
- Inventory every frontend route and classify implemented, static/demo or placeholder behavior.
- Create contract fixtures for request/response/error cases and fixed UI baseline data/screenshots. Include ownership and role matrix.
- Inventory actual PostgreSQL schema, row/file counts, both upload roots, live deployment configuration and backup access.
- Record known defects and decisions: public roles, file privacy, PWA cache, session continuity. Do not expand migration scope implicitly.
- Establish expected workload, baseline performance, maintenance window, recovery objectives and retention responsibilities.

Deliverables: hosting capability report, API/UI parity matrix, data/file inventory, decision log, revised estimate and deployment layout decision.

**Exit:** no unresolved hosting blocker; baseline covers every route; recovery ownership is assigned; implementation choices supported by evidence. If access is unavailable, mark only dependent items blocked and continue source-based specification.

## 4. Phase 1: foundation and automated staging release

**Entry:** Phase 0 runtime/layout decisions complete.

Tasks:

- Create isolated Laravel backend with locked dependencies and production configuration conventions.
- Implement same-origin routing skeleton, compatible health endpoint and internal readiness check. Unknown API paths return JSON; frontend deep links return React shell.
- Create CI build/test/package workflow and release manifest; include production vendor dependencies and unchanged React build.
- Implement staging deployment preflight, host-key verification, checksums, environment links, shared storage, lock, activation and release logging.
- Implement prior-release activation and the host-specific maintenance fallback. Handle OPcache freshness and retained frontend assets.
- Verify public/private layout, secrets exclusion and writable directories.

Deliverables: foundation PR, versioned staging artifact, repeatable deployment run and recovery evidence.

**Exit tests:** deploy twice; interrupt an upload; reject an invalid checksum; reject insufficient space; verify old release remains available after preflight failure; activate/restore a prior release; load deep links and static assets over HTTPS. No business endpoint is claimed complete yet.

## 5. Phase 2: schema, authentication and authorization

**Entry:** staging deployment is repeatable.

Tasks:

- Create MariaDB baseline migrations for all domain tables, preserving UUIDs and constraints; define JSON/child-row conversions and serialization rules.
- Implement auth, current-user endpoints and reusable role/ownership middleware.
- Implement JWT access/refresh compatibility and hashed refresh-token revocation. Keep frontend token interfaces unchanged.
- Prove bcrypt compatibility and configure the non-default password column/UUID model behavior.
- Implement exception/validation serialization compatible with existing frontend expectations.
- Resolve the public-role security exception; enforce explicit permitted registration fields.
- Establish deterministic seed fixtures and initial repeatable importer for users/references.

Deliverables: schema mapping, auth contracts, role matrix, seeded staging and initial importer report.

**Exit tests:** registration with/without CV, duplicate email, invalid form, login, wrong credentials, disabled user, expiry, refresh, logout, current user, denied privileged registration and ownership checks. Preserve existing token response shape and error handling. Validate database uniqueness under chosen collation.

## 6. Phase 3: profiles and uploads

**Entry:** authenticated requests and schema are stable.

Tasks:

- Implement personal profile, photo upload and exact completion calculation.
- Implement academic, experience, expertise, preferences, achievements and service-delivery endpoints.
- Preserve ordering, null/empty behavior, defaults and all user-visible feedback.
- Prove achievement multipart PUT support. If impossible, document a minimal transport-only adjustment with no component/layout change.
- Implement persistent file mappings and cleanup/replacement behavior; prepare conversion for profile records/files.
- Verify all profile tabs through the unchanged React UI on staging.

Deliverables: profile parity report, upload manifest, approved transport exception if required.

**Exit tests:** CRUD per module; cross-user denial; rounding and completion parity; size/type boundaries; file replace/clear/delete; interrupted upload; storage failure; reload persisted state; mobile/desktop screenshots.

## 7. Phase 4: administration foundations

**Entry:** roles work; required profile data is available for integrated tests.

Tasks:

- Implement admin user listing/detail/update/verification/deactivation behavior.
- Implement admin organization listing/detail/create/update/delete and linked-opportunity deletion restriction.
- Implement category CRUD, uniqueness and existing dependency behavior.
- Preserve filters, counts, pagination, sorting, role restrictions and field names.
- Extend importer and integration fixtures for organizations/categories.

Deliverables: administration API/UI parity report and import reconciliation.

**Exit tests:** all admin operations and failure cases; non-admin access denial; linked record conflicts; filters and counts identical on controlled data; existing admin pages unchanged.

## 8. Phase 5: opportunities and full route coverage

**Entry:** organizations/categories/users and file storage implemented.

Tasks:

- Implement opportunity browsing/detail with equivalent search, location/type/delivery filters, pagination and sorting.
- Implement draft create/edit, publish/archive/delete, compensation/date serialization and attachments.
- Preserve preview behavior, organization associations, unlimited-opening semantics and existing visibility rules.
- Implement admin dashboard statistics from equivalent queries.
- Preserve generic dashboard, application, organization and user-list placeholder responses as applicable; do not add absent features.
- Complete field-level importer coverage and contract coverage for all routes.

Deliverables: complete backend candidate, full API parity matrix, unchanged React end-to-end demonstrations.

**Exit tests:** draft/publish transitions and errors, deleted organization conflicts, all filter combinations, search edge cases, attachment count under concurrent requests, all route permissions, dashboard counts, placeholder parity. No unexplained contract differences.

## 9. Phase 6: migration rehearsal and release qualification

**Entry:** complete staged functionality and repeatable deployment.

Tasks:

- Run full import from a consistent representative snapshot into an empty target. Repeat it to demonstrate deterministic output.
- Reconcile every table, UUID relationship, timestamp/decimal/array and referenced file checksum. Classify pre-existing defects separately.
- Run complete UI, API, authentication and ownership regression suites. Review screenshots with fixed fixtures.
- Exercise service-worker upgrade/rollback, old browser tabs, offline behavior, cache/account switching and API cache exclusions if an approved correction is required.
- Load test representative searches and uploads within actual hosting limits; compare against Phase 0 thresholds.
- Rehearse production-style artifact promotion, backup restore, schema-compatible code rollback and initial migration rollback both before/after writes.
- Measure final export/import/file synchronization and smoke duration; agree the maintenance window from evidence.
- Produce operator runbook, named responsibilities, contact/escalation path and release evidence bundle.

**Exit:** zero unexplained data/file differences; zero unapproved UI/functionality differences; no unresolved release-blocking defects; performance thresholds met; restore and rollback demonstrated; operational exceptions recorded. A static health response alone is insufficient.

## 10. Phase 7: cutover and observation

**Entry:** Phase 6 accepted and production release scheduled. Future execution requires the applicable production release authorization; this plan does not execute it.

Sequence:

1. Confirm release checksum, backups, operator availability and old-system recovery access. If DNS changes are needed, prepare TTL and TLS in advance without altering unrelated mail records.
2. Enable maintenance/write freeze on the old application; drain in-flight writes and stop any source mutation jobs. Avoid two writable systems during DNS propagation.
3. Take final consistent database snapshot and synchronize files; import into fresh production MariaDB and reconcile.
4. Activate validated artifact with production-only configuration. Check HTTPS, database readiness, login and critical reads while writes remain closed.
5. If gates pass, switch traffic as required and open writes on the new system. Record the exact moment the rollback strategy changes because new data can exist.
6. Monitor errors, login/refresh, database load, storage, uploads, slow queries and user reports. Suggested observation is 48-72 hours, adjusted to traffic and business needs.
7. Keep the old system frozen and recoverable through the agreed retention window. Remove it only after acceptance and backup retention requirements are satisfied.

Failure handling: before new writes, revert to the old frozen deployment and reopen it only after verifying consistency. After new writes, freeze and use the rehearsed reconciliation/forward-fix procedure; never discard new records by a blind DNS reversal.

**Exit:** stable observation period, accepted user workflows, backup schedule operating, release evidence archived and ownership handed over.

## 11. Standard phase completion record

Every phase report must include:

- Scope delivered and excluded items.
- Commit/release ID and exact artifact checksum where applicable.
- Contracts/UI routes covered, tests executed and results.
- Data/file reconciliation results where applicable.
- Deployment and recovery evidence.
- Known defects, approved deviations and open dependencies.
- Status: not started / in progress / blocked / ready for review / complete.
- Next phase entry conditions and revised remaining estimate.

Complete means exit evidence exists. Partial endpoint implementation or a successful build is not phase completion.

## 12. Release checklist

- [ ] Every current route and UI workflow mapped and verified.
- [ ] UI screenshots and interactions show no unapproved change.
- [ ] Hosting versions/extensions/layout verified on actual account.
- [ ] Authentication, ownership and registration-role decisions verified.
- [ ] Schema/data/file import reconciled, including legacy application records.
- [ ] File privacy/session/cache exceptions resolved explicitly.
- [ ] Staging and production promote the same immutable artifact.
- [ ] Secrets/uploads/backups excluded from public root and artifacts.
- [ ] Deployment lock, preflight, failure recovery and asset retention tested.
- [ ] Database/file restore demonstrated and post-write rollback strategy agreed.
- [ ] Maintenance window, monitoring and operator ownership documented.
- [ ] Old deployment retained until the agreed acceptance/retention point.

## 13. Immediate next step

When implementation is requested, begin Phase 0 only: verify hosting capabilities and freeze the existing API/UI behavior baseline. Do not start the complete backend rewrite before those findings determine runtime, storage and deployment constraints.
