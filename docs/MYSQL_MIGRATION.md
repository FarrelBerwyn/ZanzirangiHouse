# Zanzirangi House — MySQL Migration & Relational Mapping

**Document Version:** 1.0.0  
**Migration Command:** `npm run db:migrate`  
**Schema DDL Location:** `server/database/migrations/001_initial_schema.sql`  
**Migration Script:** `server/database/migrateFromJson.ts`  
**Pre-Migration Backup:** `backups/local-db-before-mysql-migration.json`  

---

## 1. Relational Schema Architecture

Rather than dumping the entire CMS inside a single unindexed JSON blob, Zanzirangi House uses a normalized, relational MySQL schema with foreign keys, indexes, and full relational integrity:

```
                          ┌───────────────────────────┐
                          │     schema_migrations     │
                          └───────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
      ┌───────────┐             ┌───────────────┐            ┌───────────────┐
      │   users   │             │ site_settings │            │  audit_logs   │
      └───────────┘             └───────────────┘            └───────────────┘
           │
           ├────────────────────────────┐
           ▼                            ▼
  ┌─────────────────┐          ┌──────────────────┐
  │ homepage_config │          │   hero_slides    │
  └─────────────────┘          └──────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐        ┌──────────────────┐
│  homepage_sections  │        │      villas      │
└─────────────────────┘        └──────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌─────────────────────┐                                   ┌─────────────────────┐
│   villa_amenities   │                                   │    villa_images     │
└─────────────────────┘                                   └─────────────────────┘
```

---

## 2. JSON to Relational MySQL Mapping Table

| JSON Source (`db.json`) | Target MySQL Table | Column Mappings & Transformation |
|:---|:---|:---|
| `users[]` | `users` | `id` → `id` (VARCHAR 64 PK)<br>`email` → `email` (VARCHAR 255 UNIQUE)<br>`name` → `name`<br>`role` → `role`<br>`passwordHash` → `password_hash`<br>`createdAt` → `created_at`<br>`lastLogin` → `last_login` |
| `settings` | `site_settings` | `siteName` → `site_name`<br>`phone` → `phone`<br>`whatsapp` → `whatsapp`<br>`email` → `email`<br>`address` → `address`<br>`currency` → `currency`<br>`bookingUrl` → `booking_url`<br>`reservationEmail` → `reservation_email`<br>`socialLinks` → `social_links_json` (JSON)<br>`features` → `features_json` (JSON) |
| `homepage.hero` | `homepage_config` | Row with `section_key = 'hero'`<br>`title`, `subtitle`, `description`, `badge_text`, `primary_cta_text`, `primary_cta_link`, `secondary_cta_text`, `secondary_cta_link`, `hero_image` |
| `homepage.hero.slides[]` | `hero_slides` | `id` → `id`<br>`imageUrl` → `image_url`<br>`title` → `title`<br>`subtitle` → `subtitle`<br>`tag` → `tag`<br>`display_order` (preserves array index) |
| `homepage.sections[]` | `homepage_sections` | `id` → `section_id`<br>`label` → `label`<br>`componentName` → `component_name`<br>`displayOrder` → `display_order`<br>`visible` → `is_visible` |
| `villas[]` | `villas` | `id` → `id` (VARCHAR 64 PK)<br>`roomNumber` → `room_number`<br>`name` → `name`<br>`type` → `type`<br>`capacity` → `capacity`<br>`bed` → `bed_type`<br>`poolType` → `pool_type`<br>`startingPrice` → `starting_price`<br>`currency` → `currency`<br>`description` → `description`<br>`featured` → `is_featured`<br>`visible` → `is_visible`<br>`displayOrder` → `display_order` |
| `villas[].amenities[]` | `villa_amenities` | `villa_id` (FK to `villas.id`)<br>`amenity_text` (VARCHAR 255) |
| `villas[].images[]` | `villa_images` | `villa_id` (FK to `villas.id`)<br>`image_url` (VARCHAR 1024)<br>`display_order` |
| `gallery[]` | `gallery_items` | `id` → `id`<br>`title` → `title`<br>`category` → `category`<br>`imageUrl` → `image_url`<br>`aspectRatio` → `aspect_ratio`<br>`featured` → `is_featured`<br>`displayOrder` → `display_order` |
| `facilities[]` | `facilities` | `id` → `id`<br>`name` → `name`<br>`category` → `category`<br>`icon` → `icon`<br>`description` → `description`<br>`features` → `features_json`<br>`displayOrder` → `display_order` |
| `testimonials[]` | `testimonials` | `id` → `id`<br>`guestName` → `guest_name`<br>`location` → `location`<br>`rating` → `rating`<br>`reviewDate` → `review_date`<br>`comment` → `comment`<br>`villaStayed` → `villa_stayed`<br>`verifiedBooking` → `verified_booking`<br>`displayOrder` → `display_order` |
| `videos` | `video_storyboard` | `id` → `id`<br>`title` → `title`<br>`eyebrow` → `eyebrow`<br>`badge` → `badge`<br>`videoUrl` → `video_url`<br>`posterImage` → `poster_image`<br>`scenes` → `scenes_json`<br>`visible` → `is_visible` |
| `seo` | `seo_routes` | Object keys (`'home'`, `'villas'`, `'dining'`, `'contact'`, etc.) mapped to rows:<br>`route_key` → `route_key`<br>`title` → `title`<br>`description` → `description`<br>`canonicalUrl` → `canonical_url`<br>`ogImage` → `og_image`<br>`keywords` → `keywords`<br>`structuredData` → `structured_data_json` |
| `media[]` | `media_assets` | `id` → `id`<br>`filename` → `filename`<br>`url` → `url`<br>`mimeType` → `mime_type`<br>`sizeBytes` → `size_bytes`<br>`altText` → `alt_text`<br>`usageCount` → `usage_count`<br>`createdAt` → `created_at` |
| `auditLog[]` | `audit_logs` | `action` → `action`<br>`userEmail` → `user_email`<br>`timestamp` → `created_at`<br>`details` → `details` |

---

## 3. Safe Migration Execution Pipeline

When executing `npm run db:migrate`:
1. **Schema Check:** Runs DDL with `CREATE TABLE IF NOT EXISTS`.
2. **Migration Tracking:** Checks table `schema_migrations`.
3. **Data Verification:** If `villas` table already contains rows, the script **aborts** without overwriting production records.
4. **Foreign Key Integrity:** Child records (`villa_amenities`, `villa_images`, `hero_slides`) are inserted with matching foreign keys.
5. **Collection Count Validation:** The script verifies that count in MySQL matches count in `db.json`.
