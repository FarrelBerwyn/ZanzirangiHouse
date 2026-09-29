# Zanzirangi House CMS: Cache Invalidation & Freshness Policy

**Document Version:** 1.0.0-PRE-PHASE-4  
**Date:** September 28, 2026  
**Target:** Hostinger MySQL Production Engine  
**Objective:** Guarantee immediate visibility of Admin content changes without stale caching, rebuilds, or redeployments.

---

## 1. Core Principle: Zero-Stale Content Guarantee

In Zanzirangi House CMS, content updates performed by authorized administrators must become visible immediately across both administrative and public interfaces. The system adheres to the principle:

> **"A committed MySQL write must be immediately readable by the very next API request without any intervening cache invalidation latency."**

---

## 2. Forensic Cache Audit Across the Application Stack

| Layer | Cache Mechanism | Audit Result | Invalidation Strategy |
|---|---|---|---|
| **Client State Library** | React Query / SWR / Apollo | **NOT USED** in codebase. No background stale-while-revalidate caching. | N/A (Direct `useState` + `useEffect` fetch pattern) |
| **Browser Storage** | `localStorage` / `sessionStorage` | **AUDITED & CLEAN**. Only UI preferences are stored (`zanzirangi_lang` for language, `zanzirangi_theme` for dark mode, `zanzirangi_token` for admin JWT). **Zero CMS content** is stored in browser storage. | N/A |
| **HTTP Dynamic API Headers** | Browser & Intermediate Proxies (LiteSpeed / Cloudflare) | **HARDENED**. Global Express security middleware in `server/api.ts` enforces:<br>`Cache-Control: no-cache, no-store, must-revalidate`<br>`Pragma: no-cache`<br>`Expires: 0` | Browsers, edge CDNs, and proxies are strictly instructed to bypass caching for all `/api/*` endpoints. Every public page load fetches fresh data from MySQL. |
| **Server-Side In-Memory Cache** | Node.js process / Redis / Memcached | **NOT USED**. Repositories execute direct parameterized SQL queries via connection pool (`getMysqlPool()`). | Invalidation is immediate upon SQL `COMMIT`. |
| **SPA / Vite Build Artifacts** | Static JSON / Bundle Constants | **DECOUPLED**. Migrated content is retrieved dynamically from the API at runtime. The public website does not bake CMS copy into static bundle constants. | Zero Vite rebuilds or Git redeployments required for content edits. |
| **Physical Media Assets** | Images, videos, documents in `/uploads` | **IMMUTABLE WITH CACHING**. Uploaded media files receive unique timestamps / hashes (`med-${Date.now()}`). Served with standard static cache headers. | Cache-busted via unique URL if modified or re-uploaded. |

---

## 3. The Live Invalidation & Update Lifecycle

When an administrator updates any content module in the CMS Admin Portal (e.g., modifying Hero Title, adjusting Villa pricing, or toggling facility visibility):

```
1. Admin UI Action
   └─ Administrator edits field and clicks [Save Changes].

2. Authenticated Mutation
   └─ Client sends PUT/POST to `/api/admin/*` with Bearer JWT token.

3. Server-Side Transaction
   └─ Express handler verifies JWT and user authorization against MySQL `users`.
   └─ Repositories open connection pool transaction (`BEGIN TRANSACTION`).
   └─ Parent entity is updated (`UPDATE` or `INSERT ... ON DUPLICATE KEY UPDATE`).
   └─ Children relations are synchronized (`DELETE` + `INSERT` for child tables).
   └─ Audit log entry is appended to `audit_logs` table.
   └─ `COMMIT` executed.

4. Server Response Verification
   └─ Server re-reads the persisted entity directly from MySQL and returns `{ success: true, data: persistedRecord }`.

5. Admin UI Local Sync
   └─ React component updates its state from the server response (NOT optimistic local state).

6. Public Propagation
   └─ Because `/api/content/*` endpoints enforce `Cache-Control: no-cache, no-store, must-revalidate`, 
      any visitor refreshing or navigating to the public page triggers a fresh HTTP GET.
   └─ The API queries MySQL and returns the newly committed record.
   └─ No CDN purge, server restart, or build step is needed.
```

---

## 4. Client-Side Freshness in Public SPA (`src/App.tsx`)

In [`src/App.tsx`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/src/App.tsx):
- The `refreshPublicContent()` routine triggers on initial mount and route transitions.
- Each service call (`contentApi.getHomepage()`, `contentApi.getVillas()`, etc.) fetches live data from the API.
- If an admin is testing changes in a split browser window, refreshing the public page instantly retrieves the updated MySQL data.

---

## 5. Summary Policy Directives

1. **Never add in-memory server caching** without explicit TTL and active invalidation webhooks.
2. **Never cache `/api/content/*` responses** with HTTP `max-age > 0`.
3. **Always serve API responses with `no-cache, no-store, must-revalidate`**.
4. **Never store editable CMS content in `localStorage` or `sessionStorage`**.
5. **Always update React admin state from the authoritative server response**.
