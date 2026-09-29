# Zanzirangi House CMS: Media Storage Forensic Audit & Architecture

**Document Version:** 1.0.0-PRE-PHASE-4  
**Date:** September 28, 2026  
**Target:** Hostinger File Storage & MySQL Database (`media_assets`)  
**Status:** AUDITED, LOCATED & SYNCHRONIZED  

---

## 1. Executive Summary

During Phase 3, the database references for 4 media assets were successfully migrated from `server/data/db.json` into the Hostinger MySQL `media_assets` relational table.

This forensic audit verifies:
1. The exact physical location and accessibility of every media record currently registered in MySQL.
2. The storage architecture for new media uploaded by administrators via the CMS Admin Portal.
3. The persistence boundary ensuring uploaded files remain persistent across deployments and are never destroyed by Vite builds or directory cleanups.

---

## 2. Inventory of Registered Media Assets

The script [`scripts/audit-media-storage.ts`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/scripts/audit-media-storage.ts) performed a physical audit against the live MySQL table `media_assets` and the local/remote filesystem:

| Asset ID | Filename | Mime Type | Size | Registered URL | Storage Type | Physical File Status | Public Accessibility |
|---|---|---|---|---|---|---|---|
| `med-01` | `hero-ocean-plunge.jpg` | `image/jpeg` | 1.25 MB | `https://images.unsplash.com/photo-1582719508461-905c673771fd...` | Remote CDN | Hosted on Unsplash CDN | **Accessible (200 OK)** |
| `med-02` | `zanzirangi-villas.jpg` | `image/jpeg` | 470 KB | `./zanzirangi-villas.jpg` | Local Static / Upload | Synced to `public/` & `uploads/` | **Accessible** |
| `med-03` | `infinity-pool-reef.jpg` | `image/jpeg` | 980 KB | `https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7...` | Remote CDN | Hosted on Unsplash CDN | **Accessible (200 OK)** |
| `med-04` | `Zanzirangi-home.mp4` | `video/mp4` | 1.68 MB | `./Zanzirangi-home.mp4` | Local Video Asset | Synced to `public/` & `uploads/` | **Accessible** |

### Audit Findings & Remediations:
- `med-01` & `med-03`: Stored on high-speed Unsplash CDN infrastructure. Zero missing file risk.
- `med-02`: Exists in project `public/zanzirangi-villas.jpg` and has been copied into `uploads/` for uniform static server delivery.
- `med-04`: Was located in `src/data/Zanzirangi-home.mp4` and has been synchronized to both `public/Zanzirangi-home.mp4` and `uploads/Zanzirangi-home.mp4`, ensuring immediate availability in both Vite dev mode and production Express static serving.

---

## 3. Media Upload Architecture & Storage Abstraction

The storage abstraction is implemented in [`server/storage/index.ts`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/server/storage/index.ts):

```
                  MediaService / Admin Upload API
                                 ↓
                        MediaStorageAdapter
                                 ├── LocalMediaStorage (Development)
                                 └── HostingerMediaStorage (Production)
                                         ↓
                              Persistent /uploads Directory
                              (Configured via MEDIA_STORAGE_PATH)
```

### 3.1 HostingerMediaStorage Enforcement
[`server/storage/HostingerMediaStorage.ts`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/server/storage/HostingerMediaStorage.ts) specializes storage for Hostinger Cloud/cPanel hosting:
1. **Directory Isolation:** Files are written to a dedicated directory specified by `process.env.MEDIA_STORAGE_PATH` (defaults to `/uploads` in the application root, **outside** `dist/`).
2. **Execution Lockdown (.htaccess):** Automatically drops an Apache/LiteSpeed `.htaccess` configuration inside the storage folder:
   ```apache
   <FilesMatch "\.(php|phtml|php3|php4|php5|phps|pl|py|cgi|sh|bash|exe)$">
     Order Allow,Deny
     Deny from all
   </FilesMatch>
   Options -ExecCGI -Indexes
   RemoveHandler .php .phtml .php3 .php4 .php5 .phps
   RemoveType .php .phtml .php3 .php4 .php5 .phps
   ```
   This prevents any remote execution vulnerabilities while permitting fast HTTP streaming of images and MP4 videos.

### 3.2 Public Delivery
In [`server/api.ts`](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/server/api.ts#L48):
```typescript
apiApp.use('/uploads', express.static(mediaStorage.getStorageDirectory()));
```
All persistent files in `/uploads` are served directly by Express with proper MIME headers.

---

## 4. End-to-End Media Upload Lifecycle

When an administrator uploads a new photo or video in the Admin Media Library:

1. **Admin UI (`src/admin/pages/AdminMediaLibrary.tsx`):**
   - User drops an image or video file.
   - Client validates size (`< 25MB`) and supported MIME types (`image/*`, `video/*`).
   - Converts file to Base64 payload and sends `POST /api/admin/media/upload`.

2. **API Handler (`server/api.ts`):**
   - Validates user JWT and admin role.
   - Decodes Base64 buffer and generates sanitized timestamped filename.
   - Calls `mediaStorage.saveFile(buffer, filename, mimeType)`.

3. **Storage Layer (`HostingerMediaStorage.ts`):**
   - Writes file to persistent filesystem `/uploads/<timestamp>-<filename>`.
   - Returns `{ filename, url: '/uploads/...', size, mimeType }`.

4. **MySQL Database Registration (`MysqlDatabaseAdapter.ts`):**
   - Inserts record into `media_assets` table:
     ```sql
     INSERT INTO media_assets (id, filename, mime_type, size_bytes, url, public_url, alt_text)
     VALUES (?, ?, ?, ?, ?, ?, ?);
     ```
   - Logs `MEDIA_UPLOADED` action into `audit_logs`.

5. **Immediate Availability:**
   - React state appends the new asset record from the API response.
   - Public components can immediately reference the new URL.

---

## 5. Classification of Media Health

- **Database References:** 100% Valid (4 records in MySQL `media_assets`).
- **Physical Asset Integrity:** 100% Valid (2 remote CDN assets active; 2 local assets physically verified in `public/` and `uploads/`).
- **Upload Pipeline:** 100% Ready (persistent storage path outside `dist/`, security lockdown `.htaccess` configured).
