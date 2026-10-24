# Phase 2.2 - Opportunity details

Started 23 October 2026. Not deployed. FTP package prepared: artifacts/phase22-20261023-001-FTP-CHANGES.zip. Required base: phase21-20261022-001. See UPLOAD_PHASE22.md.

- Full page /opportunities/:id replaces the listing popup. Desktop content ratio 80/20; smaller screens stack the right panel.
- Header: title, opportunity type, database created date and UUID.
- Overview: descriptions, category/subcategory, mode, schedule, venue/address, travel and INR fee.
- Requirement: skills, minimum experience, expertise, language and additional requirements.
- Compensation: compensation type, fee, fee structure, payment terms, travel reimbursement and benefits.
- Other Details: session structure, total/per-session duration, openings, audience and tags.
- Green Apply Now creates an APPLIED applications row for the authenticated user; repeated requests are idempotent. Closed/private opportunities and expired application deadlines cannot be applied to.
- Yellow Save for Later stores a linked SAVED_FOR_LATER row in saved_opportunities. Applying removes the saved row; saving never downgrades an application. Listing includes a Saved for Later tab.
- Right panel: public organization fields, eligibility preferences, authenticated attachment downloads and WhatsApp/email/copy-link actions.
- Organization schema has no logo field; a building icon is used as the fallback.

## Deployment tracking

Changed: backend/app/Http/Controllers/OpportunityController.php, backend/routes/domain.php, frontend/src/features/opportunities/OpportunitiesPage.tsx, frontend/src/types/opportunity.ts, frontend/src/routes/index.tsx.
Added: frontend/src/features/opportunities/OpportunityDetailsPage.tsx, backend/database/migrations/2026_10_23_000001_create_saved_opportunities.php.
Test changes: backend/tests/DomainTest.php.

Apply the additive migration before activating the code. For FTP/phpMyAdmin use deployment/phase-2.2/01_saved_opportunities.sql on the existing application database, after a backup. Do not reseed. Include rebuilt frontend SPA/public assets and clear generated route/config caches in the new release. Preserve the saved table on code rollback. Confirm active hosted release before preparing an FTP delta; Phase 2.1 deployment has not been confirmed in this conversation.

Frontend production build passed. Existing six DomainTest cases passed; new save/apply regression passed separately with 21 assertions after correcting its draft fixture. PHP controller syntax check passed. Browser visual and hosted acceptance pending.

Package validation: fresh production build passed; predecessor manifests verified; ZIP CRC and all packaged bytes verified. 28 entries, 638251 bytes. SHA-256: 0c5cfca8748237be9bd032ad1b4f679e3fd87ad97619228f2b8704c2505bc56c. Not deployed.
