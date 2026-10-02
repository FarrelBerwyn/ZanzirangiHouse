import { authApi } from './authApi';
import { HomeSectionsContent } from '../data/homeSectionsCms';
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_SECTIONS,
  DEFAULT_VILLAS,
  DEFAULT_GALLERY,
  DEFAULT_FACILITIES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_VIDEOS,
  DEFAULT_SEO,
  DEFAULT_MEDIA,
  DEFAULT_SETTINGS,
} from '../data/seedDefaults';

export interface HeroSlide {
  id: string;
  badgeText?: string;
  title: string;
  subtitle?: string;
  description?: string;
  heroImage: string;
  imageUrl?: string;
  videoUrl?: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  order: number;
  visible: boolean;
  alignment?: string;
  overlayOpacity?: number;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  label?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  order: number;
  visible: boolean;
}

export interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    badgeText?: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    heroImage: string;
    slides?: HeroSlide[];
    autoPlayIntervalSeconds?: number;
  };
  sections?: HomepageSectionConfig[];
  intro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  contact: {
    phone: string;
    email: string;
    whatsappNumber: string;
    address: string;
    googleMapsUrl?: string;
  };
  socials?: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    whatsapp: string;
  };
  footer?: {
    copyrightText: string;
    tagline: string;
  };
  meta?: {
    lastUpdated?: string;
    updatedBy?: string;
  };
}

export interface VillaModel {
  id: string;
  roomNumber: string;
  name: string;
  shortName?: string;
  type: string;
  subtitle?: string;
  capacity: number;
  bed: string;
  bathroom: string;
  size: string;
  view: string;
  pricePerNight: string;
  priceUnit?: string;
  promotionalPrice?: string;
  sizeSqm?: number;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  availability: boolean;
  featured?: boolean;
  architecturalFeature: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  coverImage?: string;
  images: string[];
  gallery?: string[];
  amenities: string[];
  order: number;
  status: 'published' | 'draft' | 'archived';
}

export interface GalleryModel {
  id: string;
  title: string;
  category: 'property' | 'villas' | 'dining' | 'pool' | 'garden' | 'zanzibar' | 'experiences' | string;
  image: string;
  imageUrl?: string;
  aspect: 'landscape' | 'portrait' | 'square';
  aspectRatio?: string;
  caption: string;
  description?: string;
  order: number;
  published: boolean;
}

export interface FacilityModel {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageUrl?: string;
  hours: string;
  highlight: string;
  icon?: string;
  order: number;
  visible: boolean;
}

export interface TestimonialModel {
  id: string;
  guestName: string;
  country: string;
  countryCode: string;
  rating: number;
  stayDate: string;
  villaStayed: string;
  title: string;
  reviewText: string;
  avatar?: string;
  avatarUrl?: string;
  featured?: boolean;
  verified?: boolean;
  verifiedStay?: boolean;
  visible?: boolean;
  order: number;
}

export interface VideoStoryboardScene {
  id: string;
  order: number;
  description: string;
}

export interface VideoModel {
  id?: string;
  title?: string;
  eyebrow?: string;
  badge?: string;
  videoUrl: string;
  posterImage: string;
  scenes: VideoStoryboardScene[];
  visible?: boolean;
}

export interface SeoConfig {
  siteTitle: string;
  defaultOgImage: string;
  googleSiteVerification?: string;
  routes: Record<string, {
    path: string;
    title: string;
    description: string;
    canonical: string;
    robots: string;
  }>;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type?: 'image' | 'video' | 'document' | string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  caption?: string;
  uploadedAt: string;
  referenceCount?: number;
  usageCount?: number;
  width?: number;
  height?: number;
}

export type Villa = VillaModel;
export type GalleryItem = GalleryModel;
export type Facility = FacilityModel;
export type Review = TestimonialModel;
export type VideoData = VideoModel;
export type SeoData = SeoConfig;

export interface SettingsModel {
  siteName: string;
  tagline: string;
  defaultCurrency: string;
  currency?: string;
  defaultLanguage?: string;
  phone?: string;
  conciergePhone: string;
  whatsapp?: string;
  email?: string;
  reservationNotificationEmail: string;
  reservationEmail?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  bookingUrl?: string;
  logo?: string;
  favicon?: string;
  maintenanceMode: boolean;
  supportAvatar?: string;
  supportName?: string;
  supportTitle?: string;
  supportStatus?: string;
}

