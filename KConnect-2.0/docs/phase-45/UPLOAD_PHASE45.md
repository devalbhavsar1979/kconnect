# Combined Phases 4 and 5: manual FTP upgrade

Base: the working `phase3-20261020-001` release you confirmed. Target: `phase45-20261020-001`. Upload this combined release once; do not deploy Phase 4 separately. No SSH, Composer, Node build, Artisan, schema mutation or synthetic reseeding is required on hosting.

## 1. Back up and verify the base

Use cPanel File Manager to open `/home/nljgfkqgux/kconnect-staging-private/current.json`. Its release must be `phase3-20261020-001`. If it differs, stop: this delta is verified only against that release. Download the pointer, export the current database from phpMyAdmin, and preserve shared/storage. Keep the working `.env`, keys, users and profile uploads.

## 2. Run the SQL verification

Select the existing application database in phpMyAdmin and import `sql/01_phase45_schema_check.sql`. It only reads schema metadata. Expect the Phase 2 migration marker, six listed InnoDB tables, opportunity decimal/date/time/JSON columns, relational constraints and unique indexes. No new tables, ALTER statements or seed data are required. Never rerun the Phase 2 schema/seed scripts against the working database.

## 3. Copy Phase 3 on the server

In cPanel File Manager, COPY (do not move) the existing release under:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/
```

The new copy must have this exact structure:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/phase45-20261020-001/backend/vendor/autoload.php
```

Check there is no nested `phase3-20261020-001` folder inside it. Server-side copying keeps unchanged vendor and frontend files in place without uploading them again. Do not copy or overwrite shared/.env or shared/storage.

In the NEW copy only, remove generated `.php` files from `backend/bootstrap/cache` (config.php, packages.php, services.php, routes*.php, etc.). Preserve the directory and .gitkeep; it must remain writable. Do not remove caches in the active Phase 3 release.

## 4. Upload the changed files

Extract `phase45-20261020-001-FTP-CHANGES.zip` locally. Upload the contents of:

```text
upload-private/kconnect-staging-private/releases/phase45-20261020-001/
```

to the matching new private release directory on hosting. Create added directories and overwrite the listed changed files. Do not use mirror/delete mode. Confirm zero failed transfers. `CHANGES.json` lists each added/modified file and its before/after SHA-256.

No public-root files, React assets, vendor dependencies or .env need uploading. SQL, guides and CHANGES.json are local/operator materials; do not upload them into the public document root. Keep shared/storage writable. Opportunity documents go into `shared/storage/app/uploads/opportunities`; subdirectories are created automatically. Upload limit: 10 MiB per attachment, five attachments per opportunity. Keep upload_max_filesize at least 10M and post_max_size greater than 10M (such as 16M).

## 5. Activate last

Upload `activate-last/current.json` to `/home/nljgfkqgux/kconnect-staging-private/` as `current.pending.json`. Rename the existing current.json to a backup filename, then rename current.pending.json to current.json. A brief 503 between renames is possible. Do not edit public index.php.

Use a fresh online browser and sign in again. Existing Phase 2/3 accounts continue working. Admin management requires your existing **SUPER_ADMIN** account; ADMIN deliberately does not have those permissions. No credential or automatic administrator creation is included in this package.

## 6. Test both phases

1. Sign in as SUPER_ADMIN. Open dashboard, users, categories and organisations. Check counts, search, filters and pagination. Verify/deactivate/reactivate a synthetic account; deactivated users cannot authenticate.
2. Create/edit a category, then delete it. Deletion deactivates it and preserves its row; the list still includes inactive categories. Duplicate names return a conflict.
3. Create/edit an organisation. Create a draft opportunity linked to it. Organisation deletion must fail while linked; its opportunity count should update.
4. Create a complete draft opportunity, save/reload/edit it and inspect the existing preview. Check dates/times, fees, delivery modes and arrays. Upload and remove an allowed PDF/DOC/DOCX/PPT/PPTX; a sixth attachment or over-10-MiB file must fail without losing prior documents.
5. Publish the draft, then confirm it appears in the regular user's opportunities listing. Test search, delivery/location/type/date/category/duration filters and pagination. Draft, archived and shortlisted-only opportunities must be absent from regular-user browsing/detail.
6. Archive an opportunity and check it disappears from the regular listing. Only drafts can be deleted. DRAFT/CLOSED can publish; OPEN/ARCHIVED/CANCELLED cannot publish directly. The existing editor may explicitly save a record back to DRAFT, matching legacy behavior.
7. Check desktop/mobile layout, profile tabs and uploads, login/refresh/logout from the working Phase 3 release.
8. General application/organisation actions and several admin navigation pages retain their existing placeholder behavior. Application submission does not create a record; do not interpret the placeholder success as a real application workflow.

The legacy UI displays stored opening count 0 as Unlimited; create/update validation still requires at least 1, matching the original API. Imported existing zero values are preserved. The legacy service worker API cache remains a Phase 6 qualification item: use fresh online sessions for acceptance.

## 7. Rollback

Restore your saved Phase 3 current.json using the temporary-upload/rename sequence. Do not restore an older database or delete uploaded files merely to roll back code: both releases use the same schema, and new admin/opportunity records remain available for a forward fix. Phase 3 will not expose the new admin/opportunity endpoints.

For 500 errors inspect private shared/storage/logs/laravel.log, check the new copy's bootstrap/cache and shared/storage permissions, and check all delta files transferred. Keep APP_DEBUG=false. Leave the prior release and backup pointer available until hosting acceptance is complete.
