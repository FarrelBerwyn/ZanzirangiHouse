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

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuditLogRecord {
  id?: string;
  action: string;
  userEmail: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface DatabaseAdapter {
  provider: 'json' | 'mysql';

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<{ connected: boolean; provider: string; error?: string }>;

  // Homepage
  getHomepage(): Promise<HomepageContent>;
  updateHomepage(data: Partial<HomepageContent>, userEmail: string): Promise<HomepageContent>;

  // Villas
  getVillas(): Promise<Villa[]>;
  getVillaById(id: string): Promise<Villa | null>;
  saveVilla(villa: Villa, userEmail: string): Promise<Villa>;
  deleteVilla(id: string, userEmail: string): Promise<boolean>;

  // Gallery
  getGallery(): Promise<GalleryItem[]>;
  saveGalleryItem(item: GalleryItem, userEmail: string): Promise<GalleryItem>;
  deleteGalleryItem(id: string, userEmail: string): Promise<boolean>;

  // Facilities
  getFacilities(): Promise<Facility[]>;
  saveFacility(facility: Facility, userEmail: string): Promise<Facility>;

  // Testimonials
  getTestimonials(): Promise<Review[]>;
  saveTestimonial(testimonial: Review, userEmail: string): Promise<Review>;
  deleteTestimonial(id: string, userEmail: string): Promise<boolean>;

  // Videos
  getVideos(): Promise<VideoData>;
  updateVideos(data: Partial<VideoData>, userEmail: string): Promise<VideoData>;

  // SEO
  getSeo(): Promise<SeoData>;
  updateSeo(data: Partial<SeoData>, userEmail: string): Promise<SeoData>;

  // Media
  getMedia(): Promise<MediaAsset[]>;
  saveMedia(asset: MediaAsset, userEmail: string): Promise<MediaAsset>;
  deleteMedia(id: string, userEmail: string): Promise<boolean>;

  // Settings
  getSettings(): Promise<SettingsModel>;
  updateSettings(data: Partial<SettingsModel>, userEmail: string): Promise<SettingsModel>;

  // Users & Auth
  findUserByEmail(email: string): Promise<UserRecord | null>;
  saveUser(user: UserRecord): Promise<void>;
  listUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]>;

  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLogRecord[]>;
  addAuditLog(entry: Omit<AuditLogRecord, 'timestamp'>): Promise<void>;

  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;
}
