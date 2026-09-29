# Zanzirangi House — JSON to MySQL Data Migration Map

**Document**: `docs/JSON_TO_MYSQL_DATA_MIGRATION_MAP.md`  
**Date**: September 28, 2026  
**Auditor**: Antigravity Autonomous Diagnostic Engine  
**Execution Phase**: Phase 3 (Data Mapping & Validation)  
**Source Database**: `server/data/db.json`  
**Target Database**: Hostinger MySQL Production Database (`u170555096_Zanzirangi`)  

---

## 1. Executive Summary

This document defines the deterministic mapping specification from the source document database ([server/data/db.json](file:///d:/Farrel%20Folder/Programming/Project/Zanzirangi%20House/zanzirangi-house-v3/server/data/db.json)) into the normalized 19 relational tables created in Phase 2 on Hostinger MySQL.

The actual current `db.json` file contains **15 top-level keys**, which map directly into the 19 MySQL relational tables.

---

## 2. Complete Collection Inventory & Relational Mapping

| # | JSON Collection / Path | Target MySQL Table | Source Record Count | Relationship Type | Ordering / Status Fields | Key Transformations & Notes |
|:---:|---|---|:---:|---|---|---|
| 1 | `data.users[]` | `users` | **5** | Independent root | `role`, `lastLogin` | Standard bcrypt password hashes preserved. Lowercased emails. |
| 2 | `data.settings` (site properties) | `site_settings` | **1** | Singleton (id: 1) | `maintenanceMode` | Currency, phones, email defaults flattened into single record. |
| 3 | `data.homepage.contact` + `data.settings` | `contact_settings` | **1** | Singleton (id: 1) | &mdash; | Concierge phones, whatsapp, address, Google Maps URL mapped. |
| 4 | `data.homepage.hero`, `intro`, `footer`, `meta` | `homepage_config` | **1** | Singleton (id: 1) | &mdash; | Hero CTAs, typography, socials JSON serialized, metadata preserved. |
| 5 | `data.homepage.hero.slides[]` | `hero_slides` | **3** | Child of homepage | `order`, `visible` | Primary key `id` preserved. Overlay opacity, video URLs mapped. |
| 6 | `data.homepage.sections[]` | `homepage_sections` | **20** | Child of homepage | `order`, `visible` | 20 layout sections with toggle visibility and sort ordering preserved. |
| 7 | `data.villas[]` | `villas` | **8** | Parent | `order`, `status`, `featured` | Price per night decimalized, architectural features, capacities mapped. |
| 8 | `data.villas[].amenities[]` | `villa_amenities` | **64** | Child (FK &rarr; `villas.id`) | `sort_order` | Flattened from nested string/object array per villa (`ON DELETE CASCADE`). |
| 9 | `data.villas[].images[]` | `villa_images` | **27** | Child (FK &rarr; `villas.id`) | `sort_order` | Flattened from nested string/object array per villa (`ON DELETE CASCADE`). |
| 10 | Curated Gallery Taxonomy | `gallery_categories` | **7** | Parent lookup | `sort_order` | Standard estate categories (`property`, `villas`, `dining`, etc.). |
| 11 | `data.gallery[]` | `gallery_items` | **11** | Independent | `order`, `published` | Aspect ratios (`4/3`), captions, URLs, category foreign references. |
| 12 | `data.facilities[]` | `facilities` | **6** | Independent | `order`, `visible` | Highlights, operating hours, SVG icons, imagery mapped. |
| 13 | `data.testimonials[]` | `testimonials` | **5** | Independent | `order`, `visible`, `featured` | Guest names, nationalities, 5-star ratings, stay dates, reviews. |
| 14 | `data.videos` (storyboard scenes) | `video_storyboard` | **1** | Singleton (id: 1) | &mdash; | Master video URL, poster image, and 7 storyboard scenes (JSON). |
| 15 | `data.videos.items[]` | `video_items` | **0** | Independent | `sort_order` | Dedicated video items table (empty in current `db.json`). |
| 16 | `data.seo.routes{}` | `seo_routes` | **7** | Independent | &mdash; | Primary key `route_path` (`/`, `/villas`, `/dining`, etc.), OG meta. |
| 17 | `data.media[]` | `media_assets` | **4** | Independent | `usage_count` | Mime types, byte sizes, public CDN/local URLs, filenames preserved. |
| 18 | `data.auditLog[]` | `audit_logs` | **134** | Append-only history | `created_at DESC` | Development & verification operational audit records preserved verbatim. |
| 19 | Meta Schema Record | `schema_migrations` | **1** | System metadata | &mdash; | Version tag `001_initial_schema` already tracked in Phase 2. |

---

## 3. Detailed Entity Field-Level Mapping Specification

### 3.1 Users (`users`)
- `id` &larr; `u.id` (e.g., `usr_1`, `usr_2`)
- `email` &larr; `u.email.toLowerCase().trim()`
- `name` &larr; `u.name`
- `role` &larr; `u.role` (default: `'admin'`)
- `password_hash` &larr; `u.passwordHash` (standard cryptographic bcrypt `$2b$` string)
- `created_at` &larr; `u.createdAt`
- `last_login` &larr; `u.lastLogin`

### 3.2 Villas & Child Collections (`villas`, `villa_amenities`, `villa_images`)
- **Parent Insertion Order**: `villas` must be committed first.
- **Foreign Key Constraint**:
  - `villa_amenities.villa_id` REFERENCES `villas.id`
  - `villa_images.villa_id` REFERENCES `villas.id`
- **Total Nested Amenities**: 64 items across 8 villas.
- **Total Nested Images**: 27 items across 8 villas.

### 3.3 Homepage Configuration (`homepage_config`, `hero_slides`, `homepage_sections`)
- Singleton `id = 1` for `homepage_config`.
- `hero_slides` (3 items): preserves `sort_order`, `visible`, `overlay_opacity`.
- `homepage_sections` (20 items): preserves `sort_order`, `visible`.

### 3.4 SEO Routes (`seo_routes`)
- 7 distinct route paths mapped from `data.seo.routes`:
  1. `/` (Homepage Sanctuary)
  2. `/villas` (Villas & Suites)
  3. `/dining` (Culinary & Private Dining)
  4. `/experiences` (Zanzibar Escapes)
  5. `/wellness` (Sanctuary Spa & Wellness)
  6. `/gallery` (Visual Journal)
  7. `/contact` (Concierge & Reservations)

---

## 4. Administrative Security & Credential Audit Policy

- **Bcrypt Hash Verification**: All 5 user records in `db.json` use standard salted bcrypt hashes (`$2b$10$...`).
- **No Password Regeneration Required**: Hashes are directly verified by `server/api.ts` through `bcrypt.compare()`.
- **Zero Plaintext Credentials**: Password hashes are transferred verbatim over TLS/SSL connection to MySQL. Zero plaintext passwords are processed or exposed.

---

## 5. Audit Log Preservation Policy

- The 134 audit log entries in `db.json` record the development, feature completion, and verification lifecycle of the CMS from September 26 to September 28, 2026.
- Preserving them provides full transparency of system initialization and content updates.
- All 134 entries will be migrated into `audit_logs` preserving their original timestamps and actor emails.

---

## 6. Physical Media vs. Database Reference Policy

- **Media Records in MySQL**: 4 media records (`med-01` to `med-04`) in `media_assets`.
- **Physical Assets**:
  - Remote assets (`med-01`, `med-03`) resolve to high-resolution Unsplash CDN URLs.
  - Local assets (`med-02`, `med-04`) resolve to static bundle assets (`public/zanzirangi-villas.jpg`, `src/data/Zanzirangi-home.mp4`, `dist/assets/*`).
- **Constraint**: Phase 3 migrates database records only; physical filesystem files will not be deleted, moved, or overwritten.
