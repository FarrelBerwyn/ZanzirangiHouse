import { Language } from '../types';

// Built-in (non-CMS) copy for the Map, OTA and Final CTA homepage sections, per language.
// CMS values from Admin → Halaman Home → Konten Section override these when filled in.

export interface MapDefaultsText {
  eyebrow: string;
  badge: string;
  copyLabel: string;
  copiedLabel: string;
  travel: { label: string; value: string }[];
}

export const MAP_DEFAULTS_I18N: Record<Language, MapDefaultsText> = {
  en: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Bwejuu Beach • East Coast',
    copyLabel: 'Copy Exact Coordinates & Address',
    copiedLabel: 'Address Copied to Clipboard',
    travel: [
      { label: "Abeid Amani Karume Int'l Airport", value: '~1 hr 10 min (Private Chauffeur)' },
      { label: 'Stone Town UNESCO', value: '~1 hr 15 min (Scenic Drive)' },
      { label: 'Bwejuu Beach', value: 'Direct Oceanfront Access' },
    ],
  },
  pl: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Plaża Bwejuu • Wschodnie Wybrzeże',
    copyLabel: 'Kopiuj dokładne współrzędne i adres',
    copiedLabel: 'Adres skopiowany do schowka',
    travel: [
      { label: 'Lotnisko Abeid Amani Karume', value: '~1 godz. 10 min (prywatny szofer)' },
      { label: 'Stone Town (UNESCO)', value: '~1 godz. 15 min (malownicza trasa)' },
      { label: 'Plaża Bwejuu', value: 'Bezpośredni dostęp do oceanu' },
    ],
  },
  ar: {
    eyebrow: 'Zanzirangi House • بويجو',
    badge: 'شاطئ بويجو • الساحل الشرقي',
    copyLabel: 'نسخ الإحداثيات والعنوان بدقة',
    copiedLabel: 'تم نسخ العنوان',
    travel: [
      { label: 'مطار أبيد أماني كارومي الدولي', value: '~ ساعة و10 دقائق (سائق خاص)' },
      { label: 'المدينة الحجرية (اليونسكو)', value: '~ ساعة و15 دقيقة (طريق خلاب)' },
      { label: 'شاطئ بويجو', value: 'وصول مباشر إلى المحيط' },
    ],
  },
  zh: {
    eyebrow: 'Zanzirangi House • 布韦朱',
    badge: '布韦朱海滩 • 东海岸',
    copyLabel: '复制精确坐标与地址',
    copiedLabel: '地址已复制',
    travel: [
      { label: '阿贝德·阿马尼·卡鲁姆国际机场', value: '约1小时10分钟（专属司机）' },
      { label: '石头城（联合国教科文组织遗产）', value: '约1小时15分钟（风景路线）' },
      { label: '布韦朱海滩', value: '直通海滨' },
    ],
  },
  fr: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Plage de Bwejuu • Côte Est',
    copyLabel: "Copier les coordonnées exactes et l'adresse",
    copiedLabel: 'Adresse copiée',
    travel: [
      { label: 'Aéroport international Abeid Amani Karume', value: '~1 h 10 (chauffeur privé)' },
      { label: 'Stone Town (UNESCO)', value: '~1 h 15 (route panoramique)' },
      { label: 'Plage de Bwejuu', value: "Accès direct à l'océan" },
    ],
  },
  sw: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Ufukwe wa Bwejuu • Pwani ya Mashariki',
    copyLabel: 'Nakili Anwani na Viwianishi Kamili',
    copiedLabel: 'Anwani Imenakiliwa',
    travel: [
      { label: 'Uwanja wa Ndege wa Abeid Amani Karume', value: '~Saa 1 dk 10 (Dereva Binafsi)' },
      { label: 'Mji Mkongwe (UNESCO)', value: '~Saa 1 dk 15 (Njia ya Mandhari)' },
      { label: 'Ufukwe wa Bwejuu', value: 'Ufikiaji wa Moja kwa Moja wa Bahari' },
    ],
  },
  es: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Playa de Bwejuu • Costa Este',
    copyLabel: 'Copiar coordenadas exactas y dirección',
    copiedLabel: 'Dirección copiada',
    travel: [
      { label: 'Aeropuerto Internacional Abeid Amani Karume', value: '~1 h 10 min (chófer privado)' },
      { label: 'Stone Town (UNESCO)', value: '~1 h 15 min (ruta panorámica)' },
      { label: 'Playa de Bwejuu', value: 'Acceso directo al océano' },
    ],
  },
  it: {
    eyebrow: 'Zanzirangi House • Bwejuu',
    badge: 'Spiaggia di Bwejuu • Costa Est',
    copyLabel: 'Copia coordinate esatte e indirizzo',
    copiedLabel: 'Indirizzo copiato',
    travel: [
      { label: 'Aeroporto Internazionale Abeid Amani Karume', value: '~1 h 10 min (autista privato)' },
      { label: 'Stone Town (UNESCO)', value: '~1 h 15 min (percorso panoramico)' },
      { label: 'Spiaggia di Bwejuu', value: "Accesso diretto all'oceano" },
    ],
  },
};

