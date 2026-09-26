import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DiningSection } from '../components/DiningSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';

interface DiningPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
}

export const DiningPage: React.FC<DiningPageProps> = ({
  currentLang,
  onNavigate,
  onRequestBooking,
}) => {
  return (
    <div className="pt-24 sm:pt-28 pb-16 bg-[#FAF8F5]">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-4">
        <Breadcrumbs
          items={[
            { name: 'Home', url: '/' },
            { name: 'Oceanfront Dining', url: '/dining' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for Dining */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          OCEAN-TO-TABLE & FARM-TO-TABLE GASTRONOMY
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          Oceanfront Dining
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          Taste authentic Zanzibar culinary heritage blending Swahili spices with Indian Ocean seafood caught daily by Kizimkazi artisanal dhow fishermen. Enjoy private veranda dining, beach barbecues, and bespoke candlelit dinners under the stars.
        </p>
      </header>

      {/* Interactive Dining Menu & Offerings */}
      <DiningSection currentLang={currentLang} />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="dining" onNavigate={onNavigate} />
    </div>
  );
};
