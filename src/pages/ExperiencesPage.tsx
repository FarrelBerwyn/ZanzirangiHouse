import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExperiencesSection } from '../components/ExperiencesSection';
import { ExploreZanzibarSection } from '../components/ExploreZanzibarSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';

interface ExperiencesPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
}

export const ExperiencesPage: React.FC<ExperiencesPageProps> = ({
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
            { name: 'Zanzibar Experiences', url: '/experiences' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for Experiences */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          CURATED ISLAND ADVENTURES • MENAI BAY & BEYOND
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          Zanzibar Experiences
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          From ethical wild dolphin encounters in the Menai Bay Marine Reserve to private Stone Town UNESCO heritage tours, organic spice trails, and sunset dhow sailing—experience Zanzibar with our dedicated private guides.
        </p>
      </header>

      {/* Core Experiences Section */}
      <ExperiencesSection
        currentLang={currentLang}
        onOpenBooking={onRequestBooking}
        onOpenSupportChat={onOpenSupportChat}
      />

      {/* Explore Zanzibar Island Highlights */}
      <ExploreZanzibarSection
        currentLang={currentLang}
        onOpenBooking={onRequestBooking}
      />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="experiences" onNavigate={onNavigate} />
    </div>
  );
};
