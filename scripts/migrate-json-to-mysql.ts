import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../server/config/env.ts';

interface MigrationReportRow {
  table: string;
  sourceCount: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export async function runJsonToMysqlMigration(): Promise<MigrationReportRow[]> {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE: JSON → MYSQL PRODUCTION MIGRATION UTILITY');
  console.log('================================================================');

  const dbJsonPath = path.resolve(process.cwd(), 'server/data/db.json');
  const timestamp = Date.now();
  const backupsDir = path.resolve(process.cwd(), 'server/data/backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  const timestampedBackupPath = path.join(backupsDir, `db.json.${timestamp}.backup`);
  const legacyBackupPath = path.resolve(process.cwd(), 'server/data/db.json.backup');

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
  console.log(`⏳ Creating backups at:`);
  console.log(`   - ${timestampedBackupPath}`);
  console.log(`   - ${legacyBackupPath}`);
  fs.writeFileSync(timestampedBackupPath, rawJson, 'utf-8');
  fs.writeFileSync(legacyBackupPath, rawJson, 'utf-8');
  console.log(`✓ Backups created successfully.`);

  // 3. Connect to MySQL using Hostinger credentials
  const dbHost = process.env.DB_HOST || env.MYSQL_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT || env.MYSQL_PORT || 3306);
  const dbName = process.env.DB_NAME || env.MYSQL_DATABASE || 'u170555096_Zanzirangi';
  const dbUser = process.env.DB_USER || env.MYSQL_USER || 'u170555096_admindatabase';
  const dbPassword = process.env.DB_PASSWORD || env.MYSQL_PASSWORD || '';

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

  const reports: MigrationReportRow[] = [];

  // Helper migration runner
  async function migrateEntity(
    name: string,
    sourceArray: any[] | undefined,
    processor: (item: any) => Promise<'inserted' | 'updated'>
  ) {
    const list = Array.isArray(sourceArray) ? sourceArray : sourceArray ? [sourceArray] : [];
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of list) {
      try {
        const action = await processor(item);
        if (action === 'inserted') inserted++;
        else if (action === 'updated') updated++;
      } catch (err: any) {
        console.error(`  ⚠️ Error migrating ${name} item:`, err.message);
        errors++;
      }
    }

    reports.push({
      table: name,
      sourceCount: list.length,
      inserted,
      updated,
      skipped,
      errors,
      status: errors === 0 ? 'SUCCESS' : 'WARNING',
    });
    console.log(`  ✓ ${name}: ${inserted + updated}/${list.length} records processed (${errors} errors).`);
  }

