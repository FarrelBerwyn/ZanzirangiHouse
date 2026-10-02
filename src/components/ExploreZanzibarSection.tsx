import React from 'react';
import { MapPin, ArrowRight, Compass } from 'lucide-react';
import { Language } from '../types';
import { ZanzibarDestination } from '../data/exploreZanzibar';
import {
  getLocalizedZanzibarDestinations,
  EXPLORE_UI_TRANSLATIONS,
} from '../data/destinationTranslations';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { HomeSectionContent, cmsList, cmsText } from '../data/homeSectionsCms';

interface ExploreZanzibarSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  cmsContent?: HomeSectionContent;
}

export const ExploreZanzibarSection: React.FC<ExploreZanzibarSectionProps> = ({
  currentLang,
  cmsContent,
}) => {
  const baseUi = EXPLORE_UI_TRANSLATIONS[currentLang] || EXPLORE_UI_TRANSLATIONS.en;
  const ui = {
    ...baseUi,
    eyebrow: cmsText(cmsContent?.eyebrow, baseUi.eyebrow),
    heading: cmsText(cmsContent?.heading, baseUi.heading),
    subhead: cmsText(cmsContent?.subhead, baseUi.subhead),
    whatsappPrompt: cmsText(cmsContent?.whatsappPrompt, baseUi.whatsappPrompt),
  };
  const builtInDestinations = getLocalizedZanzibarDestinations(currentLang);
  const destinations: ZanzibarDestination[] = cmsList<any>(cmsContent?.destinations, builtInDestinations).map(
    (item, idx) => {
      const builtIn = builtInDestinations.find((d) => d.id === item.id) || builtInDestinations[idx] || builtInDestinations[0];
      // Highlights are edited in the CMS as one comma/line separated string.
      const highlights = Array.isArray(item.highlights)
        ? item.highlights
        : typeof item.highlights === 'string' && item.highlights.trim()
          ? item.highlights.split(/[,\n]/).map((h: string) => h.trim()).filter(Boolean)
          : builtIn.highlights;
      return {
        ...builtIn,
        id: item.id || `dest-${idx}`,
        name: cmsText(item.name, builtIn.name),
        theme: cmsText(item.theme, builtIn.theme),
        location: cmsText(item.location, builtIn.location),
        image: cmsText(item.image, builtIn.image),
        shortDescription: cmsText(item.shortDescription, builtIn.shortDescription),
        ctaLabel: cmsText(item.ctaLabel, builtIn.ctaLabel),
        highlights,
      };
    }
  );

  const handleExploreDestination = (dest: ZanzibarDestination) => {
    const text = `${ui.whatsappPrompt} ${dest.name} (${dest.theme}).`;
    const url = `https://wa.me/${PROPERTY_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="explore" className="py-24 md:py-36 bg-[#F4EFE6] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.32em] uppercase text-[#A07E54] font-semibold mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>{ui.eyebrow}</span>
          </div>

          <h2
            id="explore-zanzibar-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#141413] mb-4"
          >
            {ui.heading}
          </h2>

          <p className="text-[#6B6862] text-sm sm:text-base leading-relaxed">
            {ui.subhead}
          </p>
        </div>

        {/* 5 Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {destinations.map((dest, idx) => (
            <div
              key={dest.id}
              className={`bg-[#FAF8F5] border border-[#E7DFD2] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group ${
                idx === 0 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Image */}
              <div
                className={`relative overflow-hidden ${
                  idx === 0 ? 'aspect-[16/9]' : 'aspect-[16/11]'
                }`}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/75 backdrop-blur-md rounded text-[10px] tracking-widest font-mono uppercase text-[#C4A27A]">
                  {dest.theme}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-[#141413]/85 backdrop-blur text-[#D8CCB8] text-[10px] font-mono tracking-wider uppercase rounded flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#C4A27A]" />
                  <span>{dest.location}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-7 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#141413] mb-1 group-hover:text-[#A07E54] transition-colors">
                    {dest.name}
                  </h3>
                  <span className="text-xs font-semibold tracking-wider uppercase text-[#8E6B40] block mb-3">
                    {dest.theme}
                  </span>
                  <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed mb-6">
                    {dest.shortDescription}
                  </p>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {dest.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#F4EFE6] border border-[#E7DFD2] rounded text-[11px] text-[#6B6862]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience CTA */}
                <div className="pt-4 border-t border-[#E7DFD2]">
                  <button
                    onClick={() => handleExploreDestination(dest)}
                    className="w-full py-3.5 px-4 bg-[#1C1B1A] group-hover:bg-[#B8966C] text-[#FAF8F5] group-hover:text-[#141413] text-xs font-bold tracking-[0.18em] uppercase rounded flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    <span>{dest.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
