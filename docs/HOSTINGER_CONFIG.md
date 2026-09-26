# Zanzirangi House — Hostinger Production Deployment Profile

**Project:** Zanzirangi House Luxury Villas Retreat  
**Production Domain:** `https://zanzirangihouse.com`  
**Configuration Profile:** Hostinger Node.js Web Application  

---

## 1. Core Profile Parameters

| Field | Configuration Value | Description |
|:---|:---|:---|
| **Application Type** | Node.js Web Application | Long-running backend process serving both API & static SPA assets |
| **Framework** | Express 5.x + React 19 / Vite 6 | Express handles API, authentication, media routing; Vite bundles client |
| **Node.js Engine** | `>=20.0.0` (Recommended: `22.x LTS`) | Specified in `package.json` engines |
| **Build Command** | `npm run build` | Compiles Vite client into `dist/` and runs `scripts/generate_routes.js` |
| **Start Command** | `npm start` | Launches `tsx server/index.ts` production Express application server |
| **Entry File** | `server/index.ts` | Main Express server entry point |
| **Root Directory** | `/` (Repository Root) | Project root containing `package.json` |
| **Output Directory** | `dist` | Contains compiled frontend assets served statically by Express |
| **Public URL** | `https://zanzirangihouse.com` | Primary HTTPS public guest-facing domain |
| **Admin Portal** | `https://zanzirangihouse.com/admin` | Restricted CMS manager portal (no visible public links) |
| **API Base URL** | `https://zanzirangihouse.com/api` | Express REST API endpoints |
| **Database Engine** | Hostinger Cloud MySQL | Relational CMS persistence (replaces local `db.json`) |
| **Persistent Media** | External Uploads Directory | Outside `dist/` to survive redeployments |

---

## 2. Directory Structure on Hostinger

```text
/home/u123456789/
├── domains/
│   └── zanzirangihouse.com/
│       ├── public_html/          <- Optional symlink or proxy target
│       ├── app/                  <- Application Code (Git Clone)
│       │   ├── server/           <- Express API, DB adapters, auth
│       │   ├── src/              <- React frontend source code
│       │   ├── dist/             <- Built static frontend assets
│       │   ├── package.json
│       │   └── ...
│       └── persistent/
│           └── uploads/          <- Persistent media storage (NEVER WIPE)
```

---

## 3. Hostinger Node.js Environment Settings

In Hostinger hPanel > **Advanced** > **Node.js Web App**:

- **Node.js Version:** `20.x` or `22.x`
- **Application Mode:** `Production`
- **Application Root:** `app` (or repository root path)
- **Application Startup File:** `server/index.ts` (or `node_modules/.bin/tsx server/index.ts`)

---

## 4. Production Environment Variables Reference

| Variable | Recommended Production Value | Sensitive |
|:---|:---|:---:|
| `NODE_ENV` | `production` | No |
| `APP_URL` | `https://zanzirangihouse.com` | No |
| `PORT` | `3000` (or `$PORT` assigned by Hostinger) | No |
| `API_URL` | `https://zanzirangihouse.com/api` | No |
| `CORS_ORIGIN` | `https://zanzirangihouse.com` | No |
| `DATABASE_PROVIDER` | `mysql` | No |
| `MYSQL_HOST` | `127.0.0.1` (or Hostinger DB Host) | Yes |
| `MYSQL_PORT` | `3306` | No |
| `MYSQL_DATABASE` | `u123456789_zanzirangi` | Yes |
| `MYSQL_USER` | `u123456789_admin` | Yes |
| `MYSQL_PASSWORD` | `<Hostinger Generated Password>` | **YES** |
| `JWT_SECRET` | `<32+ Character Cryptographic String>` | **YES** |
| `JWT_EXPIRES_IN` | `7d` | No |
| `ADMIN_EMAIL` | `info@zanzirangihouse.com` | No |
| `MEDIA_STORAGE_PATH` | `/home/u123456789/persistent/uploads` | Yes |
| `MAX_UPLOAD_SIZE_BYTES` | `10485760` (10 MB) | No |
| `MAX_VIDEO_UPLOAD_SIZE_BYTES` | `52428800` (50 MB) | No |
| `LOG_LEVEL` | `info` | No |
