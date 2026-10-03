import { supportRepository } from '../database/repositories/supportRepository.ts';
import {
  SupportAiDecision,
  SupportActionMetadata,
} from '../database/supportTypes.ts';

export type SupportedLang = 'en' | 'fr' | 'sw' | 'es' | 'it' | 'ar' | 'zh' | 'pl' | 'id';

export interface AiEvaluationResult {
  replyText: string;
  action?: SupportActionMetadata;
  intent: string;
  confidence: number;
  knowledge_source: string;
  decision: SupportAiDecision;
  handoffReason?: string;
}

export function resolveLang(lang?: string): SupportedLang {
  if (!lang) return 'en';
  const clean = lang.trim().toLowerCase().slice(0, 2);
  const supported: SupportedLang[] = ['en', 'fr', 'sw', 'es', 'it', 'ar', 'zh', 'pl', 'id'];
  return supported.includes(clean as SupportedLang) ? (clean as SupportedLang) : 'en';
}

export function getLocalized<T>(dict: Record<SupportedLang, T>, lang: SupportedLang): T {
  return dict[lang] || dict.en;
}

export const HANDOFF_MESSAGES: Record<SupportedLang, string> = {
  id: 'Pertanyaan detail Anda telah kami teruskan langsung ke Admin / Tim Concierge Zanzirangi House. Staf kami akan segera membalas pesan Anda di sini secara langsung. Terima kasih atas kesabaran Anda!',
  en: "Your detailed request has been forwarded directly to our Admin & Concierge team. A staff member will assist you shortly here in the chat. Thank you for your patience!",
  fr: 'Votre demande détaillée a été transmise directement à notre équipe de conciergerie. Un membre de notre équipe vous répondra sous peu.',
  sw: 'Ombi lako la kina limetumwa moja kwa moja kwa wasimamizi wetu. Mhudumu wetu atakujibu hapa punde si punde.',
  es: 'Su consulta detallada ha sido enviada a nuestro equipo de conserjería. Un miembro del personal le responderá en breve.',
  it: 'La vostra richiesta dettagliata è stata inoltrata al nostro team concierge. Un nostro collaboratore vi risponderà a breve.',
  pl: 'Twoje szczegółowe zapytanie zostało przekazane bezpośrednio do naszego zespołu konsjerża. Nasz pracownik wkrótce Ci odpowie.',
  ar: 'تم توجيه استفسارك التفصيلي مباشرة إلى فريق الكونسيرج وسيقوم أحد موظفينا بالرد عليك هنا قريباً.',
  zh: '您的详细咨询已直接转交给我们的私人礼宾管家团队，工作人员将很快在此为您解答，感谢您的耐心等待！',
};

export const HUMAN_REQUEST_MESSAGES: Record<SupportedLang, string> = {
  en: 'Certainly! Your request has been forwarded directly to our Zanzirangi House Admin team. A staff member will assist you here in just a moment.',
  fr: "Certainement ! Votre message a été transmis directement à notre équipe d'administration. Un membre du personnel vous répondra sous peu.",
  sw: 'Bila shaka! Ujumbe wako umetumwa moja kwa moja kwa wasimamizi wetu wa Zanzirangi House. Mhudumu atakujibu hapa punde.',
  es: '¡Por supuesto! Su solicitud ha sido enviada directamente a nuestro equipo de administración. Un miembro del personal le asistirá en breve.',
  it: 'Certamente! La tua richiesta è stata inoltrata direttamente al nostro team di amministrazione. Un nostro collaboratore ti assisterà a breve.',
  pl: 'Oczywiście! Twoja wiadomość została przekazana bezpośrednio do naszego zespołu administracyjnego. Nasz pracownik wkrótce Ci pomoże.',
  ar: 'بالتأكيد! تم توجيه رسالتك مباشرة إلى فريق إدارة زنجيرانجي هاوس. سيقوم أحد موظفينا بمساعدتك هنا في أقرب وقت.',
  zh: '当然可以！您的信息已直接转交给 Zanzirangi House 管理团队，工作人员将很快在此为您提供协助。',
  id: 'Tentu! Pesan Anda telah kami teruskan langsung ke Admin Zanzirangi House. Staf kami akan segera merespons Anda di sini dalam hitungan menit.',
};

export const HIGH_CONSTRAINT_MESSAGES: Record<SupportedLang, string> = {
  en: 'For customized requests, best rate inquiries, and large group arrangements, your request is being forwarded directly to our Reservation Manager for prompt confirmation.',
  fr: 'Pour toute demande personnalisée, offre spéciale ou groupe, votre requête est transmise directement à notre responsable des réservations.',
  sw: 'Kwa maombi maalum, punguzo la bei na makundi makubwa, ombi lako linatumwa moja kwa moja kwa Meneja wa Uhifadhi kwa uthibitisho wa haraka.',
  es: 'Para solicitudes personalizadas, mejores tarifas y grupos grandes, su consulta se envía directamente a nuestro Gerente de Reservas para su pronta confirmación.',
  it: 'Per richieste personalizzate, tariffe speciali e gruppi numerosi, la tua richiesta è stata inoltrata direttamente al nostro Responsabile Prenotazioni.',
  pl: 'W przypadku zapytań o oferty specjalne, zniżki lub rezerwacje grupowe, Twoja wiadomość trafia bezpośrednio do Menedżera Rezerwacji.',
  ar: 'للطلبات المخصصة وعروض الأسعار الخاصة والمجموعات الكبيرة، يتم تحويل طلبك مباشرة إلى مدير الحجوزات لتأكيده في أقرب وقت.',
  zh: '对于定制要求、特惠价格及大型团队预订，您的咨询已直接转交给预订部经理以便尽快为您确认。',
  id: 'Untuk permintaan khusus, penawaran harga terbaik, serta ketersediaan rombongan detail, pertanyaan Anda sedang kami teruskan langsung ke Admin / Manajer Reservasi kami untuk dikonfirmasi secepatnya.',
};

