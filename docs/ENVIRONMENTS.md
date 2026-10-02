# Environments — Zanzirangi House

| | |
|---|---|
| Owner | TKS (Teknologi Kecerdasan Sinergi) |
| Updated | 2026-10-01 (replaces the former `ENVIRONMENT_MATRIX.md`) |
| Related | `docs/CICD.md`, `docs/DEPLOYMENT.md`, `.env.example` |

No credential values appear here. The repository is public.

## 1. Overview

```
Development (local)  ──►  Staging (NOT YET IMPLEMENTED)  ──►  Production (live)
feature/*, bugfix/*        staging → deploy/staging           main + tag vX.Y.Z → deploy/production
```

| | Development | Staging | Production |
|---|---|---|---|
| Purpose | Local development by TKS engineers | Pre-production integration, QA, client preview | Live Zanzirangi House website |
| Status | Exists | **Staging environment not currently implemented** | Live, VERIFIED healthy 2026-10-01 |
| URL | `http://localhost:3000` | recommended `https://staging.zanzirangihouse.com` | `https://zanzirangihouse.com` |
| Server | developer machine (`npm run dev` = Vite + API middleware) | Hostinger Node.js web app (to create) | Hostinger Node.js web app (Node 22, Express, `server.js`) |
| Git branch | `feature/*`, `bugfix/*` | `staging` → `deploy/staging` | tags on `main` → `deploy/production` |
| Database | must be a **local or dedicated dev** database, or the JSON dev DB (`FORCE_JSON_DB=true`) | own MySQL database (never the production DB) | Hostinger MySQL on the same server (`127.0.0.1`) |
| Media | `./uploads` | own `zanzirangi-media` folder | `<domain>/zanzirangi-media` (outside versioned build folders) |
| Env variables | `.env` / `.env.local` (gitignored; template `.env.example`) | hPanel → Node.js → Environment variables (own values) | hPanel → Node.js → Environment variables |
| Deployment | n/a | `deploy.yml`, automatic after green CI on `staging` | `deploy.yml`, manual run + GitHub Environment approval |
| Access | TKS engineers | TKS + Zanzirangi reviewers (protect with hPanel password protection) | public site; `/admin` for Zanzirangi staff and TKS |
| Search engines | n/a | `SITE_NOINDEX=true` (noindex header + disallow-all robots.txt) | indexed |

> ⚠ **Development risk (VERIFIED):** the local `.env` / `.env.local` on the audit machine point to a
> **non-local MySQL host**. Running `npm run dev` or the legacy test scripts against it can modify live data.
> Point development at a local/dev database. CI and `npm test` are already isolated from it.

## 2. Environment variables

| Variable | Dev | Staging | Production | Notes |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `production` | `production` | production mode enables fail-fast validation, HSTS, secure cookies |
| `DATABASE_PROVIDER` | `mysql` (or `FORCE_JSON_DB=true`) | `mysql` | `mysql` | production refuses anything else |
| `DB_HOST` / `DB_PORT` | local | `127.0.0.1` / `3306` | `127.0.0.1` / `3306` | Hostinger: always `127.0.0.1` from the app |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | dev values | **staging-only** DB + user | production DB + user | secrets live only in hPanel |
| `JWT_SECRET` | any | random ≥ 32 chars, **different from production** | random ≥ 32 chars | server refuses to start if weak (verified) |
| `JWT_EXPIRES_IN` | `7d` | `7d` | `7d` | |
| `APP_URL`, `PUBLIC_URL`, `API_URL` | localhost | staging URL | production URL | |
| `CORS_ORIGIN` | `http://localhost:3000` | staging origin | `https://zanzirangihouse.com` | never `*` |
| `LOG_LEVEL` | `debug` | `info` | `info` | currently informational only |
| `MEDIA_STORAGE_PATH` | optional | optional (default: shared `zanzirangi-media`) | not set (default used) | |
| `MAX_UPLOAD_SIZE` | optional | optional | not set (25 MB default) | |
| `SITE_NOINDEX` | — | **`true`** | not set | new: keeps staging out of search results |

Production currently has exactly these keys set: `NODE_ENV, DATABASE_PROVIDER, DB_HOST, DB_PORT, DB_NAME,
DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN, APP_URL, PUBLIC_URL, API_URL, CORS_ORIGIN, LOG_LEVEL`
(names VERIFIED via the Hostinger API; values masked and not read).

GitHub holds **no** application secrets; see `docs/CICD.md` §6 for the repository variables
(`PRODUCTION_URL`, `PRODUCTION_DEPLOY_ENABLED`, `STAGING_URL`, `STAGING_ENABLED`).

Production fail-fast rules actually implemented in `server/config/env.ts`: provider must be `mysql`;
`JWT_SECRET` must be set, ≥ 32 characters and not the dev default; all four DB variables must be present.
The server exits with code 1 otherwise. *(The former matrix also claimed a localhost-URL check; that check
does not exist and has been removed from this document.)*

## 3. Introducing staging (recommended, safest path)

1. hPanel → create subdomain `staging.zanzirangihouse.com` as a **separate Node.js web app** on the same hosting plan. This is cheaper and simpler than a new plan; check the plan's website/Node.js app limits.
2. Create a **separate MySQL database and user** for staging. Load it from a sanitised copy of production (no guest chat data or admin password hashes), or from the migrations plus CMS content export.
3. Set staging environment variables in hPanel (table above), including `SITE_NOINDEX=true` and its own `JWT_SECRET`.
4. Enable hPanel password protection (or an IP allow-list) for the staging site so it is not public.
5. Connect the Hostinger Git integration to branch `deploy/staging`: Node 22, Express, root `.`, build script `build`, entry `server.js`, auto-deploy on.
6. GitHub: create environment `staging`, set variables `STAGING_URL` and `STAGING_ENABLED=true`, push branch `staging`.
7. Verify one full cycle: push to `staging` → CI → Deploy (staging) → health shows the commit → QA.

**`zanzirangi.com`:** the account's second Node.js site serves an outdated static copy of this website. It
duplicates content for search engines and is not an environment of this pipeline. Decide with the client
whether to redirect it to `zanzirangihouse.com` (recommended) or repurpose it. Do **not** silently use a
client brand domain as staging.

## 4. Environment separation rules

- Staging and production never share a database, media folder or `JWT_SECRET`.
- Production data is never copied to development machines unsanitised.
- CI uses ephemeral databases only (`ci_*` on a disposable MariaDB container).
- Only `deploy.yml` deploys; nobody pushes `deploy/*` branches or uploads archives to a pipeline-managed site by hand.
