# Phase 2.1 change and deployment tracker

Started: 22 October 2026 (Asia/Calcutta).
Scope: user-requested UI improvements after the migration phases. This is a new product-change batch, distinct from the historical migration Phase 2.
Deployment status: NOT DEPLOYED. Accumulate subsequent Phase 2.1 requests here before preparing the final upload delta.

## 2.1-001 - Opportunities listing

- Removed the Your Profile completion sidebar from /opportunities.
- Changed the listing from two cards per row to one card per row.
- Desktop cards have three columns: 20% listing-type icon and organisation name; 40% type, title, organisation/location, short description and tags; 40% event date, session total duration, fee/honorarium amount (INR), fee structure and View Details.
- At widths below 1024px the card sections stack for readability; existing filters and mobile filter drawer remain available.
- Uses the actual tags field, with three visible tags and a remaining-count tooltip.
- Uses event_date rather than application_deadline. Zero paid amounts display correctly; missing values have explicit fallback text.
- Exposes the existing total_duration column in the listing API. No schema migration or new dependency is required.
- View Details retains the existing detail-modal interaction.

### Source files to include in release preparation

| File | Purpose |
| --- | --- |
| frontend/src/features/opportunities/OpportunitiesPage.tsx | Remove profile sidebar and use a single-column list |
| frontend/src/features/opportunities/components/OpportunityCard.tsx | Responsive three-part card |
| frontend/src/types/opportunity.ts | Listing duration response type |
| backend/app/Http/Controllers/OpportunityController.php | Return total_duration on listing cards |
| backend/tests/DomainTest.php | Listing duration regression assertion (development only) |

### Deployment checklist

1. Identify the currently active hosted release before calculating a delta; do not assume the historical Phase 4/5 package is active.
2. Build frontend and package the generated SPA files into the new private release's backend/resources/spa and corresponding public assets using the existing release packaging process. Include generated index/service worker files, not just the changed source TSX files.
3. Include the updated backend controller in the same release. Preserve previous releases and hashed assets for rollback and existing browser tabs.
4. No SQL, reseeding, environment edits or vendor updates are needed for this item.
5. Verify the listing with real hosted data, desktop/mobile layout, filters, pagination and View Details. Confirm existing service-worker clients receive the new frontend after refresh/update.
6. Record release ID, artifact hashes, deployment date and host acceptance here when deployed. Roll back via the saved previous release pointer if needed.

### Validation

- Frontend production build passed (TypeScript + Vite + PWA generation).
- PHP DomainTest passed: 6 tests, 174 assertions, using the isolated SQLite in-memory test database.
- Visual browser and hosted acceptance remain pending; no live deployment was performed.

FTP package prepared: artifacts/phase21-20261022-001-FTP-CHANGES.zip. Base required: phase45-20261020-001. Not deployed. SHA-256: fd6e798776a8d94b95ddc187deb275da80de2edc217d6ca98b2c49f7abebf203
