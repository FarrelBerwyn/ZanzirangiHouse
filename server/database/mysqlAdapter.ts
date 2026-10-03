import mysql from 'mysql2/promise';
import {
  DatabaseAdapter,
  UserRecord,
  AuditLogRecord,
  PageContentRecord,
  ChauffeurConfigRecord,
  WhyStayConfigRecord,
  DiningConfigRecord,
  DiningCategoryRecord,
  ExperienceRecord,
  SafariDestinationRecord,
  GlobalContentRecord,
  ContentTranslationRecord,
  PageSectionConfig,
  TransferSpecItem,
  WhyStayPillar,
  DiningMoment,
  SignatureDishItem,
  NavLinkItem,
} from './adapter.ts';
import { getMysqlPool, closeMysqlPool } from './connection.ts';
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

// Record fields that map to dedicated columns; everything else goes to extras_json.
const CHAUFFEUR_COLUMN_FIELDS = [
  'eyebrow', 'heading', 'subhead', 'routeLabel', 'routeTitle', 'vehicleImage', 'specsEyebrow', 'cardTitle',
  'airportTitle', 'airportDesc', 'shuttleTitle', 'shuttleDesc', 'vehicleTypeTitle', 'vehicleTypeDesc',
  'passengerLuggageTitle', 'passengerLuggageDesc', 'amenitiesNote', 'ctaRequestLabel', 'ctaAddBookingLabel', 'specItems',
];
const WHY_STAY_COLUMN_FIELDS = ['eyebrow', 'heading', 'subhead', 'pillars'];
const DINING_CONFIG_COLUMN_FIELDS = [
  'eyebrow', 'heading', 'subhead', 'intro', 'gardenEyebrow', 'gardenBadge', 'gardenTitle', 'gardenDesc',
  'tagZeroMiles', 'tagSpices', 'tagSeafood', 'moments',
];
const GLOBAL_COLUMN_FIELDS = [
  'brandName', 'navLinks', 'ctaPlanStayLabel', 'ctaPlanStayLink', 'footerTagline', 'footerCopyright',
  'contactPhone', 'contactEmail', 'contactWhatsapp', 'contactAddress', 'socials',
];
const EXPERIENCE_COLUMN_FIELDS = [
  'title', 'category', 'duration', 'tag', 'priceNote', 'shortDescription', 'description', 'imageUrl', 'whatsappMessage', 'order', 'visible',
];
const SAFARI_COLUMN_FIELDS = [
  'name', 'tagline', 'region', 'flightTimeFromZanzibar', 'heroImage', 'description', 'highlights', 'bestFor', 'safariType', 'order', 'visible',
];
const DINING_CATEGORY_COLUMN_FIELDS = ['name', 'tabLabel', 'subtitle', 'description', 'imageUrl', 'signatureDishes', 'order', 'visible'];

export class MysqlDatabaseAdapter implements DatabaseAdapter {
  public provider: 'mysql' = 'mysql';

  private getPool(): mysql.Pool {
    return getMysqlPool();
  }

