import React from 'react';
import { Sparkles } from 'lucide-react';
import { Language } from '../types';
import { WHY_STAY_TRANSLATIONS } from '../data/serviceTranslations';
import { localizeUnlessEdited } from '../data/homeSectionsCms';
import { WhyStayConfigModel } from '../services/contentApi';

interface WhyStaySectionProps {
  currentLang: Language;
  dynamicWhyStay?: WhyStayConfigModel | null;
}

const PILLAR_IMAGES = [
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85',
];

// Header values the server returns for an untouched why_stay_config row.
const SERVER_HEADER_DEFAULTS: Record<'eyebrow' | 'heading' | 'subhead', string> = {
  eyebrow: 'THE SANCTUARY DIFFERENCE',
  heading: 'WHY ZANZIRANGI HOUSE',
  subhead:
    'Four guiding values define every moment at our retreat, creating a rare atmosphere of calm, exclusivity, and profound connection to Tanzania.',
};

/** Seeded pillars use ids "pillar-1".."pillar-4" (built-in order); match by id, then by English title. */
const findBuiltInPillarIndex = (id: string | undefined, title: string | undefined): number => {
  const match = /^pillar-(\d+)$/.exec(id || '');
  if (match) {
    const idx = Number(match[1]) - 1;
    if (idx >= 0 && idx < WHY_STAY_TRANSLATIONS.en.pillars.length) return idx;
  }
  return WHY_STAY_TRANSLATIONS.en.pillars.findIndex((p) => p.title === title);
};

export const WhyStaySection: React.FC<WhyStaySectionProps> = ({ currentLang, dynamicWhyStay }) => {
  if (dynamicWhyStay?.visible === false) {
    return null;
  }

  const t = WHY_STAY_TRANSLATIONS[currentLang] || WHY_STAY_TRANSLATIONS.en;
  const en = WHY_STAY_TRANSLATIONS.en;

  // Built-in translations are used only while a CMS value is empty or still a built-in default.
  const header = (field: 'eyebrow' | 'heading' | 'subhead'): string => {
    const raw = dynamicWhyStay?.[field];
    const cmsValue = typeof raw === 'string' && raw.trim() ? raw : undefined;
    return localizeUnlessEdited(cmsValue, SERVER_HEADER_DEFAULTS[field], en[field], t[field]);
  };

  const eyebrow = header('eyebrow');
  const heading = header('heading');
  const subhead = header('subhead');

  const cmsPillars = Array.isArray(dynamicWhyStay?.pillars) ? dynamicWhyStay!.pillars : [];

  // Render CMS pillars (visible only, by order) if any exist, else the built-in pillars.
  const pillarsToRender =
    cmsPillars.length > 0
      ? cmsPillars
          .filter((p) => p && p.visible !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((p, idx) => {
            const builtInIdx = findBuiltInPillarIndex(p.id, p.title);
            const enPillar = builtInIdx >= 0 ? en.pillars[builtInIdx] : undefined;
            const locPillar = builtInIdx >= 0 ? t.pillars[builtInIdx] : undefined;
            const field = (key: 'title' | 'tagline' | 'description'): string =>
              localizeUnlessEdited(p[key] || undefined, undefined, enPillar?.[key], locPillar?.[key]);
            return {
              key: p.id || `pillar-${idx}`,
              number: p.number || String(idx + 1).padStart(2, '0'),
              title: field('title'),
              tagline: field('tagline'),
              description: field('description'),
              image: p.image || PILLAR_IMAGES[idx % PILLAR_IMAGES.length],
            };
          })
      : t.pillars.map((p, idx) => ({
          key: `builtin-${idx}`,
          number: p.number,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          image: PILLAR_IMAGES[idx % PILLAR_IMAGES.length],
        }));

  return (
    <section id="why-us" className="py-24 md:py-36 bg-[#F4EFE6] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.32em] uppercase text-[#A07E54] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>

          <h2
            id="why-stay-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#141413] mb-4"
          >
            {heading}
          </h2>

          <p className="text-[#6B6862] text-sm sm:text-base leading-relaxed">
            {subhead}
          </p>
        </div>

        {/* Dynamic Pillars in Editorial Asymmetric Typography + Photography Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {pillarsToRender.map((pillar) => (
            <div
              key={pillar.key}
              className="flex flex-col justify-between space-y-6 group"
            >
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-md border border-[#E7DFD2]">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#141413]/85 backdrop-blur rounded text-xs font-mono text-[#C4A27A]">
                  {pillar.number}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#141413] font-light tracking-wide group-hover:text-[#A07E54] transition-colors">
                  {pillar.title}
                </h3>
                {pillar.tagline && (
                  <p className="font-serif italic text-lg sm:text-xl text-[#8E6B40]">
                    "{pillar.tagline}"
                  </p>
                )}
                {pillar.description && (
                  <p className="text-sm text-[#55524B] leading-relaxed">
                    {pillar.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
