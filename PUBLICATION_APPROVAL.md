# Publication authorization and remaining verification gates

**Status (2026-11-23): SEPARATE PUBLIC SYNTHETIC CI PUBLISHED. WORKFLOW NOT EXECUTED.**

The owner selected the MIT license for this synthetic package and explicitly requested public GitHub Actions deployment, then created the separate `sudheeerrr/hydgram-public-synthetic-ci` repository. This authorizes public publication and manual synthetic CI execution **only for this separate repository**. No private HYDGRAM repository visibility or Actions policy changes are authorized.

## Published scope

- Standalone synthetic browser and MariaDB infrastructure checks, dependency-free Node test fixtures, one manually triggered GitHub Actions workflow, MIT license, allowlist and support documents.
- No copied private HYDGRAM application files, private Git history, database backups, secrets, real authentication sessions, customer information or release artifacts.
- No production or staging access, deployment, privileged token scopes, paid-runner authorization, or application release authorization.

## Security requirements

- Always run `npm run check:publication` and `npm test` after edits.
- Actions remain `workflow_dispatch` only with `contents: read`; official actions pinned to full commit SHAs.
- MariaDB OCI digest pinned, database bound to loopback; all data synthetic; do not weaken Chrome sandbox.
- Review actual GitHub run logs and the image digest pull before calling the workflow successful.
- Confirm ownership and rights for future contributions. Do not copy files from the private HYDGRAM application without independent security review and approval.

## What is still unverified

- GitHub-hosted Actions dispatch and result.
- MariaDB 11 service image pull, actual SQL tests and rollback.
- Chromium headless rendered-page smoke on a nonroot hosted runner.
- All actual private HYDGRAM V1 release gates, including production Next.js build on the accepted code revision, buyer/owner auth, private MariaDB transactions, PWA and Android/iOS device acceptance.

**Private HYDGRAM remains private and retains its project-specific no-GitHub-Actions policy.** Public synthetic infrastructure checks do not replace full private application acceptance.