  async connect(): Promise<void> {
    try {
      const pool = this.getPool();
      const conn = await pool.getConnection();
      conn.release();
      const host = process.env.DB_HOST || env.MYSQL_HOST || 'localhost';
      const db = process.env.DB_NAME || env.MYSQL_DATABASE || '';
      console.log(`🐬 Connected to Hostinger MySQL Database [${db}@${host}]`);

      // Safe verification without automatic reset or seed overwrite
      try {
        const [tables]: any = await pool.query("SHOW TABLES LIKE 'homepage_config'");
        if (!tables || tables.length === 0) {
          console.warn('⚠️ Notice: Database tables not found yet. Run `npm run db:migrate:mysql` to initialize schema and migrate content.');
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
    await closeMysqlPool();
    console.log('🐬 MySQL connection pool closed gracefully.');
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
    await this.ensureExtrasColumn('homepage_config');
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
          // The admin editor and HeroSection read/write `heroImage`.
          heroImage: s.image_url,
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
        email: cfg.contact_email || 'info@zanzirangihouse.com',
        whatsappNumber: cfg.contact_whatsapp || '255777890123',
        address: cfg.contact_address || 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
        googleMapsUrl: this.parseExtras(cfg.extras_json).contactGoogleMapsUrl || undefined,
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
    // DDL (if the extras column is missing) must run before the transaction starts.
    await this.ensureExtrasColumn('homepage_config');
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
                s.heroImage || s.imageUrl || '',
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
        if (data.contact.googleMapsUrl !== undefined) {
          const [extraRows]: any = await conn.query('SELECT extras_json FROM homepage_config WHERE id = 1');
          const extras = this.parseExtras(extraRows[0]?.extras_json);
          extras.contactGoogleMapsUrl = data.contact.googleMapsUrl || undefined;
          await conn.query('UPDATE homepage_config SET extras_json = ? WHERE id = 1', [JSON.stringify(extras)]);
        }
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
            [sec.id, (sec as any).label || sec.name, sec.description, sec.order, sec.visible !== false ? 1 : 0]
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

    return villaRows.map((v: any) => {
      const roomNum = v.id && v.id.startsWith('villa-')
        ? `VILLA ${v.id.replace('villa-', '').padStart(2, '0').toUpperCase()}`
        : 'VILLA 01';
      const sizeStr = v.size_sqm ? `${v.size_sqm} m² (${Math.round(v.size_sqm * 10.7639).toLocaleString()} sq ft)` : '85 m² (915 sq ft)';
      const rawPrice = v.price_per_night !== undefined && v.price_per_night !== null ? String(v.price_per_night) : '400';
      const priceStr = rawPrice.startsWith('$') ? rawPrice : `$${parseFloat(rawPrice)}`;
      const rawPromo = v.promotional_price !== undefined && v.promotional_price !== null ? String(v.promotional_price) : '';
      const promoStr = rawPromo ? (rawPromo.startsWith('$') ? rawPromo : `$${parseFloat(rawPromo)}`) : undefined;
      const imagesList = imagesMap.get(v.id) || (v.hero_image ? [v.hero_image] : []);

      return {
        id: v.id,
        roomNumber: roomNum,
        name: v.name,
        shortName: v.short_name || v.name,
        type: v.type,
        subtitle: v.subtitle || '',
        shortDescription: v.short_description || '',
        description: v.description,
        pricePerNight: priceStr,
        priceUnit: v.price_unit || 'USD',
        promotionalPrice: promoStr,
        size: sizeStr,
        sizeSqm: v.size_sqm,
        capacity: v.max_guests || 2,
        maxGuests: v.max_guests || 2,
        bedrooms: v.bedrooms || 1,
        bathrooms: v.bathrooms || 1,
        beds: v.beds_count || 1,
        bed: v.bed_type || 'King Bed',
        bathroom: v.bathroom_type || 'En-suite',
        view: v.view_type || 'Ocean View',
        architecturalFeature: v.architectural_feature || '',
        heroImage: v.hero_image,
        coverImage: v.cover_image || v.hero_image,
        images: imagesList,
        gallery: imagesList,
        status: v.status || 'published',
        availability: v.status === 'published',
        featured: Boolean(v.featured),
        order: v.sort_order || 0,
        amenities: amenitiesMap.get(v.id) || [],
      };
    });
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

  async deleteFacility(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [res]: any = await pool.query('DELETE FROM facilities WHERE id = ?', [id]);
    if (res.affectedRows > 0) {
      await this.addAuditLog({ action: 'FACILITY_DELETED', userEmail, details: `Removed facility ${id}` });
      return true;
    }
    return false;
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
            (r as any).title,
            (r as any).description || '',
            (r as any).canonical || '',
            (r as any).ogTitle || (r as any).title || '',
            (r as any).ogDescription || (r as any).description || '',
            (r as any).ogImage || '',
            (r as any).robots || 'index, follow',
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
      url: m.url || m.public_url,
      mimeType: m.mime_type,
      sizeBytes: Number(m.size_bytes || m.size || 0),
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
        (id, filename, original_filename, url, public_url, mime_type, size, size_bytes, width, height, alt_text, title, caption, usage_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        filename = VALUES(filename), url = VALUES(url), public_url = VALUES(public_url), mime_type = VALUES(mime_type), 
        size = VALUES(size), size_bytes = VALUES(size_bytes), width = VALUES(width), height = VALUES(height), 
        alt_text = VALUES(alt_text), title = VALUES(title), caption = VALUES(caption), usage_count = VALUES(usage_count)`,
      [
        asset.id,
        asset.filename,
        asset.filename,
        asset.url,
        asset.url,
        asset.mimeType,
        asset.sizeBytes,
        asset.sizeBytes,
        asset.width || null,
        asset.height || null,
        asset.altText || '',
        asset.altText || asset.filename,
        asset.caption || '',
        (asset as any).usageCount || asset.referenceCount || 0,
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
      currency: r.currency || 'USD',
      defaultLanguage: r.default_language || 'en',
      phone: r.phone || r.concierge_phone || '+255 777 890 123',
      conciergePhone: r.concierge_phone || '+255 777 890 123',
      whatsapp: r.whatsapp || '+255 777 890 123',
      email: r.email || 'info@zanzirangihouse.com',
      reservationNotificationEmail: r.reservation_notification_email || 'reservations@zanzirangihouse.com',
      reservationEmail: r.reservation_email || r.reservation_notification_email || 'reservations@zanzirangihouse.com',
      address: r.address || 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
      instagram: r.instagram || 'https://instagram.com/zanzirangi.house',
      facebook: r.facebook || 'https://facebook.com/zanzirangihouse',
      youtube: r.youtube || 'https://youtube.com/@zanzirangihouse',
      bookingUrl: r.booking_url || 'https://zanzirangihouse.com/#stay',
      logo: r.logo || '/zanzirangi-logo-circle.png',
      favicon: r.favicon || '/favicon.svg',
      adminLogo: r.admin_logo || r.logo || '/zanzirangi-logo-circle.png',
      maintenanceMode: Boolean(r.maintenance_mode),
      supportAvatar: r.support_avatar || '/elena-concierge.jpeg',
      supportName: r.support_name || 'Elena',
      supportTitle: r.support_title || 'Customer Support',
      supportStatus: r.support_status || 'Active 24/7',
    };
  }

  async updateSettings(data: Partial<SettingsModel>, userEmail: string): Promise<SettingsModel> {
    const pool = this.getPool();
    const current = await this.getSettings();
    const merged = { ...current, ...data };

    await pool.query(
      `INSERT INTO site_settings 
        (id, site_name, tagline, phone, concierge_phone, whatsapp, email, reservation_notification_email, 
         reservation_email, address, instagram, facebook, youtube, booking_url, currency, default_currency, 
         default_language, logo, favicon, admin_logo, maintenance_mode, support_avatar, support_name, support_title, support_status) 
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        site_name = VALUES(site_name), tagline = VALUES(tagline), phone = VALUES(phone), 
        concierge_phone = VALUES(concierge_phone), whatsapp = VALUES(whatsapp), email = VALUES(email), 
        reservation_notification_email = VALUES(reservation_notification_email), 
        reservation_email = VALUES(reservation_email), address = VALUES(address), 
        instagram = VALUES(instagram), facebook = VALUES(facebook), youtube = VALUES(youtube), 
        booking_url = VALUES(booking_url), currency = VALUES(currency), default_currency = VALUES(default_currency), 
        default_language = VALUES(default_language), logo = VALUES(logo), favicon = VALUES(favicon), 
        admin_logo = VALUES(admin_logo), maintenance_mode = VALUES(maintenance_mode), support_avatar = VALUES(support_avatar),
        support_name = VALUES(support_name), support_title = VALUES(support_title),
        support_status = VALUES(support_status)`,
      [
        merged.siteName || 'Zanzirangi House',
        merged.tagline || '',
        merged.phone || merged.conciergePhone || '+255 777 890 123',
        merged.conciergePhone || '+255 777 890 123',
        merged.whatsapp || '+255 777 890 123',
        merged.email || 'info@zanzirangihouse.com',
        merged.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
        merged.reservationEmail || merged.reservationNotificationEmail || 'reservations@zanzirangihouse.com',
        merged.address || 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
        merged.instagram || 'https://instagram.com/zanzirangi.house',
        merged.facebook || 'https://facebook.com/zanzirangihouse',
        merged.youtube || 'https://youtube.com/@zanzirangihouse',
        merged.bookingUrl || 'https://zanzirangihouse.com/#stay',
        merged.currency || 'USD',
        merged.defaultCurrency || 'USD ($)',
        merged.defaultLanguage || 'en',
        merged.logo || '/zanzirangi-logo-circle.png',
        merged.favicon || '/favicon.svg',
        merged.adminLogo || merged.logo || '/zanzirangi-logo-circle.png',
        merged.maintenanceMode ? 1 : 0,
        merged.supportAvatar || '/elena-concierge.jpeg',
        merged.supportName || 'Elena',
        merged.supportTitle || 'Customer Support',
        merged.supportStatus || 'Active 24/7',
      ]
    );

    await this.addAuditLog({
      action: 'SETTINGS_UPDATED',
      userEmail,
      details: 'Updated sanctuary site settings',
    });

    return this.getSettings();
  }

  // --- Users & Admin Access Management ---
  async findUserByEmail(email: string): Promise<UserRecord | null> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [
      email.trim().toLowerCase(),
    ]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    let perms: string[] = [];
    if (u.permissions) {
      try {
        perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
      } catch {
        perms = [];
      }
    }
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status || 'active',
      permissions: perms,
      tokenVersion: u.token_version ?? 1,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : undefined,
    };
  }

  async findUserById(id: string): Promise<UserRecord | null> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return null;
    const u = rows[0];
    let perms: string[] = [];
    if (u.permissions) {
      try {
        perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
      } catch {
        perms = [];
      }
    }
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status || 'active',
      permissions: perms,
      tokenVersion: u.token_version ?? 1,
      passwordHash: u.password_hash,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
      lastLogin: u.last_login ? new Date(u.last_login).toISOString() : undefined,
    };
  }

  async saveUser(user: UserRecord): Promise<void> {
    const pool = this.getPool();
    const permsJson = JSON.stringify(user.permissions || []);
    await pool.query(
      `INSERT INTO users (id, email, name, role, status, permissions, token_version, password_hash, created_at, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), role = VALUES(role), status = VALUES(status), 
        permissions = VALUES(permissions), token_version = VALUES(token_version),
        password_hash = VALUES(password_hash), last_login = VALUES(last_login)`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        user.name,
        user.role,
        user.status || 'active',
        permsJson,
        user.tokenVersion ?? 1,
        user.passwordHash,
        user.createdAt || new Date(),
        user.lastLogin || null,
      ]
    );
  }

  async listUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT id, email, name, role, status, permissions, token_version, created_at, last_login FROM users ORDER BY created_at ASC');
    return rows.map((u: any) => {
      let perms: string[] = [];
      if (u.permissions) {
        try {
          perms = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
        } catch {
          perms = [];
        }
      }
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status || 'active',
        permissions: perms,
        tokenVersion: u.token_version ?? 1,
        createdAt: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
        lastLogin: u.last_login ? new Date(u.last_login).toISOString() : undefined,
      };
    });
  }

  async createUser(user: UserRecord): Promise<UserRecord> {
    const pool = this.getPool();
    const permsJson = JSON.stringify(user.permissions || []);
    await pool.query(
      `INSERT INTO users (id, email, name, role, status, permissions, token_version, password_hash, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email.toLowerCase().trim(),
        user.name,
        user.role,
        user.status || 'active',
        permsJson,
        user.tokenVersion ?? 1,
        user.passwordHash,
        user.createdAt || new Date(),
        user.lastLogin || null,
      ]
    );
    return user;
  }

  async updateUser(id: string, data: Partial<UserRecord>): Promise<UserRecord> {
    const pool = this.getPool();
    const existing = await this.findUserById(id);
    if (!existing) throw new Error(`User with ID ${id} not found.`);

    const merged: UserRecord = {
      ...existing,
      name: data.name !== undefined ? data.name : existing.name,
      role: data.role !== undefined ? data.role : existing.role,
      status: data.status !== undefined ? data.status : existing.status,
      permissions: data.permissions !== undefined ? data.permissions : existing.permissions,
    };
    // Only access-relevant changes invalidate existing sessions (a name edit should not log the user out).
    const accessChanged =
      merged.role !== existing.role ||
      merged.status !== existing.status ||
      JSON.stringify(merged.permissions || []) !== JSON.stringify(existing.permissions || []);
    merged.tokenVersion = (existing.tokenVersion ?? 1) + (accessChanged ? 1 : 0);

    await pool.query(
      `UPDATE users 
       SET name = ?, role = ?, status = ?, permissions = ?, token_version = ?
       WHERE id = ?`,
      [
        merged.name,
        merged.role,
        merged.status || 'active',
        JSON.stringify(merged.permissions || []),
        merged.tokenVersion,
        id,
      ]
    );
    return merged;
  }

  async disableUser(id: string): Promise<void> {
    const pool = this.getPool();
    await pool.query('UPDATE users SET status = "disabled", token_version = token_version + 1 WHERE id = ?', [id]);
  }

  async enableUser(id: string): Promise<void> {
    const pool = this.getPool();
    await pool.query('UPDATE users SET status = "active", token_version = token_version + 1 WHERE id = ?', [id]);
  }

  async resetPassword(id: string, newPasswordHash: string): Promise<void> {
    const pool = this.getPool();
    await pool.query('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?', [
      newPasswordHash,
      id,
    ]);
  }

  async getActiveUserCount(): Promise<number> {
    const pool = this.getPool();
    // Anything that is not explicitly disabled can log in, so it counts toward the active limit.
    const [rows]: any = await pool.query("SELECT COUNT(*) as activeCount FROM users WHERE COALESCE(status, 'active') <> 'disabled'");
    return Number(rows[0]?.activeCount || 0);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.getPool().query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  async revokeUserSessions(id: string): Promise<void> {
    await this.getPool().query('UPDATE users SET token_version = token_version + 1 WHERE id = ?', [id]);
  }

  // --- Extended CMS Coverage: Pages ---
  async getPageContent(id: string): Promise<PageContentRecord | null> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM page_contents WHERE id = ? OR slug = ? LIMIT 1', [id, id]);
    if (!rows || rows.length === 0) return null;
    const r = rows[0];
    let sectionsConfig: PageSectionConfig[] = [];
    let contentJson: any = null;
    if (r.sections_config) {
      try {
        sectionsConfig = typeof r.sections_config === 'string' ? JSON.parse(r.sections_config) : r.sections_config;
      } catch {}
    }
    if (r.content_json) {
      try {
        contentJson = typeof r.content_json === 'string' ? JSON.parse(r.content_json) : r.content_json;
      } catch {}
    }
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      eyebrow: r.eyebrow,
      heading: r.heading,
      subheading: r.subheading,
      description: r.description,
      heroImage: r.hero_image,
      sectionsConfig,
      contentJson,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by,
    };
  }

  async getAllPages(): Promise<PageContentRecord[]> {
    const pool = this.getPool();
    const [rows]: any = await pool.query('SELECT * FROM page_contents ORDER BY id ASC');
    return rows.map((r: any) => {
      let sectionsConfig: PageSectionConfig[] = [];
      let contentJson: any = null;
      if (r.sections_config) {
        try {
          sectionsConfig = typeof r.sections_config === 'string' ? JSON.parse(r.sections_config) : r.sections_config;
        } catch {}
      }
      if (r.content_json) {
        try {
          contentJson = typeof r.content_json === 'string' ? JSON.parse(r.content_json) : r.content_json;
        } catch {}
      }
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        eyebrow: r.eyebrow,
        heading: r.heading,
        subheading: r.subheading,
        description: r.description,
        heroImage: r.hero_image,
        sectionsConfig,
        contentJson,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
        updatedBy: r.updated_by,
      };
    });
  }

  async updatePageContent(id: string, data: Partial<PageContentRecord>, userEmail: string): Promise<PageContentRecord> {
    const pool = this.getPool();
    const existing = await this.getPageContent(id);
    if (!existing) throw new Error(`Page '${id}' not found.`);

    const merged: PageContentRecord = {
      ...existing,
      ...data,
      id: existing.id,
      slug: data.slug || existing.slug,
      updatedBy: userEmail,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `UPDATE page_contents 
       SET title = ?, eyebrow = ?, heading = ?, subheading = ?, description = ?, hero_image = ?, sections_config = ?, content_json = ?, updated_by = ?
       WHERE id = ?`,
      [
        merged.title,
        merged.eyebrow || null,
        merged.heading || null,
        merged.subheading || null,
        merged.description || null,
        merged.heroImage || null,
        JSON.stringify(merged.sectionsConfig || []),
        merged.contentJson ? JSON.stringify(merged.contentJson) : null,
        userEmail,
        // `id` may be a slug (e.g. 'home' for row 'page_home'); always target the resolved row id.
        existing.id,
      ]
    );

    await this.addAuditLog({
      action: 'PAGE_UPDATED',
      userEmail,
      details: `Updated page content for ${id} (${merged.title})`,
    });

    return merged;
  }

  // --- Extended CMS Coverage: Chauffeur & Transfers ---
  async getChauffeurConfig(): Promise<ChauffeurConfigRecord> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('chauffeur_config');
    const [rows]: any = await pool.query('SELECT * FROM chauffeur_config WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    let specItems: TransferSpecItem[] = [];
    if (r.spec_items_json) {
      try {
        specItems = typeof r.spec_items_json === 'string' ? JSON.parse(r.spec_items_json) : r.spec_items_json;
      } catch {}
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || 'VIP CHAUFFEUR & TRANSFERS',
      heading: r.heading || "ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST.",
      subhead: r.subhead || 'From the moment your flight touches down in Zanzibar, our private chauffeur service ensures your transition to Zanzirangi House is completely effortless, serene, and secure.',
      routeLabel: r.route_label || "ABEID AMANI KARUME INT'L (ZNZ) → ZANZIRANGI HOUSE",
      routeTitle: r.route_title || 'Private Coastal Chauffeur Service',
      vehicleImage: r.vehicle_image || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85',
      specsEyebrow: r.specs_eyebrow || 'TRANSFER SPECIFICATIONS',
      cardTitle: r.card_title || 'Private Sanctuary Chauffeur',
      airportTitle: r.airport_title || 'AIRPORT TRANSFER',
      airportDesc: r.airport_desc || 'Direct tarmac welcome and luggage assistance upon arrival.',
      shuttleTitle: r.shuttle_title || 'PRIVATE SHUTTLE',
      shuttleDesc: r.shuttle_desc || 'Exclusive vehicles reserved solely for your traveling party.',
      vehicleTypeTitle: r.vehicle_type_title || 'VEHICLE TYPE',
      vehicleTypeDesc: r.vehicle_type_desc || 'Executive SUV / Luxury Van (Details available on request)',
      passengerLuggageTitle: r.passenger_luggage_title || 'PASSENGER & LUGGAGE',
      passengerLuggageDesc: r.passenger_luggage_desc || 'Tailored to group size (Details available on request)',
      amenitiesNote: r.amenities_note || 'Complimentary chilled mineral water, cool hand towels, and high-speed in-car Wi-Fi provided for every transfer.',
      ctaRequestLabel: r.cta_request_label || 'REQUEST AIRPORT TRANSFER',
      ctaAddBookingLabel: r.cta_add_booking_label || 'ADD TO BOOKING',
      specItems,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by,
    };
  }

  async updateChauffeurConfig(data: Partial<ChauffeurConfigRecord>, userEmail: string): Promise<ChauffeurConfigRecord> {
    const pool = this.getPool();
    const current = await this.getChauffeurConfig();
    const merged: ChauffeurConfigRecord = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `UPDATE chauffeur_config 
       SET eyebrow = ?, heading = ?, subhead = ?, route_label = ?, route_title = ?, vehicle_image = ?,
           specs_eyebrow = ?, card_title = ?, airport_title = ?, airport_desc = ?, shuttle_title = ?, shuttle_desc = ?,
           vehicle_type_title = ?, vehicle_type_desc = ?, passenger_luggage_title = ?, passenger_luggage_desc = ?,
           amenities_note = ?, cta_request_label = ?, cta_add_booking_label = ?, spec_items_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        merged.routeLabel,
        merged.routeTitle,
        merged.vehicleImage,
        merged.specsEyebrow,
        merged.cardTitle,
        merged.airportTitle,
        merged.airportDesc,
        merged.shuttleTitle,
        merged.shuttleDesc,
        merged.vehicleTypeTitle,
        merged.vehicleTypeDesc,
        merged.passengerLuggageTitle,
        merged.passengerLuggageDesc,
        merged.amenitiesNote,
        merged.ctaRequestLabel,
        merged.ctaAddBookingLabel,
        JSON.stringify(merged.specItems || []),
        this.collectExtras(merged, CHAUFFEUR_COLUMN_FIELDS),
        userEmail,
      ]
    );

    await this.addAuditLog({
      action: 'TRANSFERS_UPDATED',
      userEmail,
      details: 'Updated VIP Chauffeur & Transfers configuration',
    });

    return merged;
  }

  // --- Extended CMS Coverage: Why Stay / Pillars ---
  async getWhyStayConfig(): Promise<WhyStayConfigRecord> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('why_stay_config');
    const [rows]: any = await pool.query('SELECT * FROM why_stay_config WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    let pillars: WhyStayPillar[] = [];
    if (r.pillars_json) {
      try {
        pillars = typeof r.pillars_json === 'string' ? JSON.parse(r.pillars_json) : r.pillars_json;
      } catch {}
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || 'THE SANCTUARY DIFFERENCE',
      heading: r.heading || 'WHY ZANZIRANGI HOUSE',
      subhead: r.subhead || 'Four guiding values define every moment at our retreat, creating a rare atmosphere of calm, exclusivity, and profound connection to Tanzania.',
      pillars,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by,
    };
  }

  async updateWhyStayConfig(data: Partial<WhyStayConfigRecord>, userEmail: string): Promise<WhyStayConfigRecord> {
    const pool = this.getPool();
    const current = await this.getWhyStayConfig();
    const merged: WhyStayConfigRecord = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `UPDATE why_stay_config 
       SET eyebrow = ?, heading = ?, subhead = ?, pillars_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        JSON.stringify(merged.pillars || []),
        this.collectExtras(merged, WHY_STAY_COLUMN_FIELDS),
        userEmail,
      ]
    );

    await this.addAuditLog({
      action: 'WHY_STAY_UPDATED',
      userEmail,
      details: 'Updated Why Stay / Sanctuary Difference configuration',
    });

    return merged;
  }