export interface ContentTranslationEntry {
  entity: string;
  path: string;
  value: string;
  source?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// CMS models — field names match the server/MySQL records exactly
// (server/database/adapter.ts). Fields marked "extra" have no dedicated column;
// the server persists them in the table's extras_json column.
// ---------------------------------------------------------------------------

export interface PageSectionConfigModel {
  id: string;
  name: string;
  order: number;
  visible: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface LegalSectionModel {
  title: string;
  body?: string;
  items?: string[];
}

export interface PageContentModel {
  id?: string;
  slug: string;
  title: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  heroImage?: string;
  sectionsConfig?: PageSectionConfigModel[];
  /** Free-form page content: seo {title, description, ogImage}, introText, sections (legal), lastUpdated, badge, ... */
  contentJson?: {
    seo?: { title?: string; description?: string; ogImage?: string };
    introText?: string;
    lastUpdated?: string;
    sections?: LegalSectionModel[];
    [key: string]: any;
  } | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface TransferSpecItemModel {
  id: string;
  type: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  visible: boolean;
}

export interface ChauffeurConfigModel {
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
  specItems?: TransferSpecItemModel[];
  // extras
  visible?: boolean;
  vehicleSubline?: string;
  passengerSubline?: string;
  whatsappMessage?: string;
  vehicleImageAlt?: string;
  [key: string]: any;
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

export interface WhyStayConfigModel {
  id?: number;
  eyebrow: string;
  heading: string;
  subhead: string;
  pillars: WhyStayPillar[];
  // extras
  visible?: boolean;
  [key: string]: any;
}

export interface DiningItem {
  id?: string;
  name: string;
  description: string;
  price?: string;
  dietary?: string;
  order?: number;
  visible?: boolean;
}

export interface DiningCategoryModel {
  id: string;
  name: string;
  tabLabel: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  signatureDishes: DiningItem[];
  order: number;
  visible: boolean;
  [key: string]: any;
}

export interface DiningMoment {
  title: string;
  time: string;
  desc: string;
  // extras
  image?: string;
}

export interface DiningConfigModel {
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
  categories?: DiningCategoryModel[];
  // extras
  visible?: boolean;
  gardenImage?: string;
  gardenDesc2?: string;
  momentsEyebrow?: string;
  momentsTitle?: string;
  heritageEyebrow?: string;
  heritageTitle?: string;
  [key: string]: any;
}

export interface ExperienceModel {
  id: string;
  title: string;
  category: string;
  duration: string;
  tag: string;
  priceNote: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  whatsappMessage?: string;
  order: number;
  visible: boolean;
  [key: string]: any;
}

export interface SafariDestinationModel {
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
  [key: string]: any;
}

export interface GlobalNavLink {
  label: string;
  href: string;
  order: number;
  visible: boolean;
}

export interface GlobalContentModel {
  id?: number;
  brandName: string;
  navLinks: GlobalNavLink[];
  ctaPlanStayLabel: string;
  ctaPlanStayLink: string;
  footerTagline?: string;
  footerCopyright?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  contactAddress?: string;
  socials?: Record<string, string>;
  // extras
  footerDisclaimer?: string;
  [key: string]: any;
}
export interface ContactInfoModel {
  contact: { phone: string; email: string; whatsappNumber: string; address: string; googleMapsUrl?: string };
  socials: { instagram?: string; facebook?: string; tiktok?: string; youtube?: string; whatsapp?: string };
}

export interface AdminUserModel {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
  status: 'active' | 'disabled';
  permissions?: string[];
  createdAt: string;
  lastLogin?: string;
}

export interface AdminUsersResponse {
  users: AdminUserModel[];
  activeCount: number;
  maxActive: number;
  availableSlots: number;
}

export interface DashboardStats {
  status: string;
  lastPublished: string | null;
  publishedBy: string | null;
  counts: {
    villasPublished: number;
    villasTotal: number;
    galleryItems: number;
    facilities: number;
    testimonials: number;
    mediaAssets: number;
    pagesTotal?: number;
    experiencesTotal?: number;
    diningCategories?: number;
    activeAdmins?: number;
  };
  databaseHost?: string;
  databaseProvider?: string;
  databaseEngine?: string;
  recentUpdates: Array<{
    action: string;
    userEmail: string;
    timestamp: string;
    details?: string;
  }>;
}

export const FALLBACK_HOMEPAGE_CONTENT: HomepageContent = {
  hero: {
    title: 'Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat',
    subtitle: 'YOUR PRIVATE GATEWAY TO ZANZIBAR',
    description: 'Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.',
    badgeText: 'KIZIMKAZI DIMBANI • SOUTH COAST ZANZIBAR',
    primaryCtaText: 'Reserve Sanctuary',
    primaryCtaLink: '#stay',
    secondaryCtaText: 'Explore Sanctuary',
    secondaryCtaLink: '#itinerary',
    heroImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
    slides: DEFAULT_HERO_SLIDES,
    autoPlayIntervalSeconds: 6,
  },
  sections: DEFAULT_SECTIONS,
  intro: {
    eyebrow: 'MORE THAN A STAY',
    title: 'An intimate sanctuary between the ocean breeze and Swahili heritage',
    description: 'Zanzirangi House is an ultra-boutique retreat featuring 8 private plunge-pool villas secluded along the peaceful southern coast of Zanzibar in Kizimkazi Dimbani.',
  },
  contact: {
    phone: '+255 777 890 123',
    email: 'info@zanzirangihouse.com',
    whatsappNumber: '255777890123',
    address: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
  },
};

function getAuthHeaders() {
  const token = authApi.getToken();
  if (!token) throw new Error('Unauthorized');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/** Fired when the admin session is rejected so the CMS can return to the login screen. */
export const ADMIN_SESSION_EXPIRED_EVENT = 'zanzirangi-admin-session-expired';

/**
 * Authenticated admin API call. Throws a readable error on HTTP errors, non-JSON responses
 * or `success: false` — admin screens must never silently fall back to placeholder data,
 * otherwise saving could overwrite live content with defaults.
 */
async function adminRequest(path: string, init: { method?: string; body?: string } = {}): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: getAuthHeaders() });
  if (res.status === 401) {
    authApi.clearSession();
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
    throw new Error('Your session has expired. Please log in again.');
  }
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Unexpected response from the server (HTTP ${res.status}).`);
  }
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Request failed (HTTP ${res.status}).`);
  }
  return json;
}

