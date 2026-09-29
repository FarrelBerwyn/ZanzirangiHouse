import { authApi } from './authApi';
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
  };
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
    email: 'concierge@zanzirangihouse.com',
    whatsappNumber: '255777890123',
    address: 'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
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
    const res = await fetch(`${API_BASE}/admin/homepage`, { headers: getAuthHeaders() });
    if (res.status === 401) {
      authApi.clearSession();
      throw new Error('Session expired');
    }
    const json = await res.json();
    return json.data;
  },

  async updateHomepage(data: Partial<HomepageContent>): Promise<HomepageContent> {
    const res = await fetch(`${API_BASE}/admin/homepage`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save homepage');
    return json.data;
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
    const res = await fetch(`${API_BASE}/admin/villas`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async createVilla(data: Partial<VillaModel>): Promise<VillaModel> {
    const res = await fetch(`${API_BASE}/admin/villas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateVilla(id: string, data: Partial<VillaModel>): Promise<VillaModel> {
    const res = await fetch(`${API_BASE}/admin/villas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteVilla(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/villas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(`${API_BASE}/admin/gallery`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async createGalleryItem(data: Partial<GalleryModel>): Promise<GalleryModel> {
    const res = await fetch(`${API_BASE}/admin/gallery`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateGalleryItem(id: string, data: Partial<GalleryModel>): Promise<GalleryModel> {
    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(`${API_BASE}/admin/facilities`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async createFacility(data: Partial<FacilityModel>): Promise<FacilityModel> {
    const res = await fetch(`${API_BASE}/admin/facilities`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateFacility(id: string, data: Partial<FacilityModel>): Promise<FacilityModel> {
    const res = await fetch(`${API_BASE}/admin/facilities/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteFacility(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/facilities/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async createTestimonial(data: Partial<TestimonialModel>): Promise<TestimonialModel> {
    const res = await fetch(`${API_BASE}/admin/testimonials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async updateTestimonial(id: string, data: Partial<TestimonialModel>): Promise<TestimonialModel> {
    const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  async deleteTestimonial(id: string): Promise<void> {
    await fetch(`${API_BASE}/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(`${API_BASE}/admin/videos`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || DEFAULT_VIDEOS;
  },

  async updateVideos(data: Partial<VideoModel>): Promise<VideoModel> {
    const res = await fetch(`${API_BASE}/admin/videos`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
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
    const res = await fetch(`${API_BASE}/admin/seo`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || DEFAULT_SEO;
  },

  async updateSeo(data: Partial<SeoConfig>): Promise<SeoConfig> {
    const res = await fetch(`${API_BASE}/admin/seo`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // --- Media Library ---
  async getAdminMedia(): Promise<MediaAsset[]> {
    const res = await fetch(`${API_BASE}/admin/media`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || [];
  },

  async createMediaAsset(data: Partial<MediaAsset>): Promise<MediaAsset> {
    const res = await fetch(`${API_BASE}/admin/media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // --- Settings ---
  async getAdminSettings(): Promise<SettingsModel> {
    const res = await fetch(`${API_BASE}/admin/settings`, { headers: getAuthHeaders() });
    const json = await res.json();
    return json.data || DEFAULT_SETTINGS;
  },

  async updateSettings(data: Partial<SettingsModel>): Promise<SettingsModel> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  },

  // --- Dashboard Stats ---
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/admin/dashboard-stats`, { headers: getAuthHeaders() });
    if (res.status === 401) {
      authApi.clearSession();
      throw new Error('Session expired');
    }
    return await res.json();
  },
};
