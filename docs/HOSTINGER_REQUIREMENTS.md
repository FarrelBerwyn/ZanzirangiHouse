# Zanzirangi House — Hostinger Plan & Infrastructure Requirements

**Target Domain:** `https://zanzirangihouse.com`  
**Application Architecture:** Express 5 Application Server + React 19 Frontend + MySQL 8.0  

---

## 1. Required Hostinger Hosting Capabilities

To successfully host Zanzirangi House without data loss or service degradation, the Hostinger hosting account must satisfy the following minimum technical specifications:

| Requirement | Minimum Required | Recommended | Purpose | Status |
|:---|:---|:---|:---|:---:|
| **Hostinger Service Type** | Cloud Hosting / VPS / Business Web Hosting (with Node.js Web App feature) | Cloud Startup or Cloud Professional | Enables running persistent background Node.js Express server process | **COMPATIBLE** |
| **Node.js Engine** | Node.js v20.x LTS | Node.js v22.x LTS | Runtime for Express API server and SSR/static asset serving | **COMPATIBLE** |
| **Database Server** | MySQL 8.0+ or MariaDB 10.6+ | MySQL 8.0 (Hostinger Cloud Database) | Relational CMS content persistence, foreign keys, transactions | **COMPATIBLE** |
| **Database Connections** | Minimum 15 concurrent pool connections | 30+ pool connections | Express connection pooling with `mysql2` | **COMPATIBLE** |
| **Persistent Filesystem** | Writable directory outside Git root | Dedicated `/persistent/uploads` directory (chmod 755) | Storing uploaded media files across application redeployments | **COMPATIBLE** |
| **Disk Storage** | 10 GB SSD | 50+ GB NVMe | Accommodates high-resolution villa photography & brand video reel | **COMPATIBLE** |
| **Memory (RAM)** | 1 GB RAM minimum | 2 GB+ RAM | Build execution (`npm run build`) and Node.js process runtime | **COMPATIBLE** |
| **SSL / HTTPS** | Let's Encrypt SSL (Included in Hostinger) | Lifetime SSL with auto-renewal | HTTPS encryption for all public visits and secure admin cookies | **COMPATIBLE** |
| **HTTP Routing** | Port 80/443 Reverse Proxy to Node Port | Nginx / OpenLiteSpeed Passenger Proxy | Same-domain routing for `/` and `/api/*` | **COMPATIBLE** |
| **Environment Variables** | Web-based or `.env` configuration | Encrypted hostinger environment panel | Managing `JWT_SECRET`, `MYSQL_PASSWORD`, etc. without code commits | **COMPATIBLE** |

---

## 2. Plan Compatibility Matrix

| Hostinger Plan Tier | Node.js Support | MySQL Support | Persistent Uploads | Status |
|:---|:---:|:---:|:---:|:---:|
| **Single Shared Web Hosting** | ❌ No Node.js process | ✅ Yes | ❌ Build wipes uploads | **BLOCKED** |
| **Premium Web Hosting** | ⚠️ Limited Node.js | ✅ Yes | ⚠️ Restricted | **PARTIAL** |
| **Business Web Hosting** | ✅ Node.js Web App | ✅ Yes | ✅ Supported | **READY** |
| **Cloud Startup / Professional** | ✅ Full Node.js App | ✅ Cloud MySQL | ✅ Full Dedicated Storage | **OPTIMAL / READY** |
| **KVM VPS** | ✅ Full Root Access | ✅ Dedicated MySQL | ✅ Full Dedicated Storage | **OPTIMAL / READY** |

---

## 3. Hostinger Environment Variables Checklist

The following variables must be configured in the Hostinger control panel prior to starting the production application:

```ini
NODE_ENV=production
APP_URL=https://zanzirangihouse.com
PORT=3000
API_URL=https://zanzirangihouse.com/api
CORS_ORIGIN=https://zanzirangihouse.com

DATABASE_PROVIDER=mysql
MYSQL_HOST=127.0.0.1 (or Hostinger MySQL Hostname)
MYSQL_PORT=3306
MYSQL_DATABASE=u123456789_zanzirangi
MYSQL_USER=u123456789_admin
MYSQL_PASSWORD=<hostinger-generated-secure-password>

JWT_SECRET=<min-32-character-cryptographic-random-secret>
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=info@zanzirangihouse.com

MEDIA_STORAGE_PATH=/home/u123456789/persistent/uploads
MAX_UPLOAD_SIZE_BYTES=10485760
MAX_VIDEO_UPLOAD_SIZE_BYTES=52428800
LOG_LEVEL=info
```

---

## 4. Verification Check Before Next Deployment

If using Hostinger Business Web Hosting or Cloud Hosting with the **Node.js Web App** feature:
1. Verify the Node.js version selector is set to **20.x** or **22.x**.
2. Verify the application root points to repository root and startup file is set to `server/index.ts` (or `tsx server/index.ts`).
3. Verify the external database is provisioned and reachable via Hostinger Database Management.
