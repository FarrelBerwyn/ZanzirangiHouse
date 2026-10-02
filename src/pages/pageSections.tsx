import React from 'react';
import { PageContentModel, PageSectionConfigModel, LegalSectionModel } from '../services/contentApi';

// ---------------------------------------------------------------------------
// Shared building blocks for the CMS-managed sub-pages (/villas, /dining, ...).
// Section ids match the `sectionsConfig` records stored in page_contents.
// ---------------------------------------------------------------------------

export type CmsPageSlug = 'villas' | 'dining' | 'experiences' | 'safari' | 'about' | 'contact' | 'privacy' | 'terms';

export interface PageSectionDefinition {
  id: string;
  name: string;
}

/** Sections each page can render, in their default (built-in) order. */
export const PAGE_SECTION_DEFAULTS: Record<CmsPageSlug, PageSectionDefinition[]> = {
  villas: [
    { id: 'header', name: 'Page Header & Narrative' },
    { id: 'villas_grid', name: 'Private Villas Collection' },
    { id: 'facilities', name: 'Sanctuary Facilities & Spa' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  dining: [
    { id: 'header', name: 'Page Header & Philosophy' },
    { id: 'dining_section', name: 'Culinary Soul & Tasting Portfolios' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  experiences: [
    { id: 'header', name: 'Page Header' },
    { id: 'experiences_grid', name: 'Curated Experiences Collection' },
    { id: 'explore_zanzibar', name: 'Regional Island Highlights' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  safari: [
    { id: 'header', name: 'Page Header' },
    { id: 'safari_destinations', name: 'Mainland Safari Expeditions' },
    { id: 'itinerary_builder', name: 'Custom Itinerary Builder' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  about: [
    { id: 'header', name: 'Page Header' },
    { id: 'property_intro', name: 'More Than A Stay Intro' },
    { id: 'property_experience', name: 'Discover The Retreat' },
    { id: 'why_stay', name: 'Why Zanzirangi House Pillars' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  contact: [
    { id: 'header', name: 'Page Header' },
    { id: 'concierge', name: '24/7 Concierge Channels' },
    { id: 'shuttle', name: 'VIP Chauffeur & Transfers' },
    { id: 'map', name: 'Location & Interactive Map' },
    { id: 'internal_links', name: 'Exploration Links' },
  ],
  privacy: [
    { id: 'header', name: 'Header & Version Date' },
    { id: 'content', name: 'Policy Clauses & Articles' },
  ],
  terms: [
    { id: 'header', name: 'Header & Version Date' },
    { id: 'content', name: 'Terms Clauses & Articles' },
  ],
};

export const isLegalPage = (slug: string): boolean => slug === 'privacy' || slug === 'terms';

/**
 * Full, editable section list for a page: the stored config (sorted by `order`) with any built-in
 * section that is missing from it inserted at its default position. Orders are renumbered 1..n.
 */
export const mergeSectionsConfig = (
  slug: CmsPageSlug,
  config: PageSectionConfigModel[] | null | undefined
): PageSectionConfigModel[] => {
  const defaults = PAGE_SECTION_DEFAULTS[slug] || [];
  const stored = (Array.isArray(config) ? config : [])
    .filter((s) => s && typeof s.id === 'string' && s.id)
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (Number(a.s.order) || 0) - (Number(b.s.order) || 0) || a.i - b.i)
    .map(({ s }) => s);

  const result: PageSectionConfigModel[] = [];
  const seen = new Set<string>();
  stored.forEach((s) => {
    if (seen.has(s.id)) return;
    seen.add(s.id);
    result.push({ ...s, visible: s.visible !== false });
  });

  defaults.forEach((def, defIndex) => {
    if (seen.has(def.id)) return;
    seen.add(def.id);
    // Insert right after the nearest preceding built-in section that is already in the list.
    let insertAt = 0;
    for (let k = defIndex - 1; k >= 0; k--) {
      const pos = result.findIndex((r) => r.id === defaults[k].id);
      if (pos >= 0) {
        insertAt = pos + 1;
        break;
      }
    }
    result.splice(insertAt, 0, { id: def.id, name: def.name, order: 0, visible: true });
  });

  return result.map((s, idx) => ({ ...s, order: idx + 1 }));
};

/**
 * Section ids to render, in display order. Honors the CMS `visible` + `order` flags; without a
 * usable config the page renders its default order with every section visible.
 */
export const resolveVisibleSections = (
  slug: CmsPageSlug,
  config: PageSectionConfigModel[] | null | undefined
): string[] => {
  const known = new Set((PAGE_SECTION_DEFAULTS[slug] || []).map((d) => d.id));
  return mergeSectionsConfig(slug, config)
    .filter((s) => known.has(s.id) && s.visible !== false)
    .map((s) => s.id);
};

/** Renders the page's sections in CMS order. Ids without a renderer are skipped. */
export const renderPageSections = (
  slug: CmsPageSlug,
  pageContent: PageContentModel | null | undefined,
  renderers: Record<string, () => React.ReactNode>
): React.ReactNode =>
  resolveVisibleSections(slug, pageContent?.sectionsConfig).map((id) =>
    renderers[id] ? <React.Fragment key={id}>{renderers[id]()}</React.Fragment> : null
  );

const nonEmpty = (value: unknown): string => (typeof value === 'string' && value.trim() ? value : '');

// ---------------------------------------------------------------------------
// Content page header (eyebrow / h1 / subheading / description + subtle hero image)
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  pageContent?: PageContentModel | null;
  fallback: { eyebrow: string; heading: string; description: string };
}

export const PageHeader: React.FC<PageHeaderProps> = ({ pageContent, fallback }) => {
  const eyebrow = nonEmpty(pageContent?.eyebrow) || fallback.eyebrow;
  const heading = nonEmpty(pageContent?.heading) || nonEmpty(pageContent?.title) || fallback.heading;
  const subheading = nonEmpty(pageContent?.subheading);
  const description = nonEmpty(pageContent?.description) || fallback.description;
  const heroImage = nonEmpty(pageContent?.heroImage);
  const fadeMask = 'radial-gradient(ellipse at center, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 72%)';

  return (
    <header className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
      {heroImage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
        >
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-[0.1]" />
        </div>
      )}
      <div className="relative">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">{eyebrow}</span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          {heading}
        </h1>
        {subheading && (
          <p className="font-serif italic text-lg sm:text-xl text-[#8E6B40] font-light leading-snug mb-4">{subheading}</p>
        )}
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">{description}</p>
      </div>
    </header>
  );
};

// ---------------------------------------------------------------------------
// Legal pages (privacy / terms)
// ---------------------------------------------------------------------------

const LINK_PATTERN = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g;

/** Turns plain URLs and e-mail addresses inside CMS text into links. */
const linkify = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK_PATTERN.lastIndex = 0;
  while ((match = LINK_PATTERN.exec(text))) {
    let token = match[0];
    const trailing = token.match(/[.,;:!?]+$/);
    if (trailing) token = token.slice(0, -trailing[0].length);
    const start = match.index;
    if (start > last) nodes.push(text.slice(last, start));
    const href = token.includes('@') && !token.startsWith('http') ? `mailto:${token}` : token;
    nodes.push(
      <a key={`${start}-${token}`} href={href} className="text-[#A07E54] underline">
        {token}
      </a>
    );
    last = start + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

interface LegalPageLayoutProps {
  slug: 'privacy' | 'terms';
  pageContent?: PageContentModel | null;
  breadcrumbs: React.ReactNode;
  fallbackEyebrow: string;
  fallbackTitle: string;
  /** Localised "Last Updated: <date>" shown when the CMS has no date. */
  fallbackLastUpdated: string;
  /** Localised prefix placed before the CMS date, e.g. "Last Updated: ". */
  lastUpdatedPrefix: string;
  /** Built-in article body, used only when the CMS has no sections. */
  fallbackBody: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  slug,
  pageContent,
  breadcrumbs,
  fallbackEyebrow,
  fallbackTitle,
  fallbackLastUpdated,
  lastUpdatedPrefix,
  fallbackBody,
}) => {
  const content: NonNullable<PageContentModel['contentJson']> = pageContent?.contentJson || {};
  const eyebrow = nonEmpty(pageContent?.eyebrow) || fallbackEyebrow;
  const title = nonEmpty(pageContent?.heading) || nonEmpty(pageContent?.title) || fallbackTitle;
  const subheading = nonEmpty(pageContent?.subheading);
  const cmsDate = nonEmpty(content.lastUpdated);
  const lastUpdated = cmsDate ? `${lastUpdatedPrefix}${cmsDate}` : fallbackLastUpdated;
  const introText = nonEmpty(content.introText) || nonEmpty(pageContent?.description);
  const sections: LegalSectionModel[] = Array.isArray(content.sections)
    ? content.sections.filter((s: LegalSectionModel) => s && (nonEmpty(s.title) || nonEmpty(s.body) || (s.items || []).length))
    : [];

  const renderers: Record<string, () => React.ReactNode> = {
    header: () => (
      <header className="pt-6 pb-8 border-b border-[#E7DFD2]">
        <span className="text-xs font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">{eyebrow}</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1B1A]">{title}</h1>
        {subheading && <p className="font-serif italic text-base text-[#8E6B40] mt-2">{subheading}</p>}
        <p className="text-xs text-[#6B6862] mt-2 font-mono">{lastUpdated}</p>
      </header>
    ),
    content: () => (
      <article className="prose prose-stone max-w-none pt-8 space-y-6 text-sm text-[#4A4742] leading-relaxed">
        {sections.length > 0 ? (
          <>
            {introText && <p className="whitespace-pre-line">{linkify(introText)}</p>}
            {sections.map((sec, idx) => {
              const items = (sec.items || []).filter((item) => nonEmpty(item));
              return (
                <React.Fragment key={idx}>
                  {nonEmpty(sec.title) && <h2 className="font-serif text-xl text-[#1C1B1A] pt-4">{sec.title}</h2>}
                  {nonEmpty(sec.body) && <p className="whitespace-pre-line">{linkify(sec.body as string)}</p>}
                  {items.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1.5">
                      {items.map((item, i) => (
                        <li key={i}>{linkify(item)}</li>
                      ))}
                    </ul>
                  )}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          fallbackBody
        )}
      </article>
    ),
  };

  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {breadcrumbs}
        {renderPageSections(slug, pageContent, renderers)}
      </div>
    </div>
  );
};