const ACTION_LABELS: Record<string, Record<SupportedLang, string>> = {
  view_villas: {
    en: 'View Private Villas',
    fr: 'Voir les Villas Privées',
    sw: 'Angalia Villa Binafsi',
    es: 'Ver Villas Privadas',
    it: 'Visualizza Ville Private',
    ar: 'عرض الفلل الخاصة',
    zh: '查看私人独立别墅',
    pl: 'Zobacz Prywatne Wille',
    id: 'Lihat Private Villa',
  },
  book_villa: {
    en: 'Book a Villa',
    fr: 'Réserver une villa',
    sw: 'Weka Villa Sasa',
    es: 'Reservar Villa',
    it: 'Prenota una Villa',
    ar: 'احجز فيلا الآن',
    zh: '立即预订别墅',
    pl: 'Zarezerwuj Willę',
    id: 'Reservasi Villa',
  },
  check_villa: {
    en: 'Check Villa Features',
    fr: 'Découvrir les Villas',
    sw: 'Vipengele vya Villa',
    es: 'Ver Detalles de la Villa',
    it: 'Dettagli delle Ville',
    ar: 'مزايا وتجهيزات الفلل',
    zh: '查看别墅设施详情',
    pl: 'Szczegóły Wyposażenia Willi',
    id: 'Cek Fasilitas Villa',
  },
  view_transfers: {
    en: 'View Transfer Details',
    fr: 'Détails du Transfert',
    sw: 'Maelezo ya Usafiri',
    es: 'Detalles del Traslado',
    it: 'Dettagli Trasferimento',
    ar: 'تفاصيل خدمة النقل',
    zh: '查看专车接送详情',
    pl: 'Szczegóły Transferu',
    id: 'Detail Layanan Transfer',
  },
  view_dining: {
    en: 'Taste Dining & Garden Menu',
    fr: 'Découvrir la Gastronomie',
    sw: 'Menyu ya Vyakula na Bustani',
    es: 'Ver Menú y Gastronomía',
    it: 'Menu e Ristorazione',
    ar: 'قائمة الطعام والمطعم',
    zh: '品味美馔与花园菜单',
    pl: 'Menu Restauracji i Ogrodu',
    id: 'Lihat Menu & Dining',
  },
  view_safari: {
    en: 'View Safari Destinations',
    fr: 'Destinations de Safari',
    sw: 'Maeneo ya Safari',
    es: 'Destinos de Safari',
    it: 'Destinazioni Safari',
    ar: 'وجهات رحلات السفاري',
    zh: '探索野生动物游猎',
    pl: 'Kierunki Safari',
    id: 'Lihat Destinasi Safari',
  },
  explore_ngorongoro: {
    en: 'Explore Ngorongoro',
    fr: 'Explorer le Ngorongoro',
    sw: 'Gundua Ngorongoro',
    es: 'Explorar Ngorongoro',
    it: 'Esplora Ngorongoro',
    ar: 'استكشاف نجورونجورو',
    zh: '探索恩戈罗恩戈罗',
    pl: 'Odkryj Ngorongoro',
    id: 'Eksplorasi Ngorongoro',
  },
  plan_kilimanjaro: {
    en: 'Plan Safari & Kilimanjaro',
    fr: 'Organiser Safari & Kilimandjaro',
    sw: 'Panga Safari & Kilimanjaro',
    es: 'Planear Safari y Kilimanjaro',
    it: 'Pianifica Safari e Kilimangiaro',
    ar: 'تخطيط رحلة كليمنجارو',
    zh: '规划乞力马扎罗与游猎',
    pl: 'Zaplanuj Safari i Kilimandżaro',
    id: 'Rencanakan Safari & Kilimanjaro',
  },
  explore_dolphins: {
    en: 'Explore Dolphin Safaris',
    fr: 'Safari Dauphins',
    sw: 'Safari ya Pomboo',
    es: 'Safari de Delfines',
    it: 'Safari con i Delfini',
    ar: 'رحلات الدلافين',
    zh: '探索海豚之旅',
    pl: 'Spotkanie z Delfinami',
    id: 'Eksplorasi Safari Lumba-Lumba',
  },
  view_sunset_sailing: {
    en: 'View Sunset Sailing',
    fr: 'Coucher de Soleil en Dhow',
    sw: 'Safari ya Dau Machweo',
    es: 'Navegación al Atardecer',
    it: 'Crociera al Tramonto',
    ar: 'الإبحار وقت الغروب',
    zh: '落日帆船出海',
    pl: 'Rejs o Zachodzie Słońca',
    id: 'Lihat Sunset Sailing',
  },
  view_spa: {
    en: 'View Wellness & Spa',
    fr: 'Soins Spa & Bien-être',
    sw: 'Huduma za Spa & Masaji',
    es: 'Ver Spa y Bienestar',
    it: 'Spa e Benessere',
    ar: 'علاجات السبا والاسترخاء',
    zh: '查看水疗养生护理',
    pl: 'Zabiegi Spa i Masaże',
    id: 'Lihat Layanan Spa',
  },
  explore_sanctuary: {
    en: 'Explore Sanctuary',
    fr: 'Explorer le Domaine',
    sw: 'Gundua Zanzirangi House',
    es: 'Explorar Zanzirangi House',
    it: 'Esplora il Resort',
    ar: 'استكشاف المنتجع',
    zh: '探索度假庄园',
    pl: 'Odkryj Zanzirangi House',
    id: 'Eksplorasi Sanctuary',
  },
};

