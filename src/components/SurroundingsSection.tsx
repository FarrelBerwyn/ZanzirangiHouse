import React from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { Language } from '../types';
import { SURROUNDINGS_DATA } from '../data/surroundings';
import { TRANSLATIONS } from '../data/translations';

interface SurroundingsSectionProps {
  currentLang: Language;
}

const PROXIMITY_EYEBROW: Record<Language, string> = {
  en: 'Destination Proximity',
  pl: 'Atrakcje w Pobliżu',
  ar: 'وجهات قريبة',
  zh: '周边目的地',
  fr: 'Destinations à Proximité',
  sw: 'Vivutio vya Karibu',
  es: 'Destinos Cercanos',
  it: 'Destinazioni Vicine',
};

export const SurroundingsSection: React.FC<SurroundingsSectionProps> = ({
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <section id="surroundings" className="py-24 md:py-32 bg-[#FAF8F5] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#A07E54] font-medium mb-3">
            <Navigation className="w-3.5 h-3.5" />
            <span>{PROXIMITY_EYEBROW[currentLang] || PROXIMITY_EYEBROW.en}</span>
          </div>
          <h2
            id="surroundings-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#141413] mb-4"
          >
            {t.surroundings.heading}
          </h2>
          <p className="text-[#6B6862] text-sm sm:text-base leading-relaxed">
            {t.surroundings.subhead}
          </p>
        </div>

        {/* Surroundings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SURROUNDINGS_DATA.map((loc) => (
            <div
              key={loc.id}
              className="bg-[#F4EFE6] border border-[#E7DFD2] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={loc.image}
                  alt={loc.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur text-[#FAF8F5] rounded text-[11px] font-mono flex items-center space-x-1.5">
                  <Clock className="w-3 h-3 text-[#C4A27A]" />
                  <span>{loc.travelTime}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center space-x-1.5 text-xs text-[#A07E54] font-mono mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{loc.distance}</span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-[#141413] mb-2">
                    {loc.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                    {loc.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
