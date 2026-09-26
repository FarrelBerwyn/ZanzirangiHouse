# Zanzirangi House — Hostinger Production Deployment Guide

**Target Domain:** `https://zanzirangihouse.com`  
**Architecture:** Hostinger Node.js Web Application + Cloud MySQL  

---

## 1. The Two Decoupled Lifecycles

Zanzirangi House strictly operates under **two independent lifecycles**:

### A. CODE LIFECYCLE (Engineering Deployments)
- **Actor:** Developer / DevOps Engineer.
- **Trigger:** Bug fixes, new UI layout components, engine dependency updates.
- **Workflow:** Local Git Commit → GitHub Push → Hostinger Webhook / Git Pull → `npm run build` → Process Restart.
- **Impact on Data:** **ZERO impact on CMS content or uploaded media.**

### B. CONTENT LIFECYCLE (Daily Hotel Operations)
- **Actor:** Zanzirangi Owner / General Manager / Concierge.
- **Trigger:** Changing villa rates, updating photography, changing testimonials, editing contact numbers, adjusting seasonal offers.
- **Workflow:** Navigate to `https://zanzirangihouse.com/admin` → Save Draft / Click Publish → MySQL Database updated → Public website reflects changes immediately.
- **Requirement:** **NO Git commit, NO npm build, NO Hostinger redeployment, NO File Manager editing required.**

---

## 2. Pre-Deployment Preparation Steps

Before deploying to Hostinger for the first time:

### Step 1: Create Hostinger MySQL Database
1. Log in to Hostinger hPanel > **Databases** > **MySQL Databases**.
2. Create database: e.g. `u123456789_zanzirangi`.
3. Create user: e.g. `u123456789_admin` with strong generated password.
4. Record hostname (usually `localhost` or `127.0.0.1` inside Hostinger web containers).

### Step 2: Configure Persistent Media Directory
1. Open Hostinger File Manager or SSH.
2. In the domain parent directory (e.g. `/home/u123456789/persistent/uploads/`), create the `uploads` directory.
3. Set permissions to `755` so the Node process can read and write uploaded images.

### Step 3: Configure Environment Variables in Hostinger
In Hostinger hPanel > **Node.js Web App** > **Environment Variables**, set:
- `NODE_ENV=production`
- `APP_URL=https://zanzirangihouse.com`
- `PORT=3000`
- `API_URL=https://zanzirangihouse.com/api`
- `CORS_ORIGIN=https://zanzirangihouse.com`
- `DATABASE_PROVIDER=mysql`
- `MYSQL_HOST=127.0.0.1`
- `MYSQL_DATABASE=u123456789_zanzirangi`
- `MYSQL_USER=u123456789_admin`
- `MYSQL_PASSWORD=<your-db-password>`
- `JWT_SECRET=<generated-32-char-secret>`
- `ADMIN_EMAIL=info@zanzirangihouse.com`
- `MEDIA_STORAGE_PATH=/home/u123456789/persistent/uploads`

---

## 3. First-Time Database Migration

On the production server (via Hostinger SSH or initial migration step):

```bash
# Install production dependencies
npm install --omit=dev

# Run automated MySQL schema creation and data import from baseline
npm run db:migrate
```

This automatically:
1. Executes `server/database/migrations/001_initial_schema.sql` creating all relational tables.
2. Migrates baseline data (8 villas, 11 gallery items, 6 facilities, 5 testimonials, 20 homepage sections, video reel, and SEO routes) into MySQL.
3. Sets up the primary admin user with bcrypt password protection.

---

## 4. Application Build & Launch

```bash
# Build production client bundle
npm run build

# Start the application server
npm start
```

Hostinger Passenger / PM2 runner will bind port 3000 to the public domain `https://zanzirangihouse.com`.

---

## 5. Post-Deployment Verification

1. **Verify Public Website:**
   - Open `https://zanzirangihouse.com`.
   - Verify luxury layout, hero video reel, 8 villas, and ocean photography load crisply.
2. **Verify SPA Direct Routing:**
   - Directly refresh `https://zanzirangihouse.com/villas` and `https://zanzirangihouse.com/dining`.
   - Ensure no 404 error occurs.
3. **Verify Admin Portal:**
   - Navigate to `https://zanzirangihouse.com/admin`.
   - Ensure page loads with login prompt and has `noindex, nofollow` robots meta.
4. **Verify Live Content Updates:**
   - Log into CMS, update a subtitle or testimonial, and click **Publish**.
   - Open public site in private window; confirm change is immediately live without redeploying code.
