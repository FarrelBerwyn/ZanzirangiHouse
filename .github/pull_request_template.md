<!--
PR title must follow Conventional Commits, e.g. "feat(cms): add editable homepage sections".
It becomes the squash commit on staging. See docs/GIT_WORKFLOW.md.
Never paste secrets, database hosts/users or IP addresses: this repository is public.
-->

## Description
<!-- What does this PR change and why? -->

## Business Requirement
- Task: ZAN-###
- Request / reason: <!-- the business need from Zanzirangi House or the TKS engineering reason -->

## Changes
-

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual QA (describe below)
- [ ] `npm run build` passes
- [ ] `npm run release:check` passes

QA notes:

## Security
- [ ] Authentication impact checked
- [ ] Authorization (admin permissions) impact checked
- [ ] Secrets checked: no `.env`, credentials, hosts or IPs in code, docs or this PR
- [ ] Dependencies checked (`npm audit`)

## Deployment
- [ ] Environment variables required (names only):
- [ ] Database migration required (files):
- [ ] Rollback plan checked (`docs/ROLLBACK.md`)

## Client Impact
- [ ] No client-visible change
- [ ] Client-visible improvement (summarise in one plain sentence for the release notes):
- [ ] Client approval required before release

## CHANGELOG
- [ ] Entry added under `## [Unreleased]` in `CHANGELOG.md` (or not needed: docs/ci/chore only)
