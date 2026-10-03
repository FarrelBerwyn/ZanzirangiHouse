import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, UserCheck } from 'lucide-react';
import { Language } from '../types';
import { CHAT_TRANSLATIONS, ChatQuickPrompt, formatWelcomeMessage } from '../data/chatTranslations';
import { ScrollFadeContainer } from './ScrollFadeContainer';
import { supportApi } from '../services/supportApi';
import { contentApi } from '../services/contentApi';
import { DEFAULT_SETTINGS } from '../data/seedDefaults';
import { SupportActionMetadata } from '../../server/database/supportTypes';

// Copy for the offline (local) bot replies that have no counterpart in CHAT_TRANSLATIONS,
// plus the action button labels and staff/avatar labels used by this widget.
interface ChatLocalCopy {
  replies: {
    serengeti: string;
    ngorongoro: string;
    kilimanjaro: string;
    tarangire: string;
    itinerary: string;
    reservation: string;
    safari: string;
    concierge: string;
  };
  actions: {
    viewSafariDestinations: string;
    exploreNgorongoro: string;
    planKilimanjaro: string;
    viewTarangire: string;
    bookWithConcierge: string;
    exploreStoneTown: string;
    discoverMnemba: string;
    viewSpiceJourney: string;
    sunsetDhowDetails: string;
    checkVillaFeatures: string;
    exploreDolphins: string;
    viewSunsetSailing: string;
    viewWellness: string;
    discoverIslandTours: string;
    exploreFamilyVillas: string;
    planHoneymoon: string;
    exploreMarine: string;
    viewPrivateVillas: string;
    viewTransfer: string;
    tasteDiningGarden: string;
    planStay: string;
  };
  conciergeStaff: string;
  avatarAlt: string;
}

