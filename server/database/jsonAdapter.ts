import { DatabaseAdapter, UserRecord, AuditLogRecord } from './adapter.ts';
import {
  getDatabase,
  saveDatabase,
  initDatabase,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_SETTINGS,
} from '../db.ts';
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

export class JsonDatabaseAdapter implements DatabaseAdapter {
  public provider: 'json' = 'json';

  async connect(): Promise<void> {
    initDatabase();
  }

  async disconnect(): Promise<void> {
    // No-op for JSON file store
  }

  async healthCheck(): Promise<{ connected: boolean; provider: string; error?: string }> {
    try {
      const db = getDatabase();
      return {
        connected: !!db && Array.isArray(db.users),
        provider: 'json',
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: 'json',
        error: err.message,
      };
    }
  }

  // --- Homepage ---
  async getHomepage(): Promise<HomepageContent> {
    const db = getDatabase();
    return db.homepage || DEFAULT_HOMEPAGE_CONTENT;
  }

  async updateHomepage(data: Partial<HomepageContent>, userEmail: string): Promise<HomepageContent> {
    const db = getDatabase();
    const current = db.homepage || DEFAULT_HOMEPAGE_CONTENT;

    db.homepage = {
      ...current,
      ...data,
      meta: {
        lastUpdated: new Date().toISOString(),
        updatedBy: userEmail,
      },
    };

    db.auditLog.push({
      action: 'HOMEPAGE_UPDATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: 'Updated sanctuary homepage content & layout',
    });

    saveDatabase(db);
    return db.homepage;
  }

  // --- Villas ---
  async getVillas(): Promise<Villa[]> {
    const db = getDatabase();
    return db.villas || [];
  }

  async getVillaById(id: string): Promise<Villa | null> {
    const db = getDatabase();
    return (db.villas || []).find((v) => v.id === id) || null;
  }

