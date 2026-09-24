import React from 'react';
import { ChevronDown, Sparkles, MapPin, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import heroVideo from '../data/Zanzirangi-home.mp4';

interface HeroSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onOpenBooking,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const handleScrollToStay = () => {
    const el = document.getElementById('stay');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToItinerary = () => {
    const el = document.getElementById('itinerary');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onOpenBooking();
    }
  };

  const scrollAriaLabels: Record<Language, string> = {
    en: 'Scroll to discover property',
    fr: 'Défiler pour découvrir la propriété',
    sw: 'Sogeza chini kugundua makazi',
    es: 'Desplazarse para descubrir la propiedad',
    it: 'Scorri per scoprire la proprietà',
    pl: 'Przewiń, aby odkryć posiadłość',
    ar: 'انتقل للأسفل لاستكشاف المنتجع',
    zh: '向下滚动探索庄园',
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#141413] text-[#FAF8F5]"
    >
      {/* Background Video: Zanzirangi House Authentic Footage */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90"
          className="w-full h-full object-cover scale-105 animate-subtleZoom"
          style={{ filter: 'brightness(0.68) contrast(1.08)' }}
        >
          <source src={heroVideo} type="video/mp4" />
          <source src="./Zanzirangi-home.mp4" type="video/mp4" />
          <source src="./videos/Zanzirangi-home.mp4" type="video/mp4" />
        </video>

        {/* Sophisticated Luxury Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Top Spacer for fixed navbar */}
      <div className="h-20 sm:h-24 md:h-32" />

      {/* Main Editorial Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center my-auto py-8 sm:py-10 md:py-16"
      >
        {/* Subtle Location Indicator Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center space-x-1.5 sm:space-x-2.5 px-3 py-1 sm:px-5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF8F5] text-[8.5px] xs:text-[9.5px] sm:text-xs tracking-[0.12em] sm:tracking-[0.32em] uppercase mb-6 sm:mb-8 shadow-lg whitespace-nowrap max-w-full"
        >
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C4A27A] flex-shrink-0" />
          <span className="font-medium text-[#FAF8F5] whitespace-nowrap">ZANZIBAR, TANZANIA</span>
          <span className="text-[#C4A27A] flex-shrink-0">•</span>
          <span className="text-[#D8CCB8] tracking-[0.12em] sm:tracking-[0.25em] whitespace-nowrap">ZANZIRANGI HOUSE</span>
        </motion.div>

        {/* Major Headline */}
        <motion.h1
          id="hero-main-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-light tracking-[0.06em] sm:tracking-[0.08em] leading-[1.15] sm:leading-[1.12] text-[#FAF8F5] uppercase mb-4 sm:mb-6 drop-shadow-xl"
        >
          {t.hero.title || 'ZANZIBAR LUXURY VILLA SANCTUARY'}
        </motion.h1>

        {/* Supporting Narrative */}
        <motion.p
          id="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto font-sans text-sm sm:text-lg md:text-xl font-light text-[#E7DFD2] leading-relaxed tracking-wide mb-8 sm:mb-10 md:mb-12 drop-shadow-md"
        >
          {t.hero.subtitle || 'Stay, explore and experience the island — with Tanzania beyond.'}
        </motion.p>

        {/* Primary and Secondary Luxury CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 max-w-md sm:max-w-none mx-auto"
        >
          <button
            id="hero-explore-button"
            onClick={handleScrollToStay}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 border border-[#FAF8F5]/80 hover:border-[#FAF8F5] text-[#FAF8F5] hover:bg-white/15 text-xs sm:text-sm tracking-[0.18em] sm:tracking-[0.22em] uppercase font-semibold rounded transition-all duration-300 backdrop-blur-sm shadow-md active:scale-95 cursor-pointer"
          >
            {t.hero.exploreProperty || 'EXPLORE THE RETREAT'}
          </button>

          <button
            id="hero-book-button"
            onClick={handleScrollToItinerary}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs sm:text-sm tracking-[0.18em] sm:tracking-[0.22em] uppercase font-bold rounded transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
          >
            {t.hero.bookYourStay || 'PLAN YOUR JOURNEY'}
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom Bar: Coordinates & Scroll Cue */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full pb-6 sm:pb-8 px-4 sm:px-6 md:px-12 flex items-center justify-between min-h-[48px]"
      >
        {/* Left: Shortened location text */}
        <div className="hidden sm:flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#D8CCB8]/70 uppercase z-10">
          <Compass className="w-3.5 h-3.5 text-[#C4A27A] flex-shrink-0" />
          <span>Kizimkazi • Zanzibar</span>
        </div>

        {/* Center: Scroll to Discover indicator (strictly centered on entire hero width) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 z-20 pointer-events-auto">
          <button
            onClick={handleScrollToStay}
            className="group flex flex-col items-center space-y-1.5 text-[#D8CCB8]/80 hover:text-[#FAF8F5] transition-colors focus:outline-none cursor-pointer"
            aria-label={scrollAriaLabels[currentLang] || scrollAriaLabels.en}
          >
            <span className="text-[10px] tracking-[0.3em] uppercase font-light whitespace-nowrap">
              {t.hero.scrollIndicator || 'SCROLL TO DISCOVER'}
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-[#C4A27A]" />
          </button>
        </div>

        {/* Right: Region tag */}
        <div className="hidden sm:block text-right text-[11px] font-mono tracking-widest text-[#D8CCB8]/70 uppercase z-10 ml-auto">
          <span>Indian Ocean Lagoon • Menai Bay</span>
        </div>
      </motion.div>
    </section>
  );
};
