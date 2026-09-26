import React from 'react';
import { Compass } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_INTRO_TRANSLATIONS } from '../data/introTranslations';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

export interface DynamicIntroProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

interface PropertyIntroProps {
  currentLang: Language;
  dynamicIntro?: DynamicIntroProps;
}

export const PropertyIntro: React.FC<PropertyIntroProps> = ({ currentLang, dynamicIntro }) => {
  const introContent = PROPERTY_INTRO_TRANSLATIONS[currentLang] || PROPERTY_INTRO_TRANSLATIONS.en;

  const eyebrowText = dynamicIntro?.eyebrow || introContent.philosophyTag;
  const headingText = dynamicIntro?.title || introContent.heading;
  const bodyText = dynamicIntro?.description || introContent.body;

  return (
    <section id="about" className="pt-8 sm:pt-12 md:pt-16 pb-24 md:pb-36 bg-[#FAF8F5] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Editorial Introduction Header */}
        <ScrollReveal className="max-w-4xl mb-16 md:mb-24">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.32em] uppercase text-[#A07E54] font-semibold mb-4">
            <span className="w-8 h-[1px] bg-[#A07E54]" />
            <span>{eyebrowText}</span>
          </div>

          <h2
            id="intro-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] leading-[1.14] text-[#141413] uppercase mb-8"
          >
            {headingText}
          </h2>

          <p className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#8E6B40] font-light leading-snug mb-8">
            {introContent.quote}
          </p>

          <p
            id="intro-body-copy"
            className="text-[#3E3C38] font-normal leading-[1.85] text-base md:text-lg max-w-3xl"
          >
            {bodyText}
          </p>
        </ScrollReveal>

        {/* Large Editorial Photography & Architectural Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-20 md:mb-28">
          {/* Main Large Visual */}
          <ScrollReveal direction="left" distance={30} className="lg:col-span-7 relative">
            <div className="relative aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1600&q=85"
                alt="Zanzirangi House coastal architecture"
                className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
              <div className="absolute bottom-6 left-6 right-6 text-white flex justify-between items-end">
                <div>
                  <span className="text-[10px] tracking-[0.3em] uppercase text-[#D8CCB8] block mb-1">
                    {introContent.locationTag}
                  </span>
                  <p className="font-serif text-lg tracking-wide italic">
                    {introContent.photoCaption}
                  </p>
                </div>
                <span className="hidden sm:block text-xs font-mono text-[#D8CCB8]/80">
                  {introContent.estTag}
                </span>
              </div>
            </div>

            {/* Inset Texture Card */}
            <div className="hidden md:block absolute -bottom-8 -right-6 w-56 bg-[#1C1B1A] text-[#FAF8F5] p-6 rounded-xl shadow-2xl border border-[#2C2B28]">
              <Compass className="w-5 h-5 text-[#C4A27A] mb-2.5" />
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#D8CCB8] font-mono">
                {introContent.solitudeTag}
              </p>
              <p className="font-mono text-xs text-[#E7DFD2] mt-1">
                6°26'34.4"S 39°28'04.1"E
              </p>
            </div>
          </ScrollReveal>

          {/* Secondary Visual & Editorial Text */}
          <ScrollReveal direction="right" distance={30} delay={0.15} className="lg:col-span-5 space-y-6">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-[#E7DFD2]">
              <img
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85"
                alt="Poolside oceanfront lounge"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur rounded text-[10px] uppercase tracking-widest text-[#FAF8F5]">
                {introContent.livingBadge}
              </div>
            </div>

            <p className="text-sm md:text-base text-[#55524B] leading-relaxed">
              {introContent.craftsmanshipDesc}
            </p>
          </ScrollReveal>
        </div>

        {/* 6 Editorial Experience Pillars */}
        <div className="border-t border-b border-[#E7DFD2] py-14">
          <ScrollReveal className="mb-8">
            <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-[#A07E54] block mb-1">
              {introContent.completeExperienceTag}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#141413] font-light uppercase">
              {introContent.pillarsHeading}
            </h3>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {introContent.pillars.map((pillar, idx) => (
              <StaggerItem key={idx} className="group flex flex-col justify-start">
                <div className="flex items-baseline space-x-3 mb-2">
                  <span className="font-mono text-xs text-[#A07E54] font-semibold">
                    0{idx + 1}.
                  </span>
                  <h4 className="font-serif text-xl text-[#141413] group-hover:text-[#A07E54] transition-colors">
                    {pillar.label}
                  </h4>
                </div>
                <p className="text-sm text-[#6B6862] leading-relaxed pl-7">
                  {pillar.description}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};
