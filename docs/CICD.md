# CI/CD Pipeline — Zanzirangi House

| | |
|---|---|
| Owner | TKS (Teknologi Kecerdasan Sinergi) — DevOps / Release Engineering |
| Established | 2026-10-01 |
| Workflows | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml` |
| Related | `docs/DEPLOYMENT.md`, `docs/ENVIRONMENTS.md`, `docs/ROLLBACK.md`, `docs/RELEASE_PROCESS.md`, `docs/GIT_WORKFLOW.md` |

Zanzirangi House never interacts with this pipeline. TKS runs it and sends the client a plain-language
release note (`docs/CLIENT_RELEASE_NOTES_TEMPLATE.md`).

> **Status labels:** IMPLEMENTED = in this repository and tested locally. VERIFIED = observed on GitHub,
> Hostinger or the live site. REQUIRES CONFIGURATION = needs a manual step listed in §6. Nothing marked
> REQUIRES CONFIGURATION is active yet.

---

## 1. Before → After

**Before (audited 2026-10-01, VERIFIED via the Hostinger API and GitHub API):**

```
Developer PC → build/zip the working tree → upload zanzirangi-house-v3.zip in hPanel
→ Hostinger Node.js build (archive) → production (zanzirangihouse.com)
```
- 18 production builds on Hostinger, all from uploaded archives; the latest completed 2026-10-01 08:08 UTC. The zips came from a working tree with uncommitted changes, so the live code cannot be traced to a Git commit.
- GitHub Actions had only "Deploy to GitHub Pages": **12/12 runs failed**. Pages was never enabled, and a static copy cannot run the API.
- No automated tests, no CI type check (13 errors), no security scanning in CI, no staging.

**After (this pipeline):**

```
Developer → feature/* → Pull Request ─► CI (type check · tests · security · build · prod boot)
                                         │ fail → STOP (cannot merge if branch protection is on)
          → staging ─► CI ─► Deploy staging* ─► health + smoke ─► QA ─► client approval
          → release PR → main ─► tag vX.Y.Z ─► CI (strict release gate)
          → Deploy (manual) ─► plan + migration gate ─► CI again on the exact commit
          ─► GitHub "production" approval* ─► deploy/production commit ─► Hostinger build*
          ─► wait for /api/health = new commit ─► smoke test ─► release record + client note
                                                   │ fail → STOP + rollback instructions
```
`*` = REQUIRES CONFIGURATION (§6).

---

## 2. CI — `.github/workflows/ci.yml` (IMPLEMENTED)

Triggers: every pull request into `main`/`staging`, pushes to `main`/`staging`, version tags `v*`,
manual runs, and `workflow_call` (the deploy workflow re-runs CI on the exact commit it deploys).

### Job `quality`
| # | Step | Command | Fails the build when |
|---|---|---|---|
| 1 | Checkout (full history + tags) | `actions/checkout@v4` | — |
| 2 | Node.js 22 + npm cache | `actions/setup-node@v4` | — |
| 3 | Install (lockfile integrity) | `npm ci` | `package-lock.json` is out of sync / missing |
| 4 | Registry signatures | `npm audit signatures` | a package signature or attestation is invalid |
| 5 | Type check | `npm run typecheck` (`tsc --noEmit`) | any TypeScript error (project now at 0) |
| 6 | Unit + integration tests | `npm test` | any test fails (40 tests, see §4) |
| 7 | Secret scan | `npm run security:secrets` | committed secret, `.env`, key, DB dump, backup, zip or `release.json` |
| 8 | Dependency audit (blocking) | `npm run security:audit` | **high/critical** advisory in production dependencies |
| 9 | Dependency audit (report) | `npm audit` | never; warning annotation only |
| 10 | Migration review | `node scripts/check-migrations.mjs` | never; lists destructive / non-portable SQL |
| 11 | Build | `npm run build` | Vite, route pre-render or server bundle fails |
| 12 | Build verification | `npm run verify:build` | missing `dist/index.html`, referenced assets, pre-rendered routes, robots/sitemap, unparsable `server.js`, or secret files in `dist/` |
| 13 | Release metadata | `npm run release:check` | `package.json` / `CHANGELOG.md` / tags disagree |
| 14 | Strict release gate (tags only) | `npm run release:check -- --release` | tag ≠ package version, no release date, missing release records |

### Job `production-boot` (needs `quality`)
Starts a throw-away **MariaDB 10.11** service, applies every migration to an empty database
(`scripts/ci-db-setup.mjs`, refuses non-CI databases), boots the built `server.js` with
`NODE_ENV=production` exactly as Hostinger does (random per-run `JWT_SECRET`), then runs
`scripts/smoke-test-deployment.mjs` against it. This proves the migrations apply on MariaDB, the
production bundle starts, and the health/API/static routes work.
*Verification note: the job's components were tested locally (migration scripts, production boot, smoke
test). The MariaDB container itself was not run locally because the Docker engine was not available on
the audit machine. The first GitHub run is its real test.*

### Lint
There is **no ESLint/Prettier configuration** in the project. `npm run lint` is the type check (`tsc`).
Adding ESLint would surface a large initial backlog across ~150 files and was not done silently.
Recommended next step: add `eslint` + `typescript-eslint` with the recommended config as a separate PR,
then add `npm run lint:eslint` to CI.

---

## 3. Security policy in CI

| Severity / finding | Policy | Implemented by |
|---|---|---|
| Committed secret, private key, `.env`, DB dump, backup, deploy zip | **BLOCK** | `scripts/check-secrets.mjs` |
| CRITICAL / HIGH advisory in **production** dependencies | **BLOCK** | `npm audit --omit=dev --audit-level=high` |
| CRITICAL / HIGH advisory in dev-only dependencies | REPORT + fix within the next release | `npm audit` (warning) |
| MODERATE | REPORT, review in the next sprint | `npm audit` (warning) |
| LOW | REPORT | `npm audit` (warning) |
| Infrastructure identifiers in tracked files (hosting account IDs, DB hosts, IPs) | REPORT (warning) because they are not credentials, but they **must be redacted** while the repo is public | `scripts/check-secrets.mjs` |
| Invalid package signature | **BLOCK** | `npm audit signatures` |
| Lockfile out of sync | **BLOCK** | `npm ci` |
| Destructive SQL migration | **BLOCK deployment** unless explicitly approved per run | `deploy.yml` migration gate |

Results on 2026-10-01: 0 known vulnerabilities, 61 packages with verified attestations, 0 blocking secret
findings, **185 infrastructure-identifier warnings in 26 tracked files** (old Hostinger/MySQL docs, some
scripts, and one admin UI string). See "Remaining risks".

Additional GitHub features recommended (free for public repositories; REQUIRES CONFIGURATION):
Secret scanning + push protection, Dependabot alerts and security updates.

---

## 4. Automated tests (IMPLEMENTED)

`npm test` runs Node's built-in test runner with `tsx` (no new dependencies). Each test file runs in its own
process inside an empty temp directory (`tests/helpers/isolate.ts`), so tests **never** read a developer
`.env`, never connect to MySQL, and never touch `server/data/db.json`.

| File | Covers |
|---|---|
| `tests/unit/auth.test.ts` | permission sanitising, JWT sign/verify/tamper, RBAC middleware (`requirePermission`, `requireAnyPermission`, `requireSuperadmin`) |
| `tests/unit/mediaStorage.test.ts` | upload allow-list, SVG/PHP/HTML rejection, MIME/extension mismatch, magic-byte check, size limit, path-traversal-safe delete |
| `tests/integration/api.test.ts` | real API + JSON dev DB: health, security headers, public content, JSON 404, malformed JSON, 401 on admin routes, forged token, generic login errors (no user enumeration), login, admin listing without password hashes, logout revocation |
| `tests/integration/server.test.ts` | the full Express server: staging `noindex` mode, API routing, no `X-Powered-By` |

Result 2026-10-01: **40/40 passed.** The suite found and fixed one real issue: `/api/*` responses
exposed `X-Powered-By: Express` in production. Fixed in `server/api.ts`; it goes live with the next deploy.
The existing scripts in `scripts/` (`test:suites`, `smoke-test`, `test:support`, …) write to a live
database. They are **not** run in CI.

---

## 5. Deployment — `.github/workflows/deploy.yml` (IMPLEMENTED, REQUIRES CONFIGURATION to run)

**Mechanism: Hostinger Node.js Git deployment from an append-only deploy branch.**

| Environment | GitHub branch Hostinger builds from | Who writes it |
|---|---|---|
| Staging | `deploy/staging` | `deploy.yml` only |
| Production | `deploy/production` | `deploy.yml` only |

Why this mechanism:
- It uses a deployment method Hostinger officially supports (Node.js app from a Git branch; the API shows `source_type: git`). No SSH or FTP is needed, and no Hostinger API token has to be stored in GitHub.
- GitHub controls what reaches the branch: CI on the exact commit, the migration gate, and environment approval.
- Every deployment is **one new commit** on the deploy branch (fast-forward, never force-pushed). Its tree is exactly the verified source commit plus `release.json`. The deploy branch history *is* the deployment history, and rollback is just another deployment (see `docs/ROLLBACK.md`).
- `release.json` (version, tag, commit, CI build, environment, time, actor) is reported by `GET /api/health` → `release`, so TKS can prove exactly what is running.

Flow (manual `workflow_dispatch` for production; automatic for staging after green CI on `staging` once enabled):

| Job | What it does | Stops when |
|---|---|---|
| `plan` | resolves the ref; production: must be a `vX.Y.Z` tag on `main` whose `package.json` version matches; reads the live version from `/api/health`; reviews migrations since the live tag | not enabled / URL not set / wrong ref / tag not on main / pending migrations not confirmed / destructive migrations not approved |
| `verify` | re-runs **all of CI** on the exact commit | any CI failure |
| `deploy` | GitHub Environment gate (`staging` / `production`; approval + history), then pushes the deploy commit | reviewer rejects / push refused |
| `verify-deployment` | polls `/api/health` (≤15 min) until it reports the new commit, then smoke tests: home, assets, 3 routes, robots, sitemap, 3 public APIs, admin API = 401, JSON 404, `/admin` | health or any smoke check fails → job fails with rollback instructions |

Failure handling:

```
Tests / type check / security / build FAILED  → STOP (nothing deployed)
Migration gate FAILED                          → STOP (back up, apply, re-run with confirmation)
Approval rejected                              → STOP
Staging health/smoke FAILED                    → STOP; staging stays broken until fixed, production untouched
Production health/smoke FAILED                 → job fails, summary lists rollback command → TKS decides (docs/ROLLBACK.md)
```
Automatic rollback is deliberately **not** implemented: the database is shared between releases and
must never be reverted automatically.

Smoke tests use **GET requests only**: no logins, no form submissions, no client data. An authenticated
admin smoke test would need a dedicated test account in production; not created (decision for TKS).

---

## 6. Configuration TKS must complete (REQUIRES CONFIGURATION)

None of these were changed during implementation. Values are never written into the repository.

### GitHub (repository `FarrelBerwyn/ZanzirangiHouse`)
1. **Repository visibility:** decide whether to make it **private** (currently public; old docs expose infrastructure identifiers).
2. **Environments** (Settings → Environments). VERIFIED that only `github-pages` exists today.
   - `production`: required reviewers = TKS release manager(s); deployment branches = `main` + tags `v*`; prevent self-review.
   - `staging`: no reviewers (or one); deployment branches = `staging`.
   - Delete the obsolete `github-pages` environment.
3. **Repository variables** (Settings → Secrets and variables → Actions → Variables). Not secrets:
   | Name | Value / purpose |
   |---|---|
   | `PRODUCTION_URL` | `https://zanzirangihouse.com` |
   | `PRODUCTION_DEPLOY_ENABLED` | `true` only after the Hostinger Git switch below is done and verified on staging |
   | `STAGING_URL` | e.g. `https://staging.zanzirangihouse.com` (once created) |
   | `STAGING_ENABLED` | `true` once staging exists |
4. **Branch protection / rulesets.** VERIFIED: `main` is unprotected today.
   - `main`, `staging`: require PR, require status checks `CI / Type check · Tests · Security · Build` and `CI / Production bundle boot + DB migrations (MariaDB)`, block force-push and deletion.
   - `deploy/*`: block force-push and deletion; only GitHub Actions may push. Personal repositories can't restrict pushes by actor; the practical control is that TKS engineers never push `deploy/*` by hand.
5. Settings → Actions → General → Workflow permissions: keep "Read repository contents" as default (the deploy job requests `contents: write` itself).
6. Enable secret scanning + push protection and Dependabot alerts.

### Hostinger (hPanel)
VERIFIED: **no Git provider is connected** to the hosting account; production is built from uploaded archives.
1. Connect GitHub once (Websites → Manage → Advanced → Git, or the Node.js app's "Import Git Repository"), granting access to `FarrelBerwyn/ZanzirangiHouse` only.
2. **Staging first** (`docs/ENVIRONMENTS.md` §3): create the staging site and point its Node.js app at branch `deploy/staging` with auto-deploy on. Settings: Node 22, framework *Express*, root `.`, build script `build`, entry file `server.js`.
3. Run one staging deployment and verify:
   - Hostinger's install step includes devDependencies (`vite`, `tailwindcss`, `typescript` are needed by `npm run build`).
   - Uploads land in the shared `zanzirangi-media` folder.
   - `/api/health` shows the `release` stamp.
4. Only then switch the production app (`zanzirangihouse.com`) to Git source, branch `deploy/production`, auto-deploy on, same settings. Take a database + media backup first.
5. The application's environment variables stay in hPanel exactly as today. The pipeline never reads or writes them.

### Secrets
**No secrets are required in GitHub** for this design. Application secrets (`DB_PASSWORD`, `JWT_SECRET`, …)
remain only in hPanel → Node.js → Environment variables. The CI database password is a throw-away value for an
ephemeral container. If TKS later prefers API-driven deploys instead of Git, it needs a per-environment
`HOSTINGER_API_TOKEN` environment secret. That token has account-wide power and is not recommended.

---

## 7. Traceability

| Question | Answer |
|---|---|
| What is running in production? | `GET /api/health` → `version` + `release.{tag, commit, build, deployedAt}`; latest commit on `deploy/production` |
| Which build/run deployed it? | `release.build` / deploy commit message → GitHub Actions run URL |
| Who approved it? | GitHub Environment deployment history (`production`) |
| What changed? | `git log <previous tag>..<tag>`, `CHANGELOG.md`, client release note |
| Was it tested? | the `verify` job (full CI) on that run; `verify-deployment` smoke results |

Example record: Commit `abc1234` · Tag `v1.2.0` · Build `#184` · Deploy commit on `deploy/production` ·
2026-11-02 10:14 EAT · Approved by <TKS release manager> · Health ✓ · Smoke 13/13 ✓ · Rollback target `v1.1.1`.

## 8. Monitoring & logs

| Capability | Status |
|---|---|
| Health endpoint `/api/health` (DB check, version, release stamp) | IMPLEMENTED |
| Deployment logs | GitHub Actions run logs + Hostinger build logs (hPanel / API) |
| Application logs | stdout/stderr only, available via Hostinger's Node.js log view (retention not verified) |
| Uptime monitoring / alerting | **NOT IMPLEMENTED.** Recommended: a free external monitor (e.g. UptimeRobot / Better Stack free tier) on `https://zanzirangihouse.com/api/health`, alerting TKS by email |
| Error tracking | **NOT IMPLEMENTED.** Optional later: Sentry free tier (server + browser) |
| Scheduled production smoke test | Not implemented; can be added as a `schedule:` trigger running `smoke-test-deployment.mjs` daily |
