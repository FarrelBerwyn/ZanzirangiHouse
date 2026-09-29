import React, { useState } from 'react';
import { X, Users, Bed, Bath, Maximize2, Eye, Check, Calendar, ArrowRight, Utensils, MessageSquare } from 'lucide-react';
import { Villa, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { getLocalizedVilla } from '../data/villaTranslations';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { ScrollFadeContainer } from './ScrollFadeContainer';

interface VillaDetailModalProps {
  villa: Villa | null;
  currentLang: Language;
  onClose: () => void;
  onRequestBooking: (villaId: string) => void;
}

export const VillaDetailModal: React.FC<VillaDetailModalProps> = ({
  villa: rawVilla,
  currentLang,
  onClose,
  onRequestBooking,
}) => {
  if (!rawVilla) return null;

  // Ensure fully localized villa object
  const villa = getLocalizedVilla(rawVilla.id, currentLang) || rawVilla;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const allImages = villa.images && villa.images.length > 0 ? villa.images : [villa.heroImage];

  // Localized kitchen info
  const kitchenTranslations: Record<Language, { v8: string; v5: string; default: string }> = {
    en: {
      v8: 'Fully equipped chef prep kitchen for private in-villa banquets',
      v5: 'Private dining pergola with dedicated in-villa butler service',
      default: 'In-villa private dining service available (Kitchenette details coming soon)',
    },
    fr: {
      v8: 'Cuisine de préparation professionnelle équipée pour banquets privés en villa',
      v5: 'Pergola de repas privative avec service de majordome dédié en villa',
      default: 'Service de restauration privée en villa disponible sur demande',
    },
    sw: {
      v8: 'Jiko kamili la mpishi wa kitaalamu kwa ajili ya karamu binafsi za villani',
      v5: 'Banda binafsi la chakula lenye huduma ya mhudumu maalum wa villani',
      default: 'Huduma ya chakula binafsi villani inapatikana',
    },
    es: {
      v8: 'Cocina profesional totalmente equipada para banquetes privados en la villa',
      v5: 'Pérgola privada de comedor con servicio de mayordomo exclusivo en la villa',
      default: 'Servicio de comidas privadas en la villa disponible bajo petición',
    },
    it: {
      v8: 'Cucina professionale completamente attrezzata per banchetti privati in villa',
      v5: 'Pergola privata per cene all’aperto con servizio maggiordomo dedicato',
      default: 'Servizio di ristorazione privata in villa disponibile su richiesta',
    },
    pl: {
      v8: 'W pełni wyposażona kuchnia szefa kuchni na prywatne bankiety w willi',
      v5: 'Prywatna pergola jadalna z dedykowaną obsługą kamerdynera w willi',
      default: 'Dostępna prywatna obsługa gastronomiczna serwowana do willi',
    },
    ar: {
      v8: 'مطبخ طهي احترافي متكامل التجهيز لإعداد الولائم الخاصة داخل الفيلا',
      v5: 'عريشة طعام خاصة في الهواء الطلق مع خدمة نادل خاص داخل الفيلا',
      default: 'خدمة تقديم الوجبات الفاخرة الخاصة داخل الفيلا متوفرة عند الطلب',
    },
    zh: {
      v8: '配备专业主厨备餐厨房，专为别墅内私享星级宴请量身定制',
      v5: '私人户外景观用餐凉亭，配专属一对一管家全天候侍餐服务',
      default: '提供别墅内全套私属送餐与定制用餐服务',
    },
  };

  const currentKitchenDict = kitchenTranslations[currentLang] || kitchenTranslations.en;
  const kitchenInfo =
    villa.id === 'villa-08'
      ? currentKitchenDict.v8
      : villa.id === 'villa-05'
      ? currentKitchenDict.v5
      : currentKitchenDict.default;

  const perNightLabel = t.villas.perNight || 'per night';
  const guestLabel = t.quickBooking.guests || 'Guests';

  const modalLabels: Record<Language, { about: string; kitchenHeader: string; archHeader: string; directRate: string; inquiryText: string; whatsappText: string }> = {
    en: { about: 'About', kitchenHeader: 'Kitchen & Culinary Service', archHeader: 'Architectural Signature', directRate: 'Direct Rate', inquiryText: 'Inquire / Book', whatsappText: 'WhatsApp Inquiry' },
    fr: { about: 'À propos de', kitchenHeader: 'Cuisine & Service Culinaire', archHeader: 'Signature Architecturale', directRate: 'Tarif Direct', inquiryText: 'Demande / Réservation', whatsappText: 'Contact WhatsApp' },
    sw: { about: 'Kuhusu', kitchenHeader: 'Jiko na Huduma ya Chakula', archHeader: 'Ubora wa Usanifu', directRate: 'Bei ya Moja kwa Moja', inquiryText: 'Uliza / Weka Nafasi', whatsappText: 'Mawasiliano ya WhatsApp' },
    es: { about: 'Acerca de', kitchenHeader: 'Cocina y Servicio Gastronómico', archHeader: 'Firma Arquitectónica', directRate: 'Tarifa Directa', inquiryText: 'Consultar / Reservar', whatsappText: 'Consulta por WhatsApp' },
    it: { about: 'Informazioni su', kitchenHeader: 'Cucina & Servizio Gastronomico', archHeader: 'Firma Architettonica', directRate: 'Tariffa Diretta', inquiryText: 'Richiedi / Prenota', whatsappText: 'Richiesta WhatsApp' },
    pl: { about: 'O willi', kitchenHeader: 'Kuchnia i Serwis Gastronomiczny', archHeader: 'Kunszt Architektoniczny', directRate: 'Stawka Bezpośrednia', inquiryText: 'Zapytaj / Rezerwuj', whatsappText: 'Zapytanie WhatsApp' },
    ar: { about: 'نبذة عن', kitchenHeader: 'المطبخ والخدمة الفندقية للطهي', archHeader: 'البصمة المعمارية الفاخرة', directRate: 'السعر المباشر', inquiryText: 'طلب حجز / استفسار', whatsappText: 'استفسار عبر واتساب' },
    zh: { about: '探索', kitchenHeader: '厨房与专属餐饮服务', archHeader: '建筑特色与设计美学', directRate: '直订优惠房价', inquiryText: '咨询 / 立即预订', whatsappText: 'WhatsApp 咨询' },
  };

  const labels = modalLabels[currentLang] || modalLabels.en;

  const whatsappInquiryUrl = `https://wa.me/${PROPERTY_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hello Zanzirangi House Concierge, I am interested in reserving ${villa.name} (${villa.roomNumber}). Please provide current availability and rates.`
  )}`;

  return (
    <div
      id="villa-detail-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl bg-[#FAF8F5] text-[#1C1B1A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-[#E7DFD2]">
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#E7DFD2]">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 text-[10px] tracking-[0.2em] font-mono font-semibold bg-[#1C1B1A] text-[#FAF8F5] rounded">
              {villa.roomNumber}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide text-[#141413]">
              {villa.name}
            </h3>
          </div>

          <button
            id="close-villa-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#1C1B1A] transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Gallery View */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/5 shadow-inner">
              <img
                src={allImages[activeImageIndex]}
                alt={`${villa.name} view`}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/70 backdrop-blur-md text-[#FAF8F5] text-xs font-serif rounded">
                {villa.pricePerNight} <span className="text-[10px] text-[#D8CCB8] font-sans">/ {perNightLabel}</span>
              </div>
            </div>

            {/* Thumbnails with Dynamic Left & Right Gradient Fade */}
            {allImages.length > 1 && (
              <ScrollFadeContainer
                className="relative max-w-full overflow-hidden"
                scrollClassName="flex items-center space-x-3 overflow-x-auto pb-2 pr-14 sm:pr-16 no-scrollbar scroll-smooth"
                leftGradientClass="bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent"
                rightGradientClass="bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent"
                bottomOffset="bottom-2"
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#B8966C] scale-95 shadow-md'
                        : 'border-transparent opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${villa.name} photo preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </ScrollFadeContainer>
            )}
          </div>

          {/* Quick Specifications Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-5 border-y border-[#E7DFD2] text-xs">
            <div className="flex items-center space-x-2.5">
              <Users className="w-4 h-4 text-[#A07E54]" />
              <div>
                <p className="text-[10px] uppercase text-[#6B6862] tracking-wider">{t.villas.maxGuests || 'Capacity'}</p>
                <p className="font-semibold text-[#141413]">{villa.capacity || (villa as any).maxGuests || 2} {guestLabel}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Bed className="w-4 h-4 text-[#A07E54]" />
              <div>
                <p className="text-[10px] uppercase text-[#6B6862] tracking-wider">{t.villas.bed || 'Bed'}</p>
                <p className="font-semibold text-[#141413] truncate">{villa.bed || 'King Bed'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Bath className="w-4 h-4 text-[#A07E54]" />
              <div>
                <p className="text-[10px] uppercase text-[#6B6862] tracking-wider">{t.villas.bath || 'Bathroom'}</p>
                <p className="font-semibold text-[#141413]">{villa.bathroom || 'En-suite'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <Maximize2 className="w-4 h-4 text-[#A07E54]" />
              <div>
                <p className="text-[10px] uppercase text-[#6B6862] tracking-wider">{t.villas.size || 'Size'}</p>
                <p className="font-semibold text-[#141413]">{villa.size || ((villa as any).sizeSqm ? `${(villa as any).sizeSqm} m²` : '85 m²')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 col-span-2 sm:col-span-1">
              <Eye className="w-4 h-4 text-[#A07E54]" />
              <div>
                <p className="text-[10px] uppercase text-[#6B6862] tracking-wider">{t.villas.view || 'View'}</p>
                <p className="font-semibold text-[#141413] truncate">{villa.view || 'Ocean View'}</p>
              </div>
            </div>
          </div>

          {/* Kitchen / Dining Capability */}
          <div className="p-4 bg-[#F4EFE6] border border-[#E7DFD2] rounded-xl flex items-start space-x-3 text-xs text-[#2C2B28]">
            <Utensils className="w-4 h-4 text-[#A07E54] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="tracking-wider uppercase text-[10px] block text-[#A07E54] mb-0.5">
                {labels.kitchenHeader}
              </strong>
              <span>{kitchenInfo}</span>
            </div>
          </div>

          {/* Description & Architecture */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg tracking-wide uppercase text-[#141413]">
              {labels.about} {villa.name}
            </h4>
            <p className="text-[#3E3C38] leading-relaxed text-sm sm:text-base">
              {villa.description}
            </p>

            {villa.architecturalFeature && (
              <div className="p-4 bg-[#FAF8F5] border-l-2 border-[#B8966C] rounded-r text-xs text-[#2C2B28] shadow-sm">
                <strong className="tracking-wider uppercase text-[10px] block text-[#A07E54] mb-1">
                  {labels.archHeader}
                </strong>
                {villa.architecturalFeature}
              </div>
            )}
          </div>

          {/* Amenities Grid */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg tracking-wide uppercase text-[#141413]">
              {t.villas.amenities || 'Sanctuary Amenities'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {villa.amenities.map((item, i) => (
                <div key={i} className="flex items-center space-x-2 text-xs text-[#3E3C38]">
                  <span className="w-4 h-4 rounded-full bg-[#B8966C]/20 text-[#A07E54] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[#FAF8F5] border-t border-[#E7DFD2] gap-4">
          <div>
            <span className="text-[10px] tracking-wider uppercase text-[#6B6862] block">
              {labels.directRate}
            </span>
            <span className="font-serif text-2xl font-semibold text-[#141413]">
              {villa.pricePerNight}
              <span className="text-xs font-sans text-[#6B6862] ml-1 font-normal">
                / {perNightLabel}
              </span>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-3 border border-emerald-600/50 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-wider uppercase rounded flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>{labels.whatsappText}</span>
            </a>

            <button
              id="modal-request-booking-btn"
              onClick={() => {
                onClose();
                onRequestBooking(villa.id);
              }}
              className="flex-1 sm:flex-initial px-6 py-3 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-semibold tracking-[0.18em] uppercase rounded flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>{labels.inquiryText}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
