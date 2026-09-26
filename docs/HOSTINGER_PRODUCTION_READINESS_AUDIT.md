# Zanzirangi House — Hostinger Production Readiness & Architecture Audit

**Document Version:** 1.0.0  
**Project:** Zanzirangi House (`https://zanzirangihouse.com`)  
**Assessment Date:** September 26, 2026  
**Auditor:** Principal Full-Stack & DevOps Architect  

---

## 1. Current Architecture (Baseline)

The current local development baseline comprises:
- **Frontend Framework:** React 19 + TypeScript + Vite 6 + Tailwind CSS v4.
- **Backend Application Server:** Express 5 (`server/index.ts` & `server/api.ts`).
- **Database Abstraction:** Pluggable `DatabaseAdapter` interface (`server/database/adapter.ts`).
- **Active Dev Provider:** `json` adapter (`server/database/jsonAdapter.ts`), utilizing `server/data/db.json` with in-memory caching and mtime-based disk synchronization.
- **Authentication:** JWT Bearer tokens & HTTP-only cookies, verified against bcrypt password hashes (cost factor 12) with rate-limiting on `/api/auth/login`.
- **Media Storage:** Configurable persistent storage (`server/storage/mediaStorage.ts`), storing binary uploads in `./uploads` with cryptographic filename generation, MIME whitelisting, and path traversal prevention.
- **Public Website Integration:** Direct REST consumption of `/api/content/*` via `src/services/contentApi.ts` with local fallback caching.
- **Admin Management:** Dedicated `/admin` interface with no visible links on the public front-end.

---

## 2. Production Target Architecture

```
                       CANONICAL PUBLIC DOMAIN
                         zanzirangihouse.com
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  ▼                               ▼
            PUBLIC WEBSITE                    ADMIN CMS
         https://.../ (Root)            https://.../admin (Restricted)
                  │                               │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                         HOSTINGER NODE.JS RUNTIME
                           Express Application
                                  │
                  ┌───────────────┴───────────────┐
                  │                               │
                  ▼                               ▼
          HOSTINGER CLOUD MYSQL            PERSISTENT MEDIA
            Managed Database             /persistent/uploads/
          Relational DDL Schema         (Outside build dist/)
```

### Key Architectural Separation:
- **Code Lifecycle:** Developer → Git/GitHub → Hostinger Deployment. Triggers build of frontend and restarts Node.js.
- **Content Lifecycle:** Owner/Admin → Admin CMS (`/admin`) → Express API (`/api/admin/*`) → MySQL Database → Public Website (`/api/content/*`). **Zero Git commits, zero builds, and zero redeployments required for content updates.**

---

## 3. Local-Only Assumptions (Identified & Remedied)

1. **`db.json` File Persistence:**
   - *Assumption:* Single flat JSON file on disk is adequate for concurrent multi-admin workflows.
   - *Remedy:* Created MySQL Relational Adapter with transactional queries, connection pooling, and automated schema migration.
2. **Hardcoded Port & Hosts:**
   - *Assumption:* App always runs on `localhost:3000`.
   - *Remedy:* Centralized `server/config/env.ts` dynamically binding `APP_URL`, `API_URL`, and `CORS_ORIGIN` to production domain.
3. **Frontend Vite Dev Middleware:**
   - *Assumption:* Vite's dev server handles API proxying.
   - *Remedy:* Configured `server/index.ts` as the production entry point serving both static `dist/` assets and `/api/*` endpoints under one port.
4. **Development Admin Credential:**
   - *Assumption:* Static default password in seed scripts.
   - *Remedy:* Cryptographic password rotation utility (`scripts/create_admin.js`), removed all plaintext secrets, and stored credentials in gitignored `.env.local`.

---

## 4. Hostinger Dependencies & Runtime Prerequisites

- **Runtime:** Node.js v20.x or v22.x Web App container.
- **Database:** Hostinger Cloud MySQL (MySQL 8.0+ or MariaDB 10.6+).
- **Persistent Storage:** Writable directory outside the git deployment directory (e.g. `../persistent/uploads`).
- **Process Manager:** Hostinger Passenger / PM2 / systemd Node runner.
- **Reverse Proxy:** OpenLiteSpeed / Nginx proxying port 3000 (or assigned socket) with SSL termination.

---

## 5. Database Risks & Hardening

- **Risk:** Concurrency lockups or data loss if `db.json` is modified simultaneously or wiped on deployment.
- **Hardening:**
  - Designed relational MySQL schema with Foreign Keys (`ON DELETE CASCADE`), proper indexes, and `schema_migrations` tracking.
  - Implemented `DatabaseAdapter` interface supporting both `DATABASE_PROVIDER=mysql` and `DATABASE_PROVIDER=json`.
  - Content transactions: Multi-table operations wrapped in MySQL transactions with automatic rollback on error.

---

## 6. File Storage Risks & Hardening