  // --- Extended CMS Coverage: Dining ---
  async getDiningConfig(): Promise<DiningConfigRecord> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('dining_config');
    const [rows]: any = await pool.query('SELECT * FROM dining_config WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    let moments: DiningMoment[] = [];
    if (r.moments_json) {
      try {
        moments = typeof r.moments_json === 'string' ? JSON.parse(r.moments_json) : r.moments_json;
      } catch {}
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      eyebrow: r.eyebrow || 'Gastronomic Soul',
      heading: r.heading || 'TASTE ZANZIBAR',
      subhead: r.subhead || '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
      intro: r.intro || 'Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables.',
      gardenEyebrow: r.garden_eyebrow || 'Culinary Storytelling',
      gardenBadge: r.garden_badge || 'Estate Garden',
      gardenTitle: r.garden_title || 'FROM OUR GARDEN TO YOUR TABLE',
      gardenDesc: r.garden_desc || 'Tucked within the grounds of Zanzirangi House is our private botanical garden...',
      tagZeroMiles: r.tag_zero_miles || '🌱 Zero Food Miles',
      tagSpices: r.tag_spices || '🌶 Hand-Picked Daily Spices',
      tagSeafood: r.tag_seafood || '🐟 Sustainable Coastal Seafood',
      moments,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by,
    };
  }

