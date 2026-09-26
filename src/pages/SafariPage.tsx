import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { BeyondZanzibarSection } from '../components/BeyondZanzibarSection';
import { CustomItinerarySection } from '../components/CustomItinerarySection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';

interface SafariPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
}

export const SafariPage: React.FC<SafariPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
  onOpenSupportChat,
}) => {
  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Tanzania Safari', url: '/safari' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for Safari */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          FLY-IN BUSH & BEACH EXPEDITIONS • TANZANIA MAINLAND
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          Tanzania Safari
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          Combine your barefoot luxury retreat in Zanzibar with world-class mainland safaris. We coordinate 90-minute private air charters directly to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro with premier luxury safari camps.
        </p>
      </header>

      {/* Mainland Safaris Showcase */}
      <BeyondZanzibarSection
        currentLang={currentLang}
        onOpenBooking={onRequestBooking}
        onOpenSupportChat={onOpenSupportChat}
      />

      {/* Custom Itinerary Builder */}
      <CustomItinerarySection
        currentLang={currentLang}
        onOpenSupportChat={onOpenSupportChat}
      />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="safari" onNavigate={onNavigate} />
    </div>
  );
};
