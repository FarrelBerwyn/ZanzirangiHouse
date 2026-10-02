import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Language, Facility } from '../types';
import { getLocalizedFacilities } from '../data/facilitiesTranslations';
import { TRANSLATIONS } from '../data/translations';
import { HomeSectionContent, cmsText } from '../data/homeSectionsCms';

interface FacilitiesSectionProps {
  currentLang: Language;
  facilities?: Facility[];
  cmsContent?: HomeSectionContent;
}

export const FacilitiesSection: React.FC<FacilitiesSectionProps> = ({ currentLang, facilities: customFacilities, cmsContent }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const facilities = getLocalizedFacilities(currentLang, customFacilities || undefined);
  const [activeFacilityId, setActiveFacilityId] = useState(facilities[0]?.id || 'pool');

  const activeFacility =
    facilities.find((f) => f.id === activeFacilityId) || facilities[0];

  const eyebrows: Record<Language, string> = {
    en: 'Curated Estate Amenities',
    fr: 'Équipements & Prestations du Domaine',
    sw: 'Huduma Maalum za Hoteli',
    es: 'Instalaciones y Servicios de la Finca',
    it: 'Servizi e Strutture della Tenuta',
    pl: 'Udogodnienia i Przestrzenie Posiadłości',
    ar: 'مرافق وخدمات المنتجع المختارة',
    zh: '庄园尊享典藏设施与管家礼遇',
  };

  const eyebrow = cmsText(cmsContent?.eyebrow, eyebrows[currentLang] || eyebrows.en);

  return (
    <section id="facilities" className="pt-6 sm:pt-10 md:pt-14 pb-8 sm:pb-12 md:pb-16 bg-[#141413] text-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Heading */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#C4A27A] font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{eyebrow}</span>
          </div>
          <h2
            id="facilities-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#FAF8F5] mb-4"
          >
            {cmsText(cmsContent?.heading, t.facilities.heading)}
          </h2>
          <p className="text-[#D8CCB8]/80 text-sm sm:text-base leading-relaxed">
            {cmsText(cmsContent?.subhead, t.facilities.subhead)}
          </p>
        </div>

        {/* Dynamic Editorial Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8 sm:mb-12">
          {/* Left Column: Interactive Facility List */}
          <div className="lg:col-span-5 space-y-2">
            {facilities.map((fac) => {
              const isSelected = fac.id === activeFacilityId;
              return (
                <button
                  key={fac.id}
                  onClick={() => setActiveFacilityId(fac.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-lg transition-all duration-300 flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-[#22211F] border-[#B8966C] text-[#FAF8F5] shadow-lg translate-x-1'
                      : 'bg-transparent border-[#2C2B28] text-[#D8CCB8]/70 hover:bg-[#1C1B1A] hover:text-[#FAF8F5]'
                  }`}
                >
                  <div className="pr-4">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4A27A] block font-mono">
                      {fac.category}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-normal tracking-wide">
                      {fac.title}
                    </h3>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform flex-shrink-0 ${
                      isSelected ? 'text-[#C4A27A] translate-x-1' : 'opacity-30'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Hero Facility Photography & Detailed Narrative */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  key={activeFacility.image}
                  src={activeFacility.image}
                  alt={activeFacility.title}
                  className="w-full h-full object-cover transition-all duration-700 animate-fadeIn"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1A] via-transparent to-transparent opacity-80" />
                {activeFacility.highlight && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded text-[11px] font-mono tracking-wider text-[#C4A27A]">
                    ★ {activeFacility.highlight}
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between text-xs tracking-widest uppercase text-[#A07E54] mb-2 font-mono">
                  <span>{activeFacility.category}</span>
                  {activeFacility.hours && <span>{activeFacility.hours}</span>}
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#FAF8F5] mb-4">
                  {activeFacility.title}
                </h3>

                <p className="text-sm sm:text-base text-[#D8CCB8] leading-relaxed">
                  {activeFacility.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
