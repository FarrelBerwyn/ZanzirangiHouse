# Contributing — Zanzirangi House

This repository is maintained by **TKS (Teknologi Kecerdasan Sinergi)** on behalf of the client,
**Zanzirangi House**. All engineering contributions follow the TKS workflow below.

## Quick rules

1. **Branch** from `staging`: `feature/ZAN-###-slug`, `bugfix/ZAN-###-slug`. Critical production fixes: `hotfix/ZAN-###-slug` from `main`.
2. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`, `revert:`. Add `Refs: ZAN-###` in the commit body.
3. **Open a PR** into `staging` using the PR template. CI (build + release check) must pass and a TKS reviewer must approve.
4. **Update `CHANGELOG.md`** under `## [Unreleased]` for any change that affects guests, staff or deployment.
5. **Never commit secrets**: `.env*` (except `.env.example`), databases, backups, uploads, or deploy zips. Never put database hosts, usernames or IP addresses in code, docs or PRs. **The repository is public.**
6. **Never** force-push `main`/`staging`, rewrite published history, or move or delete tags.

## Local setup

```bash
npm ci
cp .env.example .env        # fill in values for a NON-production database
npm run dev                 # http://localhost:3000 (site + API + /admin)
npm run build               # production build (dist/ + server.js)
npm run release:check       # version / CHANGELOG / tag consistency
```

## Full documentation

| Topic | Document |
|---|---|
| Branches, commits, PRs, traceability | `docs/GIT_WORKFLOW.md` |
| Versioning, releases, deployment record | `docs/RELEASE_PROCESS.md` |
| Rollback | `docs/ROLLBACK.md` |
| Client release notes | `docs/CLIENT_RELEASE_NOTES_TEMPLATE.md` |
| Change history | `CHANGELOG.md` |
