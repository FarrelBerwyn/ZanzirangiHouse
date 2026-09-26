import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
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
} from './seedData.ts';

export {
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
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default Homepage Content seeded from actual Zanzirangi House content
export const DEFAULT_HOMEPAGE_CONTENT = {
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
    googleMapsUrl: 'https://maps.google.com/?q=Kizimkazi+Dimbani+Zanzibar',
  },
  socials: {
    instagram: 'https://instagram.com/zanzirangihouse',
    facebook: 'https://facebook.com/zanzirangihouse',
    tiktok: 'https://tiktok.com/@zanzirangihouse',
    youtube: 'https://youtube.com/@zanzirangihouse',
    whatsapp: 'https://wa.me/255777890123',
  },
  footer: {
    copyrightText: '© 2026 Zanzirangi House. All rights reserved. Ultra-Boutique Luxury Sanctuary in Kizimkazi Dimbani, Zanzibar, Tanzania.',
    tagline: 'A tranquil coastal sanctuary in Kizimkazi Dimbani.',
  },
  meta: {
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system',
  },
};

// Initial authorized admin accounts matching Zanzirangi House hostinger mailboxes
export const INITIAL_ADMINS = [
  {
    email: 'info@zanzirangihouse.com',
    name: 'Zanzirangi Head Concierge',
    role: 'superadmin',
  },
  {
    email: 'dominic@zanzirangihouse.com',
    name: 'Dominic - Property Director',
    role: 'admin',
  },
  {
    email: 'dotto@zanzirangihouse.com',
    name: 'Dotto - Guest Operations',
    role: 'admin',
  },
  {
    email: 'jocelyn@zanzirangihouse.com',
    name: 'Jocelyn - Hospitality Manager',
    role: 'admin',
  },
  {
    email: 'saleh@zanzirangihouse.com',
    name: 'Saleh - Operations Lead',
    role: 'admin',
  },
];

export interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    passwordHash: string;
    createdAt: string;
  }>;
  homepage: typeof DEFAULT_HOMEPAGE_CONTENT;
  villas: typeof DEFAULT_VILLAS;
  gallery: typeof DEFAULT_GALLERY;
  facilities: typeof DEFAULT_FACILITIES;
  testimonials: typeof DEFAULT_TESTIMONIALS;
  videos: typeof DEFAULT_VIDEOS;
  seo: typeof DEFAULT_SEO;
  media: typeof DEFAULT_MEDIA;
  settings: typeof DEFAULT_SETTINGS;
  auditLog: Array<{
    action: string;
    userEmail: string;
    timestamp: string;
    details?: string;
  }>;
}

let dbCache: DatabaseSchema | null = null;

export function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Bootstrap initial password securely if database is newly initialized
  const initialBootstrapPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ChangeMeImmediately2026!';
  const salt = bcrypt.genSaltSync(12);
  const defaultHash = bcrypt.hashSync(initialBootstrapPassword, salt);

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.homepage) {
        // Upgrade database structure dynamically while preserving existing users & audit logs
        let mutated = false;

        if (!parsed.homepage.hero.slides || parsed.homepage.hero.slides.length === 0) {
          parsed.homepage.hero.slides = DEFAULT_HERO_SLIDES;
          parsed.homepage.hero.autoPlayIntervalSeconds = 6;
          mutated = true;
        }
        if (!parsed.homepage.sections || parsed.homepage.sections.length === 0) {
          parsed.homepage.sections = DEFAULT_SECTIONS;
          mutated = true;
        }
        if (!parsed.homepage.socials) {
          parsed.homepage.socials = DEFAULT_HOMEPAGE_CONTENT.socials;
          mutated = true;
        }
        if (!parsed.homepage.footer) {
          parsed.homepage.footer = DEFAULT_HOMEPAGE_CONTENT.footer;
          mutated = true;
        }
        if (!parsed.villas || parsed.villas.length === 0) {
          parsed.villas = DEFAULT_VILLAS;
          mutated = true;
        }
        if (!parsed.gallery || parsed.gallery.length === 0) {
          parsed.gallery = DEFAULT_GALLERY;
          mutated = true;
        }
        if (!parsed.facilities || parsed.facilities.length === 0) {
          parsed.facilities = DEFAULT_FACILITIES;
          mutated = true;
        }
        if (!parsed.testimonials || parsed.testimonials.length === 0) {
          parsed.testimonials = DEFAULT_TESTIMONIALS;
          mutated = true;
        }
        if (!parsed.videos) {
          parsed.videos = DEFAULT_VIDEOS;
          mutated = true;
        }
        if (!parsed.seo) {
          parsed.seo = DEFAULT_SEO;
          mutated = true;
        }
        if (!parsed.media || parsed.media.length === 0) {
          parsed.media = DEFAULT_MEDIA;
          mutated = true;
        }
        if (!parsed.settings) {
          parsed.settings = DEFAULT_SETTINGS;
          mutated = true;
        }

        if (mutated) {
          saveDatabase(parsed);
        }

        dbCache = parsed;
        return dbCache as DatabaseSchema;
      }
    } catch (e) {
      console.error('Error reading existing database, re-initializing...', e);
    }
  }

  const initialDb: DatabaseSchema = {
    users: INITIAL_ADMINS.map((admin, idx) => ({
      id: `usr_${idx + 1}`,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      passwordHash: defaultHash,
      createdAt: new Date().toISOString(),
    })),
    homepage: DEFAULT_HOMEPAGE_CONTENT,
    villas: DEFAULT_VILLAS,
    gallery: DEFAULT_GALLERY,
    facilities: DEFAULT_FACILITIES,
    testimonials: DEFAULT_TESTIMONIALS,
    videos: DEFAULT_VIDEOS,
    seo: DEFAULT_SEO,
    media: DEFAULT_MEDIA,
    settings: DEFAULT_SETTINGS,
    auditLog: [
      {
        action: 'DB_INITIALIZED',
        userEmail: 'system',
        timestamp: new Date().toISOString(),
        details: 'Initial database created with authorized Zanzirangi mailboxes and full content models',
      },
    ],
  };

  saveDatabase(initialDb);
  dbCache = initialDb;
  return initialDb;
}

let lastMtime = 0;

export function getDatabase(): DatabaseSchema {
  if (fs.existsSync(DB_FILE)) {
    try {
      const stat = fs.statSync(DB_FILE);
      if (!dbCache || stat.mtimeMs > lastMtime) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        dbCache = JSON.parse(raw);
        lastMtime = stat.mtimeMs;
      }
      return dbCache as DatabaseSchema;
    } catch {}
  }

  if (!dbCache) {
    return initDatabase();
  }
  return dbCache;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
  try {
    lastMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {}
}