const CHAT_LOCAL_I18N: Record<Language, ChatLocalCopy> = {
  en: {
    replies: {
      serengeti: 'Serengeti National Park is an extraordinary safari experience. Zanzirangi House arranges direct chartered fly-in safaris from Zanzibar airport (approx. 1h 45m) with luxury partner tented camps overlooking migration corridors.',
      ngorongoro: 'Ngorongoro Crater offers Africa’s densest predator populations inside a UNESCO volcanic caldera. We organize chartered fly-in packages combining your beach retreat with panoramic crater floor game drives.',
      kilimanjaro: 'Mount Kilimanjaro expeditions and scenic fly-over safaris are arranged through our certified mainland mountain guide partners. We can curate pre-climb acclimatization stays or relaxing post-climb beach recovery.',
      tarangire: 'Tarangire National Park is celebrated for iconic baobab trees and vast elephant herds along the Tarangire River. We arrange chartered flight itineraries directly from Zanzibar.',
      itinerary: 'I would be delighted to personalize your multi-day Tanzania journey! Our team will harmonize your island villa stay with your chosen excursions and mainland safari flights.',
      reservation: 'Thank you for your reservation inquiry! Our on-site concierge team is reviewing your requested dates and villa preferences. We will confirm availability and bespoke rates directly with you.',
      safari: 'We organize chartered fly-in safaris directly from Zanzibar to Serengeti, Ngorongoro Crater, and Tarangire with luxury partner camps. Would you like to view our safari destinations?',
      concierge: 'Jambo! I am right here to help you arrange your custom stay and private services. Tell me your preferred dates, party size, or experiences and I will tailor everything to your rhythm.',
    },
    actions: {
      viewSafariDestinations: 'View Safari Destinations',
      exploreNgorongoro: 'Explore Ngorongoro',
      planKilimanjaro: 'Plan Safari & Kilimanjaro',
      viewTarangire: 'View Tarangire Safaris',
      bookWithConcierge: 'Book Dates with Concierge',
      exploreStoneTown: 'Explore Stone Town',
      discoverMnemba: 'Discover Mnemba',
      viewSpiceJourney: 'View Spice Journey',
      sunsetDhowDetails: 'Sunset Dhow Details',
      checkVillaFeatures: 'Check Villa Features',
      exploreDolphins: 'Explore Dolphin Safaris',
      viewSunsetSailing: 'View Sunset Sailing',
      viewWellness: 'View Wellness & Spa',
      discoverIslandTours: 'Discover Island Tours',
      exploreFamilyVillas: 'Explore Family Villas',
      planHoneymoon: 'Plan Honeymoon Escape',
      exploreMarine: 'Explore Marine Safaris',
      viewPrivateVillas: 'View Private Villas',
      viewTransfer: 'View Transfer Details',
      tasteDiningGarden: 'Taste Dining & Garden Menu',
      planStay: 'Plan Your Stay',
    },
    conciergeStaff: 'Concierge Staff',
    avatarAlt: 'Elena - Zanzirangi House Customer Support',
  },
  pl: {
    replies: {
      serengeti: 'Park Narodowy Serengeti to niezwykłe przeżycie safari. Zanzirangi House organizuje bezpośrednie loty czarterowe na safari z lotniska na Zanzibarze (ok. 1 godz. 45 min) z noclegiem w luksusowych obozach namiotowych naszych partnerów, z widokiem na szlaki wielkiej migracji.',
      ngorongoro: 'Krater Ngorongoro, kaldera wulkaniczna wpisana na listę UNESCO, skrywa największe zagęszczenie drapieżników w Afryce. Organizujemy pakiety z lotami czarterowymi, łączące wypoczynek na plaży z panoramicznymi safari na dnie krateru.',
      kilimanjaro: 'Wyprawy na Kilimandżaro oraz widokowe przeloty nad górą organizujemy z certyfikowanymi przewodnikami górskimi z kontynentu. Możemy zaplanować pobyt aklimatyzacyjny przed wspinaczką lub relaksującą regenerację na plaży po zejściu.',
      tarangire: 'Park Narodowy Tarangire słynie z majestatycznych baobabów i ogromnych stad słoni nad rzeką Tarangire. Organizujemy plany podróży z lotami czarterowymi bezpośrednio z Zanzibaru.',
      itinerary: 'Z przyjemnością przygotuję dla Ciebie wielodniową podróż po Tanzanii! Nasz zespół połączy pobyt w willi na wyspie z wybranymi wycieczkami i lotami na safari na kontynencie.',
      reservation: 'Dziękujemy za zapytanie o rezerwację! Nasz zespół konsjerżów na miejscu weryfikuje wybrane terminy i preferencje dotyczące willi. Potwierdzimy dostępność i indywidualne stawki bezpośrednio z Tobą.',
      safari: 'Organizujemy safari z lotami czarterowymi bezpośrednio z Zanzibaru do Serengeti, krateru Ngorongoro i Tarangire, z noclegami w luksusowych obozach partnerskich. Czy chcesz zobaczyć nasze kierunki safari?',
      concierge: 'Jambo! Jestem tutaj, aby pomóc Ci zaplanować wymarzony pobyt i prywatne usługi. Podaj preferowane terminy, liczbę gości lub interesujące Cię atrakcje, a wszystko dopasuję do Twojego rytmu.',
    },
    actions: {
      viewSafariDestinations: 'Zobacz kierunki safari',
      exploreNgorongoro: 'Odkryj Ngorongoro',
      planKilimanjaro: 'Zaplanuj safari i Kilimandżaro',
      viewTarangire: 'Zobacz safari w Tarangire',
      bookWithConcierge: 'Ustal terminy z konsjerżem',
      exploreStoneTown: 'Odkryj Stone Town',
      discoverMnemba: 'Odkryj Mnemba',
      viewSpiceJourney: 'Zobacz szlak przypraw',
      sunsetDhowDetails: 'Szczegóły rejsu dhow',
      checkVillaFeatures: 'Zobacz udogodnienia willi',
      exploreDolphins: 'Odkryj safari z delfinami',
      viewSunsetSailing: 'Rejsy o zachodzie słońca',
      viewWellness: 'Zobacz spa i wellness',
      discoverIslandTours: 'Odkryj wycieczki po wyspie',
      exploreFamilyVillas: 'Odkryj wille rodzinne',
      planHoneymoon: 'Zaplanuj podróż poślubną',
      exploreMarine: 'Odkryj safari morskie',
      viewPrivateVillas: 'Zobacz prywatne wille',
      viewTransfer: 'Szczegóły transferu',
      tasteDiningGarden: 'Odkryj menu i ogród',
      planStay: 'Zaplanuj pobyt',
    },
    conciergeStaff: 'Zespół konsjerżów',
    avatarAlt: 'Elena – obsługa klienta Zanzirangi House',
  },
  ar: {
    replies: {
      serengeti: 'منتزه سيرينغيتي الوطني تجربة سفاري استثنائية. يرتب Zanzirangi House رحلات سفاري جوية مستأجرة مباشرة من مطار زنجبار (حوالي ساعة و45 دقيقة) مع الإقامة في مخيمات فاخرة لشركائنا تطل على ممرات الهجرة الكبرى.',
      ngorongoro: 'تضم فوهة نغورونغورو أكثف تجمعات للحيوانات المفترسة في أفريقيا داخل كالديرا بركانية مدرجة على قائمة اليونسكو. ننظم باقات طيران مستأجرة تجمع بين ملاذكم الشاطئي ورحلات سفاري بانورامية في قاع الفوهة.',
      kilimanjaro: 'نرتب رحلات تسلق جبل كليمنجارو ورحلات الطيران الخلابة فوقه عبر شركائنا المعتمدين من مرشدي الجبال في البر الرئيسي، ويمكننا تنظيم إقامة للتأقلم قبل التسلق أو فترة استجمام مريحة على الشاطئ بعده.',
      tarangire: 'يشتهر منتزه تارانغيري الوطني بأشجار الباوباب الأيقونية وقطعان الفيلة الضخمة على امتداد نهر تارانغيري. نرتب برامج رحلات جوية مستأجرة مباشرة من زنجبار.',
      itinerary: 'يسعدني أن أصمم لكم رحلة متعددة الأيام في تنزانيا! سينسق فريقنا إقامتكم في الفيلا على الجزيرة مع الرحلات التي تختارونها ورحلات السفاري الجوية إلى البر الرئيسي.',
      reservation: 'شكرًا لاستفساركم عن الحجز! يراجع فريق الكونسيرج لدينا التواريخ المطلوبة وتفضيلاتكم للفيلا، وسنؤكد لكم التوفر والأسعار المخصصة مباشرة.',
      safari: 'ننظم رحلات سفاري جوية مستأجرة مباشرة من زنجبار إلى سيرينغيتي وفوهة نغورونغورو وتارانغيري مع مخيمات شركائنا الفاخرة. هل ترغبون في استعراض وجهات السفاري لدينا؟',
      concierge: 'جامبو! أنا هنا لمساعدتكم في ترتيب إقامتكم المخصصة وخدماتكم الخاصة. أخبروني بالتواريخ المفضلة وعدد الضيوف أو التجارب التي تودونها، وسأصمم كل شيء وفق إيقاعكم.',
    },
    actions: {
      viewSafariDestinations: 'استعراض وجهات السفاري',
      exploreNgorongoro: 'استكشاف نغورونغورو',
      planKilimanjaro: 'خططوا للسفاري وكليمنجارو',
      viewTarangire: 'استعراض رحلات تارانغيري',
      bookWithConcierge: 'حدّدوا التواريخ مع الكونسيرج',
      exploreStoneTown: 'استكشاف المدينة الحجرية',
      discoverMnemba: 'اكتشاف جزيرة منيمبا',
      viewSpiceJourney: 'استعراض رحلة التوابل',
      sunsetDhowDetails: 'تفاصيل رحلة الداو عند الغروب',
      checkVillaFeatures: 'استعراض مزايا الفيلا',
      exploreDolphins: 'استكشاف رحلات الدلافين',
      viewSunsetSailing: 'الإبحار عند الغروب',
      viewWellness: 'استعراض السبا والعافية',
      discoverIslandTours: 'اكتشاف جولات الجزيرة',
      exploreFamilyVillas: 'استكشاف الفلل العائلية',
      planHoneymoon: 'خططوا لشهر العسل',
      exploreMarine: 'استكشاف رحلات السفاري البحرية',
      viewPrivateVillas: 'استعراض الفلل الخاصة',
      viewTransfer: 'تفاصيل خدمة النقل',
      tasteDiningGarden: 'استكشاف قائمة الطعام والحديقة',
      planStay: 'خططوا لإقامتكم',
    },
    conciergeStaff: 'فريق الكونسيرج',
    avatarAlt: 'جمعة - خدمة عملاء Zanzirangi House',
  },
  zh: {
    replies: {
      serengeti: '塞伦盖蒂国家公园是非凡的猎游体验。Zanzirangi House 可安排从桑给巴尔机场直飞的包机猎游（约 1 小时 45 分钟），入住俯瞰动物大迁徙通道的奢华合作帐篷营地。',
      ngorongoro: '恩戈罗恩戈罗火山口是联合国教科文组织世界遗产，火山口内拥有非洲最密集的掠食动物群。我们提供包机套餐，将您的海滩度假与火山口底部全景猎游完美结合。',
      kilimanjaro: '我们与大陆认证登山向导合作，安排乞力马扎罗山登山探险及观光飞行，还可为您定制登山前的适应性住宿，或登山后的海滩休养之旅。',
      tarangire: '塔兰吉雷国家公园以标志性的猴面包树和塔兰吉雷河畔庞大的象群而闻名。我们可安排从桑给巴尔直飞的包机行程。',
      itinerary: '非常乐意为您量身定制多日坦桑尼亚之旅！我们的团队将把您的海岛别墅住宿与您选择的游览项目及大陆猎游航班完美衔接。',
      reservation: '感谢您的预订咨询！我们的驻地礼宾团队正在核对您所需的日期与别墅偏好，并将直接与您确认房态及专属价格。',
      safari: '我们提供从桑给巴尔直飞塞伦盖蒂、恩戈罗恩戈罗火山口和塔兰吉雷的包机猎游，入住奢华合作营地。您想了解我们的猎游目的地吗？',
      concierge: 'Jambo！我随时为您安排定制住宿与私人服务。请告诉我您偏好的日期、出行人数或想要的体验，我将按照您的节奏为您量身打造一切。',
    },
    actions: {
      viewSafariDestinations: '查看猎游目的地',
      exploreNgorongoro: '探索恩戈罗恩戈罗',
      planKilimanjaro: '规划猎游与乞力马扎罗',
      viewTarangire: '查看塔兰吉雷猎游',
      bookWithConcierge: '与礼宾确认日期',
      exploreStoneTown: '探索石头城',
      discoverMnemba: '发现姆纳巴岛',
      viewSpiceJourney: '查看香料之旅',
      sunsetDhowDetails: '日落帆船详情',
      checkVillaFeatures: '查看别墅设施',
      exploreDolphins: '探索海豚之旅',
      viewSunsetSailing: '查看日落航行',
      viewWellness: '查看水疗与养生',
      discoverIslandTours: '发现海岛之旅',
      exploreFamilyVillas: '探索家庭别墅',
      planHoneymoon: '规划蜜月之旅',
      exploreMarine: '探索海洋之旅',
      viewPrivateVillas: '查看私享别墅',
      viewTransfer: '查看接送详情',
      tasteDiningGarden: '品味餐饮与花园菜单',
      planStay: '规划您的入住',
    },
    conciergeStaff: '礼宾团队',
    avatarAlt: '朱马 - Zanzirangi House 客户服务',
  },
  fr: {
    replies: {
      serengeti: 'Le parc national du Serengeti offre une expérience de safari extraordinaire. Zanzirangi House organise des safaris en vol charter direct depuis l’aéroport de Zanzibar (env. 1 h 45) avec des camps de toile de luxe partenaires surplombant les couloirs de la grande migration.',
      ngorongoro: 'Le cratère du Ngorongoro, caldeira volcanique classée à l’UNESCO, abrite la plus forte concentration de prédateurs d’Afrique. Nous organisons des forfaits en vol charter associant votre séjour balnéaire à des safaris panoramiques au fond du cratère.',
      kilimanjaro: 'Les expéditions au Kilimandjaro et les survols panoramiques sont organisés avec nos guides de montagne certifiés sur le continent. Nous pouvons prévoir un séjour d’acclimatation avant l’ascension ou une récupération relaxante à la plage après.',
      tarangire: 'Le parc national de Tarangire est réputé pour ses baobabs emblématiques et ses immenses troupeaux d’éléphants le long de la rivière Tarangire. Nous organisons des itinéraires en vol charter directement depuis Zanzibar.',
      itinerary: 'Je serais ravi de personnaliser votre voyage de plusieurs jours en Tanzanie ! Notre équipe harmonisera votre séjour en villa sur l’île avec les excursions de votre choix et vos vols de safari vers le continent.',
      reservation: 'Merci pour votre demande de réservation ! Notre équipe de conciergerie sur place examine vos dates et vos préférences de villa. Nous vous confirmerons directement la disponibilité et nos tarifs personnalisés.',
      safari: 'Nous organisons des safaris en vol charter directement depuis Zanzibar vers le Serengeti, le cratère du Ngorongoro et Tarangire, avec des camps de luxe partenaires. Souhaitez-vous découvrir nos destinations de safari ?',
      concierge: 'Jambo ! Je suis là pour vous aider à organiser votre séjour sur mesure et vos services privés. Indiquez-moi vos dates, le nombre de voyageurs ou les expériences souhaitées, et j’adapterai tout à votre rythme.',
    },
    actions: {
      viewSafariDestinations: 'Voir les destinations safari',
      exploreNgorongoro: 'Explorer le Ngorongoro',
      planKilimanjaro: 'Planifier safari & Kilimandjaro',
      viewTarangire: 'Voir les safaris à Tarangire',
      bookWithConcierge: 'Fixer les dates avec le concierge',
      exploreStoneTown: 'Explorer Stone Town',
      discoverMnemba: 'Découvrir Mnemba',
      viewSpiceJourney: 'Voir la route des épices',
      sunsetDhowDetails: 'Détails du dhow au couchant',
      checkVillaFeatures: 'Voir les atouts des villas',
      exploreDolphins: 'Explorer les safaris dauphins',
      viewSunsetSailing: 'Voir les croisières au couchant',
      viewWellness: 'Voir spa & bien-être',
      discoverIslandTours: 'Découvrir les excursions sur l’île',
      exploreFamilyVillas: 'Explorer les villas familiales',
      planHoneymoon: 'Planifier votre lune de miel',
      exploreMarine: 'Explorer les safaris marins',
      viewPrivateVillas: 'Voir les villas privées',
      viewTransfer: 'Détails du transfert',
      tasteDiningGarden: 'Découvrir la carte & le jardin',
      planStay: 'Planifier votre séjour',
    },
    conciergeStaff: 'Équipe de conciergerie',
    avatarAlt: 'Elena - Service client Zanzirangi House',
  },
  sw: {
    replies: {
      serengeti: 'Hifadhi ya Taifa ya Serengeti ni uzoefu wa kipekee wa safari. Zanzirangi House hupanga safari za ndege za kukodi moja kwa moja kutoka uwanja wa ndege wa Zanzibar (takriban saa 1 na dakika 45) pamoja na kambi za kifahari za mahema za washirika wetu zinazotazama njia za uhamaji wa wanyama.',
      ngorongoro: 'Kreta ya Ngorongoro ina idadi kubwa zaidi ya wanyama wawindaji barani Afrika ndani ya kasoko ya volkano iliyoorodheshwa na UNESCO. Tunaandaa vifurushi vya ndege za kukodi vinavyounganisha mapumziko yako ufukweni na safari za kuvutia ndani ya kreta.',
      kilimanjaro: 'Safari za kupanda Mlima Kilimanjaro na ndege za kutazama mandhari huandaliwa kupitia washirika wetu waongozaji wa milima waliothibitishwa wa Tanzania Bara. Tunaweza kupanga ukaaji wa kuzoea hali kabla ya kupanda au mapumziko ya ufukweni baada ya kupanda.',
      tarangire: 'Hifadhi ya Taifa ya Tarangire inasifika kwa mibuyu yake maarufu na makundi makubwa ya tembo kando ya Mto Tarangire. Tunapanga ratiba za ndege za kukodi moja kwa moja kutoka Zanzibar.',
      itinerary: 'Nitafurahi sana kukuandalia safari yako ya siku kadhaa Tanzania! Timu yetu itaoanisha ukaaji wako katika villa kisiwani na matembezi uliyochagua pamoja na ndege za safari kwenda Tanzania Bara.',
      reservation: 'Asante kwa ombi lako la uhifadhi! Timu yetu ya wahudumu inakagua tarehe ulizoomba na mapendeleo yako ya villa. Tutakuthibitishia nafasi na bei maalum moja kwa moja.',
      safari: 'Tunaandaa safari za ndege za kukodi moja kwa moja kutoka Zanzibar hadi Serengeti, Kreta ya Ngorongoro na Tarangire, pamoja na kambi za kifahari za washirika wetu. Ungependa kutazama vituo vyetu vya safari?',
      concierge: 'Jambo! Niko hapa kukusaidia kupanga ukaaji wako maalum na huduma binafsi. Niambie tarehe unazopendelea, idadi ya wageni, au uzoefu unaoutaka na nitaandaa kila kitu kulingana na mahitaji yako.',
    },
    actions: {
      viewSafariDestinations: 'Tazama Vituo vya Safari',
      exploreNgorongoro: 'Gundua Ngorongoro',
      planKilimanjaro: 'Panga Safari na Kilimanjaro',
      viewTarangire: 'Tazama Safari za Tarangire',
      bookWithConcierge: 'Panga Tarehe na Mhudumu',
      exploreStoneTown: 'Gundua Mji Mkongwe',
      discoverMnemba: 'Gundua Mnemba',
      viewSpiceJourney: 'Tazama Ziara ya Viungo',
      sunsetDhowDetails: 'Maelezo ya Jahazi la Machweo',
      checkVillaFeatures: 'Tazama Sifa za Villa',
      exploreDolphins: 'Gundua Safari za Pomboo',
      viewSunsetSailing: 'Tazama Safari za Machweo',
      viewWellness: 'Tazama Spa na Afya',
      discoverIslandTours: 'Gundua Ziara za Kisiwani',
      exploreFamilyVillas: 'Gundua Villa za Familia',
      planHoneymoon: 'Panga Fungate Yako',
      exploreMarine: 'Gundua Safari za Baharini',
      viewPrivateVillas: 'Tazama Villa Binafsi',
      viewTransfer: 'Maelezo ya Usafiri',
      tasteDiningGarden: 'Tazama Menyu ya Chakula na Bustani',
      planStay: 'Panga Ukaaji Wako',
    },
    conciergeStaff: 'Wahudumu wa Hoteli',
    avatarAlt: 'Elena - Huduma kwa Wateja Zanzirangi House',
  },
  es: {
    replies: {
      serengeti: 'El Parque Nacional del Serengeti es una experiencia de safari extraordinaria. Zanzirangi House organiza safaris en vuelo chárter directo desde el aeropuerto de Zanzíbar (aprox. 1 h 45 min) con campamentos de lujo asociados con vistas a los corredores de la gran migración.',
      ngorongoro: 'El cráter del Ngorongoro alberga la mayor densidad de depredadores de África dentro de una caldera volcánica declarada Patrimonio de la UNESCO. Organizamos paquetes con vuelos chárter que combinan su retiro de playa con safaris panorámicos por el fondo del cráter.',
      kilimanjaro: 'Las expediciones al Kilimanjaro y los vuelos panorámicos se organizan con nuestros guías de montaña certificados del continente. Podemos preparar estancias de aclimatación antes del ascenso o una relajante recuperación en la playa después.',
      tarangire: 'El Parque Nacional de Tarangire es célebre por sus icónicos baobabs y sus enormes manadas de elefantes a orillas del río Tarangire. Organizamos itinerarios en vuelo chárter directamente desde Zanzíbar.',
      itinerary: '¡Será un placer personalizar su viaje de varios días por Tanzania! Nuestro equipo armonizará su estancia en la villa de la isla con las excursiones que elija y los vuelos de safari al continente.',
      reservation: '¡Gracias por su solicitud de reserva! Nuestro equipo de conserjería está revisando las fechas solicitadas y sus preferencias de villa. Le confirmaremos directamente la disponibilidad y las tarifas personalizadas.',
      safari: 'Organizamos safaris en vuelo chárter directamente desde Zanzíbar al Serengeti, el cráter del Ngorongoro y Tarangire, con campamentos de lujo asociados. ¿Desea ver nuestros destinos de safari?',
      concierge: '¡Jambo! Estoy aquí para ayudarle a organizar su estancia personalizada y sus servicios privados. Indíqueme sus fechas preferidas, el número de huéspedes o las experiencias que desea y lo adaptaré todo a su ritmo.',
    },
    actions: {
      viewSafariDestinations: 'Ver destinos de safari',
      exploreNgorongoro: 'Explorar Ngorongoro',
      planKilimanjaro: 'Planificar safari y Kilimanjaro',
      viewTarangire: 'Ver safaris en Tarangire',
      bookWithConcierge: 'Reservar fechas con conserjería',
      exploreStoneTown: 'Explorar Stone Town',
      discoverMnemba: 'Descubrir Mnemba',
      viewSpiceJourney: 'Ver la ruta de las especias',
      sunsetDhowDetails: 'Detalles del dhow al atardecer',
      checkVillaFeatures: 'Ver detalles de la villa',
      exploreDolphins: 'Explorar safaris con delfines',
      viewSunsetSailing: 'Ver navegación al atardecer',
      viewWellness: 'Ver spa y bienestar',
      discoverIslandTours: 'Descubrir excursiones por la isla',
      exploreFamilyVillas: 'Explorar villas familiares',
      planHoneymoon: 'Planificar luna de miel',
      exploreMarine: 'Explorar safaris marinos',
      viewPrivateVillas: 'Ver villas privadas',
      viewTransfer: 'Detalles del traslado',
      tasteDiningGarden: 'Descubrir la carta y el huerto',
      planStay: 'Planificar su estancia',
    },
    conciergeStaff: 'Equipo de conserjería',
    avatarAlt: 'Elena - Atención al cliente de Zanzirangi House',
  },
  it: {
    replies: {
      serengeti: 'Il Parco Nazionale del Serengeti è un’esperienza di safari straordinaria. Zanzirangi House organizza safari con voli charter diretti dall’aeroporto di Zanzibar (circa 1 h 45 min) presso lussuosi campi tendati partner affacciati sui corridoi della grande migrazione.',
      ngorongoro: 'Il cratere di Ngorongoro, caldera vulcanica patrimonio UNESCO, ospita la più alta densità di predatori dell’Africa. Organizziamo pacchetti con voli charter che uniscono il vostro soggiorno al mare a safari panoramici sul fondo del cratere.',
      kilimanjaro: 'Le spedizioni sul Kilimanjaro e i voli panoramici sono organizzati con le nostre guide alpine certificate del continente. Possiamo pianificare soggiorni di acclimatamento prima della scalata o un rilassante recupero al mare dopo.',
      tarangire: 'Il Parco Nazionale di Tarangire è celebre per i suoi iconici baobab e le grandi mandrie di elefanti lungo il fiume Tarangire. Organizziamo itinerari con voli charter diretti da Zanzibar.',
      itinerary: 'Sarò lieto di personalizzare il vostro viaggio di più giorni in Tanzania! Il nostro team armonizzerà il soggiorno in villa sull’isola con le escursioni scelte e i voli safari verso il continente.',
      reservation: 'Grazie per la vostra richiesta di prenotazione! Il nostro team di concierge sta verificando le date richieste e le preferenze di villa. Vi confermeremo direttamente disponibilità e tariffe personalizzate.',
      safari: 'Organizziamo safari con voli charter diretti da Zanzibar al Serengeti, al cratere di Ngorongoro e a Tarangire, con lussuosi campi partner. Desiderate scoprire le nostre destinazioni safari?',
      concierge: 'Jambo! Sono qui per aiutarvi a organizzare il vostro soggiorno su misura e i servizi privati. Indicatemi le date preferite, il numero di ospiti o le esperienze desiderate e adatterò tutto ai vostri ritmi.',
    },
    actions: {
      viewSafariDestinations: 'Vedi destinazioni safari',
      exploreNgorongoro: 'Esplora Ngorongoro',
      planKilimanjaro: 'Pianifica safari e Kilimanjaro',
      viewTarangire: 'Vedi safari a Tarangire',
      bookWithConcierge: 'Fissa le date con il concierge',
      exploreStoneTown: 'Esplora Stone Town',
      discoverMnemba: 'Scopri Mnemba',
      viewSpiceJourney: 'Vedi il percorso delle spezie',
      sunsetDhowDetails: 'Dettagli dhow al tramonto',
      checkVillaFeatures: 'Vedi i servizi della villa',
      exploreDolphins: 'Esplora i safari con i delfini',
      viewSunsetSailing: 'Veleggiate al tramonto',
      viewWellness: 'Vedi spa e benessere',
      discoverIslandTours: 'Scopri i tour dell’isola',
      exploreFamilyVillas: 'Esplora le ville per famiglie',
      planHoneymoon: 'Pianifica la luna di miele',
      exploreMarine: 'Esplora i safari marini',
      viewPrivateVillas: 'Vedi le ville private',
      viewTransfer: 'Dettagli del transfer',
      tasteDiningGarden: 'Scopri menu e orto',
      planStay: 'Pianifica il soggiorno',
    },
    conciergeStaff: 'Staff concierge',
    avatarAlt: 'Elena - Assistenza clienti Zanzirangi House',
  },
};

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ChatAssistantProps {
  currentLang?: Language;
  onOpenBooking?: () => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  externalQuery?: string | null;
  onClearExternalQuery?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentLang = 'en',
  onOpenBooking,
  isOpen: controlledIsOpen,
  onToggleOpen,
  externalQuery,
  onClearExternalQuery,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (nextState: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(nextState);
    }
    setInternalIsOpen(nextState);
  };

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('AI_ACTIVE');
  const visitorSessionRef = useRef(supportApi.getOrCreateVisitorSession());

  // Dynamic Customer Support Profile & Avatar configured from Admin
  // Synchronous localStorage cache prevents flash of old avatar/name on page refresh
  const SUPPORT_PROFILE_STORAGE_KEY = 'zanzirangi_support_profile';

  const [supportAvatar, setSupportAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SUPPORT_PROFILE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportAvatar) return parsed.supportAvatar;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportAvatar || '/zanzirangi-logo-circle.png';
  });

  const [supportName, setSupportName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SUPPORT_PROFILE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportName) return parsed.supportName;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportName || 'Elena';
  });

  const [supportTitle, setSupportTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SUPPORT_PROFILE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportTitle) return parsed.supportTitle;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportTitle || 'Customer Support';
  });

  const [supportStatus, setSupportStatus] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(SUPPORT_PROFILE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.supportStatus) return parsed.supportStatus;
        }
      } catch {}
    }
    return DEFAULT_SETTINGS.supportStatus || 'Active 24/7';
  });

  const syncSupportCache = (data: {
    supportAvatar?: string;
    supportName?: string;
    supportTitle?: string;
    supportStatus?: string;
  }) => {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(SUPPORT_PROFILE_STORAGE_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        SUPPORT_PROFILE_STORAGE_KEY,
        JSON.stringify({ ...parsed, ...data })
      );
    } catch {}
  };

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getSettings()
      .then((s) => {
        if (!isMounted || !s) return;
        if (s.supportAvatar) setSupportAvatar(s.supportAvatar);
        if (s.supportName) setSupportName(s.supportName);
        if (s.supportTitle) setSupportTitle(s.supportTitle);
        if (s.supportStatus) setSupportStatus(s.supportStatus);

        syncSupportCache({
          supportAvatar: s.supportAvatar,
          supportName: s.supportName,
          supportTitle: s.supportTitle,
          supportStatus: s.supportStatus,
        });
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleProfileUpdated = (e: any) => {
      if (e.detail?.supportAvatar) setSupportAvatar(e.detail.supportAvatar);
      if (e.detail?.supportName) setSupportName(e.detail.supportName);
      if (e.detail?.supportTitle) setSupportTitle(e.detail.supportTitle);
      if (e.detail?.supportStatus) setSupportStatus(e.detail.supportStatus);

      syncSupportCache({
        supportAvatar: e.detail?.supportAvatar,
        supportName: e.detail?.supportName,
        supportTitle: e.detail?.supportTitle,
        supportStatus: e.detail?.supportStatus,
      });
    };
    window.addEventListener('zanzirangi-support-profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('zanzirangi-support-profile-updated', handleProfileUpdated);
  }, []);

  const t = CHAT_TRANSLATIONS[currentLang] || CHAT_TRANSLATIONS.en;
  const local = CHAT_LOCAL_I18N[currentLang] || CHAT_LOCAL_I18N.en;
  const isRtl = currentLang === 'ar';

  const [shuffledPrompts, setShuffledPrompts] = useState<ChatQuickPrompt[]>(() => {
    const list = [...(CHAT_TRANSLATIONS[currentLang] || CHAT_TRANSLATIONS.en).quickPrompts];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  });

  // Reshuffle recommendations randomly each time the chat is opened or language changes
  useEffect(() => {
    if (isOpen) {
      const list = [...t.quickPrompts];
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      setShuffledPrompts(list);
    }
  }, [isOpen, currentLang]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: formatWelcomeMessage(t.welcomeMessage, supportName),
      timestamp: t.justNow,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLDivElement>(null);
  const prevLangRef = useRef<Language>(currentLang);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(target) &&
        triggerBtnRef.current &&
        !triggerBtnRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const isLangChange = prevLangRef.current !== currentLang;
    prevLangRef.current = currentLang;

    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: formatWelcomeMessage(t.welcomeMessage, supportName),
            timestamp: t.justNow,
          },
        ];
      }
      if (isLangChange) {
        return [
          ...prev,
          {
            id: `lang-switch-${Date.now()}`,
            sender: 'bot',
            text: formatWelcomeMessage(t.welcomeMessage, supportName),
            timestamp: t.justNow,
          },
        ];
      }
      return prev.map((m) => {
        if (m.id === 'welcome' || m.id.startsWith('lang-switch-')) {
          return {
            ...m,
            text: formatWelcomeMessage(t.welcomeMessage, supportName),
          };
        }
        return m;
      });
    });
  }, [supportName, currentLang, t.welcomeMessage, t.justNow]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const resolveAction = (action?: SupportActionMetadata) => {
    if (!action) return undefined;
    return {
      label: action.label,
      onClick: () => {
        if (action.actionType === 'MODAL' || action.target === 'booking_modal') {
          if (onOpenBooking) onOpenBooking();
          else scrollToSection('stay');
        } else if (action.target) {
          scrollToSection(action.target);
        }
      },
    };
  };

  const initConversation = useCallback(async (bookingContext?: any) => {
    try {
      const session = visitorSessionRef.current;
      const res = await supportApi.initVisitorConversation({
        visitor_id: session.visitorId,
        session_id: session.sessionId,
        language: currentLang,
        current_page: typeof window !== 'undefined' ? window.location.pathname : '/',
        booking_id: bookingContext?.bookingId || null,
        metadata: bookingContext || null,
      });

      if (res.conversation) {
        setConversationId(res.conversation.id);
        setConversationStatus(res.conversation.status);
      }

      if (res.messages && res.messages.length > 0) {
        const mapped: Message[] = res.messages.map((m) => {
          let sender: 'bot' | 'user' | 'admin' | 'system' = 'bot';
          if (m.sender_type === 'VISITOR') sender = 'user';
          else if (m.sender_type === 'ADMIN') sender = 'admin';
          else if (m.sender_type === 'SYSTEM') sender = 'system';
          else sender = 'bot';

          const timeStr = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            id: m.id,
            sender,
            text: m.message,
            timestamp: timeStr,
            action: resolveAction(m.metadata?.action),
          };
        });
        setMessages(mapped);
      }
    } catch (err) {
      console.warn('Visitor conversation init failed, using local mode:', err);
    }
  }, [currentLang, onOpenBooking]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  const generateBotReply = (userQuery: string): { text: string; action?: { label: string; onClick: () => void } } => {
    const q = userQuery.toLowerCase();

    // Specific safari destinations
    if (q.includes('serengeti') || q.includes('great migration')) {
      return {
        text: local.replies.serengeti,
        action: {
          label: local.actions.viewSafariDestinations,
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('ngorongoro') || q.includes('crater')) {
      return {
        text: local.replies.ngorongoro,
        action: {
          label: local.actions.exploreNgorongoro,
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('kilimanjaro')) {
      return {
        text: local.replies.kilimanjaro,
        action: {
          label: local.actions.planKilimanjaro,
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    if (q.includes('tarangire')) {
      return {
        text: local.replies.tarangire,
        action: {
          label: local.actions.viewTarangire,
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    // Itinerary builder inquiries
    if (q.includes('itinerary') || q.includes('bespoke schedule') || q.includes('journey')) {
      return {
        text: local.replies.itinerary,
        action: {
          label: local.actions.bookWithConcierge,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // Specific Experiences
    if (q.includes('dolphin') || q.includes('kizimkazi')) {
      return {
        text: t.replies.dolphins,
        action: {
          label: currentUi.viewExperiences,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('stone town') || q.includes('heritage')) {
      return {
        text: t.replies.stonetown,
        action: {
          label: local.actions.exploreStoneTown,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('mnemba') || q.includes('snorkeling') || q.includes('diving')) {
      return {
        text: t.replies.diving,
        action: {
          label: local.actions.discoverMnemba,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('spice')) {
      return {
        text: t.replies.stonetown,
        action: {
          label: local.actions.viewSpiceJourney,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('dhow') || q.includes('sunset')) {
      return {
        text: t.replies.dhow,
        action: {
          label: local.actions.sunsetDhowDetails,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    if (q.includes('reservation') || q.includes('booking') || q.includes('submitted')) {
      return {
        text: local.replies.reservation,
        action: {
          label: currentUi.checkRooms,
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Check-in & Check-out times
    const checkinKeywords = ['check-in', 'checkin', 'check out', 'checkout', 'horaires', 'muda wa kuingia', 'horario', 'arrived', 'departure', 'jam masuk', 'waktu masuk', 'wymeldowani', 'zameldowani', '入住', '退房', 'الوصول', 'المغادرة'];
    if (checkinKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.checkin || 'Standard check-in is from 14:00 (2:00 PM) and check-out is until 11:00 AM. Flexible early check-in or late checkout can be accommodated based on villa availability.',
        action: {
          label: t.bookAction,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: High-Speed Wi-Fi
    const wifiKeywords = ['wifi', 'wi-fi', 'internet', 'speed', 'starlink', 'network', 'connect', 'online', 'wi-fi', 'ستارلينك', '星链', '无线'];
    if (wifiKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.wifi || 'High-speed Starlink satellite Wi-Fi (150+ Mbps) is complimentary across all private villas, gardens, and dining pavilions, ensuring reliable connectivity for streaming or remote work.',
        action: {
          label: local.actions.checkVillaFeatures,
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Payment & Cancellation Policy
    const paymentKeywords = ['payment', 'pay', 'cancel', 'deposit', 'card', 'visa', 'mastercard', 'amex', 'paiement', 'pago', 'malipo', 'bayar', 'pembayaran', 'płatnoś', 'anulac', 'الدفع', 'إلغاء', '付款', '取消'];
    if (paymentKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.payment || 'We accept major credit cards (Visa, MasterCard, Amex), international bank transfers, and mobile payments. Cancellation terms offer full flexibility up to 14 days prior to arrival.',
        action: {
          label: t.bookAction,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: Kizimkazi Dolphins
    const dolphinKeywords = ['dolphin', 'pomboo', 'dauphin', 'delfin', 'delfini', 'دلافين', 'دلفين', '海豚'];
    if (dolphinKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dolphins || 'Kizimkazi is world-famous for resident dolphin pods in the Menai Bay Conservation Area. We organize ethical sunrise dolphin safaris directly from our shore.',
        action: {
          label: local.actions.exploreDolphins,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Sunset Dhow Sailing
    const dhowKeywords = ['dhow', 'jahazi', 'dau', 'voilier', 'velero', 'قارب', 'الداو', '木船', '帆船'];
    if (dhowKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dhow || 'Glide across the turquoise Indian Ocean aboard a handcrafted wooden dhow while enjoying chilled Champagne and fresh Swahili canapés as the sun sets.',
        action: {
          label: local.actions.viewSunsetSailing,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Spa & Wellness Treatments
    const spaKeywords = ['spa', 'massage', 'masaji', 'bien-être', 'bienestar', 'odnowa', 'تدليك', 'سبا', '水疗', '按摩', 'wellness', 'therap'];
    if (spaKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.spa || 'Our in-villa wellness treatments feature cold-pressed Zanzibari coconut oils, clove and cinnamon body scrubs, and soothing deep-tissue massages performed on your private ocean deck.',
        action: {
          label: local.actions.viewWellness,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Private Candlelight Beach Dining
    const candleKeywords = ['candle', 'candlelight', 'chandelles', 'romantique', 'mishumaa', 'vela', 'velas', 'شموع', 'شمع', '烛光', 'świec'];
    if (candleKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.beachDining || 'We arrange unforgettable candlelit dinners directly on the soft white sands or elevated coral terraces with torchlight and a custom 5-course seafood tasting menu.',
        action: {
          label: currentUi.viewDining,
          onClick: () => scrollToSection('dining'),
        },
      };
    }

    // FAQ: Stone Town & Spice Tour
    const stonetownKeywords = ['stone town', 'spice', 'épices', 'viungo', 'especias', 'spezie', 'التوابل', 'المدينة الحجرية', '石头城', '香料', 'przypraw'];
    if (stonetownKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.stonetown || 'We organize private cultural journeys with local historians through UNESCO-listed Stone Town and organic spice plantations celebrating vanilla, cloves, and cardamom.',
        action: {
          label: local.actions.discoverIslandTours,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Family & Children Stays
    const familyKeywords = ['family', 'children', 'child', 'kid', 'famille', 'enfant', 'familia', 'niño', 'watoto', 'bambin', 'عائل', 'أطفال', '家庭', '儿童', 'rodzin'];
    if (familyKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.family || 'Families are warmly welcomed. We offer interconnecting villa sanctuaries, extra beds, tailored kids menus, and professional babysitting upon request.',
        action: {
          label: local.actions.exploreFamilyVillas,
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // FAQ: Honeymoon & Celebrations
    const honeymoonKeywords = ['honeymoon', 'anniversary', 'lune de miel', 'fungate', 'luna de miel', 'luna di miele', 'عسل', 'رومانس', '蜜月', 'młod', 'poślubn'];
    if (honeymoonKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.honeymoon || 'For honeymooners, we prepare complimentary chilled Champagne, fresh tropical floral arrangements, a private sunset dhow sail, and a romantic beach dinner under the stars.',
        action: {
          label: local.actions.planHoneymoon,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    // FAQ: Diving & Snorkeling
    const divingKeywords = ['dive', 'diving', 'snorkel', 'snorkeling', 'plongée', 'kuzamia', 'buceo', 'immersi', 'غوص', 'سنوركل', '潜水', '浮潜', 'nurkowan', 'reef', 'coral'];
    if (divingKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.diving || 'Partnering with certified PADI dive masters, we take you to the pristine reefs of Mnemba Atoll and Kizimkazi to observe sea turtles, manta rays, and vibrant marine life.',
        action: {
          label: local.actions.exploreMarine,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    // FAQ: Pools & Beach Access
    const poolKeywords = ['pool', 'plunge', 'swim', 'beach', 'ocean', 'piscine', 'bwawa', 'piscina', 'pantai', 'kolam', 'basen', 'المسبح', 'الشاطئ', '泳池', '沙滩'];
    if (poolKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.villas,
        action: {
          label: local.actions.viewPrivateVillas,
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    // General categories
    const safariKeywords = ['safari', 'wildlife', 'big five', 'fly-in', 'game drive', 'bush', 'serengeti', 'ngorongoro', 'سيرينجيتي', '塞伦盖蒂'];
    if (safariKeywords.some((k) => q.includes(k))) {
      return {
        text: local.replies.safari,
        action: {
          label: local.actions.viewSafariDestinations,
          onClick: () => scrollToSection('tanzania'),
        },
      };
    }

    const villaKeywords = [
      'villa', 'rate', 'price', 'stay', 'room', 'availab', 'suite', 'bungalow',
      'chambre', 'prix', 'tarif', 'nuit',
      'bei', 'ghorofa', 'chumba', 'kulala',
      'precio', 'tarifa', 'habitaci', 'estancia', 'noche',
      'prezzo', 'costo', 'camera', 'notte',
      'فلل', 'فيلا', 'سعر', 'اسعار', 'أسعار', 'غرفة', 'غرف', 'حجز', 'مسبح',
      '别墅', '价格', '房价', '房型', '套房', '空房', '预订',
    ];
    if (villaKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.villas,
        action: {
          label: t.checkAvailAction,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    const transferKeywords = [
      'airport', 'transfer', 'location', 'where', 'car', 'distance', 'arrive', 'driver', 'taxi', 'shuttle',
      'aéroport', 'aeroport', 'transport', 'voiture', 'chauffeur',
      'uwanja', 'ndege', 'usafiri', 'gari', 'umbali',
      'aeropuerto', 'traslado', 'transporte', 'coche',
      'aeroporto', 'trasferimento', 'auto',
      'مطار', 'توصيل', 'نقل', 'سيارة', 'سائق', 'مسافة', 'موقع',
      '机场', '接送', '专车', '距离', '怎么走', '位置',
    ];
    if (transferKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.transfer || 'We provide private VIP meet-and-greet and chauffeur shuttle transfers from Abeid Amani Karume International Airport (ZNZ) directly to our sanctuary in Kizimkazi.',
        action: {
          label: local.actions.viewTransfer,
          onClick: () => scrollToSection('shuttle'),
        },
      };
    }

    const diningKeywords = [
      'din', 'food', 'restaurant', 'chef', 'breakfast', 'menu', 'lunch', 'dinner', 'eat', 'drink', 'wine', 'beverage', 'juice', 'cuisine', 'garden',
      'manger', 'nourriture', 'repas', 'boisson', 'petit-déjeuner', 'déjeuner',
      'chakula', 'mgahawa', 'vinywaji', 'kula', 'kinywaji',
      'comida', 'restaurante', 'cena', 'desayuno', 'bebida',
      'cibo', 'ristorante', 'pranzo', 'bevande',
      'مطعم', 'مطاعم', 'طعام', 'أكل', 'اكل', 'عشاء', 'غداء', 'إفطار', 'وجبة', 'مشروب', 'عصير', 'مشروبات',
      '餐厅', '餐饮', '美食', '菜', '早餐', '晚餐', '饮料', '酒', '厨师',
    ];
    if (diningKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.dining || 'Our gastronomic philosophy embraces organic garden-to-table produce and line-caught seafood with authentic Swahili and fine international dining.',
        action: {
          label: local.actions.tasteDiningGarden,
          onClick: () => scrollToSection('dining'),
        },
      };
    }

    const excursionKeywords = [
      'excursion', 'dhow', 'activity', 'tour', 'dolphin', 'experience', 'trip', 'adventure', 'mnemba', 'stone town', 'spice', 'jozani',
      'visite', 'croisière', 'dauphin', 'aventure', 'forêt',
      'matembezi', 'pomboo', 'jahazi', 'msitu',
      'excursión', 'excursion', 'delfines', 'paseo', 'selva',
      'escursione', 'delfini',
      'رحلات', 'رحلة', 'دلافين', 'جولة', 'مغامرة', 'غابة', 'قارب',
      '游览', '海豚', '活动', '体验', '森林', '帆船',
    ];
    if (excursionKeywords.some((k) => q.includes(k))) {
      return {
        text: t.replies.excursions || 'We curate 10 signature Zanzibar adventures including wild dolphin cruises in Menai Bay, Mnemba Island snorkeling, Stone Town heritage tours, and sunset dhow sails.',
        action: {
          label: currentUi.viewExperiences,
          onClick: () => scrollToSection('experiences'),
        },
      };
    }

    const conciergeKeywords = ['speak', 'talk', 'concierge', 'host', 'team', 'call', 'arrange', 'help', 'contact'];
    if (conciergeKeywords.some((k) => q.includes(k))) {
      return {
        text: local.replies.concierge,
        action: {
          label: local.actions.planStay,
          onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
        },
      };
    }

    if (q.includes('siapa kamu') || q.includes('kamu siapa') || q.includes('who are you') || q.includes('siapa ini') || q.includes('bot atau')) {
      return {
        text: currentLang === 'sw'
          ? `Naitwa ${supportName}, mhudumu wako binafsi katika Zanzirangi House. Niko hapa kukusaidia kwa maelezo yoyote unayohitaji.`
          : currentLang === 'fr'
          ? `Je m'appelle ${supportName}, votre concierge personnel à Zanzirangi House. Comment puis-je vous aider aujourd'hui ?`
          : `I am ${supportName}, your personal Customer Support & Concierge at Zanzirangi House. How may I assist your stay in Zanzibar today?`,
        action: {
          label: currentUi.checkRooms,
          onClick: () => scrollToSection('stay'),
        },
      };
    }

    return {
      text: t.replies.fallback || 'I am happy to assist with all your questions regarding your stay, dining, island adventures, and Tanzania safaris.',
      action: {
        label: local.actions.planStay,
        onClick: () => (onOpenBooking ? onOpenBooking() : scrollToSection('stay')),
      },
    };
  };

  const handleSendMessage = async (textToSend?: string, customBookingContext?: any) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      let convId = conversationId;
      const session = visitorSessionRef.current;
      if (!convId) {
        const initRes = await supportApi.initVisitorConversation({
          visitor_id: session.visitorId,
          session_id: session.sessionId,
          language: currentLang,
          current_page: typeof window !== 'undefined' ? window.location.pathname : '/',
          booking_id: customBookingContext?.bookingId || null,
          metadata: customBookingContext || null,
        });
        convId = initRes.conversation.id;
        setConversationId(convId);
        setConversationStatus(initRes.conversation.status);
      }

      const res = await supportApi.sendVisitorMessage(convId, session.visitorId, query, customBookingContext, currentLang);
      setConversationStatus(res.conversationStatus);

      // Adopt the server id so polling recognises this message instead of re-appending it.
      if (res.userMessage?.id) {
        const serverId = res.userMessage.id;
        setMessages((prev) =>
          prev.some((m) => m.id === serverId)
            ? prev.filter((m) => m.id !== userMsg.id)
            : prev.map((m) => (m.id === userMsg.id ? { ...m, id: serverId } : m))
        );
      }

      if (res.botMessage) {
        const timeStr = new Date(res.botMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const botMsg: Message = {
          id: res.botMessage.id,
          sender: 'bot',
          text: res.botMessage.message,
          timestamp: timeStr,
          action: resolveAction(res.botMessage.metadata?.action),
        };
        // Polling may already have delivered this reply.
        setMessages((prev) => (prev.some((m) => m.id === botMsg.id) ? prev : [...prev, botMsg]));
      }
      setIsTyping(false);
    } catch (err) {
      console.warn('Backend message send failed, using deterministic local reply:', err);
      setTimeout(() => {
        const reply = generateBotReply(query);
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: reply.action,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 450);
    }
  };

  // Near-real-time polling for admin and system messages
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(async () => {
      try {
        const session = visitorSessionRef.current;
        const pollRes = await supportApi.pollVisitorMessages(conversationId, session.visitorId);
        if (pollRes.status) {
          setConversationStatus(pollRes.status);
        }
        if (pollRes.messages && pollRes.messages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            let next = prev;
            const newOnes: Message[] = [];
            for (const pm of pollRes.messages) {
              if (!existingIds.has(pm.id) && pm.sender_type === 'VISITOR') {
                // A poll can land before the send request resolves: match the optimistic
                // copy (temporary `user-` id, same text) and give it the server id.
                const pending = next.find((m) => m.id.startsWith('user-') && m.sender === 'user' && m.text === pm.message);
                if (pending) {
                  next = next.map((m) => (m.id === pending.id ? { ...m, id: pm.id } : m));
                  existingIds.add(pm.id);
                  continue;
                }
              }
              if (!existingIds.has(pm.id)) {
                let sender: 'bot' | 'user' | 'admin' | 'system' = 'bot';
                if (pm.sender_type === 'VISITOR') sender = 'user';
                else if (pm.sender_type === 'ADMIN') sender = 'admin';
                else if (pm.sender_type === 'SYSTEM') sender = 'system';

                const timeStr = new Date(pm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                newOnes.push({
                  id: pm.id,
                  sender,
                  text: pm.message,
                  timestamp: timeStr,
                  action: resolveAction(pm.metadata?.action),
                });
              }
            }
            if (newOnes.length > 0) {
              // Trigger badge '1' only when an admin replies while the chat is closed
              if (!isOpen && newOnes.some((m) => m.sender === 'admin')) {
                setHasUnread(true);
              }
              return [...next, ...newOnes];
            }
            return next;
          });
        }
      } catch {
        // Silent poll error handling
      }
    }, isOpen ? 3000 : 7000);

    return () => clearInterval(interval);
  }, [isOpen, conversationId]);

  // Handle external query trigger (from other sections)
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setIsOpen(true);
      handleSendMessage(externalQuery);
      if (onClearExternalQuery) {
        onClearExternalQuery();
      }
    }
  }, [externalQuery]);

  // Handle global custom DOM event
  useEffect(() => {
    const handleOpenSupportEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string; bookingContext?: any }>;
      const query = customEvent.detail?.query;
      const bookingContext = customEvent.detail?.bookingContext;
      setIsOpen(true);
      if (query) {
        setTimeout(() => {
          handleSendMessage(query, bookingContext);
        }, 100);
      }
    };
    window.addEventListener('open-customer-support', handleOpenSupportEvent);
    return () => window.removeEventListener('open-customer-support', handleOpenSupportEvent);
  }, []);


  const actionLabels: Record<
    Language,
    {
      book: string;
      checkRooms: string;
      viewExperiences: string;
      viewDining: string;
      viewSafari: string;
      closeChat: string;
      sendAria: string;
      conciergeRole: string;
      openSupportAria: string;
    }
  > = {
    en: {
      book: 'Reserve Villa',
      checkRooms: 'View Villas',
      viewExperiences: 'View Experiences',
      viewDining: 'Taste Dining Moments',
      viewSafari: 'Explore Safaris',
      closeChat: 'Close Chat',
      sendAria: 'Send message',
      conciergeRole: 'Juma • Private Concierge',
      openSupportAria: 'Open Zanzirangi Customer Support',
    },
    fr: {
      book: 'Réserver la villa',
      checkRooms: 'Voir les villas',
      viewExperiences: 'Découvrir les expériences',
      viewDining: 'Découvrir les délices',
      viewSafari: 'Explorer les safaris',
      closeChat: 'Fermer le chat',
      sendAria: 'Envoyer le message',
      conciergeRole: 'Juma • Concierge Privé',
      openSupportAria: 'Ouvrir le Service Client Zanzirangi',
    },
    sw: {
      book: 'Weka Nafasi ya Villa',
      checkRooms: 'Tazama Villa Zote',
      viewExperiences: 'Tazama Safari & Vivutio',
      viewDining: 'Tazama Menyu ya Chakula',
      viewSafari: 'Tazama Safari za Tanzania',
      closeChat: 'Funga Maongezi',
      sendAria: 'Tuma ujumbe',
      conciergeRole: 'Juma • Mhudumu Binafsi',
      openSupportAria: 'Fungua Huduma kwa Wateja Zanzirangi',
    },
    es: {
      book: 'Reservar Villa',
      checkRooms: 'Ver Villas',
      viewExperiences: 'Ver Experiencias',
      viewDining: 'Ver Gastronomía',
      viewSafari: 'Explorar Safaris',
      closeChat: 'Cerrar chat',
      sendAria: 'Enviar mensaje',
      conciergeRole: 'Juma • Conserje Privado',
      openSupportAria: 'Abrir Atención al Huésped Zanzirangi',
    },
    it: {
      book: 'Prenota Villa',
      checkRooms: 'Scopri le Ville',
      viewExperiences: 'Esplora le Esperienze',
      viewDining: 'Scopri la Ristorazione',
      viewSafari: 'Esplora i Safari in Tanzania',
      closeChat: 'Chiudi chat',
      sendAria: 'Invia messaggio',
      conciergeRole: 'Juma • Concierge Privato',
      openSupportAria: 'Apri Assistenza Ospiti Zanzirangi',
    },
    pl: {
      book: 'Zarezerwuj willę',
      checkRooms: 'Zobacz wille',
      viewExperiences: 'Odkryj atrakcje',
      viewDining: 'Odkryj menu kulinarne',
      viewSafari: 'Odkryj safari w Tanzanii',
      closeChat: 'Zamknij czat',
      sendAria: 'Wyślij wiadomość',
      conciergeRole: 'Juma • Prywatny Konsjerż',
      openSupportAria: 'Otwórz Obsługę Klienta Zanzirangi',
    },
    ar: {
      book: 'حجز فيلا الآن',
      checkRooms: 'استعراض الفلل',
      viewExperiences: 'استكشاف التجارب والأنشطة',
      viewDining: 'استكشاف تجارب الطعام',
      viewSafari: 'استكشاف رحلات السفاري',
      closeChat: 'إغلاق المحادثة',
      sendAria: 'إرسال الرسالة',
      conciergeRole: 'جمعة • الكونسيرج الخاص',
      openSupportAria: 'فتح خدمة عملاء زنجيرانجي',
    },
    zh: {
      book: '立即预订奢华别墅',
      checkRooms: '查看专属别墅',
      viewExperiences: '探索岛屿精彩体验',
      viewDining: '探索珍馐美馔',
      viewSafari: '了解坦桑尼亚猎游',
      closeChat: '关闭客服窗口',
      sendAria: '发送咨询消息',
      conciergeRole: '朱马 • 专属私人管家',
      openSupportAria: '打开 Zanzirangi 专属在线管家',
    },
  };

  const currentUi = actionLabels[currentLang] || actionLabels.en;
  const activeConciergeRole = (currentUi.conciergeRole || `${supportName} • Private Concierge`)
    .replace(/\b(Elena|Juma)\b/g, supportName)
    .replace(/(إيليna|جمعة|إيلينا)/g, supportName)
    .replace(/朱马/g, supportName);

  return (
    <>
      {/* Floating Avatar Trigger Button in Bottom Left Corner */}
      <div
        ref={triggerBtnRef}
        className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 ${
          isOpen ? 'z-30 pointer-events-none sm:pointer-events-auto sm:z-40' : 'z-40'
        } flex items-center font-sans transition-all duration-300`}
      >
        <button
          id="chat-assistant-avatar-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center space-x-2 sm:space-x-3 focus:outline-none cursor-pointer"
          aria-label={currentUi.openSupportAria}
        >
          {/* Glowing Circle Avatar with Golden Ring */}
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#B8966C] via-[#C4A27A] to-[#FAF8F5] shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#141413]">
                <img
                  src={supportAvatar || '/zanzirangi-logo-circle.png'}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/zanzirangi-logo-circle.png';
                  }}
                />
              </div>
            </div>

            {/* Unread Message Dot - only appears when there is an unread answer from Admin */}
            {hasUnread && !isOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8966C] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#B8966C] text-[9px] font-bold text-[#141413] flex items-center justify-center shadow-lg border border-[#141413]">
                  1
                </span>
              </span>
            )}
          </div>

          {/* MOBILE FORMAT (HP): Hanya avatar dan card kecil yang bernama Juma, tanpa deskripsi */}
          <div className="sm:hidden flex items-center space-x-1.5 px-3 py-1.5 bg-[#141413]/95 border border-[#C4A27A]/50 rounded-xl text-[#FAF8F5] shadow-xl backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
              {supportName}
            </span>
          </div>

          {/* DESKTOP FORMAT: Full Customer Support Tag Pill with Description */}
          <div className="hidden sm:flex items-center space-x-2 px-4 py-2.5 bg-[#141413]/95 hover:bg-[#1C1B1A] border border-[#C4A27A]/50 rounded-2xl text-[#FAF8F5] shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:border-[#C4A27A]">
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-[#FAF8F5] tracking-wide">
                {supportTitle || t.badgeTitle || 'Customer Support'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center space-x-1.5 mt-0.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>{supportStatus || t.badgeStatus || `Online • ${supportName}`}</span>
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Dark Blurred Backdrop: Covers screen and places avatar below it */}
      {/* Dark Blurred Backdrop: Only on mobile, completely removed on desktop */}
      {isOpen && (
        <div
          id="customer-support-mobile-backdrop"
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300 sm:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Customer Support Chat Window (Vertically and horizontally centered on mobile modal, anchored at bottom-left on desktop) */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          id="customer-support-chat-window"
          className="fixed top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 sm:top-auto sm:translate-y-0 sm:bottom-22 sm:left-6 sm:translate-x-0 z-50 w-[calc(100vw-3.75rem)] sm:w-[385px] max-w-[385px] h-[510px] sm:h-[550px] max-h-[82vh] sm:max-h-[80vh] bg-[#141413]/98 backdrop-blur-2xl border border-[#C4A27A]/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-[#FAF8F5] font-sans"
        >
          {/* Top Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#1C1B1A] via-[#22211F] to-[#1C1B1A] border-b border-[#2C2B28] flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#C4A27A] bg-[#2C2B28] shadow-md">
                  <img
                    src={supportAvatar || '/zanzirangi-logo-circle.png'}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/zanzirangi-logo-circle.png';
                    }}
                  />
                </div>
                <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#141413] shadow-[0_0_6px_#10b981]" />
                </span>
              </div>

              <div className="flex flex-col text-left rtl:text-right leading-tight">
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                  <span className="font-serif font-medium text-base tracking-wider text-[#FAF8F5]">
                    {supportTitle || t.headerTitle || 'Customer Support'}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A27A]" />
                </div>
                <span className="text-[11px] text-emerald-400 font-mono tracking-wider flex items-center space-x-1 rtl:space-x-reverse mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>{supportStatus || activeConciergeRole}</span>
                </span>
              </div>
            </div>

            <button
              id="close-chat-assistant-btn"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-[#D8CCB8]/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              aria-label={currentUi.closeChat}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0F0E0E]/95 text-sm">
            {messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="text-center py-1">
                    <span className="text-[10px] font-mono text-[#D8CCB8]/80 bg-[#1C1B1A]/80 border border-[#2C2B28] px-3 py-1 rounded-full inline-block shadow-sm">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? isRtl ? 'items-start' : 'items-end'
                      : isRtl ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 rtl:space-x-reverse max-w-[85%] ${
                      msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                    }`}
                  >
                    {(msg.sender === 'bot' || msg.sender === 'admin') && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C4A27A]/60 flex-shrink-0 bg-[#2C2B28] shadow-sm">
                        <img
                          src={supportAvatar || '/zanzirangi-logo-circle.png'}
                          alt={supportName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/zanzirangi-logo-circle.png';
                          }}
                        />
                      </div>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#B8966C] text-[#141413] font-semibold rounded-br-none shadow-md'
                          : 'bg-[#1C1B1A] text-[#FAF8F5] border border-[#2C2B28] rounded-bl-none shadow'
                      }`}
                    >

                      <p>{msg.text}</p>

                      {msg.action && (
                        <button
                          onClick={msg.action.onClick}
                          className="mt-3 inline-flex items-center px-3 py-1.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all shadow"
                        >
                          {msg.action.label} {isRtl ? '←' : '→'}
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-[#8C8880] mt-1 px-8 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}


            {isTyping && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C4A27A]/60 flex-shrink-0 bg-[#2C2B28] shadow-sm">
                  <img
                    src={supportAvatar || '/zanzirangi-logo-circle.png'}
                    alt={supportName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/zanzirangi-logo-circle.png';
                    }}
                  />
                </div>
                <div className="px-4 py-2.5 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#C4A27A] rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips with Scroll Fade */}
          <ScrollFadeContainer
            className="relative max-w-full overflow-hidden bg-[#171615] border-t border-[#2C2B28]"
            scrollClassName="px-3.5 py-2 overflow-x-auto flex items-center space-x-2 rtl:space-x-reverse pr-10 no-scrollbar scroll-smooth"
            leftGradientClass="bg-gradient-to-r from-[#171615] via-[#171615]/90 to-transparent"
            rightGradientClass="bg-gradient-to-l from-[#171615] via-[#171615]/90 to-transparent"
            fadeWidth="w-8 sm:w-10"
          >
            {(shuffledPrompts.length > 0 ? shuffledPrompts : t.quickPrompts).map((p, idx) => (
              <button
                key={`${p.label}-${idx}`}
                onClick={() => handleSendMessage(p.query)}
                className="whitespace-nowrap px-2.5 py-1 bg-white/5 hover:bg-[#C4A27A]/20 hover:border-[#C4A27A]/50 border border-white/10 rounded-full text-[11px] text-[#D8CCB8] hover:text-[#FAF8F5] transition-all flex-shrink-0 cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </ScrollFadeContainer>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#1C1B1A] border-t border-[#2C2B28] flex items-center space-x-2 rtl:space-x-reverse"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.inputPlaceholder || "Ask about check-in, villas, transfers, safaris..."}
              className="flex-1 bg-[#141413] border border-[#2C2B28] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] placeholder-[#8C8880] focus:outline-none focus:border-[#C4A27A] transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="p-2.5 bg-[#B8966C] hover:bg-[#C4A27A] disabled:opacity-40 disabled:cursor-not-allowed text-[#141413] rounded-xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label={currentUi.sendAria}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