  async updateDiningConfig(data: Partial<DiningConfigRecord>, userEmail: string): Promise<DiningConfigRecord> {
    const pool = this.getPool();
    const current = await this.getDiningConfig();
    const merged: DiningConfigRecord = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `UPDATE dining_config 
       SET eyebrow = ?, heading = ?, subhead = ?, intro = ?, garden_eyebrow = ?, garden_badge = ?, 
           garden_title = ?, garden_desc = ?, tag_zero_miles = ?, tag_spices = ?, tag_seafood = ?, moments_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.eyebrow,
        merged.heading,
        merged.subhead,
        merged.intro,
        merged.gardenEyebrow,
        merged.gardenBadge,
        merged.gardenTitle,
        merged.gardenDesc,
        merged.tagZeroMiles,
        merged.tagSpices,
        merged.tagSeafood,
        JSON.stringify(merged.moments || []),
        this.collectExtras(merged, DINING_CONFIG_COLUMN_FIELDS),
        userEmail,
      ]
    );

    await this.addAuditLog({
      action: 'DINING_CONFIG_UPDATED',
      userEmail,
      details: 'Updated Dining page narrative and garden story',
    });

    return merged;
  }

  async getDiningCategories(): Promise<DiningCategoryRecord[]> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('dining_categories');
    const [rows]: any = await pool.query('SELECT * FROM dining_categories ORDER BY sort_order ASC');
    return rows.map((r: any) => {
      let signatureDishes: SignatureDishItem[] = [];
      if (r.dishes_json) {
        try {
          signatureDishes = typeof r.dishes_json === 'string' ? JSON.parse(r.dishes_json) : r.dishes_json;
        } catch {}
      }
      return {
        ...this.parseExtras(r.extras_json),
        id: r.id,
        name: r.name,
        tabLabel: r.tab_label,
        subtitle: r.subtitle,
        description: r.description,
        imageUrl: r.image_url,
        signatureDishes,
        order: Number(r.sort_order || 0),
        visible: Boolean(r.visible !== 0 && r.visible !== false),
      };
    });
  }

  async saveDiningCategory(input: DiningCategoryRecord, userEmail: string): Promise<DiningCategoryRecord> {
    const pool = this.getPool();
    const existing = (await this.getDiningCategories()).find((c) => c.id === input.id);
    const category: DiningCategoryRecord = {
      name: '',
      tabLabel: '',
      description: '',
      imageUrl: '',
      signatureDishes: [],
      order: 0,
      visible: true,
      ...(existing || {}),
      ...this.definedOnly(input),
    } as DiningCategoryRecord;
    if (!category.tabLabel) category.tabLabel = category.name;
    await pool.query(
      `INSERT INTO dining_categories (id, name, tab_label, subtitle, description, image_url, dishes_json, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), tab_label = VALUES(tab_label), subtitle = VALUES(subtitle),
        description = VALUES(description), image_url = VALUES(image_url), dishes_json = VALUES(dishes_json),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        category.id,
        category.name,
        category.tabLabel,
        category.subtitle || null,
        category.description || '',
        category.imageUrl || '',
        JSON.stringify(category.signatureDishes || []),
        Number(category.order) || 0,
        category.visible === false ? 0 : 1,
        this.collectExtras(category, DINING_CATEGORY_COLUMN_FIELDS),
      ]
    );

    await this.addAuditLog({
      action: 'DINING_CATEGORY_SAVED',
      userEmail,
      details: `Saved dining category: ${category.name} (${category.id})`,
    });

    return category;
  }

  async deleteDiningCategory(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [result]: any = await pool.query('DELETE FROM dining_categories WHERE id = ?', [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: 'DINING_CATEGORY_DELETED',
        userEmail,
        details: `Deleted dining category: ${id}`,
      });
    }
    return deleted;
  }

  // --- Extended CMS Coverage: Experiences ---
  async getExperiences(): Promise<ExperienceRecord[]> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('experiences');
    const [rows]: any = await pool.query('SELECT * FROM experiences ORDER BY sort_order ASC');
    return rows.map((r: any) => ({
      ...this.parseExtras(r.extras_json),
      id: r.id,
      title: r.title,
      category: r.category,
      duration: r.duration,
      tag: r.tag,
      priceNote: r.price_note,
      shortDescription: r.short_description,
      description: r.description,
      imageUrl: r.image_url,
      whatsappMessage: r.whatsapp_message,
      order: Number(r.sort_order || 0),
      visible: Boolean(r.visible !== 0 && r.visible !== false),
    }));
  }

  async saveExperience(input: ExperienceRecord, userEmail: string): Promise<ExperienceRecord> {
    const pool = this.getPool();
    const existing = (await this.getExperiences()).find((e) => e.id === input.id);
    const item: ExperienceRecord = {
      title: '',
      category: 'cultural',
      duration: '',
      tag: '',
      priceNote: '',
      shortDescription: '',
      description: '',
      imageUrl: '',
      order: 0,
      visible: true,
      ...(existing || {}),
      ...this.definedOnly(input),
    } as ExperienceRecord;
    await pool.query(
      `INSERT INTO experiences (id, title, category, duration, tag, price_note, short_description, description, image_url, whatsapp_message, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        title = VALUES(title), category = VALUES(category), duration = VALUES(duration),
        tag = VALUES(tag), price_note = VALUES(price_note), short_description = VALUES(short_description),
        description = VALUES(description), image_url = VALUES(image_url), whatsapp_message = VALUES(whatsapp_message),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        item.id,
        item.title,
        item.category,
        item.duration,
        item.tag,
        item.priceNote,
        item.shortDescription,
        item.description,
        item.imageUrl,
        item.whatsappMessage || null,
        Number(item.order) || 0,
        item.visible === false ? 0 : 1,
        this.collectExtras(item, EXPERIENCE_COLUMN_FIELDS),
      ]
    );

    await this.addAuditLog({
      action: 'EXPERIENCE_SAVED',
      userEmail,
      details: `Saved experience: ${item.title} (${item.id})`,
    });

    return item;
  }

  async deleteExperience(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [result]: any = await pool.query('DELETE FROM experiences WHERE id = ?', [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: 'EXPERIENCE_DELETED',
        userEmail,
        details: `Deleted experience: ${id}`,
      });
    }
    return deleted;
  }

  // --- Extended CMS Coverage: Safari Destinations ---
  async getSafariDestinations(): Promise<SafariDestinationRecord[]> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('safari_destinations');
    const [rows]: any = await pool.query('SELECT * FROM safari_destinations ORDER BY sort_order ASC');
    return rows.map((r: any) => {
      let highlights: string[] = [];
      if (r.highlights_json) {
        try {
          highlights = typeof r.highlights_json === 'string' ? JSON.parse(r.highlights_json) : r.highlights_json;
        } catch {}
      }
      return {
        ...this.parseExtras(r.extras_json),
        id: r.id,
        name: r.name,
        tagline: r.tagline,
        region: r.region,
        flightTimeFromZanzibar: r.flight_time,
        heroImage: r.hero_image,
        description: r.description,
        highlights,
        bestFor: r.best_for,
        safariType: r.safari_type,
        order: Number(r.sort_order || 0),
        visible: Boolean(r.visible !== 0 && r.visible !== false),
      };
    });
  }

  async saveSafariDestination(input: SafariDestinationRecord, userEmail: string): Promise<SafariDestinationRecord> {
    const pool = this.getPool();
    const existing = (await this.getSafariDestinations()).find((d) => d.id === input.id);
    const item: SafariDestinationRecord = {
      name: '',
      tagline: '',
      region: '',
      flightTimeFromZanzibar: '',
      heroImage: '',
      description: '',
      highlights: [],
      bestFor: '',
      safariType: '',
      order: 0,
      visible: true,
      ...(existing || {}),
      ...this.definedOnly(input),
    } as SafariDestinationRecord;
    await pool.query(
      `INSERT INTO safari_destinations (id, name, tagline, region, flight_time, hero_image, description, highlights_json, best_for, safari_type, sort_order, visible, extras_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
        name = VALUES(name), tagline = VALUES(tagline), region = VALUES(region),
        flight_time = VALUES(flight_time), hero_image = VALUES(hero_image), description = VALUES(description),
        highlights_json = VALUES(highlights_json), best_for = VALUES(best_for), safari_type = VALUES(safari_type),
        sort_order = VALUES(sort_order), visible = VALUES(visible), extras_json = VALUES(extras_json)`,
      [
        item.id,
        item.name,
        item.tagline,
        item.region,
        item.flightTimeFromZanzibar,
        item.heroImage,
        item.description,
        JSON.stringify(Array.isArray(item.highlights) ? item.highlights : []),
        item.bestFor,
        item.safariType,
        Number(item.order) || 0,
        item.visible === false ? 0 : 1,
        this.collectExtras(item, SAFARI_COLUMN_FIELDS),
      ]
    );

    await this.addAuditLog({
      action: 'SAFARI_DESTINATION_SAVED',
      userEmail,
      details: `Saved safari destination: ${item.name} (${item.id})`,
    });

    return item;
  }

  async deleteSafariDestination(id: string, userEmail: string): Promise<boolean> {
    const pool = this.getPool();
    const [result]: any = await pool.query('DELETE FROM safari_destinations WHERE id = ?', [id]);
    const deleted = result && result.affectedRows > 0;
    if (deleted) {
      await this.addAuditLog({
        action: 'SAFARI_DESTINATION_DELETED',
        userEmail,
        details: `Deleted safari destination: ${id}`,
      });
    }
    return deleted;
  }

  // --- Extended CMS Coverage: Global Content ---
  async getGlobalContent(): Promise<GlobalContentRecord> {
    const pool = this.getPool();
    await this.ensureExtrasColumn('global_content');
    const [rows]: any = await pool.query('SELECT * FROM global_content WHERE id = 1 LIMIT 1');
    const r = rows[0] || {};
    let navLinks: NavLinkItem[] = [];
    let socials: any = undefined;
    if (r.nav_links_json) {
      try {
        navLinks = typeof r.nav_links_json === 'string' ? JSON.parse(r.nav_links_json) : r.nav_links_json;
      } catch {}
    }
    if (r.socials_json) {
      try {
        socials = typeof r.socials_json === 'string' ? JSON.parse(r.socials_json) : r.socials_json;
      } catch {}
    }
    return {
      ...this.parseExtras(r.extras_json),
      id: 1,
      brandName: r.brand_name || 'Zanzirangi House',
      navLinks,
      ctaPlanStayLabel: r.cta_plan_stay_label || 'PLAN YOUR STAY',
      ctaPlanStayLink: r.cta_plan_stay_link || '#stay',
      footerTagline: r.footer_tagline,
      footerCopyright: r.footer_copyright,
      contactPhone: r.contact_phone,
      contactEmail: r.contact_email,
      contactWhatsapp: r.contact_whatsapp,
      contactAddress: r.contact_address,
      socials,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by,
    };
  }

  async updateGlobalContent(data: Partial<GlobalContentRecord>, userEmail: string): Promise<GlobalContentRecord> {
    const pool = this.getPool();
    const current = await this.getGlobalContent();
    const merged: GlobalContentRecord = {
      ...current,
      ...this.definedOnly(data),
      updatedBy: userEmail,
      updatedAt: new Date().toISOString(),
    };

    await pool.query(
      `UPDATE global_content 
       SET brand_name = ?, nav_links_json = ?, cta_plan_stay_label = ?, cta_plan_stay_link = ?,
           footer_tagline = ?, footer_copyright = ?, contact_phone = ?, contact_email = ?,
           contact_whatsapp = ?, contact_address = ?, socials_json = ?, extras_json = ?, updated_by = ?
       WHERE id = 1`,
      [
        merged.brandName,
        JSON.stringify(merged.navLinks || []),
        merged.ctaPlanStayLabel,
        merged.ctaPlanStayLink,
        merged.footerTagline || null,
        merged.footerCopyright || null,
        merged.contactPhone || null,
        merged.contactEmail || null,
        merged.contactWhatsapp || null,
        merged.contactAddress || null,
        merged.socials ? JSON.stringify(merged.socials) : null,
        this.collectExtras(merged, GLOBAL_COLUMN_FIELDS),
        userEmail,
      ]
    );

    await this.addAuditLog({
      action: 'GLOBAL_CONTENT_UPDATED',
      userEmail,
      details: 'Updated global navigation, header CTA, and footer configuration',
    });

    return merged;
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
    const [pagesCount]: any = await pool.query('SELECT COUNT(*) as total FROM page_contents');
    const [expCount]: any = await pool.query('SELECT COUNT(*) as total FROM experiences');
    const [diningCount]: any = await pool.query('SELECT COUNT(*) as total FROM dining_categories');
    const [usersCount]: any = await pool.query('SELECT COUNT(*) as total FROM users WHERE status = "active"');
    const [hpMeta]: any = await pool.query('SELECT meta_last_updated, meta_updated_by FROM homepage_config WHERE id = 1');

    const recentLogs = await this.getAuditLogs(10);
    const meta = hpMeta[0] || {};
    const host = env.MYSQL_HOST || 'unknown';

    return {
      status: 'Connected Live',
      databaseProvider: 'mysql',
      databaseEngine: 'Cloud • MariaDB/MySQL',
      databaseHost: host,
      lastPublished: meta.meta_last_updated ? new Date(meta.meta_last_updated).toISOString() : null,
      publishedBy: meta.meta_updated_by || null,
      counts: {
        villasPublished: Number(villasCount[0]?.pub || 0),
        villasTotal: Number(villasCount[0]?.total || 0),
        galleryItems: Number(galleryCount[0]?.total || 0),
        facilities: Number(facilitiesCount[0]?.total || 0),
        testimonials: Number(testimonialsCount[0]?.total || 0),
        mediaAssets: Number(mediaCount[0]?.total || 0),
        pagesTotal: Number(pagesCount[0]?.total || 0),
        experiencesTotal: Number(expCount[0]?.total || 0),
        diningCategories: Number(diningCount[0]?.total || 0),
        activeAdmins: Number(usersCount[0]?.total || 0),
      },
      recentUpdates: recentLogs.map((l) => ({
        action: l.action,
        userEmail: l.userEmail,
        timestamp: l.timestamp,
        details: l.details,
      })),
    };
  }

  // --- Extra CMS fields ---
  // Content tables store their main fields in columns. Any additional editor field (visibility toggles,
  // extra labels, images…) is kept in an `extras_json` column so saves never silently drop data.
  private extrasColumnReady = new Set<string>();

  private async ensureExtrasColumn(table: string): Promise<void> {
    if (this.extrasColumnReady.has(table)) return;
    const pool = this.getPool();
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'extras_json'`,
      [table]
    );
    if (!Number(rows[0]?.n)) {
      // Additive, idempotent migration: existing rows and columns are untouched.
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN extras_json LONGTEXT NULL`);
      console.log(`[DATABASE] Added extras_json column to ${table}`);
    }
    this.extrasColumnReady.add(table);
  }

  private parseExtras(raw: any): Record<string, any> {
    if (!raw) return {};
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  /** Every field of `record` that has no dedicated column, serialized for extras_json. */
  private collectExtras(record: Record<string, any>, columnFields: string[]): string | null {
    const skip = new Set([...columnFields, 'id', 'updatedAt', 'updatedBy']);
    const extras: Record<string, any> = {};
    // `null` clears an extra field (lets editors remove a value instead of storing an empty one).
    Object.entries(record).forEach(([k, v]) => {
      if (!skip.has(k) && v !== undefined && v !== null) extras[k] = v;
    });
    return Object.keys(extras).length > 0 ? JSON.stringify(extras) : null;
  }

  /** Drops undefined values so partial updates (e.g. `{ visible }`) keep the existing fields. */
  private definedOnly<T extends Record<string, any>>(data: T): Partial<T> {
    return Object.fromEntries(Object.entries(data || {}).filter(([, v]) => v !== undefined)) as Partial<T>;
  }

  // --- Content Translations ---
  private translationsTableReady = false;

  private async ensureTranslationsTable(): Promise<void> {
    if (this.translationsTableReady) return;
    await this.getPool().query(`
      CREATE TABLE IF NOT EXISTS content_translations (
        lang VARCHAR(8) NOT NULL,
        entity VARCHAR(64) NOT NULL,
        path VARCHAR(255) NOT NULL,
        value MEDIUMTEXT NOT NULL,
        source MEDIUMTEXT NULL,
        updated_by VARCHAR(255) NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (lang, entity, path)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    this.translationsTableReady = true;
  }

  async getContentTranslations(lang: string): Promise<ContentTranslationRecord[]> {
    await this.ensureTranslationsTable();
    const [rows]: any = await this.getPool().query(
      'SELECT entity, path, value, source, updated_at, updated_by FROM content_translations WHERE lang = ?',
      [lang]
    );
    return rows.map((r: any) => ({
      entity: r.entity,
      path: r.path,
      value: r.value,
      source: r.source ?? undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      updatedBy: r.updated_by ?? undefined,
    }));
  }

  async saveContentTranslations(lang: string, entries: ContentTranslationRecord[], userEmail: string): Promise<number> {
    await this.ensureTranslationsTable();
    const conn = await this.getPool().getConnection();
    try {
      await conn.beginTransaction();
      const removals = entries.filter((e) => !e.value || !e.value.trim());
      const upserts = entries.filter((e) => e.value && e.value.trim());
      for (const e of removals) {
        await conn.query('DELETE FROM content_translations WHERE lang = ? AND entity = ? AND path = ?', [lang, e.entity, e.path]);
      }
      // Multi-row upserts keep bulk saves fast against a remote database.
      const CHUNK = 200;
      for (let i = 0; i < upserts.length; i += CHUNK) {
        const chunk = upserts.slice(i, i + CHUNK);
        await conn.query(
          `INSERT INTO content_translations (lang, entity, path, value, source, updated_by)
           VALUES ${chunk.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
           ON DUPLICATE KEY UPDATE value = VALUES(value), source = VALUES(source), updated_by = VALUES(updated_by)`,
          chunk.flatMap((e) => [lang, e.entity, e.path, e.value, e.source ?? null, userEmail])
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    await this.addAuditLog({
      action: 'TRANSLATIONS_UPDATED',
      userEmail,
      details: `Updated ${entries.length} ${lang.toUpperCase()} translation entries`,
    });
    return entries.length;
  }
}
