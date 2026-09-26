import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MapSection } from '../components/MapSection';
import { ShuttleSection } from '../components/ShuttleSection';
import { ConciergeSection } from '../components/ConciergeSection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';

interface ContactPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
  onOpenSupportChat: (initialQuery?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
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
            { name: 'Contact & Reservations', url: '/contact' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for Contact */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          DIRECT CONCIERGE & INQUIRIES
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          Contact & Reservations
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          Plan your bespoke stay with our concierge team. Whether arranging private villa availability, 45-minute airport transfers from ZNZ, or custom Tanzania safari itineraries, we are available 24/7.
        </p>
      </header>

      {/* Concierge Feature */}
      <ConciergeSection
        currentLang={currentLang}
        onOpenSupportChat={onOpenSupportChat}
      />

      {/* Shuttle & Airport Arrival */}
      <ShuttleSection
        currentLang={currentLang}
        onOpenBooking={onRequestBooking}
      />

      {/* Location Map & Coordinates */}
      <MapSection currentLang={currentLang} />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="contact" onNavigate={onNavigate} />
    </div>
  );
};
