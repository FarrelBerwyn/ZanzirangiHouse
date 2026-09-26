# Zanzirangi House — Pre-Deployment Master Checklist

**Target Release:** Production v1.0.0  
**Target Environment:** Hostinger Node.js Web App  
**Domain:** `https://zanzirangihouse.com`  

Every item in this checklist must be reviewed and marked `[X]` before initiating the production deployment to Hostinger.

---

## 1. Codebase & Git Cleanliness
- [x] **Git Clean:** Working directory clean, no untracked scratch files or uncommitted modifications.
- [x] **No Secrets Committed:** Verified zero plaintext passwords, API keys, or JWT secrets in git history or tracked files.
- [x] **`.env.example` Ready:** Generic documentation template provided; real secrets externalized to Hostinger panel.
- [x] **No Machine-Specific Paths:** Zero occurrences of `D:\`, `C:\`, `file://`, or hardcoded Windows backslash paths in production code.
- [x] **No `localhost` in Production Code:** Client-side uses relative `/api/*` routes; server dynamically resolves canonical domain `https://zanzirangihouse.com`.

---

## 2. Build & Runtime Validation
- [x] **Build Passes:** `npm run build` compiles without errors.
- [x] **Engines Defined:** `package.json` specifies `"node": ">=20.0.0"`.
- [x] **SPA Route Prerendering:** All 8 physical static route folders generated (`/villas`, `/dining`, `/experiences`, etc.) to prevent 404s on direct refresh.
- [x] **Clean Dependency Tree:** No dev dependencies required at production runtime.

---

## 3. Database & Migration Preparedness
- [x] **MySQL Schema Ready:** Relational DDL with indexes and foreign keys in `server/database/migrations/001_initial_schema.sql`.
- [x] **Migration Tested:** `npm run db:migrate` successfully translates JSON into relational records with count parity.
- [x] **No Reset on Startup:** Normal startup (`npm start`) strictly checks and reads data; **never drops or resets tables**.
- [x] **Pre-Migration Backup:** Offline backup safely archived at `backups/local-db-before-mysql-migration.json`.

---

## 4. Security & Authentication
- [x] **Admin Credential Rotated:** Default development password removed; rotated with high-entropy cryptographic password and bcrypt cost 12.
- [x] **JWT Secret Externalized:** `server/config/env.ts` enforces 32+ character secret in production.
- [x] **CORS Policy Hardened:** Restricted strictly to `https://zanzirangihouse.com` (no wildcard `*`).
- [x] **Rate Limiting Active:** `express-rate-limit` protects `/api/auth/login` from brute force.
- [x] **Security Headers Active:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, HSTS enabled.
- [x] **Admin Route Isolation:** `/admin` protected with authentication and meta `noindex, nofollow`; zero public navigation links.

---

## 5. Media & Storage Architecture
- [x] **Persistent Upload Storage:** Storage directory located outside `dist/` (e.g. `/persistent/uploads/`).
- [x] **Redeployment Safety:** Application code rebuilds do not touch or erase uploaded media files.
- [x] **Upload Sanitization:** Executable files (`.php`, `.js`, `.sh`, `.exe`) strictly blocked; MIME types validated.
- [x] **Path Traversal Protection:** Filenames sanitized with cryptographically unique hashes and path resolution guards.

---

## 6. Verification & Automated Tests
- [x] **Smoke Test Passed:** 13/13 endpoints verified via `npm run smoke-test`.
- [x] **Persistence Test Passed:** Verified admin edit → immediate public visibility → restart survival via `node scripts/persistence-test.mjs`.
- [x] **Health Endpoint Verified:** `GET /api/health` reports status `online`, database `connected`, leaking no credentials.
- [x] **Rollback Plan Documented:** Step-by-step procedure documented in `docs/ROLLBACK_PLAN.md`.

---

**SIGN-OFF STATUS: APPROVED FOR NEXT HOSTINGER PRODUCTION DEPLOYMENT**
