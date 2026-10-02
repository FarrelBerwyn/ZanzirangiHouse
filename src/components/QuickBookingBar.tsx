import React, { useState } from 'react';
import { Calendar, Users, Home, ArrowRight, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { VILLAS_DATA } from '../data/villas';
import { HomeSectionContent, cmsText } from '../data/homeSectionsCms';

interface QuickBookingBarProps {
  currentLang: Language;
  onCheckAvailability: (details: {
    checkIn: string;
    checkOut: string;
    guests: number;
    villaId: string;
  }) => void;
  cmsContent?: HomeSectionContent;
  villas?: { id: string; name: string; roomNumber?: string }[];
}

export const QuickBookingBar: React.FC<QuickBookingBarProps> = ({
  currentLang,
  onCheckAvailability,
  cmsContent,
  villas,
}) => {
  const t = TRANSLATIONS[currentLang];
  const villaOptions = villas && villas.length > 0 ? villas : VILLAS_DATA;
  const qb = {
    title: cmsText(cmsContent?.title, t.quickBooking.title || 'Plan Your Stay'),
    checkIn: cmsText(cmsContent?.checkInLabel, t.quickBooking.checkIn),
    checkOut: cmsText(cmsContent?.checkOutLabel, t.quickBooking.checkOut),
    guests: cmsText(cmsContent?.guestsLabel, t.quickBooking.guests),
    villaChoice: cmsText(cmsContent?.villaLabel, t.quickBooking.villaChoice),
    allVillas: cmsText(cmsContent?.allVillasLabel, t.quickBooking.allVillas),
    checkAvailability: cmsText(cmsContent?.buttonLabel, t.quickBooking.checkAvailability),
  };

  // Default dates: today + 14 days, checkout + 19 days
  const today = new Date();
  const defaultCheckIn = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const defaultCheckOut = new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(2);
  const [selectedVillaId, setSelectedVillaId] = useState('');
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckAvailability({
      checkIn,
      checkOut,
      guests,
      villaId: selectedVillaId,
    });
  };

  const selectedVillaObj = villaOptions.find((v) => v.id === selectedVillaId);

  const toggleLabels: Record<Language, { close: string; checkDates: string }> = {
    en: { close: 'Close', checkDates: 'Check Dates' },
    pl: { close: 'Zamknij', checkDates: 'Sprawdź Terminy' },
    ar: { close: 'إغلاق', checkDates: 'تحقق من التواريخ' },
    zh: { close: '收起', checkDates: '查看日期' },
    fr: { close: 'Fermer', checkDates: 'Vérifier les dates' },
    sw: { close: 'Funga', checkDates: 'Angalia Tarehe' },
    es: { close: 'Cerrar', checkDates: 'Consultar Fechas' },
    it: { close: 'Chiudi', checkDates: 'Verifica Date' },
  };
  const toggle = toggleLabels[currentLang] || toggleLabels.en;

  return (
    <section
      id="quick-booking"
      className="bg-[#FAF8F5] pt-10 sm:pt-14 md:pt-16 pb-4 sm:pb-6 relative z-20"
    >
      <div
        id="quick-booking-bar-wrapper"
        className="max-w-6xl mx-auto px-4 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl sm:rounded-xl shadow-2xl p-3.5 sm:p-6 backdrop-blur-xl transition-all duration-300"
        >
        {/* Mobile Format: Collapse / Expand Header Button */}
        <button
          type="button"
          id="mobile-quick-booking-toggle"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          aria-expanded={isMobileExpanded}
          className="sm:hidden w-full flex items-center justify-between p-1 focus:outline-none text-left cursor-pointer"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#B8966C]/20 border border-[#C4A27A]/40 flex items-center justify-center text-[#C4A27A] flex-shrink-0 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#C4A27A] font-semibold">
                {qb.title}
              </span>
              <span className="text-xs text-[#FAF8F5] font-medium truncate mt-0.5">
                {checkIn} → {checkOut} • {guests} {t.quickBooking.guestsCount}
              </span>
              {selectedVillaObj && (
                <span className="text-[10px] text-[#D8CCB8]/70 truncate">
                  {selectedVillaObj.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#B8966C]/20 border border-[#C4A27A]/40 rounded-xl text-xs font-semibold text-[#C4A27A] flex-shrink-0 ml-2 shadow-sm">
            <span>{isMobileExpanded ? toggle.close : toggle.checkDates}</span>
            <ChevronDown
              className={`w-4 h-4 transform transition-transform duration-300 ${
                isMobileExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {/* The Booking Form:
            On mobile: collapsible downwards when clicked (isMobileExpanded)
            On desktop/tablet (sm+): always visible in horizontal grid layout */}
        <form
          id="quick-booking-form"
          onSubmit={handleSubmit}
          className={`${
            isMobileExpanded ? 'block animate-fadeIn' : 'hidden'
          } sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center mt-3 pt-3 border-t border-[#2C2B28] sm:mt-0 sm:pt-0 sm:border-t-0`}
        >
          {/* Check-In */}
          <div className="relative border-b sm:border-b-0 sm:border-r border-[#2C2B28] pb-3 sm:pb-0 sm:pr-4">
            <label
              htmlFor="booking-check-in"
              className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-[#D8CCB8]/80 font-medium mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C4A27A]" />
              <span>{qb.checkIn}</span>
            </label>
            <input
              id="booking-check-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-transparent text-[#FAF8F5] text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
              required
            />
          </div>

          {/* Check-Out */}
          <div className="relative border-b sm:border-b-0 sm:border-r border-[#2C2B28] pb-3 sm:pb-0 sm:pr-4">
            <label
              htmlFor="booking-check-out"
              className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-[#D8CCB8]/80 font-medium mb-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C4A27A]" />
              <span>{qb.checkOut}</span>
            </label>
            <input
              id="booking-check-out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-[#FAF8F5] text-sm font-medium focus:outline-none cursor-pointer [color-scheme:dark]"
              required
            />
          </div>

          {/* Guests Count */}
          <div className="relative border-b sm:border-b-0 lg:border-r border-[#2C2B28] pb-3 sm:pb-0 sm:pr-4">
            <label
              htmlFor="booking-guests-count"
              className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-[#D8CCB8]/80 font-medium mb-1.5"
            >
              <Users className="w-3.5 h-3.5 text-[#C4A27A]" />
              <span>{qb.guests}</span>
            </label>
            <select
              id="booking-guests-count"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-[#FAF8F5] text-sm font-medium focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num} className="bg-[#1C1B1A] text-[#FAF8F5]">
                  {num} {t.quickBooking.guestsCount}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Villa (Optional Selection) */}
          <div className="relative border-b sm:border-b-0 lg:border-r border-[#2C2B28] pb-3 sm:pb-0 sm:pr-4">
            <label
              htmlFor="booking-villa-select"
              className="flex items-center space-x-1.5 text-[10px] tracking-[0.2em] uppercase text-[#D8CCB8]/80 font-medium mb-1.5"
            >
              <Home className="w-3.5 h-3.5 text-[#C4A27A]" />
              <span>{qb.villaChoice}</span>
            </label>
            <select
              id="booking-villa-select"
              value={selectedVillaId}
              onChange={(e) => setSelectedVillaId(e.target.value)}
              className="w-full bg-transparent text-[#FAF8F5] text-sm font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-[#1C1B1A] text-[#FAF8F5]">
                {qb.allVillas}
              </option>
              {villaOptions.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#1C1B1A] text-[#FAF8F5]">
                  {v.roomNumber ? `${v.roomNumber} - ` : ''}{v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-0">
            <button
              id="booking-submit-btn"
              type="submit"
              className="w-full py-3.5 px-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-semibold tracking-[0.16em] uppercase rounded flex items-center justify-center space-x-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              <span>{qb.checkAvailability}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
        </motion.div>
      </div>
    </section>
  );
};
