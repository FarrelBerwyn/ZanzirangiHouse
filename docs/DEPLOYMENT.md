# Deployment — Zanzirangi House

| | |
|---|---|
| Owner | TKS (Teknologi Kecerdasan Sinergi) |
| Updated | 2026-10-01 |
| Supersedes | `HOSTINGER_DEPLOYMENT.md` (root), `docs/HOSTINGER_DEPLOYMENT.md`, `docs/HOSTINGER_PRODUCTION_DEPLOYMENT.md`, `docs/HOSTINGER_CONFIG.md`, `docs/DEPLOYMENT_CHECKLIST.md`, `docs/HOSTINGER_DEPLOYMENT_CHECKLIST.md` (kept for history) |
| Related | `docs/CICD.md` (pipeline), `docs/ENVIRONMENTS.md`, `docs/ROLLBACK.md`, `docs/RELEASE_PROCESS.md` |

This is the single, authoritative deployment procedure. Never put credentials, hosts, account IDs or
IP addresses in this file or any other tracked file. **The repository is public.**

---

## 1. Current production facts (VERIFIED 2026-10-01)

| Item | Value | Source |
|---|---|---|
| Live URL | https://zanzirangihouse.com | `GET /api/health` → 200, `status: ok`, MySQL connected, `version: 1.0.0` |
| Hosting | Hostinger web hosting, Node.js web app (website type `nodejs`) | Hostinger API |
| Runtime | Node.js 22, framework *Express*, entry file `server.js`, npm | Hostinger build settings |
| Current deploy method | Manual archive upload (`zanzirangi-house-v3.zip`) → Hostinger archive build | 18 builds, all `source_type: archive`; latest 2026-10-01 08:08 UTC |
| Git provider connected to Hostinger | **None** | Hostinger API (no active, pending or suspended installations) |
| TLS | Valid HTTPS; HSTS on API responses; served via Hostinger CDN (`server: hcdn`) | live headers |
| App environment variables (names) | `NODE_ENV, DATABASE_PROVIDER, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN, APP_URL, PUBLIC_URL, API_URL, CORS_ORIGIN, LOG_LEVEL` | Hostinger API (values are masked and were not read) |
| Media | default persistent folder `<domain>/zanzirangi-media` (no `MEDIA_STORAGE_PATH` override set) | code + env var list |
| Second Node.js site | `zanzirangi.com` serves an **old static build** (Git build of 2026-09-23 from another GitHub account); `/api/health` = 404 | Hostinger API + live check |

The live build cannot be traced to a Git commit: it was zipped from a working tree with uncommitted changes.
The first pipeline deployment fixes this.

---

## 2. Deployment order (every release)

```
1. Release prepared            docs/RELEASE_PROCESS.md §4 A–C (CHANGELOG, version, tag vX.Y.Z on main)
2. Backup                      database export + zanzirangi-media backup (hPanel) → record reference
3. Migrations (if any)         review → apply manually (§5) → confirm app is backward compatible
4. Application deployment      GitHub Actions → Deploy (environment=production, ref=vX.Y.Z)
5. Health check + smoke test   automatic in the workflow (verify-deployment job)
6. Record + communicate        DEPLOYMENT_LOG.md row, technical record, client release note
```

Backup always precedes migrations. Migrations precede the application deployment and must be
**backward compatible** ("expand, then contract"): the currently live version must keep working on the
migrated schema, so the application can be rolled back without touching the database.

---

## 3. Production deployment via the pipeline (target procedure)

Prerequisites: everything in `docs/CICD.md` §6 is configured and staging has been proven.

1. GitHub → Actions → **Deploy** → *Run workflow*:
   - `environment`: `production`
   - `ref`: the release tag, e.g. `v1.2.0`
   - `reason`: e.g. `release v1.2.0` / `hotfix v1.2.1`
   - `migrations_applied`: tick only if §5 was completed for this release
   - `allow_destructive_migrations`: tick only with written TKS approval
