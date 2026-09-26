var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/env.ts
import dotenv from "dotenv";
import path2 from "path";
function parseCorsOrigin(val) {
  if (!val || val === "*") return "*";
  if (val.includes(",")) {
    return val.split(",").map((s) => s.trim());
  }
  return val.trim();
}
function validateEnvironment() {
  if (env.NODE_ENV === "production") {
    const missing = [];
    if (!env.JWT_SECRET || env.JWT_SECRET === "zanzirangi_dev_jwt_secret_2026") {
      missing.push("JWT_SECRET (must be a strong, non-default secret)");
    }
    if (env.DATABASE_PROVIDER === "mysql") {
      if (!env.MYSQL_HOST) missing.push("MYSQL_HOST");
      if (!env.MYSQL_DATABASE) missing.push("MYSQL_DATABASE");
      if (!env.MYSQL_USER) missing.push("MYSQL_USER");
      if (!env.MYSQL_PASSWORD) missing.push("MYSQL_PASSWORD");
    }
    if (missing.length > 0) {
      const errorMsg = `
\u274C FATAL PRODUCTION CONFIGURATION ERROR:
Missing or insecure required environment variables:
  - ${missing.join("\n  - ")}

Please configure these in Hostinger Environment Variables before starting in production mode.
`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    console.log(`\u{1F6E1}\uFE0F Production environment validated successfully [Provider: ${env.DATABASE_PROVIDER}, URL: ${env.APP_URL}]`);
  } else {
    console.log(`\u{1F527} Development environment loaded [Provider: ${env.DATABASE_PROVIDER}, Host: http://localhost:${env.PORT}]`);
  }
}
var nodeEnv, env;
var init_env = __esm({
  "server/config/env.ts"() {
    dotenv.config();
    nodeEnv = process.env.NODE_ENV || "development";
    env = {
      NODE_ENV: nodeEnv,
      PORT: parseInt(process.env.PORT || process.env.API_PORT || "3000", 10),
      APP_URL: process.env.APP_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000"),
      PUBLIC_URL: process.env.PUBLIC_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000"),
      API_URL: process.env.API_URL || (nodeEnv === "production" ? "https://zanzirangihouse.com/api" : "/api"),
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || "json",
      MYSQL_HOST: process.env.MYSQL_HOST,
      MYSQL_PORT: parseInt(process.env.MYSQL_PORT || "3306", 10),
      MYSQL_DATABASE: process.env.MYSQL_DATABASE,
      MYSQL_USER: process.env.MYSQL_USER,
      MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
      MYSQL_CONNECTION_LIMIT: parseInt(process.env.MYSQL_CONNECTION_LIMIT || "10", 10),
      JWT_SECRET: process.env.JWT_SECRET || (nodeEnv === "production" ? "" : "zanzirangi_dev_jwt_secret_2026"),
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "info@zanzirangihouse.com",
      MEDIA_STORAGE_PATH: process.env.MEDIA_STORAGE_PATH || path2.resolve(process.cwd(), "uploads"),
      MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "25", 10),
      CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN || (nodeEnv === "production" ? "https://zanzirangihouse.com" : "http://localhost:3000")),
      LOG_LEVEL: process.env.LOG_LEVEL || (nodeEnv === "production" ? "info" : "debug"),
      APP_VERSION: process.env.npm_package_version || "1.0.0"
    };
  }
});