const FAQ_REPLIES = {
  checkin: {
    en: 'Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.',
    fr: "L'enregistrement s'effectue à partir de 14h00 et le départ jusqu'à 11h00. Des aménagements horaires sont possibles selon disponibilité.",
    sw: 'Kuingia ni kuanzia saa 8:00 mchana (14:00) na kuondoka ni hadi saa 5:00 asubuhi (11:00 AM). Mabadiliko ya muda yanawezekana kulingana na nafasi.',
    es: 'El check-in es a partir de las 14:00 y el check-out hasta las 11:00. Salida tardía o entrada temprana según disponibilidad.',
    it: 'Check-in dalle 14:00 e check-out fino alle 11:00. Possibilità di orari flessibili su richiesta e secondo disponibilità.',
    ar: 'تسجيل الوصول يبدأ من الساعة 14:00 والمغادرة حتى الساعة 11:00 صباحاً. يمكن توفير تسجيل وصول مبكر أو مغادرة متأخرة عند توفر الفلل.',
    zh: '标准入住时间为 14:00 起，退房时间为上午 11:00 前。在房态允许的情况下可免费安排提前入住或延迟退房。',
    pl: 'Zameldowanie od 14:00, wymeldowanie do 11:00. Wcześniejszy przyjazd lub późniejszy wyjazd w miarę dostępności willi.',
    id: 'Waktu check-in standar kami mulai pukul 14:00 (2:00 siang) dan check-out hingga pukul 11:00 pagi. Early check-in atau late check-out dapat disesuaikan secara fleksibel tergantung ketersediaan villa Anda.',
  },
  wifi: {
    en: 'High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.',
    fr: 'Une connexion satellite Starlink haut débit (150+ Mbps) est offerte dans toutes les villas, jardins et espaces de restauration pour vos loisirs ou le télétravail.',
    sw: 'Mtandao wa Wi-Fi ya kasi ya juu kupitia Starlink (150+ Mbps) unapatikana bila malipo katika villa zote, bustani, na migahawa yetu.',
    es: 'Contamos con internet satelital Starlink de alta velocidad (150+ Mbps) gratuito en todas las villas privadas, jardines y restaurantes para streaming o teletrabajo.',
    it: 'Wi-Fi satellitare Starlink ad altissima velocità (150+ Mbps) gratuito in tutte le ville, nei giardini e nelle aree ristorante per lo streaming e il lavoro da remoto.',
    ar: 'تتوفر خدمة ستارلينك الفضائية فائقة السرعة (150+ ميغابت/ثانية) مجاناً في جميع الفلل والحدائق ومرافق تناول الطعام لضمان اتصال ممتاز.',
    zh: '全庄园无死角覆盖免费 Starlink 星链高速卫星 Wi-Fi（150+ Mbps），无论在别墅、泳池或花园均可畅享极速网络，轻松满足办公或流媒体需求。',
    pl: 'Na terenie całego obiektu działa bezpłatny, szybki internet satelitarny Starlink (150+ Mbps), zapewniający stabilne połączenie w willach, ogrodach i restauracji.',
    id: 'Internet satelit Starlink kecepatan tinggi (150+ Mbps) tersedia gratis tanpa batas di seluruh private villa, taman santuari, dan paviliun restoran kami untuk kenyamanan streaming maupun remote work.',
  },
  pools_beach: {
    en: 'Every single one of our 8 luxury sanctuaries features its own private freshwater plunge pool, sun loungers, and direct private pathway access to the pristine shores of the Indian Ocean.',
    fr: "Chacune de nos 8 villas de prestige dispose de sa propre piscine privée d'eau douce, de bains de soleil et d'un accès privé direct aux rives préservées de l'océan Indien.",
    sw: 'Kila moja ya villa zetu 8 za kifahari ina bwawa lake binafsi la maji safi, vitanda vya jua, na njia ya kibinafsi inayoelekea moja kwa moja kwenye ufukwe mzuri wa Bahari ya Hindi.',
    es: 'Cada una de nuestras 8 exclusivas villas cuenta con su propia piscina privada de agua dulce, tumbonas y acceso privado directo a la playa virgen del Océano Índico.',
    it: "Ognuna delle nostre 8 ville di lusso dispone di piscina privata ad acqua dolce, lettini prendisole e accesso privato diretto alla spiaggia incontaminata dell'Oceano Indiano.",
    ar: 'تتميز كل فيلا من فللنا الفاخرة الثمانية بمسبح خاص للمياه العذبة، وكراسي استلقاء للتشمس، وممر خاص مباشر إلى شاطئ المحيط الهندي الخلاب.',
    zh: '我们的8栋奢华庄园别墅均配有独立私人淡水冲水无边泳池、日光躺椅以及直达印度洋纯净沙滩的专属私人通道。',
    pl: 'Każda z naszych 8 luksusowych willi posiada prywatny basen ze słodką wodą, leżaki oraz bezpośrednie, prywatne przejście na dziewiczą plażę Oceanu Indyjskiego.',
    id: 'Setiap villa dari 8 private sanctuary kami memiliki kolam renang pribadi (freshwater plunge pool), sun loungers, dan akses jalur pribadi langsung ke pantai Kizimkazi Samudra Hindia yang tenang.',
  },
  villas_rates: {
    en: 'Zanzirangi House features 8 handcrafted luxury sanctuaries including oceanfront pool villas and secluded garden bungalows. Direct rates include gourmet breakfast, butler service, and private plunge pools. Would you like to check dates and availability?',
    fr: 'Zanzirangi House propose 8 villas de luxe privées avec piscines privatives et service de majordome. Les tarifs incluent le petit-déjeuner gastronomique. Souhaitez-vous vérifier les dates et disponibilités ?',
    sw: 'Zanzirangi House ina villa 8 za kifahari zenye mabwawa binafsi na huduma ya mhudumu binafsi. Bei inajumuisha kifungua kinywa cha kifahari. Je, ungependa kuangalia tarehe na upatikanaji?',
    es: 'Zanzirangi House cuenta con 8 exclusivas villas con piscina privada y servicio de mayordomo. Las tarifas incluyen desayuno gourmet. ¿Desea consultar fechas y disponibilidad?',
    it: 'Zanzirangi House offre 8 esclusive ville di lusso con piscina privata e maggiordomo. Le tariffe includono la colazione gourmet. Vuoi verificare date e disponibilità?',
    ar: 'يضم زنجيرانجي هاوس 8 فلل خاصة فاخرة مع مسابح خاصة وخدمة خادم شخصي. تشمل الأسعار الإفطار الفاخر. هل ترغب في التحقق من التواريخ والتوفر الآن؟',
    zh: 'Zanzirangi House 拥有8栋配备独立私人泳池和专属管家服务的奢华独立别墅。房价均包含精致热带早餐。您想查看具体日期的空房与价格吗？',
    pl: 'Zanzirangi House oferuje 8 luksusowych willi z prywatnymi basenami i dedykowaną obsługą lokaja. Ceny obejmują wyborne śniadanie. Czy chcesz sprawdzić terminy i dostępność?',
    id: 'Zanzirangi House menyediakan 8 private pool sanctuary eksklusif termasuk oceanfront villa dan garden sanctuary yang tenang. Apakah Anda ingin mengecek tanggal dan ketersediaan sekarang?',
  },
  transfers: {
    en: 'We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi (approx. 55 minutes).',
    fr: "Zanzirangi House est situé à Kizimkazi Dimbani, à environ 55 minutes de l'aéroport international de Zanzibar (ZNZ). Nous assurons des transferts privés VIP avec chauffeur.",
    sw: 'Zanzirangi House ipo Kizimkazi Dimbani, takriban dakika 55 kutoka Uwanja wa Ndege wa Kimataifa wa Zanzibar (ZNZ). Tunatoa usafiri binafsi wa kifahari wa VIP na dereva.',
    es: 'Zanzirangi House está ubicado en Kizimkazi Dimbani, a unos 55 minutos del Aeropuerto Internacional de Zanzíbar (ZNZ). Ofrecemos traslados VIP privados con chofer.',
    it: "Zanzirangi House si trova a Kizimkazi Dimbani, a circa 55 minuti dall'Aeroporto Internazionale di Zanzibar (ZNZ). Offriamo trasferimenti VIP privati con autista.",
    ar: 'يقع زنجيرانجي هاوس في كيزيمكازي ديمباني، على بُعد حوالي 55 دقيقة من مطار زنجبار الدولي (ZNZ). نوفر خدمات نقل VIP خاصة مع سائق شخصي.',
    zh: 'Zanzirangi House 位于桑给巴尔南部的 Kizimkazi Dimbani，距国际机场（ZNZ）约55分钟车程。我们提供带专属司机的豪华 VIP 专车接送服务。',
    pl: 'Zanzirangi House znajduje się w Kizimkazi Dimbani, około 55 minut od międzynarodowego lotniska na Zanzibarze (ZNZ). Zapewniamy prywatne transfery VIP z szoferem.',
    id: 'Zanzirangi House berlokasi di Kizimkazi Dimbani, pesisir selatan Zanzibar. Kami menyediakan layanan antar-jemput VIP chauffeur pribadi dari Bandara Internasional Zanzibar (ZNZ) langsung ke sanctuary (~55 menit perjalanan).',
  },
  dining: {
    en: 'Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili spices and fine international dining. Gourmet tropical breakfast is included daily.',
    fr: 'Notre philosophie gastronomique associe produits bio du potager et poissons frais locaux aux épices swahilies et à la haute cuisine internationale. Le petit-déjeuner tropical est inclus chaque matin.',
    sw: 'Mtindo wetu wa chakula unazingatia mazao safi ya bustani na samaki wabichi wa baharini pamoja na viungo asilia vya Kiswahili na vyakula bora vya kimataifa. Kifungua kinywa kinajumuishwa kila siku.',
    es: 'Nuestra propuesta gastronómica combina productos orgánicos de nuestra huerta y pesca del día con especias swahilis y alta cocina internacional. Desayuno gourmet incluido diariamente.',
    it: 'La nostra cucina unisce prodotti biologici del nostro orto e pescato fresco a spezie Swahili e alta gastronomia internazionale. La colazione gourmet è inclusa ogni giorno.',
    ar: 'ترتكز فلسفتنا في الطهي على المكونات العضوية الطازجة من حدائقنا والمأكولات البحرية الطازجة مع التوابل السواحلية الأصيلة والمأكولات العالمية الفاخرة. الإفطار الاستوائي مشمول يومياً.',
    zh: '我们的料理哲学倡导庄园有机农场到餐桌的新鲜理念，甄选印度洋每日捕捞的海鲜，融合纯正斯瓦希里香料与国际高端美馔。每日提供精美热带早餐。',
    pl: 'Nasza filozofia kulinarna łączy ekologiczne produkty z własnego ogrodu i świeże owoce morza z autentycznymi przyprawami suahili i kuchnią międzynarodową. Śniadanie w cenie każdego pobytu.',
    id: 'Filosofi kuliner kami menyajikan hasil bumi organik dari kebun sendiri (garden-to-table) dan hidangan seafood segar tangkapan harian nelayan lokal dengan sentuhan Swahili otentik dan menu internasional mewah.',
  },
  serengeti: {
    en: 'Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.',
    fr: 'Le parc national du Serengeti offre une expérience de safari extraordinaire. Zanzirangi House organise des safaris en vol charter direct depuis Zanzibar (env. 1h45) avec des camps de tentes de luxe partenaires.',
    sw: 'Hifadhi ya Taifa ya Serengeti ni uzoefu wa kipekee wa safari. Zanzirangi House inaandaa safari za ndege za moja kwa moja kutoka uwanja wa ndege wa Zanzibar (takriban saa 1 na dakika 45) na malazi ya kambi za kifahari.',
    es: 'El Parque Nacional Serengeti es una experiencia de safari legendaria. Zanzirangi House organiza vuelos chárter directos desde Zanzíbar (aprox. 1h 45m) con campamentos asociados de lujo.',
    it: "Il Parco Nazionale del Serengeti offre un'esperienza di safari indimenticabile. Zanzirangi House organizza safari con voli charter diretti da Zanzibar (circa 1h 45m) con campi tendati di lusso partner.",
    ar: 'تعتبر حديقة سيرينجيتي الوطنية تجربة سفاري استثنائية. ينظم زنجيرانجي هاوس رحلات سفاري بطيران شارتر مباشر من مطار زنجبار (حوالي ساعة و45 دقيقة) مع مخيمات فاخرة شريكة.',
    zh: '塞伦盖蒂国家公园是一生必去一次的野生动物游猎体验。Zanzirangi House 安排从桑给巴尔机场直飞的大草原专机（约1小时45分），入住俯瞰动物大迁徙路线的高端帐篷营地。',
    pl: 'Park Narodowy Serengeti to niezwykłe przeżycie safari. Zanzirangi House organizuje bezpośrednie loty czarterowe z Zanzibaru (ok. 1h 45m) z noclegami w luksusowych obozach partnerskich.',
    id: 'Taman Nasional Serengeti adalah pengalaman safari legendaris. Zanzirangi House mengatur safari terbang carter langsung dari Zanzibar (±1 jam 45 menit) dengan akomodasi tenda mewah mitra kami.',
  },
  ngorongoro: {
    en: 'Ngorongoro Crater offers Africa’s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.',
    fr: "Le cratère du Ngorongoro abrite la plus dense population de prédateurs d'Afrique dans une caldeira classée par l'UNESCO. Nous organisons des séjours combinés plage et safari dans le cratère.",
    sw: 'Kreta ya Ngorongoro ina idadi kubwa ya wanyama wanaowinda barani Afrika ndani ya volkano ya UNESCO. Tunaandaa vifurushi vya ndege vinavyochanganya mapumziko ya ufukweni na safari ya kreta.',
    es: 'El Cráter del Ngorongoro alberga la mayor densidad de depredadores de África dentro de una caldera de la UNESCO. Organizamos paquetes de vuelo combinando playa y safari en el cráter.',
    it: "Il Cratere di Ngorongoro offre la più alta densità di predatori d'Africa all'interno di una caldera UNESCO. Organizziamo pacchetti con volo combinando soggiorno mare e safari nel cratere.",
    ar: 'تضم فوهة نجورونجورو أعلى كثافة للحيوانات المفترسة في إفريقيا ضمن فوهة بركانية مصنفة لدى اليونسكو. ننظم باقات طيران تجمع بين الإقامة الشاطئية ورحلات السفاري.',
    zh: '恩戈罗恩戈罗火山口拥有全非洲密度最高的食肉动物种群。我们提供包含桑给巴尔海滩度假与火山口盆地全景游猎的直飞尊享套餐。',
    pl: 'Krater Ngorongoro to kaldera UNESCO z największą gęstością drapieżników w Afryce. Organizujemy pakiety z przelotem łączące relaks na plaży z safari na dnie krateru.',
    id: 'Kawah Ngorongoro menyimpan populasi predator terpadat di Afrika di dalam kaldera vulkanik UNESCO. Kami menyediakan paket safari terbang kombinasi liburan pantai dan game drive kawah.',
  },
  kilimanjaro: {
    en: 'Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.',
    fr: "Les expéditions au Kilimandjaro et les survols panoramiques sont organisés avec nos guides de montagne partenaires certifiés, avec séjours d'acclimatation ou repos après l'ascension.",
    sw: 'Safari za Mlima Kilimanjaro na safari za ndege za mandhari hupangwa kupitia waelekezi wetu walioidhinishwa wa milimani, ikiwa ni pamoja na maandalizi kabla ya kupanda au kupumzika baada ya kuteremka.',
    es: 'Las expediciones al Monte Kilimanjaro y sobrevuelos panorámicos se coordinan con guías certificados, incluyendo aclimatación previa o descanso en la playa tras la cumbre.',
    it: 'Le spedizioni sul Kilimangiaro e i voli panoramici sono organizzati con guide alpine partner certificate, con soggiorni di acclimatazione o relax post-scalata.',
    ar: 'يتم ترتيب رحلات تسلق جبل كليمنجارو والجولات الجوية البانورامية مع شركائنا المعتمدين، مع إمكانية تنظيم إقامة للتأقلم قبل التسلق أو الاسترخاء على الشاطئ بعده.',
    zh: '乞力马扎罗山攀登探险及全景空中航拍游猎均由我们认证的高山向导团队承办，可为您定制登顶前的适应训练或登顶后的海滩深度放松假期。',
    pl: 'Wyprawy na Kilimandżaro i widokowe przeloty organizujemy z certyfikowanymi przewodnikami górskimi, wraz z pobytem aklimatyzacyjnym lub relaksem na plaży po wspinaczce.',
    id: 'Ekspedisi Gunung Kilimanjaro dan safari penerbangan panorama diatur bersama mitra pemandu gunung resmi kami, lengkap dengan aklimatisasi sebelum pendakian atau istirahat relaksasi setelahnya.',
  },
  dolphins: {
    en: 'Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.',
    fr: "Kizimkazi est réputé dans le monde entier pour ses dauphins dans la réserve de Menai Bay. Nous organisons des sorties éthiques à l'aube directement depuis notre plage.",
    sw: 'Kizimkazi ni maarufu duniani kwa makundi ya pomboo katika Hifadhi ya Menai Bay. Tunapanga safari za boti alfajiri zenye maadili moja kwa moja kutoka ufukweni mwetu.',
    es: 'Kizimkazi es mundialmente famoso por sus colonias de delfines en la Bahía de Menai. Organizamos salidas éticas al amanecer directamente desde nuestra orilla.',
    it: 'Kizimkazi è famosa nel mondo per i delfini nella riserva di Menai Bay. Organizziamo uscite etiche in barca all’alba direttamente dalla nostra spiaggia.',
    ar: 'تشتهر كيزيمكازي عالمياً بوجود أسراب الدلافين في محمية ميناي باي. ننظم جولات بحرية صباحية معتمدة بيئياً مباشرة من شاطئنا.',
    zh: '基济姆卡齐以 Menai Bay 海洋保护区常驻的野生海豚群闻名世界。我们在清晨安排专属小艇，带您体验生态友好的日出海豚寻踪之旅。',
    pl: 'Kizimkazi słynie z dzikich delfinów w zatoce Menai Bay. Organizujemy etyczne, poranne rejsy z licencjonowanymi przewodnikami prosto z naszej plaży.',
    id: 'Kizimkazi terkenal di dunia dengan kawanan lumba-lumba di Kawasan Konservasi Menai Bay. Kami mengadakan safari lumba-lumba etis saat matahari terbit langsung dari tepi pantai kami.',
  },
  dhow: {
    en: 'Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canapés as the sun sets.',
    fr: "Glissez sur l'océan Indien à bord d'un dhow traditionnel en bois tout en savourant du champagne frais et des canapés swahilis au coucher du soleil.",
    sw: 'Safiri katika Bahari ya Hindi yenye rangi ya feruzi ukiwa ndani ya dau la mbao la jadi huku ukifurahia vinywaji baridi na vitafunio vya Kiswahili wakati wa jua kuzama.',
    es: 'Navegue por las aguas turquesas del Océano Índico a bordo de un dhow tradicional de madera mientras disfruta de champán y canapés swahilis al atardecer.',
    it: "Naviga sulle acque turchesi dell'Oceano Indiano a bordo di un dhow tradizionale in legno gustando champagne freddo e canapè Swahili al tramonto.",
    ar: 'أبحر عبر مياه المحيط الهندي الفيروزية على متن قارب داو خشبي تقليدي مع الاستمتاع بالمشروبات المنعشة والمقبلات السواحلية الطازجة وقت غروب الشمس.',
    zh: '乘坐纯手工打造的传统木质 Dhow 帆船在绿松石般的印度洋上破浪前行，在醉人日落中品味冰镇香槟与新鲜特制的斯瓦希里小食。',
    pl: 'Płyń po turkusowych wodach Oceanu Indyjskiego tradycyjną drewnianą łodzią dhow, delektując się schłodzonym szampanem i przekąskami o zachodzie słońca.',
    id: 'Nikmati pelayaran magis di atas perahu kayu tradisional Dhow menyusuri Samudra Hindia pirus sambil menikmati Champagne dingin dan canapé Swahili saat matahari terbenam.',
  },
  spa: {
    en: 'Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.',
    fr: 'Nos soins bien-être en villa utilisent des huiles de coco pures de Zanzibar, des gommages au clou de girofle et des massages relaxants sur votre terrasse privée face à la mer.',
    sw: 'Huduma zetu za spa ndani ya villa hutumia mafuta asilia ya nazi, viungo vya karafuu na mdalasini, pamoja na masaji ya kina ya kutuliza mwili kwenye deki ya villa yako.',
    es: 'Nuestros tratamientos de spa en la villa emplean aceite puro de coco de Zanzíbar, exfoliaciones con clavo y canela, y masajes descontracturantes en su terraza privada.',
    it: 'I nostri trattamenti benessere in villa prevedono oli di cocco puri di Zanzibar, scrub ai chiodi di garofano e cannella e massaggi rilassanti sul tuo solarium privato.',
    ar: 'تتميز علاجات السبا في الفيلا باستخدام زيوت جوز الهند الزنجبارية النقية، ومقشرات القرنفل والقرفة، وجلسات التدليك المهدئة على التراس الخاص بك المطل على المحيط.',
    zh: '我们的别墅内水疗护理采用初榨天然桑给巴尔椰子油、丁香与肉桂磨砂膏，由资深理疗师在您面向大海的私人阳光露台上提供深度全身舒缓按摩。',
    pl: 'Nasze zabiegi spa w willi wykorzystują tłoczony na zimno zanzibarski olej kokosowy, peelingi z goździków i cynamonu oraz relaksujące masaże na Twoim prywatnym tarasie.',
    id: 'Layanan spa & wellness in-villa kami menggunakan minyak kelapa Zanzibari murni, scrub cengkeh & kayu manis, serta deep-tissue massage yang menenangkan langsung di dek oceanfront pribadi Anda.',
  },
  payment: {
    en: 'We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.',
    fr: 'Nous acceptons les cartes Visa, MasterCard, Amex et les virements bancaires internationaux. Annulation flexible sans frais jusqu’à 14 jours avant votre arrivée.',
    sw: 'Tunapokea kadi zote kuu za benki (Visa, MasterCard, Amex) na uhamisho wa benki wa kimataifa. Kughairi bila malipo hadi siku 14 kabla ya kuwasili.',
    es: 'Aceptamos tarjetas de crédito (Visa, MasterCard, Amex) y transferencias bancarias internacionales. Cancelación gratuita hasta 14 días antes de la llegada.',
    it: 'Accettiamo le principali carte di credito (Visa, MasterCard, Amex) e bonifici bancari internazionali. Condizioni di cancellazione flessibili fino a 14 giorni prima dell’arrivo.',
    ar: 'نقبل بطاقات الائتمان الرئيسية (فيزا، ماستركارد، أمريكان إكسبريس) والتحويلات البنكية الدولية. تتيح سياسة الإلغاء مرونة كاملة حتى 14 يوماً قبل موعد الوصول.',
    zh: '支持主流信用卡（Visa、MasterCard、American Express）、国际银行电汇以及移动支付。入住前14天享受全额退款的灵活取消政策。',
    pl: 'Akceptujemy główne karty kredytowe (Visa, MasterCard, Amex) oraz międzynarodowe przelewy bankowe. Pełna elastyczność bezpłatnej anulacji do 14 dni przed przyjazdem.',
    id: 'Kami menerima kartu kredit utama (Visa, MasterCard, Amex), transfer bank internasional, dan pembayaran digital. Kebijakan pembatalan fleksibel penuh hingga 14 hari sebelum tanggal kedatangan.',
  },
};

