// Multilingual layer for CMS content.
//
// CMS records are authored once (in English). Translations are stored separately per
// language as { entity: { path: text } } and laid over the English record at render time,
// so every existing editor keeps working unchanged. Admin → Translations edits them.
//
// Path syntax (concrete): `hero.slides[slide-01].title`, `[villa-01].amenities[#2]`.
//   [x]  → array item whose `id` (or `slug`) is x
//   [#n] → array item at index n (for items without an id, e.g. string lists)
// Pattern syntax: same, with `[]` matching every array item. `**` matches every
// string leaf except technical keys (urls, images, ids, links).

import { Language } from '../types';

export type TranslationMap = Record<string, string>; // path -> translated text
export type EntityTranslations = Record<string, TranslationMap>; // entity -> paths

export interface TranslatableEntity {
  key: string;
  label: string;
  /** Public content endpoint (relative to /api/content/) that returns the English source. */
  endpoint: string;
  patterns: string[];
}

export const TRANSLATION_LANGUAGES: { code: Exclude<Language, 'en'>; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'zh', label: '中文 (Chinese)' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export const TRANSLATABLE_ENTITIES: TranslatableEntity[] = [
  {
    key: 'homepage',
    label: 'Homepage – Hero Slides, Intro & Footer',
    endpoint: 'homepage',
    patterns: [
      'hero.slides[].badgeText',
      'hero.slides[].title',
      'hero.slides[].subtitle',
      'hero.slides[].description',
      'hero.slides[].primaryCtaText',
      'hero.slides[].secondaryCtaText',
      'hero.badgeText',
      'hero.title',
      'hero.subtitle',
      'hero.description',
      'hero.primaryCtaText',
      'hero.secondaryCtaText',
      'intro.eyebrow',
      'intro.title',
      'intro.description',
      'footer.copyrightText',
      'footer.tagline',
    ],
  },
  {
    key: 'homeSections',
    label: 'Homepage – Other Sections',
    endpoint: 'home-sections',
    patterns: ['**'],
  },
  {
    key: 'global',
    label: 'Navigation & Footer',
    endpoint: 'global',
    patterns: ['navLinks[].label', 'ctaPlanStayLabel', 'footerTagline', 'footerCopyright', 'footerDisclaimer'],
  },
  {
    key: 'villas',
    label: 'Rooms & Villas',
    endpoint: 'villas',
    patterns: [
      '[].roomNumber',
      '[].name',
      '[].shortName',
      '[].type',
      '[].shortDescription',
      '[].description',
      '[].size',
      '[].bed',
      '[].bathroom',
      '[].view',
      '[].architecturalFeature',
      '[].amenities[]',
    ],
  },
  {
    key: 'dining',
    label: 'Dining',
    endpoint: 'dining',
    patterns: [
      'eyebrow',
      'heading',
      'subhead',
      'intro',
      'gardenEyebrow',
      'gardenBadge',
      'gardenTitle',
      'gardenDesc',
      'tagZeroMiles',
      'tagSpices',
      'tagSeafood',
      'moments[].title',
      'moments[].time',
      'moments[].desc',
      'categories[].name',
      'categories[].tabLabel',
      'categories[].subtitle',
      'categories[].description',
      'categories[].signatureDishes[].name',
      'categories[].signatureDishes[].description',
      'categories[].signatureDishes[].dietary',
      'gardenDesc2',
      'momentsEyebrow',
      'momentsTitle',
      'heritageEyebrow',
      'heritageTitle',
    ],
  },
  {
    key: 'experiences',
    label: 'Experiences',
    endpoint: 'experiences',
    patterns: ['[].title', '[].duration', '[].tag', '[].priceNote', '[].shortDescription', '[].description', '[].whatsappMessage'],
  },
  {
    key: 'safari',
    label: 'Safari Packages',
    endpoint: 'safari',
    patterns: [
      '[].name',
      '[].tagline',
      '[].region',
      '[].flightTimeFromZanzibar',
      '[].description',
      '[].highlights[]',
      '[].bestFor',
      '[].safariType',
    ],
  },
  {
    key: 'whystay',
    label: 'Why Stay (4 Pillars)',
    endpoint: 'whystay',
    patterns: ['eyebrow', 'heading', 'subhead', 'pillars[].title', 'pillars[].tagline', 'pillars[].description'],
  },
  {
    key: 'chauffeur',
    label: 'Airport Transfers',
    endpoint: 'chauffeur',
    patterns: [
      'eyebrow',
      'heading',
      'subhead',
      'routeLabel',
      'routeTitle',
      'specsEyebrow',
      'cardTitle',
      'airportTitle',
      'airportDesc',
      'shuttleTitle',
      'shuttleDesc',
      'vehicleTypeTitle',
      'vehicleTypeDesc',
      'passengerLuggageTitle',
      'passengerLuggageDesc',
      'amenitiesNote',
      'ctaRequestLabel',
      'ctaAddBookingLabel',
      'specItems[].title',
      'specItems[].description',
      'vehicleSubline',
      'passengerSubline',
      'whatsappMessage',
      'vehicleImageAlt',
    ],
  },
  {
    key: 'facilities',
    label: 'Facilities & Spa',
    endpoint: 'facilities',
    patterns: ['[].title', '[].category', '[].description', '[].hours', '[].highlight'],
  },
  {
    key: 'gallery',
    label: 'Photo Gallery',
    endpoint: 'gallery',
    patterns: ['[].title', '[].caption', '[].description'],
  },
  {
    key: 'testimonials',
    label: 'Guest Reviews',
    endpoint: 'testimonials',
    patterns: ['[].country', '[].stayDate', '[].villaStayed', '[].title', '[].reviewText'],
  },
  {
    key: 'videos',
    label: 'Video Reel Scenes',
    endpoint: 'videos',
    patterns: ['scenes[].title', 'scenes[].description'],
  },
  {
    key: 'pages',
    label: 'Info & Legal Pages',
    endpoint: 'pages',
    patterns: [
      '[].title',
      '[].eyebrow',
      '[].heading',
      '[].subheading',
      '[].description',
      '[].contentJson.badge',
      '[].contentJson.amenitiesList[]',
      '[].contentJson.lastUpdated',
      '[].contentJson.introText',
      '[].contentJson.sections[].title',
      '[].contentJson.sections[].body',
      '[].contentJson.sections[].items[]',
      '[].contentJson.seo.title',
      '[].contentJson.seo.description',
    ],
  },
];

// Keys that hold technical values and must never be translated (used by the `**` pattern).
const TECHNICAL_KEY = /(^id$|^key$|^slug$|url$|link$|href$|image$|icon$|^embed)/i;

type Token = { kind: 'key'; name: string } | { kind: 'item'; ref?: string };

const parse = (path: string): Token[] => {
  const tokens: Token[] = [];
  const re = /([^.[\]]+)|\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(path))) {
    if (m[1] !== undefined) tokens.push({ kind: 'key', name: m[1] });
    else tokens.push({ kind: 'item', ref: m[2] === '' ? undefined : m[2] });
  }
  return tokens;
};