2. The workflow checks the tag, reviews migrations and **re-runs the full CI** on the tagged commit.
3. The approver (GitHub Environment `production`) reviews the summary and approves.
4. The workflow pushes a deploy commit to `deploy/production`; Hostinger builds and restarts the app (~1–2 min).
5. The workflow waits until `/api/health` reports the new commit, then runs the smoke test.
6. Green → finish §2 step 6. Red → `docs/ROLLBACK.md`.

## 4. Interim procedure (until Hostinger Git deployment is switched on)

Until `PRODUCTION_DEPLOY_ENABLED=true`, production is deployed manually. These rules make it traceable
and repeatable now:

1. Deploy **only a tagged release**. Never zip a working tree with uncommitted changes.
2. Build from a clean checkout of the tag, run the same gates as CI, stamp it, then package:
   ```bash
   git clone https://github.com/FarrelBerwyn/ZanzirangiHouse.git zr-release && cd zr-release
   git checkout v1.2.0
   npm ci && npm run typecheck && npm test && npm run security:secrets && npm run security:audit
   npm run build && npm run verify:build && npm run release:check -- --release
   node -e "require('fs').writeFileSync('release.json', JSON.stringify({version:require('./package.json').version, tag:'v1.2.0', commit:require('child_process').execSync('git rev-parse HEAD').toString().trim(), build:'manual', environment:'production', deployedAt:new Date().toISOString()}))"
   npm run package:hostinger          # hostinger_deploy.zip (secret-scanned), includes release.json
   ```
3. Back up, upload the archive in hPanel and start the Node.js build with the existing settings (Node 22, Express, entry `server.js`).
4. Verify: `node scripts/smoke-test-deployment.mjs --url https://zanzirangihouse.com --expect-version 1.2.0`.
5. Record the deployment in `docs/releases/DEPLOYMENT_LOG.md` with deployer, time, tag and commit.

## 5. Database migrations

| Item | Fact |
|---|---|
| Engine | MySQL-compatible (Hostinger). `003_full_cms_coverage.sql` uses MariaDB-only syntax; CI tests migrations on **MariaDB 10.11**. The production engine/version is **not verified**: check in phpMyAdmin (`SELECT VERSION();`). |
| ORM | none: raw SQL via `mysql2` |
| Migration files | `server/database/migrations/NNN_*.sql` |
| Runner | manual scripts (`npm run db:migrate:mysql` for 001 + data, `scripts/run-support-migration.ts` for 002, `scripts/run-cms-coverage-migration.ts` for 003). No automatic runner; `schema_migrations` is written but not consulted. |
| Pipeline behaviour | **never runs migrations.** The deploy gate refuses to continue while migrations newer than the live release are unconfirmed, and refuses destructive SQL without explicit approval. |

Procedure:
1. `node scripts/check-migrations.mjs --since v<live version>`: list pending files, destructive statements, portability warnings.
2. Back up the production database (hPanel → Databases → Backups, or an export). Store it outside the repository.
3. Rehearse on staging (once available), then apply to production from a trusted TKS machine. Prefer hPanel/phpMyAdmin for small DDL, or the repo script with production credentials loaded only in that shell session, never in a committed file.
4. Verify the app still works (`/api/health`, admin login) **before** deploying the new application.
5. Run the deploy workflow with `migrations_applied` ticked.

Destructive migrations (`DROP`, `DELETE`, `TRUNCATE`, `MODIFY/CHANGE`, `RENAME`, data `UPDATE`) need: a
written plan, a fresh backup, a restore rehearsal on staging, and `allow_destructive_migrations`.

## 6. What must never happen

- Deploying from a feature branch, an untagged commit, or a dirty working tree to production.
- Force-pushing `deploy/*`, `main` or `staging`; moving or deleting tags.
- Committing `.env*`, `release.json`, database dumps, backups or zips (CI blocks these).
- Running test suites or destructive scripts (`scripts/restore-exact-baseline.ts`, CRUD test suites) against the production database.
- Changing production environment variables as part of a code deployment without recording the change (`docs/ROLLBACK.md` §6).
