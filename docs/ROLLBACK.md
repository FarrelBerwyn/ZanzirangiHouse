# Zanzirangi House — Production Rollback & Recovery Plan

**Target system:** Zanzirangi House (`https://zanzirangihouse.com`), Hostinger Node.js hosting
**Scope:** application code, MySQL database, persistent media, environment configuration
**Owner:** TKS (Teknologi Kecerdasan Sinergi)
**Revised:** 2026-10-01. Formerly `docs/ROLLBACK_PLAN.md`. Covers the CI/CD pipeline (`docs/CICD.md`) and the
interim manual archive deployment (`docs/DEPLOYMENT.md` §4).

> **Verification status.** The pipeline's rollback mechanism (redeploying an older tag as a new
> fast-forward commit on `deploy/production`) was exercised in a local Git simulation on 2026-10-01:
> release v1.0.0 → v1.1.0 → rollback v1.0.0, all fast-forward and without force-push, with the live tree
> equal to v1.0.0. It has **not** been exercised on Hostinger. Hostinger backup settings are not verified.
> RTO figures are **targets**. Rollback is always a human decision; there is deliberately no automatic
> rollback, because the database is shared between releases.

---

## 1. Principles

1. Production only ever runs a **tagged release** (`vX.Y.Z`). Rolling back means redeploying the previous tag (recorded as the "Rollback target" in the technical release record).
2. Rolling back does **not** rewrite Git history. If code must change, use `git revert` and ship a new PATCH version.
3. **Back up before deploying.** Every deployment row in `docs/releases/DEPLOYMENT_LOG.md` notes the pre-deployment backup.
4. Database migrations should be backward compatible ("expand, then contract"), so that most application rollbacks need **no** database rollback.
5. Every rollback is recorded in the deployment log and, if guests or staff were affected, communicated to the client in plain language.

## 2. Decision Matrix

| Incident | Example | Action | Database rollback? | Target RTO |
|---|---|---|---|---|
| Defective release (code) | Page crash, admin feature broken, server will not start | Redeploy previous tag (§3) | No (if migration was backward compatible) | < 30 min |
| Failed / harmful migration | Migration error, data corruption | Stop the app, restore the pre-deployment DB backup (§4), redeploy the previous tag | Yes | < 60 min |
| Accidental content deletion by staff | Villa or page deleted in the CMS | Restore the affected rows from the most recent backup into a temporary DB, then copy back (§4.3) | Partial | < 1 business day |
| Media loss | Uploaded images missing | Restore the media folder from backup (§5) | No | < 2 h |
| Bad environment configuration | Wrong env var after deploy | Restore the previous values from the private credential register (§6) and restart | No | < 15 min |
| Host failure | Hosting account unavailable | Escalate to Hostinger; redeploy the current tag + DB + media backup to a new host | Restore | depends on provider |

## 3. Application Rollback (previous tag)

Example: production is `v1.2.0`, a problem is found, rollback target is `v1.1.1`.

```
v1.2.0 (live, failing)  →  decision  →  Deploy workflow with ref=v1.1.1  →  new deploy commit (tree = v1.1.1)
→  Hostinger rebuilds  →  /api/health reports v1.1.1's commit  →  smoke test  →  record + fix forward (v1.2.1)
```

### 3.1 With the pipeline (once `PRODUCTION_DEPLOY_ENABLED=true`)

1. **Decide**: the TKS release manager confirms the rollback (and informs Zanzirangi if guests are affected).
2. **Check the database** (step 3 below). If v1.1.1 cannot run on the current schema, do §4 first.
3. GitHub → Actions → **Deploy** → `environment=production`, `ref=v1.1.1`, `reason=rollback from v1.2.0: <cause>`.
   Tick `migrations_applied` only if the migration gate asks and the schema is compatible.
4. Approve in the `production` environment. The workflow re-runs CI on v1.1.1 and pushes a **new** commit to
   `deploy/production` whose files equal v1.1.1. No force-push and no history rewrite: the failed release
   stays visible in the history.