const itemRef = (item: any, index: number): string => {
  if (item && typeof item === 'object') {
    if (typeof item.id === 'string' || typeof item.id === 'number') return String(item.id);
    if (typeof item.slug === 'string') return item.slug;
  }
  return `#${index}`;
};

const joinPath = (base: string, token: string, isItem: boolean) =>
  isItem ? `${base}[${token}]` : base ? `${base}.${token}` : token;

/** Lists every translatable English string in `data` as { path: source }. */
export const extractTranslatable = (entity: TranslatableEntity, data: any): TranslationMap => {
  const out: TranslationMap = {};

  const walkAll = (node: any, path: string, key: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, i) => walkAll(item, joinPath(path, itemRef(item, i), true), key));
    } else if (node && typeof node === 'object') {
      Object.entries(node).forEach(([k, v]) => {
        if (!TECHNICAL_KEY.test(k)) walkAll(v, joinPath(path, k, false), k);
      });
    } else if (typeof node === 'string' && node.trim() && !/^(https?:|\/|\.\/|#|mailto:|tel:)/.test(node.trim())) {
      out[path] = node;
    }
  };

  const walk = (node: any, tokens: Token[], path: string) => {
    if (node === undefined || node === null) return;
    if (tokens.length === 0) {
      if (typeof node === 'string' && node.trim()) out[path] = node;
      return;
    }
    const [head, ...rest] = tokens;
    if (head.kind === 'key') {
      if (head.name === '**') return walkAll(node, path, '');
      if (typeof node === 'object') walk(node[head.name], rest, joinPath(path, head.name, false));
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, rest, joinPath(path, itemRef(item, i), true)));
    }
  };

  entity.patterns.forEach((pattern) => walk(data, parse(pattern), ''));
  return out;
};

/** Returns a copy of `data` with the translated strings applied (missing translations keep English). */
export const applyTranslations = <T,>(data: T, translations: TranslationMap | undefined): T => {
  if (!data || !translations || Object.keys(translations).length === 0) return data;
  const clone: any = typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data));

  Object.entries(translations).forEach(([path, value]) => {
    if (typeof value !== 'string' || !value.trim()) return;
    const tokens = parse(path);
    let parent: any = null;
    let parentKey: string | number | null = null;
    let node: any = clone;
    for (const token of tokens) {
      if (node === undefined || node === null) return;
      parent = node;
      if (token.kind === 'key') {
        parentKey = token.name;
        node = node[token.name];
      } else {
        if (!Array.isArray(node) || !token.ref) return;
        const ref = token.ref;
        const index = ref.startsWith('#')
          ? Number(ref.slice(1))
          : node.findIndex((item: any, i: number) => itemRef(item, i) === ref);
        if (index < 0 || index >= node.length) return;
        parentKey = index;
        node = node[index];
      }
    }
    if (parent && parentKey !== null && typeof node === 'string') parent[parentKey] = value;
  });

  return clone;
};