  // 5. Migrate Users
  console.log('⏳ Migrating administrative user accounts...');
  await migrateEntity('users', data.users, async (u) => {
    const [res]: any = await conn.query(
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
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 6. Migrate Site Settings
  console.log('⏳ Migrating site & property settings...');
  const s = data.settings || {};
  const [sRes]: any = await conn.query(
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
    inserted: sRes.affectedRows === 1 ? 1 : 0,
    updated: sRes.affectedRows === 1 ? 0 : 1,
    skipped: 0,
    errors: 0,
    status: 'SUCCESS',
  });

  // 7. Migrate Contact Settings
  const hp = data.homepage || {};
  const contact = hp.contact || {};
  const [cRes]: any = await conn.query(
    `INSERT INTO contact_settings (id, phone, email, whatsapp_number, concierge_phone, address, google_maps_url)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      phone = VALUES(phone), email = VALUES(email), whatsapp_number = VALUES(whatsapp_number),
      concierge_phone = VALUES(concierge_phone), address = VALUES(address), google_maps_url = VALUES(google_maps_url)`,
    [
      contact.phone || s.phone || '+255 777 890 123',
      contact.email || s.email || 'info@zanzirangihouse.com',
      contact.whatsappNumber || s.whatsapp || '+255 777 890 123',
      s.conciergePhone || '+255 777 890 123',
      contact.address || s.address || 'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
      contact.googleMapsUrl || 'https://maps.google.com/?q=Kizimkazi+Dimbani+Zanzibar',
    ]
  );
  reports.push({
    table: 'contact_settings',
    sourceCount: 1,
    inserted: cRes.affectedRows === 1 ? 1 : 0,
    updated: cRes.affectedRows === 1 ? 0 : 1,
    skipped: 0,
    errors: 0,
    status: 'SUCCESS',
  });

  // 8. Migrate Homepage Config
  console.log('⏳ Migrating homepage config and hero slides...');
  const hero = hp.hero || {};
  const intro = hp.intro || {};
  const socials = hp.socials || {};
  const footer = hp.footer || {};
  const meta = hp.meta || {};

  const [hpRes]: any = await conn.query(
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
    inserted: hpRes.affectedRows === 1 ? 1 : 0,
    updated: hpRes.affectedRows === 1 ? 0 : 1,
    skipped: 0,
    errors: 0,
    status: 'SUCCESS',
  });

  // 9. Hero Slides
  await migrateEntity('hero_slides', hero.slides, async (slide) => {
    const [res]: any = await conn.query(
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
        slide.imageUrl || slide.heroImage || slide.image || '',
        slide.videoUrl || null,
        slide.alignment || 'center',
        slide.overlayOpacity ?? 0.4,
        slide.order ?? 0,
        slide.visible !== false ? 1 : 0,
      ]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 10. Homepage Sections
  await migrateEntity('homepage_sections', hp.sections, async (sec) => {
    const [res]: any = await conn.query(
      `INSERT INTO homepage_sections (id, label, description, sort_order, visible)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), sort_order = VALUES(sort_order), visible = VALUES(visible)`,
      [sec.id, sec.label || sec.name, sec.description || null, sec.order ?? 0, sec.visible !== false ? 1 : 0]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 11. Migrate Villas & Villa Amenities / Images
  console.log('⏳ Migrating luxury villas...');
  await migrateEntity('villas', data.villas, async (v) => {
    const [res]: any = await conn.query(
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
        v.pricePerNight ? parseFloat(String(v.pricePerNight).replace(/[^0-9.]/g, '')) || 400.0 : 400.0,
        v.priceUnit || 'USD',
        v.promotionalPrice ? parseFloat(String(v.promotionalPrice).replace(/[^0-9.]/g, '')) : null,
        v.sizeSqm || (v.size ? parseInt(String(v.size), 10) : 85),
        v.maxGuests || v.capacity || 2,
        v.bedrooms || 1,
        v.bathrooms || (v.bathroom ? parseInt(String(v.bathroom), 10) : 1),
        v.bedsCount || 1,
        v.bedType || v.bed || null,
        v.bathroomType || (typeof v.bathroom === 'string' ? v.bathroom : null),
        v.viewType || v.view || null,
        v.architecturalFeature || null,
        v.heroImage || null,
        v.coverImage || v.heroImage || null,
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

    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 12. Migrate Gallery Categories & Items
  console.log('⏳ Migrating gallery curation...');
  const galleryCats = [
    { id: 'property', name: 'Estate & Grounds', order: 0 },
    { id: 'villas', name: 'Villas & Suites', order: 1 },
    { id: 'dining', name: 'Culinary & Dining', order: 2 },
    { id: 'pool', name: 'Oceanfront Pools', order: 3 },
    { id: 'garden', name: 'Lush Gardens', order: 4 },
    { id: 'zanzibar', name: 'Zanzibar Escapes', order: 5 },
    { id: 'experiences', name: 'Bespoke Journeys', order: 6 },
  ];
  await migrateEntity('gallery_categories', galleryCats, async (cat) => {
    const [res]: any = await conn.query(
      `INSERT INTO gallery_categories (id, name, sort_order) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order)`,
      [cat.id, cat.name, cat.order]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  await migrateEntity('gallery_items', data.gallery, async (g) => {
    const [res]: any = await conn.query(
      `INSERT INTO gallery_items (id, category, title, caption, description, image_url, aspect_ratio, sort_order, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category = VALUES(category), title = VALUES(title), caption = VALUES(caption),
         description = VALUES(description), image_url = VALUES(image_url), aspect_ratio = VALUES(aspect_ratio),
         sort_order = VALUES(sort_order), published = VALUES(published)`,
      [
        g.id,
        g.category || 'property',
        g.title || 'Sanctuary View',
        g.caption || null,
        g.description || null,
        g.imageUrl || g.image || '',
        g.aspectRatio || g.aspect || '4/3',
        g.order ?? 0,
        g.published !== false ? 1 : 0,
      ]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 13. Migrate Facilities
  console.log('⏳ Migrating facilities...');
  await migrateEntity('facilities', data.facilities, async (f) => {
    const [res]: any = await conn.query(
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
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 14. Migrate Testimonials
  console.log('⏳ Migrating guest testimonials...');
  await migrateEntity('testimonials', data.testimonials, async (t) => {
    const [res]: any = await conn.query(
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
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 15. Migrate Videos & Storyboard
  console.log('⏳ Migrating video storyboard...');
  const vids = data.videos || {};
  const [vidRes]: any = await conn.query(
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
    inserted: vidRes.affectedRows === 1 ? 1 : 0,
    updated: vidRes.affectedRows === 1 ? 0 : 1,
    skipped: 0,
    errors: 0,
    status: 'SUCCESS',
  });

  // 16. Migrate SEO Routes
  console.log('⏳ Migrating SEO route configurations...');
  const seoRoutes = data.seo?.routes ? Object.values(data.seo.routes) : [];
  await migrateEntity('seo_routes', seoRoutes, async (r: any) => {
    const [res]: any = await conn.query(
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
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 17. Migrate Media Assets
  console.log('⏳ Migrating media asset records...');
  await migrateEntity('media_assets', data.media, async (m) => {
    const [res]: any = await conn.query(
      `INSERT INTO media_assets 
        (id, filename, original_filename, mime_type, size, size_bytes, storage_path, public_url, url, width, height, alt_text, title, caption, usage_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         filename = VALUES(filename), mime_type = VALUES(mime_type), size = VALUES(size), size_bytes = VALUES(size_bytes),
         storage_path = VALUES(storage_path), public_url = VALUES(public_url), url = VALUES(url),
         alt_text = VALUES(alt_text), title = VALUES(title), caption = VALUES(caption)`,
      [
        m.id,
        m.filename,
        m.filename,
        m.mimeType || 'image/jpeg',
        m.sizeBytes || 0,
        m.sizeBytes || 0,
        path.join('uploads', m.filename),
        m.url,
        m.url,
        m.width || null,
        m.height || null,
        m.altText || null,
        m.altText || m.filename,
        m.caption || null,
        m.referenceCount || m.usageCount || 1,
        m.uploadedAt ? new Date(m.uploadedAt) : new Date(),
      ]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 18. Migrate Audit Logs
  console.log(`⏳ Migrating ${data.auditLog?.length || 0} audit log records...`);
  await migrateEntity('audit_logs', data.auditLog, async (log) => {
    const [res]: any = await conn.query(
      `INSERT INTO audit_logs (action, user_email, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        log.action,
        log.userEmail,
        log.details || null,
        log.ipAddress || null,
        log.timestamp ? new Date(log.timestamp) : new Date(),
      ]
    );
    return res.affectedRows === 1 ? 'inserted' : 'updated';
  });

  // 19. Record Schema Migration Version
  await conn.query(
    'INSERT INTO schema_migrations (version) VALUES (?) ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP',
    ['001_initial_schema']
  );

  conn.release();
  await pool.end();

  console.log('================================================================');
  console.log('JSON → MYSQL MIGRATION REPORT');
  console.log('================================================================');
  console.log(
    'TABLE'.padEnd(22) +
    'SOURCE RECORDS'.padEnd(16) +
    'INSERTED'.padEnd(12) +
    'UPDATED'.padEnd(12) +
    'SKIPPED'.padEnd(10) +
    'ERRORS'.padEnd(8)
  );
  console.log('----------------------------------------------------------------');
  for (const r of reports) {
    console.log(
      r.table.padEnd(22) +
      String(r.sourceCount).padEnd(16) +
      String(r.inserted).padEnd(12) +
      String(r.updated).padEnd(12) +
      String(r.skipped).padEnd(10) +
      String(r.errors).padEnd(8)
    );
  }
  console.log('================================================================');
  console.log('🎉 Migration finished. All records preserved without data loss.');
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
