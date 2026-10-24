# Source parity specification and capture protocol

## Baseline status

`generated/BASELINE.md` lists every discovered API/UI route. JSON inventories contain detailed parameter, schema, auth and source evidence. None is marked runtime verified. [Source contract examples](../fixtures/source-contract-examples.json) contain deterministic **source-derived** responses; [synthetic scenarios](../fixtures/synthetic-scenarios.json) define invented inputs and expected relationships, not production data or a complete seed script.

Freeze observed runtime evidence only after replay against an isolated old-stack environment. No mutation scenarios run against an unidentified production URL.

## Permission baseline

| Surface | Source behavior | Verification cases |
|---|---|---|
| Login/register/refresh/logout | No access-token dependency; refresh/logout validate supplied refresh token in service | Missing/malformed/expired/wrong-type tokens, disabled user, logout repeat |
| Profile and subordinate records | Active current user; child operations filter by owner | Own record; other user's UUID; nonexistent ID; anonymous |
| Opportunity list/detail | Active current user; only OPEN + VISIBLE_TO_ALL | Closed/private item should not appear; detail missing/hidden returns 404 |
| Admin APIs | SUPER_ADMIN | Ordinary ADMIN must not inherit this access; all other roles denied |
| `/users/` legacy placeholder | ADMIN specifically | SUPER_ADMIN is not automatically equivalent; empty-list behavior preserved |
| `/organizations/` POST placeholder | VENDOR or ADMIN | Other roles denied; no real organization created |
| Admin UI | SUPER_ADMIN guard | Logged out -> login; other user types -> root redirect |
| General protected UI | Authentication flag | Reload/store state, logout, redirects |
| Public UI | Unauthenticated only | Authenticated login/register visit redirects dashboard |

Do not assume missing bearer credentials return the same status as invalid JWT: framework HTTPBearer behavior and custom dependency errors need separate runtime captures. Dynamic service/dependency errors are not fully enumerated by handler-local AST extraction.

## High-risk compatibility scenarios

| ID | Area | Required expected behavior / evidence |
|---|---|---|
| P01 | Registration | Multipart form, confirm_password, optional CV; exact status/detail; not JSON-only registration |
| P02 | Actual validators | `RegisterRequest` exists but register handler uses Form arguments; do not assume unused model validators run |
| P03 | JWT refresh | Returns access token only; existing refresh token retained by frontend |
| P04 | Profile updates | Absent fields unchanged; explicit null behavior matches existing field schema |
| P05 | Profile completion | Same 15 named fields, Python truthiness/rounding, same missing_fields order |
| P06 | Profile photo | JPEG/PNG, 2 MiB boundary, stable URL/name, replacement and cache behavior |
| P07 | Child records | Other owner/nonexistent records, ordering, ties, null years/months |
| P08 | Profile upserts | Expertise/preferences/service delivery use PostgreSQL ON CONFLICT; MariaDB equivalent must retain one record/user |
| P09 | Achievements | Multipart PUT; file replace/clear; 10 MiB; absent versus empty description |
| P10 | Admin users | Excludes SUPER_ADMIN from list/detail; filters active/verified; exact counts |
| P11 | Organizations | Deletion blocked with linked opportunities, including existing conflict message |
| P12 | Draft opportunities | Minimal draft, defaults, existing preview and dirty-state behavior |
| P13 | Publish | Current handler permits DRAFT/CLOSED, requires organization; do not invent extra publish requirements |
| P14 | Archive | Preserve actual transition rules; record unexpected transitions as defects before changing |
| P15 | Search | Comma-joined tags/skills substring search, case/wildcards, null/empty fields |
| P16 | Filters | Delivery array membership, state OR location, type/category/duration combinations |
| P17 | Dates | `this_month` means next 30 days, not calendar month; closing_soon has no lower bound in current query |
| P18 | Sort | Fee/deadline NULLS LAST, newest default; tied order may be nondeterministic, capture before defining stable secondary order |
| P19 | Opportunity tabs | Applied tab uses applications despite placeholder submission; retain historical application data |
| P20 | Attachments | Five per opportunity, 10 MiB per file; deletion/retrieval and two-root mismatch |
| P21 | Admin statistics | Exclude SUPER_ADMIN from user counts; pending verification means active and not verified |
| P22 | Expert dashboard | Static numbers/sample activity with personalized greeting, not live admin statistics |
| P23 | Placeholders | Admin applications/sessions/content/communications/analytics/settings/support remain placeholders; same for expert placeholders |
| P24 | Decimal and dates | Browsing fee is float JSON; other schemas may differ; compare per endpoint |
| P25 | PWA | Existing cache/offline/install behavior and account switching; explicit security decisions below |
| P26 | Errors | Preserve detail shape, 204 bodylessness, validation locations/order where consumed, 404/409 distinctions |
| P27 | Deep links | Every route loads directly; API/asset errors do not return SPA HTML |

## Existing defects / decisions (no fixes applied)

| ID | Finding | Decision required |
|---|---|---|
| E01 | Public registration accepts role enum containing privileged values | Confirm allowed public roles; privilege escalation must be resolved before release, explicitly recorded as security exception |
| E02 | Opportunity writer and static upload mount resolve to different roots | Confirm production mapping; preserve existing valid links while correcting mapped storage in new implementation |
| E03 | CVs/documents are statically exposed | Confirm intended access; do not silently break existing download workflows |
| E04 | Network-first cache covers authenticated API GETs | Verify account switching/offline leakage; agree narrowly scoped correction |
| E05 | Admin user update accepts UserType enum | Verify policy for promoting another account to SUPER_ADMIN; do not infer intended restrictions |
| E06 | Registration ignores `RegisterRequest` model validation | Capture actual empty-name/email behavior; validation tightening would be a behavior change requiring a decision |
| E07 | `closing_soon` can include already-expired deadlines | Preserve current result or agree a separately documented correction |
| E08 | Post-cutover session continuity | Select retained JWT/session compatibility or approved one-time normal login |

## Runtime capture protocol

1. Designate an isolated old-stack instance and synthetic users. Freeze fixture clock to 2026-10-19T06:00:00Z where possible; record browser Asia/Calcutta timezone and server date separately.
2. Capture runtime OpenAPI plus all 59 application operation contracts. Compare methods/paths/parameter constraints with generated inventory; label framework-generated docs endpoints separately.
3. Capture successful and error cases, roles, ownership, invalid/missing/null values, Unicode and boundaries. Never save tokens/passwords or personal records in shareable fixtures.
4. Use synthetic identifiers consistently. Redact token bytes but verify claims/expiry independently. Preserve numeric types, array order and error semantics.
5. Capture UI at 1440x900 and 390x844, same browser/fonts/clock, animations settled, with normal/loading/empty/error states and visible overlays.
6. Exercise registration, login/refresh/logout, all profile tabs, list/search/detail, admin forms and transitions, file operations and every placeholder route.
7. Store raw sensitive evidence only in ignored `.local-evidence/`; commit sanitized synthetic fixtures and reviewed screenshots only. Record environment/version and observations alongside each capture.
8. Compare new implementation to this baseline in later phases. Runtime unknowns remain pending; fabricated HTTP captures or screenshots are not substitutes.

No screenshots have been captured yet. No automatic endpoint replay has been performed.
