import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env.ts';

export async function runMigration(existingPool?: mysql.Pool): Promise<void> {
  console.log('🚀 Starting Zanzirangi House: JSON -> MySQL Migration Pipeline');
  console.log(`Connecting to MySQL host: ${env.MYSQL_HOST || 'localhost'}:${env.MYSQL_PORT || 3306} [DB: ${env.MYSQL_DATABASE || 'zanzirangi_house'}]`);

  // Ensure DB connection config exists
  if (!env.MYSQL_HOST && process.env.NODE_ENV === 'production' && !existingPool) {
    console.error('❌ MYSQL_HOST environment variable is not defined.');
    throw new Error('MYSQL_HOST environment variable is not defined.');
  }

  let shouldEndPool = false;
  let pool = existingPool;
  if (!pool) {
    shouldEndPool = true;
    pool = mysql.createPool({
      host: env.MYSQL_HOST || 'localhost',
      port: env.MYSQL_PORT || 3306,
      database: env.MYSQL_DATABASE || 'zanzirangi_house',
      user: env.MYSQL_USER || 'root',
      password: env.MYSQL_PASSWORD || '',
      multipleStatements: true,
    });
  }

  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');

    // 1. Run DDL Schema Migration
    const sqlPath = path.resolve(process.cwd(), 'server/database/migrations/001_initial_schema.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Schema file not found at: ${sqlPath}`);
    }
    const ddl = fs.readFileSync(sqlPath, 'utf-8');
    console.log('⏳ Executing 001_initial_schema.sql DDL...');
    await conn.query(ddl);
    console.log('✅ MySQL schema tables created/verified.');

    // 2. Read local db.json or backup
    const backupPath = path.resolve(process.cwd(), 'backups/local-db-before-mysql-migration.json');
    const localDbPath = path.resolve(process.cwd(), 'server/data/db.json');
    const sourcePath = fs.existsSync(backupPath) ? backupPath : localDbPath;
    console.log(`⏳ Reading source JSON data from: ${sourcePath}`);
    const rawData = fs.readFileSync(sourcePath, 'utf-8');
    const db = JSON.parse(rawData);

    // 3. Migrate Users
    console.log(`Migrating ${db.users?.length || 0} user records...`);
    for (const u of db.users || []) {
      await conn.query(
        `INSERT INTO users (id, email, name, role, password_hash, created_at, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash)`,
        [u.id, u.email.toLowerCase(), u.name, u.role, u.passwordHash, u.createdAt || new Date(), u.lastLogin || null]
      );
    }

    // 4. Migrate Site Settings
    const s = db.settings || {};
    await conn.query(
      `INSERT INTO site_settings (id, site_name, tagline, default_currency, reservation_notification_email, concierge_phone, maintenance_mode)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), default_currency = VALUES(default_currency), 
        reservation_notification_email = VALUES(reservation_notification_email), concierge_phone = VALUES(concierge_phone), 
        maintenance_mode = VALUES(maintenance_mode)`,
      [
        s.siteName || 'Zanzirangi House',
        s.tagline || '',
        s.defaultCurrency || 'USD ($)',
        s.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
        s.conciergePhone || '+255 777 890 123',
        s.maintenanceMode ? 1 : 0,
      ]
    );

    // 5. Migrate Homepage Configuration & Sections
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
        hp.hero?.title || 'Zanzirangi House',
        hp.hero?.subtitle || '',
        hp.hero?.description || '',
        hp.hero?.badgeText || '',
        hp.hero?.primaryCtaText || '',
        hp.hero?.primaryCtaLink || '',
        hp.hero?.secondaryCtaText || '',
        hp.hero?.secondaryCtaLink || '',
        hp.hero?.heroImage || '',
        hp.hero?.autoPlayIntervalSeconds || 6,
        hp.intro?.eyebrow || '',
        hp.intro?.title || '',
        hp.intro?.description || '',
        hp.contact?.phone || '',
        hp.contact?.email || '',
        hp.contact?.whatsappNumber || '',
        hp.contact?.address || '',
        JSON.stringify(hp.socials || {}),
        hp.footer?.copyrightText || '',
        hp.footer?.tagline || '',
        hp.meta?.lastUpdated ? new Date(hp.meta.lastUpdated) : null,
        hp.meta?.updatedBy || 'admin',
      ]
    );

    // Hero Slides
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
          slide.subtitle || '',
          slide.description || '',
          slide.badgeText || '',
          slide.primaryCtaText || '',
          slide.primaryCtaLink || '',
          slide.secondaryCtaText || '',
          slide.secondaryCtaLink || '',
          slide.imageUrl,
          slide.videoUrl || null,
          slide.alignment || 'center',
          slide.overlayOpacity || 0.4,
          slide.order ?? i,
          slide.visible !== false ? 1 : 0,
        ]
      );
    }

    // Homepage Sections
    console.log(`Migrating ${hp.sections?.length || 0} homepage sections...`);
    for (const sec of hp.sections || []) {
      await conn.query(
        `INSERT INTO homepage_sections (id, label, description, sort_order, visible)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
          label = VALUES(label), description = VALUES(description), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
        [sec.id, sec.label, sec.description || '', sec.order || 0, sec.visible !== false ? 1 : 0]
      );
    }

    // 6. Migrate Villas
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
          v.subtitle || '',
          v.shortDescription || '',
          v.description,
          v.pricePerNight,
          v.priceUnit || 'USD',
          v.promotionalPrice || null,
          v.sizeSqm || 85,
          v.maxGuests || 2,
          v.bedrooms || 1,
          v.bathrooms || 1,
          v.beds || 1,
          v.bed || 'King Bed',
          v.bathroom || 'En-suite',
          v.view || 'Ocean View',
          v.architecturalFeature || '',
          v.heroImage || v.coverImage || '',
          v.coverImage || v.heroImage || '',
          v.status || 'published',
          v.featured ? 1 : 0,
          v.order || 0,
        ]
      );

      // Amenities
      await conn.query('DELETE FROM villa_amenities WHERE villa_id = ?', [v.id]);
      for (let i = 0; i < (v.amenities || []).length; i++) {
        await conn.query(
          'INSERT INTO villa_amenities (villa_id, amenity_name, sort_order) VALUES (?, ?, ?)',
          [v.id, v.amenities[i], i]
        );
      }

      // Images
      await conn.query('DELETE FROM villa_images WHERE villa_id = ?', [v.id]);
      for (let i = 0; i < (v.gallery || []).length; i++) {
        await conn.query(
          'INSERT INTO villa_images (villa_id, image_url, sort_order) VALUES (?, ?, ?)',
          [v.id, v.gallery[i], i]
        );
      }
    }

    // 7. Migrate Gallery
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
          g.caption || '',
          g.description || g.caption || '',
          g.image,
          g.aspectRatio || '4/3',
          g.order || 0,
          g.published !== false ? 1 : 0,
        ]
      );
    }

    // 8. Migrate Facilities
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
          f.icon || 'Sparkles',
          f.order || 0,
          f.visible !== false ? 1 : 0,
        ]
      );
    }

    // 9. Migrate Testimonials
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
          t.avatar || '',
          t.rating || 5,
          t.stayDate,
          t.villaStayed,
          t.title,
          t.reviewText,
          t.verifiedStay !== false ? 1 : 0,
          t.featured ? 1 : 0,
          t.order || 0,
          t.visible !== false ? 1 : 0,
        ]
      );
    }

    // 10. Migrate Videos
    const vid = db.videos || {};
    await conn.query(
      `INSERT INTO video_storyboard (id, video_url, poster_image, scenes_json)
       VALUES (1, ?, ?, ?)
       ON DUPLICATE KEY UPDATE video_url = VALUES(video_url), poster_image = VALUES(poster_image), scenes_json = VALUES(scenes_json)`,
      [
        vid.videoUrl || 'https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4',
        vid.posterImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
        JSON.stringify(vid.scenes || []),
      ]
    );

    // 11. Migrate SEO Routes
    const seo = db.seo || {};
    for (const [routePath, r] of Object.entries(seo.routes || {})) {
      const ro = r as any;
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
          ro.ogImage || '',
          ro.robots || 'index, follow',
        ]
      );
    }

    // 12. Migrate Media Assets
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
          m.altText || '',
          m.caption || '',
          m.usageCount || 0,
          m.createdAt ? new Date(m.createdAt) : new Date(),
        ]
      );
    }

    // 13. Record Schema Migration
    await conn.query(
      `INSERT INTO schema_migrations (version, applied_at) VALUES ('001_initial_schema', NOW())
       ON DUPLICATE KEY UPDATE applied_at = NOW()`
    );

    conn.release();

    console.log('\n======================================================');
    console.log('🎉 MYSQL DATABASE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(`- Users: ${db.users?.length || 0}`);
    console.log(`- Villas: ${db.villas?.length || 0}`);
    console.log(`- Gallery Items: ${db.gallery?.length || 0}`);
    console.log(`- Facilities: ${db.facilities?.length || 0}`);
    console.log(`- Testimonials: ${db.testimonials?.length || 0}`);
    console.log(`- Hero Slides: ${hp.hero?.slides?.length || 0}`);
    console.log(`- Sections: ${hp.sections?.length || 0}`);
    console.log(`- SEO Routes: ${Object.keys(seo.routes || {}).length}`);
    console.log(`- Media Assets: ${db.media?.length || 0}`);
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    if (shouldEndPool && pool) {
      await pool.end();
    }
  }
}

if (process.argv[1] && process.argv[1].includes('migrateFromJson')) {
  runMigration().catch((err) => {
    console.error('❌ Direct migration failed:', err.message);
    process.exit(1);
  });
}
