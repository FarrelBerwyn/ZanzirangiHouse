import React, { useState } from 'react';
import { Eye, Compass } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_EXPERIENCE_TRANSLATIONS } from '../data/serviceTranslations';
import { ScrollReveal } from './ScrollReveal';
import { HomeSectionContent, cmsList, cmsText } from '../data/homeSectionsCms';

interface PropertyExperienceSectionProps {
  currentLang: Language;
  cmsContent?: HomeSectionContent;
}

export const FACET_KEYS = [
  'villas',
  'bungalows',
  'pool',
  'lounge',
  'garden',
  'restaurant',
  'seaview',
  'outdoor',
] as const;

export const FACET_IMAGES: Record<string, string> = {
  villas: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=85',
  bungalows: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=85',
  lounge: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85',
  garden: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1600&q=85',
  restaurant: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=85',
  seaview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
  outdoor: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
};

interface Facet {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

export const PropertyExperienceSection: React.FC<PropertyExperienceSectionProps> = ({ currentLang, cmsContent }) => {
  const baseT = PROPERTY_EXPERIENCE_TRANSLATIONS[currentLang] || PROPERTY_EXPERIENCE_TRANSLATIONS.en;
  const t = {
    eyebrow: cmsText(cmsContent?.eyebrow, baseT.eyebrow),
    heading: cmsText(cmsContent?.heading, baseT.heading),
    subhead: cmsText(cmsContent?.subhead, baseT.subhead),
  };

  const builtInFacets: Facet[] = FACET_KEYS.map((key) => {
    const facet = baseT.facets[key];
    return {
      key,
      title: facet?.title || key,
      subtitle: facet?.subtitle || '',
      description: facet?.description || '',
      image: FACET_IMAGES[key],
    };
  });
  const facets: Facet[] = cmsList<Partial<Facet>>(cmsContent?.facets, builtInFacets).map((item, idx) => {
    const builtIn = builtInFacets.find((f) => f.key === item.key) || builtInFacets[idx] || builtInFacets[0];
    return {
      key: item.key || `facet-${idx}`,
      title: cmsText(item.title, builtIn.title),
      subtitle: cmsText(item.subtitle, builtIn.subtitle),
      description: cmsText(item.description, builtIn.description),
      image: cmsText(item.image, builtIn.image),
    };
  });

  const [activeFacetKey, setActiveFacetKey] = useState<string>(facets[0]?.key || 'villas');

  const activeFacet = facets.find((f) => f.key === activeFacetKey) || facets[0];
  const activeImage = activeFacet.image;

  return (
    <section id="retreat" className="py-24 md:py-36 bg-[#141413] text-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#2C2B28]">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.32em] uppercase text-[#C4A27A] font-mono mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.eyebrow}</span>
            </div>
            <h2
              id="property-experience-heading"
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#FAF8F5]"
            >
              {t.heading}
            </h2>
          </div>

          <p className="text-[#D8CCB8]/80 text-sm max-w-md mt-4 md:mt-0 font-light leading-relaxed">
            {t.subhead}
          </p>
        </ScrollReveal>

        {/* Editorial Image-Based Navigation System */}
        <ScrollReveal delay={0.1} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Interactive Facet Selector List */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
              {t.eyebrow}
            </span>
            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-2">
              {facets.map((facet, idx) => {
                const key = facet.key;
                const isActive = activeFacet.key === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFacetKey(key)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-[#22211F] border border-[#C4A27A] text-white shadow-lg'
                        : 'bg-[#1C1B1A]/60 border border-transparent text-[#D8CCB8]/70 hover:bg-[#1C1B1A] hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#A07E54] block">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-lg tracking-wide uppercase font-normal block">
                        {facet.title}
                      </span>
                      <span className="text-xs text-[#C4A27A] line-clamp-1">
                        {facet.subtitle}
                      </span>
                    </div>
                    <Eye
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-[#C4A27A] scale-110' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Immersive Editorial Photography Canvas */}
          <div className="lg:col-span-8 bg-[#1C1B1A] border border-[#2C2B28] rounded-3xl overflow-hidden shadow-2xl relative min-h-[460px] lg:min-h-[560px] flex flex-col justify-end p-8 sm:p-12">
            <img
              key={activeFacetKey}
              src={activeImage}
              alt={activeFacet.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105 animate-fadeIn"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/40 to-black/30" />

            <div className="relative z-10 max-w-2xl">
              <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#C4A27A] block mb-2">
                {activeFacet.subtitle}
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[#FAF8F5] mb-4">
                {activeFacet.title}
              </h3>
              <p className="text-sm sm:text-base text-[#E7DFD2] font-light leading-relaxed">
                {activeFacet.description}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
