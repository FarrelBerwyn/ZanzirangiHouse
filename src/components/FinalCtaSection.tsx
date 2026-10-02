import React from 'react';
import { Calendar, Mail, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HomeSectionContent, cmsText } from '../data/homeSectionsCms';
import { FINAL_CTA_EYEBROW_I18N } from '../data/sectionDefaultsI18n';

interface FinalCtaSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  cmsContent?: HomeSectionContent;
}

export const FINAL_CTA_DEFAULTS = {
  eyebrow: 'Private Sanctuary Awaits',
  backgroundImage: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=85',
};

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  currentLang,
  onOpenBooking,
  cmsContent,
}) => {
  const t = TRANSLATIONS[currentLang];
  const text = {
    eyebrow: cmsText(cmsContent?.eyebrow, FINAL_CTA_EYEBROW_I18N[currentLang] || FINAL_CTA_DEFAULTS.eyebrow),
    heading: cmsText(cmsContent?.heading, t.finalCta.heading),
    subhead: cmsText(cmsContent?.subhead, t.finalCta.subhead),
    bookStay: cmsText(cmsContent?.bookLabel, t.finalCta.bookStay),
    contactUs: cmsText(cmsContent?.contactLabel, t.finalCta.contactUs),
    backgroundImage: cmsText(cmsContent?.backgroundImage, FINAL_CTA_DEFAULTS.backgroundImage),
  };

  const handleContactScroll = () => {
    const el = document.getElementById('location');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-28 md:py-36 bg-[#141413] text-[#FAF8F5] overflow-hidden">
      {/* Cinematic Background with Warm Luxury Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={text.backgroundImage}
          alt="Zanzirangi House at dusk"
          className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/80 to-[#141413]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-12 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-white/5 border border-[#C4A27A]/30 text-[#C4A27A] text-[11px] font-mono tracking-[0.25em] uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{text.eyebrow}</span>
        </div>

        <h2
          id="final-cta-heading"
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.06em] leading-tight uppercase text-[#FAF8F5] mb-6"
        >
          {text.heading}
        </h2>

        <p className="font-sans text-base sm:text-lg md:text-xl font-light text-[#D8CCB8] max-w-2xl mx-auto leading-relaxed mb-10">
          "{text.subhead}"
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button
            id="final-cta-book-btn"
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-9 py-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs sm:text-sm tracking-[0.22em] uppercase font-semibold rounded flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl active:scale-95"
          >
            <Calendar className="w-4 h-4" />
            <span>{text.bookStay}</span>
          </button>

          <button
            id="final-cta-contact-btn"
            onClick={handleContactScroll}
            className="w-full sm:w-auto px-9 py-4 border border-[#FAF8F5]/40 hover:border-[#FAF8F5] text-[#FAF8F5] hover:bg-white/10 text-xs sm:text-sm tracking-[0.22em] uppercase font-medium rounded flex items-center justify-center space-x-2 transition-all duration-300 backdrop-blur-sm"
          >
            <Mail className="w-4 h-4" />
            <span>{text.contactUs}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
