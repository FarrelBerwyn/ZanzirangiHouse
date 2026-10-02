> **Superseded (2026-10-01):** the authoritative procedure is [docs/DEPLOYMENT.md](DEPLOYMENT.md) with the CI/CD pipeline in [docs/CICD.md](CICD.md). This file is kept for history; parts are outdated. Do not copy infrastructure identifiers from it.

# Zanzirangi House: Hostinger Production Deployment Guide

**Document Version:** 1.0.0-PHASE-4.2  
**Date:** September 28, 2026  
**Target Environment:** Hostinger Cloud / Web Hosting with Node.js & MySQL  
**Runtime Database:** `u170555096_Zanzirangi` (`srv982.hstgr.io:3306`)  
**Artifact Package:** `hostinger_deploy.zip`  

---

## 1. Production Specifications

- **Node.js Runtime Requirement:** Node.js `>= 20.x` or `22.x` (LTS recommended)
- **Startup File / Script:** `server.js` (or `npm start`)
- **Build Command (Local):** `npm run build`
- **Packaging Command (Local):** `npm run package:hostinger`
- **Application Port:** Automatically adapts to `process.env.PORT` assigned by Hostinger (default local fallback: `3000`)
- **Database Engine:** Hostinger MySQL / MariaDB (already populated with 19 tables and live production content)

---

## 2. Required Hostinger Environment Variables

Configure these variables directly inside **Hostinger hPanel $\rightarrow$ Websites $\rightarrow$ Manage $\rightarrow$ Node.js $\rightarrow$ Environment Variables**:

| Variable Name | Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables strict production optimizations and disables JSON database fallback |
| `DATABASE_PROVIDER` | `mysql` | Strictly forces MySQL connection. Silent JSON fallback is strictly prohibited |
| `DB_HOST` | `srv982.hstgr.io` *(or `localhost` if on same container)* | Hostinger MySQL hostname |
| `DB_PORT` | `3306` | MySQL TCP service port |
| `DB_NAME` | `u170555096_Zanzirangi` | Hostinger production database name |
| `DB_USER` | `u170555096_admindatabase` | Hostinger production database username |
| `DB_PASSWORD` | `<HOSTINGER_DATABASE_PASSWORD>` | Set privately in hPanel. Never commit to Git or ZIP |
| `PORT` | `<HOSTINGER_ASSIGNED_PORT>` | Injected automatically by Hostinger Node.js manager |
| `JWT_SECRET` | `<CUSTOM_STRONG_SECRET_2026>` | Secret key for signing 7-day administrative sessions |
| `APP_URL` | `https://zanzirangihouse.com` | Primary production domain |
| `PUBLIC_URL` | `https://zanzirangihouse.com` | Public canonical origin |
| `API_URL` | `https://zanzirangihouse.com/api` | API route base |
| `MEDIA_STORAGE_PATH` | `./uploads` | Persistent directory for media uploads outside `dist/` |
| `MAX_UPLOAD_SIZE` | `25` | Maximum allowed media upload size in megabytes |
| `CORS_ORIGIN` | `https://zanzirangihouse.com` | Allowed CORS origins (never `*` in production) |

---

## 3. Deployment Artifact: `hostinger_deploy.zip`

### What is Included in the ZIP:
- `dist/`: Pre-compiled production client bundle, minified assets, and 8 generated SEO sitelink physical routes.
- `server.js`: Standalone production Express backend bundle (compiled with esbuild).
- `package.json` & `package-lock.json`: Production dependency registry for Hostinger container execution.
- `uploads/`: Dedicated media directory containing persistent assets and security `.htaccess`.
- `public/`: Favicons, `robots.txt`, `sitemap.xml`, and core brand media.
- `.env.example`: Reference configuration template with safe placeholders only.
- `.htaccess`: Apache / LiteSpeed reverse proxy and static asset handling rules.

### Strictly Excluded from the ZIP:
- `node_modules/`: Installed freshly on Hostinger if required.
- `.env` & `.env.local`: Private developer secrets.
- `.git/`: Version control history.
- `src/` & `server/`: Raw TypeScript source code (already compiled into `dist/` and `server.js`).
- `scripts/`: Local testing and migration scripts.
- `server/data/db.json`: Not needed for production MySQL runtime.

---

## 4. Step-by-Step Hostinger Deployment Procedure

### Step 4.1: Build & Package Locally
Execute in the local project root:
```bash
npm run build
npm run package:hostinger
```
This generates `hostinger_deploy.zip` (~20 MB) after passing an automated secret scan.

### Step 4.2: Upload to Hostinger
1. Log in to [Hostinger hPanel](https://hpanel.hostinger.com).
2. Navigate to **Websites $\rightarrow$ Manage $\rightarrow$ File Manager** (or connect via SFTP).
3. Open the application root directory (typically `public_html/` or `/home/u170555096/domains/zanzirangihouse.com/`).
4. Upload `hostinger_deploy.zip`.
5. Extract the ZIP into the application root directory.
6. Verify that `dist/`, `server.js`, `package.json`, and `uploads/` are visible in the root.

### Step 4.3: Configure Node.js Web App in hPanel
1. In hPanel, navigate to **Advanced $\rightarrow$ Node.js**.
2. Set **Node.js version** to `20.x` or `22.x`.
3. Set **Application root** to the directory where files were extracted (`/public_html` or `/`).
4. Set **Application startup file** to `server.js`.
5. Under **Environment variables**, input all variables from Section 2 above (especially `NODE_ENV=production`, `DATABASE_PROVIDER=mysql`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`).
6. Click **Save** and **Install Dependencies** (if prompted by Hostinger to run `npm install --omit=dev`).
7. Click **Start / Restart Application**.

---

## 5. Post-Deployment Verification Protocol

### Step 5.1: Health Check Verification
Visit in any browser:
```text
https://zanzirangihouse.com/health
```
**Expected Response (HTTP 200):**
```json
{
  "status": "ok",
  "database": {
    "provider": "mysql",
    "connected": true
  },
  "service": "Zanzirangi House CMS Engine",
  "version": "1.0.0"
}
```

### Step 5.2: Public Content Read
Visit:
```text
https://zanzirangihouse.com/api/content/homepage
```
Verify that `hero.title`, `hero.slides`, and `sections` are retrieved directly from Hostinger MySQL.

### Step 5.3: Admin Portal Verification
1. Navigate to `https://zanzirangihouse.com/admin`.
2. Log in using authorized credentials (`info@zanzirangihouse.com`).
3. Open the **Homepage Editor**.
4. Test a live edit:
   - Change Hero Title temporarily.
   - Click **Publish Live**.
   - Confirm green success toast.
   - Open `https://zanzirangihouse.com` in a separate tab or mobile device.
   - Verify the updated title appears instantly without rebuilds or Git pushes.
5. **Restore** the title back to its original value in the Admin Editor and click **Publish Live**.

---

## 6. Zero-Redeploy Runtime Guarantee

Once `hostinger_deploy.zip` is deployed:
- All content updates (villas, photos, prices, text, SEO) are managed exclusively through the Admin Portal (`/admin`).
- Changes commit directly to Hostinger MySQL and are immediately visible to public guests.
- **NO further ZIP uploads or server restarts are required for everyday content management.**

---

## 7. Security Best Practices

1. **Never print or log `DB_PASSWORD`:** Express logging and error handlers are hardened to sanitize credentials.
2. **Execution Lockdown:** The `uploads/` directory contains an automated `.htaccess` preventing execution of `.php`, `.cgi`, or scripts.
3. **Database Safeguard:** Never execute `db:migrate:mysql` or destructive SQL on a populated production database. The database is already verified and active.
