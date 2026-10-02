# Release Process — Zanzirangi House

| | |
|---|---|
| Owner | TKS (Teknologi Kecerdasan Sinergi) — Release Management |
| Established | 2026-10-01 |
| Related | `docs/GIT_WORKFLOW.md`, `CHANGELOG.md`, `docs/CLIENT_RELEASE_NOTES_TEMPLATE.md`, `docs/releases/`, `docs/ROLLBACK.md` |

This process lets TKS answer at any time: **What version is live? What changed? When was it released?
Who implemented it? Was it tested? Was it deployed? Can we roll it back?** It also gives Zanzirangi House
a plain-language update for every release.

---

## 1. Semantic Versioning

Format `MAJOR.MINOR.PATCH`; Git tags are `vMAJOR.MINOR.PATCH` (e.g. `v1.2.0`).

| Part | Increase when | Zanzirangi examples |
|---|---|---|
| **MAJOR** | A breaking change: existing behaviour, URLs, data or admin workflows stop working as before, or a manual migration by staff is needed | Site restructured with new URLs; admin roles redesigned; incompatible database change |
| **MINOR** | New backward-compatible functionality | New CMS module (e.g. blog); new page; booking enquiries delivered to staff; new language |
| **PATCH** | Bug fixes, small improvements, security and dependency updates, content-model tweaks that change nothing for users | Fix admin login redirect; fix mobile navigation; performance or SEO metadata fix |

Rules:
- Reset lower parts on increase (`1.4.2 → 1.5.0 → 2.0.0`).
- A released version is immutable. Never move, delete or reuse a tag; ship a new PATCH instead.
- Pre-releases for QA use `-rc.N` (`1.1.0-rc.1`). They are only deployed to staging and never announced to the client.
- `package.json` `"version"` always holds the version being prepared or last released. `"releaseDate"` is `null` until the release is made.

### Current version and baseline (as of 2026-10-01)

| Source | Value |
|---|---|
| `package.json` | `1.0.0` (never released) |
| Git tags / GitHub releases | none |
| CHANGELOG / release notes | none before 2026-10-01 |
| Commit messages | informal "v2.0" label (2026-09-05), not SemVer |
| Production deployment | not verified |

**Decision:** baseline **v1.0.0 = first verified production release.** No historical versions are created
retroactively. Development continues under `[Unreleased]` in `CHANGELOG.md` until the go-live blockers
are closed and the first production deployment is verified. The `v1.0.0` tag is then created on the
exact commit that was deployed.

---

## 2. Release Lifecycle

```
Requirement (Zanzirangi or TKS)
  → Task ZAN-###
  → feature/* or bugfix/* branch
  → Development (Conventional Commits, "Refs: ZAN-###")
  → Pull Request into staging (template + review)
  → Automated checks (CI: build + release metadata)
  → staging
  → QA (TKS) + client preview when "client approval required"
  → Approval
  → Release PR staging → main
  → Tag vX.Y.Z on main
  → Production deployment (Hostinger)
  → Deployment log + technical release record
  → Client release notes → Zanzirangi
```

Example: `feature/ZAN-024-editable-homepage` → `staging` → QA → `main` → `v1.2.0` → production →
"Zanzirangi Website Update v1.2.0".

---

## 3. Environments

| Environment | Branch | Where | Status |
|---|---|---|---|
| Development | `feature/*`, `bugfix/*` | Developer machine, `npm run dev` | Exists. ⚠ Local `.env` currently points to a **non-local** database. Development and tests must use a separate database (go-live blocker). |
| Staging | `staging` | **Not available yet.** Recommended: a Hostinger sub-domain (e.g. `staging.zanzirangihouse.com`) with its own database and media folder | Staging environment not detected. Until it exists, QA runs on a local production build (`npm run build && npm start`) against a non-production database. |
| Production | `main` (tags only) | `https://zanzirangihouse.com`, Hostinger Node.js | Live and healthy (VERIFIED 2026-10-01 via `/api/health`); current build was uploaded manually and is not traceable to a commit |

Full details: `docs/ENVIRONMENTS.md`.

---

## 4. Release Checklist (TKS)

### A. Prepare (on `staging`)
1. All PRs for the release are merged into `staging`; CI is green.
2. QA on staging (or a local production build): run through `docs/PRODUCTION_SMOKE_TEST.md` and the PR test notes. Record the results.
3. Client approval is obtained for every PR marked "Client approval required" (email or message is enough; link it in the technical record).
4. Decide the version (§1) based on the commits since the last tag:
   ```bash
   git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..staging --oneline
   ```

### B. Version bump (branch `release/vX.Y.Z` or directly in the release PR)
5. `package.json`: set `"version": "X.Y.Z"` and `"releaseDate": "YYYY-MM-DD"` (the planned production date). Run `npm install --package-lock-only` so `package-lock.json` matches.
6. `CHANGELOG.md`: rename `## [Unreleased]` content to `## [X.Y.Z] - YYYY-MM-DD` and add a fresh empty `## [Unreleased]` above it. Fill in Added / Improved / Fixed / Security / Database / Deployment / Breaking Changes.
7. Create `docs/releases/vX.Y.Z/TECHNICAL_RELEASE.md` from `docs/releases/TECHNICAL_RELEASE_TEMPLATE.md`, and `docs/releases/vX.Y.Z/CLIENT_RELEASE_NOTES.md` from `docs/CLIENT_RELEASE_NOTES_TEMPLATE.md`.
8. Commit: `chore(release): vX.Y.Z`.

