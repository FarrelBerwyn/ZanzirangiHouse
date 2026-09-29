import React, { useState } from 'react';
import { X, Calendar, Users, Home, CheckCircle2, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { getLocalizedVillas, getLocalizedVilla } from '../data/villaTranslations';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { TRANSLATIONS } from '../data/translations';

interface BookingModalProps {
  isOpen: boolean;
  initialVillaId?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  currentLang: Language;
  onClose: () => void;
  onOpenSupportChat?: (query?: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialVillaId,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  currentLang,
  onClose,
  onOpenSupportChat,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const localizedVillas = getLocalizedVillas(currentLang);

  const today = new Date();
  const defaultCheckIn =
    initialCheckIn ||
    new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const defaultCheckOut =
    initialCheckOut ||
    new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [selectedVillaId, setSelectedVillaId] = useState(initialVillaId || localizedVillas[0].id);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(initialGuests || 2);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [airportTransfer, setAirportTransfer] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const chosenVilla =
    getLocalizedVilla(selectedVillaId, currentLang) || localizedVillas[0];

  const guestUnit = t.quickBooking.guests || 'Guests';

  const modalCustomLabels: Record<
    Language,
    {
      chatSupport: string;
      noPaymentNote: string;
      accommodationLabel: string;
      datesLabel: string;
      partySizeLabel: string;
      guestLabel: string;
      namePlaceholder: string;
      emailPlaceholder: string;
      phonePlaceholder: string;
      countryPlaceholder: string;
      specialRequestsPlaceholder: string;
      supportPrompt: (villaName: string, checkIn: string, checkOut: string, guests: number) => string;
      closeModalAria: string;
    }
  > = {
    en: {
      chatSupport: 'Chat with Customer Support',
      noPaymentNote: 'No payment required now • 100% Secure',
      accommodationLabel: 'Accommodation:',
      datesLabel: 'Dates:',
      partySizeLabel: 'Party Size:',
      guestLabel: 'Guest:',
      namePlaceholder: 'e.g. Eleanor Vance',
      emailPlaceholder: 'e.g. eleanor@residence.com',
      phonePlaceholder: '+44 7911 123456',
      countryPlaceholder: 'e.g. United Kingdom',
      specialRequestsPlaceholder: 'Dietary requirements, honeymoon setup, late arrival notes...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Hello Zanzirangi Customer Support, I just submitted a reservation inquiry for ${v} (${inDate} to ${outDate}, ${g} guests). Could you please check availability and details?`,
      closeModalAria: 'Close modal',
    },
    fr: {
      chatSupport: 'Discuter avec le Service Client',
      noPaymentNote: 'Aucun paiement requis maintenant • 100% Sécurisé',
      accommodationLabel: 'Hébergement :',
      datesLabel: 'Dates :',
      partySizeLabel: 'Nombre de Voyageurs :',
      guestLabel: 'Client :',
      namePlaceholder: 'ex. Éléonore Vance',
      emailPlaceholder: 'ex. eleonore@domaine.fr',
      phonePlaceholder: '+33 6 12 34 56 78',
      countryPlaceholder: 'ex. France',
      specialRequestsPlaceholder: 'Régimes alimentaires particuliers, lune de miel, arrivée tardive...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Bonjour le Service Client Zanzirangi, je viens de soumettre une demande de réservation pour ${v} (du ${inDate} au ${outDate}, ${g} personnes). Pourriez-vous confirmer la disponibilité ?`,
      closeModalAria: 'Fermer la boîte de dialogue',
    },
    sw: {
      chatSupport: 'Ongea na Huduma kwa Wateja',
      noPaymentNote: 'Hakuna malipo yanayohitajika sasa • 100% Salama',
      accommodationLabel: 'Chumba / Villa:',
      datesLabel: 'Tarehe:',
      partySizeLabel: 'Idadi ya Wageni:',
      guestLabel: 'Mgeni:',
      namePlaceholder: 'mf. Juma Bakari',
      emailPlaceholder: 'mf. juma@residence.com',
      phonePlaceholder: '+255 777 123 456',
      countryPlaceholder: 'mf. Tanzania',
      specialRequestsPlaceholder: 'Chakula maalum, maadhimisho ya fungate, taarifa za kuchelewa kufika...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Jambo Huduma kwa Wateja Zanzirangi, nimetuma ombi la kuweka nafasi ya ${v} (kuanzia ${inDate} hadi ${outDate}, wageni ${g}). Tafadhali naomba kuthibitisha nafasi na maelezo?`,
      closeModalAria: 'Funga dirisha',
    },
    es: {
      chatSupport: 'Hablar con Atención al Huésped',
      noPaymentNote: 'Sin pago requerido ahora • 100% Seguro',
      accommodationLabel: 'Alojamiento:',
      datesLabel: 'Fechas:',
      partySizeLabel: 'Número de Huéspedes:',
      guestLabel: 'Huésped:',
      namePlaceholder: 'ej. Elena Varela',
      emailPlaceholder: 'ej. elena@residencia.es',
      phonePlaceholder: '+34 612 345 678',
      countryPlaceholder: 'ej. España',
      specialRequestsPlaceholder: 'Preferencias dietéticas, detalles para luna de miel, hora prevista de llegada...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Hola Atención al Huésped Zanzirangi, acabo de enviar una solicitud de reserva para ${v} (del ${inDate} al ${outDate}, ${g} huéspedes). ¿Podrían confirmar disponibilidad y detalles?`,
      closeModalAria: 'Cerrar ventana',
    },
    it: {
      chatSupport: 'Parla con l’Assistenza Ospiti',
      noPaymentNote: 'Nessun pagamento richiesto ora • 100% Sicuro',
      accommodationLabel: 'Alloggio:',
      datesLabel: 'Date:',
      partySizeLabel: 'Numero di Ospiti:',
      guestLabel: 'Ospite:',
      namePlaceholder: 'es. Eleonora Rossi',
      emailPlaceholder: 'es. eleonora@residenza.it',
      phonePlaceholder: '+39 333 1234567',
      countryPlaceholder: 'es. Italia',
      specialRequestsPlaceholder: 'Esigenze alimentari, allestimento luna di miele, arrivo tardivo...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Buongiorno Assistenza Zanzirangi, ho appena inviato una richiesta di prenotazione per ${v} (dal ${inDate} al ${outDate}, ${g} ospiti). Potreste confermare disponibilità e dettagli?`,
      closeModalAria: 'Chiudi finestra',
    },
    pl: {
      chatSupport: 'Czat z Obsługą Klienta',
      noPaymentNote: 'Płatność nie jest teraz wymagana • 100% Bezpieczeństwa',
      accommodationLabel: 'Zakwaterowanie:',
      datesLabel: 'Termin:',
      partySizeLabel: 'Liczba Gości:',
      guestLabel: 'Gość:',
      namePlaceholder: 'np. Eleonora Nowak',
      emailPlaceholder: 'np. eleonora@rezydencja.pl',
      phonePlaceholder: '+48 601 234 567',
      countryPlaceholder: 'np. Polska',
      specialRequestsPlaceholder: 'Wymogi dietetyczne, pakiet dla nowożeńców, późniejszy przyjazd...',
      supportPrompt: (v, inDate, outDate, g) =>
        `Dzień dobry Obsługo Zanzirangi, właśnie przesłałem zapytanie o rezerwację willi ${v} (${inDate} do ${outDate}, liczba gości: ${g}). Czy mogliby Państwo sprawdzić dostępność?`,
      closeModalAria: 'Zamknij okno',
    },
    ar: {
      chatSupport: 'التحدث مع خدمة العملاء والكونسيرج',
      noPaymentNote: 'لا يُطلب دفع أي مبالغ الآن • حجز آمن 100%',
      accommodationLabel: 'مكان الإقامة:',
      datesLabel: 'التواريخ:',
      partySizeLabel: 'عدد الضيوف:',
      guestLabel: 'اسم الضيف:',
      namePlaceholder: 'مثال: نورة السعيد',
      emailPlaceholder: 'مثال: noura@example.com',
      phonePlaceholder: '+966 50 123 4567',
      countryPlaceholder: 'مثال: المملكة العربية السعودية',
      specialRequestsPlaceholder: 'المتطلبات الغذائية، باقة شهر العسل، موعد الوصول المتأخر...',
      supportPrompt: (v, inDate, outDate, g) =>
        `مرحباً خدمة عملاء زنجيرانجي، لقد قمت للتو بتقديم طلب استفسار حجز لـ ${v} (من ${inDate} إلى ${outDate}، لعدد ${g} ضيوف). هل يمكنكم تأكيد التوفر والتفاصيل؟`,
      closeModalAria: 'إغلاق النافذة',
    },
    zh: {
      chatSupport: '在线咨询专属客户管家',
      noPaymentNote: '现阶段无需预先扣款 • 100% 官方直订安全保障',
      accommodationLabel: '预订下榻房型：',
      datesLabel: '入住与离店日期：',
      partySizeLabel: '入住人数：',
      guestLabel: '预订贵宾：',
      namePlaceholder: '例如：王小明',
      emailPlaceholder: '例如：xiaoming@residence.com',
      phonePlaceholder: '+86 138 0000 0000',
      countryPlaceholder: '例如：中国',
      specialRequestsPlaceholder: '特殊饮食习惯、蜜月浪漫布置安排、预计晚抵时间...',
      supportPrompt: (v, inDate, outDate, g) =>
        `您好，Zanzirangi 专属管家！我刚刚提交了 ${v} 的预订咨询意向（日期：${inDate} 至 ${outDate}，共 ${g} 位贵宾）。请协助核实空房与专属礼遇细节。`,
      closeModalAria: '关闭窗口',
    },
  };

  const customUi = modalCustomLabels[currentLang] || modalCustomLabels.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div
      id="booking-inquiry-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-[#FAF8F5] text-[#1C1B1A] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 bg-[#FAF8F5] border-b border-[#E7DFD2]">
          <div>
            <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-[#A07E54] block">
              {PROPERTY_CONFIG.name} Concierge
            </span>
            <h3 className="font-serif text-2xl font-light text-[#141413] tracking-wide">
              {t.bookingModal.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-[#1C1B1A] transition-colors cursor-pointer"
            aria-label={customUi.closeModalAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          {isSuccess ? (
            <div className="text-center py-10 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="font-serif text-2xl text-[#141413]">
                  {t.bookingModal.successTitle}
                </h4>
                <p className="text-sm text-[#55524B] max-w-md mx-auto leading-relaxed">
                  {t.bookingModal.successMessage}
                </p>
              </div>

              {/* Inquiry Summary Pill */}
              <div className="bg-[#F4EFE6] border border-[#E7DFD2] p-5 rounded-lg max-w-md mx-auto text-left text-xs space-y-1.5 font-mono">
                <p>
                  <strong className="text-[#A07E54]">{customUi.accommodationLabel}</strong> {chosenVilla.name} ({chosenVilla.roomNumber})
                </p>
                <p>
                  <strong className="text-[#A07E54]">{customUi.datesLabel}</strong> {checkIn} → {checkOut}
                </p>
                <p>
                  <strong className="text-[#A07E54]">{customUi.partySizeLabel}</strong> {guests} {guestUnit}
                </p>
                <p>
                  <strong className="text-[#A07E54]">{customUi.guestLabel}</strong> {fullName} ({email})
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    const prompt = customUi.supportPrompt(chosenVilla.name, checkIn, checkOut, guests);
                    const bookingCtx = {
                      bookingId: `bk_${Date.now()}`,
                      villaId: chosenVilla.id,
                      villaName: chosenVilla.name,
                      roomNumber: chosenVilla.roomNumber,
                      checkIn,
                      checkOut,
                      guests,
                      fullName,
                      email,
                      phone,
                      country,
                      specialRequests,
                      airportTransfer,
                    };
                    if (onOpenSupportChat) {
                      onOpenSupportChat(prompt);
                    }
                    window.dispatchEvent(
                      new CustomEvent('open-customer-support', {
                        detail: { query: prompt, bookingContext: bookingCtx },
                      })
                    );
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-wider uppercase rounded flex items-center justify-center space-x-2 transition-all shadow cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{customUi.chatSupport}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 border border-[#1C1B1A]/30 hover:bg-[#1C1B1A] hover:text-[#FAF8F5] text-[#1C1B1A] text-xs font-semibold tracking-wider uppercase rounded transition-all cursor-pointer"
                >
                  {t.bookingModal.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-[#6B6862] leading-relaxed">
                {t.bookingModal.subtitle}
              </p>

              {/* Accommodation & Dates Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A07E54] border-b border-[#E7DFD2] pb-1.5 flex items-center space-x-1.5">
                  <span>01.</span>
                  <span>{t.bookingModal.step1}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preferred Villa */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="modal-villa-select"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.bookingModal.selectedVilla}
                    </label>
                    <select
                      id="modal-villa-select"
                      value={selectedVillaId}
                      onChange={(e) => setSelectedVillaId(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                    >
                      {localizedVillas.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.roomNumber} - {v.name} ({v.type}) • {v.pricePerNight}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div>
                    <label
                      htmlFor="modal-checkin-date"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.quickBooking.checkIn}
                    </label>
                    <input
                      id="modal-checkin-date"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-checkout-date"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.quickBooking.checkOut}
                    </label>
                    <input
                      id="modal-checkout-date"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label
                      htmlFor="modal-guests-count"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.quickBooking.guests}
                    </label>
                    <select
                      id="modal-guests-count"
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>
                          {num} {guestUnit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Guest Details Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-[#A07E54] border-b border-[#E7DFD2] pb-1.5 flex items-center space-x-1.5">
                  <span>02.</span>
                  <span>{t.bookingModal.step2}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="modal-guest-name"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.bookingModal.guestName} *
                    </label>
                    <input
                      id="modal-guest-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={customUi.namePlaceholder}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-guest-email"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.bookingModal.guestEmail} *
                    </label>
                    <input
                      id="modal-guest-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={customUi.emailPlaceholder}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-guest-phone"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.bookingModal.guestPhone}
                    </label>
                    <input
                      id="modal-guest-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={customUi.phonePlaceholder}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="modal-guest-country"
                      className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                    >
                      {t.bookingModal.country}
                    </label>
                    <input
                      id="modal-guest-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={customUi.countryPlaceholder}
                      className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                    />
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label
                    htmlFor="modal-special-requests"
                    className="block text-[11px] uppercase tracking-wider text-[#6B6862] font-medium mb-1"
                  >
                    {t.bookingModal.specialRequests}
                  </label>
                  <textarea
                    id="modal-special-requests"
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder={customUi.specialRequestsPlaceholder}
                    className="w-full bg-[#FAF8F5] border border-[#E7DFD2] rounded p-2.5 text-sm text-[#141413] focus:outline-none focus:border-[#B8966C]"
                  />
                </div>

                {/* Airport transfer checkbox */}
                <label
                  htmlFor="modal-airport-transfer"
                  className="flex items-center space-x-2.5 text-xs text-[#2C2B28] cursor-pointer pt-1"
                >
                  <input
                    id="modal-airport-transfer"
                    type="checkbox"
                    checked={airportTransfer}
                    onChange={(e) => setAirportTransfer(e.target.checked)}
                    className="w-4 h-4 text-[#B8966C] rounded border-[#E7DFD2] focus:ring-[#B8966C]"
                  />
                  <span>{t.bookingModal.airportTransfer}</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#E7DFD2] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-1.5 text-xs text-[#6B6862]">
                  <ShieldCheck className="w-4 h-4 text-[#A07E54]" />
                  <span>{customUi.noPaymentNote}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#B8966C] hover:bg-[#C4A27A] disabled:opacity-50 text-[#141413] text-xs font-semibold tracking-[0.2em] uppercase rounded flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>
                    {isSubmitting ? t.bookingModal.submitting : t.bookingModal.submitRequest}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
