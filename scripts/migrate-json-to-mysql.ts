import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../server/config/env.ts';

interface MigrationReport {
  table: string;
  sourceCount: number;
  migratedCount: number;
  skippedCount: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export async function runJsonToMysqlMigration(): Promise<MigrationReport[]> {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE: JSON → MYSQL PRODUCTION MIGRATION UTILITY');
  console.log('================================================================');

  const dbJsonPath = path.resolve(process.cwd(), 'server/data/db.json');
  const backupPath = path.resolve(process.cwd(), 'server/data/db.json.backup');
  const timestampedBackupPath = path.resolve(
    process.cwd(),
    `backups/db-backup-${Date.now()}.json`
  );

  // 1. Read & Validate db.json
  if (!fs.existsSync(dbJsonPath)) {
    throw new Error(`Critical Error: Source database not found at ${dbJsonPath}`);
  }

  const rawJson = fs.readFileSync(dbJsonPath, 'utf-8');
  let data: any;
  try {
    data = JSON.parse(rawJson);
    console.log('✓ Source JSON read and syntax validated successfully.');
  } catch (parseErr: any) {
    throw new Error(`JSON Validation Failed: ${parseErr.message}`);
  }

  // 2. Create Backups before touching anything
  console.log(`⏳ Creating atomic backup at: ${backupPath}`);
  fs.writeFileSync(backupPath, rawJson, 'utf-8');

  const backupsDir = path.dirname(timestampedBackupPath);
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  fs.writeFileSync(timestampedBackupPath, rawJson, 'utf-8');
  console.log(`✓ Timestamped backup created at: ${timestampedBackupPath}`);

  // 3. Connect to MySQL
  const dbHost = env.MYSQL_HOST || '127.0.0.1';
  const dbPort = env.MYSQL_PORT || 3306;
  const dbName = env.MYSQL_DATABASE || 'zanzirangi_house';
  const dbUser = env.MYSQL_USER || 'root';
  const dbPassword = env.MYSQL_PASSWORD || '';

  console.log(`⏳ Connecting to MySQL server at ${dbUser}@${dbHost}:${dbPort}/${dbName}...`);
  const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const conn = await pool.getConnection();
  console.log('✓ Successfully connected to MySQL database.');

  // 4. Verify & Create Tables from Schema Migration
  const schemaPath = path.resolve(process.cwd(), 'server/database/migrations/001_initial_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Migration DDL schema file not found at: ${schemaPath}`);
  }
  const ddlSql = fs.readFileSync(schemaPath, 'utf-8');
  console.log('⏳ Executing schema creation / verification (InnoDB utf8mb4)...');
  await conn.query(ddlSql);
  console.log('✓ Database schema tables verified.');

  const reports: MigrationReport[] = [];

  // Helper migration runner
  async function migrateEntity(
    name: string,
    sourceArray: any[] | undefined,
    processor: (item: any) => Promise<void>
  ) {
    const list = Array.isArray(sourceArray) ? sourceArray : sourceArray ? [sourceArray] : [];
    let count = 0;
    let skipped = 0;
    for (const item of list) {
      try {
        await processor(item);
        count++;
      } catch (err: any) {
        console.error(`  ⚠️ Error migrating ${name} item:`, err.message);
        skipped++;
      }
    }
    reports.push({
      table: name,
      sourceCount: list.length,
      migratedCount: count,
      skippedCount: skipped,
      status: skipped === 0 ? 'SUCCESS' : 'WARNING',
    });
    console.log(`  ✓ ${name}: ${count}/${list.length} records processed.`);
  }

  // 5. Migrate Users
  console.log('⏳ Migrating administrative user accounts...');
  await migrateEntity('users', data.users, async (u) => {
    await conn.query(
      `INSERT INTO users (id, email, name, role, password_hash, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash), last_login = VALUES(last_login)`,
      [
        u.id || `usr_${Date.now()}`,
        u.email.toLowerCase().trim(),
        u.name,
        u.role || 'admin',
        u.passwordHash,
        u.createdAt ? new Date(u.createdAt) : new Date(),
        u.lastLogin ? new Date(u.lastLogin) : null,
      ]
    );
  });

  // 6. Migrate Site Settings (Authoritative centralized settings)
  console.log('⏳ Migrating site & property settings...');
  const s = data.settings || {};
  await conn.query(
    `INSERT INTO site_settings 
      (id, site_name, tagline, phone, concierge_phone, whatsapp, email, reservation_notification_email, 
       reservation_email, address, instagram, facebook, youtube, booking_url, currency, default_currency, 
       default_language, logo, favicon, maintenance_mode) 
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
      site_name = VALUES(site_name), tagline = VALUES(tagline), phone = VALUES(phone), 
      concierge_phone = VALUES(concierge_phone), whatsapp = VALUES(whatsapp), email = VALUES(email), 
      reservation_notification_email = VALUES(reservation_notification_email), 
      reservation_email = VALUES(reservation_email), address = VALUES(address), 
      instagram = VALUES(instagram), facebook = VALUES(facebook), youtube = VALUES(youtube), 
      booking_url = VALUES(booking_url), currency = VALUES(currency), default_currency = VALUES(default_currency), 
      default_language = VALUES(default_language), logo = VALUES(logo), favicon = VALUES(favicon), 
      maintenance_mode = VALUES(maintenance_mode)`,
    [
      s.siteName || 'Zanzirangi House',
      s.tagline || 'Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar',
      s.phone || s.conciergePhone || '+255 777 890 123',
      s.conciergePhone || '+255 777 890 123',
      s.whatsapp || '+255 777 890 123',
      s.email || 'info@zanzirangihouse.com',
      s.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
      s.reservationEmail || s.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
      s.address || 'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
      s.instagram || 'https://instagram.com/zanzirangi.house',
      s.facebook || 'https://facebook.com/zanzirangihouse',
      s.youtube || 'https://youtube.com/@zanzirangihouse',
      s.bookingUrl || 'https://zanzirangihouse.com/#stay',
      s.currency || 'USD',
      s.defaultCurrency || 'USD ($)',
      s.defaultLanguage || 'en',
      s.logo || '/src/assets/zanzirangi-logo-new.jpeg',
      s.favicon || '/favicon.svg',
      s.maintenanceMode ? 1 : 0,
    ]
  );
  reports.push({
    table: 'site_settings',
    sourceCount: 1,
    migratedCount: 1,
    skippedCount: 0,
    status: 'SUCCESS',
  });

  // 7. Migrate Homepage Config & Hero Slides
  console.log('⏳ Migrating homepage config and hero slides...');
  const hp = data.homepage || {};
  const hero = hp.hero || {};
  const intro = hp.intro || {};
  const contact = hp.contact || {};
  const socials = hp.socials || {};
  const footer = hp.footer || {};
  const meta = hp.meta || {};

  await conn.query(
    `INSERT INTO homepage_config (
      id, hero_title, hero_subtitle, hero_description, hero_badge_text,
      hero_primary_cta_text, hero_primary_cta_link, hero_secondary_cta_text, hero_secondary_cta_link,
      hero_image, auto_play_interval, intro_eyebrow, intro_title, intro_description,
      contact_phone, contact_email, contact_whatsapp, contact_address,
      socials_json, footer_copyright, footer_tagline, meta_last_updated, meta_updated_by
    ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      hero_title = VALUES(hero_title), hero_subtitle = VALUES(hero_subtitle),
      hero_description = VALUES(hero_description), hero_badge_text = VALUES(hero_badge_text),
      hero_primary_cta_text = VALUES(hero_primary_cta_text), hero_primary_cta_link = VALUES(hero_primary_cta_link),
      hero_secondary_cta_text = VALUES(hero_secondary_cta_text), hero_secondary_cta_link = VALUES(hero_secondary_cta_link),
      hero_image = VALUES(hero_image), auto_play_interval = VALUES(auto_play_interval),
      intro_eyebrow = VALUES(intro_eyebrow), intro_title = VALUES(intro_title),
      intro_description = VALUES(intro_description), contact_phone = VALUES(contact_phone),
      contact_email = VALUES(contact_email), contact_whatsapp = VALUES(contact_whatsapp),
      contact_address = VALUES(contact_address), socials_json = VALUES(socials_json),
      footer_copyright = VALUES(footer_copyright), footer_tagline = VALUES(footer_tagline),
      meta_last_updated = VALUES(meta_last_updated), meta_updated_by = VALUES(meta_updated_by)`,
    [
      hero.title || 'Zanzibar Luxury Villa',
      hero.subtitle || 'Private Pool Retreat • Kizimkazi',
      hero.description || '',
      hero.badgeText || '',
      hero.primaryCtaText || 'Reserve Sanctuary',
      hero.primaryCtaLink || '#stay',
      hero.secondaryCtaText || 'Explore Sanctuary',
      hero.secondaryCtaLink || '#itinerary',
      hero.heroImage || '',
      hero.autoPlayIntervalSeconds || 6,
      intro.eyebrow || '',
      intro.title || '',
      intro.description || '',
      contact.phone || '',
      contact.email || '',
      contact.whatsappNumber || '',
      contact.address || '',
      JSON.stringify(socials),
      footer.copyrightText || '',
      footer.tagline || '',
      meta.lastUpdated ? new Date(meta.lastUpdated) : new Date(),
      meta.updatedBy || 'migration-script',
    ]
  );
  reports.push({
    table: 'homepage_config',
    sourceCount: 1,
    migratedCount: 1,
    skippedCount: 0,
    status: 'SUCCESS',
  });

  // Hero Slides
  await migrateEntity('hero_slides', hero.slides, async (slide) => {
    await conn.query(
      `INSERT INTO hero_slides 
        (id, title, subtitle, description, badge_text, primary_cta_text, primary_cta_link,
         secondary_cta_text, secondary_cta_link, image_url, video_url, alignment, overlay_opacity, sort_order, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), subtitle = VALUES(subtitle), description = VALUES(description),
         badge_text = VALUES(badge_text), primary_cta_text = VALUES(primary_cta_text), primary_cta_link = VALUES(primary_cta_link),
         secondary_cta_text = VALUES(secondary_cta_text), secondary_cta_link = VALUES(secondary_cta_link),
         image_url = VALUES(image_url), video_url = VALUES(video_url), alignment = VALUES(alignment),
         overlay_opacity = VALUES(overlay_opacity), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        slide.id,
        slide.title,
        slide.subtitle || null,
        slide.description || null,
        slide.badgeText || null,
        slide.primaryCtaText || null,
        slide.primaryCtaLink || null,
        slide.secondaryCtaText || null,
        slide.secondaryCtaLink || null,
        slide.imageUrl || slide.image || '',
        slide.videoUrl || null,
        slide.alignment || 'center',
        slide.overlayOpacity ?? 0.4,
        slide.order ?? 0,
        slide.visible !== false ? 1 : 0,
      ]
    );
  });

  // Homepage Sections
  await migrateEntity('homepage_sections', hp.sections, async (sec) => {
    await conn.query(
      `INSERT INTO homepage_sections (id, label, description, sort_order, visible)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [sec.id, sec.label, sec.description || null, sec.order ?? 0, sec.visible !== false ? 1 : 0]
    );
  });

  // 8. Migrate Villas & Villa Amenities / Images
  console.log('⏳ Migrating luxury villas...');
  await migrateEntity('villas', data.villas, async (v) => {
    await conn.query(
      `INSERT INTO villas 
        (id, name, short_name, type, subtitle, short_description, description, price_per_night,
         price_unit, promotional_price, size_sqm, max_guests, bedrooms, bathrooms, beds_count,
         bed_type, bathroom_type, view_type, architectural_feature, hero_image, cover_image,
         status, featured, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), short_name = VALUES(short_name), type = VALUES(type), subtitle = VALUES(subtitle),
         short_description = VALUES(short_description), description = VALUES(description), price_per_night = VALUES(price_per_night),
         price_unit = VALUES(price_unit), promotional_price = VALUES(promotional_price), size_sqm = VALUES(size_sqm),
         max_guests = VALUES(max_guests), bedrooms = VALUES(bedrooms), bathrooms = VALUES(bathrooms),
         beds_count = VALUES(beds_count), bed_type = VALUES(bed_type), bathroom_type = VALUES(bathroom_type),
         view_type = VALUES(view_type), architectural_feature = VALUES(architectural_feature), hero_image = VALUES(hero_image),
         cover_image = VALUES(cover_image), status = VALUES(status), featured = VALUES(featured), sort_order = VALUES(sort_order)`,
      [
        v.id,
        v.name,
        v.shortName || v.name,
        v.type || 'Villa',
        v.subtitle || null,
        v.shortDescription || null,
        v.description || null,
        v.pricePerNight || 400.0,
        v.priceUnit || 'USD',
        v.promotionalPrice || null,
        v.sizeSqm || 85,
        v.maxGuests || 2,
        v.bedrooms || 1,
        v.bathrooms || 1,
        v.bedsCount || 1,
        v.bedType || null,
        v.bathroomType || null,
        v.viewType || null,
        v.architecturalFeature || null,
        v.heroImage || null,
        v.coverImage || null,
        v.status || 'published',
        v.featured ? 1 : 0,
        v.order ?? 0,
      ]
    );

    // Amenities
    if (Array.isArray(v.amenities)) {
      await conn.query('DELETE FROM villa_amenities WHERE villa_id = ?', [v.id]);
      for (let i = 0; i < v.amenities.length; i++) {
        const am = v.amenities[i];
        const amName = typeof am === 'string' ? am : am.name || String(am);
        await conn.query(
          'INSERT INTO villa_amenities (villa_id, amenity_name, icon, sort_order) VALUES (?, ?, ?, ?)',
          [v.id, amName, am.icon || null, i]
        );
      }
    }

    // Images
    if (Array.isArray(v.images)) {
      await conn.query('DELETE FROM villa_images WHERE villa_id = ?', [v.id]);
      for (let i = 0; i < v.images.length; i++) {
        const img = v.images[i];
        const imgUrl = typeof img === 'string' ? img : img.url;
        await conn.query(
          'INSERT INTO villa_images (villa_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)',
          [v.id, imgUrl, img.alt || v.name, i]
        );
      }
    }
  });

  // 9. Migrate Gallery Items
  console.log('⏳ Migrating gallery curation...');
  await migrateEntity('gallery_items', data.gallery, async (g) => {
    await conn.query(
      `INSERT INTO gallery_items (id, category, title, caption, description, image_url, aspect_ratio, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category = VALUES(category), title = VALUES(title), caption = VALUES(caption),
         description = VALUES(description), image_url = VALUES(image_url), aspect_ratio = VALUES(aspect_ratio),
         sort_order = VALUES(sort_order), published = VALUES(published)`,
      [
        g.id,
        g.category || 'sanctuary',
        g.title || 'Sanctuary View',
        g.caption || null,
        g.description || null,
        g.imageUrl || g.image || '',
        g.aspectRatio || '4/3',
        g.order ?? 0,
        g.published !== false ? 1 : 0,
      ]
    );
  });

  // 10. Migrate Facilities
  console.log('⏳ Migrating facilities...');
  await migrateEntity('facilities', data.facilities, async (f) => {
    await conn.query(
      `INSERT INTO facilities (id, title, category, description, hours, highlight, image_url, icon, sort_order, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), category = VALUES(category), description = VALUES(description),
         hours = VALUES(hours), highlight = VALUES(highlight), image_url = VALUES(image_url),
         icon = VALUES(icon), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [
        f.id,
        f.title,
        f.category || null,
        f.description || null,
        f.hours || null,
        f.highlight || null,
        f.imageUrl || f.image || '',
        f.icon || null,
        f.order ?? 0,
        f.visible !== false ? 1 : 0,
      ]
    );
  });

  // 11. Migrate Testimonials
  console.log('⏳ Migrating guest testimonials...');
  await migrateEntity('testimonials', data.testimonials, async (t) => {
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
        t.country || null,
        t.avatarUrl || null,
        t.rating || 5,
        t.stayDate || null,
        t.villaStayed || null,
        t.title || null,
        t.reviewText || '',
        t.verified !== false ? 1 : 0,
        t.featured ? 1 : 0,
        t.order ?? 0,
        t.visible !== false ? 1 : 0,
      ]
    );
  });

  // 12. Migrate Videos
  console.log('⏳ Migrating video storyboard...');
  const vids = data.videos || {};
  await conn.query(
    `INSERT INTO video_storyboard (id, video_url, poster_image, scenes_json)
     VALUES (1, ?, ?, ?)
     ON DUPLICATE KEY UPDATE video_url = VALUES(video_url), poster_image = VALUES(poster_image), scenes_json = VALUES(scenes_json)`,
    [
      vids.videoUrl || './Zanzirangi-home.mp4',
      vids.posterImage || '',
      JSON.stringify(vids.scenes || []),
    ]
  );
  reports.push({
    table: 'video_storyboard',
    sourceCount: 1,
    migratedCount: 1,
    skippedCount: 0,
    status: 'SUCCESS',
  });

  // 13. Migrate SEO Routes
  console.log('⏳ Migrating SEO route configurations...');
  const seoRoutes = data.seo?.routes ? Object.values(data.seo.routes) : [];
  await migrateEntity('seo_routes', seoRoutes, async (r: any) => {
    await conn.query(
      `INSERT INTO seo_routes (route_path, title, description, canonical_url, og_title, og_description, og_image, robots)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), description = VALUES(description), canonical_url = VALUES(canonical_url),
         og_title = VALUES(og_title), og_description = VALUES(og_description), og_image = VALUES(og_image), robots = VALUES(robots)`,
      [
        r.path,
        r.title,
        r.description || '',
        r.canonical || `https://zanzirangihouse.com${r.path}`,
        r.ogTitle || r.title,
        r.ogDescription || r.description || '',
        r.ogImage || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
        r.robots || 'index, follow',
      ]
    );
  });

  // 14. Migrate Media Assets
  console.log('⏳ Migrating media asset records...');
  await migrateEntity('media_assets', data.media, async (m) => {
    await conn.query(
      `INSERT INTO media_assets (id, filename, url, mime_type, size_bytes, width, height, alt_text, caption, usage_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         filename = VALUES(filename), url = VALUES(url), mime_type = VALUES(mime_type),
         size_bytes = VALUES(size_bytes), alt_text = VALUES(alt_text), caption = VALUES(caption)`,
      [
        m.id,
        m.filename,
        m.url,
        m.mimeType || 'image/jpeg',
        m.sizeBytes || 0,
        m.width || null,
        m.height || null,
        m.altText || null,
        m.caption || null,
        m.referenceCount || 1,
        m.uploadedAt ? new Date(m.uploadedAt) : new Date(),
      ]
    );
  });

  // 15. Record Schema Migration Version
  await conn.query(
    'INSERT INTO schema_migrations (version) VALUES (?) ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP',
    ['001_initial_schema']
  );

  conn.release();
  await pool.end();

  console.log('================================================================');
  console.log('MIGRATION SUMMARY REPORT:');
  console.log('================================================================');
  console.table(reports);
  console.log('🎉 Migration completed successfully! No data was silently discarded.');
  return reports;
}

// Direct execution from CLI
if (
  process.argv[1]?.endsWith('migrate-json-to-mysql.ts') ||
  process.argv[1]?.endsWith('migrate-json-to-mysql.js')
) {
  runJsonToMysqlMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed with error:', err.message);
      process.exit(1);
    });
}