### C. Merge and tag
9. Open the release PR `staging → main` (merge commit). Review and merge once CI passes.
10. On an up-to-date, clean `main`:
    ```bash
    git switch main && git pull
    npm ci && npm run build
    npm run release:check -- --release        # must pass
    git tag -a vX.Y.Z -m "vX.Y.Z — <one-line summary>"
    git push origin main vX.Y.Z               # TKS release manager only
    ```
11. Optional: create a GitHub Release from the tag and paste the CHANGELOG section.

### D. Deploy (production) — full procedure in `docs/DEPLOYMENT.md`
12. Back up the database and the media folder **before** deploying (hPanel backups or a database export). Record the backup reference.
13. Apply database migrations if the release requires them (`docs/DEPLOYMENT.md` §5), in a maintenance window.
14. Deploy the tag:
    - **Pipeline** (once enabled): GitHub Actions → Deploy → `environment=production`, `ref=vX.Y.Z` → approve. CI re-runs on the tag; the health check and smoke test run automatically.
    - **Interim manual procedure** (until then): build from a clean checkout of the tag and upload (`docs/DEPLOYMENT.md` §4).
15. Verify production (automatic in the pipeline):
    - `GET https://zanzirangihouse.com/api/health` → HTTP 200, `"version": "X.Y.Z"`, `"releaseDate"` set, `release.commit` = the tag's commit
    - the admin dashboard footer shows **System Version vX.Y.Z**
    - `node scripts/smoke-test-deployment.mjs --url https://zanzirangihouse.com --expect-version X.Y.Z` passes
16. Manual QA of authenticated flows (admin login, a content edit, media upload, chat reply) with a TKS account.

### E. Record and communicate
17. Add a row to `docs/releases/DEPLOYMENT_LOG.md` and complete the technical record (commit, deployer, results, rollback target).
18. Send the client release notes to Zanzirangi (§6).
19. Merge `main` back into `staging` if they differ (e.g. after a hotfix).

---

## 5. Hotfix Process (critical production issue)

1. `git switch main && git switch -c hotfix/ZAN-###-short-name`.
2. Fix, commit `fix(...)`, then open a PR into `main` and review it (expedited, but still reviewed).
3. Bump PATCH (`1.2.0 → 1.2.1`), add a CHANGELOG entry and the release records.
4. Merge, tag, deploy and record (§4 C–E).
5. Merge `main` back into `staging`.
6. Client note: short, focused on what was fixed and whether any action is needed.

---

## 6. Two Levels of Release Documentation

| | Internal — Technical Release Record | External — Client Release Notes |
|---|---|---|
| Audience | TKS engineering | Zanzirangi House |
| File | `docs/releases/vX.Y.Z/TECHNICAL_RELEASE.md` | `docs/releases/vX.Y.Z/CLIENT_RELEASE_NOTES.md` |
| Template | `docs/releases/TECHNICAL_RELEASE_TEMPLATE.md` | `docs/CLIENT_RELEASE_NOTES_TEMPLATE.md` |
| Contains | commit hash, tag, PRs, branches, migrations, env-var changes, tests, build, deployment result, rollback target | What's new, improvements, bug fixes, business impact, action required |
| Must not contain | secrets, passwords, DB hosts or users, IP addresses (**the repository is public**) | any technical or infrastructure detail |

Delivery to the client: TKS sends the client release notes by the agreed channel (email or WhatsApp,
as PDF or text) on the day of the production deployment. The client never needs GitHub access.

---

## 7. Database Migrations in Releases

- Migrations live in `server/database/migrations/NNN_description.sql` and are applied manually with the scripts in `scripts/` (there is no automatic migration runner yet).
- Every release states **"Database migration required: Yes/No"** in the CHANGELOG and the technical record, listing the files.
- Migrations must be backward compatible with the previous release where possible ("expand, then contract"), so an application rollback does not require a database rollback.
- Take a database backup immediately before applying a migration.
- `003_full_cms_coverage.sql` uses `ADD COLUMN IF NOT EXISTS` (MariaDB syntax). Confirm the host's database engine before the v1.0.0 deployment.

---

## 8. CI/CD

The pipeline is documented in **`docs/CICD.md`**. Summary (2026-10-01):

| Item | Status |
|---|---|
| `.github/workflows/ci.yml` | Type check, 40 automated tests, secret scan, dependency audit (high/critical blocks), migration review, build + build verification, release metadata, and a production-bundle boot on MariaDB. Runs on every PR, on pushes to `main`/`staging`, and on tags. |
| `.github/workflows/deploy.yml` | Replaces the broken GitHub Pages workflow (12/12 runs failed). Manual production deploys of release tags only, with a migration gate, CI re-run on the exact commit, GitHub Environment approval, fast-forward deploy commit to `deploy/production` for Hostinger Git deployment, then health and smoke verification. **Requires the configuration in `docs/CICD.md` §6 before it can run.** |
| Production `npm run release:check -- --release` | Runs automatically for every pushed `v*` tag. |

---

## 9. Answering Release Questions

| Question | Answer source |
|---|---|
| What version is live? | Last row of `docs/releases/DEPLOYMENT_LOG.md`; `GET /api/health` → `version`; admin footer "System Version" |
| What changed? | `CHANGELOG.md` section; client notes; `git log vPrev..vX.Y.Z` |
| When was it released? | `CHANGELOG.md` date / `package.json` `releaseDate` / deployment log |
| Who implemented it? | Commit authors and PRs listed in the technical record |
| Was it tested? | "Tests / QA" section of the technical record; CI result on the release PR |
| Was it deployed? | Deployment log row with result "Successful" |
| Can we roll it back? | "Rollback target" in the technical record + `docs/ROLLBACK.md` |
