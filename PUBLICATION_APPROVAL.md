# Publication approval gates — HYDGRAM synthetic CI only

Status: MIT LICENSE APPROVED FOR SYNTHETIC CI ONLY / PUBLICATION NOT APPROVED / NO ACTIONS EXECUTION.

## Licensing decision (owner-approved 2026-11-23)

- Owner explicitly approved the **MIT License for this separate synthetic CI package only** in chat on 2026-11-23. The reviewed root `LICENSE` now contains the MIT text with the project-contributor copyright notice. The owner must confirm authority to license all included original contributions before actual publication; this verification is not inferred from the chat approval.
- This license **does not cover** private HYDGRAM application source, history, private documentation, customer data or credentials. No private source is bundled in this synthetic package.
- Licensing approval is **not authorization** to publish, create a public GitHub repository, reverse the private repository's Actions prohibition, or trigger any workflow.
- Dependencies: package.json has **zero npm dependencies**. External checkout/setup-node Actions and MariaDB container remain governed by their upstream licenses, not this MIT grant; actual image/runtime validation remains pending.

## Hard authorization gates (each independent)

1. OWNER_COPYRIGHT: MIT was explicitly selected for synthetic CI files on 2026-11-23; verify ownership/permission for all contributed content and confirm the copyright notice before public distribution. No rights to private HYDGRAM source are granted.
2. EXACT_BYTES: Record SHA-256 of the final ZIP, inspect all file names and content, validate synthetic-only provenance, run `npm run check:publication` and `npm test`; approve **that** hash. Any byte change requires renewed review.
3. POLICY_REVERSAL: Owner separately reverses, in writing, the binding `project_docs/GITHUB_NO_ACTIONS_POLICY.md` prohibition for **a separately named public synthetic CI repository only**, explicitly preserving private HYDGRAM no-Actions prohibition unless independently changed. Do not edit existing private policy without authorization.
4. CREATE_REPOSITORY: Owner independently approves creating an empty *new* public repository with no Git history or private source. Do not repurpose, temporarily publish, mirror or copy the private HYDGRAM repository.
5. ENABLE_AND_DISPATCH: Owner separately approves enabling and manually running the reviewed workflow after reviewing immutable action pins, OCI digest, token permissions, untrusted-input handling, runner account and timeout/quotas. Publication approval is not permission to execute workflows.
6. RUNTIME_ACCEPTANCE: Actually observe `npm test`, publication guard, MariaDB 11 synthetic database and sandboxed Chromium DOM checks on the authorized nonroot runner. Do not claim these passed from static validation or from local failures.
7. RELEASE_SEPARATION: Public synthetic CI results cannot certify the actual private Next.js build, authenticated buyer-owner database, mobile devices, PWA or HYDGRAM release approval. Never publish test reports containing private customer or production data.

## Explicit no-go triggers

- Missing any of gates 1-5; ZIP hash changed after review; secrets or private files found; unexpected GitHub workflow trigger or write permissions; unreviewed upstream image/action; missing disposable-only DB guard; public CI given a token capable of reading private HYDGRAM.
- Failed real-browser or MariaDB acceptance means *runtime readiness remains unverified*, not that private source can be copied to overcome it.

## Owner approval statement (not executed)

When ready, the owner should explicitly identify the separate public repository name, the reviewed package ZIP SHA-256, the already selected MIT license, confirm rights to license, and the exact actions separately approved: public repository creation, push of the synthetic-only package and manual workflow dispatch. Until then, DO NOT CREATE, PUBLISH, ENABLE or RUN.

## Sources consulted

- GitHub Docs: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- GitHub Terms of Service: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- GitHub Actions limits: https://docs.github.com/en/actions/reference/limits
- Private HYDGRAM: `project_docs/GITHUB_NO_ACTIONS_POLICY.md` and `AGENTS.md` (read-only inspected; not copied into this public package)
