# Changelog

All notable changes to the Zanzirangi House website and CMS are recorded here.
Maintained by **TKS (Teknologi Kecerdasan Sinergi)**. The client-facing summary of each release lives in
`docs/releases/vX.Y.Z/CLIENT_RELEASE_NOTES.md`; this file is the internal engineering record.

- Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) with TKS release sections
  (Added · Improved · Fixed · Security · Database · Deployment · Breaking Changes).
- Versioning: [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`, Git tag `vMAJOR.MINOR.PATCH`.
- Process: `docs/RELEASE_PROCESS.md`. Every released version must have a Git tag, a technical
  release record and client release notes. `npm run release:check` validates consistency.

> **Version baseline (established 2026-10-01).** Before this date the project had no Git tags, no
> releases and no changelog, and no production deployment could be verified. No historical version
> numbers are invented. The first verified production deployment will be released as **v1.0.0**
> (the version already in `package.json`). Everything below "Unreleased" is a read-only reconstruction
> of the untagged development history from Git.

---

## [Unreleased]

Target: **v1.0.0 — initial production release** (to be released after the go-live blockers in
`ZANZIRANGI_PRODUCTION_READINESS.md` are resolved and a production deployment is verified).

### Added
- Public multilingual website (8 languages incl. RTL Arabic): home, villas, dining, experiences, safari, about, contact, privacy, terms.
- Admin dashboard (CMS) with role-based access: Superadmin and Admin with 17 module permissions; maximum 6 active administrators.
- Content modules: homepage & sections, pages, villas, gallery, videos, facilities, testimonials, dining, experiences, safari, transfers, why-stay, navigation & footer, translations, contact & WhatsApp, SEO, settings, media library.
- Guest chat assistant with knowledge base and staff hand-off inbox.
- Audit log of logins and administrative changes.
- Release management: `CHANGELOG.md`, Git workflow, release process, client/technical release templates, deployment log, `npm run release:check`, PR template.
- Admin dashboard shows the running **System Version** and release date (read from `package.json` via `/api/health`).
- CI/CD (`docs/CICD.md`):
  - CI quality gate: type check, 40 automated unit/integration tests (`npm test`), secret scan, dependency audit policy, migration review, build verification, production-bundle boot on MariaDB.
  - Controlled deploy workflow: tag-only production, migration gate, environment approval, Hostinger Git deploy branches, health check and smoke test.
- `/api/health` reports a `release` stamp (tag, commit, CI build, environment, deploy time) for deployments made by the pipeline.
- `SITE_NOINDEX=true` mode for staging: noindex header and disallow-all `robots.txt`.

### Fixed
- `/api/*` responses no longer send `X-Powered-By: Express` (the API sub-app ignored the parent setting).
- `scripts/run-cms-coverage-migration.ts` seeded the transfers section with renamed translation keys, which inserted empty values. It now uses the current keys. This also fixes 13 TypeScript errors in `scripts/`; `tsc` is now clean.

### Removed
- GitHub Pages deployment workflow (Pages was never enabled; 12/12 runs failed; a static copy cannot run the API). Replaced by `.github/workflows/deploy.yml`.

### Pending — present in the working tree but not yet committed (as of 2026-10-01)
- Database migration `003_full_cms_coverage.sql` (pages, transfers, why-stay, dining, experiences, safari, global content; user status/permissions/session-version columns).
- Admin modules: access manager, page editor, dining, experiences, safari, transfers, why-stay, global content, translations, home sections editor.
- Repositories and runtime state for the modules above.
- These must be committed, reviewed and tested before they can be part of v1.0.0.

### Database
- Migration required for v1.0.0: **Yes** — `001_initial_schema.sql`, `002_support_system.sql`, `003_full_cms_coverage.sql` (manual scripts; see `docs/RELEASE_PROCESS.md` §7).

### Deployment
- Not yet deployed as a versioned release. See `docs/releases/DEPLOYMENT_LOG.md`.

### Breaking Changes
- None (first release).

---

## Pre-release development history (untagged)

Reconstructed from `git log` on 2026-10-01. Author of all commits: `FarrelBerwyn`. These entries are
**not versions** and were never tagged or verified in production. The commit messages from
2026-09-04 and 2026-09-05 mention "v2.0"; that was an informal label, not a Semantic Version.

### 2026-09-29
- fix(chat): stop duplicating visitor messages when polling returns the server copy — `2379f82` *(not pushed to origin)*
- fix(deploy): drop static `.htaccess` that bypassed the Node runtime; zip with forward-slash paths — `adab9b8` *(not pushed to origin)*
- feat: support platform, CMS hardening, and Hostinger deploy prep — `51afb7a`

### 2026-09-26
- feat(hostinger): database abstraction layer, repositories, readiness documentation — `3d88c5e`
- fix(hostinger): bind server to 0.0.0.0, database fallback, `server.js` runtime — `baec848`
- style: hero title and subtitle 2-line layout — `92a7b2d`
- feat: Hostinger MySQL auto-connection, bundled `server.js`, API gateway routing — `4078426`
- feat: hero titles and slides with SEO keywords — `c1aa3e8`
- feat: continuous video background for hero slides — `cf3f990`
- feat: static hero content from primary slide — `91df722`
- style: official logo on admin login, normalised admin labels — `11b8480`
- feat: production readiness, MySQL abstraction, persistent media, Hostinger hardening — `75e5de1`

### 2026-09-24
- feat: technical SEO and GEO optimisation — `04d464f`
- docs: README overhaul and repository URL update — `f6f6038`, `c29b360`

### 2026-09-23
- feat/chore(deploy): add then remove Apache `.htaccess` SPA routing — `67c3b5d`, `7c9fd6d`
- fix(deploy): remove unused express dependency for Vercel detection — `1742e33`

### 2026-09-17
- feat: new brand logo and Vercel configuration — `6af97ba`

### 2026-09-08
- feat: brand logo update — `20f52d8`
- ci: GitHub Pages workflow step order — `9804eb6`

### 2026-09-03 – 2026-09-05
- feat: multilingual localisation, horizontal scroll tabs, UI refinements ("version 2.0") — `dc24bf3`
- feat/fix: responsive and mobile improvements, Polish language, social channels, chat assistant styling — `e640eb5`, `1b201a4`, `4b2d7b3`, `36fb4d4`
- Rebrand to Zanzirangi House: video hero, second banner, customer support assistant, Arabic & Chinese — `83e65e8`, `69340b4`, `16c1408`
- GitHub Pages deployment configuration — `ea5e47e`
- Initial commit ("The Zanzibar Retreat" web app) — `cae2ec8`
