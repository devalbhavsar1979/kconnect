# Add isolated Laravel foundation and staging release tooling

K-CONNECT's existing Python/PostgreSQL runtime does not directly fit the target shared-host deployment. This introduces a Laravel foundation and release pipeline under KConnect-2.0 while keeping the original application untouched.

The copied React frontend builds with three type-only corrections whose emitted JavaScript is unchanged. The backend supplies health/readiness, JSON API errors and SPA routing; business endpoints remain for later phases. Packages include production dependencies and immutable manifests. Staging release tooling verifies archives, isolates secrets/storage, retains old assets and restores the prior release after failed probes.

Validation: 10 PHP tests (33 assertions), packaging tests, frontend type/build checks and emitted-JavaScript parity, plus real production archive extraction/configuration/kernel smoke rehearsal. PHP 8.5/Linux CI and live Spaceship deployment remain unexecuted. SSH batch authentication and initial private staging provisioning remain blockers. Workflow is staged under the new folder and must be activated at repository root separately.

Known limitations: existing frontend advisories and Phase 0 UI/database parity still require follow-up; no business API functionality is implemented in Phase 1. No PR has yet been published.
