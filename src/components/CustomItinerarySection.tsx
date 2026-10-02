import React, { useState } from 'react';
import { Calendar, CheckSquare, Square, MessageSquare, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { Language } from '../types';
import {
  getLocalizedSampleItinerary,
  ITINERARY_UI_TRANSLATIONS,
} from '../data/itineraryTranslations';
import { ScrollFadeContainer } from './ScrollFadeContainer';
import { HomeSectionContent, cmsList, cmsText } from '../data/homeSectionsCms';

interface CustomItinerarySectionProps {
  currentLang: Language;
  onOpenSupportChat?: (query?: string) => void;
  cmsContent?: HomeSectionContent;
}

export const CustomItinerarySection: React.FC<CustomItinerarySectionProps> = ({
  currentLang,
  onOpenSupportChat,
  cmsContent,
}) => {
  const baseUi = ITINERARY_UI_TRANSLATIONS[currentLang] || ITINERARY_UI_TRANSLATIONS.en;
  const ui = {
    ...baseUi,
    eyebrow: cmsText(cmsContent?.eyebrow, baseUi.eyebrow),
    heading: cmsText(cmsContent?.heading, baseUi.heading),
    badge: cmsText(cmsContent?.badge, baseUi.badge),
    subhead: cmsText(cmsContent?.subhead, baseUi.subhead),
    customizeCta: cmsText(cmsContent?.customizeCta, baseUi.customizeCta),
  };
  const builtInItinerary = getLocalizedSampleItinerary(currentLang);
  const itinerary = cmsList<any>(cmsContent?.days, builtInItinerary).map((day, dayIdx) => {
    const builtInDay = builtInItinerary[dayIdx] || builtInItinerary[0];
    return {
      ...builtInDay,
      dayNumber: cmsText(day.dayNumber, builtInDay?.dayNumber || `DAY ${String(dayIdx + 1).padStart(2, '0')}`),
      dayTitle: cmsText(day.dayTitle, builtInDay?.dayTitle || ''),
      location: cmsText(day.location, builtInDay?.location || ''),
      activities: cmsList<any>(day.activities, builtInDay?.activities || []).map((act, actIdx) => ({
        ...act,
        id: act.id || `act-${dayIdx + 1}-${actIdx + 1}`,
        time: act.time || '',
        title: act.title || '',
        description: act.description || '',
      })),
    };
  });

  // Initialize with all activity IDs selected
  const allInitialIds = itinerary.flatMap((day) => day.activities.map((a) => a.id));
  const [selectedIds, setSelectedIds] = useState<string[]>(allInitialIds);
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);

  const toggleActivity = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(allInitialIds);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const activeDay = itinerary[activeDayIdx] || itinerary[0];

  const toggleAriaPrefixes: Record<Language, string> = {
    en: 'Toggle',
    pl: 'Przełącz',
    ar: 'تبديل',
    zh: '切换',
    fr: 'Basculer',
    sw: 'Badilisha',
    es: 'Alternar',
    it: 'Attiva/Disattiva',
  };
  const togglePrefix = toggleAriaPrefixes[currentLang] || toggleAriaPrefixes.en;

  const handleRequestItinerary = () => {
    const prompt = `${ui.whatsappGreeting}\n- ${selectedIds.length} ${ui.selectedCount}\n${ui.whatsappClosing}`;
    if (onOpenSupportChat) {
      onOpenSupportChat(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('open-customer-support', { detail: { query: prompt } }));
    }
  };

  return (
    <section id="itinerary" className="py-24 md:py-36 bg-[#FAF8F5] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2.5 text-[11px] tracking-[0.32em] uppercase text-[#A07E54] font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>{ui.eyebrow}</span>
          </div>

          <h2
            id="itinerary-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#141413] mb-4"
          >
            {ui.heading}
          </h2>

          <p className="font-serif italic text-xl sm:text-2xl text-[#8E6B40] font-light mb-4">
            "{ui.badge}"
          </p>

          <p className="text-sm md:text-base text-[#6B6862] leading-relaxed max-w-2xl mx-auto">
            {ui.subhead}
          </p>
        </div>

        {/* Day Selector Navigation Tabs with Dynamic Left & Right Gradient Fade */}
        <ScrollFadeContainer
          className="relative max-w-full overflow-hidden mb-10"
          scrollClassName="flex items-center justify-start md:justify-center space-x-2 sm:space-x-3 overflow-x-auto pb-4 pr-14 sm:pr-16 no-scrollbar scroll-smooth"
          leftGradientClass="bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent"
          rightGradientClass="bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent"
          bottomOffset="bottom-4"
        >
          {itinerary.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIdx(idx)}
              className={`px-5 py-3 rounded-xl transition-all duration-300 flex flex-col items-center flex-shrink-0 text-left md:text-center cursor-pointer ${
                activeDayIdx === idx
                  ? 'bg-[#1C1B1A] text-[#FAF8F5] shadow-xl'
                  : 'bg-[#F4EFE6] text-[#6B6862] hover:bg-[#E7DFD2]'
              }`}
            >
              <span className="text-[11px] font-mono tracking-widest font-semibold uppercase block">
                {day.dayNumber}
              </span>
              <span className="font-serif text-sm truncate max-w-[140px] block mt-0.5">
                {day.dayTitle.split(' ')[0]}
              </span>
            </button>
          ))}
        </ScrollFadeContainer>

        {/* Active Day Content Box */}
        <div className="bg-[#F4EFE6] border border-[#E7DFD2] rounded-3xl p-6 sm:p-10 mb-12 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#E7DFD2] gap-3">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#A07E54] uppercase block">
                {activeDay.dayNumber} • {activeDay.location}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#141413] font-light mt-1">
                {activeDay.dayTitle}
              </h3>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <button
                onClick={handleSelectAll}
                className="text-[#A07E54] hover:underline cursor-pointer"
              >
                {ui.selectAllBtn}
              </button>
              <span>•</span>
              <button
                onClick={handleClearAll}
                className="text-[#6B6862] hover:underline cursor-pointer"
              >
                {ui.clearAllBtn}
              </button>
            </div>
          </div>

          {/* Activities Checklist */}
          <div className="space-y-4">
            {activeDay.activities.map((act) => {
              const isChecked = selectedIds.includes(act.id);
              return (
                <div
                  key={act.id}
                  onClick={() => toggleActivity(act.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-4 ${
                    isChecked
                      ? 'bg-[#FAF8F5] border-[#B8966C] shadow-sm'
                      : 'bg-white/40 border-transparent hover:bg-white/70'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-1 text-[#A07E54] flex-shrink-0 focus:outline-none"
                    aria-label={`${togglePrefix} ${act.title}`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 fill-[#B8966C] text-[#FAF8F5]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#8E6B40]/40" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-[#A07E54] mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{act.time}</span>
                    </div>
                    <h4 className="font-serif text-lg text-[#141413] mb-1 font-normal">
                      {act.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Itinerary Request Banner */}
        <div className="bg-[#1C1B1A] text-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#2C2B28] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase text-[#C4A27A]">
              <Sparkles className="w-3 h-3" />
              <span>{selectedIds.length} {ui.selectedCount}</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-light">
              {ui.heading}
            </h3>
            <p className="text-xs sm:text-sm text-[#D8CCB8]">
              {ui.subhead}
            </p>
          </div>

          <button
            onClick={handleRequestItinerary}
            className="w-full md:w-auto px-9 py-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-[0.2em] uppercase rounded-full flex items-center justify-center space-x-2.5 transition-all shadow-xl active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{ui.customizeCta}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
