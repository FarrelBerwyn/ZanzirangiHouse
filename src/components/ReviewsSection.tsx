import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Review, Language } from '../types';
import { REVIEWS_UI_TRANSLATIONS, getLocalizedReviews } from '../data/reviewsTranslations';

interface ReviewsSectionProps {
  currentLang: Language;
  reviews?: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ currentLang, reviews: customReviews }) => {
  const ui = REVIEWS_UI_TRANSLATIONS[currentLang] || REVIEWS_UI_TRANSLATIONS.en;
  const reviews = getLocalizedReviews(currentLang, customReviews || undefined);
  const [activeIdx, setActiveIdx] = useState(0);

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  };

  const currentReview = reviews[activeIdx] || reviews[0];

  const ariaLabels: Record<Language, { prev: string; next: string }> = {
    en: { prev: 'Previous review', next: 'Next review' },
    pl: { prev: 'Poprzednia opinia', next: 'Następna opinia' },
    ar: { prev: 'التقييم السابق', next: 'التقييم التالي' },
    zh: { prev: '上一条评价', next: '下一条评价' },
    fr: { prev: 'Avis précédent', next: 'Avis suivant' },
    sw: { prev: 'Maoni yaliyotangulia', next: 'Maoni yanayofuata' },
    es: { prev: 'Opinión anterior', next: 'Opinión siguiente' },
    it: { prev: 'Recensione precedente', next: 'Recensione successiva' },
  };
  const currentAria = ariaLabels[currentLang] || ariaLabels.en;

  return (
    <section id="reviews" className="py-24 md:py-32 bg-[#F4EFE6] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E7DFD2]">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#A07E54] font-medium mb-3">
              <Quote className="w-3.5 h-3.5" />
              <span>{ui.eyebrow}</span>
            </div>
            <h2
              id="reviews-heading"
              className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#141413]"
            >
              {ui.heading}
            </h2>
            <p className="text-[#6B6862] text-sm sm:text-base mt-2 max-w-xl">
              {ui.subhead}
            </p>
          </div>

          {/* Sample Demo Badge */}
          <div className="mt-4 md:mt-0 flex items-center space-x-2 px-3 py-1.5 bg-[#E7DFD2] rounded text-[11px] font-mono uppercase tracking-wider text-[#73522E]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{ui.sampleNoticeTitle}</span>
          </div>
        </div>

        {/* Featured Testimonial Spotlight */}
        <div className="bg-[#FAF8F5] border border-[#E7DFD2] rounded-2xl p-8 sm:p-12 shadow-xl mb-12 relative overflow-hidden">
          <Quote className="absolute -top-6 -right-6 w-36 h-36 text-[#E7DFD2]/40 pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* 5 Stars */}
            <div className="flex items-center space-x-1 mb-6">
              {[...Array(currentReview.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#B8966C] text-[#B8966C]" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl text-[#141413] font-light leading-snug tracking-wide mb-8">
              "{currentReview.reviewText}"
            </blockquote>

            {/* Author details */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-base text-[#141413] flex items-center space-x-2">
                  <span>{currentReview.guestName}</span>
                  {currentReview.isDemoSample && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle className="w-3 h-3" />
                      <span>{ui.verifiedGuest}</span>
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#6B6862] tracking-wider mt-0.5">
                  {currentReview.country} • {currentReview.villaStayed}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full border border-[#E7DFD2] hover:bg-[#E7DFD2] text-[#141413] transition-colors cursor-pointer"
                  aria-label={currentAria.prev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full border border-[#E7DFD2] hover:bg-[#E7DFD2] text-[#141413] transition-colors cursor-pointer"
                  aria-label={currentAria.next}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Client Pitching Note */}
        <p className="text-center text-xs text-[#73522E] italic max-w-xl mx-auto">
          {ui.sampleNoticeBody}
        </p>
      </div>
    </section>
  );
};
