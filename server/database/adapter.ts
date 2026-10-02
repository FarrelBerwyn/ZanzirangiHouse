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
  role: 'superadmin' | 'admin' | string;
  status?: 'active' | 'disabled';
  permissions?: string[];
  tokenVersion?: number;
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

export interface PageSectionConfig {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface PageContentRecord {
  id: string;
  slug: string;
  title: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  heroImage?: string;
  sectionsConfig?: PageSectionConfig[];
  contentJson?: any;
  updatedAt?: string;
  updatedBy?: string;
}

export interface TransferSpecItem {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  visible: boolean;
}

export interface ChauffeurConfigRecord {
  id?: number;
  eyebrow: string;
  heading: string;
  subhead: string;
  routeLabel: string;
  routeTitle: string;
  vehicleImage: string;
  specsEyebrow: string;
  cardTitle: string;
  airportTitle: string;
  airportDesc: string;
  shuttleTitle: string;
  shuttleDesc: string;
  vehicleTypeTitle: string;
  vehicleTypeDesc: string;
  passengerLuggageTitle: string;
  passengerLuggageDesc: string;
  amenitiesNote: string;
  ctaRequestLabel: string;
  ctaAddBookingLabel: string;
  specItems?: TransferSpecItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface WhyStayPillar {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  order: number;
  visible: boolean;
}

export interface WhyStayConfigRecord {
  id?: number;
  eyebrow: string;
  heading: string;
  subhead: string;
  pillars: WhyStayPillar[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface DiningMoment {
  title: string;
  time: string;
  desc: string;
}

export interface DiningConfigRecord {
  id?: number;
  eyebrow: string;
  heading: string;
  subhead: string;
  intro: string;
  gardenEyebrow: string;
  gardenBadge: string;
  gardenTitle: string;
  gardenDesc: string;
  tagZeroMiles: string;
  tagSpices: string;
  tagSeafood: string;
  moments: DiningMoment[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface SignatureDishItem {
  id?: string;
  name: string;
  description: string;
  price?: string;
  dietary?: string;
  order?: number;
  visible?: boolean;
}

export interface DiningCategoryRecord {
  id: string;
  name: string;
  tabLabel: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  signatureDishes: SignatureDishItem[];
  order: number;
  visible: boolean;
}

export interface ExperienceRecord {
  id: string;
  title: string;
  category: 'all' | 'cultural' | 'marine' | 'nature' | 'sailing' | 'adventure' | string;
  duration: string;
  tag: string;
  priceNote: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  whatsappMessage?: string;
  order: number;
  visible: boolean;
}

export interface SafariDestinationRecord {
  id: string;
  name: string;
  tagline: string;
  region: string;
  flightTimeFromZanzibar: string;
  heroImage: string;
  description: string;
  highlights: string[];
  bestFor: string;
  safariType: string;
  order: number;
  visible: boolean;
}

export interface NavLinkItem {
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

export interface GlobalContentRecord {
  id?: number;
  brandName: string;
  navLinks: NavLinkItem[];
  ctaPlanStayLabel: string;
  ctaPlanStayLink: string;
  footerTagline?: string;
  footerCopyright?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactAddress?: string;
  socials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  updatedAt?: string;
  updatedBy?: string;
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
  deleteFacility(id: string, userEmail: string): Promise<boolean>;

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

  // --- Extended CMS Coverage ---
  // Pages
  getPageContent(id: string): Promise<PageContentRecord | null>;
  getAllPages(): Promise<PageContentRecord[]>;
  updatePageContent(id: string, data: Partial<PageContentRecord>, userEmail: string): Promise<PageContentRecord>;

  // Chauffeur & Transfers
  getChauffeurConfig(): Promise<ChauffeurConfigRecord>;
  updateChauffeurConfig(data: Partial<ChauffeurConfigRecord>, userEmail: string): Promise<ChauffeurConfigRecord>;

  // Why Stay / Pillars
  getWhyStayConfig(): Promise<WhyStayConfigRecord>;
  updateWhyStayConfig(data: Partial<WhyStayConfigRecord>, userEmail: string): Promise<WhyStayConfigRecord>;

  // Dining
  getDiningConfig(): Promise<DiningConfigRecord>;
  updateDiningConfig(data: Partial<DiningConfigRecord>, userEmail: string): Promise<DiningConfigRecord>;
  getDiningCategories(): Promise<DiningCategoryRecord[]>;
  saveDiningCategory(category: DiningCategoryRecord, userEmail: string): Promise<DiningCategoryRecord>;
  deleteDiningCategory(id: string, userEmail: string): Promise<boolean>;

  // Experiences
  getExperiences(): Promise<ExperienceRecord[]>;
  saveExperience(item: ExperienceRecord, userEmail: string): Promise<ExperienceRecord>;
  deleteExperience(id: string, userEmail: string): Promise<boolean>;

  // Safari
  getSafariDestinations(): Promise<SafariDestinationRecord[]>;
  saveSafariDestination(item: SafariDestinationRecord, userEmail: string): Promise<SafariDestinationRecord>;
  deleteSafariDestination(id: string, userEmail: string): Promise<boolean>;

  // Global Content
  getGlobalContent(): Promise<GlobalContentRecord>;
  updateGlobalContent(data: Partial<GlobalContentRecord>, userEmail: string): Promise<GlobalContentRecord>;

  // Users & Admin Access Management
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  saveUser(user: UserRecord): Promise<void>;
  listUsers(): Promise<Omit<UserRecord, 'passwordHash'>[]>;
  createUser(user: UserRecord): Promise<UserRecord>;
  updateUser(id: string, data: Partial<UserRecord>): Promise<UserRecord>;
  disableUser(id: string): Promise<void>;
  enableUser(id: string): Promise<void>;
  resetPassword(id: string, newPasswordHash: string): Promise<void>;
  getActiveUserCount(): Promise<number>;
  updateLastLogin(id: string): Promise<void>;
  /** Invalidates every issued session for the user (logout / security changes). */
  revokeUserSessions(id: string): Promise<void>;

  // Audit Logs
  getAuditLogs(limit?: number): Promise<AuditLogRecord[]>;
  addAuditLog(entry: Omit<AuditLogRecord, 'timestamp'>): Promise<void>;

  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;

  // Content Translations (per-language overlays for CMS content)
  getContentTranslations(lang: string): Promise<ContentTranslationRecord[]>;
  saveContentTranslations(lang: string, entries: ContentTranslationRecord[], userEmail: string): Promise<number>;
}

export interface ContentTranslationRecord {
  entity: string;
  path: string;
  /** Empty value removes the translation. */
  value: string;
  /** English text the translation was made from (used to flag outdated translations). */
  source?: string;
  updatedAt?: string;
  updatedBy?: string;
}