const GREETINGS = {
  evening: {
    en: 'Jambo and good evening! Welcome to Zanzirangi House. My name is {name}, your private concierge. How may I assist your stay or inquiries in Zanzibar tonight?',
    fr: "Jambo et bonsoir ! Bienvenue à Zanzirangi House. Je m'appelle {name}, votre concierge privé. Comment puis-je vous aider pour votre séjour à Zanzibar ce soir ?",
    sw: 'Jambo na habari ya jioni! Karibu Zanzirangi House. Naitwa {name}, mhudumu wako binafsi. Nawezaje kukusaidia kuhusu makazi yako au maswali ya Zanzibar jioni ya leo?',
    es: '¡Jambo y buenas noches! Bienvenido a Zanzirangi House. Mi nombre es {name}, su conserje privado. ¿Cómo puedo asistirle hoy con su estadía en Zanzíbar esta noche?',
    it: 'Jambo e buona sera! Benvenuto a Zanzirangi House. Mi chiamo {name}, il tuo concierge privato. Come posso assisterti per il tuo soggiorno a Zanzibar questa sera?',
    ar: 'جامبو ومساء الخير! أهلاً بكم في زنجيرانجي هاوس. أنا {name}، كونسيرجك الخاص. كيف يمكنني مساعدتك في إقامتك واستفساراتك في زنجبار الليلة؟',
    zh: 'Jambo！晚上好，欢迎来到 Zanzirangi House。我是您的专属私人管家 {name}。请问今晚能为您的桑给巴尔假期提供什么协助？',
    pl: 'Jambo i dobry wieczór! Witamy w Zanzirangi House. Nazywam się {name}, Twój prywatny konsjerż. W czym mogę pomóc w planowaniu pobytu na Zanzibarze tego wieczoru?',
    id: 'Jambo & selamat malam! Senang bisa menyapa Anda di Zanzirangi House. Saya {name}, concierge Anda. Ada yang bisa kami bantu seputar reservasi villa, fasilitas, atau pengalaman di Zanzibar malam ini?',
  },
  daytime: {
    en: 'Jambo and welcome! My name is {name}, your personal concierge at Zanzirangi House. How may I assist you today regarding our luxury villas, dining, or safari experiences?',
    fr: "Jambo et bienvenue ! Je m'appelle {name}, votre concierge personnel à Zanzirangi House. Comment puis-je vous aider aujourd'hui concernant nos villas de luxe, nos repas ou nos safaris ?",
    sw: 'Jambo na karibu! Naitwa {name}, mhudumu wako binafsi katika Zanzirangi House. Nawezaje kukusaidia leo kuhusu villa zetu, vyakula, au safari za Zanzibar?',
    es: '¡Jambo y bienvenido! Mi nombre es {name}, su conserje privado en Zanzirangi House. ¿Cómo puedo asistirle hoy con nuestras villas de lujo, gastronomía o experiencias de safari?',
    it: 'Jambo e benvenuto! Mi chiamo {name}, il tuo concierge personale a Zanzirangi House. Come posso assisterti oggi per le nostre ville di lusso, ristorazione o esperienze di safari?',
    ar: 'جامبو وأهلاً بك! أنا {name}، كونسيرجك الخاص في زنجيرانجي هاوس. كيف يمكنني مساعدتك اليوم بخصوص فللنا الفاخرة أو تجارب الطعام والسفاري؟',
    zh: 'Jambo！欢迎光临。我是您在 Zanzirangi House 的专属私人管家 {name}。请问今天能为您的奢华独立别墅、餐饮美馔或游猎探索提供什么协助？',
    pl: 'Jambo i witamy! Nazywam się {name}, Twój osobisty konsjerż w Zanzirangi House. W czym mogę pomóc dzisiaj w kwestii naszych luksusowych willi, gastronomii lub safari?',
    id: 'Jambo & selamat datang! Saya {name}, concierge pribadi Anda di Zanzirangi House. Ada yang bisa kami bantu hari ini seputar pilihan villa, dining, atau safari di Zanzibar?',
  },
  general: {
    en: 'Jambo! Welcome to Zanzirangi House. I am {name}, your personal concierge. Feel free to ask about our private villas, check-in, transfers, dining, or bespoke safari journeys!',
    fr: "Jambo ! Bienvenue à Zanzirangi House. Je suis {name}, votre concierge personnel. N'hésitez pas à poser vos questions sur nos villas privées, transferts, repas ou safaris sur-mesure !",
    sw: 'Jambo na karibu Zanzirangi House! Mimi ni {name}, mhudumu wako binafsi. Jisikie huru kuuliza kuhusu villa zetu binafsi, kuingia, usafiri, vyakula, au safari zetu maalum!',
    es: '¡Jambo! Bienvenido a Zanzirangi House. Soy {name}, su conserje personal. No dude en consultarme sobre nuestras villas privadas, traslados, gastronomía o safaris exclusivos.',
    it: 'Jambo! Benvenuto a Zanzirangi House. Sono {name}, il tuo concierge personale. Chiedimi pure informazioni sulle nostre ville private, check-in, trasferimenti, ristorazione o safari esclusivi!',
    ar: 'جامبو! أهلاً بكم في زنجيرانجي هاوس. أنا {name}، كونسيرجك الشخصي. لا تتردد في الاستفسار عن فللنا الخاصة، مواعيد الوصول، خدمات النقل، الطعام، أو رحلات السفاري المخصصة!',
    zh: 'Jambo！欢迎来到 Zanzirangi House。我是您的专属管家 {name}。随时向我咨询关于独栋别墅预订、入住、接送机、餐饮或定制游猎之旅的任何疑问！',
    pl: 'Jambo! Witamy w Zanzirangi House. Nazywam się {name}, Twój prywatny konsjerż. Śmiało pytaj o nasze prywatne wille, zameldowanie, transfery, wyżywienie lub wyprawy na safari!',
    id: 'Jambo! Halo, senang Anda menghubungi kami di Zanzirangi House. Saya {name}, concierge Anda. Silakan tanyakan apa pun seputar reservasi villa, check-in, antar-jemput bandara, atau pengalaman di Zanzibar!',
  },
  thanks: {
    en: 'You are most welcome! It is our pleasure. Please let us know if there is anything else we can arrange for your luxury retreat in Zanzibar.',
    fr: "Je vous en prie ! C'est un réel plaisir. Faites-nous savoir si nous pouvons vous aider pour d'autres aspects de votre séjour à Zanzibar.",
    sw: 'Karibu sana! Ni furaha yetu kukuhudumia. Tafadhali tujulishe ikiwa kuna chochote kingine tunachoweza kukuandalia kwa ajili ya mapumziko yako Zanzibar.',
    es: '¡De nada! Es un auténtico placer. Háganos saber si hay algo más en lo que podamos asistirle para su estadía de lujo en Zanzíbar.',
    it: 'Prego, è un vero piacere! Facci sapere se c’è altro che possiamo organizzare per rendere indimenticabile il tuo soggiorno a Zanzibar.',
    ar: 'على الرحب والسعة دائماً! يسعدنا خدمتكم في أي وقت. يرجى إعلامنا إذا كان بإمكاننا ترتيب أي شيء آخر لإقامتكم الفاخرة في زنجبار.',
    zh: '不客气！非常荣幸能为您服务。如果还有任何我们可以为您在桑给巴尔奢华度假期间安排的事宜，请随时告诉我。',
    pl: 'Cała przyjemność po naszej stronie! Daj nam znać, jeśli możemy w czymś jeszcze pomóc, aby Twój luksusowy wypoczynek na Zanzibarze był idealny.',
    id: 'Sama-sama! Dengan senang hati. Jika Anda membutuhkan informasi lebih lanjut atau ingin memesan villa, tim kami selalu siap membantu.',
  },
  acknowledgement: {
    en: 'Wonderful! We are right here whenever you need assistance with your booking or stay arrangements. Enjoy your time!',
    fr: "Parfait ! Nous restons à votre entière disposition dès que vous aurez besoin d'aide pour vos réservations. Passez un excellent moment !",
    sw: 'Safi sana! Tuko hapa wakati wowote unapohitaji msaada wa nafasi au huduma za makazi yako. Furahia wakati wako!',
    es: '¡Excelente! Estamos aquí para asistirle cuando esté listo con su reserva o detalles de estadía. ¡Que disfrute de su día!',
    it: 'Perfetto! Siamo qui a tua disposizione ogni volta che avrai bisogno di assistenza per la prenotazione o il soggiorno. Buona giornata!',
    ar: 'رائع جداً! نحن متواجدون هنا دائماً لمساعدتك في أي وقت ترغب فيه بإتمام الحجز أو ترتيبات الإقامة. نتمنى لك أوقاتاً سعيدة!',
    zh: '太好了！只要您需要预订或行程方面的协助，我们随时在此为您服务。祝您拥有愉快的美好时光！',
    pl: 'Wspaniale! Jesteśmy do Twojej dyspozycji w każdej chwili, gdy zechcesz dokonać rezerwacji lub o coś zapytać. Miłego dnia!',
    id: 'Baik, terima kasih! Silakan beri tahu kami kapan pun Anda siap melakukan reservasi atau membutuhkan bantuan lainnya.',
  },
  identity: {
    en: 'I am {name}, your personal Customer Support & Concierge at Zanzirangi House. I am here to assist with all your questions, and our human admin team is also directly connected here whenever you need specialized assistance.',
    fr: "Je suis {name}, votre concierge et service client personnel à Zanzirangi House. Je suis là pour répondre à toutes vos questions, et notre équipe d'administration est également connectée en direct.",
    sw: 'Naitwa {name}, mhudumu wako binafsi wa huduma kwa wateja katika Zanzirangi House. Niko hapa kukusaidia kwa maswali yako yote, na wasimamizi wetu wapo moja kwa moja hapa.',
    es: 'Soy {name}, su conserje personal y atención al cliente en Zanzirangi House. Estoy aquí para asistirle con cualquier consulta, y nuestro equipo de administración está conectado directamente.',
    it: 'Sono {name}, il tuo concierge e supporto clienti personale a Zanzirangi House. Sono qui per rispondere a tutte le tue domande, e il nostro team di amministratori è sempre connesso qui.',
    ar: 'أنا {name}، كونسيرجك الشخصي وخدمة العملاء في زنجيرانجي هاوس. أنا هنا للإجابة على جميع استفساراتك، كما أن فريق الإدارة البشري متصل هنا مباشرة عند الحاجة.',
    zh: '我是 {name}，您在 Zanzirangi House 的专属私人管家与客户支持。我在此协助解答您的所有疑问，同时我们的人工管理团队也随时在线连线为您提供支持。',
    pl: 'Nazywam się {name}, Twój osobisty konsjerż i wsparcie klienta w Zanzirangi House. Jestem tutaj, aby pomóc we wszystkich pytaniach, a nasz zespół administratorów jest również połączony bezpośrednio w tym czacie.',
    id: 'Saya {name}, Customer Support & Concierge pribadi Anda di Zanzirangi House. Saya siap menjawab pertanyaan Anda seputar sanctuary kami, dan staf admin kami juga selalu terhubung langsung di sini jika Anda membutuhkan bantuan khusus.',
  },
};

