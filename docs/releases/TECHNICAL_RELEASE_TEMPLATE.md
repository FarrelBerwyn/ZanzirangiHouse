# Technical Release Record — vX.Y.Z

> Internal (TKS engineering). Copy to `docs/releases/vX.Y.Z/TECHNICAL_RELEASE.md`.
> **Do not record secrets, passwords, database hosts/users or IP addresses — the repository is public.**

| Field | Value |
|---|---|
| Version | vX.Y.Z |
| Release type | MAJOR / MINOR / PATCH / HOTFIX |
| Repository | `FarrelBerwyn/ZanzirangiHouse` |
| Branch | `main` |
| Tag | `vX.Y.Z` |
| Commit | `<full commit hash of the tag>` |
| Previous version | vA.B.C (commit `<hash>`) |
| Release manager | <name, TKS> |
| Release date | YYYY-MM-DD |

## Included changes

| Task | PR | Type | Summary | Author | Reviewer | Client approval |
|---|---|---|---|---|---|---|
| ZAN-### | #N | feat/fix/… | | | | n/a / approved YYYY-MM-DD |

Full list: `git log vA.B.C..vX.Y.Z --oneline`

## Database

| Item | Value |
|---|---|
| Migration required | Yes / No |
| Migration files | `server/database/migrations/NNN_….sql` |
| Applied by / when | |
| Backward compatible with previous release | Yes / No (explain) |
| Pre-deployment backup reference | <hPanel backup date or export file name — stored outside the repo> |

## Configuration

| Item | Value |
|---|---|
| New / changed environment variables (names only) | None / `NAME` — purpose |
| Hosting settings changed | None / description (no secrets) |

## Verification

| Check | Result |
|---|---|
| CI (build + release check) on release PR | Passed / Failed — link |
| `npm run release:check -- --release` | Passed |
| QA on staging / local production build | Passed — notes |
| Production `GET /api/health` → version | `X.Y.Z` |
| Production smoke test | Passed / issues |

## Deployment

| Item | Value |
|---|---|
| Environment | Production — https://zanzirangihouse.com |
| Method | Hostinger zip (`npm run package:hostinger`) built from tag |
| Deployed by | <name, TKS> |
| Date / time (UTC+3 EAT) | |
| Result | Successful / Rolled back |
| Deployment log row | `docs/releases/DEPLOYMENT_LOG.md` |

## Rollback

| Item | Value |
|---|---|
| Rollback target | vA.B.C |
| Database rollback needed if rolled back | Yes / No — steps |
| Procedure | `docs/ROLLBACK.md` |

## Client communication

| Item | Value |
|---|---|
| Client release notes | `docs/releases/vX.Y.Z/CLIENT_RELEASE_NOTES.md` |
| Sent to / via / date | |
