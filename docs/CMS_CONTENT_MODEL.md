# Zanzirangi House: CMS Content Model Specification

**Document Version:** 1.0.0  
**Specification Level:** Production Architecture  
**Storage Engine:** Atomic JSON Store (`server/data/db.json`)  
**Backend Runtime:** Node.js / Express 4.x  
**Frontend Framework:** React 18 with TypeScript  

---

## 1. Core Architectural Principle

> **"Every public UI element that can change over time must have a content model."**  
> We do not store flattened arbitrary fields (`hero1`, `hero2`, `hero3`). Instead, repeatable and structured elements utilize normalized collections, repeaters, ordering indices, and status flags.

---

## 2. Homepage Content Model

```ts
export interface HeroSlide {
  id: string;
  badgeText: string;          // e.g. "KIZIMKAZI DIMBANI • SOUTH COAST ZANZIBAR"
  title: string;              // e.g. "Zanzibar Luxury Villa - Zanzirangi House"
  subtitle: string;           // e.g. "Private Pool Retreat"
  description: string;        // e.g. "Experience Zanzibar luxury villas with private plunge pools..."
  heroImage: string;          // High-resolution photography URL
  videoUrl?: string;          // Optional ambient looping MP4
  primaryCtaText: string;     // e.g. "Reserve Sanctuary"
  primaryCtaLink: string;     // e.g. "#stay"
  secondaryCtaText: string;   // e.g. "Explore Sanctuary"
  secondaryCtaLink: string;   // e.g. "#itinerary"
  order: number;
  visible: boolean;
}

export interface HomepageSectionConfig {
  id: string;                 // Section key: "hero" | "intro" | "villas" | "dining" | "gallery" | etc.
  name: string;               // Human-readable title in CMS
  title?: string;             // Displayed section heading
  subtitle?: string;          // Displayed section eyebrow / subtitle
  description?: string;       // Displayed editorial text
  order: number;              // Order index (1, 2, 3...)
  visible: boolean;           // Show / Hide toggle without deleting content
}

export interface HomepageContent {
  hero: {
    activeSlideId?: string;
    autoPlayIntervalSeconds: number;
    slides: HeroSlide[];
  };
  sections: HomepageSectionConfig[];
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
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    whatsapp: string;
  };
  meta: {
    lastUpdated: string;
    updatedBy: string;
  };
}
```

---

## 3. Rooms & Villas Content Model (`villas`)

```ts
export interface VillaAmenity {
  name: string;
  iconName?: string;
}

export interface VillaModel {
  id: string;                     // e.g. "villa-01"
  roomNumber: string;             // e.g. "VILLA 01"
  name: string;                   // e.g. "Sultan Oceanfront Villa"
  type: string;                   // e.g. "Master Ocean Villa with Private Plunge Pool"
  capacity: number;               // Guest capacity (e.g. 2)
  bed: string;                    // e.g. "Handcrafted King Four-Poster Bed"
  bathroom: string;               // e.g. "En-suite Stone Wet Room & Outdoor Rain Shower"
  size: string;                   // e.g. "95 m² (1,022 sq ft)"
  view: string;                   // e.g. "Direct Panoramic Indian Ocean & Sunset"
  pricePerNight: string;          // e.g. "$480"
  promotionalPrice?: string;      // e.g. "$420"
  availability: boolean;          // true: Available, false: Booked
  featured: boolean;              // Highlight on homepage
  architecturalFeature: string;   // e.g. "Private plunge pool carved into coastal limestone"
  shortDescription: string;       // Card description
  description: string;            // Long-form modal / page narrative
  heroImage: string;              // Primary cover photo
  images: string[];               // Curated gallery array
  amenities: string[];            // Dynamic amenities array
  order: number;
  status: 'published' | 'draft' | 'archived';
}
```

---

## 4. Curated Gallery Content Model (`gallery`)

```ts
export interface GalleryModel {
  id: string;                     // e.g. "g-prop-01"
  title: string;                  // e.g. "Cliffside Oceanfront Sanctuary"
  category: 'property' | 'villas' | 'dining' | 'pool' | 'garden' | 'zanzibar' | 'experiences';
  image: string;                  // High-res photo URL
  aspect: 'landscape' | 'portrait' | 'square';
  caption: string;                // Detailed photographic caption
  order: number;
  published: boolean;
}
```

---

## 5. Facilities & Amenities Content Model (`facilities`)

```ts
export interface FacilityModel {
  id: string;                     // e.g. "pool"
  title: string;                  // e.g. "Oceanfront Infinity Pool"
  category: string;               // e.g. "Relaxation & Wellness"
  description: string;            // Editorial summary
  image: string;                  // Photography URL
  hours: string;                  // e.g. "06:30 – 22:00 Daily"
  highlight: string;              // Key luxury differentiator
  order: number;
  visible: boolean;
}
```

---

## 6. Testimonials Content Model (`testimonials`)

```ts
export interface TestimonialModel {
  id: string;                     // e.g. "rev-01"
  guestName: string;              // e.g. "Eleanor & Marcus Vance"
  country: string;                // e.g. "United Kingdom"
  countryCode: string;            // e.g. "GB"
  rating: number;                 // 1 - 5 stars
  stayDate: string;               // e.g. "November 2025"
  villaStayed: string;            // e.g. "Sultan Oceanfront Villa"
  title: string;                  // Review header
  reviewText: string;             // Detailed guest impression
  featured: boolean;              // Homepage carousel priority
  verified: boolean;              // Verified stay badge
  visible: boolean;
  order: number;
}
```

---

## 7. Promotional Video Content Model (`videos`)

```ts
export interface VideoStoryboardScene {
  id: string;
  order: number;
  description: string;
}

export interface VideoModel {
  id: string;
  title: string;                  // e.g. "Cinematic Brand Reel"
  eyebrow: string;                // e.g. "Experience The Sanctuary"
  badge: string;                  // e.g. "4K Ultra HD • Concept Storyboard"
  videoUrl: string;               // Direct MP4 URL or YouTube/Vimeo
  posterImage: string;            // Cover thumbnail
  scenes: VideoStoryboardScene[]; // Sequential scenes
  visible: boolean;
}
```

---

## 8. SEO & Route Metadata Content Model (`seo`)

```ts
export interface RouteSeoModel {
  path: string;                   // "/", "/villas", "/dining", etc.
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  robots: string;                 // "index, follow" | "noindex, nofollow"
}

export interface SeoConfig {
  siteTitle: string;
  defaultOgImage: string;
  googleSiteVerification?: string;
  routes: Record<string, RouteSeoModel>;
}
```

---

## 9. Media Library Asset Model (`media`)

```ts
export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  altText: string;
  caption?: string;
  uploadedAt: string;
  referenceCount: number;
}
```
