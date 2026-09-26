import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { PropertyIntro } from '../components/PropertyIntro';
import { PropertyExperienceSection } from '../components/PropertyExperienceSection';
import { WhyStaySection } from '../components/WhyStaySection';
import { InternalLinkingSection } from '../components/InternalLinkingSection';
import { Language } from '../types';

interface AboutPageProps {
  currentLang: Language;
  onNavigate: (url: string) => void;
  onRequestBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
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
            { name: 'About Sanctuary', url: '/about' },
          ]}
          onNavigate={onNavigate}
        />
      </div>

      {/* Hero Header for About */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <span className="text-xs font-mono tracking-[0.28em] uppercase text-[#A07E54] block mb-3">
          BAREFOOT LUXURY • SWAHILI-OMANI HERITAGE
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1B1A] font-light leading-tight mb-5">
          About Zanzirangi House
        </h1>
        <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-2xl mx-auto">
          Nestled along the pristine southern coral coast of Kizimkazi Dimbani, Zanzirangi House is an ultra-boutique private sanctuary designed to offer total seclusion, architectural harmony, and intimate Zanzibar hospitality.
        </p>
      </header>

      {/* Property Editorial Intro */}
      <PropertyIntro currentLang={currentLang} />

      {/* Property Experience */}
      <PropertyExperienceSection currentLang={currentLang} />

      {/* Why Stay Section */}
      <WhyStaySection currentLang={currentLang} />

      {/* Contextual Internal Links */}
      <InternalLinkingSection currentPage="about" onNavigate={onNavigate} />
    </div>
  );
};
