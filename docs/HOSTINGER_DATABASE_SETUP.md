# Zanzirangi House — Hostinger Database Setup Guide

This document details the exact, step-by-step procedure for provisioning and configuring the production MySQL database on Hostinger for Zanzirangi House.

---

## 1. Prerequisites in Hostinger hPanel

* Hostinger Cloud Hosting or Business Web Hosting plan.
* Active domain or subdomain configured (e.g. `zanzirangihouse.com`).
* Access to Hostinger **hPanel**.

---

## 2. Step-by-Step MySQL Database Provisioning

Follow this exact navigation path inside Hostinger hPanel:

1. **Log in to Hostinger hPanel**: Navigate to `https://hpanel.hostinger.com`.
2. **Select Website**: Click **Websites** in the top navigation and click **Manage** next to `zanzirangihouse.com`.
3. **Navigate to Databases**: In the left sidebar menu, expand **Databases** and select **Management** (or **MySQL Databases**).
4. **Create a New MySQL Database and Database User**:
   * **Database Name**: Enter database suffix, e.g. `zanzirangi`. Hostinger will prepend your system user prefix, resulting in a full database name like `u123456789_zanzirangi`.
   * **Username**: Enter username suffix, e.g. `admin` or `appuser`. Resulting full username: `u123456789_admin`.
   * **Password**: Click **Generate** to create a strong, high-entropy password (minimum 16 characters).
   * Click **Create**.
5. **Record Database Credentials Securely**:
   * **Database Name**: `u123456789_zanzirangi`
   * **Database Username**: `u123456789_admin`
   * **Database Password**: `[RECORD_PASSWORD_SECURELY]` *(Never commit this password to Git)*
   * **Database Host**: `127.0.0.1` *(IMPORTANT: Use IPv4 `127.0.0.1`, not `localhost`. On Linux systems, `localhost` attempts UNIX domain socket communication which may fail in Node.js container environments)*
   * **Database Port**: `3306`

> [!IMPORTANT]
> **No SUPER Privileges Needed:** The Zanzirangi House schema is designed strictly with standard DDL/DML (InnoDB, utf8mb4, foreign keys, indexes). It does **not** require `SUPER`, `TRIGGER`, or administrative privileges that Hostinger shared environments restrict.

---

## 3. Remote Database Access (Optional / Development Only)

If you wish to run migrations or tests directly from your local workstation connecting to the Hostinger database:
1. In hPanel → **Databases** → **Remote MySQL**.
2. Add your current public IP address or `%` (with caution).
3. If this cannot be enabled on your specific plan:
   * **Status:** `REQUIRES MANUAL HOSTINGER CONFIGURATION` (or execute migrations via SSH / Node.js web app terminal).

---

## 4. Configuring Application Environment Variables

Navigate to **Node.js Web App** in Hostinger hPanel:
1. In the sidebar, select **Advanced** → **Node.js** (or **Websites** → **Node.js**).
2. Set **Application Startup File** to `server.js`.
3. Under **Environment Variables**, configure:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_PROVIDER=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=u123456789_zanzirangi
   DB_USER=u123456789_admin
   DB_PASSWORD=[YOUR_RECORDED_PASSWORD]
   JWT_SECRET=[GENERATE_SECURE_64_CHAR_HEX]
   JWT_EXPIRES_IN=7d
   ADMIN_EMAIL=info@zanzirangihouse.com
   APP_URL=https://zanzirangihouse.com
   PUBLIC_URL=https://zanzirangihouse.com
   API_URL=https://zanzirangihouse.com/api
   MEDIA_STORAGE_PATH=./uploads
   MAX_UPLOAD_SIZE=25
   CORS_ORIGIN=https://zanzirangihouse.com
   LOG_LEVEL=info
   ```

---

## 5. Running the Migration

There are two methods to populate the database schema and initial sanctuary records:

### Method A: Automated Migration on First Boot (Recommended)
When `server.js` boots with `DATABASE_PROVIDER=mysql`, the database adapter automatically checks for the existence of `homepage_config`. If the database is empty:
* It reads `server/database/migrations/001_initial_schema.sql` and creates all 15 relational tables with InnoDB and utf8mb4.
* It seeds the baseline content (villas, video hero, gallery, SEO, reviews, centralized settings) from `server/data/db.json`.

### Method B: Manual CLI Migration via SSH
If SSH terminal access is enabled on Hostinger:
```bash
npm run db:migrate:mysql
```
Output will report exact inserted/updated record counts across all 15 tables with zero data discarded.

---

## 6. Verification Checklist

1. **Verify Health Endpoint**:
   ```bash
   curl https://zanzirangihouse.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "ok",
     "service": "Zanzirangi House CMS Engine",
     "environment": "production",
     "database": "connected",
     "provider": "mysql",
     "version": "1.0.0"
   }
   ```
2. **Verify Public Content API**:
   ```bash
   curl https://zanzirangihouse.com/api/content/homepage
   curl https://zanzirangihouse.com/api/content/villas
   curl https://zanzirangihouse.com/api/content/settings
   ```
3. **Verify Admin Dashboard Access**:
   Navigate to `https://zanzirangihouse.com/admin` and log in with your administrative credentials.
