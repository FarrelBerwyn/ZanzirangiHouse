# Zanzirangi House — JSON to MySQL Migration Dry Run Report

**Document**: `docs/JSON_TO_MYSQL_DRY_RUN.md`  
**Date**: September 28, 2026  
**Auditor**: Antigravity Autonomous Diagnostic Engine  
**Execution Phase**: Phase 3 Pre-Flight Validation  
**Source**: `server/data/db.json`  
**Target Database**: Hostinger MySQL (`u170555096_Zanzirangi`)  

---

## 1. Dry Run Execution Summary

A strict pre-flight validation of [server/data/db.json](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/server/data/db.json) was conducted against the 19 Hostinger MySQL relational schemas.

```
========================================================================
VALIDATION RESULT       : PASS (0 Errors, 0 Warnings)
PLANNED RECORD INSERTS  : 305 Records Across 18 Tables
ORPHAN RELATIONSHIPS    : 0 Detected
DUPLICATE PRIMARY KEYS  : 0 Detected
STATUS                  : READY FOR LIVE DATABASE INSERTION
========================================================================
```

---

## 2. Planned Insert Matrix

| # | Entity / Path in `db.json` | JSON Count | Expected MySQL Table | Planned Insert Count | Schema Foreign Key |
|:---:|---|:---:|---|:---:|---|
| 1 | `users` | 5 | `users` | 5 | Primary Root |
| 2 | `settings` (site properties) | 1 | `site_settings` | 1 | Singleton (id: 1) |
| 3 | `homepage.contact` | 1 | `contact_settings` | 1 | Singleton (id: 1) |
| 4 | `homepage` (config/meta) | 1 | `homepage_config` | 1 | Singleton (id: 1) |
| 5 | `homepage.hero.slides` | 3 | `hero_slides` | 3 | Child of homepage |
| 6 | `homepage.sections` | 20 | `homepage_sections` | 20 | Child of homepage |
| 7 | `villas` | 8 | `villas` | 8 | Parent Record |
| 8 | `villa.amenities` (nested) | 64 | `villa_amenities` | 64 | FK &rarr; `villas(id)` |
| 9 | `villa.images` (nested) | 27 | `villa_images` | 27 | FK &rarr; `villas(id)` |
| 10 | `gallery_categories` (taxonomy) | 7 | `gallery_categories` | 7 | Lookup Taxonomy |
| 11 | `gallery` | 11 | `gallery_items` | 11 | Category Key |
| 12 | `facilities` | 6 | `facilities` | 6 | Independent |
| 13 | `testimonials` | 5 | `testimonials` | 5 | Independent |
| 14 | `videos` (storyboard) | 1 | `video_storyboard` | 1 | Singleton (id: 1) |
| 15 | `video_items` | 0 | `video_items` | 0 | Independent |
| 16 | `seo.routes` | 7 | `seo_routes` | 7 | Key: `route_path` |
| 17 | `media` | 4 | `media_assets` | 4 | Key: `id` |
| 18 | `auditLog` | 134 | `audit_logs` | 134 | Temporal Log |
| **TOTAL** | | **305** | | **305** | |

---

## 3. Pre-Flight Data Integrity Verifications

1. **Foreign Key Reference Integrity**:
   - Every one of the 64 `villa_amenities` records references a valid `villa_id` (`villa-01` through `villa-08`).
   - Every one of the 27 `villa_images` records references a valid `villa_id` (`villa-01` through `villa-08`).
   - Zero orphan child records exist.
2. **Primary Key Uniqueness**:
   - Zero duplicate IDs detected across `users`, `villas`, `hero_slides`, `homepage_sections`, `gallery_items`, `facilities`, `testimonials`, `seo_routes`, and `media_assets`.
3. **Data Transformations Documented**:
   - `users.email`: Lowercased and trimmed.
   - `villas.pricePerNight`: Sanitized to standard decimal format (`DECIMAL(10,2)`).
   - `homepage.socials`: Serialized into standard JSON string in `homepage_config.socials_json`.
   - `videos.scenes`: Serialized into standard JSON string in `video_storyboard.scenes_json`.
4. **Administrative Credentials**:
   - All 5 user passwords use standard bcrypt `$2b$` hashes. No plaintext passwords exist in `db.json`.
