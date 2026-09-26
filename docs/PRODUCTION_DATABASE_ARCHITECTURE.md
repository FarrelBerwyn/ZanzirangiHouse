# Zanzirangi House — Production Database Architecture

This document outlines the database design, abstraction layers, connection pooling, and lifecycle management for Zanzirangi House on Hostinger.

---

## 1. Architectural Overview

```
                      +-----------------------------+
                      |       Public Website        |
                      |  (React/Vite SSR & Client)  |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |         Express API         |
                      |        (/api/content)       |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Repositories Layer     |
                      |  (homepage, villas, etc.)   |
                      +-----------------------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Database Adapter Interface |
                      |      (DatabaseAdapter)      |
                      +-----------------------------+
                                    / \
                                   /   \
                                  /     \
  DATABASE_PROVIDER=mysql        /       \       DATABASE_PROVIDER=json
  (Production on Hostinger)     /         \      (Local Development)
                               v           v
              +--------------------+   +--------------------+
              | MysqlDatabaseAdapter|  | JsonDatabaseAdapter|
              +--------------------+   +--------------------+
                        |                        |
                        v                        v
              +--------------------+   +--------------------+
              | Hostinger MySQL DB |   | server/data/db.json|
              | (InnoDB, utf8mb4)  |   |   (Atomic Store)   |
              +--------------------+   +--------------------+
```

---

## 2. Abstraction & Repositories Layer

The application separates database engine concerns from API business logic:

1. **Repository Layer (`server/database/repositories/`)**:
   * `homepageRepository.ts`: Encapsulates hero slides, section toggles, intro, and footer metadata.
   * `villasRepository.ts`: CRUD for 8 private plunge-pool sanctuary suites, amenities, and gallery links.
   * `galleryRepository.ts`: Media curation categorized by architecture, sanctuary, villas, and culinary.
   * `videosRepository.ts`: Cinematic ambient video storyboard, poster, and scene markers.
   * `facilitiesRepository.ts`: Sanctuary amenities (butler service, dhow excursions, spa).
   * `testimonialsRepository.ts`: Verified guest impressions and reviews.
   * `contactRepository.ts`: Authoritative concierge hotline, WhatsApp, and reservation email.
   * `seoRepository.ts`: SERP metadata, canonical URLs, and OpenGraph descriptors per route.
   * `mediaRepository.ts`: Persistent media registry (file size, mime type, dimensions, usage count).
   * `settingsRepository.ts`: Authoritative property-wide brand, currency, and localization settings.
   * `usersRepository.ts`: Administrative account lookup and credential verification.
   * `auditRepository.ts`: Structured operational audit log recording administrative actions.

2. **Database Adapter Interface (`server/database/adapter.ts`)**:
   Defines the contract implemented by both `MysqlDatabaseAdapter` and `JsonDatabaseAdapter`. Any component interacting with data uses identical signatures regardless of the active database engine.

---

## 3. Relational MySQL Schema (Hostinger MariaDB / MySQL)

* **Engine**: InnoDB across all tables (supports transactions, row-level locking, and foreign key constraints).
* **Character Set & Collation**: `utf8mb4` with `utf8mb4_unicode_ci` (full emoji and international character support).
* **Security & Privileges**: Requires standard DML/DDL only. Zero reliance on `SUPER` privileges, triggers, or custom stored procedures.

### Core Relational Tables:
1. `users`: Administrative accounts, roles, bcrypt password hashes, last login.
2. `site_settings`: Single authoritative source for phone, WhatsApp, email, address, booking URL, and currency.
3. `homepage_config`: Primary hero copy, CTA buttons, intro narrative, and footer copyright.
4. `hero_slides`: Multi-slide hero rotation with title, subtitle, CTA links, image, and order.
5. `homepage_sections`: Dynamic section visibility and display order.
6. `villas`: Luxury private pool villas, pricing, guest capacity, bedroom count, architectural features.
7. `villa_amenities`: Relational 1-to-many amenities per villa (foreign key cascade).
8. `villa_images`: Relational 1-to-many photography per villa.
9. `gallery_items`: Photo curation by category with aspect ratio and publish state.
10. `facilities`: Resort amenities with operating hours, highlights, and icons.
11. `testimonials`: Guest reviews with rating, stay date, villa stayed, and verified badge.
12. `video_storyboard`: 4K ambient video URL, poster, and JSON scenes.
13. `seo_routes`: Route-specific title, description, canonical, robots, and OG tags.
14. `media_assets`: Metadata registry for persistent uploaded images, videos, and documents.
15. `audit_logs`: Timestamped administrative action records with user email and IP.
16. `schema_migrations`: Version tracking table ensuring idempotent database migrations.

---

## 4. Connection Pooling & Resilience

The `MysqlDatabaseAdapter` implements production-grade pool management using `mysql2/promise`:
* **Pool Sizing**: Defaults to 10 connections (`MYSQL_CONNECTION_LIMIT`), avoiding connection starvation.
* **Keep-Alive**: `enableKeepAlive: true` with initial delay of 10,000ms prevents silent TCP disconnection by Hostinger firewalls.
* **Graceful Fallback**: If MySQL becomes temporarily unreachable on initial boot, the application logs a warning and falls back to `JsonDatabaseAdapter` to maintain zero website downtime.
* **Graceful Teardown**: Intercepts `SIGTERM` and `SIGINT` signals to flush pending writes and close the connection pool cleanly before process termination.