export const contentApi = {
  // --- Homepage ---
  async getHomepage(): Promise<HomepageContent> {
    try {
      const res = await fetch(`${API_BASE}/content/homepage`);
      if (!res.ok) return FALLBACK_HOMEPAGE_CONTENT;
      const json = await res.json();
      return json.success && json.data ? json.data : FALLBACK_HOMEPAGE_CONTENT;
    } catch {
      return FALLBACK_HOMEPAGE_CONTENT;
    }
  },

  async getAdminHomepage(): Promise<HomepageContent> {
    const json = await adminRequest('/admin/homepage');
    return json.data;
  },

  async updateHomepage(data: Partial<HomepageContent>): Promise<HomepageContent> {
    const json = await adminRequest(`/admin/homepage`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Content Translations (per-language overlays for CMS content) ---
  async getTranslations(lang: string): Promise<Record<string, Record<string, string>>> {
    if (!lang || lang === 'en') return {};
    try {
      const res = await fetch(`${API_BASE}/content/translations/${lang}`);
      if (!res.ok) return {};
      const json = await res.json();
      return json.success && json.data ? json.data : {};
    } catch {
      return {};
    }
  },

  async getAdminTranslations(lang: string): Promise<ContentTranslationEntry[]> {
    const json = await adminRequest(`/admin/translations/${lang}`);
    return json.data || [];
  },

  async updateTranslations(lang: string, entries: ContentTranslationEntry[]): Promise<number> {
    const json = await adminRequest(`/admin/translations/${lang}`, { method: 'PUT', body: JSON.stringify({ entries }) });
    return json.data?.saved || 0;
  },

  // --- Homepage Section Content (per-section headings, cards & lists) ---
  async getAdminHomeSections(): Promise<HomeSectionsContent> {
    const json = await adminRequest('/admin/home-sections');
    return json.data || {};
  },

  async updateHomeSections(data: HomeSectionsContent): Promise<HomeSectionsContent> {
    const json = await adminRequest(`/admin/home-sections`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data || {};
  },

  // --- Villas ---
  async getVillas(): Promise<VillaModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/villas`);
      if (!res.ok) return DEFAULT_VILLAS as any;
      const json = await res.json();
      return json.success && json.data ? json.data : (DEFAULT_VILLAS as any);
    } catch {
      return DEFAULT_VILLAS as any;
    }
  },

  async getAdminVillas(): Promise<VillaModel[]> {
    const json = await adminRequest(`/admin/villas`);
    return json.data || [];
  },

  async createVilla(data: Partial<VillaModel>): Promise<VillaModel> {
    const json = await adminRequest(`/admin/villas`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateVilla(id: string, data: Partial<VillaModel>): Promise<VillaModel> {
    const json = await adminRequest(`/admin/villas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteVilla(id: string): Promise<void> {
    await adminRequest(`/admin/villas/${id}`, { method: 'DELETE' });
  },

  // --- Gallery ---
  async getGallery(): Promise<GalleryModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/gallery`);
      if (!res.ok) return DEFAULT_GALLERY as any;
      const json = await res.json();
      return json.success && json.data ? json.data : (DEFAULT_GALLERY as any);
    } catch {
      return DEFAULT_GALLERY as any;
    }
  },

  async getAdminGallery(): Promise<GalleryModel[]> {
    const json = await adminRequest(`/admin/gallery`);
    return json.data || [];
  },

  async createGalleryItem(data: Partial<GalleryModel>): Promise<GalleryModel> {
    const json = await adminRequest(`/admin/gallery`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateGalleryItem(id: string, data: Partial<GalleryModel>): Promise<GalleryModel> {
    const json = await adminRequest(`/admin/gallery/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    await adminRequest(`/admin/gallery/${id}`, { method: 'DELETE' });
  },

  // --- Facilities ---
  async getFacilities(): Promise<FacilityModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/facilities`);
      if (!res.ok) return DEFAULT_FACILITIES;
      const json = await res.json();
      return json.success && json.data ? json.data : DEFAULT_FACILITIES;
    } catch {
      return DEFAULT_FACILITIES;
    }
  },

  async getAdminFacilities(): Promise<FacilityModel[]> {
    const json = await adminRequest(`/admin/facilities`);
    return json.data || [];
  },

  async createFacility(data: Partial<FacilityModel>): Promise<FacilityModel> {
    const json = await adminRequest(`/admin/facilities`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateFacility(id: string, data: Partial<FacilityModel>): Promise<FacilityModel> {
    const json = await adminRequest(`/admin/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteFacility(id: string): Promise<void> {
    await adminRequest(`/admin/facilities/${id}`, { method: 'DELETE' });
  },

  // --- Testimonials ---
  async getTestimonials(): Promise<TestimonialModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/testimonials`);
      if (!res.ok) return DEFAULT_TESTIMONIALS;
      const json = await res.json();
      return json.success && json.data ? json.data : DEFAULT_TESTIMONIALS;
    } catch {
      return DEFAULT_TESTIMONIALS;
    }
  },

  async getAdminTestimonials(): Promise<TestimonialModel[]> {
    const json = await adminRequest(`/admin/testimonials`);
    return json.data || [];
  },

  async createTestimonial(data: Partial<TestimonialModel>): Promise<TestimonialModel> {
    const json = await adminRequest(`/admin/testimonials`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateTestimonial(id: string, data: Partial<TestimonialModel>): Promise<TestimonialModel> {
    const json = await adminRequest(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteTestimonial(id: string): Promise<void> {
    await adminRequest(`/admin/testimonials/${id}`, { method: 'DELETE' });
  },

  // --- Videos ---
  async getVideos(): Promise<VideoModel> {
    try {
      const res = await fetch(`${API_BASE}/content/videos`);
      if (!res.ok) return DEFAULT_VIDEOS;
      const json = await res.json();
      return json.success && json.data ? json.data : DEFAULT_VIDEOS;
    } catch {
      return DEFAULT_VIDEOS;
    }
  },

  async getAdminVideos(): Promise<VideoModel> {
    const json = await adminRequest(`/admin/videos`);
    if (!json.data) throw new Error('The server returned no data.');
    return json.data;
  },

  async updateVideos(data: Partial<VideoModel>): Promise<VideoModel> {
    const json = await adminRequest(`/admin/videos`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- SEO ---
  async getSeo(): Promise<SeoConfig> {
    try {
      const res = await fetch(`${API_BASE}/content/seo`);
      if (!res.ok) return DEFAULT_SEO;
      const json = await res.json();
      return json.success && json.data ? json.data : DEFAULT_SEO;
    } catch {
      return DEFAULT_SEO;
    }
  },

  async getAdminSeo(): Promise<SeoConfig> {
    const json = await adminRequest(`/admin/seo`);
    if (!json.data) throw new Error('The server returned no data.');
    return json.data;
  },

  async updateSeo(data: Partial<SeoConfig>): Promise<SeoConfig> {
    const json = await adminRequest(`/admin/seo`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Media Library ---
  async getAdminMedia(): Promise<MediaAsset[]> {
    const json = await adminRequest(`/admin/media`);
    return json.data || [];
  },

  async createMediaAsset(data: Partial<MediaAsset>): Promise<MediaAsset> {
    const json = await adminRequest(`/admin/media`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Settings ---
  async getSettings(): Promise<SettingsModel> {
    try {
      const res = await fetch(`${API_BASE}/content/settings`);
      if (!res.ok) return DEFAULT_SETTINGS;
      const json = await res.json();
      return json.success && json.data ? { ...DEFAULT_SETTINGS, ...json.data } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async getAdminSettings(): Promise<SettingsModel> {
    const json = await adminRequest(`/admin/settings`);
    if (!json.data) throw new Error('The server returned no data.');
    return json.data;
  },

  async updateSettings(data: Partial<SettingsModel>): Promise<SettingsModel> {
    const json = await adminRequest(`/admin/settings`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Contact & Social Channels (Admin → Contact & WhatsApp, permission: contact) ---
  async getAdminContactInfo(): Promise<ContactInfoModel> {
    const json = await adminRequest('/admin/contact-info');
    return json.data;
  },

  async updateContactInfo(data: Partial<ContactInfoModel>): Promise<ContactInfoModel> {
    const json = await adminRequest('/admin/contact-info', { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Media Upload (stores the file and registers it in the media library) ---
  async uploadMediaFile(file: File, altText?: string): Promise<MediaAsset> {
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the selected file.'));
      reader.readAsDataURL(file);
    });
    const json = await adminRequest('/admin/media/upload', {
      method: 'POST',
      body: JSON.stringify({ fileBase64, filename: file.name, mimeType: file.type, altText }),
    });
    return json.data;
  },

  async deleteMediaAsset(id: string): Promise<string> {
    const json = await adminRequest(`/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
    return json.message || 'Media asset removed.';
  },

  // --- Dashboard Stats ---
  async getDashboardStats(): Promise<DashboardStats> {
    return await adminRequest('/admin/dashboard-stats');
  },

  // --- Page Contents (Public and Admin) ---
  async getPage(slug: string): Promise<PageContentModel | null> {
    try {
      const res = await fetch(`${API_BASE}/content/pages/${slug}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAllPages(): Promise<PageContentModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/pages`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.success && json.data ? json.data : [];
    } catch {
      return [];
    }
  },

  async getAdminPages(): Promise<PageContentModel[]> {
    const json = await adminRequest(`/admin/pages`);
    return json.data || [];
  },

  async getAdminPage(slug: string): Promise<PageContentModel | null> {
    const json = await adminRequest(`/admin/pages/${slug}`);
    return json.data || null;
  },

  async updateAdminPage(slug: string, data: Partial<PageContentModel>): Promise<PageContentModel> {
    const json = await adminRequest(`/admin/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Chauffeur & Transfers ---
  async getChauffeur(): Promise<ChauffeurConfigModel | null> {
    try {
      const res = await fetch(`${API_BASE}/content/chauffeur`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAdminChauffeur(): Promise<ChauffeurConfigModel> {
    const json = await adminRequest(`/admin/chauffeur`);
    return json.data;
  },

  async updateAdminChauffeur(data: Partial<ChauffeurConfigModel>): Promise<ChauffeurConfigModel> {
    const json = await adminRequest(`/admin/chauffeur`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Why Stay / Sanctuary Difference ---
  async getWhyStay(): Promise<WhyStayConfigModel | null> {
    try {
      const res = await fetch(`${API_BASE}/content/whystay`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAdminWhyStay(): Promise<WhyStayConfigModel> {
    const json = await adminRequest(`/admin/whystay`);
    return json.data;
  },

  async updateAdminWhyStay(data: Partial<WhyStayConfigModel>): Promise<WhyStayConfigModel> {
    const json = await adminRequest(`/admin/whystay`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Dining ---
  async getDining(): Promise<DiningConfigModel | null> {
    try {
      const res = await fetch(`${API_BASE}/content/dining`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAdminDining(): Promise<DiningConfigModel> {
    const json = await adminRequest(`/admin/dining`);
    return json.data;
  },

  async updateAdminDining(data: Partial<DiningConfigModel>): Promise<DiningConfigModel> {
    const json = await adminRequest(`/admin/dining`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async getAdminDiningCategories(): Promise<DiningCategoryModel[]> {
    const json = await adminRequest(`/admin/dining/categories`);
    return json.data || [];
  },

  async createAdminDiningCategory(data: Partial<DiningCategoryModel>): Promise<DiningCategoryModel> {
    const json = await adminRequest(`/admin/dining/categories`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateAdminDiningCategory(id: string, data: Partial<DiningCategoryModel>): Promise<DiningCategoryModel> {
    const json = await adminRequest(`/admin/dining/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteAdminDiningCategory(id: string): Promise<void> {
    await adminRequest(`/admin/dining/categories/${id}`, { method: 'DELETE' });
  },

  // --- Experiences ---
  async getExperiences(): Promise<ExperienceModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/experiences`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.success && json.data ? json.data : [];
    } catch {
      return [];
    }
  },

  async getAdminExperiences(): Promise<ExperienceModel[]> {
    const json = await adminRequest(`/admin/experiences`);
    return json.data || [];
  },

  async createAdminExperience(data: Partial<ExperienceModel>): Promise<ExperienceModel> {
    const json = await adminRequest(`/admin/experiences`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateAdminExperience(id: string, data: Partial<ExperienceModel>): Promise<ExperienceModel> {
    const json = await adminRequest(`/admin/experiences/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteAdminExperience(id: string): Promise<void> {
    await adminRequest(`/admin/experiences/${id}`, { method: 'DELETE' });
  },

  // --- Safari ---
  async getSafari(): Promise<SafariDestinationModel[]> {
    try {
      const res = await fetch(`${API_BASE}/content/safari`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.success && json.data ? json.data : [];
    } catch {
      return [];
    }
  },

  async getAdminSafari(): Promise<SafariDestinationModel[]> {
    const json = await adminRequest(`/admin/safari`);
    return json.data || [];
  },

  async createAdminSafariDestination(data: Partial<SafariDestinationModel>): Promise<SafariDestinationModel> {
    const json = await adminRequest(`/admin/safari`, { method: 'POST', body: JSON.stringify(data) });
    return json.data;
  },

  async updateAdminSafariDestination(id: string, data: Partial<SafariDestinationModel>): Promise<SafariDestinationModel> {
    const json = await adminRequest(`/admin/safari/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async deleteAdminSafariDestination(id: string): Promise<void> {
    await adminRequest(`/admin/safari/${id}`, { method: 'DELETE' });
  },

  // --- Global Content ---
  async getGlobalContent(): Promise<GlobalContentModel | null> {
    try {
      const res = await fetch(`${API_BASE}/content/global`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.success && json.data ? json.data : null;
    } catch {
      return null;
    }
  },

  async getAdminGlobalContent(): Promise<GlobalContentModel> {
    const json = await adminRequest(`/admin/global`);
    return json.data;
  },

  async updateAdminGlobalContent(data: Partial<GlobalContentModel>): Promise<GlobalContentModel> {
    const json = await adminRequest(`/admin/global`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  // --- Admin Access & User Management (Superadmin Only) ---
  async getAdminUsers(): Promise<{ users: AdminUserModel[]; activeCount: number; maxActive: number; availableSlots: number }> {
    const json = await adminRequest(`/admin/users`);
    return {
      users: json.data || [],
      activeCount: json.meta?.activeCount ?? 0,
      maxActive: json.meta?.maxActive ?? 6,
      availableSlots: json.meta?.availableSlots ?? 0,
    };
  },

  async createAdminUser(userData: {
    name: string;
    email: string;
    password: string;
    role?: 'superadmin' | 'admin';
    permissions?: string[];
  }): Promise<AdminUserModel> {
    const json = await adminRequest(`/admin/users`, { method: 'POST', body: JSON.stringify(userData) });
    return json.data;
  },

  async updateAdminUser(id: string, data: Partial<AdminUserModel>): Promise<AdminUserModel> {
    const json = await adminRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    return json.data;
  },

  async disableAdminUser(id: string): Promise<void> {
    await adminRequest(`/admin/users/${id}/disable`, { method: 'POST' });
  },

  async enableAdminUser(id: string): Promise<void> {
    await adminRequest(`/admin/users/${id}/enable`, { method: 'POST' });
  },

  async resetAdminPassword(id: string, newPassword: string): Promise<void> {
    const json = await adminRequest(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) });
  },
};
