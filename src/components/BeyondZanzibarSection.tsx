import React, { useState, useEffect } from 'react';
import { Plane, Sparkles, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { Language } from '../types';
import { TanzaniaDestination, TANZANIA_DESTINATIONS } from '../data/tanzaniaDestinations';
import {
  getLocalizedTanzaniaDestinations,
  BEYOND_UI_TRANSLATIONS,
} from '../data/destinationTranslations';

import { SafariDestinationModel } from '../services/contentApi';

interface BeyondZanzibarSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  onOpenSupportChat?: (query?: string) => void;
  dynamicDestinations?: SafariDestinationModel[] | null;
}

export const BeyondZanzibarSection: React.FC<BeyondZanzibarSectionProps> = ({
  currentLang,
  onOpenSupportChat,
  dynamicDestinations,
}) => {
  const ui = BEYOND_UI_TRANSLATIONS[currentLang] || BEYOND_UI_TRANSLATIONS.en;
  const destinations = getLocalizedTanzaniaDestinations(currentLang);

  // CMS destinations win; built-in translations only fill fields that are empty or still at their English default
  // (getLocalizedTanzaniaDestinations). Destinations without a built-in entry show exactly what the CMS holds.
  const visibleCms = (dynamicDestinations || [])
    .filter((d) => d && d.visible !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const destinationsList: TanzaniaDestination[] =
    visibleCms.length > 0
      ? getLocalizedTanzaniaDestinations(
          currentLang,
          visibleCms.map((d) => {
            const seed = TANZANIA_DESTINATIONS.find((s) => s.id === d.id);
            const highlights = Array.isArray(d.highlights)
              ? d.highlights.filter((h) => typeof h === 'string' && h.trim())
              : [];
            return {
              id: d.id,
              name: d.name || '',
              tagline: d.tagline || '',
              region: d.region || '',
              flightTimeFromZanzibar: d.flightTimeFromZanzibar || '',
              // Rows saved by the old editor kept the photo under `image`.
              heroImage:
                d.heroImage ||
                (typeof d.image === 'string' ? d.image : '') ||
                seed?.heroImage ||
                'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=85',
              description: d.description || '',
              highlights,
              bestFor: d.bestFor || '',
              safariType: d.safariType || '',
            };
          })
        )
      : destinations;

  const [activeDestinationId, setActiveDestinationId] = useState<string>(
    destinationsList[0]?.id || 'dest-serengeti'
  );

  const activeDestination =
    destinationsList.find((d) => d.id === activeDestinationId) ||
    destinationsList[0] ||
    destinations[0];

  const handlePlanJourney = (dest?: TanzaniaDestination) => {
    const targetDest = dest || activeDestination;
    const prompt = targetDest.tagline
      ? `${ui.chatPrompt} ${targetDest.name} (${targetDest.tagline}).`
      : `${ui.chatPrompt} ${targetDest.name}.`;
    if (onOpenSupportChat) {
      onOpenSupportChat(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('open-customer-support', { detail: { query: prompt } }));
    }
  };

  return (
    <section id="tanzania" className="py-24 md:py-36 bg-[#141413] text-[#FAF8F5] relative overflow-hidden">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#B8966C]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#8E6B40]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Editorial Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#C4A27A] text-[11px] tracking-[0.32em] uppercase font-mono mb-4">
            <Plane className="w-3.5 h-3.5" />
            <span>{ui.eyebrow}</span>
          </div>

          <h2
            id="beyond-zanzibar-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] leading-[1.12] text-[#FAF8F5] uppercase mb-6"
          >
            {ui.heading}
          </h2>

          <p className="font-sans text-base sm:text-lg md:text-xl font-light text-[#D8CCB8] leading-relaxed">
            {ui.subhead}
          </p>
        </div>

        {/* Destination Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-12">
          {destinationsList.map((dest) => {
            const isSelected = activeDestination?.id === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setActiveDestinationId(dest.id)}
                className={`text-left p-3 sm:p-5 lg:p-6 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-[#22211F] border-[#C4A27A] shadow-xl text-white'
                    : 'bg-[#1C1B1A]/80 border-[#2C2B28] text-[#D8CCB8]/70 hover:border-[#FAF8F5]/30 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1 sm:mb-2 min-h-[24px]">
                  <span className="font-serif text-xs min-[360px]:text-sm sm:text-lg lg:text-xl tracking-wide uppercase font-normal truncate">
                    {dest.name}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-[#C4A27A] flex-shrink-0" />}
                </div>
                <p className="text-[11px] sm:text-xs text-[#C4A27A] line-clamp-1 font-sans">
                  {dest.tagline}
                </p>
                {dest.flightTimeFromZanzibar && (
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#A07E54] block mt-1.5 sm:mt-2 truncate">
                    ✈ {dest.flightTimeFromZanzibar}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Major Cinematic Showcase Canvas */}
        <div className="bg-[#1C1B1A] border border-[#2C2B28] rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Large Hero Photography */}
          <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-[540px] overflow-hidden group">
            <img
              key={activeDestination?.id}
              src={activeDestination?.heroImage}
              alt={activeDestination?.name}
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 animate-fadeIn"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-transparent to-black/40" />

            {activeDestination?.region && (
              <div className="absolute top-6 left-6 px-3.5 py-1.5 bg-black/75 backdrop-blur-md rounded-full text-xs font-mono tracking-wider uppercase text-[#C4A27A] border border-white/10 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#C4A27A]" />
                <span>{activeDestination.region}</span>
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6 text-white">
              {activeDestination?.flightTimeFromZanzibar && (
                <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#D8CCB8] block mb-1">
                  {ui.flightLabel} {activeDestination.flightTimeFromZanzibar}
                </span>
              )}
              {activeDestination?.tagline && (
                <p className="font-serif text-2xl sm:text-3xl font-light italic">
                  "{activeDestination.tagline}"
                </p>
              )}
            </div>
          </div>

          {/* Detailed Destination Intelligence */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono tracking-widest text-[#C4A27A] uppercase block mb-1">
                  {ui.eyebrow}
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#FAF8F5] tracking-wide">
                  {activeDestination?.name}
                </h3>
                <p className="text-sm font-medium text-[#C4A27A] mt-1">
                  {activeDestination?.safariType}
                </p>
              </div>

              <p className="text-sm sm:text-base text-[#D8CCB8] leading-relaxed font-light">
                {activeDestination?.description}
              </p>

              {/* Highlights */}
              {(activeDestination?.highlights || []).length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[#2C2B28]">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#A07E54] block">
                    {ui.highlightsLabel}
                  </span>
                  {(activeDestination?.highlights || []).map((h, i) => (
                    <div key={i} className="flex items-center space-x-2.5 text-xs text-[#FAF8F5]/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4A27A] flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-[#2C2B28] space-y-3">
              <button
                onClick={() => handlePlanJourney(activeDestination)}
                className="w-full py-4 px-6 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-[0.2em] uppercase rounded flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
              >
                <span>{ui.planSafariBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {activeDestination?.bestFor && (
                <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-[#D8CCB8]/70">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C4A27A]" />
                  <span>{activeDestination.bestFor}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
