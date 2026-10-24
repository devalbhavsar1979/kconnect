# Phase 2.1 FTP upload

This package upgrades phase45-20261020-001 to phase21-20261022-001. Check kconnect-staging-private/current.json first: its release MUST be phase45-20261020-001. If different, do not apply this package; provide the active release ID so the package can be rebased.

1. Download and save current.json as your rollback copy. Back up the existing public sw.js, registerSW.js and manifest.webmanifest.
2. In cPanel File Manager COPY /home/nljgfkqgux/kconnect-staging-private/releases/phase45-20261020-001 to /home/nljgfkqgux/kconnect-staging-private/releases/phase21-20261022-001. Ensure backend is directly inside the new release, with no extra nested release folder.
3. In the NEW release only, remove generated PHP cache files from backend/bootstrap/cache, preserving the directory and .gitkeep.
4. Extract this ZIP locally. Upload the contents of upload-private/kconnect-staging-private/releases/phase21-20261022-001/ into the matching new server release folder. Overwrite included files.
5. Upload the CONTENTS of upload-public/app.kconnect.in/ to /home/nljgfkqgux/app.kconnect.in/. Retain existing hashed assets. Do not replace public index.php or .htaccess. Confirm all transfers succeeded.
6. Activate last: upload activate-last/current.json to /home/nljgfkqgux/kconnect-staging-private/current.pending.json. Rename the existing current.json to a backup name, then rename current.pending.json to current.json. A brief 503 during renaming is possible.
7. Reload the site in a fresh browser session. Check /opportunities, three-column desktop cards, mobile stacking, date, duration, fee, tags, filters and View Details. Existing tabs may require closing and reopening for the service worker update.

No SQL, Composer, Node, reseeding or .env upload is required. Do not upload guides, CHANGES.json or activate-last into the public root.

Rollback: restore the saved current.json and backed-up public service-worker/manifest files. Retain the new hashed assets; no database rollback is required.

Local frontend build passed; backend DomainTest passed (6 tests, 174 assertions). Hosted/visual acceptance is pending. This package has not been deployed.
