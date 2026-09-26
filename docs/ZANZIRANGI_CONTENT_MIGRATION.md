# Zanzirangi House: Content Migration Matrix

**Document Version:** 1.0.0  
**Date:** September 26, 2026  
**Status:** In Progress (Continuous Vertical Slices)  
**System Architecture:** Self-Managed JSON DB Store + Express API + React Admin Dashboard  

---

## 1. Migration Architecture & Pipeline

All content flows through the verified four-tier pipeline:

```
[ADMIN DASHBOARD] (/admin/*)
        ↓
  [EXPRESS API] (Protected with JWT + bcrypt)
        ↓
[ATOMIC DATABASE] (server/data/db.json)
        ↓
 [PUBLIC WEBSITE] (Reactive fetch with fallback)
```

No GitHub commits, CI/CD builds, or Hostinger file manager edits are required for content changes.

---

## 2. Content Migration Inventory

| Section / Entity | Current Source (Code/Static) | New CMS Model / DB Key | API Endpoints | Public Component | Migration Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01. Hero & Slides Carousel** | `src/data/translations.ts`, `propertyConfig.ts` | `homepage.hero.slides` | `GET /api/content/homepage`<br>`PUT /api/admin/homepage` | `HeroSection.tsx` | **LIVE / MIGRATED** |
| **02. Homepage Section Ordering & Visibility** | Static in `App.tsx` | `homepage.sections` | `GET /api/content/homepage`<br>`PUT /api/admin/homepage` | `App.tsx` | **LIVE / MIGRATED** |
| **03. Editorial Intro ("More Than A Stay")** | `src/data/introTranslations.ts` | `homepage.intro` | `GET /api/content/homepage`<br>`PUT /api/admin/homepage` | `PropertyIntro.tsx` | **LIVE / MIGRATED** |
| **04. Rooms & Villas Inventory** | `src/data/villas.ts` | `villas` (collection) | `GET /api/content/villas`<br>`CRUD /api/admin/villas` | `VillasSection.tsx`<br>`VillasPage.tsx` | **LIVE / MIGRATED** |
| **05. Curated Photo Gallery** | `src/data/gallery.ts` | `gallery` (collection) | `GET /api/content/gallery`<br>`CRUD /api/admin/gallery` | `GallerySection.tsx` | **LIVE / MIGRATED** |
| **06. Promotional Video & Storyboard** | `PromotionalVideoSection.tsx` | `videos` (collection) | `GET /api/content/videos`<br>`PUT /api/admin/videos` | `PromotionalVideoSection.tsx` | **LIVE / MIGRATED** |
| **07. Resort Facilities & Amenities** | `src/data/facilities.ts` | `facilities` (collection) | `GET /api/content/facilities`<br>`CRUD /api/admin/facilities` | `FacilitiesSection.tsx` | **LIVE / MIGRATED** |
| **08. Guest Testimonials & Reviews** | `src/data/reviews.ts` | `testimonials` (collection) | `GET /api/content/testimonials`<br>`CRUD /api/admin/testimonials` | `ReviewsSection.tsx` | **LIVE / MIGRATED** |
| **09. Contact, Concierge & Socials** | `propertyConfig.ts`, `Footer.tsx` | `homepage.contact`, `homepage.socials` | `GET /api/content/homepage`<br>`PUT /api/admin/homepage` | `ContactPage.tsx`<br>`Footer.tsx` | **LIVE / MIGRATED** |
| **10. SEO Metadata & Sitelinks** | `src/App.tsx` (`ROUTE_SEO`) | `seo` (global + per-route) | `GET /api/content/seo`<br>`PUT /api/admin/seo` | `App.tsx` (head manager) | **LIVE / MIGRATED** |
| **11. Media Library & References** | Hardcoded Unsplash & local files | `media` (assets repository) | `GET /api/admin/media`<br>`POST /api/admin/media` | Media Selectors across CMS | **LIVE / MIGRATED** |
| **12. Site & Admin Settings** | Hardcoded env/defaults | `settings`, `users` | `GET /api/admin/settings`<br>`PUT /api/admin/settings` | `AdminSettingsManager.tsx` | **LIVE / MIGRATED** |

---

## 3. Data Integrity & Preservation Rules

1. **Zero Mock or Invented Data**: All initial database records are directly imported from the existing production data in `src/data/` (`villas.ts`, `gallery.ts`, `facilities.ts`, `reviews.ts`, `propertyConfig.ts`).
2. **Safe Fallback**: If the API is unreachable, components seamlessly fall back to compile-time static defaults, preventing any white-screen downtime.
3. **Atomic Writes**: Database writes are staged to `.tmp.[timestamp]` files and renamed atomically to protect against race conditions and file corruption.
