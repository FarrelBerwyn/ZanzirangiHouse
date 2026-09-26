# Zanzirangi House — Production Smoke Test & Verification Run

**Date of Execution:** September 26, 2026  
**Test Harness:** `scripts/production-smoke-test.mjs` & `scripts/persistence-test.mjs`  
**Target Environment:** Local Production-Equivalent Mode (`http://localhost:3000`)  

---

## 1. Automated Smoke Test Suite (`npm run smoke-test`)

The smoke test verifies all 13 critical production API surfaces:

```text
====================================================
ZANZIRANGI HOUSE — PRODUCTION SMOKE TEST
Target API Base: http://localhost:3000/api
Admin User:      info@zanzirangihouse.com
====================================================

✓ PASS - 1. GET /api/health (status: online, db: connected)
✓ PASS - 2a. POST /api/auth/login (invalid creds rejected) (HTTP 401)
✓ PASS - 2b. POST /api/auth/login (valid admin auth) (role: superadmin)
✓ PASS - 3. GET /api/auth/me (email: info@zanzirangihouse.com)
✓ PASS - 4. GET /api/content/homepage (title: "Zanzirangi House...")
✓ PASS - 5. GET /api/content/villas (count: 8)
✓ PASS - 6. GET /api/content/gallery (count: 11)
✓ PASS - 7. GET /api/content/facilities (count: 6)
✓ PASS - 8. GET /api/content/testimonials (count: 5)
✓ PASS - 9. GET /api/content/videos (scenes: 7)
✓ PASS - 10. GET /api/content/seo (routes: 4)
✓ PASS - 11a. GET /api/admin/settings (unauthenticated rejected) (HTTP 401)
✓ PASS - 11b. GET /api/admin/settings (authenticated) (siteName: Zanzirangi House)

====================================================
TOTAL TESTS: 13 | PASSED: 13 | FAILED: 0
STATUS: ALL SMOKE TESTS PASSED [PASS]
====================================================
```

---

## 2. Content & Media Persistence Test Suite (`node scripts/persistence-test.mjs`)

This suite verifies that:
1. Admin edits propagate immediately to the public API without triggering code builds.
2. Changes survive server restarts and browser reloads.
3. Media uploads write directly to persistent disk storage outside `dist/`.
4. Express static file server serves uploaded media with HTTP 200.

```text
====================================================
ZANZIRANGI HOUSE — PERSISTENCE & LIFECYCLE TESTS
====================================================

✓ Admin authenticated successfully.
✓ Admin updated hero subtitle to: "GATEWAY TEST 1790433408901"
✓ Public API immediately reflected published change without code rebuild.
✓ Restored original hero subtitle: "— Private Luxury Villas in Zanzibar"
✓ Media uploaded to persistent storage: /uploads/test_persistence_1790433408911_1790433408914_d980429f.png
✓ Verified file on disk in persistent uploads: ...\uploads\test_persistence_...png
✓ Express successfully served persistent media at HTTP 200
✓ Cleaned up test media asset.

====================================================
PERSISTENCE & LIFECYCLE TESTS: ALL PASSED [PASS]
====================================================
```

---

## 3. Prerendered Physical Static Routes Verification

Running `npm run build` compiles the frontend and generates 8 physical route directories for direct SPA navigation on Hostinger without 404s:

- `dist/villas/index.html`
- `dist/dining/index.html`
- `dist/experiences/index.html`
- `dist/safari/index.html`
- `dist/about/index.html`
- `dist/contact/index.html`
- `dist/privacy/index.html`
- `dist/terms/index.html`
