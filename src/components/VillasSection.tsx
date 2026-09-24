import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Users, Bed, ArrowRight, Waves, Check, Sparkles, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { Villa, Language } from '../types';
import { getLocalizedVillas } from '../data/villaTranslations';
import { TRANSLATIONS } from '../data/translations';
import { VILLA_CATEGORY_TRANSLATIONS } from '../data/villaCategoryTranslations';
import { ScrollReveal } from './ScrollReveal';

interface VillasSectionProps {
  currentLang: Language;
  onSelectVilla: (villa: Villa) => void;
  onRequestBooking: (villaId: string) => void;
}

export const VillasSection: React.FC<VillasSectionProps> = ({
  currentLang,
  onSelectVilla,
  onRequestBooking,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const categoryI18n = VILLA_CATEGORY_TRANSLATIONS[currentLang] || VILLA_CATEGORY_TRANSLATIONS.en;

  const [activeFilter, setActiveFilter] = useState<'all' | 'villas' | 'bungalows' | 'rooms'>('all');
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>('scroll');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Tab horizontal scroll state
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const allLocalizedVillas = getLocalizedVillas(currentLang);

  const filteredVillas = allLocalizedVillas.filter((v) => {
    if (activeFilter === 'villas') {
      return v.id === 'villa-01' || v.id === 'villa-03' || v.id === 'villa-06' || v.id === 'villa-08';
    }
    if (activeFilter === 'bungalows') {
      return v.id === 'villa-02' || v.id === 'villa-05';
    }
    if (activeFilter === 'rooms') {
      return v.id === 'villa-04' || v.id === 'villa-07';
    }
    return true;
  });

  const guestLabel = t.quickBooking?.guests || 'Guests';
  const perNightLabel = categoryI18n.ui.perNight || 'per night';
  const discoverLabel = categoryI18n.ui.viewDetails || 'Discover';
  const inquireLabel = categoryI18n.ui.inquireNow || 'Inquire';

  const currentCategoryOverview = categoryI18n.categories[activeFilter];

  // Update tabs horizontal scroll state
  const updateTabsScrollStatus = useCallback(() => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollTabsLeft(scrollLeft > 4);
    setCanScrollTabsRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(updateTabsScrollStatus, 80);
    const el = tabsScrollRef.current;
    if (!el) return () => clearTimeout(timeout);

    el.addEventListener('scroll', updateTabsScrollStatus, { passive: true });
    window.addEventListener('resize', updateTabsScrollStatus);

    // Mouse wheel horizontal scroll support
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      clearTimeout(timeout);
      el.removeEventListener('scroll', updateTabsScrollStatus);
      window.removeEventListener('resize', updateTabsScrollStatus);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [updateTabsScrollStatus, currentLang]);

  // Update cards scroll bounds and active slide index
  const updateScrollStatus = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);

    const firstChild = el.firstElementChild as HTMLElement;
    if (firstChild) {
      const cardWidth = firstChild.offsetWidth + 24; // card width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentSlideIndex(Math.min(index, filteredVillas.length - 1));
    }
  }, [filteredVillas.length]);

  // Recheck whenever activeFilter or viewMode changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setCurrentSlideIndex(0);
    const timeout = setTimeout(updateScrollStatus, 100);
    return () => clearTimeout(timeout);
  }, [activeFilter, viewMode, updateScrollStatus]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollStatus();
    el.addEventListener('scroll', updateScrollStatus, { passive: true });
    window.addEventListener('resize', updateScrollStatus);
    return () => {
      el.removeEventListener('scroll', updateScrollStatus);
      window.removeEventListener('resize', updateScrollStatus);
    };
  }, [updateScrollStatus]);

  const handleScrollLeft = () => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement;
    const step = firstChild ? firstChild.offsetWidth + 24 : 380;
    el.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement;
    const step = firstChild ? firstChild.offsetWidth + 24 : 380;
    el.scrollBy({ left: step, behavior: 'smooth' });
  };

  const scrollToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement;
    const step = firstChild ? firstChild.offsetWidth + 24 : 380;
    el.scrollTo({ left: idx * step, behavior: 'smooth' });
  };

  const filterTabs = [
    { key: 'all', label: categoryI18n.all, count: 8 },
    { key: 'villas', label: categoryI18n.villas, count: 4 },
    { key: 'bungalows', label: categoryI18n.bungalows, count: 2 },
    { key: 'rooms', label: categoryI18n.rooms, count: 2 },
  ];

  const handleTabSelect = (key: 'all' | 'villas' | 'bungalows' | 'rooms', e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveFilter(key);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  // Reusable Villa Card Component with robust alignment and no multi-line wrapping glitches
  const renderVillaCard = (villa: Villa, isScroll: boolean) => {
    const hasSeaView =
      villa.view.toLowerCase().includes('ocean') ||
      villa.view.toLowerCase().includes('sea') ||
      villa.view.toLowerCase().includes('lagoon') ||
      villa.view.toLowerCase().includes('mer') ||
      villa.view.toLowerCase().includes('bahari') ||
      villa.view.toLowerCase().includes('mar') ||
      villa.view.toLowerCase().includes('بحر') ||
      villa.view.toLowerCase().includes('海');

    // Clean metric size to prevent awkward multi-line wrapping in narrow columns
    const cleanSize = villa.size.split('(')[0].trim();

    return (
      <div
        key={villa.id}
        className={`${
          isScroll
            ? 'w-[310px] sm:w-[350px] md:w-[380px] lg:w-[400px] flex-shrink-0 snap-start'
            : 'w-full'
        } bg-[#FAF8F5] border border-[#E7DFD2] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col group h-full`}
      >
        {/* Card Image */}
        <div className="relative aspect-[16/11] overflow-hidden bg-[#E7DFD2]/40">
          <img
            src={villa.heroImage}
            alt={`${villa.name} - Luxury Private Plunge Pool Villa Zanzibar`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />

          {/* Room Number Badge */}
          <div className="absolute top-3.5 left-3.5 px-2.5 py-1 bg-[#141413]/85 backdrop-blur text-[#FAF8F5] text-[10px] font-mono tracking-widest uppercase rounded shadow-sm z-10 flex-shrink-0">
            {villa.roomNumber}
          </div>

          {/* Ocean/Sea View Badge with max-width to avoid overlapping the room number */}
          {hasSeaView && (
            <div
              className="absolute top-3.5 right-3.5 max-w-[55%] px-2.5 py-1 bg-cyan-950/85 backdrop-blur text-cyan-200 text-[10px] tracking-wider uppercase font-semibold rounded flex items-center space-x-1 shadow-sm z-10 truncate"
              title={villa.view}
            >
              <Waves className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{villa.view}</span>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/85 backdrop-blur text-[#FAF8F5] text-xs font-serif rounded shadow-sm">
            {villa.pricePerNight}{' '}
            <span className="text-[10px] font-sans text-[#D8CCB8]">
              / {perNightLabel}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
          <div>
            {/* Title with uniform height to avoid vertical shifting */}
            <div className="min-h-[54px] sm:min-h-[58px] flex items-start mb-1">
              <h4
                className="font-serif text-xl sm:text-2xl font-normal text-[#141413] tracking-wide group-hover:text-[#A07E54] transition-colors line-clamp-2"
                title={villa.name}
              >
                {villa.name}
              </h4>
            </div>

            {/* Type / Subtitle with uniform height */}
            <div className="min-h-[28px] sm:min-h-[30px] flex items-center mb-2">
              <p
                className="text-[10.5px] sm:text-[11px] tracking-wider uppercase text-[#6B6862] font-semibold line-clamp-2"
                title={villa.type}
              >
                {villa.type}
              </p>
            </div>

            {/* Short Description */}
            <div className="min-h-[44px] sm:min-h-[48px] mb-4">
              <p className="text-xs text-[#55524B] leading-relaxed line-clamp-2 font-light">
                {villa.shortDescription}
              </p>
            </div>
          </div>

          {/* Bottom Section: Specs & CTA Buttons */}
          <div className="pt-2">
            {/* Micro Specs: single line with whitespace-nowrap and truncate */}
            <div className="flex items-center justify-between text-[11px] text-[#6B6862] py-3 border-t border-[#E7DFD2] mb-4">
              <span className="flex items-center space-x-1.5 whitespace-nowrap flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-[#A07E54] flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {villa.capacity} {guestLabel}
                </span>
              </span>

              <span className="text-[#D8CCB8] select-none mx-1">•</span>

              <span
                className="flex items-center space-x-1.5 min-w-0 flex-1 px-1 truncate"
                title={villa.bed}
              >
                <Bed className="w-3.5 h-3.5 text-[#A07E54] flex-shrink-0" />
                <span className="truncate font-medium">{villa.bed}</span>
              </span>

              <span className="text-[#D8CCB8] select-none mx-1">•</span>

              <span
                className="whitespace-nowrap font-mono font-medium flex-shrink-0 text-right"
                title={villa.size}
              >
                {cleanSize}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectVilla(villa)}
                className="flex-[1.2] py-3 px-3 bg-[#1C1B1A] group-hover:bg-[#B8966C] text-[#FAF8F5] group-hover:text-[#141413] text-[11px] font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase rounded-lg flex items-center justify-center space-x-1.5 transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap min-w-0"
              >
                <span className="truncate">{discoverLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => onRequestBooking(villa.id)}
                className="flex-1 py-3 px-2.5 border border-[#B8966C] hover:bg-[#B8966C]/15 text-[#8E6B40] text-[11px] font-semibold tracking-[0.08em] sm:tracking-[0.12em] uppercase rounded-lg transition-colors text-center cursor-pointer whitespace-nowrap min-w-0 truncate"
                title={inquireLabel}
              >
                <span className="truncate">{inquireLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="stay" className="py-20 md:py-32 bg-[#F4EFE6] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 pb-6 border-b border-[#E7DFD2] gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#A07E54] font-semibold mb-3">
              <span className="w-5 h-[1px] bg-[#A07E54]" />
              <span>{t.villas?.featuredTag || 'Sanctuary Accommodations'}</span>
            </div>
            <h2
              id="villas-heading"
              className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#141413]"
            >
              {t.villas?.heading || 'STAY YOUR WAY'}
            </h2>
            <p className="text-[#6B6862] text-sm sm:text-base font-normal mt-2 leading-relaxed">
              {t.villas?.subhead ||
                'From oceanfront pool villas to peaceful garden bungalows, each sanctuary is sculpted with local materials, open cross-breezes, and discreet hospitality.'}
            </p>
          </div>

          {/* Filter Tabs with Horizontal Scroll & Right Gradient */}
          <div className="relative w-full lg:max-w-lg xl:max-w-xl self-end pt-2">
            {/* Left fade if scrolled */}
            <div
              className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F4EFE6] to-transparent z-10 transition-opacity duration-300 ${
                canScrollTabsLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Scrollable Tabs Track */}
            <div
              ref={tabsScrollRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1.5 px-1 pr-14"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={(e) => handleTabSelect(tab.key as any, e)}
                  className={`px-4 sm:px-5 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold rounded-full transition-all whitespace-nowrap flex-shrink-0 cursor-pointer flex items-center space-x-2 ${
                    activeFilter === tab.key
                      ? 'bg-[#1C1B1A] text-[#FAF8F5] shadow-lg scale-[1.02]'
                      : 'bg-[#E7DFD2]/70 text-[#3E3C38] hover:bg-[#E7DFD2] hover:text-[#141413]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                      activeFilter === tab.key
                        ? 'bg-[#B8966C] text-[#141413]'
                        : 'bg-black/10 text-[#6B6862]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Gradient Fade Overlay */}
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-0 w-14 sm:w-20 bg-gradient-to-l from-[#F4EFE6] via-[#F4EFE6]/90 to-transparent z-10 transition-opacity duration-300 ${
                canScrollTabsRight ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        </ScrollReveal>

        {/* Category Description Banner Card */}
        <motion.div
          key={`cat-banner-${activeFilter}-${currentLang}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 bg-[#FAF8F5] border border-[#E7DFD2] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#B8966C]/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#B8966C]/20 border border-[#B8966C]/40 text-[#8E6B40] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-mono font-semibold rounded-full mb-3">
                <Sparkles className="w-3 h-3 text-[#A07E54]" />
                <span>{currentCategoryOverview.tag}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#141413] tracking-wide mb-3">
                {currentCategoryOverview.title}
              </h3>
              <p className="text-sm sm:text-base text-[#55524B] leading-relaxed mb-6 font-light">
                {currentCategoryOverview.description}
              </p>

              {/* Highlights Pill Badges */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {currentCategoryOverview.highlights.map((highlight, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F4EFE6] border border-[#E7DFD2] rounded-lg text-xs text-[#2C2B28] font-medium"
                  >
                    <Check className="w-3.5 h-3.5 text-[#A07E54] flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Controls & View Mode Toggle */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 border-[#E7DFD2] pt-4 lg:pt-0">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#8E6B40] bg-[#F4EFE6] px-3.5 py-1.5 rounded-full border border-[#E7DFD2]">
                <span className="font-bold text-[#141413]">
                  {categoryI18n.ui.unitCount(filteredVillas.length)}
                </span>
              </div>

              {/* Horizontal Scroll Arrows & Toggle */}
              <div className="flex items-center space-x-2">
                {/* View Mode Toggle */}
                <div className="bg-[#E7DFD2]/60 p-1 rounded-full flex items-center space-x-1 border border-[#E7DFD2]">
                  <button
                    onClick={() => setViewMode('scroll')}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      viewMode === 'scroll'
                        ? 'bg-[#1C1B1A] text-[#FAF8F5] shadow'
                        : 'text-[#6B6862] hover:text-[#141413]'
                    }`}
                    title={categoryI18n.ui.viewCarousel}
                    aria-label={categoryI18n.ui.viewCarousel}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[#1C1B1A] text-[#FAF8F5] shadow'
                        : 'text-[#6B6862] hover:text-[#141413]'
                    }`}
                    title={categoryI18n.ui.viewGrid}
                    aria-label={categoryI18n.ui.viewGrid}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                {viewMode === 'scroll' && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={handleScrollLeft}
                      disabled={!canScrollLeft}
                      className="p-2.5 rounded-full border border-[#D8CCB8] bg-[#FAF8F5] hover:bg-[#1C1B1A] hover:text-[#FAF8F5] hover:border-[#1C1B1A] text-[#1C1B1A] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      aria-label={categoryI18n.ui.prev}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleScrollRight}
                      disabled={!canScrollRight}
                      className="p-2.5 rounded-full border border-[#D8CCB8] bg-[#FAF8F5] hover:bg-[#1C1B1A] hover:text-[#FAF8F5] hover:border-[#1C1B1A] text-[#1C1B1A] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      aria-label={categoryI18n.ui.next}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Accommodation Cards Container: Page Scroll Carousel or Grid */}
        <motion.div
          key={`cards-container-${activeFilter}-${viewMode}-${currentLang}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {viewMode === 'scroll' ? (
            /* Horizontal Page Scroll Carousel */
            <div className="relative">
              <div
                ref={scrollRef}
                className="flex gap-6 sm:gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-8 px-1 items-stretch"
                style={{ scrollPaddingLeft: '4px', scrollPaddingRight: '4px' }}
              >
                {filteredVillas.map((villa) => renderVillaCard(villa, true))}
              </div>

              {/* Slider Progress Indicator Dots & Counter */}
              <div className="flex items-center justify-between pt-2 px-2 border-t border-[#E7DFD2]/70">
                <div className="flex items-center space-x-2">
                  {filteredVillas.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIndex === idx
                          ? 'w-7 bg-[#1C1B1A]'
                          : 'w-2 bg-[#D8CCB8] hover:bg-[#8E6B40]'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="text-xs font-mono text-[#8E6B40]">
                  <span className="font-bold text-[#141413]">
                    {String(currentSlideIndex + 1).padStart(2, '0')}
                  </span>{' '}
                  / {String(filteredVillas.length).padStart(2, '0')}
                </div>
              </div>
            </div>
          ) : (
            /* Responsive Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 items-stretch">
              {filteredVillas.map((villa) => renderVillaCard(villa, false))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
