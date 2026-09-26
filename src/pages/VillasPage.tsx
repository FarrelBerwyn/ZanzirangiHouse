import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { VillasSection } from '../components/VillasSection';
import { FacilitiesSection } from '../components/FacilitiesSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language, Villa } from '../types';

interface VillasPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onSelectVilla: (villa: Villa) => void;
  onRequestBooking: (villaId?: string) => void;
  villas?: Villa[];
}

export const VillasPage: React.FC<VillasPageProps> = ({
  currentLang,
  onNavigate,
  onSelectVilla,
  onRequestBooking,
  villas,
}) => {
  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Private Villas', url: '/villas' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for Villas */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          KIZIMKAZI DIMBANI • SOUTH COAST ZANZIBAR
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          Private Villas in Zanzibar
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          Discover our 8 private artisanal residences ranging from 78 m² to 95 m². Each villa features a 100% private freshwater plunge pool, authentic Swahili coral-stone architecture, and personalized 24/7 dedicated butler service.
        </p>
      </header>

      {/* Full Interactive Villa Inventory */}
      <VillasSection
        currentLang={currentLang}
        onSelectVilla={onSelectVilla}
        onRequestBooking={onRequestBooking}
        villas={villas}
      />

      {/* Supporting Amenities & Estate Facilities */}
      <FacilitiesSection currentLang={currentLang} />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="villas" onNavigate={onNavigate} />
    </div>
  );
};