  async saveVilla(villa: Villa, userEmail: string): Promise<Villa> {
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
      action: idx >= 0 ? 'VILLA_UPDATED' : 'VILLA_CREATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Saved villa entity: ${villa.name} (${villa.id})`,
    });

    saveDatabase(db);
    return villa;
  }

  async deleteVilla(id: string, userEmail: string): Promise<boolean> {
    const db = getDatabase();
    const list = db.villas || [];
    const filtered = list.filter((v) => v.id !== id);

    if (filtered.length === list.length) return false;

    db.villas = filtered;
    db.auditLog.push({
      action: 'VILLA_DELETED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Removed villa ID: ${id}`,
    });

    saveDatabase(db);
    return true;
  }

  // --- Gallery ---
  async getGallery(): Promise<GalleryItem[]> {
    const db = getDatabase();
    return db.gallery || [];
  }

  async saveGalleryItem(item: GalleryItem, userEmail: string): Promise<GalleryItem> {
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
      action: idx >= 0 ? 'GALLERY_UPDATED' : 'GALLERY_CREATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Saved gallery photograph: ${item.title} (${item.id})`,
    });

    saveDatabase(db);
    return item;
  }

  async deleteGalleryItem(id: string, userEmail: string): Promise<boolean> {
    const db = getDatabase();
    const list = db.gallery || [];
    const filtered = list.filter((g) => g.id !== id);

    if (filtered.length === list.length) return false;

    db.gallery = filtered;
    db.auditLog.push({
      action: 'GALLERY_DELETED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Removed gallery item ID: ${id}`,
    });

    saveDatabase(db);
    return true;
  }

  // --- Facilities ---
  async getFacilities(): Promise<Facility[]> {
    const db = getDatabase();
    return db.facilities || [];
  }

  async saveFacility(facility: Facility, userEmail: string): Promise<Facility> {
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
      action: idx >= 0 ? 'FACILITY_UPDATED' : 'FACILITY_CREATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Saved facility: ${facility.title} (${facility.id})`,
    });

    saveDatabase(db);
    return facility;
  }

  // --- Testimonials ---
  async getTestimonials(): Promise<Review[]> {
    const db = getDatabase();
    return db.testimonials || [];
  }

  async saveTestimonial(testimonial: Review, userEmail: string): Promise<Review> {
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
      action: idx >= 0 ? 'TESTIMONIAL_UPDATED' : 'TESTIMONIAL_CREATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Saved guest impression: ${testimonial.guestName} (${testimonial.id})`,
    });

    saveDatabase(db);
    return testimonial;
  }

  async deleteTestimonial(id: string, userEmail: string): Promise<boolean> {
    const db = getDatabase();
    const list = db.testimonials || [];
    const filtered = list.filter((t) => t.id !== id);

    if (filtered.length === list.length) return false;

    db.testimonials = filtered;
    db.auditLog.push({
      action: 'TESTIMONIAL_DELETED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Removed testimonial ID: ${id}`,
    });

    saveDatabase(db);
    return true;
  }

  // --- Videos ---
  async getVideos(): Promise<VideoData> {
    const db = getDatabase();
    return (
      db.videos || {
        videoUrl: 'https://assets.zanzirangihouse.com/videos/brand-reel-4k.mp4',
        posterImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
        scenes: [],
      }
    );
  }

  async updateVideos(data: Partial<VideoData>, userEmail: string): Promise<VideoData> {
    const db = getDatabase();
    const current = await this.getVideos();
    db.videos = { ...current, ...data };

    db.auditLog.push({
      action: 'VIDEOS_UPDATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: 'Updated 4K cinematic film & storyboard scenes',
    });

    saveDatabase(db);
    return db.videos;
  }

  // --- SEO ---
  async getSeo(): Promise<SeoData> {
    const db = getDatabase();
    return (
      db.seo || {
        siteTitle: 'Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat',
        defaultOgImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
        routes: {},
      }
    );
  }

  async updateSeo(data: Partial<SeoData>, userEmail: string): Promise<SeoData> {
    const db = getDatabase();
    const current = await this.getSeo();
    db.seo = { ...current, ...data };

    db.auditLog.push({
      action: 'SEO_UPDATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: 'Updated SERP metadata and route SEO configurations',
    });

    saveDatabase(db);
    return db.seo;
  }

  // --- Media ---
  async getMedia(): Promise<MediaAsset[]> {
    const db = getDatabase();
    return db.media || [];
  }

  async saveMedia(asset: MediaAsset, userEmail: string): Promise<MediaAsset> {
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
      action: idx >= 0 ? 'MEDIA_UPDATED' : 'MEDIA_UPLOADED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Saved media asset: ${asset.filename}`,
    });

    saveDatabase(db);
    return asset;
  }

  async deleteMedia(id: string, userEmail: string): Promise<boolean> {
    const db = getDatabase();
    const list = db.media || [];
    const filtered = list.filter((m) => m.id !== id);

    if (filtered.length === list.length) return false;

    db.media = filtered;
    db.auditLog.push({
      action: 'MEDIA_DELETED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: `Removed media record ID: ${id}`,
    });

    saveDatabase(db);
    return true;
  }

  // --- Settings ---
  async getSettings(): Promise<SettingsModel> {
    const db = getDatabase();
    return db.settings || DEFAULT_SETTINGS;
  }

  async updateSettings(data: Partial<SettingsModel>, userEmail: string): Promise<SettingsModel> {
    const db = getDatabase();
    db.settings = { ...(db.settings || DEFAULT_SETTINGS), ...data };

    db.auditLog.push({
      action: 'SETTINGS_UPDATED',
      userEmail,
      timestamp: new Date().toISOString(),
      details: 'Updated sanctuary system settings',
    });

    saveDatabase(db);
    return db.settings;
  }

  // --- Users & Auth ---
  async findUserByEmail(email: string): Promise<UserRecord | null> {
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
      lastLogin: u.lastLogin,
    };
  }

  async saveUser(user: UserRecord): Promise<void> {
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user };
    } else {
      db.users.push(user);
    }
    saveDatabase(db);
  }

  async listUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]> {
    const db = getDatabase();
    return db.users.map(({ passwordHash, ...safe }) => safe);
  }

  // --- Audit Logs ---
  async getAuditLogs(limit: number = 20): Promise<AuditLogRecord[]> {
    const db = getDatabase();
    return [...(db.auditLog || [])].reverse().slice(0, limit);
  }

  async addAuditLog(entry: Omit<AuditLogRecord, 'timestamp'>): Promise<void> {
    const db = getDatabase();
    db.auditLog.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    saveDatabase(db);
  }

  // --- Dashboard Stats ---
  async getDashboardStats(): Promise<DashboardStats> {
    const db = getDatabase();
    const recentLogs = await this.getAuditLogs(10);

    return {
      status: 'Connected',
      lastPublished: db.homepage?.meta?.lastUpdated || null,
      publishedBy: db.homepage?.meta?.updatedBy || null,
      counts: {
        villasPublished: (db.villas || []).filter((v) => v.status === 'published').length,
        villasTotal: (db.villas || []).length,
        galleryItems: (db.gallery || []).length,
        facilities: (db.facilities || []).length,
        testimonials: (db.testimonials || []).length,
        mediaAssets: (db.media || []).length,
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