5. The workflow waits for `/api/health` to report v1.1.1's commit and runs the smoke test.
6. Continue at step 6 below (record, fix forward).

If the pipeline itself is unavailable, use §3.2. (Hostinger lists previous builds in hPanel / its API.
Whether an earlier build can be re-activated from that history is **not verified**, so do not rely on it.)

### 3.2 Manual (interim archive deployment, or pipeline unavailable)

1. **Decide**: as above.
2. **Build the previous release from its tag** (on a TKS machine):
   ```bash
   git fetch --tags
   git switch --detach v1.1.1
   npm ci && npm run build && npm run package:hostinger
   ```
   Alternatively, re-use the archived `hostinger_deploy.zip` for v1.1.1 if TKS kept it.
3. **Check the database**: does v1.2.0 include a migration that v1.1.1 cannot work with? Look at "Database" in `docs/releases/v1.2.0/TECHNICAL_RELEASE.md`.
   - Backward compatible → continue.
   - Not compatible → follow §4 first.
4. **Deploy**: upload and extract the zip, install dependencies, and restart the Node.js app in hPanel. Do not touch environment variables unless the release changed them (§6).
5. **Verify**: `GET /api/health` → HTTP 200 and `"version": "1.1.1"`; the admin footer shows v1.1.1; run the smoke test.
6. **Record**: add a `Rollback` row to `docs/releases/DEPLOYMENT_LOG.md`, and note the cause in the v1.2.0 technical record.
7. **Fix forward**: fix on a `hotfix/*` branch, release `v1.2.1`. Never re-tag `v1.2.0`.

Media and the database live **outside** the deployed application folder (`<domain>/zanzirangi-media`,
MySQL), so a code rollback leaves content and uploads untouched. Confirm on the server that media is not
using the `./uploads` fallback inside the app folder; that fallback would be replaced by a redeploy.

## 4. Database Rollback Considerations

### 4.1 Before every deployment with a migration
- Take a full database backup (hPanel → Databases → Backups, or a phpMyAdmin/`mysqldump` export). Store it **outside** the repository and outside the public web root.
- Note the backup reference in the technical record.

### 4.2 Restoring after a failed migration
1. Put the site in a maintenance state or stop the Node.js app, so no new writes arrive.
2. Restore the pre-deployment backup (hPanel restore, or import the export).
3. Redeploy the previous tag (§3).
4. Verify `/api/health` and spot-check content in the admin dashboard.
5. Any content edited by staff between deployment and restore is lost. List it and inform the client.

### 4.3 Partial (content) restore
Restore the backup into a **separate temporary database**, export only the affected rows, and import
them into production. Never run `scripts/restore-exact-baseline.ts` against production: it truncates every table.

### 4.4 Warnings
- Never run `DROP TABLE` or bulk deletes against production without a verified backup taken minutes earlier.
- Do not run test suites or migration scripts from a developer machine whose `.env` points at production.

## 5. Media / Asset Rollback

- **Build assets** (`dist/`, hashed `/assets/*`) are part of each release zip and roll back with the application.
- **Uploaded media** (`zanzirangi-media/`) are not versioned. Restore from hPanel file backups or a TKS media archive. Deleting a media item in the CMS also deletes its file.
- The CDN may cache assets. Uploaded media is served with `no-cache` (revalidation); hashed build assets change name per release. A CDN purge is normally not needed (verify in hPanel if old files persist).

## 6. Environment Variable Rollback

- Production variables exist **only** in hPanel → Node.js → Environment variables (never in Git or the zip).
- Before changing any variable, record the previous value in TKS's private credential register (password manager), never in this repository.
- Rollback: restore the previous value in hPanel and restart the app. Verify `/api/health`.
- If `JWT_SECRET` is changed, all admins are logged out (expected).

## 7. Backup Status (open items)

| Item | Status |
|---|---|
| Hostinger automatic database backups | Not verified: check the plan, frequency and retention in hPanel |
| Hostinger file backups covering `zanzirangi-media/` | Not verified |
| Off-site copy maintained by TKS | Not implemented |
| Restore drill performed | Not yet: perform one before the v1.0.0 go-live |