// server/database/migrateFromJson.ts
var migrateFromJson_exports = {};
__export(migrateFromJson_exports, {
  runMigration: () => runMigration
});
import fs2 from "fs";
import path3 from "path";
import mysql from "mysql2/promise";
async function runMigration(existingPool) {
  console.log("\u{1F680} Starting Zanzirangi House: JSON -> MySQL Migration Pipeline");
  console.log(`Connecting to MySQL host: ${env.MYSQL_HOST || "localhost"}:${env.MYSQL_PORT || 3306} [DB: ${env.MYSQL_DATABASE || "zanzirangi_house"}]`);
  if (!env.MYSQL_HOST && process.env.NODE_ENV === "production" && !existingPool) {
    console.error("\u274C MYSQL_HOST environment variable is not defined.");
    throw new Error("MYSQL_HOST environment variable is not defined.");
  }
  let shouldEndPool = false;
  let pool = existingPool;
  if (!pool) {
    shouldEndPool = true;
    pool = mysql.createPool({
      host: env.MYSQL_HOST || "localhost",
      port: env.MYSQL_PORT || 3306,
      database: env.MYSQL_DATABASE || "zanzirangi_house",
      user: env.MYSQL_USER || "root",
      password: env.MYSQL_PASSWORD || "",
      multipleStatements: true
    });
  }
  try {
    const conn = await pool.getConnection();
    console.log("\u2705 Connected to MySQL database successfully.");
    const sqlPath = path3.resolve(process.cwd(), "server/database/migrations/001_initial_schema.sql");
    if (!fs2.existsSync(sqlPath)) {
      throw new Error(`Schema file not found at: ${sqlPath}`);
    }
    const ddl = fs2.readFileSync(sqlPath, "utf-8");
    console.log("\u23F3 Executing 001_initial_schema.sql DDL...");
    await conn.query(ddl);
    console.log("\u2705 MySQL schema tables created/verified.");
    const backupPath = path3.resolve(process.cwd(), "backups/local-db-before-mysql-migration.json");
    const localDbPath = path3.resolve(process.cwd(), "server/data/db.json");
    const sourcePath = fs2.existsSync(backupPath) ? backupPath : localDbPath;
    console.log(`\u23F3 Reading source JSON data from: ${sourcePath}`);
    const rawData = fs2.readFileSync(sourcePath, "utf-8");
    const db = JSON.parse(rawData);
    console.log(`Migrating ${db.users?.length || 0} user records...`);
    for (const u of db.users || []) {
      await conn.query(
        `INSERT INTO users (id, email, name, role, password_hash, created_at, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash)`,
        [u.id, u.email.toLowerCase(), u.name, u.role, u.passwordHash, u.createdAt || /* @__PURE__ */ new Date(), u.lastLogin || null]
      );
    }
    const s = db.settings || {};
    await conn.query(
      `INSERT INTO site_settings (id, site_name, tagline, default_currency, reservation_notification_email, concierge_phone, maintenance_mode)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), default_currency = VALUES(default_currency), 
        reservation_notification_email = VALUES(reservation_notification_email), concierge_phone = VALUES(concierge_phone), 
        maintenance_mode = VALUES(maintenance_mode)`,
      [
        s.siteName || "Zanzirangi House",
        s.tagline || "",
        s.defaultCurrency || "USD ($)",
        s.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        s.conciergePhone || "+255 777 890 123",
        s.maintenanceMode ? 1 : 0
      ]
    );
    const hp = db.homepage || {};
    await conn.query(
      `INSERT INTO homepage_config 
        (id, hero_title, hero_subtitle, hero_description, hero_badge_text, hero_primary_cta_text, 
         hero_primary_cta_link, hero_secondary_cta_text, hero_secondary_cta_link, hero_image, 
         auto_play_interval, intro_eyebrow, intro_title, intro_description, contact_phone, 
         contact_email, contact_whatsapp, contact_address, socials_json, footer_copyright, 
         footer_tagline, meta_last_updated, meta_updated_by)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        hero_title = VALUES(hero_title), hero_subtitle = VALUES(hero_subtitle), hero_description = VALUES(hero_description),
        hero_badge_text = VALUES(hero_badge_text), hero_primary_cta_text = VALUES(hero_primary_cta_text),
        hero_primary_cta_link = VALUES(hero_primary_cta_link), hero_secondary_cta_text = VALUES(hero_secondary_cta_text),
        hero_secondary_cta_link = VALUES(hero_secondary_cta_link), hero_image = VALUES(hero_image),
        auto_play_interval = VALUES(auto_play_interval), intro_eyebrow = VALUES(intro_eyebrow),
        intro_title = VALUES(intro_title), intro_description = VALUES(intro_description),
        contact_phone = VALUES(contact_phone), contact_email = VALUES(contact_email),
        contact_whatsapp = VALUES(contact_whatsapp), contact_address = VALUES(contact_address),
        socials_json = VALUES(socials_json), footer_copyright = VALUES(footer_copyright),
        footer_tagline = VALUES(footer_tagline), meta_last_updated = VALUES(meta_last_updated),
        meta_updated_by = VALUES(meta_updated_by)`,
      [
        hp.hero?.title || "Zanzirangi House",
        hp.hero?.subtitle || "",
        hp.hero?.description || "",
        hp.hero?.badgeText || "",
        hp.hero?.primaryCtaText || "",
        hp.hero?.primaryCtaLink || "",
        hp.hero?.secondaryCtaText || "",
        hp.hero?.secondaryCtaLink || "",
        hp.hero?.heroImage || "",
        hp.hero?.autoPlayIntervalSeconds || 6,
        hp.intro?.eyebrow || "",
        hp.intro?.title || "",
        hp.intro?.description || "",
        hp.contact?.phone || "",
        hp.contact?.email || "",
        hp.contact?.whatsappNumber || "",
        hp.contact?.address || "",
        JSON.stringify(hp.socials || {}),
        hp.footer?.copyrightText || "",
        hp.footer?.tagline || "",
        hp.meta?.lastUpdated ? new Date(hp.meta.lastUpdated) : null,
        hp.meta?.updatedBy || "admin"
      ]
    );
    console.log(`Migrating ${hp.hero?.slides?.length || 0} hero carousel slides...`);
    for (let i = 0; i < (hp.hero?.slides || []).length; i++) {
      const slide = hp.hero.slides[i];
      await conn.query(
        `INSERT INTO hero_slides 
          (id, title, subtitle, description, badge_text, primary_cta_text, primary_cta_link, 
           secondary_cta_text, secondary_cta_link, image_url, video_url, alignment, overlay_opacity, sort_order, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          title = VALUES(title), subtitle = VALUES(subtitle), description = VALUES(description),
          badge_text = VALUES(badge_text), primary_cta_text = VALUES(primary_cta_text),
          primary_cta_link = VALUES(primary_cta_link), secondary_cta_text = VALUES(secondary_cta_text),
          secondary_cta_link = VALUES(secondary_cta_link), image_url = VALUES(image_url),
          video_url = VALUES(video_url), alignment = VALUES(alignment), overlay_opacity = VALUES(overlay_opacity),
          sort_order = VALUES(sort_order), visible = VALUES(visible)`,
        [
          slide.id || `slide-${i + 1}`,
          slide.title,
          slide.subtitle || "",
          slide.description || "",
          slide.badgeText || "",
          slide.primaryCtaText || "",
          slide.primaryCtaLink || "",
          slide.secondaryCtaText || "",
          slide.secondaryCtaLink || "",
          slide.imageUrl,
          slide.videoUrl || null,
          slide.alignment || "center",
          slide.overlayOpacity || 0.4,
          slide.order ?? i,
          slide.visible !== false ? 1 : 0
        ]
      );
    }
    console.log(`Migrating ${hp.sections?.length || 0} homepage sections...`);
    for (const sec of hp.sections || []) {
      await conn.query(
        `INSERT INTO homepage_sections (id, label, description, sort_order, visible)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          label = VALUES(label), description = VALUES(description), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
        [sec.id, sec.label, sec.description || "", sec.order || 0, sec.visible !== false ? 1 : 0]
      );
    }
    console.log(`Migrating ${db.villas?.length || 0} villas...`);
    for (const v of db.villas || []) {
      await conn.query(
        `INSERT INTO villas 
          (id, name, short_name, type, subtitle, short_description, description, price_per_night, 
           price_unit, promotional_price, size_sqm, max_guests, bedrooms, bathrooms, beds_count, 
           bed_type, bathroom_type, view_type, architectural_feature, hero_image, cover_image, 
           status, featured, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          name = VALUES(name), short_name = VALUES(short_name), type = VALUES(type),
          subtitle = VALUES(subtitle), short_description = VALUES(short_description),
          description = VALUES(description), price_per_night = VALUES(price_per_night),
          price_unit = VALUES(price_unit), promotional_price = VALUES(promotional_price),
          size_sqm = VALUES(size_sqm), max_guests = VALUES(max_guests), bedrooms = VALUES(bedrooms),
          bathrooms = VALUES(bathrooms), beds_count = VALUES(beds_count), bed_type = VALUES(bed_type),
          bathroom_type = VALUES(bathroom_type), view_type = VALUES(view_type),
          architectural_feature = VALUES(architectural_feature), hero_image = VALUES(hero_image),
          cover_image = VALUES(cover_image), status = VALUES(status), featured = VALUES(featured),
          sort_order = VALUES(sort_order)`,
        [
          v.id,
          v.name,
          v.shortName || v.name,
          v.type,
          v.subtitle || "",
          v.shortDescription || "",
          v.description,
          v.pricePerNight,
          v.priceUnit || "USD",
          v.promotionalPrice || null,
          v.sizeSqm || 85,
          v.maxGuests || 2,
          v.bedrooms || 1,
          v.bathrooms || 1,
          v.beds || 1,
          v.bed || "King Bed",
          v.bathroom || "En-suite",
          v.view || "Ocean View",
          v.architecturalFeature || "",
          v.heroImage || v.coverImage || "",
          v.coverImage || v.heroImage || "",
          v.status || "published",
          v.featured ? 1 : 0,
          v.order || 0
        ]
      );
      await conn.query("DELETE FROM villa_amenities WHERE villa_id = ?", [v.id]);
      for (let i = 0; i < (v.amenities || []).length; i++) {
        await conn.query(
          "INSERT INTO villa_amenities (villa_id, amenity_name, sort_order) VALUES (?, ?, ?)",
          [v.id, v.amenities[i], i]
        );
      }
      await conn.query("DELETE FROM villa_images WHERE villa_id = ?", [v.id]);
      for (let i = 0; i < (v.gallery || []).length; i++) {
        await conn.query(
          "INSERT INTO villa_images (villa_id, image_url, sort_order) VALUES (?, ?, ?)",
          [v.id, v.gallery[i], i]
        );
      }
    }
    console.log(`Migrating ${db.gallery?.length || 0} gallery photographs...`);
    for (const g of db.gallery || []) {
      await conn.query(
        `INSERT INTO gallery_items 
          (id, category, title, caption, description, image_url, aspect_ratio, sort_order, published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          category = VALUES(category), title = VALUES(title), caption = VALUES(caption),
          description = VALUES(description), image_url = VALUES(image_url),
          aspect_ratio = VALUES(aspect_ratio), sort_order = VALUES(sort_order), published = VALUES(published)`,
        [
          g.id,
          g.category,
          g.title,
          g.caption || "",
          g.description || g.caption || "",
          g.image,
          g.aspectRatio || "4/3",
          g.order || 0,
          g.published !== false ? 1 : 0
        ]
      );
    }
    console.log(`Migrating ${db.facilities?.length || 0} estate facilities...`);
    for (const f of db.facilities || []) {
      await conn.query(
        `INSERT INTO facilities 
          (id, title, category, description, hours, highlight, image_url, icon, sort_order, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          title = VALUES(title), category = VALUES(category), description = VALUES(description),
          hours = VALUES(hours), highlight = VALUES(highlight), image_url = VALUES(image_url),
          icon = VALUES(icon), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
        [
          f.id,
          f.title,
          f.category,
          f.description,
          f.hours,
          f.highlight,
          f.image,
          f.icon || "Sparkles",
          f.order || 0,
          f.visible !== false ? 1 : 0
        ]
      );
    }
    console.log(`Migrating ${db.testimonials?.length || 0} testimonials...`);
    for (const t of db.testimonials || []) {
      await conn.query(
        `INSERT INTO testimonials 
          (id, guest_name, country, avatar_url, rating, stay_date, villa_stayed, title, review_text, verified_stay, featured, sort_order, visible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          guest_name = VALUES(guest_name), country = VALUES(country), avatar_url = VALUES(avatar_url),
          rating = VALUES(rating), stay_date = VALUES(stay_date), villa_stayed = VALUES(villa_stayed),
          title = VALUES(title), review_text = VALUES(review_text), verified_stay = VALUES(verified_stay),
          featured = VALUES(featured), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
        [
          t.id,
          t.guestName,
          t.country,
          t.avatar || "",
          t.rating || 5,
          t.stayDate,
          t.villaStayed,
          t.title,
          t.reviewText,
          t.verifiedStay !== false ? 1 : 0,
          t.featured ? 1 : 0,
          t.order || 0,
          t.visible !== false ? 1 : 0
        ]
      );
    }
    const vid = db.videos || {};
    await conn.query(
      `INSERT INTO video_storyboard (id, video_url, poster_image, scenes_json)
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE video_url = VALUES(video_url), poster_image = VALUES(poster_image), scenes_json = VALUES(scenes_json)`,
      [
        vid.videoUrl || "https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4",
        vid.posterImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
        JSON.stringify(vid.scenes || [])
      ]
    );
    const seo = db.seo || {};
    for (const [routePath, r] of Object.entries(seo.routes || {})) {
      const ro = r;
      await conn.query(
        `INSERT INTO seo_routes (route_path, title, description, canonical_url, og_title, og_description, og_image, robots)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          title = VALUES(title), description = VALUES(description), canonical_url = VALUES(canonical_url),
          og_title = VALUES(og_title), og_description = VALUES(og_description), og_image = VALUES(og_image),
          robots = VALUES(robots)`,
        [
          routePath,
          ro.title,
          ro.description,
          ro.canonical,
          ro.ogTitle || ro.title,
          ro.ogDescription || ro.description,
          ro.ogImage || "",
          ro.robots || "index, follow"
        ]
      );
    }
    console.log(`Migrating ${db.media?.length || 0} media library assets...`);
    for (const m of db.media || []) {
      await conn.query(
        `INSERT INTO media_assets 
          (id, filename, url, mime_type, size_bytes, width, height, alt_text, caption, usage_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          filename = VALUES(filename), url = VALUES(url), mime_type = VALUES(mime_type),
          size_bytes = VALUES(size_bytes), width = VALUES(width), height = VALUES(height),
          alt_text = VALUES(alt_text), caption = VALUES(caption), usage_count = VALUES(usage_count)`,
        [
          m.id,
          m.filename,
          m.url,
          m.mimeType,
          m.sizeBytes,
          m.width || null,
          m.height || null,
          m.altText || "",
          m.caption || "",
          m.usageCount || 0,
          m.createdAt ? new Date(m.createdAt) : /* @__PURE__ */ new Date()
        ]
      );
    }
    await conn.query(
      `INSERT INTO schema_migrations (version, applied_at) VALUES ('001_initial_schema', NOW())
       ON DUPLICATE KEY UPDATE applied_at = NOW()`
    );
    conn.release();
    console.log("\n======================================================");
    console.log("\u{1F389} MYSQL DATABASE MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("======================================================");
    console.log(`- Users: ${db.users?.length || 0}`);
    console.log(`- Villas: ${db.villas?.length || 0}`);
    console.log(`- Gallery Items: ${db.gallery?.length || 0}`);
    console.log(`- Facilities: ${db.facilities?.length || 0}`);
    console.log(`- Testimonials: ${db.testimonials?.length || 0}`);
    console.log(`- Hero Slides: ${hp.hero?.slides?.length || 0}`);
    console.log(`- Sections: ${hp.sections?.length || 0}`);
    console.log(`- SEO Routes: ${Object.keys(seo.routes || {}).length}`);
    console.log(`- Media Assets: ${db.media?.length || 0}`);
    console.log("======================================================\n");
  } catch (err) {
    console.error("\u274C Migration failed:", err.message);
    throw err;
  } finally {
    if (shouldEndPool && pool) {
      await pool.end();
    }
  }
}
var init_migrateFromJson = __esm({
  "server/database/migrateFromJson.ts"() {
    init_env();
    if (process.argv[1] && process.argv[1].includes("migrateFromJson")) {
      runMigration().catch((err) => {
        console.error("\u274C Direct migration failed:", err.message);
        process.exit(1);
      });
    }
  }
});

// server/index.ts
import express2 from "express";
import path5 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";

// server/api.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// server/db.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// src/data/seedDefaults.ts
var DEFAULT_HERO_SLIDES = [
  {
    id: "slide-01",
    badgeText: "KIZIMKAZI DIMBANI \u2022 SOUTH COAST ZANZIBAR",
    title: "Zanzibar Luxury Villa",
    subtitle: "Private Pool Retreat \u2022 Kizimkazi",
    description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. An intimate 8-villa sanctuary offering ocean-to-table dining and bespoke island journeys.",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Reserve Sanctuary",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Explore Sanctuary",
    secondaryCtaLink: "#itinerary",
    order: 1,
    visible: true
  },
  {
    id: "slide-02",
    badgeText: "SECLUDED BOTANICAL HIDEAWAY \u2022 MENAI BAY",
    title: "Makuti Garden Sanctuary",
    subtitle: "Boutique Private Pool Villa",
    description: "Tucked within fragrant frangipani and coconut palms in southern Zanzibar, offering total seclusion, an open-air stone shower, and serene garden verandah.",
    heroImage: "./zanzirangi-villas.jpg",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Discover Garden Villa",
    primaryCtaLink: "#stay",
    secondaryCtaText: "View Amenities",
    secondaryCtaLink: "#facilities",
    order: 2,
    visible: true
  },
  {
    id: "slide-03",
    badgeText: "TANZANIA SAFARI & ZANZIBAR BEACH PACKAGE",
    title: "Oceanfront Safari Villa",
    subtitle: "Private Presidential Residence",
    description: "The premier oceanfront residence at Zanzirangi House featuring a suspended infinity pool, expansive living pavilion, private chef dining, and direct Serengeti fly-in safari packages.",
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2400&q=90",
    videoUrl: "./Zanzirangi-home.mp4",
    primaryCtaText: "Reserve Presidential",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Inquire Concierge",
    secondaryCtaLink: "#contact",
    order: 3,
    visible: true
  }
];
var DEFAULT_SECTIONS = [
  { id: "hero", name: "01. Hero & Slide Carousel", title: "Hero Journey", subtitle: "Main Arrival", order: 1, visible: true },
  { id: "quickBooking", name: "02. Quick Search & Booking Bar", title: "Check Availability", subtitle: "Direct Reservation", order: 2, visible: true },
  { id: "intro", name: "03. Editorial Introduction", title: "More Than A Stay", subtitle: "Sanctuary Philosophy", order: 3, visible: true },
  { id: "villas", name: "04. Stay Your Way (Villas & Suites)", title: "Stay Your Way", subtitle: "Private Plunge Pool Villas", order: 4, visible: true },
  { id: "experience", name: "05. Property Experience", title: "Discover The Retreat", subtitle: "Architecture & Craft", order: 5, visible: true },
  { id: "dining", name: "06. Taste Zanzibar Dining", title: "Taste Zanzibar", subtitle: "From Garden To Ocean Table", order: 6, visible: true },
  { id: "experiences", name: "07. Curated Island Experiences", title: "Island Experiences", subtitle: "Beyond The Ordinary", order: 7, visible: true },
  { id: "explore", name: "08. Regional Exploration", title: "Explore Zanzibar", subtitle: "Iconic Landmarks & Marine Reefs", order: 8, visible: true },
  { id: "safari", name: "09. Beyond Zanzibar & Tanzania Safari", title: "Beyond Zanzibar", subtitle: "Tanzania Safari Expeditions", order: 9, visible: true },
  { id: "itinerary", name: "10. Custom Itinerary Builder", title: "Build Your Tanzania Journey", subtitle: "Interactive Day-by-Day Curation", order: 10, visible: true },
  { id: "shuttle", name: "11. Shuttle & Arrival Service", title: "Arrive & Relax", subtitle: "VIP Airport Chauffeur", order: 11, visible: true },
  { id: "concierge", name: "12. Dedicated Butler & Concierge", title: "Your Journey Personally Arranged", subtitle: "24/7 Hosting", order: 12, visible: true },
  { id: "whyStay", name: "13. Why Stay With Us", title: "Why Zanzirangi House", subtitle: "Sanctuary Differentiators", order: 13, visible: true },
  { id: "video", name: "14. Promotional Brand Film", title: "Cinematic Brand Reel", subtitle: "4K Ultra HD Storyboard", order: 14, visible: true },
  { id: "facilities", name: "15. Facilities & Amenities", title: "Resort Facilities", subtitle: "Spa, Pool & Pavilions", order: 15, visible: true },
  { id: "gallery", name: "16. Curated Photography Gallery", title: "Visual Archive", subtitle: "7 Luxury Categories", order: 16, visible: true },
  { id: "reviews", name: "17. Guest Impressions & Reviews", title: "Guest Testimonials", subtitle: "Verified Experiences", order: 17, visible: true },
  { id: "otaChannels", name: "18. OTA Trust Channels", title: "Global Distribution", subtitle: "Accredited Platforms", order: 18, visible: true },
  { id: "map", name: "19. Location & Interactive Map", title: "Finding Zanzirangi House", subtitle: "Kizimkazi Dimbani, South Coast", order: 19, visible: true },
  { id: "finalCta", name: "20. Final Call To Action", title: "Ready to Experience Zanzirangi House?", subtitle: "Direct Sanctuary Booking", order: 20, visible: true }
];
var DEFAULT_VILLAS = [
  {
    id: "villa-01",
    roomNumber: "VILLA 01",
    name: "Sultan Oceanfront Villa",
    type: "Master Ocean Villa with Private Plunge Pool",
    capacity: 2,
    bed: "Handcrafted King Four-Poster Bed",
    bathroom: "En-suite Stone Wet Room & Outdoor Rain Shower",
    size: "95 m\xB2 (1,022 sq ft)",
    view: "Direct Panoramic Indian Ocean & Sunset",
    pricePerNight: "$480",
    promotionalPrice: "$430",
    availability: true,
    featured: true,
    architecturalFeature: "Private plunge pool carved into coastal limestone with sunken sea lounge",
    shortDescription: "Perched directly above the coral cliff with uninterrupted ocean vistas, private plunge pool, and dedicated butler service.",
    description: "The Sultan Oceanfront Villa represents the pinnacle of barefoot luxury in Zanzibar. Inspired by classical Omani architecture and Swahili maritime traditions, this sanctuary features high timber ceilings, polished lime plaster walls, and expansive floor-to-ceiling glass that dissolves the boundary between indoors and the Indian Ocean. Step out onto your private sun deck with an infinity plunge pool, or unwind in the carved stone soak tub overlooking the evening dhows.",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private Ocean Plunge Pool",
      "Air Conditioning & Ceiling Fan",
      "High-Speed Wi-Fi",
      "Artisanal Gourmet Breakfast Included",
      "Complimentary Curated Mini Bar",
      "Freestanding Stone Soaking Tub",
      "Dedicated 24/7 Butler Service",
      "Organic Zanzibar Botanical Toiletries",
      "Nespresso Coffee Bar & Rare Teas",
      "Sunset Daybed & Yoga Mats"
    ],
    order: 1,
    status: "published"
  },
  {
    id: "villa-02",
    roomNumber: "VILLA 02",
    name: "Makuti Garden Sanctuary",
    type: "Secluded Botanical Garden Villa",
    capacity: 2,
    bed: "King Canopy Bed with Fine Egyptian Linen",
    bathroom: "Tropical Outdoor Garden Shower & Double Vanity",
    size: "78 m\xB2 (840 sq ft)",
    view: "Lush Botanical Gardens & Water Lilies",
    pricePerNight: "$390",
    promotionalPrice: "$350",
    availability: true,
    featured: false,
    architecturalFeature: "Traditional artisanal thatched makuti roof with natural cross-ventilation",
    shortDescription: "Tucked within fragrant frangipani and coconut palms, offering total seclusion, an open-air stone shower, and serene garden verandah.",
    description: "Immersed in indigenous tropical gardens, Villa 02 offers complete tranquility and privacy. Constructed using sustainably harvested timber, coconut palm thatch, and local coral ragstone, the villa remains naturally cool under the equatorial sun. Enjoy lazy afternoons reading on the daybed surrounded by birdsong, or indulge in an open-air rainwater shower under the canopy of night stars.",
    heroImage: "./zanzirangi-villas.jpg",
    images: [
      "./zanzirangi-villas.jpg",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Outdoor Rain Shower in Tropical Garden",
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Daily Farm-to-Table Breakfast",
      "Organic Mini Bar",
      "Private Verandah & Hammock",
      "Turn-down Aromatherapy Service",
      "Complimentary Beach Bicycles"
    ],
    order: 2,
    status: "published"
  },
  {
    id: "villa-03",
    roomNumber: "VILLA 03",
    name: "Coral Cove Villa",
    type: "Direct Beach Access Ocean Villa",
    capacity: 2,
    bed: "King Size Heritage Teak Bed",
    bathroom: "Marble En-Suite with Deep Bath",
    size: "85 m\xB2 (915 sq ft)",
    view: "Direct Turquoise Lagoon & White Sand",
    pricePerNight: "$440",
    promotionalPrice: "$400",
    availability: true,
    featured: false,
    architecturalFeature: "Step-down sandy path directly reaching private sun loungers on the shore",
    shortDescription: "Wake up to the soft rustle of palms and step straight from your wooden deck onto the powdery white sand of the Indian Ocean.",
    description: "A beachfront haven designed for ocean lovers. Villa 03 provides direct, private access to the crystalline waters of southern Zanzibar. Custom hardwood furnishings, hand-loomed linen throws, and curated African sculpture create an atmosphere of understated sophistication. Step outside barefoot to watch traditional fisherman dhows drift across the sunrise.",
    heroImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Direct Private Beach Access",
      "Private Sun Loungers & Parasol",
      "Air Conditioning & Ceiling Fans",
      "High-Speed Wi-Fi",
      "Organic Breakfast on Beach Deck",
      "Curated Wine & Spirits Bar",
      "Snorkeling Gear & Reef Shoes Provided",
      "Luxury Terry Bathrobes & Towels"
    ],
    order: 3,
    status: "published"
  },
  {
    id: "villa-04",
    roomNumber: "VILLA 04",
    name: "Kizimkazi Horizon Villa",
    type: "Elevated Oceanview Pavilion",
    capacity: 3,
    bed: "King Bed + Daybed Lounger",
    bathroom: "Twin Vanities & Panoramic Walk-in Shower",
    size: "90 m\xB2 (968 sq ft)",
    view: "Elevated 180\xB0 Ocean Horizon & Marine Reserve",
    pricePerNight: "$460",
    promotionalPrice: "$410",
    availability: true,
    featured: false,
    architecturalFeature: "Cantilevered timber deck extending out towards the marine sanctuary",
    shortDescription: "Elevated for supreme sea breezes and unobstructed horizons, featuring a wide panoramic verandah perfect for dolphin watching.",
    description: "Set on an elevated crest of the property, Villa 04 commands sweeping 180-degree vistas across Menai Bay Marine Sanctuary. During high tide, dolphins can frequently be spotted jumping along the outer reef line. The interior balances minimalist contemporary lines with warm earth tones, brass fixtures, and woven raffia accents.",
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Elevated Panoramic Ocean Deck",
      "High-Power Nautical Binoculars for Marine Watching",
      "Air Conditioning & Ceiling Fan",
      "High-Speed Wi-Fi",
      "Full Breakfast Service",
      "Mini Bar with Fresh Coconut Daily",
      "Double Rain Shower",
      "Outdoor Dining Table"
    ],
    order: 4,
    status: "published"
  },
  {
    id: "villa-05",
    roomNumber: "VILLA 05",
    name: "Baobab Palm Pavilion",
    type: "Two-Bedroom Family or Couple Suite",
    capacity: 4,
    bed: "Two King Beds (or King + Twin Suite)",
    bathroom: "2 Private En-Suite Bathrooms",
    size: "130 m\xB2 (1,400 sq ft)",
    view: "Ancient Baobab Trees & Distant Ocean Glimpse",
    pricePerNight: "$590",
    promotionalPrice: "$540",
    availability: true,
    featured: false,
    architecturalFeature: "Private enclosed courtyard wrapped around a centenary baobab tree",
    shortDescription: "A spacious two-bedroom sanctuary surrounded by sculptural baobabs, perfect for families or small groups seeking quiet luxury.",
    description: "Centered around an ancient, revered Baobab tree, this generous two-bedroom pavilion provides exceptional comfort for traveling companions or families. Featuring a shaded central living courtyard, two independent master suites each with their own open-air bathroom, and a private dining pergola.",
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "2 Master Bedrooms with Private En-suites",
      "Private Courtyard with Dining Pergola",
      "Air Conditioning in All Rooms",
      "High-Speed Wi-Fi",
      "Private Butler & Dedicated Family Host",
      "Full Gourmet Breakfast Service",
      "Board Games & Stargazing Telescope"
    ],
    order: 5,
    status: "published"
  },
  {
    id: "villa-06",
    roomNumber: "VILLA 06",
    name: "Zanzibar Spice Villa",
    type: "Heritage Villa with Private Lap Pool",
    capacity: 2,
    bed: "Hand-Carved Zanzibar Teak King Bed",
    bathroom: "Stone En-Suite & Copper Soaking Tub",
    size: "110 m\xB2 (1,184 sq ft)",
    view: "Private Pool, Coconut Grove & Ocean Shimmer",
    pricePerNight: "$520",
    promotionalPrice: "$470",
    availability: true,
    featured: false,
    architecturalFeature: "Hand-chiseled antique Swahili brass-studded doors and 12m private lap pool",
    shortDescription: "Celebrates Zanzibar\u2019s fabled spice heritage with authentic carved doors, private lap pool, and aromatic botanical courtyard.",
    description: "A tribute to the Spice Island\u2019s golden age of artisanal craftsmanship. Villa 06 features authentic brass-studded carved doors from Stone Town master carvers, hand-poured terrazzo floors, and a private 12-meter fresh water lap pool fringed by clove and lemongrass bushes.",
    heroImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private 12m Fresh Water Lap Pool",
      "Antique Hammered Copper Soaking Tub",
      "Air Conditioning & Cross-Breeze Louvers",
      "High-Speed Wi-Fi",
      "Complimentary Spice Tasting & Tea Ritual",
      "Artisanal Breakfast in Private Courtyard",
      "Butler Service"
    ],
    order: 6,
    status: "published"
  },
  {
    id: "villa-07",
    roomNumber: "VILLA 07",
    name: "Serengeti Breeze Villa",
    type: "Minimalist Modern Coastal Villa",
    capacity: 2,
    bed: "Ultra-Comfort King Bed with Natural Latex Mattress",
    bathroom: "Minimalist Terrazzo Shower & Garden Tub",
    size: "88 m\xB2 (947 sq ft)",
    view: "Ocean Panorama & Rooftop Stargazing Deck",
    pricePerNight: "$450",
    promotionalPrice: "$410",
    availability: true,
    featured: false,
    architecturalFeature: "Private spiral stairs leading to rooftop starlight daybed",
    shortDescription: "Sleek architectural lines, warm natural materials, and an exclusive rooftop observation deck for equatorial stargazing.",
    description: "Conceived for the design-conscious traveler, Villa 07 fuses Japanese-Scandinavian minimalism with East African earthiness. Soothing neutral tones, hand-woven sisal carpets, and an exclusive rooftop observation deck equipped with daybeds make this a haven for moonlit relaxation and tranquil meditation.",
    heroImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Rooftop Stargazing & Sunset Terrace",
      "Air Conditioning",
      "High-Speed Wi-Fi",
      "Daily In-Villa Breakfast",
      "Curated Wine & Spirits Selection",
      "Bang & Olufsen Bluetooth Acoustics",
      "Bespoke Pillow Menu"
    ],
    order: 7,
    status: "published"
  },
  {
    id: "villa-08",
    roomNumber: "VILLA 08",
    name: "The Royal Presidential Villa",
    type: "Grand Two-Story Master Estate",
    capacity: 6,
    bed: "2 King Master Suites + Twin Bedroom",
    bathroom: "3 Luxurious En-Suite Bathrooms + Powder Room",
    size: "240 m\xB2 (2,583 sq ft)",
    view: "Unrivaled 360\xB0 Indian Ocean & Coastal Bluff",
    pricePerNight: "$950",
    promotionalPrice: "$890",
    availability: true,
    featured: true,
    architecturalFeature: "Private infinity pool, chef prep kitchen, private dhow jetty, and dedicated 24-hour butler team",
    shortDescription: "The flagship residence of Zanzirangi House. Unparalleled oceanfront grandeur, multi-level infinity pools, and discrete private hosting.",
    description: "The estate\u2019s most exclusive address. Set on its own secluded promontory, The Royal Presidential Villa offers total autonomy, expansive entertaining salons, a private oceanfront infinity pool suspended over the coral lagoon, a private chef service on request, and direct private beach access.",
    heroImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
    images: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85"
    ],
    amenities: [
      "Private Multi-Level Infinity Pool",
      "Dedicated 24-Hour Private Butler & Host",
      "Private Chef Available for In-Villa Banquets",
      "3 Master Suites with Luxury En-suites",
      "Direct Private Beach Cove & Sundeck",
      "Air Conditioning in All Quarters",
      "High-Speed Wi-Fi & Smart Entertainment",
      "Complimentary VIP Airport Chauffeur Transfers",
      "Fully Stocked Premium Bar & Champagne on Arrival"
    ],
    order: 8,
    status: "published"
  }
];
var DEFAULT_GALLERY = [
  {
    id: "g-prop-01",
    title: "Cliffside Oceanfront Sanctuary",
    category: "property",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "The sweeping coastal grounds of Zanzirangi House overlooking Menai Bay.",
    order: 1,
    published: true
  },
  {
    id: "g-prop-02",
    title: "Swahili Coral Ragstone Architecture",
    category: "property",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85",
    aspect: "portrait",
    caption: "Sustainable indigenous timber, makuti thatch roofs, and artisanal stone craftsmanship.",
    order: 2,
    published: true
  },
  {
    id: "g-prop-03",
    title: "Twilight Over Menai Bay Shoreline",
    category: "property",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
    aspect: "landscape",
    caption: "Sunset hues reflecting across private beachfront daybeds and gentle evening tides.",
    order: 3,
    published: true
  },
  {
    id: "g-vil-real",
    title: "Zanzirangi Villa Access Pathway",
    category: "villas",
    image: "./zanzirangi-villas.jpg",
    aspect: "portrait",
    caption: "Atmospheric evening stone pathway winding to private thatched Makuti villas amidst illuminated tropical palms.",
    order: 4,
    published: true
  },
  {
    id: "g-vil-01",
    title: "Sultan Oceanfront Villa Sun Deck",
    category: "villas",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Private timber deck with personal plunge pool overlooking the turquoise Indian Ocean.",
    order: 5,
    published: true
  },
  {
    id: "g-vil-02",
    title: "Hand-Carved Zanzibar Four-Poster Teak Bed",
    category: "villas",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
    aspect: "portrait",
    caption: "Egyptian cotton linens and natural ocean breeze cross-ventilation in the Master Suite.",
    order: 6,
    published: true
  },
  {
    id: "g-din-01",
    title: "Ocean-to-Table Candlelit Dinner",
    category: "dining",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Artisanal Swahili cuisine served under the stars with fresh Menai Bay yellowfin tuna.",
    order: 7,
    published: true
  },
  {
    id: "g-pool-01",
    title: "Horizon Infinity Pool at High Tide",
    category: "pool",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "The main freshwater infinity pool blending seamlessly into the southern turquoise reef.",
    order: 8,
    published: true
  },
  {
    id: "g-gar-01",
    title: "Frangipani & Centenary Baobab Groves",
    category: "garden",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Indigenous coastal flora and medicinal botanicals cultivated organically on site.",
    order: 9,
    published: true
  },
  {
    id: "g-zan-01",
    title: "Traditional Wooden Dhow Sailing",
    category: "zanzibar",
    image: "https://images.unsplash.com/photo-1534759846116-5799c33ce22a?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "A classical hand-hewn lateen-sail dhow catching the afternoon trade wind.",
    order: 10,
    published: true
  },
  {
    id: "g-exp-01",
    title: "Menai Bay Dolphin Marine Sanctuary",
    category: "experiences",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=85",
    aspect: "landscape",
    caption: "Ethical sunrise encounters with resident wild bottlenose pods right off Kizimkazi.",
    order: 11,
    published: true
  }
];
var DEFAULT_FACILITIES = [
  {
    id: "pool",
    title: "Oceanfront Infinity Pool",
    category: "Relaxation & Wellness",
    description: "Suspended above the turquoise tides of the Indian Ocean, our 25-meter freshwater infinity pool mirrors the sky and ocean horizons with sunken sunbeds and attentive poolside service.",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85",
    hours: "06:30 \u2013 22:00 Daily",
    highlight: "Heated freshwater with ocean horizon views",
    order: 1,
    visible: true
  },
  {
    id: "dining",
    title: "The Tamarind Dining Pavilion",
    category: "Culinary Arts",
    description: "An open-air pavilion beneath vaulted Makuti thatch offering panoramic ocean views. Experience fine dining infused with the aromas of Zanzibar spices and the freshest catches of the day.",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=85",
    hours: "Breakfast, Lunch & Dinner",
    highlight: "Farm-to-table organic produce & fresh daily seafood",
    order: 2,
    visible: true
  },
  {
    id: "massage",
    title: "Swahili Botanical Spa & Massage",
    category: "Holistic Wellness",
    description: "Secluded open-air spa salas nestled in coastal gardens. Indulge in bespoke massages using cold-pressed Zanzibar coconut oil, lemongrass, ground cloves, and indigenous African botanicals.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    hours: "08:00 \u2013 20:00 by Appointment",
    highlight: "Authentic Clove & Lemongrass Aromatherapy",
    order: 3,
    visible: true
  },
  {
    id: "bbq",
    title: "Barefoot Beach BBQ & Firepit",
    category: "Evening Gathering",
    description: "As the sun dips into the Indian Ocean, gather around our shoreline firepit for grilled lobster, tiger prawns, and spiced tenderloins cooked over coconut husks under the African constellations.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
    hours: "Sunset from 18:30",
    highlight: "Oceanfront candlelit dining with live acoustic Taarab music",
    order: 4,
    visible: true
  },
  {
    id: "breakfast",
    title: "Artisanal Gourmet Breakfast",
    category: "Morning Ritual",
    description: "Awaken to tropical fruit platters from local orchards, freshly baked brioche, passion fruit curd, Tanzanian arabica coffee, and eggs cooked to your preference in your villa or by the sea.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=85",
    hours: "07:00 \u2013 11:00 (In-Villa or Pavilion)",
    highlight: "Complimentary for all staying guests",
    order: 5,
    visible: true
  },
  {
    id: "wifi",
    title: "High-Speed Starlink Satellite Wi-Fi",
    category: "Connectivity",
    description: "Enjoy blazing-fast, low-latency satellite internet across the entire estate, private villas, beachfront loungers, and dining terraces, ensuring seamless communication and remote productivity.",
    image: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=85",
    hours: "24/7 Unlimited High Speed",
    highlight: "Reliable fiber-speed connectivity in every corner",
    order: 6,
    visible: true
  }
];
var DEFAULT_TESTIMONIALS = [
  {
    id: "rev-01",
    guestName: "Eleanor & Marcus Vance",
    country: "United Kingdom",
    countryCode: "GB",
    rating: 5,
    stayDate: "November 2025",
    villaStayed: "Sultan Oceanfront Villa",
    title: "An absolute paradise beyond all expectations",
    reviewText: "From the moment our private chauffeur welcomed us at Zanzibar Airport to our final sunset dhow sail, every detail was orchestrated to absolute perfection. The plunge pool perched over the ocean tide was magical.",
    featured: true,
    verified: true,
    visible: true,
    order: 1
  },
  {
    id: "rev-02",
    guestName: "Jean-Philippe de Montmirail",
    country: "France",
    countryCode: "FR",
    rating: 5,
    stayDate: "January 2026",
    villaStayed: "Makuti Garden Sanctuary",
    title: "Authentic elegance and supreme tranquility",
    reviewText: "The architectural restraint, use of indigenous coral stone, and attentive but discrete butler service reminded us of the very finest Aman or Singita lodges. The Swahili coconut seafood dinner was unforgettable.",
    featured: true,
    verified: true,
    visible: true,
    order: 2
  },
  {
    id: "rev-03",
    guestName: "Clara & Henrik Lindstr\xF6m",
    country: "Sweden",
    countryCode: "SE",
    rating: 5,
    stayDate: "February 2026",
    villaStayed: "The Royal Presidential Villa",
    title: "The ultimate private sanctuary in East Africa",
    reviewText: "We traveled as a family of five. Having our own private infinity pool suspended above the coral lagoon and our personal chef preparing fresh catches each evening redefined what luxury travel means to us.",
    featured: true,
    verified: true,
    visible: true,
    order: 3
  },
  {
    id: "rev-04",
    guestName: "Dr. Tariq & Amina Al-Mansoor",
    country: "United Arab Emirates",
    countryCode: "AE",
    rating: 5,
    stayDate: "December 2025",
    villaStayed: "Zanzibar Spice Villa",
    title: "Deeply restorative and culturally rich",
    reviewText: "The antique carved brass doors and private lap pool created a serene atmosphere. Waking up to ocean breezes and seeing wild dolphins on the sunrise dhow excursion was a lifelong highlight.",
    featured: false,
    verified: true,
    visible: true,
    order: 4
  },
  {
    id: "rev-05",
    guestName: "Sipho & Lerato Khumalo",
    country: "South Africa",
    countryCode: "ZA",
    rating: 5,
    stayDate: "October 2025",
    villaStayed: "Coral Cove Villa",
    title: "Genuine African hospitality at an international standard",
    reviewText: "Stepping directly from our villa deck into the warm turquoise Indian Ocean was pure bliss. The staff\u2019s warmth and attention to detail made us feel like honored family in Tanzania.",
    featured: false,
    verified: true,
    visible: true,
    order: 5
  }
];
var DEFAULT_VIDEOS = {
  id: "main-brand-reel",
  title: "Cinematic Brand Reel",
  eyebrow: "Experience The Sanctuary",
  badge: "4K Ultra HD \u2022 Concept Storyboard",
  videoUrl: "./Zanzirangi-home.mp4",
  posterImage: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85",
  scenes: [
    { id: "sc-1", order: 1, description: "Private airport chauffeur arrival & traditional iced lemongrass towel welcome" },
    { id: "sc-2", order: 2, description: "Makuti timber architecture nestled within ancient baobab groves" },
    { id: "sc-3", order: 3, description: "Handcrafted teak interiors, floor-to-ceiling glass, and limestone plunge pool" },
    { id: "sc-4", order: 4, description: "Freshwater infinity pool overlooking the turquoise Menai Bay reef" },
    { id: "sc-5", order: 5, description: "Farm-fresh Swahili spices, wild yellowfin tuna, and candlelit ocean pavilion" },
    { id: "sc-6", order: 6, description: "Hand-hewn dhow wooden boat sailing into the Indian Ocean golden twilight" },
    { id: "sc-7", order: 7, description: "The gateway to the Serengeti & wild Tanzanian mainland expeditions" }
  ],
  visible: true
};
var DEFAULT_SEO = {
  siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
  defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
  googleSiteVerification: "zanzirangi-verification-code",
  routes: {
    "/": {
      path: "/",
      title: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.",
      canonical: "https://zanzirangihouse.com/",
      robots: "index, follow"
    },
    "/villas": {
      path: "/villas",
      title: "Private Luxury Villas in Zanzibar | Zanzirangi House",
      description: "Explore 8 exclusive private plunge pool villas in Kizimkazi, Zanzibar. Handcrafted coral stone suites with dedicated 24/7 butler service.",
      canonical: "https://zanzirangihouse.com/villas",
      robots: "index, follow"
    },
    "/dining": {
      path: "/dining",
      title: "Oceanfront Dining in Zanzibar | Zanzirangi House",
      description: "Artisanal ocean-to-table gastronomy featuring line-caught Kizimkazi seafood, rare Swahili spices, and private sunset beach candlelit dinners.",
      canonical: "https://zanzirangihouse.com/dining",
      robots: "index, follow"
    },
    "/experiences": {
      path: "/experiences",
      title: "Zanzibar Experiences & Private Tours | Zanzirangi House",
      description: "Bespoke Zanzibar island tours: ethical Menai Bay dolphin dhow safaris, Stone Town UNESCO heritage walks, and organic spice farm excursions.",
      canonical: "https://zanzirangihouse.com/experiences",
      robots: "index, follow"
    },
    "/safari": {
      path: "/safari",
      title: "Tanzania Safari from Zanzibar | Zanzirangi House",
      description: "Seamless fly-in bush and beach safaris connecting Zanzibar to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro.",
      canonical: "https://zanzirangihouse.com/safari",
      robots: "index, follow"
    },
    "/about": {
      path: "/about",
      title: "About Zanzirangi House | Barefoot Luxury Sanctuary in Kizimkazi",
      description: "Learn about Zanzirangi House\u2014an ultra-boutique 8-villa sanctuary in Kizimkazi Dimbani combining Swahili-Omani heritage with barefoot eco-luxury.",
      canonical: "https://zanzirangihouse.com/about",
      robots: "index, follow"
    },
    "/contact": {
      path: "/contact",
      title: "Contact & Book Zanzirangi House Zanzibar | Direct Reservations",
      description: "Contact our 24/7 concierge for direct villa reservations, airport chauffeur transfers from ZNZ, and personalized Tanzania safari itinerary planning.",
      canonical: "https://zanzirangihouse.com/contact",
      robots: "index, follow"
    }
  }
};
var DEFAULT_MEDIA = [
  {
    id: "med-01",
    filename: "hero-ocean-plunge.jpg",
    url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 1245e3,
    altText: "Sultan Oceanfront Villa private plunge pool overlooking Indian Ocean",
    caption: "Master Villa sun deck at high tide",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 4
  },
  {
    id: "med-02",
    filename: "zanzirangi-villas.jpg",
    url: "./zanzirangi-villas.jpg",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 84e4,
    altText: "Atmospheric evening Makuti thatched villas pathway",
    caption: "Authentic villa architecture at dusk",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 3
  },
  {
    id: "med-03",
    filename: "infinity-pool-reef.jpg",
    url: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85",
    type: "image",
    mimeType: "image/jpeg",
    sizeBytes: 98e4,
    altText: "Freshwater 25-meter infinity pool suspended above Menai Bay",
    caption: "Ocean horizon infinity pool view",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 3
  },
  {
    id: "med-04",
    filename: "Zanzirangi-home.mp4",
    url: "./Zanzirangi-home.mp4",
    type: "video",
    mimeType: "video/mp4",
    sizeBytes: 1684578,
    altText: "Zanzirangi House 4K Cinematic Ambient Reel",
    caption: "Official property ambient film",
    uploadedAt: "2026-09-01T00:00:00.000Z",
    referenceCount: 2
  }
];
var DEFAULT_SETTINGS = {
  siteName: "Zanzirangi House",
  tagline: "Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar",
  defaultCurrency: "USD ($)",
  reservationNotificationEmail: "reservations@zanzirangihouse.com",
  conciergePhone: "+255 777 890 123",
  maintenanceMode: false
};

// server/db.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.resolve(__dirname, "data");
var DB_FILE = path.join(DATA_DIR, "db.json");
var DEFAULT_HOMEPAGE_CONTENT = {
  hero: {
    title: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
    subtitle: "YOUR PRIVATE GATEWAY TO ZANZIBAR",
    description: "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.",
    badgeText: "KIZIMKAZI DIMBANI \u2022 SOUTH COAST ZANZIBAR",
    primaryCtaText: "Reserve Sanctuary",
    primaryCtaLink: "#stay",
    secondaryCtaText: "Explore Sanctuary",
    secondaryCtaLink: "#itinerary",
    heroImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
    slides: DEFAULT_HERO_SLIDES,
    autoPlayIntervalSeconds: 6
  },
  sections: DEFAULT_SECTIONS,
  intro: {
    eyebrow: "MORE THAN A STAY",
    title: "An intimate sanctuary between the ocean breeze and Swahili heritage",
    description: "Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani."
  },
  contact: {
    phone: "+255 777 890 123",
    email: "concierge@zanzirangihouse.com",
    whatsappNumber: "255777890123",
    address: "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania",
    googleMapsUrl: "https://maps.google.com/?q=Kizimkazi+Dimbani+Zanzibar"
  },
  socials: {
    instagram: "https://instagram.com/zanzirangihouse",
    facebook: "https://facebook.com/zanzirangihouse",
    tiktok: "https://tiktok.com/@zanzirangihouse",
    youtube: "https://youtube.com/@zanzirangihouse",
    whatsapp: "https://wa.me/255777890123"
  },
  footer: {
    copyrightText: "\xA9 2026 Zanzirangi House. All rights reserved. Ultra-Boutique Luxury Sanctuary in Kizimkazi Dimbani, Zanzibar, Tanzania.",
    tagline: "A tranquil coastal sanctuary in Kizimkazi Dimbani."
  },
  meta: {
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    updatedBy: "system"
  }
};
var INITIAL_ADMINS = [
  {
    email: "info@zanzirangihouse.com",
    name: "Zanzirangi Head Concierge",
    role: "superadmin"
  },
  {
    email: "dominic@zanzirangihouse.com",
    name: "Dominic - Property Director",
    role: "admin"
  },
  {
    email: "dotto@zanzirangihouse.com",
    name: "Dotto - Guest Operations",
    role: "admin"
  },
  {
    email: "jocelyn@zanzirangihouse.com",
    name: "Jocelyn - Hospitality Manager",
    role: "admin"
  },
  {
    email: "saleh@zanzirangihouse.com",
    name: "Saleh - Operations Lead",
    role: "admin"
  }
];
var dbCache = null;
function initDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const initialBootstrapPassword = process.env.ADMIN_INITIAL_PASSWORD || "ChangeMeImmediately2026!";
  const salt = bcrypt.genSaltSync(12);
  const defaultHash = bcrypt.hashSync(initialBootstrapPassword, salt);
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.homepage) {
        let mutated = false;
        if (!parsed.homepage.hero.slides || parsed.homepage.hero.slides.length === 0) {
          parsed.homepage.hero.slides = DEFAULT_HERO_SLIDES;
          parsed.homepage.hero.autoPlayIntervalSeconds = 6;
          mutated = true;
        }
        if (!parsed.homepage.sections || parsed.homepage.sections.length === 0) {
          parsed.homepage.sections = DEFAULT_SECTIONS;
          mutated = true;
        }
        if (!parsed.homepage.socials) {
          parsed.homepage.socials = DEFAULT_HOMEPAGE_CONTENT.socials;
          mutated = true;
        }
        if (!parsed.homepage.footer) {
          parsed.homepage.footer = DEFAULT_HOMEPAGE_CONTENT.footer;
          mutated = true;
        }
        if (!parsed.villas || parsed.villas.length === 0) {
          parsed.villas = DEFAULT_VILLAS;
          mutated = true;
        }
        if (!parsed.gallery || parsed.gallery.length === 0) {
          parsed.gallery = DEFAULT_GALLERY;
          mutated = true;
        }
        if (!parsed.facilities || parsed.facilities.length === 0) {
          parsed.facilities = DEFAULT_FACILITIES;
          mutated = true;
        }
        if (!parsed.testimonials || parsed.testimonials.length === 0) {
          parsed.testimonials = DEFAULT_TESTIMONIALS;
          mutated = true;
        }
        if (!parsed.videos) {
          parsed.videos = DEFAULT_VIDEOS;
          mutated = true;
        }
        if (!parsed.seo) {
          parsed.seo = DEFAULT_SEO;
          mutated = true;
        }
        if (!parsed.media || parsed.media.length === 0) {
          parsed.media = DEFAULT_MEDIA;
          mutated = true;
        }
        if (!parsed.settings) {
          parsed.settings = DEFAULT_SETTINGS;
          mutated = true;
        }
        if (mutated) {
          saveDatabase(parsed);
        }
        dbCache = parsed;
        return dbCache;
      }
    } catch (e) {
      console.error("Error reading existing database, re-initializing...", e);
    }
  }
  const initialDb = {
    users: INITIAL_ADMINS.map((admin, idx) => ({
      id: `usr_${idx + 1}`,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      passwordHash: defaultHash,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    })),
    homepage: DEFAULT_HOMEPAGE_CONTENT,
    villas: DEFAULT_VILLAS,
    gallery: DEFAULT_GALLERY,
    facilities: DEFAULT_FACILITIES,
    testimonials: DEFAULT_TESTIMONIALS,
    videos: DEFAULT_VIDEOS,
    seo: DEFAULT_SEO,
    media: DEFAULT_MEDIA,
    settings: DEFAULT_SETTINGS,
    auditLog: [
      {
        action: "DB_INITIALIZED",
        userEmail: "system",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        details: "Initial database created with authorized Zanzirangi mailboxes and full content models"
      }
    ]
  };
  saveDatabase(initialDb);
  dbCache = initialDb;
  return initialDb;
}
var lastMtime = 0;
function getDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const stat = fs.statSync(DB_FILE);
      if (!dbCache || stat.mtimeMs > lastMtime) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        dbCache = JSON.parse(raw);
        lastMtime = stat.mtimeMs;
      }
      return dbCache;
    } catch {
    }
  }
  if (!dbCache) {
    return initDatabase();
  }
  return dbCache;
}
function saveDatabase(data) {
  dbCache = data;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, DB_FILE);
  try {
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {
  }
}

// server/database/jsonAdapter.ts
var JsonDatabaseAdapter = class {
  constructor() {
    this.provider = "json";
  }
  async connect() {
    initDatabase();
  }
  async disconnect() {
  }
  async healthCheck() {
    try {
      const db = getDatabase();
      return {
        connected: !!db && Array.isArray(db.users),
        provider: "json"
      };
    } catch (err) {
      return {
        connected: false,
        provider: "json",
        error: err.message
      };
    }
  }
  // --- Homepage ---
  async getHomepage() {
    const db = getDatabase();
    return db.homepage || DEFAULT_HOMEPAGE_CONTENT;
  }
  async updateHomepage(data, userEmail) {
    const db = getDatabase();
    const current = db.homepage || DEFAULT_HOMEPAGE_CONTENT;
    db.homepage = {
      ...current,
      ...data,
      meta: {
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: userEmail
      }
    };
    db.auditLog.push({
      action: "HOMEPAGE_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated sanctuary homepage content & layout"
    });
    saveDatabase(db);
    return db.homepage;
  }
  // --- Villas ---
  async getVillas() {
    const db = getDatabase();
    return db.villas || [];
  }
  async getVillaById(id) {
    const db = getDatabase();
    return (db.villas || []).find((v) => v.id === id) || null;
  }
  async saveVilla(villa, userEmail) {
    const db = getDatabase();
    const list = db.villas || [];
    const idx = list.findIndex((v) => v.id === villa.id);
    if (idx >= 0) {
      list[idx] = villa;
    } else {
      list.push(villa);
    }
    db.villas = list;
    db.auditLog.push({
      action: idx >= 0 ? "VILLA_UPDATED" : "VILLA_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved villa entity: ${villa.name} (${villa.id})`
    });
    saveDatabase(db);
    return villa;
  }
  async deleteVilla(id, userEmail) {
    const db = getDatabase();
    const list = db.villas || [];
    const filtered = list.filter((v) => v.id !== id);
    if (filtered.length === list.length) return false;
    db.villas = filtered;
    db.auditLog.push({
      action: "VILLA_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed villa ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Gallery ---
  async getGallery() {
    const db = getDatabase();
    return db.gallery || [];
  }
  async saveGalleryItem(item, userEmail) {
    const db = getDatabase();
    const list = db.gallery || [];
    const idx = list.findIndex((g) => g.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    db.gallery = list;
    db.auditLog.push({
      action: idx >= 0 ? "GALLERY_UPDATED" : "GALLERY_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved gallery photograph: ${item.title} (${item.id})`
    });
    saveDatabase(db);
    return item;
  }
  async deleteGalleryItem(id, userEmail) {
    const db = getDatabase();
    const list = db.gallery || [];
    const filtered = list.filter((g) => g.id !== id);
    if (filtered.length === list.length) return false;
    db.gallery = filtered;
    db.auditLog.push({
      action: "GALLERY_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed gallery item ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Facilities ---
  async getFacilities() {
    const db = getDatabase();
    return db.facilities || [];
  }
  async saveFacility(facility, userEmail) {
    const db = getDatabase();
    const list = db.facilities || [];
    const idx = list.findIndex((f) => f.id === facility.id);
    if (idx >= 0) {
      list[idx] = facility;
    } else {
      list.push(facility);
    }
    db.facilities = list;
    db.auditLog.push({
      action: idx >= 0 ? "FACILITY_UPDATED" : "FACILITY_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved facility: ${facility.title} (${facility.id})`
    });
    saveDatabase(db);
    return facility;
  }
  // --- Testimonials ---
  async getTestimonials() {
    const db = getDatabase();
    return db.testimonials || [];
  }
  async saveTestimonial(testimonial, userEmail) {
    const db = getDatabase();
    const list = db.testimonials || [];
    const idx = list.findIndex((t) => t.id === testimonial.id);
    if (idx >= 0) {
      list[idx] = testimonial;
    } else {
      list.push(testimonial);
    }
    db.testimonials = list;
    db.auditLog.push({
      action: idx >= 0 ? "TESTIMONIAL_UPDATED" : "TESTIMONIAL_CREATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved guest impression: ${testimonial.guestName} (${testimonial.id})`
    });
    saveDatabase(db);
    return testimonial;
  }
  async deleteTestimonial(id, userEmail) {
    const db = getDatabase();
    const list = db.testimonials || [];
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) return false;
    db.testimonials = filtered;
    db.auditLog.push({
      action: "TESTIMONIAL_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed testimonial ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Videos ---
  async getVideos() {
    const db = getDatabase();
    return db.videos || {
      videoUrl: "https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4",
      posterImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
      scenes: []
    };
  }
  async updateVideos(data, userEmail) {
    const db = getDatabase();
    const current = await this.getVideos();
    db.videos = { ...current, ...data };
    db.auditLog.push({
      action: "VIDEOS_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated 4K cinematic film & storyboard scenes"
    });
    saveDatabase(db);
    return db.videos;
  }
  // --- SEO ---
  async getSeo() {
    const db = getDatabase();
    return db.seo || {
      siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
      routes: {}
    };
  }
  async updateSeo(data, userEmail) {
    const db = getDatabase();
    const current = await this.getSeo();
    db.seo = { ...current, ...data };
    db.auditLog.push({
      action: "SEO_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated SERP metadata and route SEO configurations"
    });
    saveDatabase(db);
    return db.seo;
  }
  // --- Media ---
  async getMedia() {
    const db = getDatabase();
    return db.media || [];
  }
  async saveMedia(asset, userEmail) {
    const db = getDatabase();
    const list = db.media || [];
    const idx = list.findIndex((m) => m.id === asset.id);
    if (idx >= 0) {
      list[idx] = asset;
    } else {
      list.unshift(asset);
    }
    db.media = list;
    db.auditLog.push({
      action: idx >= 0 ? "MEDIA_UPDATED" : "MEDIA_UPLOADED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Saved media asset: ${asset.filename}`
    });
    saveDatabase(db);
    return asset;
  }
  async deleteMedia(id, userEmail) {
    const db = getDatabase();
    const list = db.media || [];
    const filtered = list.filter((m) => m.id !== id);
    if (filtered.length === list.length) return false;
    db.media = filtered;
    db.auditLog.push({
      action: "MEDIA_DELETED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: `Removed media record ID: ${id}`
    });
    saveDatabase(db);
    return true;
  }
  // --- Settings ---
  async getSettings() {
    const db = getDatabase();
    return db.settings || DEFAULT_SETTINGS;
  }
  async updateSettings(data, userEmail) {
    const db = getDatabase();
    db.settings = { ...db.settings || DEFAULT_SETTINGS, ...data };
    db.auditLog.push({
      action: "SETTINGS_UPDATED",
      userEmail,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: "Updated sanctuary system settings"
    });
    saveDatabase(db);
    return db.settings;
  }
  // --- Users & Auth ---
  async findUserByEmail(email) {
    const db = getDatabase();
    const normalized = email.trim().toLowerCase();
    const u = db.users.find((user) => user.email.toLowerCase() === normalized);
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    };
  }
  async saveUser(user) {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    saveDatabase(db);
  }
  async listUsers() {
    const db = getDatabase();
    return db.users.map(({ passwordHash, ...safe }) => safe);
  }
  // --- Audit Logs ---
  async getAuditLogs(limit = 20) {
    const db = getDatabase();
    return [...db.auditLog || []].reverse().slice(0, limit);
  }
  async addAuditLog(entry) {
    const db = getDatabase();
    db.auditLog.push({
      ...entry,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    saveDatabase(db);
  }
  // --- Dashboard Stats ---
  async getDashboardStats() {
    const db = getDatabase();
    const recentLogs = await this.getAuditLogs(10);
    return {
      status: "Connected",
      lastPublished: db.homepage?.meta?.lastUpdated || null,
      publishedBy: db.homepage?.meta?.updatedBy || null,
      counts: {
        villasPublished: (db.villas || []).filter((v) => v.status === "published").length,
        villasTotal: (db.villas || []).length,
        galleryItems: (db.gallery || []).length,
        facilities: (db.facilities || []).length,
        testimonials: (db.testimonials || []).length,
        mediaAssets: (db.media || []).length
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details
      }))
    };
  }
};

// server/database/mysqlAdapter.ts
init_env();
import mysql2 from "mysql2/promise";
var MysqlDatabaseAdapter = class {
  constructor() {
    this.provider = "mysql";
    this.pool = null;
  }
  getPool() {
    if (!this.pool) {
      this.pool = mysql2.createPool({
        host: env.MYSQL_HOST || "localhost",
        port: env.MYSQL_PORT || 3306,
        database: env.MYSQL_DATABASE || "zanzirangi_house",
        user: env.MYSQL_USER || "root",
        password: env.MYSQL_PASSWORD || "",
        waitForConnections: true,
        connectionLimit: env.MYSQL_CONNECTION_LIMIT || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 1e4
      });
    }
    return this.pool;
  }
  async connect() {
    try {
      const pool = this.getPool();
      const conn = await pool.getConnection();
      conn.release();
      console.log(`\u{1F42C} Connected to Hostinger MySQL Database [${env.MYSQL_DATABASE}@${env.MYSQL_HOST}]`);
      try {
        const [tables] = await pool.query("SHOW TABLES LIKE 'homepage_config'");
        if (!tables || tables.length === 0) {
          console.log("\u26A1 Fresh Hostinger database detected. Initializing schema and baseline content...");
          const { runMigration: runMigration2 } = await Promise.resolve().then(() => (init_migrateFromJson(), migrateFromJson_exports));
          await runMigration2(pool);
          console.log("\u2705 Hostinger MySQL schema initialized and seeded successfully.");
        } else {
          console.log("\u2705 Hostinger MySQL schema verified and ready.");
        }
      } catch (schemaErr) {
        console.warn("\u26A0\uFE0F Hostinger schema verification notice:", schemaErr.message);
      }
    } catch (err) {
      console.error("\u274C Failed to establish MySQL connection:", err.message);
      throw err;
    }
  }
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log("\u{1F42C} MySQL connection pool closed gracefully.");
    }
  }
  async healthCheck() {
    try {
      const pool = this.getPool();
      const [rows] = await pool.query("SELECT 1 as healthy");
      return {
        connected: Array.isArray(rows) && rows.length > 0,
        provider: "mysql"
      };
    } catch (err) {
      return {
        connected: false,
        provider: "mysql",
        error: err.message
      };
    }
  }
  // --- Homepage ---
  async getHomepage() {
    const pool = this.getPool();
    const [cfgRows] = await pool.query("SELECT * FROM homepage_config WHERE id = 1 LIMIT 1");
    const [slideRows] = await pool.query("SELECT * FROM hero_slides ORDER BY sort_order ASC");
    const [secRows] = await pool.query("SELECT * FROM homepage_sections ORDER BY sort_order ASC");
    const cfg = cfgRows[0] || {};
    let socials = {
      instagram: "https://instagram.com/zanzirangihouse",
      facebook: "https://facebook.com/zanzirangihouse",
      tiktok: "https://tiktok.com/@zanzirangihouse",
      youtube: "https://youtube.com/@zanzirangihouse",
      whatsapp: "https://wa.me/255777890123"
    };
    if (cfg.socials_json) {
      try {
        socials = JSON.parse(cfg.socials_json);
      } catch {
      }
    }
    return {
      hero: {
        title: cfg.hero_title || "Zanzirangi House",
        subtitle: cfg.hero_subtitle || "\u2014 Private Luxury Villas in Zanzibar",
        description: cfg.hero_description || "Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi.",
        badgeText: cfg.hero_badge_text || "ZANZIBAR, TANZANIA",
        primaryCtaText: cfg.hero_primary_cta_text || "Reserve Sanctuary",
        primaryCtaLink: cfg.hero_primary_cta_link || "#stay",
        secondaryCtaText: cfg.hero_secondary_cta_text || "Explore Sanctuary",
        secondaryCtaLink: cfg.hero_secondary_cta_link || "#itinerary",
        heroImage: cfg.hero_image || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
        autoPlayIntervalSeconds: cfg.auto_play_interval || 6,
        slides: slideRows.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          description: s.description,
          badgeText: s.badge_text,
          primaryCtaText: s.primary_cta_text,
          primaryCtaLink: s.primary_cta_link,
          secondaryCtaText: s.secondary_cta_text,
          secondaryCtaLink: s.secondary_cta_link,
          imageUrl: s.image_url,
          videoUrl: s.video_url,
          alignment: s.alignment || "center",
          overlayOpacity: parseFloat(s.overlay_opacity || "0.4"),
          order: s.sort_order || 0,
          visible: Boolean(s.visible)
        }))
      },
      intro: {
        eyebrow: cfg.intro_eyebrow || "MORE THAN A STAY",
        title: cfg.intro_title || "An intimate sanctuary between the ocean breeze and Swahili heritage",
        description: cfg.intro_description || "Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani."
      },
      contact: {
        phone: cfg.contact_phone || "+255 777 890 123",
        email: cfg.contact_email || "concierge@zanzirangihouse.com",
        whatsappNumber: cfg.contact_whatsapp || "255777890123",
        address: cfg.contact_address || "Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania"
      },
      sections: secRows.map((sec) => ({
        id: sec.id,
        label: sec.label,
        description: sec.description,
        order: sec.sort_order,
        visible: Boolean(sec.visible)
      })),
      socials,
      footer: {
        copyrightText: cfg.footer_copyright || "\xA9 2026 Zanzirangi House. All rights reserved.",
        tagline: cfg.footer_tagline || "A tranquil coastal sanctuary in Kizimkazi Dimbani."
      },
      meta: {
        lastUpdated: cfg.meta_last_updated ? new Date(cfg.meta_last_updated).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        updatedBy: cfg.meta_updated_by || "system"
      }
    };
  }
  async updateHomepage(data, userEmail) {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      if (data.hero) {
        await conn.query(
          `UPDATE homepage_config SET 
            hero_title = ?, hero_subtitle = ?, hero_description = ?, hero_badge_text = ?, 
            hero_primary_cta_text = ?, hero_primary_cta_link = ?, hero_secondary_cta_text = ?, 
            hero_secondary_cta_link = ?, hero_image = ?, auto_play_interval = ?, 
            meta_last_updated = NOW(), meta_updated_by = ? 
           WHERE id = 1`,
          [
            data.hero.title,
            data.hero.subtitle,
            data.hero.description,
            data.hero.badgeText,
            data.hero.primaryCtaText,
            data.hero.primaryCtaLink,
            data.hero.secondaryCtaText,
            data.hero.secondaryCtaLink,
            data.hero.heroImage,
            data.hero.autoPlayIntervalSeconds || 6,
            userEmail
          ]
        );
        if (Array.isArray(data.hero.slides)) {
          await conn.query("DELETE FROM hero_slides");
          for (let i = 0; i < data.hero.slides.length; i++) {
            const s = data.hero.slides[i];
            await conn.query(
              `INSERT INTO hero_slides 
                (id, title, subtitle, description, badge_text, primary_cta_text, primary_cta_link, 
                 secondary_cta_text, secondary_cta_link, image_url, video_url, alignment, overlay_opacity, sort_order, visible) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                s.id || `slide-${i + 1}`,
                s.title,
                s.subtitle,
                s.description,
                s.badgeText,
                s.primaryCtaText,
                s.primaryCtaLink,
                s.secondaryCtaText,
                s.secondaryCtaLink,
                s.imageUrl,
                s.videoUrl,
                s.alignment || "center",
                s.overlayOpacity || 0.4,
                s.order ?? i,
                s.visible !== false ? 1 : 0
              ]
            );
          }
        }
      }
      if (data.intro) {
        await conn.query(
          "UPDATE homepage_config SET intro_eyebrow = ?, intro_title = ?, intro_description = ? WHERE id = 1",
          [data.intro.eyebrow, data.intro.title, data.intro.description]
        );
      }
      if (data.contact) {
        await conn.query(
          "UPDATE homepage_config SET contact_phone = ?, contact_email = ?, contact_whatsapp = ?, contact_address = ? WHERE id = 1",
          [data.contact.phone, data.contact.email, data.contact.whatsappNumber, data.contact.address]
        );
      }
      if (data.socials) {
        await conn.query("UPDATE homepage_config SET socials_json = ? WHERE id = 1", [JSON.stringify(data.socials)]);
      }
      if (data.footer) {
        await conn.query(
          "UPDATE homepage_config SET footer_copyright = ?, footer_tagline = ? WHERE id = 1",
          [data.footer.copyrightText, data.footer.tagline]
        );
      }
      if (Array.isArray(data.sections)) {
        for (const sec of data.sections) {
          await conn.query(
            `INSERT INTO homepage_sections (id, label, description, sort_order, visible) 
             VALUES (?, ?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), 
             sort_order = VALUES(sort_order), visible = VALUES(visible)`,
            [sec.id, sec.label, sec.description, sec.order, sec.visible !== false ? 1 : 0]
          );
        }
      }
      await conn.query(
        "INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)",
        ["HOMEPAGE_UPDATED", userEmail, "Updated homepage configuration & layout"]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return this.getHomepage();
  }
  // --- Villas ---
  async getVillas() {
    const pool = this.getPool();
    const [villaRows] = await pool.query("SELECT * FROM villas ORDER BY sort_order ASC");
    const [amenityRows] = await pool.query("SELECT * FROM villa_amenities ORDER BY sort_order ASC");
    const [imageRows] = await pool.query("SELECT * FROM villa_images ORDER BY sort_order ASC");
    const amenitiesMap = /* @__PURE__ */ new Map();
    for (const a of amenityRows) {
      if (!amenitiesMap.has(a.villa_id)) amenitiesMap.set(a.villa_id, []);
      amenitiesMap.get(a.villa_id).push(a.amenity_name);
    }
    const imagesMap = /* @__PURE__ */ new Map();
    for (const img of imageRows) {
      if (!imagesMap.has(img.villa_id)) imagesMap.set(img.villa_id, []);
      imagesMap.get(img.villa_id).push(img.image_url);
    }
    return villaRows.map((v) => ({
      id: v.id,
      name: v.name,
      shortName: v.short_name,
      type: v.type,
      subtitle: v.subtitle,
      shortDescription: v.short_description,
      description: v.description,
      pricePerNight: parseFloat(v.price_per_night),
      priceUnit: v.price_unit,
      promotionalPrice: v.promotional_price ? parseFloat(v.promotional_price) : void 0,
      sizeSqm: v.size_sqm,
      maxGuests: v.max_guests,
      bedrooms: v.bedrooms,
      bathrooms: v.bathrooms,
      beds: v.beds_count,
      bed: v.bed_type,
      bathroom: v.bathroom_type,
      view: v.view_type,
      architecturalFeature: v.architectural_feature,
      heroImage: v.hero_image,
      coverImage: v.cover_image,
      status: v.status,
      featured: Boolean(v.featured),
      order: v.sort_order,
      amenities: amenitiesMap.get(v.id) || [],
      gallery: imagesMap.get(v.id) || []
    }));
  }
  async getVillaById(id) {
    const villas = await this.getVillas();
    return villas.find((v) => v.id === id) || null;
  }
  async saveVilla(villa, userEmail) {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO villas 
          (id, name, short_name, type, subtitle, short_description, description, price_per_night, 
           price_unit, promotional_price, size_sqm, max_guests, bedrooms, bathrooms, beds_count, 
           bed_type, bathroom_type, view_type, architectural_feature, hero_image, cover_image, 
           status, featured, sort_order) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name), short_name = VALUES(short_name), type = VALUES(type), 
           subtitle = VALUES(subtitle), short_description = VALUES(short_description), 
           description = VALUES(description), price_per_night = VALUES(price_per_night), 
           price_unit = VALUES(price_unit), promotional_price = VALUES(promotional_price), 
           size_sqm = VALUES(size_sqm), max_guests = VALUES(max_guests), bedrooms = VALUES(bedrooms), 
           bathrooms = VALUES(bathrooms), beds_count = VALUES(beds_count), bed_type = VALUES(bed_type), 
           bathroom_type = VALUES(bathroom_type), view_type = VALUES(view_type), 
           architectural_feature = VALUES(architectural_feature), hero_image = VALUES(hero_image), 
           cover_image = VALUES(cover_image), status = VALUES(status), featured = VALUES(featured), 
           sort_order = VALUES(sort_order)`,
        [
          villa.id,
          villa.name,
          villa.shortName || villa.name,
          villa.type,
          villa.subtitle || "",
          villa.shortDescription || "",
          villa.description,
          villa.pricePerNight,
          villa.priceUnit || "USD",
          villa.promotionalPrice || null,
          villa.sizeSqm || 85,
          villa.maxGuests || 2,
          villa.bedrooms || 1,
          villa.bathrooms || 1,
          villa.beds || 1,
          villa.bed || "King Bed",
          villa.bathroom || "En-suite",
          villa.view || "Ocean View",
          villa.architecturalFeature || "",
          villa.heroImage || villa.coverImage || "",
          villa.coverImage || villa.heroImage || "",
          villa.status || "published",
          villa.featured ? 1 : 0,
          villa.order || 0
        ]
      );
      await conn.query("DELETE FROM villa_amenities WHERE villa_id = ?", [villa.id]);
      if (Array.isArray(villa.amenities)) {
        for (let i = 0; i < villa.amenities.length; i++) {
          await conn.query(
            "INSERT INTO villa_amenities (villa_id, amenity_name, sort_order) VALUES (?, ?, ?)",
            [villa.id, villa.amenities[i], i]
          );
        }
      }
      await conn.query("DELETE FROM villa_images WHERE villa_id = ?", [villa.id]);
      if (Array.isArray(villa.gallery)) {
        for (let i = 0; i < villa.gallery.length; i++) {
          await conn.query(
            "INSERT INTO villa_images (villa_id, image_url, sort_order) VALUES (?, ?, ?)",
            [villa.id, villa.gallery[i], i]
          );
        }
      }
      await conn.query(
        "INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)",
        ["VILLA_SAVED", userEmail, `Saved villa: ${villa.name} (${villa.id})`]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    return villa;
  }
  async deleteVilla(id, userEmail) {
    const pool = this.getPool();
    const [result] = await pool.query("DELETE FROM villas WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      await this.addAuditLog({
        action: "VILLA_DELETED",
        userEmail,
        details: `Deleted villa: ${id}`
      });
      return true;
    }
    return false;
  }
  // --- Gallery ---
  async getGallery() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM gallery_items ORDER BY sort_order ASC");
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      caption: r.caption,
      description: r.description,
      image: r.image_url,
      aspectRatio: r.aspect_ratio || "4/3",
      order: r.sort_order,
      published: Boolean(r.published)
    }));
  }
  async saveGalleryItem(item, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO gallery_items 
        (id, category, title, caption, description, image_url, aspect_ratio, sort_order, published) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        category = VALUES(category), title = VALUES(title), caption = VALUES(caption), 
        description = VALUES(description), image_url = VALUES(image_url), aspect_ratio = VALUES(aspect_ratio), 
        sort_order = VALUES(sort_order), published = VALUES(published)`,
      [
        item.id,
        item.category,
        item.title,
        item.caption || item.description || "",
        item.description || item.caption || "",
        item.image,
        item.aspectRatio || "4/3",
        item.order || 0,
        item.published !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "GALLERY_SAVED",
      userEmail,
      details: `Saved photograph: ${item.title} (${item.id})`
    });
    return item;
  }
  async deleteGalleryItem(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM gallery_items WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "GALLERY_DELETED", userEmail, details: `Removed item ${id}` });
      return true;
    }
    return false;
  }
  // --- Facilities ---
  async getFacilities() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM facilities ORDER BY sort_order ASC");
    return rows.map((f) => ({
      id: f.id,
      title: f.title,
      category: f.category,
      description: f.description,
      hours: f.hours,
      highlight: f.highlight,
      image: f.image_url,
      icon: f.icon,
      order: f.sort_order,
      visible: Boolean(f.visible)
    }));
  }
  async saveFacility(facility, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO facilities 
        (id, title, category, description, hours, highlight, image_url, icon, sort_order, visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title), category = VALUES(category), description = VALUES(description), 
        hours = VALUES(hours), highlight = VALUES(highlight), image_url = VALUES(image_url), 
        icon = VALUES(icon), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        facility.id,
        facility.title,
        facility.category,
        facility.description,
        facility.hours,
        facility.highlight,
        facility.image,
        facility.icon || "Sparkles",
        facility.order || 0,
        facility.visible !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "FACILITY_SAVED",
      userEmail,
      details: `Saved facility: ${facility.title} (${facility.id})`
    });
    return facility;
  }
  // --- Testimonials ---
  async getTestimonials() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM testimonials ORDER BY sort_order ASC");
    return rows.map((t) => ({
      id: t.id,
      guestName: t.guest_name,
      country: t.country,
      avatar: t.avatar_url,
      rating: t.rating,
      stayDate: t.stay_date,
      villaStayed: t.villa_stayed,
      title: t.title,
      reviewText: t.review_text,
      verifiedStay: Boolean(t.verified_stay),
      featured: Boolean(t.featured),
      order: t.sort_order,
      visible: Boolean(t.visible)
    }));
  }
  async saveTestimonial(testimonial, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO testimonials 
        (id, guest_name, country, avatar_url, rating, stay_date, villa_stayed, title, review_text, verified_stay, featured, sort_order, visible) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        guest_name = VALUES(guest_name), country = VALUES(country), avatar_url = VALUES(avatar_url), 
        rating = VALUES(rating), stay_date = VALUES(stay_date), villa_stayed = VALUES(villa_stayed), 
        title = VALUES(title), review_text = VALUES(review_text), verified_stay = VALUES(verified_stay), 
        featured = VALUES(featured), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        testimonial.id,
        testimonial.guestName,
        testimonial.country,
        testimonial.avatar || "",
        testimonial.rating || 5,
        testimonial.stayDate,
        testimonial.villaStayed,
        testimonial.title,
        testimonial.reviewText,
        testimonial.verifiedStay !== false ? 1 : 0,
        testimonial.featured ? 1 : 0,
        testimonial.order || 0,
        testimonial.visible !== false ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "TESTIMONIAL_SAVED",
      userEmail,
      details: `Saved review: ${testimonial.guestName} (${testimonial.id})`
    });
    return testimonial;
  }
  async deleteTestimonial(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM testimonials WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "TESTIMONIAL_DELETED", userEmail, details: `Removed testimonial ${id}` });
      return true;
    }
    return false;
  }
  // --- Videos ---
  async getVideos() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM video_storyboard WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    let scenes = [];
    if (r.scenes_json) {
      try {
        scenes = JSON.parse(r.scenes_json);
      } catch {
      }
    }
    return {
      videoUrl: r.video_url || "https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4",
      posterImage: r.poster_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85",
      scenes
    };
  }
  async updateVideos(data, userEmail) {
    const pool = this.getPool();
    const current = await this.getVideos();
    const merged = { ...current, ...data };
    await pool.query(
      `INSERT INTO video_storyboard (id, video_url, poster_image, scenes_json) 
       VALUES (1, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        video_url = VALUES(video_url), poster_image = VALUES(poster_image), scenes_json = VALUES(scenes_json)`,
      [merged.videoUrl, merged.posterImage, JSON.stringify(merged.scenes || [])]
    );
    await this.addAuditLog({
      action: "VIDEOS_UPDATED",
      userEmail,
      details: "Updated 4K cinematic film & storyboard scenes"
    });
    return merged;
  }
  // --- SEO ---
  async getSeo() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM seo_routes");
    const routes = {};
    for (const r of rows) {
      routes[r.route_path] = {
        title: r.title,
        description: r.description,
        canonical: r.canonical_url,
        ogTitle: r.og_title,
        ogDescription: r.og_description,
        ogImage: r.og_image,
        robots: r.robots
      };
    }
    return {
      siteTitle: "Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat",
      defaultOgImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90",
      routes
    };
  }
  async updateSeo(data, userEmail) {
    const pool = this.getPool();
    if (data.routes) {
      for (const [routePath, r] of Object.entries(data.routes)) {
        await pool.query(
          `INSERT INTO seo_routes 
            (route_path, title, description, canonical_url, og_title, og_description, og_image, robots) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
            title = VALUES(title), description = VALUES(description), canonical_url = VALUES(canonical_url), 
            og_title = VALUES(og_title), og_description = VALUES(og_description), og_image = VALUES(og_image), 
            robots = VALUES(robots)`,
          [
            routePath,
            r.title,
            r.description,
            r.canonical,
            r.ogTitle || r.title,
            r.ogDescription || r.description,
            r.ogImage || "",
            r.robots || "index, follow"
          ]
        );
      }
    }
    await this.addAuditLog({
      action: "SEO_UPDATED",
      userEmail,
      details: "Updated SERP metadata routes"
    });
    return this.getSeo();
  }
  // --- Media ---
  async getMedia() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM media_assets ORDER BY created_at DESC");
    return rows.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      mimeType: m.mime_type,
      sizeBytes: Number(m.size_bytes),
      width: m.width,
      height: m.height,
      altText: m.alt_text,
      caption: m.caption,
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      usageCount: m.usage_count || 0
    }));
  }
  async saveMedia(asset, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO media_assets 
        (id, filename, url, mime_type, size_bytes, width, height, alt_text, caption, usage_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        filename = VALUES(filename), url = VALUES(url), mime_type = VALUES(mime_type), 
        size_bytes = VALUES(size_bytes), width = VALUES(width), height = VALUES(height), 
        alt_text = VALUES(alt_text), caption = VALUES(caption), usage_count = VALUES(usage_count)`,
      [
        asset.id,
        asset.filename,
        asset.url,
        asset.mimeType,
        asset.sizeBytes,
        asset.width || null,
        asset.height || null,
        asset.altText || "",
        asset.caption || "",
        asset.usageCount || 0
      ]
    );
    await this.addAuditLog({
      action: "MEDIA_SAVED",
      userEmail,
      details: `Saved media asset: ${asset.filename}`
    });
    return asset;
  }
  async deleteMedia(id, userEmail) {
    const pool = this.getPool();
    const [res] = await pool.query("DELETE FROM media_assets WHERE id = ?", [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: "MEDIA_DELETED", userEmail, details: `Deleted media ID ${id}` });
      return true;
    }
    return false;
  }
  // --- Settings ---
  async getSettings() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM site_settings WHERE id = 1 LIMIT 1");
    const r = rows[0] || {};
    return {
      siteName: r.site_name || "Zanzirangi House",
      tagline: r.tagline || "Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar",
      defaultCurrency: r.default_currency || "USD ($)",
      reservationNotificationEmail: r.reservation_notification_email || "reservations@zanzirangihouse.com",
      conciergePhone: r.concierge_phone || "+255 777 890 123",
      maintenanceMode: Boolean(r.maintenance_mode)
    };
  }
  async updateSettings(data, userEmail) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO site_settings 
        (id, site_name, tagline, default_currency, reservation_notification_email, concierge_phone, maintenance_mode) 
       VALUES (1, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), default_currency = VALUES(default_currency), 
        reservation_notification_email = VALUES(reservation_notification_email), 
        concierge_phone = VALUES(concierge_phone), maintenance_mode = VALUES(maintenance_mode)`,
      [
        data.siteName || "Zanzirangi House",
        data.tagline || "",
        data.defaultCurrency || "USD ($)",
        data.reservationNotificationEmail || "reservations@zanzirangihouse.com",
        data.conciergePhone || "+255 777 890 123",
        data.maintenanceMode ? 1 : 0
      ]
    );
    await this.addAuditLog({
      action: "SETTINGS_UPDATED",
      userEmail,
      details: "Updated sanctuary site settings"
    });
    return this.getSettings();
  }
  // --- Users & Auth ---
  async findUserByEmail(email) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1", [
      email.trim().toLowerCase()
    ]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    };
  }
  async saveUser(user) {
    const pool = this.getPool();
    await pool.query(
      `INSERT INTO users (id, email, name, role, password_hash, created_at, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash), 
        last_login = VALUES(last_login)`,
      [
        user.id,
        user.email.toLowerCase(),
        user.name,
        user.role,
        user.passwordHash,
        user.createdAt || /* @__PURE__ */ new Date(),
        user.lastLogin || null
      ]
    );
  }
  async listUsers() {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT id, email, name, role, created_at, last_login FROM users");
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : void 0
    }));
  }
  // --- Audit Logs ---
  async getAuditLogs(limit = 20) {
    const pool = this.getPool();
    const [rows] = await pool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?", [limit]);
    return rows.map((a) => ({
      id: String(a.id),
      action: a.action,
      userEmail: a.user_email,
      details: a.details,
      ipAddress: a.ip_address,
      timestamp: a.created_at ? new Date(a.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  async addAuditLog(entry) {
    const pool = this.getPool();
    await pool.query("INSERT INTO audit_logs (action, user_email, details, ip_address) VALUES (?, ?, ?, ?)", [
      entry.action,
      entry.userEmail,
      entry.details || null,
      entry.ipAddress || null
    ]);
  }
  // --- Dashboard Stats ---
  async getDashboardStats() {
    const pool = this.getPool();
    const [villasCount] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="published" THEN 1 ELSE 0 END) as pub FROM villas');
    const [galleryCount] = await pool.query("SELECT COUNT(*) as total FROM gallery_items");
    const [facilitiesCount] = await pool.query("SELECT COUNT(*) as total FROM facilities");
    const [testimonialsCount] = await pool.query("SELECT COUNT(*) as total FROM testimonials");
    const [mediaCount] = await pool.query("SELECT COUNT(*) as total FROM media_assets");
    const [hpMeta] = await pool.query("SELECT meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1");
    const recentLogs = await this.getAuditLogs(10);
    const meta = hpMeta[0] || {};
    return {
      status: "Connected",
      lastPublished: meta.meta_last_updated ? new Date(meta.meta_last_updated).toISOString() : null,
      publishedBy: meta.meta_updated_by || null,
      counts: {
        villasPublished: Number(villasCount[0]?.pub || 0),
        villasTotal: Number(villasCount[0]?.total || 0),
        galleryItems: Number(galleryCount[0]?.total || 0),
        facilities: Number(facilitiesCount[0]?.total || 0),
        testimonials: Number(testimonialsCount[0]?.total || 0),
        mediaAssets: Number(mediaCount[0]?.total || 0)
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details
      }))
    };
  }
};

// server/database/index.ts
init_env();
var adapterInstance = null;
function getDatabaseAdapter() {
  if (!adapterInstance) {
    if (env.DATABASE_PROVIDER === "mysql") {
      adapterInstance = new MysqlDatabaseAdapter();
    } else {
      adapterInstance = new JsonDatabaseAdapter();
    }
  }
  return adapterInstance;
}

// server/auth.ts
import jwt from "jsonwebtoken";
import bcrypt2 from "bcryptjs";
init_env();
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
}
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
async function authenticateAdmin(req, res, next) {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.zanzirangi_admin_token) {
    token = req.cookies.zanzirangi_admin_token;
  }
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in to Zanzirangi CMS."
    });
    return;
  }
  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session. Please log in again."
    });
    return;
  }
  try {
    const dbUser = await getDatabaseAdapter().findUserByEmail(user.email);
    if (!dbUser) {
      res.status(403).json({
        success: false,
        error: "User account is no longer authorized."
      });
      return;
    }
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role
    };
    next();
  } catch (err) {
    console.error("Authentication verification error:", err.message);
    res.status(500).json({ success: false, error: "Database verification failed." });
  }
}
async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await getDatabaseAdapter().findUserByEmail(normalizedEmail);
  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }
  const isMatch = await bcrypt2.compare(password, user.passwordHash);
  if (!isMatch) {
    return { success: false, error: "Invalid email or password." };
  }
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  const token = generateToken(payload);
  return {
    success: true,
    user: payload,
    token
  };
}

// server/storage/mediaStorage.ts
init_env();
import fs3 from "fs";
import path4 from "path";
import crypto from "crypto";
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "video/mp4",
  "video/webm",
  "application/pdf"
]);
var FORBIDDEN_EXTENSIONS = /* @__PURE__ */ new Set([
  ".php",
  ".phtml",
  ".php3",
  ".php4",
  ".php5",
  ".phps",
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".sh",
  ".bash",
  ".exe",
  ".bat",
  ".cmd",
  ".py",
  ".pl",
  ".cgi",
  ".htaccess",
  ".env"
]);
var MediaStorageService = class {
  constructor(customStorageDir) {
    this.storageDir = customStorageDir || env.MEDIA_STORAGE_PATH;
    this.ensureDirectoryExists();
  }
  ensureDirectoryExists() {
    if (!fs3.existsSync(this.storageDir)) {
      fs3.mkdirSync(this.storageDir, { recursive: true });
    }
  }
  getStorageDirectory() {
    return this.storageDir;
  }
  /**
   * Validates and saves an uploaded buffer to persistent storage.
   */
  async saveFile(buffer, originalName, mimeType) {
    this.ensureDirectoryExists();
    const ext = path4.extname(originalName).toLowerCase();
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
      throw new Error(`Security Exception: Uploading files with extension '${ext}' is strictly prohibited.`);
    }
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Security Exception: MIME type '${mimeType}' is not permitted.`);
    }
    const maxBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
    if (buffer.length > maxBytes) {
      throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of ${env.MAX_UPLOAD_SIZE_MB}MB.`);
    }
    const hash = crypto.randomBytes(16).toString("hex");
    const safeBaseName = path4.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 32);
    const uniqueFilename = `${safeBaseName}_${Date.now()}_${hash.substring(0, 8)}${ext}`;
    const destinationPath = path4.resolve(this.storageDir, uniqueFilename);
    if (!destinationPath.startsWith(path4.resolve(this.storageDir))) {
      throw new Error("Security Exception: Invalid destination path traversal detected.");
    }
    await fs3.promises.writeFile(destinationPath, buffer);
    const publicUrl = `/uploads/${uniqueFilename}`;
    return {
      filename: uniqueFilename,
      url: publicUrl,
      size: buffer.length,
      mimeType,
      storagePath: destinationPath
    };
  }
  /**
   * Deletes a file from persistent storage.
   */
  async deleteFile(filename) {
    const safeFilename = path4.basename(filename);
    const filePath = path4.resolve(this.storageDir, safeFilename);
    if (!filePath.startsWith(path4.resolve(this.storageDir))) {
      throw new Error("Security Exception: Path traversal attempt prevented.");
    }
    if (fs3.existsSync(filePath)) {
      await fs3.promises.unlink(filePath);
      return true;
    }
    return false;
  }
  /**
   * Checks if a file exists in storage.
   */
  exists(filename) {
    const safeFilename = path4.basename(filename);
    const filePath = path4.resolve(this.storageDir, safeFilename);
    return fs3.existsSync(filePath);
  }
  /**
   * Returns the persistent storage directory path on disk.
   */
  getStoragePath() {
    return this.storageDir;
  }
  /**
   * Returns the public URL for a stored filename.
   */
  getUrl(filename) {
    const safeFilename = path4.basename(filename);
    return `/uploads/${safeFilename}`;
  }
};
var mediaStorage = new MediaStorageService();

// server/api.ts
init_env();
var apiApp = express();
apiApp.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
var corsOrigin = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN;
apiApp.use(cors({ origin: corsOrigin, credentials: true }));
apiApp.use(cookieParser());
apiApp.use(express.json({ limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
apiApp.use(express.urlencoded({ extended: true, limit: `${env.MAX_UPLOAD_SIZE_MB}mb` }));
apiApp.use("/uploads", express.static(mediaStorage.getStorageDirectory()));
var loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: env.NODE_ENV === "production" ? 10 : 1e3,
  // Strict 10 in production, relaxed in dev
  skip: () => env.NODE_ENV === "development",
  // Skip in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 15 minutes."
  }
});
apiApp.get("/health", async (_req, res) => {
  const dbHealth = await getDatabaseAdapter().healthCheck();
  res.json({
    status: "online",
    service: "Zanzirangi House CMS Engine",
    environment: env.NODE_ENV,
    database: dbHealth.connected ? "connected" : "error",
    provider: dbHealth.provider,
    version: env.APP_VERSION,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiApp.post("/auth/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required."
      });
      return;
    }
    const result = await loginUser(email, password);
    if (!result.success) {
      res.status(401).json(result);
      return;
    }
    res.cookie("zanzirangi_admin_token", result.token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    await getDatabaseAdapter().addAuditLog({
      action: "USER_LOGIN",
      userEmail: result.user.email,
      details: "Administrator logged into Zanzirangi CMS",
      ipAddress: req.ip
    });
    res.json({
      success: true,
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: env.NODE_ENV === "production" ? "Internal server error during login." : err.message
    });
  }
});
apiApp.post("/auth/logout", async (req, res) => {
  res.clearCookie("zanzirangi_admin_token");
  res.json({ success: true, message: "Successfully logged out." });
});
apiApp.get("/auth/me", authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
apiApp.get("/content/homepage", async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getHomepage();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve published homepage content." });
  }
});
apiApp.get("/content/villas", async (_req, res) => {
  try {
    const villas = await getDatabaseAdapter().getVillas();
    const published = villas.filter((v) => v.status === "published");
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve villas." });
  }
});
apiApp.get("/content/gallery", async (_req, res) => {
  try {
    const gallery = await getDatabaseAdapter().getGallery();
    const published = gallery.filter((g) => g.published !== false);
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve gallery items." });
  }
});
apiApp.get("/content/facilities", async (_req, res) => {
  try {
    const facilities = await getDatabaseAdapter().getFacilities();
    const visible = facilities.filter((f) => f.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve facilities." });
  }
});
apiApp.get("/content/testimonials", async (_req, res) => {
  try {
    const testimonials = await getDatabaseAdapter().getTestimonials();
    const visible = testimonials.filter((t) => t.visible !== false);
    res.json({ success: true, data: visible });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve testimonials." });
  }
});
apiApp.get("/content/videos", async (_req, res) => {
  try {
    const videos = await getDatabaseAdapter().getVideos();
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve video details." });
  }
});
apiApp.get("/content/seo", async (_req, res) => {
  try {
    const seo = await getDatabaseAdapter().getSeo();
    res.json({ success: true, data: seo });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve SEO configuration." });
  }
});
apiApp.get("/content/settings", async (_req, res) => {
  try {
    const s = await getDatabaseAdapter().getSettings();
    res.json({
      success: true,
      data: {
        siteName: s.siteName,
        tagline: s.tagline,
        defaultCurrency: s.defaultCurrency,
        conciergePhone: s.conciergePhone,
        maintenanceMode: s.maintenanceMode
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve site settings." });
  }
});
apiApp.get("/admin/homepage", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getHomepage();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch homepage data." });
  }
});
apiApp.put("/admin/homepage", authenticateAdmin, async (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ success: false, error: "Invalid payload structure." });
      return;
    }
    const updated = await getDatabaseAdapter().updateHomepage(body, req.user?.email || "admin");
    res.json({
      success: true,
      message: "Homepage content successfully published to live website.",
      data: updated
    });
  } catch (err) {
    console.error("Homepage save error:", err);
    res.status(500).json({ success: false, error: "Failed to save homepage changes." });
  }
});
apiApp.get("/admin/villas", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getVillas();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve villas." });
  }
});
apiApp.post("/admin/villas", authenticateAdmin, async (req, res) => {
  try {
    const newVilla = {
      ...req.body,
      id: req.body.id || `villa-${Date.now()}`,
      order: req.body.order || 0,
      status: req.body.status || "published"
    };
    const saved = await getDatabaseAdapter().saveVilla(newVilla, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Villa successfully created." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create villa." });
  }
});
apiApp.put("/admin/villas/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getDatabaseAdapter().getVillaById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Villa not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await getDatabaseAdapter().saveVilla(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Villa updated successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update villa." });
  }
});
apiApp.delete("/admin/villas/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await getDatabaseAdapter().deleteVilla(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Villa not found." });
      return;
    }
    res.json({ success: true, message: "Villa deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete villa." });
  }
});
apiApp.get("/admin/gallery", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getGallery();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve gallery items." });
  }
});
apiApp.post("/admin/gallery", authenticateAdmin, async (req, res) => {
  try {
    const newItem = {
      ...req.body,
      id: req.body.id || `g-${Date.now()}`,
      order: req.body.order || 0,
      published: req.body.published !== false
    };
    const saved = await getDatabaseAdapter().saveGalleryItem(newItem, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Gallery item added." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add gallery item." });
  }
});
apiApp.put("/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const items = await getDatabaseAdapter().getGallery();
    const existing = items.find((g) => g.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Gallery item not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await getDatabaseAdapter().saveGalleryItem(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Gallery item updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update gallery item." });
  }
});
apiApp.delete("/admin/gallery/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await getDatabaseAdapter().deleteGalleryItem(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Gallery item not found." });
      return;
    }
    res.json({ success: true, message: "Gallery item deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete gallery item." });
  }
});
apiApp.get("/admin/facilities", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getFacilities();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve facilities." });
  }
});
apiApp.put("/admin/facilities/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const facilities = await getDatabaseAdapter().getFacilities();
    const existing = facilities.find((f) => f.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Facility not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await getDatabaseAdapter().saveFacility(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Facility updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update facility." });
  }
});
apiApp.get("/admin/testimonials", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getTestimonials();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve testimonials." });
  }
});
apiApp.post("/admin/testimonials", authenticateAdmin, async (req, res) => {
  try {
    const newTestimonial = {
      ...req.body,
      id: req.body.id || `rev-${Date.now()}`,
      order: req.body.order || 0,
      visible: req.body.visible !== false,
      rating: req.body.rating || 5
    };
    const saved = await getDatabaseAdapter().saveTestimonial(newTestimonial, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Testimonial added." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add testimonial." });
  }
});
apiApp.put("/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const testimonials = await getDatabaseAdapter().getTestimonials();
    const existing = testimonials.find((t) => t.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: "Testimonial not found." });
      return;
    }
    const merged = { ...existing, ...req.body, id };
    const saved = await getDatabaseAdapter().saveTestimonial(merged, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Testimonial updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update testimonial." });
  }
});
apiApp.delete("/admin/testimonials/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await getDatabaseAdapter().deleteTestimonial(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Testimonial not found." });
      return;
    }
    res.json({ success: true, message: "Testimonial deleted." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete testimonial." });
  }
});
apiApp.get("/admin/videos", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getVideos();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch video details." });
  }
});
apiApp.put("/admin/videos", authenticateAdmin, async (req, res) => {
  try {
    const updated = await getDatabaseAdapter().updateVideos(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Promotional video details updated." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update videos." });
  }
});
apiApp.get("/admin/seo", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getSeo();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch SEO configuration." });
  }
});
apiApp.put("/admin/seo", authenticateAdmin, async (req, res) => {
  try {
    const updated = await getDatabaseAdapter().updateSeo(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "SEO configuration saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update SEO." });
  }
});
apiApp.get("/admin/media", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getMedia();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch media assets." });
  }
});
apiApp.post("/admin/media", authenticateAdmin, async (req, res) => {
  try {
    const newMedia = {
      ...req.body,
      id: req.body.id || `med-${Date.now()}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      usageCount: 0
    };
    const saved = await getDatabaseAdapter().saveMedia(newMedia, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "Media asset added to registry." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to save media." });
  }
});
apiApp.delete("/admin/media/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await getDatabaseAdapter().deleteMedia(id, req.user?.email || "admin");
    if (!deleted) {
      res.status(404).json({ success: false, error: "Media asset not found." });
      return;
    }
    res.json({ success: true, message: "Media asset removed." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete media asset." });
  }
});
apiApp.post("/admin/media/upload", authenticateAdmin, async (req, res) => {
  try {
    const { fileBase64, filename, mimeType, altText } = req.body;
    if (!fileBase64 || !filename || !mimeType) {
      res.status(400).json({ success: false, error: "fileBase64, filename, and mimeType are required." });
      return;
    }
    const base64Data = fileBase64.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const uploadRes = await mediaStorage.saveFile(buffer, filename, mimeType);
    const assetRecord = {
      id: `med-${Date.now()}`,
      filename: uploadRes.filename,
      url: uploadRes.url,
      mimeType: uploadRes.mimeType,
      sizeBytes: uploadRes.size,
      altText: altText || uploadRes.filename,
      caption: "",
      usageCount: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await getDatabaseAdapter().saveMedia(assetRecord, req.user?.email || "admin");
    res.json({ success: true, data: saved, message: "File uploaded and registered successfully." });
  } catch (err) {
    console.error("File upload error:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
});
apiApp.get("/admin/settings", authenticateAdmin, async (_req, res) => {
  try {
    const data = await getDatabaseAdapter().getSettings();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch settings." });
  }
});
apiApp.put("/admin/settings", authenticateAdmin, async (req, res) => {
  try {
    const updated = await getDatabaseAdapter().updateSettings(req.body, req.user?.email || "admin");
    res.json({ success: true, data: updated, message: "Settings saved." });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update settings." });
  }
});
apiApp.get("/admin/dashboard-stats", authenticateAdmin, async (_req, res) => {
  try {
    const stats = await getDatabaseAdapter().getDashboardStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch dashboard metrics." });
  }
});

// server/index.ts
init_env();
validateEnvironment();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path5.dirname(__filename2);
var app = express2();
getDatabaseAdapter().connect().then(() => {
  console.log(`\u{1F680} Database engine initialized [Provider: ${env.DATABASE_PROVIDER}]`);
}).catch((err) => {
  console.error("\u274C Failed to initialize database on startup:", err.message);
  if (env.NODE_ENV === "production" && env.DATABASE_PROVIDER === "mysql") {
    process.exit(1);
  }
});
app.use("/uploads", express2.static(mediaStorage.getStorageDirectory()));
app.use("/api", apiApp);
var distPath = path5.resolve(__dirname2, "../dist");
app.use(express2.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  const indexPath = path5.join(distPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Zanzirangi House - Frontend distribution not built yet. Please run `npm run build`.");
    }
  });
});
var PORT = env.PORT || 3e3;
var server;
if (process.argv[1] && process.argv[1].endsWith("index.ts") || process.argv[1]?.endsWith("index.js") || process.env.NODE_ENV === "production") {
  server = app.listen(PORT, () => {
    console.log(`\u{1F3F0} Zanzirangi House Production Engine running on ${env.APP_URL} (Port: ${PORT})`);
  });
  const shutdown = async (signal) => {
    console.log(`
\u{1F6D1} Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
      server.close(async () => {
        try {
          await getDatabaseAdapter().disconnect();
          console.log("\u2705 Closed database connections.");
        } catch (e) {
          console.error("Error closing database connections:", e.message);
        }
        console.log("\u{1F3C1} Application process exited cleanly.");
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
export {
  app
};
