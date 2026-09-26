import mysql from 'mysql2/promise';
import { DatabaseAdapter, UserRecord, AuditLogRecord } from './adapter.ts';
import { env } from '../config/env.ts';
import {
  HomepageContent,
  Villa,
  GalleryItem,
  Facility,
  Review,
  VideoData,
  SeoData,
  MediaAsset,
  SettingsModel,
  DashboardStats,
} from '../../src/services/contentApi.ts';

export class MysqlDatabaseAdapter implements DatabaseAdapter {
  public provider: 'mysql' = 'mysql';
  private pool: mysql.Pool | null = null;

  private getPool(): mysql.Pool {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: env.MYSQL_HOST || 'localhost',
        port: env.MYSQL_PORT || 3306,
        database: env.MYSQL_DATABASE || 'zanzirangi_house',
        user: env.MYSQL_USER || 'root',
        password: env.MYSQL_PASSWORD || '',
        waitForConnections: true,
        connectionLimit: env.MYSQL_CONNECTION_LIMIT || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
    }
    return this.pool;
  }

  async connect(): Promise<void> {
    try {
      const pool = this.getPool();
      const conn = await pool.getConnection();
      conn.release();
      console.log(`🐬 Connected to Hostinger MySQL Database [${env.MYSQL_DATABASE}@${env.MYSQL_HOST}]`);

      // Auto-verify schema and seed initial baseline if fresh database
      try {
        const [tables]: any = await pool.query("SHOW TABLES LIKE 'homepage_config'");
        if (!tables || tables.length === 0) {
          console.log('⚡ Fresh Hostinger database detected. Initializing schema and baseline content...');
          const { runMigration } = await import('./migrateFromJson.ts');
          await runMigration(pool);
          console.log('✅ Hostinger MySQL schema initialized and seeded successfully.');
        } else {
          console.log('✅ Hostinger MySQL schema verified and ready.');
        }
      } catch (schemaErr: any) {
        console.warn('⚠️ Hostinger schema verification notice:', schemaErr.message);
      }
    } catch (err: any) {
      console.error('❌ Failed to establish MySQL connection:', err.message);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🐬 MySQL connection pool closed gracefully.');
    }
  }

  async healthCheck(): Promise<{ connected: boolean; provider: string; error?: string }> {
    try {
      const pool = this.getPool();
      const [rows] = await pool.query('SELECT 1 as healthy');
      return {
        connected: Array.isArray(rows) && rows.length > 0,
        provider: 'mysql',
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: 'mysql',
        error: err.message,
      };
    }
  }

  // --- Homepage ---
  async getHomepage(): Promise<HomepageContent> {
    const pool = this.getPool();
    const [cfgRows]: any = await pool.query('SELECT * FROM homepage_config WHERE id = 1 LIMIT 1');
    const [slideRows]: any = await pool.query('SELECT * FROM hero_slides ORDER BY sort_order ASC');
    const [secRows]: any = await pool.query('SELECT * FROM homepage_sections ORDER BY sort_order ASC');

    const cfg = cfgRows[0] || {};
    let socials = {
      instagram: 'https://instagram.com/zanzirangihouse',
      facebook: 'https://facebook.com/zanzirangihouse',
      tiktok: 'https://tiktok.com/@zanzirangihouse',
      youtube: 'https://youtube.com/@zanzirangihouse',
      whatsapp: 'https://wa.me/255777890123',
    };
    if (cfg.socials_json) {
      try {
        socials = JSON.parse(cfg.socials_json);
      } catch {
        // use default
      }
    }

    return {
      hero: {
        title: cfg.hero_title || 'Zanzirangi House',
        subtitle: cfg.hero_subtitle || '— Private Luxury Villas in Zanzibar',
        description: cfg.hero_description || 'Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi.',
        badgeText: cfg.hero_badge_text || 'ZANZIBAR, TANZANIA',
        primaryCtaText: cfg.hero_primary_cta_text || 'Reserve Sanctuary',
        primaryCtaLink: cfg.hero_primary_cta_link || '#stay',
        secondaryCtaText: cfg.hero_secondary_cta_text || 'Explore Sanctuary',
        secondaryCtaLink: cfg.hero_secondary_cta_link || '#itinerary',
        heroImage: cfg.hero_image || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
        autoPlayIntervalSeconds: cfg.auto_play_interval || 6,
        slides: slideRows.map((s: any) => ({
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
          alignment: s.alignment || 'center',
          overlayOpacity: parseFloat(s.overlay_opacity || '0.4'),
          order: s.sort_order || 0,
          visible: Boolean(s.visible),
        })),
      },
      intro: {
        eyebrow: cfg.intro_eyebrow || 'MORE THAN A STAY',
        title: cfg.intro_title || 'An intimate sanctuary between the ocean breeze and Swahili heritage',
        description: cfg.intro_description || 'Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani.',
      },
      contact: {
        phone: cfg.contact_phone || '+255 777 890 123',
        email: cfg.contact_email || 'concierge@zanzirangihouse.com',
        whatsappNumber: cfg.contact_whatsapp || '255777890123',
        address: cfg.contact_address || 'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
      },
      sections: secRows.map((sec: any) => ({
        id: sec.id,
        label: sec.label,
        description: sec.description,
        order: sec.sort_order,
        visible: Boolean(sec.visible),
      })),
      socials,
      footer: {
        copyrightText: cfg.footer_copyright || '© 2026 Zanzirangi House. All rights reserved.',
        tagline: cfg.footer_tagline || 'A tranquil coastal sanctuary in Kizimkazi Dimbani.',
      },
      meta: {
        lastUpdated: cfg.meta_last_updated ? new Date(cfg.meta_last_updated).toISOString() : new Date().toISOString(),
        updatedBy: cfg.meta_updated_by || 'system',
      },
    };
  }

  async updateHomepage(data: Partial<HomepageContent>, userEmail: string): Promise<HomepageContent> {
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
            userEmail,
          ]
        );

        if (Array.isArray(data.hero.slides)) {
          await conn.query('DELETE FROM hero_slides');
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
                s.alignment || 'center',
                s.overlayOpacity || 0.4,
                s.order ?? i,
                s.visible !== false ? 1 : 0,
              ]
            );
          }
        }
      }

      if (data.intro) {
        await conn.query(
          'UPDATE homepage_config SET intro_eyebrow = ?, intro_title = ?, intro_description = ? WHERE id = 1',
          [data.intro.eyebrow, data.intro.title, data.intro.description]
        );
      }

      if (data.contact) {
        await conn.query(
          'UPDATE homepage_config SET contact_phone = ?, contact_email = ?, contact_whatsapp = ?, contact_address = ? WHERE id = 1',
          [data.contact.phone, data.contact.email, data.contact.whatsappNumber, data.contact.address]
        );
      }

      if (data.socials) {
        await conn.query('UPDATE homepage_config SET socials_json = ? WHERE id = 1', [JSON.stringify(data.socials)]);
      }

      if (data.footer) {
        await conn.query(
          'UPDATE homepage_config SET footer_copyright = ?, footer_tagline = ? WHERE id = 1',
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
        'INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)',
        ['HOMEPAGE_UPDATED', userEmail, 'Updated homepage configuration & layout']
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
  async getVillas(): Promise<Villa[]> {
    const pool = this.getPool();
    const [villaRows]: any = await pool.query('SELECT * FROM villas ORDER BY sort_order ASC');
    const [amenityRows]: any = await pool.query('SELECT * FROM villa_amenities ORDER BY sort_order ASC');
    const [imageRows]: any = await pool.query('SELECT * FROM villa_images ORDER BY sort_order ASC');

    const amenitiesMap = new Map<string, string[]>();
    for (const a of amenityRows) {
      if (!amenitiesMap.has(a.villa_id)) amenitiesMap.set(a.villa_id, []);
      amenitiesMap.get(a.villa_id)!.push(a.amenity_name);
    }

    const imagesMap = new Map<string, string[]>();
    for (const img of imageRows) {
      if (!imagesMap.has(img.villa_id)) imagesMap.set(img.villa_id, []);
      imagesMap.get(img.villa_id)!.push(img.image_url);
    }

    return villaRows.map((v: any) => ({
      id: v.id,
      name: v.name,
      shortName: v.short_name,
      type: v.type,
      subtitle: v.subtitle,
      shortDescription: v.short_description,
      description: v.description,
      pricePerNight: parseFloat(v.price_per_night),
      priceUnit: v.price_unit,
      promotionalPrice: v.promotional_price ? parseFloat(v.promotional_price) : undefined,
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
      gallery: imagesMap.get(v.id) || [],
    }));
  }

  async getVillaById(id: string): Promise<Villa | null> {
    const villas = await this.getVillas();
    return villas.find((v) => v.id === id) || null;
  }

  async saveVilla(villa: Villa, userEmail: string): Promise<Villa> {
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
          villa.subtitle || '',
          villa.shortDescription || '',
          villa.description,
          villa.pricePerNight,
          villa.priceUnit || 'USD',
          villa.promotionalPrice || null,
          villa.sizeSqm || 85,
          villa.maxGuests || 2,
          villa.bedrooms || 1,
          villa.bathrooms || 1,
          villa.beds || 1,
          villa.bed || 'King Bed',
          villa.bathroom || 'En-suite',
          villa.view || 'Ocean View',
          villa.architecturalFeature || '',
          villa.heroImage || villa.coverImage || '',
          villa.coverImage || villa.heroImage || '',
          villa.status || 'published',
          villa.featured ? 1 : 0,
          villa.order || 0,
        ]
      );

      // Replace amenities
      await conn.query('DELETE FROM villa_amenities WHERE villa_id = ?', [villa.id]);
      if (Array.isArray(villa.amenities)) {
        for (let i = 0; i < villa.amenities.length; i++) {
          await conn.query(
            'INSERT INTO villa_amenities (villa_id, amenity_name, sort_order) VALUES (?, ?, ?)',
            [villa.id, villa.amenities[i], i]
          );
        }
      }

      // Replace images
      await conn.query('DELETE FROM villa_images WHERE villa_id = ?', [villa.id]);
      if (Array.isArray(villa.gallery)) {
        for (let i = 0; i < villa.gallery.length; i++) {
          await conn.query(
            'INSERT INTO villa_images (villa_id, image_url, sort_order) VALUES (?, ?, ?)',
            [villa.id, villa.gallery[i], i]
          );
        }
      }

      await conn.query(
        'INSERT INTO audit_logs (action, user_email, details) VALUES (?, ?, ?)',
        ['VILLA_SAVED', userEmail, `Saved villa: ${villa.name} (${villa.id})`]
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

  async deleteVilla(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [result]: any = await pool.query('DELETE FROM villas WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      await this.addAuditLog({
        action: 'VILLA_DELETED',
        userEmail,
        details: `Deleted villa: ${id}`,
      });
      return true;
    }
    return false;
  }

  // --- Gallery ---
  async getGallery(): Promise<GalleryItem[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM gallery_items ORDER BY sort_order ASC');
    return rows.map((r: any) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      caption: r.caption,
      description: r.description,
      image: r.image_url,
      aspectRatio: r.aspect_ratio || '4/3',
      order: r.sort_order,
      published: Boolean(r.published),
    }));
  }

  async saveGalleryItem(item: GalleryItem, userEmail: string): Promise<GalleryItem> {
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
        item.caption || item.description || '',
        item.description || item.caption || '',
        item.image,
        item.aspectRatio || '4/3',
        item.order || 0,
        item.published !== false ? 1 : 0,
      ]
    );

    await this.addAuditLog({
      action: 'GALLERY_SAVED',
      userEmail,
      details: `Saved photograph: ${item.title} (${item.id})`,
    });

    return item;
  }

  async deleteGalleryItem(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [res]: any = await pool.query('DELETE FROM gallery_items WHERE id = ?', [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: 'GALLERY_DELETED', userEmail, details: `Removed item ${id}` });
      return true;
    }
    return false;
  }

  // --- Facilities ---
  async getFacilities(): Promise<Facility[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM facilities ORDER BY sort_order ASC');
    return rows.map((f: any) => ({
      id: f.id,
      title: f.title,
      category: f.category,
      description: f.description,
      hours: f.hours,
      highlight: f.highlight,
      image: f.image_url,
      icon: f.icon,
      order: f.sort_order,
      visible: Boolean(f.visible),
    }));
  }

  async saveFacility(facility: Facility, userEmail: string): Promise<Facility> {
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
        facility.icon || 'Sparkles',
        facility.order || 0,
        facility.visible !== false ? 1 : 0,
      ]
    );

    await this.addAuditLog({
      action: 'FACILITY_SAVED',
      userEmail,
      details: `Saved facility: ${facility.title} (${facility.id})`,
    });

    return facility;
  }

  // --- Testimonials ---
  async getTestimonials(): Promise<Review[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC');
    return rows.map((t: any) => ({
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
      visible: Boolean(t.visible),
    }));
  }

  async saveTestimonial(testimonial: Review, userEmail: string): Promise<Review> {
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
        testimonial.avatar || '',
        testimonial.rating || 5,
        testimonial.stayDate,
        testimonial.villaStayed,
        testimonial.title,
        testimonial.reviewText,
        testimonial.verifiedStay !== false ? 1 : 0,
        testimonial.featured ? 1 : 0,
        testimonial.order || 0,
        testimonial.visible !== false ? 1 : 0,
      ]
    );

    await this.addAuditLog({
      action: 'TESTIMONIAL_SAVED',
      userEmail,
      details: `Saved review: ${testimonial.guestName} (${testimonial.id})`,
    });

    return testimonial;
  }

  async deleteTestimonial(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [res]: any = await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: 'TESTIMONIAL_DELETED', userEmail, details: `Removed testimonial ${id}` });
      return true;
    }
    return false;
  }

  // --- Videos ---
  async getVideos(): Promise<VideoData> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM video_storyboard WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    let scenes = [];
    if (r.scenes_json) {
      try {
        scenes = JSON.parse(r.scenes_json);
      } catch {
        // empty
      }
    }
    return {
      videoUrl: r.video_url || 'https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4',
      posterImage: r.poster_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
      scenes,
    };
  }

  async updateVideos(data: Partial<VideoData>, userEmail: string): Promise<VideoData> {
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
      action: 'VIDEOS_UPDATED',
      userEmail,
      details: 'Updated 4K cinematic film & storyboard scenes',
    });

    return merged;
  }

  // --- SEO ---
  async getSeo(): Promise<SeoData> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM seo_routes');
    const routes: Record<string, any> = {};

    for (const r of rows) {
      routes[r.route_path] = {
        title: r.title,
        description: r.description,
        canonical: r.canonical_url,
        ogTitle: r.og_title,
        ogDescription: r.og_description,
        ogImage: r.og_image,
        robots: r.robots,
      };
    }

    return {
      siteTitle: 'Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat',
      defaultOgImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
      routes,
    };
  }

  async updateSeo(data: Partial<SeoData>, userEmail: string): Promise<SeoData> {
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
            r.ogImage || '',
            r.robots || 'index, follow',
          ]
        );
      }
    }

    await this.addAuditLog({
      action: 'SEO_UPDATED',
      userEmail,
      details: 'Updated SERP metadata routes',
    });

    return this.getSeo();
  }

  // --- Media ---
  async getMedia(): Promise<MediaAsset[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM media_assets ORDER BY created_at DESC');
    return rows.map((m: any) => ({
      id: m.id,
      filename: m.filename,
      url: m.url,
      mimeType: m.mime_type,
      sizeBytes: Number(m.size_bytes),
      width: m.width,
      height: m.height,
      altText: m.alt_text,
      caption: m.caption,
      createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
      usageCount: m.usage_count || 0,
    }));
  }

  async saveMedia(asset: MediaAsset, userEmail: string): Promise<MediaAsset> {
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
        asset.altText || '',
        asset.caption || '',
        asset.usageCount || 0,
      ]
    );

    await this.addAuditLog({
      action: 'MEDIA_SAVED',
      userEmail,
      details: `Saved media asset: ${asset.filename}`,
    });

    return asset;
  }

  async deleteMedia(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [res]: any = await pool.query('DELETE FROM media_assets WHERE id = ?', [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: 'MEDIA_DELETED', userEmail, details: `Deleted media ID ${id}` });
      return true;
    }
    return false;
  }

  // --- Settings ---
  async getSettings(): Promise<SettingsModel> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    return {
      siteName: r.site_name || 'Zanzirangi House',
      tagline: r.tagline || 'Private Luxury Villas & Sanctuary in Kizimkazi, Zanzibar',
      defaultCurrency: r.default_currency || 'USD ($)',
      reservationNotificationEmail: r.reservation_notification_email || 'reservations@zanzirangihouse.com',
      conciergePhone: r.concierge_phone || '+255 777 890 123',
      maintenanceMode: Boolean(r.maintenance_mode),
    };
  }

  async updateSettings(data: Partial<SettingsModel>, userEmail: string): Promise<SettingsModel> {
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
        data.siteName || 'Zanzirangi House',
        data.tagline || '',
        data.defaultCurrency || 'USD ($)',
        data.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
        data.conciergePhone || '+255 777 890 123',
        data.maintenanceMode ? 1 : 0,
      ]
    );

    await this.addAuditLog({
      action: 'SETTINGS_UPDATED',
      userEmail,
      details: 'Updated sanctuary site settings',
    });

    return this.getSettings();
  }

  // --- Users & Auth ---
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [
      email.trim().toLowerCase(),
    ]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : undefined,
    };
  }

  async saveUser(user: UserRecord): Promise<void> {
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
        user.createdAt || new Date(),
        user.lastLogin || null,
      ]
    );
  }

  async listUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT id, email, name, role, created_at, last_login FROM users');
    return rows.map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : undefined,
    }));
  }

  // --- Audit Logs ---
  async getAuditLogs(limit: number = 20): Promise<AuditLogRecord[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?', [limit]);
    return rows.map((a: any) => ({
      id: String(a.id),
      action: a.action,
      userEmail: a.user_email,
      details: a.details,
      ipAddress: a.ip_address,
      timestamp: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString(),
    }));
  }

  async addAuditLog(entry: Omit<AuditLogRecord, 'timestamp'>): Promise<void> {
    const pool = this.getPool();
    await pool.query('INSERT INTO audit_logs (action, user_email, details, ip_address) VALUES (?, ?, ?, ?)', [
      entry.action,
      entry.userEmail,
      entry.details || null,
      entry.ipAddress || null,
    ]);
  }

  // --- Dashboard Stats ---
  async getDashboardStats(): Promise<DashboardStats> {
    const pool = this.getPool();
    const [villasCount]: any = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="published" THEN 1 ELSE 0 END) as pub FROM villas');
    const [galleryCount]: any = await pool.query('SELECT COUNT(*) as total FROM gallery_items');
    const [facilitiesCount]: any = await pool.query('SELECT COUNT(*) as total FROM facilities');
    const [testimonialsCount]: any = await pool.query('SELECT COUNT(*) as total FROM testimonials');
    const [mediaCount]: any = await pool.query('SELECT COUNT(*) as total FROM media_assets');
    const [hpMeta]: any = await pool.query('SELECT meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1');

    const recentLogs = await this.getAuditLogs(10);
    const meta = hpMeta[0] || {};

    return {
      status: 'Connected',
      lastPublished: meta.meta_last_updated ? new Date(meta.meta_last_updated).toISOString() : null,
      publishedBy: meta.meta_updated_by || null,
      counts: {
        villasPublished: Number(villasCount[0]?.pub || 0),
        villasTotal: Number(villasCount[0]?.total || 0),
        galleryItems: Number(galleryCount[0]?.total || 0),
        facilities: Number(facilitiesCount[0]?.total || 0),
        testimonials: Number(testimonialsCount[0]?.total || 0),
        mediaAssets: Number(mediaCount[0]?.total || 0),
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details,
      })),
    };
  }
}
