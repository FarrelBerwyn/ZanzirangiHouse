import React from 'react';
import { ChevronDown, MapPin, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HeroSlide, HomepageContent } from '../services/contentApi';
import heroVideo from '../data/Zanzirangi-home.mp4';

interface HeroSectionProps {
  currentLang: Language;
  onOpenBooking: () => void;
  dynamicHero?: HomepageContent['hero'];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onOpenBooking,
  dynamicHero,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Use the primary/first slide content directly without carousel rotation
  const currentSlide = (dynamicHero?.slides && dynamicHero.slides.length > 0)
    ? dynamicHero.slides[0]
    : null;

  const handleCtaClick = (link?: string, fallbackAction?: () => void) => {
    if (!link) {
      if (fallbackAction) fallbackAction();
      return;
    }
    if (link.startsWith('#')) {
      const el = document.getElementById(link.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    } else if (link.startsWith('http')) {
      window.open(link, '_blank');
      return;
    }
    if (fallbackAction) fallbackAction();
  };

  const handleScrollToStay = () => {
    const el = document.getElementById('stay');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToItinerary = () => {
    const el = document.getElementById('itinerary');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else onOpenBooking();
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

  const GOOGLE_MAPS_URL =
    'https://www.google.com/maps/place/Zanzirangi+House/@-6.2345748,39.528593,17z/data=!3m1!4b1!4m6!3m5!1s0x185d3d007c81b231:0xd21c4f44e083553a!8m2!3d-6.2345748!4d39.5311679!16s%2Fg%2F11yyhxw2xf?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D';

  // Derived content either from current slide or legacy dynamicHero fallback
  const rawTitle = currentSlide?.title || dynamicHero?.title || t.hero.title || 'Zanzirangi House — Private Luxury Villas in Zanzibar';
  const dashMatch = rawTitle.match(/^(.*?)\s*([—–-])\s*(.*)$/);
  const brandName = dashMatch ? dashMatch[1].trim() : rawTitle;
  const luxurySubtitle = currentSlide?.subtitle
    ? currentSlide.subtitle
    : dashMatch
    ? `${dashMatch[2]} ${dashMatch[3].trim()}`
    : null;

  const subtitleNarrative = currentSlide?.description || dynamicHero?.description || dynamicHero?.subtitle || t.hero.subtitle || 'Stay, explore and experience the island — with Tanzania beyond.';
  const posterImage = currentSlide?.heroImage || dynamicHero?.heroImage || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90';
  const currentVideoUrl = currentSlide?.videoUrl || heroVideo;
  const exploreCta = currentSlide?.secondaryCtaText || dynamicHero?.secondaryCtaText || t.hero.exploreProperty || 'EXPLORE THE RETREAT';
  const bookCta = currentSlide?.primaryCtaText || dynamicHero?.primaryCtaText || t.hero.bookYourStay || 'PLAN YOUR JOURNEY';
  const badgeLocation = currentSlide?.badgeText || dynamicHero?.badgeText || 'ZANZIBAR, TANZANIA';

  return (
    <section
      id="hero"
      className="relative w-full h-screen h-[100dvh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#141413] text-[#FAF8F5]"
    >
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide?.id || 'static-bg'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {currentVideoUrl ? (
              <video
                key={currentVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                poster={posterImage}
                className="w-full h-full object-cover scale-105 animate-subtleZoom"
                style={{ filter: 'brightness(0.68) contrast(1.08)' }}
              >
                <source src={currentVideoUrl} type="video/mp4" />
                <source src="./Zanzirangi-home.mp4" type="video/mp4" />
              </video>
            ) : (
              <img
                src={posterImage}
                alt={brandName}
                className="w-full h-full object-cover scale-105 animate-subtleZoom"
                style={{ filter: 'brightness(0.68) contrast(1.08)' }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Sophisticated Luxury Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      </div>

      {/* Top Spacer for fixed navbar */}
      <div className="h-16 sm:h-20 md:h-24 shrink-0" />

      {/* Main Editorial Hero Content with Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide?.id || 'main-content'}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center my-auto py-1.5 sm:py-4"
        >
          {/* Interactive Location Indicator Card */}
          <motion.a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Zanzirangi House in Google Maps"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group inline-flex items-center space-x-1.5 sm:space-x-2.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 hover:border-[#C4A27A]/80 text-[#FAF8F5] text-[8px] xs:text-[9px] sm:text-xs tracking-[0.12em] sm:tracking-[0.25em] uppercase mb-2.5 sm:mb-5 shadow-lg hover:shadow-2xl whitespace-nowrap max-w-full transition-all duration-300 ease-out transform scale-90 hover:scale-105 active:scale-95 cursor-pointer origin-center"
          >
            <MapPin className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C4A27A] group-hover:text-[#E2C399] transition-transform duration-300 group-hover:scale-110 flex-shrink-0" />
            <span className="font-medium text-[#FAF8F5] whitespace-nowrap">{badgeLocation}</span>
            <span className="text-[#C4A27A] flex-shrink-0">•</span>
            <span className="text-[#D8CCB8] group-hover:text-white tracking-[0.12em] sm:tracking-[0.22em] whitespace-nowrap transition-colors">
              ZANZIRANGI HOUSE
            </span>
          </motion.a>

          {/* Major Headline with Distinct Visual Hierarchy */}
          <motion.h1
            id="hero-main-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mb-2.5 sm:mb-4 drop-shadow-xl"
          >
            <span className="block font-serif text-[32px] xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[76px] font-light tracking-[0.05em] sm:tracking-[0.08em] leading-[1.08] text-[#FAF8F5] uppercase">
              {brandName}
            </span>
            {luxurySubtitle && (
              <span className="block font-serif text-[13px] xs:text-sm sm:text-lg md:text-xl lg:text-2xl font-light tracking-[0.14em] sm:tracking-[0.18em] leading-relaxed text-[#D8CCB8] uppercase mt-1 sm:mt-2.5 drop-shadow-md">
                {luxurySubtitle}
              </span>
            )}
          </motion.h1>

          {/* Supporting Narrative */}
          <motion.p
            id="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto font-sans text-[13px] xs:text-[14.5px] sm:text-base md:text-lg font-light text-[#E7DFD2] leading-relaxed tracking-wide mb-4 sm:mb-7 md:mb-8 drop-shadow-md px-1 sm:px-0"
          >
            {subtitleNarrative}
          </motion.p>

          {/* Primary and Secondary Luxury CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 w-full mx-auto"
          >
            <button
              id="hero-explore-button"
              onClick={() => handleCtaClick(currentSlide?.secondaryCtaLink, handleScrollToStay)}
              className="w-[210px] xs:w-[225px] sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3.5 border border-[#FAF8F5]/80 hover:border-[#FAF8F5] text-[#FAF8F5] hover:bg-white/15 text-[10.5px] xs:text-[11px] sm:text-sm tracking-[0.16em] sm:tracking-[0.22em] uppercase font-semibold rounded transition-all duration-300 backdrop-blur-sm shadow-md active:scale-95 cursor-pointer text-center"
            >
              {exploreCta}
            </button>

            <button
              id="hero-book-button"
              onClick={() => handleCtaClick(currentSlide?.primaryCtaLink, handleScrollToItinerary)}
              className="w-[210px] xs:w-[225px] sm:w-auto px-4 sm:px-8 py-2.5 sm:py-3.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-[10.5px] xs:text-[11px] sm:text-sm tracking-[0.16em] sm:tracking-[0.22em] uppercase font-bold rounded transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer text-center"
            >
              {bookCta}
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Bar: Coordinates & Scroll Cue */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full pb-3 sm:pb-5 px-4 sm:px-6 md:px-12 flex items-center justify-between min-h-[40px] shrink-0"
      >
        {/* Left: Shortened location text with Google Maps link */}
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Open Zanzirangi House in Google Maps"
          className="hidden sm:flex items-center space-x-2 text-[11px] font-mono tracking-widest text-[#D8CCB8]/70 hover:text-[#FAF8F5] transition-colors uppercase z-10 cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#C4A27A] flex-shrink-0" />
          <span>Kizimkazi • Zanzibar</span>
        </a>

        {/* Center: Scroll to Discover */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-5 z-20 pointer-events-auto flex flex-col items-center space-y-2">
          <button
            onClick={handleScrollToStay}
            className="group flex flex-col items-center space-y-1 text-[#D8CCB8]/80 hover:text-[#FAF8F5] transition-colors focus:outline-none cursor-pointer"
            aria-label={scrollAriaLabels[currentLang] || scrollAriaLabels.en}
          >
            <span className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-light whitespace-nowrap">
              {t.hero.scrollIndicator || 'SCROLL TO DISCOVER'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce text-[#C4A27A]" />
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
