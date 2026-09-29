# Zanzirangi House CMS: Live Update Architecture (Zero-Redeploy Pipeline)

**Document Version:** 1.0.0-PRE-PHASE-4  
**Date:** September 28, 2026  
**Target:** Hostinger Node.js & MySQL Production Environment  

---

## 1. Architectural Objective

The goal of Zanzirangi House CMS is to operate as an enterprise-grade, fully dynamic, database-driven hospitality platform where:

```
Admin edits content in Portal
            ↓
Click [Save Changes]
            ↓
API validates & executes MySQL transaction
            ↓
Database commits change to Hostinger MySQL
            ↓
Public API returns fresh MySQL data
            ↓
Public website reflects changes instantly
```

**CRITICAL PRODUCTION GUARANTEES:**
- **NO GitHub redeployment** is ever needed for content changes.
- **NO Vite rebuild (`npm run build`)** is ever needed for content changes.
- **NO manual source code editing** is ever needed for content changes.
- **NO process restart (`pm2 restart` / `node server.js restart`)** is needed for content changes.

---

## 2. Decoupling Code vs. Content

In legacy static site generators or Jamstack architectures, content updates require rebuilding the application bundle because markdown or JSON is compiled into static JavaScript chunks at build time.

Zanzirangi House achieves zero-redeploy updates through strict decoupling:

```
+-------------------------------------------------------------+
|                VITE FRONTEND BUNDLE (STATIC)                |
|  - Layouts, React components, CSS & Design System           |
|  - Animation hooks, iconography, navigation logic           |
|  - Deployed ONCE during software version upgrades           |
+-------------------------------------------------------------+
                              │
                    Dynamic HTTP API Fetch
                    (/api/content/homepage)
                              ▼
+-------------------------------------------------------------+
|              EXPRESS CMS RUNTIME API (DYNAMIC)              |
|  - Validates authentication & permissions                   |
|  - Enforces input schemas & business logic                  |
|  - Queries Hostinger MySQL connection pool                  |
+-------------------------------------------------------------+
                              │
                    ACID SQL Transaction
                              ▼
+-------------------------------------------------------------+
|              HOSTINGER MYSQL DATABASE (DYNAMIC)             |
|  - 19 Normalized Relational Tables                          |
|  - Persistent storage across all sessions and restarts      |
+-------------------------------------------------------------+
```

---

## 3. The 6-Step Live Update Pipeline

### Step 1: Content Modification in Admin UI
An authorized concierge or administrator logs into `/admin` and opens any content editor (e.g., Homepage Editor, Villas Manager, Testimonials). They modify a field (for example, adjusting the Hero Title from *"Zanzibar Luxury Villa"* to *"Zanzibar Private Ocean Pool Villas"*).

### Step 2: Authenticated JSON Mutation
Upon clicking **Save Changes**, the Admin UI issues a `PUT /api/admin/homepage` request containing:
- The updated JSON entity.
- The `Authorization: Bearer <JWT>` header.
- The browser cookie `zanzirangi_admin_token`.

### Step 3: Server-Side Validation & Transaction
The Express endpoint (`server/api.ts`) processes the request:
1. `authenticateAdmin` middleware validates the JWT token and verifies that the user still exists in the MySQL `users` table.
2. The endpoint calls `homepageRepository.updateHomepage(data, userEmail)`.
3. The repository utilizes `MysqlDatabaseAdapter` which acquires a connection from the pool and opens an ACID transaction:
   ```sql
   START TRANSACTION;
   UPDATE homepage_config 
   SET hero_title = ?, meta_last_updated = NOW(), meta_updated_by = ? 
   WHERE id = 1;
   INSERT INTO audit_logs (action, user_email, details) 
   VALUES ('HOMEPAGE_UPDATED', ?, 'Updated homepage configuration');
   COMMIT;
   ```
4. If any error occurs, the transaction rolls back cleanly (`ROLLBACK`), preventing partial or corrupted data.

### Step 4: Server Responds with Persisted Truth
The server does **not** assume success; it re-reads the committed row from MySQL and sends the fresh data back in the HTTP response:
```json
{
  "success": true,
  "data": {
    "hero": {
      "title": "Zanzibar Private Ocean Pool Villas",
      ...
    }
  },
  "message": "Homepage configuration saved successfully."
}
```

### Step 5: Admin UI Synchronizes
The Admin UI receives the HTTP 200 payload and updates its React state directly from `response.data`. A green confirmation toast indicates that the database commit succeeded.

### Step 6: Instant Public Consumption
When any guest visits the public website or navigates between pages:
1. `src/App.tsx` triggers `contentApi.getHomepage()`.
2. The browser executes `GET /api/content/homepage`.
3. The response includes `Cache-Control: no-cache, no-store, must-revalidate`.
4. The Express API executes `SELECT * FROM homepage_config WHERE id = 1` against MySQL.
5. The public visitor immediately sees the updated Hero Title.

---

## 4. Why Stale Content Cannot Occur

1. **No In-Memory Server Caching:** Node.js does not store API responses in memory variables. Every API call executes a query against MySQL.
2. **No Proxy Caching:** HTTP headers instruct Hostinger LiteSpeed web servers and intermediate CDNs never to cache `/api/*` responses.
3. **No Build-Time Compilation of Copy:** Content is not embedded into static Vite `.js` bundles.

---

## 5. Summary Verification
This architecture was verified end-to-end in automated test suite [`scripts/test-cms-pipeline-hardening.ts`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/scripts/test-cms-pipeline-hardening.ts), proving 100% immediate reflection across Admin, MySQL, and Public API layers with zero redeployment.
