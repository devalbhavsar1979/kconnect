# Phase 3 — upload only changed/added files, without SSH

This update is based on the working `phase2-20261019-001` FTP package. It adds profiles/uploads without changing React, vendor dependencies, `.env`, public index.php or .htaccess. The ZIP contains only changed/added release files, a separate activation pointer, SQL verification and this guide. Never upload the whole ZIP or SQL into the public document root.

## 1. Back up and check the current release

In cPanel File Manager open `/home/nljgfkqgux/kconnect-staging-private/current.json`. Its `release` must be `phase2-20261019-001`. If it names something else, stop: this delta has not been verified for another baseline. Download a backup of this JSON, export your existing staging DB from phpMyAdmin, and preserve shared/storage. Do not replace your `.env` or recreate users.

## 2. Run the SQL check in phpMyAdmin

Select your existing staging database. Import local `sql/01_phase3_schema_check.sql` or paste it into the SQL tab. It is read-only: expect the Phase 2 baseline migration, seven listed tables, three user_id unique indexes (plus primary keys), and six foreign keys to users. No schema upgrade or new seed data is needed. If a required table is missing, stop and investigate the Phase 2 import; do not rerun the entire schema against existing tables.

## 3. Copy the existing release ON THE SERVER

In cPanel File Manager, navigate to:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/
```

Use **Copy** to duplicate `phase2-20261019-001` as `phase3-20261020-001`. Use Copy, not Move. If the UI copies the old folder name into a destination folder, rename the copied folder and check the final structure carefully. The new path must be:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/phase3-20261020-001/backend/vendor/autoload.php
```

There must NOT be an extra nested `phase2-20261019-001` inside the new release. This server-side copy keeps all unchanged vendor/frontend files on hosting: you do not re-upload them. Keep the old release intact for rollback. Do not copy or replace `shared` and do not activate yet.

In the NEW release only, remove generated `.php` files under `backend/bootstrap/cache` if any exist (such as config.php, packages.php, services.php, routes-v7.php). Preserve the directory and .gitkeep. Cached configurations from the old release can contain old absolute paths and lack the new config file. PHP rebuilds needed package metadata without SSH; ensure this directory remains writable by your hosting account.

## 4. Upload the delta into the NEW copy

Extract `phase3-20261020-001-FTP-CHANGES.zip` locally. Upload the contents of:

```text
upload-private/kconnect-staging-private/releases/phase3-20261020-001/
```

into:

```text
/home/nljgfkqgux/kconnect-staging-private/releases/phase3-20261020-001/
```

Overwrite the listed changed files only; create the new files/directories. CHANGES.json lists the files and before/after hashes. Do not enable FTP mirror/delete options. Ensure the queue has zero failed transfers. No files need uploading to `/home/nljgfkqgux/app.kconnect.in`.

New uploads are created below the existing `shared/storage/app/uploads`. Keep that tree writable by the account running PHP. New photo/achievement subdirectories are created automatically. Existing Phase 2 CVs remain in place. Keep the existing PHP 8.4/8.5 setting; multipart PUT requires the supplied runtime support. For 10 MiB achievement files, PHP upload_max_filesize must be at least 10M and post_max_size greater than 10M (e.g. 16M); use cPanel's PHP options if a hosting limit rejects an upload.

## 5. Activate LAST

Upload `activate-last/current.json` into the private root as `current.pending.json`. Back up/rename the existing `current.json`, then rename `current.pending.json` to `current.json`. Keep the old JSON backup. A brief 503 between renames is expected. Do not modify public index.php; it already reads this pointer.

The new pointer identifies Phase 3 while retaining Phase 2 as previous. Use a fresh online browser session and sign in again so the new private file-access cookie is established. No user/account migration is required.

## 6. Browser acceptance checklist

Visit `https://app.kconnect.in`, sign in as a synthetic SME and open My Profile:

1. Personal information: save name, contact details, DOB (at least 21 years old), address, designation and consent. Reload and confirm persisted values and completion percentage.
2. Photo: upload a PNG/JPEG under 2 MiB. Confirm it appears immediately and after reload; replace it. Invalid/oversized replacements must leave the previous photo intact.
3. Academic: create two entries, edit and delete one; check newest end-year first, undated last.
4. Experience: create current/past records, edit and delete. Check current roles first and skills retained after reload.
5. Expertise and preferences: save, reload, and try invalid empty required selections. Travel distance is required only when willing to travel.
6. Service delivery: save checkboxes and reload. These are full-record saves; omitted options reset to false, matching the original API.
7. Achievements: create with a PDF/PNG/JPG/DOCX (up to 10 MiB), open the attachment, edit using a replacement, remove the attachment, then delete the record. Browser Network should show PUT with multipart/form-data; no method override is required.
8. Second account: sign out and sign in as a different synthetic user. Their profile lists must be independent. A copied first-user attachment URL must return 404. Public access to private uploads must fail.
9. Confirm your Phase 2 login, refresh and logout still work. Sign-out removes the file-access cookie. Admin/other later-phase application screens remain outside this phase.

Photos, CVs and documents keep `/uploads/...` URLs. A signed, HttpOnly, SameSite cookie restricted to `/uploads` lets the unchanged image/link UI access only the active user's files. API calls still require bearer tokens. File responses are no-store/nosniff, and unsafe content is downloaded rather than executed. Profile edits cannot assign privileged roles.

The legacy service worker's API cache remains a known later qualification item; test online with a fresh browser, not a stale offline cache. This update does not claim new UI designs or new admin/opportunity functionality.

## 7. Rollback and troubleshooting

If necessary, restore your saved Phase 2 current.json using the same temporary-upload/rename process. Keep database and shared/storage unchanged; both releases use the same schema. Phase 2 will not provide the new profile endpoints, but the saved profile data remains for a later forward fix.

For HTTP 500, inspect private shared/storage/logs/laravel.log through File Manager, check new files exist, and check old compiled caches were removed from the NEW release. Do not enable public debug or replace APP_KEY/JWT_SECRET_KEY. For upload 413/422, inspect PHP body/file limits. A failed file replacement should preserve the old data/file. If an unresolved maintenance.json exists, investigate the earlier deployment failure instead of deleting it blindly.

Do not edit files inside the active Phase 2 release. The staged copy and pointer switch avoid partially deployed code and stale OPcache paths while keeping your FTP upload limited to the delta.