export class SupportAiEngine {
  /**
   * Evaluates a visitor query through the Support Decision Layer:
   * 1. Simple greetings, pleasantries & FAQs -> AUTO_ANSWER immediately by active concierge
   * 2. Detailed questions, custom quotes, discounts, or explicit human requests -> HANDOFF_TO_HUMAN
   * 3. Answers strictly in the language picked on the language setting. Never mixes languages.
   */
  async evaluateQuery(
    query: string,
    lang: string = 'en',
    _currentPage: string = '/',
    conciergeName: string = 'Elena'
  ): Promise<AiEvaluationResult> {
    const q = query.trim().toLowerCase();
    const activeLang = resolveLang(lang);

    const fallbackHandoff = getLocalized(HANDOFF_MESSAGES, activeLang);
    const humanRequestMsg = getLocalized(HUMAN_REQUEST_MESSAGES, activeLang);
    const highConstraintMsg = getLocalized(HIGH_CONSTRAINT_MESSAGES, activeLang);

    const name = (conciergeName && conciergeName.trim()) || 'Elena';
    const nameEscaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const resolveGreeting = (template: string) => template.replace(/\{name\}/g, name);
    const getActionLabel = (actionKey: string) =>
      ACTION_LABELS[actionKey]?.[activeLang] || ACTION_LABELS[actionKey]?.en || 'View';

    // -------------------------------------------------------------
    // RULE 1: EXPLICIT HUMAN / ADMIN REQUEST
    // If the guest asks for admin/staff, immediately route to human
    // -------------------------------------------------------------
    const asksForHuman =
      /\b(admin|staf|staff|human|manusia|orang|manager|manajer|owner|pemilik|hubungi|bicara|talk to|speak to|contact|bantuan langsung|operator|customer care|człowiek|człowiekiem|humain|administrateur|humano|umano|binadamu|mtu|بشري|إنسان|人工|真人)\b/i.test(
        q
      );
    if (asksForHuman) {
      return {
        replyText: humanRequestMsg,
        intent: 'human_concierge_requested',
        confidence: 0.98,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Visitor explicitly requested to communicate with a human staff member / admin.',
      };
    }

    // -------------------------------------------------------------
    // RULE 2: DETAILED / HIGH CONSTRAINT REQUESTS (Discounts, Events, Large Groups)
    // -------------------------------------------------------------
    const hasDiscountInquiry = /\b(diskon|discount|promo|potongan|tawar|nego|best price|special rate|rabais|remise|descuento|sconto|zniżka|خصم|折扣)\b/i.test(q);
    const hasEventInquiry = /\b(wedding|nikah|pernikahan|event|acara|gathering|party|mariage|harusi|boda|matrimonio|wesele|حفل|婚礼)\b/i.test(q);
    const hasImmediateDate = /\b(tomorrow|tonight|today|besok|malam ini|demain|ce soir|mañana|domani|jutro|غدا|اليوم|明天|今晚)\b/i.test(q);
    const hasSpecificLargeGroup =
      /\b(1[0-9]|[2-9][0-9])\s*(people|guests|persons|orang|personnes|personas|persone|osób|شخص|位|人)\b/i.test(q) ||
      /\b(for|untuk|pour|para|per|dla|li|共)\s*(1[0-9]|[2-9][0-9])\b/i.test(q);

    if (hasDiscountInquiry || hasEventInquiry || (hasImmediateDate && hasSpecificLargeGroup)) {
      return {
        replyText: highConstraintMsg,
        intent: 'custom_inquiry_handoff',
        confidence: 0.92,
        knowledge_source: 'NONE',
        decision: 'HANDOFF_TO_HUMAN',
        handoffReason: 'Visitor inquired about discounts, events, or specific high-constraint bookings requiring human management approval.',
      };
    }

    // -------------------------------------------------------------
    // RULE 3: Dynamic Knowledge Base Lookup (Admin-curated KB)
    // Filters and prioritizes items in the visitor's selected language
    // -------------------------------------------------------------
    try {
      const kbItems = await supportRepository.getKnowledgeBase({
        status: 'PUBLISHED',
      });

      // Filter by language if specified, prioritizing items in the active language
      const langKbItems = kbItems.filter(
        (item) => !item.language || item.language.toLowerCase() === activeLang
      );

      for (const item of (langKbItems.length > 0 ? langKbItems : kbItems)) {
        // Guard against mismatching languages: do not serve a foreign KB answer
        if (item.language && item.language.toLowerCase() !== activeLang) continue;

        const itemQ = (item.question || '').toLowerCase().trim();
        if (!itemQ) continue;

        const phrases = itemQ
          .split(/[/,|;]/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0);

        const isMatch =
          q === itemQ ||
          (q.length > 15 && itemQ.includes(q)) ||
          (itemQ.length > 15 && q.includes(itemQ)) ||
          phrases.some((phrase) => {
            if (q === phrase) return true;
            if (phrase.length >= 3) {
              const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              return new RegExp(`(^|\\s)${escaped}(\\s|$|\\?|!|\\.)`, 'i').test(q);
            }
            return false;
          });

        if (isMatch) {
          let resolvedAnswer = item.answer.replace(/\{(?:name|concierge_name|support_name|concierge)\}/gi, name);

          if (name !== 'Elena' && name !== 'Juma') {
            resolvedAnswer = resolvedAnswer.replace(/\b(Elena|Juma)\b/g, name);
          }

          return {
            replyText: resolvedAnswer,
            intent: `kb_${item.category.toLowerCase().replace(/\s+/g, '_')}`,
            confidence: 0.96,
            knowledge_source: `KNOWLEDGE_BASE_${item.id}`,
            decision: 'AUTO_ANSWER',
          };
        }
      }
    } catch {
      // Continue to deterministic engine
    }

    // -------------------------------------------------------------
    // RULE 4: SIMPLE GREETINGS & PLEASANTRIES (Instant Auto Answer)
    // -------------------------------------------------------------

    // A. Evening greeting
    if (/\b(malam|selamat malam|good evening|soir|bonsoir|buonasera|buenas noches|dobry wieczór|مساء الخير|晚上好)\b/i.test(q)) {
      return {
        replyText: resolveGreeting(getLocalized(GREETINGS.evening, activeLang)),
        action: { label: getActionLabel('view_villas'), actionType: 'SCROLL', target: 'stay' },
        intent: 'greeting_evening',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // B. Daytime greeting (morning / afternoon)
    if (/\b(pagi|selamat pagi|siang|selamat siang|sore|selamat sore|good morning|good afternoon|bonjour|buongiorno|buenos días|dzień dobry|صباح الخير|早上好|下午好)\b/i.test(q)) {
      return {
        replyText: resolveGreeting(getLocalized(GREETINGS.daytime, activeLang)),
        action: { label: getActionLabel('view_villas'), actionType: 'SCROLL', target: 'stay' },
        intent: 'greeting_daytime',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // C. General greeting (hello / hi / jambo)
    const nameGreetingRegex = new RegExp(`\\b(halo|hi|hello|hey)\\s+(${nameEscaped}|elena|juma)\\b`, 'i');
    if (
      /^(halo|hai|hi|hello|hey|jambo|habari|hola|ciao|salut|cześć|مرحبا|你好)[\s!.?]*$/i.test(q) ||
      nameGreetingRegex.test(q) ||
      /\b(selamat datang)\b/i.test(q)
    ) {
      return {
        replyText: resolveGreeting(getLocalized(GREETINGS.general, activeLang)),
        action: { label: getActionLabel('explore_sanctuary'), actionType: 'SCROLL', target: 'itinerary' },
        intent: 'greeting_general',
        confidence: 0.98,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // D. Thank you
    if (/\b(terima kasih|makasih|matur suwun|thank you|thanks|asante|merci|grazie|gracias|dzięk|dzieki|شكرا|谢谢)\b/i.test(q)) {
      return {
        replyText: getLocalized(GREETINGS.thanks, activeLang),
        intent: 'polite_thank_you',
        confidence: 0.96,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // E. Acknowledgement (ok, fine, sure)
    if (/^(ok|oke|okay|baik|siap|noted|siap kak|siap min|roger|alright|fine|yes|ya)[\s!.?]*$/i.test(q)) {
      return {
        replyText: getLocalized(GREETINGS.acknowledgement, activeLang),
        intent: 'polite_acknowledgement',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // F. Identity inquiry (who are you / siapa kamu)
    const identityRegex = new RegExp(`\\b(siapa kamu|kamu siapa|who are you|siapa ini|qui êtes-vous|wewe ni nani|quién eres|chi sei|kim jesteś|من أنت|你是谁|bot atau|apakah bot|(${nameEscaped}|elena|juma) itu siapa)\\b`, 'i');
    if (identityRegex.test(q)) {
      return {
        replyText: resolveGreeting(getLocalized(GREETINGS.identity, activeLang)),
        intent: 'faq_identity',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // -------------------------------------------------------------
    // RULE 5: COMMON FAQS (Answered Strictly in Visitor's Language)
    // -------------------------------------------------------------

    // 1. Villa Rates, Pricing, Cost Inquiry (Prioritized when cost/price is mentioned)
    const villaRateKeywords = [
      'cost', 'price', 'rate', 'how much', 'tarif', 'harga', 'sewa', 'biaya', 'combien',
      'prix', 'coût', 'cuanto', 'precio', 'tarifa', 'quanto', 'costa', 'prezzo', 'ile',
      'cena', 'koszt', 'bei', 'gharama', 'سعر', 'كم', 'تكلفة', '多少钱', '价格', '房价'
    ];
    const isPriceOrRateInquiry = villaRateKeywords.some((k) => q.includes(k));
    const isVillaMentioned = /\b(villa|sanctuary|suite|bungalow|room|stay|kamar|chambre|chumba|habitación|pokój|فلل|فيلا|别墅)\b/i.test(q);

    if (isPriceOrRateInquiry && isVillaMentioned) {
      return {
        replyText: getLocalized(FAQ_REPLIES.villas_rates, activeLang),
        action: { label: getActionLabel('book_villa'), actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_villas_rates',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 2. Check-in & Check-out
    const checkinKeywords = ['check-in', 'checkin', 'check out', 'checkout', 'horaires', 'muda wa kuingia', 'horario', 'arrived', 'departure', 'jam masuk', 'waktu masuk', 'jam berapa masuk', 'jam keluar', 'wymeldowani', 'zameldowani', '入住', '退房', 'الوصول', 'المغادرة'];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.checkin, activeLang),
        action: { label: getActionLabel('book_villa'), actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_checkin_checkout',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 3. Wi-Fi / Starlink
    const wifiKeywords = ['wifi', 'wi-fi', 'internet', 'speed', 'starlink', 'network', 'koneksi', 'sinyal', 'connect', 'online', 'ستارلينك', '星链', '无线'];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.wifi, activeLang),
        action: { label: getActionLabel('check_villa'), actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_starlink_wifi',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 4. Pools & Beach
    const poolKeywords = ['pool', 'plunge', 'swim', 'beach', 'ocean', 'piscine', 'bwawa', 'piscina', 'pantai', 'kolam', 'renang', 'basen', 'المسبح', 'الشاطئ', '泳池', '沙滩'];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.pools_beach, activeLang),
        action: { label: getActionLabel('view_villas'), actionType: 'SCROLL', target: 'stay' },
        intent: 'faq_pools_beach',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 5. Transfers & Airport
    const transferKeywords = ['airport', 'transfer', 'location', 'where', 'car', 'distance', 'arrive', 'driver', 'taxi', 'shuttle', 'jemput', 'antar jemput', 'bandara', 'lokasi', 'dimana', 'alamat', 'jauh', 'usafiri', 'مطار', '接送'];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.transfers, activeLang),
        action: { label: getActionLabel('view_transfers'), actionType: 'SCROLL', target: 'shuttle' },
        intent: 'faq_transfers',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 6. Dining / Food / Breakfast
    const diningKeywords = ['din', 'food', 'restaurant', 'chef', 'breakfast', 'menu', 'lunch', 'eat', 'drink', 'makan', 'makanan', 'sarapan', 'restoran', 'kuliner', 'halal', 'seafood', 'cuisine', 'chakula', 'comida', 'مطعم', '餐厅'];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.dining, activeLang),
        action: { label: getActionLabel('view_dining'), actionType: 'SCROLL', target: 'dining' },
        intent: 'faq_dining',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 7. Safari: Serengeti
    if (q.includes('serengeti') || q.includes('great migration') || q.includes('سيرينجيتي') || q.includes('塞伦盖蒂')) {
      return {
        replyText: getLocalized(FAQ_REPLIES.serengeti, activeLang),
        action: { label: getActionLabel('view_safari'), actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_serengeti',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 8. Safari: Ngorongoro
    if (q.includes('ngorongoro') || q.includes('crater') || q.includes('نجورونجورو') || q.includes('火山口')) {
      return {
        replyText: getLocalized(FAQ_REPLIES.ngorongoro, activeLang),
        action: { label: getActionLabel('explore_ngorongoro'), actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_ngorongoro',
        confidence: 0.95,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 9. Safari: Kilimanjaro
    if (q.includes('kilimanjaro') || q.includes('kilimangiaro') || q.includes('كليمنجارو') || q.includes('乞力马扎罗')) {
      return {
        replyText: getLocalized(FAQ_REPLIES.kilimanjaro, activeLang),
        action: { label: getActionLabel('plan_kilimanjaro'), actionType: 'SCROLL', target: 'tanzania' },
        intent: 'safari_kilimanjaro',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 10. Dolphins / Menai Bay
    const dolphinKeywords = ['dolphin', 'lumba', 'pomboo', 'dauphin', 'delfin', 'دلافين', '海豚'];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.dolphins, activeLang),
        action: { label: getActionLabel('explore_dolphins'), actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_dolphins',
        confidence: 0.94,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 11. Dhow / Sunset Cruise
    const dhowKeywords = ['dhow', 'sunset', 'perahu', 'kapal', 'jahazi', 'layar', 'senja', 'matahari terbenam', 'voilier', 'قارب', 'الداو', '木船'];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.dhow, activeLang),
        action: { label: getActionLabel('view_sunset_sailing'), actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_sunset_dhow',
        confidence: 0.93,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 12. Spa & Wellness
    const spaKeywords = ['spa', 'massage', 'pijat', 'masaji', 'relaksasi', 'bien-être', 'تدليك', '水疗', '按摩', 'wellness'];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.spa, activeLang),
        action: { label: getActionLabel('view_spa'), actionType: 'SCROLL', target: 'experiences' },
        intent: 'experience_spa',
        confidence: 0.92,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 13. General Villa & Room inquiry
    const generalVillaKeywords = ['villa', 'stay', 'room', 'bungalow', 'kamar', 'chambre', 'chumba', 'habitación', 'pokój', 'فلل', 'فيلا', '别墅'];
    if (generalVillaKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.villas_rates, activeLang),
        action: { label: getActionLabel('book_villa'), actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_villas_rates',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // 14. Payment & Cancellation
    const paymentKeywords = ['payment', 'pay', 'cancel', 'deposit', 'card', 'visa', 'mastercard', 'bayar', 'pembayaran', 'batal', 'pembatalan', 'kartu kredit', 'malipo', 'الدفع', '支付'];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        replyText: getLocalized(FAQ_REPLIES.payment, activeLang),
        action: { label: getActionLabel('book_villa'), actionType: 'MODAL', target: 'booking_modal' },
        intent: 'faq_payment_cancellation',
        confidence: 0.90,
        knowledge_source: 'DETERMINISTIC_FAQ',
        decision: 'AUTO_ANSWER',
      };
    }

    // -------------------------------------------------------------
    // RULE 6: DETAILED / UNRECOGNIZED QUERY -> HANDOFF TO HUMAN ADMIN
    // -------------------------------------------------------------
    return {
      replyText: fallbackHandoff,
      intent: 'detailed_inquiry_handed_to_admin',
      confidence: 0.45,
      knowledge_source: 'NONE',
      decision: 'HANDOFF_TO_HUMAN',
      handoffReason: 'Query contains detailed, unverified, or specialized requirements forwarded for direct admin response.',
    };
  }

  /**
   * Generates a suggested reply for the human admin when HUMAN_ACTIVE is set.
   */
  generateSuggestedReplyForAdmin(
    lastVisitorMessage: string,
    _history: { sender: string; text: string }[]
  ): string {
    const q = lastVisitorMessage.toLowerCase();

    if (q.includes('dinner') && (q.includes('candlelight') || q.includes('beach'))) {
      return 'Yes, we can check availability for a private candlelight dinner on the beach. May I confirm the preferred date, time, and any specific dietary preferences for your party?';
    }

    if (q.includes('transfer') || q.includes('airport') || q.includes('pickup')) {
      return 'Yes, private VIP airport transfers can be arranged subject to availability. May I confirm your flight number and expected arrival date?';
    }

    if (q.includes('safari') || q.includes('serengeti') || q.includes('ngorongoro')) {
      return 'We would be delighted to customize your Tanzania safari fly-in itinerary. How many nights would you like to dedicate to the game drives, and do you have a preferred travel month?';
    }

    if (q.includes('villa') || q.includes('room') || q.includes('book') || q.includes('stay')) {
      return 'Jambo! I would be pleased to review our direct sanctuary availability for your requested dates. Could you kindly share your preferred check-in and check-out schedule?';
    }

    return 'Jambo! Thank you for contacting our concierge team directly. I am reviewing the details of your inquiry right now and will assist you immediately.';
  }
}

export const supportAiEngine = new SupportAiEngine();