- **Risk:** Files uploaded to `dist/uploads/` are destroyed whenever a new code build or git redeploy occurs.
- **Hardening:**
  - Relocated uploads to an external, configurable `MEDIA_STORAGE_PATH` (e.g., `/home/.../persistent/uploads`).
  - Added strict upload sanitization: Executable extensions (`.php`, `.js`, `.sh`, `.exe`, etc.) are blocked.
  - Path traversal checks prevent `../` directory breakouts.

---

## 7. Authentication Risks & Hardening

- **Risk:** Brute-force attacks against `/api/auth/login` or stolen JWT secrets.
- **Hardening:**
  - Added `express-rate-limit` limiting login attempts to 10 requests per 15 minutes per IP.
  - Enforced strong JWT secret validation (`JWT_SECRET` must be at least 32 characters in production).
  - Passwords hashed using `bcryptjs` with cost factor 12.
  - Cookie security: `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`.

---

## 8. Environment Variable Risks & Hardening

- **Risk:** App starts with unconfigured or missing production database credentials, causing silent failures.
- **Hardening:**
  - Built `server/config/env.ts` with strict startup validation.
  - If `NODE_ENV=production` and required MySQL variables or `JWT_SECRET` are missing, the server **fails fast** with clear diagnostic messages.

---

## 9. Routing Risks & Hardening

- **Risk:** SPA direct page refreshes (e.g., navigating to `/villas` or `/admin`) return 404 on Hostinger.
- **Hardening:**
  - Generated physical HTML directories during build: `dist/villas/index.html`, `dist/dining/index.html`, `dist/experiences/index.html`, `dist/safari/index.html`, `dist/about/index.html`, `dist/contact/index.html`.
  - Configured SPA fallback in `server/index.ts`: Any route not matching `/api/*` or a physical static asset serves `dist/index.html`.

---

## 10. Build Risks & Hardening

- **Risk:** Heavy production client bundles or TypeScript errors halting deployment.
- **Hardening:**
  - Verified clean compilation with `npm run build`.
  - Assets hashed for long-term cache invalidation (`index-[hash].js`, `index-[hash].css`).

---

## 11. Media Risks & Hardening

- **Risk:** Broken image URLs if asset references are absolute localhost links.
- **Hardening:**
  - Media records store normalized root-relative paths (`/uploads/filename.ext`).
  - Express static route `/uploads` serves persistent media directly.

---

## 12. SEO Risks & Hardening

- **Risk:** Admin dashboard indexed by Google, or public meta tags broken by CMS edits.
- **Hardening:**
  - Injected `<meta name="robots" content="noindex, nofollow" />` on all admin views.
  - Generated sitemap (`public/sitemap.xml`) and canonical tags for all 8 public routes.
  - Dynamic OpenGraph and Twitter cards managed via CMS SEO repository.

---

## 13. Backup Risks & Hardening

- **Risk:** Accidental database loss during schema updates.
- **Hardening:**
  - Pre-migration backup created: `backups/local-db-before-mysql-migration.json` (50 KB).
  - MySQL migration script `scripts/db:migrate` validates existing data before insertion.

---

## 14. Logging Risks & Hardening

- **Risk:** Passwords, tokens, or customer emails logged to disk/console.
- **Hardening:**
  - Sanitized logging filters out `password`, `token`, `authorization`, and secret fields.
  - Structured audit trail records administrative actions (IP, user email, action timestamp) without sensitive payloads.

---

## 15. Security Headers & Hardening

- **Configured Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production)

---

## 16. Migration Requirements

1. Provision Hostinger MySQL database and user.
2. Set `DATABASE_PROVIDER=mysql` and MySQL connection parameters in Hostinger environment.
3. Run `npm run db:migrate` to create relational tables and copy content from `db.json`.

---

## 17. Deployment Requirements

1. Node.js version >= 20.0.0.
2. Build command: `npm run build`.
3. Start command: `npm start` (or `tsx server/index.ts`).
4. Ensure persistent folder `uploads/` exists with read/write permissions (`chmod 755`).

---

## 18. Rollback Strategy

- **Code Rollback:** Revert commit in Git and trigger Hostinger redeployment.
- **Database Rollback:** Hostinger daily database snapshot or restore from `backups/local-db-before-mysql-migration.json`.
- **Media Rollback:** Retained in persistent directory; not modified by code rollbacks.

---

## 19. Final Readiness Status

| Category | Assessment | Notes |
|:---|:---:|:---|
| Database Abstraction | **PASS** | Adapter pattern with JSON dev & MySQL prod support |
| Schema & Migration | **PASS** | Relational DDL & automated data importer ready |
| Secret Management | **PASS** | Externalized to env; all hardcoded credentials purged |
| Media Persistence | **PASS** | Uploads isolated outside `dist/` with security validation |
| Authentication | **PASS** | Bcrypt cost 12, rate-limiting, secure sessions |
| API & Routing | **PASS** | Same-domain routing with SPA direct URL support |
| Smoke Tests | **PASS** | 13/13 endpoints verified green |
| Content Lifecycle | **PASS** | Full decoupling: Content updates require zero code deploys |

**OVERALL READINESS: READY FOR HOSTINGER PROVISIONING (DO NOT DEPLOY UNTIL CREDENTIALS CONFIGURED)**
