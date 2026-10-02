# Production Deployment Log — Zanzirangi House

Single source of truth for **"what is live in production right now?"**. TKS adds one row per production
deployment or rollback (newest at the bottom). The last row with result **Successful** is the live version.

Rules:
- Only versions with a Git tag may be deployed to production.
- Record rollbacks as their own rows (Type `Rollback`).
- No secrets, hosts, usernames or IP addresses (the repository is public).

| # | Date (YYYY-MM-DD HH:MM EAT) | Version | Commit | Type | Environment | Deployed by | DB migration | Backup taken | Result | Technical record |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 2026-10-01 11:09 EAT (08:08 UTC build) | 1.0.0 (pre-release, untagged) | **unknown** — archive built from an uncommitted working tree | Baseline (manual archive upload) | Production | not recorded | unknown (001–003 status not verified) | not recorded | Live, healthy (`/api/health` 200, MySQL connected, smoke 13/13 on 2026-10-01) | — |

**Status as of 2026-10-01:** row 0 is the pre-pipeline baseline, reconstructed from the Hostinger build
history (18 archive builds; latest completed 2026-10-01 08:08 UTC) and a live health/smoke check. It is not
traceable to a Git commit. The first traceable entry will be **v1.0.0**, deployed from its tag. After that,
`GET /api/health` → `release.commit` identifies the exact commit.
