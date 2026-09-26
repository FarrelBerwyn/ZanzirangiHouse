# Zanzirangi House — Production Rollback & Disaster Recovery Plan

**Target System:** Zanzirangi House (`https://zanzirangihouse.com`)  
**Scope:** Application Code, MySQL Database, and Persistent Media  

---

## 1. Rollback Scenarios & Matrix

| Incident Type | Impact | Recovery Target | Maximum RTO (Time) | Recovery Strategy |
|:---|:---|:---|:---:|:---|
| **Defective Code Deployment** | Frontend UI bug, React crash, or Node startup error | Previous Stable Git Commit | < 5 minutes | Revert commit, trigger Hostinger redeployment. Database & uploads left untouched. |
| **Database Migration Failure** | Schema creation error or corrupted migration script | Pre-Migration Database State | < 10 minutes | Restore Hostinger automated snapshot or re-run migration against baseline backup. |
| **Accidental Content Deletion** | Admin mistakenly deleted villa or content section | Last Known Good CMS Content | < 15 minutes | Restore from table backup or import from `backups/local-db-before-mysql-migration.json`. |
| **Hostinger Server Disaster** | VPS or container failure | Full System Restore | < 30 minutes | Re-deploy code to new container, attach MySQL database, restore `/uploads` from backup. |

---

## 2. Procedure A: Application Code Rollback

If a newly deployed code change introduces an unexpected error in production:

1. **Identify Previous Working Commit:**
   ```bash
   git log -n 5 --oneline
   ```
2. **Revert to Previous Commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Trigger Hostinger Webhook or Git Pull:**
   - In Hostinger hPanel > **Node.js Web App**, click **Deploy** (or run `git pull && npm run build`).
4. **Restart Node Process:**
   - Click **Restart Application** in Hostinger hPanel.
5. **Verify Health:**
   - Run `curl -I https://zanzirangihouse.com/api/health` — must return HTTP 200.

*Note: Database content and persistent media files are stored outside the code tree and are completely unaffected by code rollbacks.*

---

## 3. Procedure B: Database Rollback

If a database schema change or migration fails:

### Option 1: Hostinger Cloud Database Snapshot (Recommended)
1. Open Hostinger hPanel > **Databases** > **Backups**.
2. Select the daily snapshot prior to the migration.
3. Click **Restore**.

### Option 2: Restore from Pre-Migration JSON Backup
If migrating to an empty database needs to be re-run:
1. Clear partial tables in MySQL:
   ```sql
   DROP TABLE IF EXISTS villa_images, villa_amenities, villas, hero_slides, homepage_sections, homepage_config, gallery_items, facilities, testimonials, video_storyboard, seo_routes, media_assets, audit_logs, site_settings, users, schema_migrations;
   ```
2. Re-run migration script:
   ```bash
   npm run db:migrate
   ```

---

## 4. Procedure C: Media Recovery

Because uploaded media is preserved in `/persistent/uploads/` outside the build directory:
1. Hostinger daily file backups automatically capture `/persistent/uploads/`.
2. To restore deleted media:
   - In Hostinger hPanel > **Files** > **Backups** > **File Backups**.
   - Select `/persistent/uploads` from the backup date.
   - Click **Restore files**.
