# HYDGRAM Public Synthetic CI

This **public repository contains synthetic infrastructure checks only**. The actual [HYDGRAM private application](https://github.com/sudheeerrr/hydgram-com) remains private; no proprietary source code, private history, customer data or credentials are included.

## Status (2026-11-23)

The owner authorized this separate public synthetic CI repository and publication of the reviewed package. **The workflow is manually triggered; it has not been executed or accepted yet.** Do not describe these synthetic checks as HYDGRAM V1 release acceptance.

## Run locally

Use Node.js 22 or newer:

```bash
npm run check:publication
npm test
npm run check:browser
```

The browser check needs sandboxed Chrome and an appropriate **nonroot** runner. Database smoke requires a disposable MariaDB 11 server on **127.0.0.1:33306**, with the synthetic-only credentials configured in `.github/workflows/public-synthetic-ci.yml`. Never point this test at a real HYDGRAM database.

## Run on GitHub Actions

Open **Actions → Synthetic Public CI (manual approval required) → Run workflow** and select `main`. The workflow uses Node 22, a pinned MariaDB image, synthetic fixtures and headless Chrome. It is a **manual-only** workflow; no deploy actions or private GitHub tokens are required.

Review **PUBLICATION_APPROVAL.md** for scope and security boundaries. Results are *UNVERIFIED* until the workflow actually runs and logs are inspected. The workflow does not build or test the private HYDGRAM application, Android or iOS.

## Security and license

- No private HYDGRAM source or real customer records.
- `contents: read` permissions, immutable GitHub Action SHAs, pinned OCI digest and loopback-only database exposure.
- The publication guard rejects unknown files, suspicious material, binary additions and symlinks.
- MIT license covers only this separately authored synthetic package.

**No production/staging access, deployment or app release authorization is implied.**