export interface OtaDefaultsText {
  eyebrow: string;
  bannerTitle: string;
  bannerText: string;
  badge: string;
  /** Tags for the four default channels, in order: Booking.com, Trip.com, Agoda, Expedia */
  channelTags: [string, string, string, string];
}

export const OTA_DEFAULTS_I18N: Record<Language, OtaDefaultsText> = {
  en: {
    eyebrow: 'Global Distribution',
    bannerTitle: 'Direct Reservation Advantages',
    bannerText: 'Best Rate Guarantee • Complimentary Tropical Welcome Drink • Flexible Arrival Policy',
    badge: 'Book Direct Privilege',
    channelTags: ['Preferred Partner', 'Luxury Collection', 'VIP Selected', 'Boutique Partner'],
  },
  pl: {
    eyebrow: 'Globalna Dystrybucja',
    bannerTitle: 'Korzyści z Rezerwacji Bezpośredniej',
    bannerText: 'Gwarancja najlepszej ceny • Powitalny tropikalny napój gratis • Elastyczne godziny przyjazdu',
    badge: 'Przywilej Rezerwacji Bezpośredniej',
    channelTags: ['Preferowany Partner', 'Kolekcja Luksusowa', 'Wybór VIP', 'Partner Butikowy'],
  },
  ar: {
    eyebrow: 'التوزيع العالمي',
    bannerTitle: 'مزايا الحجز المباشر',
    bannerText: 'ضمان أفضل سعر • مشروب ترحيبي استوائي مجاني • سياسة وصول مرنة',
    badge: 'امتياز الحجز المباشر',
    channelTags: ['شريك مفضل', 'مجموعة فاخرة', 'اختيار كبار الشخصيات', 'شريك بوتيك'],
  },
  zh: {
    eyebrow: '全球分销渠道',
    bannerTitle: '官网直订专享礼遇',
    bannerText: '最优价格保证 • 免费热带迎宾饮品 • 灵活抵达安排',
    badge: '直订尊享',
    channelTags: ['优选合作伙伴', '奢华精选', 'VIP 精选', '精品合作伙伴'],
  },
  fr: {
    eyebrow: 'Distribution Mondiale',
    bannerTitle: 'Avantages de la Réservation Directe',
    bannerText: "Meilleur tarif garanti • Boisson tropicale de bienvenue offerte • Politique d'arrivée flexible",
    badge: 'Privilège Réservation Directe',
    channelTags: ['Partenaire Privilégié', 'Collection Luxe', 'Sélection VIP', 'Partenaire Boutique'],
  },
  sw: {
    eyebrow: 'Usambazaji wa Kimataifa',
    bannerTitle: 'Faida za Kuhifadhi Moja kwa Moja',
    bannerText: 'Dhamana ya Bei Bora • Kinywaji cha Kukaribisha Bure • Sera Rahisi ya Kuwasili',
    badge: 'Fursa ya Kuhifadhi Moja kwa Moja',
    channelTags: ['Mshirika Anayependelewa', 'Mkusanyiko wa Kifahari', 'Chaguo la VIP', 'Mshirika wa Boutique'],
  },
  es: {
    eyebrow: 'Distribución Global',
    bannerTitle: 'Ventajas de Reservar Directamente',
    bannerText: 'Garantía de mejor precio • Bebida tropical de bienvenida de cortesía • Política de llegada flexible',
    badge: 'Privilegio de Reserva Directa',
    channelTags: ['Socio Preferente', 'Colección de Lujo', 'Selección VIP', 'Socio Boutique'],
  },
  it: {
    eyebrow: 'Distribuzione Globale',
    bannerTitle: 'Vantaggi della Prenotazione Diretta',
    bannerText: 'Miglior tariffa garantita • Drink tropicale di benvenuto in omaggio • Arrivo flessibile',
    badge: 'Privilegio Prenotazione Diretta',
    channelTags: ['Partner Preferito', 'Collezione Lusso', 'Selezione VIP', 'Partner Boutique'],
  },
};

export const FINAL_CTA_EYEBROW_I18N: Record<Language, string> = {
  en: 'Private Sanctuary Awaits',
  pl: 'Czeka na Ciebie Prywatne Sanktuarium',
  ar: 'ملاذك الخاص بانتظارك',
  zh: '私享秘境，静候您的到来',
  fr: 'Votre Sanctuaire Privé Vous Attend',
  sw: 'Patakatifu Pako Binafsi Panakusubiri',
  es: 'Su Santuario Privado le Espera',
  it: 'Il Tuo Rifugio Privato Ti Aspetta',
};
