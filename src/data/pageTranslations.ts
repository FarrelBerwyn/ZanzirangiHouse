import { Language } from '../types';

// Built-in copy for the standalone public pages (/villas, /dining, /experiences, /safari,
// /about, /contact, /privacy, /terms): page names (breadcrumbs, footer links), hero header
// fallbacks shown when the CMS page record is empty, and the "Explore more" internal links.

export interface PageNames {
  home: string;
  villas: string;
  dining: string;
  experiences: string;
  safari: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
}

export const PAGE_NAMES: Record<Language, PageNames> = {
  en: {
    home: 'Home',
    villas: 'Private Villas',
    dining: 'Oceanfront Dining',
    experiences: 'Zanzibar Experiences',
    safari: 'Tanzania Safari',
    about: 'About Sanctuary',
    contact: 'Contact & Reservations',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions',
  },
  pl: {
    home: 'Strona główna',
    villas: 'Prywatne Wille',
    dining: 'Kuchnia nad Oceanem',
    experiences: 'Doświadczenia na Zanzibarze',
    safari: 'Safari w Tanzanii',
    about: 'O Sanktuarium',
    contact: 'Kontakt i Rezerwacje',
    privacy: 'Polityka Prywatności',
    terms: 'Regulamin',
  },
  ar: {
    home: 'الرئيسية',
    villas: 'الفلل الخاصة',
    dining: 'المطاعم المطلة على المحيط',
    experiences: 'تجارب زنجبار',
    safari: 'سفاري تنزانيا',
    about: 'عن الملاذ',
    contact: 'التواصل والحجوزات',
    privacy: 'سياسة الخصوصية',
    terms: 'الشروط والأحكام',
  },
  zh: {
    home: '首页',
    villas: '私享别墅',
    dining: '临海餐饮',
    experiences: '桑给巴尔体验',
    safari: '坦桑尼亚猎游',
    about: '关于庄园',
    contact: '联系与预订',
    privacy: '隐私政策',
    terms: '条款与条件',
  },
  fr: {
    home: 'Accueil',
    villas: 'Villas Privées',
    dining: "Gastronomie Face à l'Océan",
    experiences: 'Expériences à Zanzibar',
    safari: 'Safari en Tanzanie',
    about: 'À Propos du Sanctuaire',
    contact: 'Contact & Réservations',
    privacy: 'Politique de Confidentialité',
    terms: 'Conditions Générales',
  },
  sw: {
    home: 'Mwanzo',
    villas: 'Villa Binafsi',
    dining: 'Chakula Ufukweni mwa Bahari',
    experiences: 'Uzoefu wa Zanzibar',
    safari: 'Safari ya Tanzania',
    about: 'Kuhusu Makazi Yetu',
    contact: 'Mawasiliano na Uhifadhi',
    privacy: 'Sera ya Faragha',
    terms: 'Sheria na Masharti',
  },
  es: {
    home: 'Inicio',
    villas: 'Villas Privadas',
    dining: 'Gastronomía Frente al Mar',
    experiences: 'Experiencias en Zanzíbar',
    safari: 'Safari en Tanzania',
    about: 'Sobre el Santuario',
    contact: 'Contacto y Reservas',
    privacy: 'Política de Privacidad',
    terms: 'Términos y Condiciones',
  },
  it: {
    home: 'Home',
    villas: 'Ville Private',
    dining: 'Ristorazione Fronte Oceano',
    experiences: 'Esperienze a Zanzibar',
    safari: 'Safari in Tanzania',
    about: 'Il Santuario',
    contact: 'Contatti e Prenotazioni',
    privacy: 'Informativa sulla Privacy',
    terms: 'Termini e Condizioni',
  },
};

export interface PageHeaderCopy {
  eyebrow: string;
  heading: string;
  description: string;
}

export interface PageHeadersText {
  villas: PageHeaderCopy;
  about: PageHeaderCopy;
  contact: PageHeaderCopy;
  dining: PageHeaderCopy;
  experiences: PageHeaderCopy;
  safari: PageHeaderCopy;
  privacyEyebrow: string;
  termsEyebrow: string;
  lastUpdated: string;
  /** Prefix placed before the CMS-managed "last updated" date. */
  lastUpdatedPrefix: string;
}

export const PAGE_HEADERS: Record<Language, PageHeadersText> = {
  en: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • SOUTH COAST ZANZIBAR',
      heading: 'Private Villas in Zanzibar',
      description:
        'Discover our 8 private artisanal residences ranging from 78 m² to 95 m². Each villa features a 100% private freshwater plunge pool, authentic Swahili coral-stone architecture, and personalized 24/7 dedicated butler service.',
    },
    about: {
      eyebrow: 'BAREFOOT LUXURY • SWAHILI-OMANI HERITAGE',
      heading: 'About Zanzirangi House',
      description:
        'Nestled along the pristine southern coral coast of Kizimkazi Dimbani, Zanzirangi House is an ultra-boutique private sanctuary designed to offer total seclusion, architectural harmony, and intimate Zanzibar hospitality.',
    },
    contact: {
      eyebrow: 'DIRECT CONCIERGE & INQUIRIES',
      heading: 'Contact & Reservations',
      description:
        'Plan your bespoke stay with our concierge team. Whether arranging private villa availability, 45-minute airport transfers from ZNZ, or custom Tanzania safari itineraries, we are available 24/7.',
    },
    dining: {
      eyebrow: 'OCEAN-TO-TABLE & FARM-TO-TABLE GASTRONOMY',
      heading: 'Oceanfront Dining',
      description:
        'Taste authentic Zanzibar culinary heritage blending Swahili spices with Indian Ocean seafood caught daily by Kizimkazi artisanal dhow fishermen. Enjoy private veranda dining, beach barbecues, and bespoke candlelit dinners under the stars.',
    },
    experiences: {
      eyebrow: 'CURATED ISLAND ADVENTURES • MENAI BAY & BEYOND',
      heading: 'Zanzibar Experiences',
      description:
        'From ethical wild dolphin encounters in the Menai Bay Marine Reserve to private Stone Town UNESCO heritage tours, organic spice trails, and sunset dhow sailing—experience Zanzibar with our dedicated private guides.',
    },
    safari: {
      eyebrow: 'FLY-IN BUSH & BEACH EXPEDITIONS • TANZANIA MAINLAND',
      heading: 'Tanzania Safari',
      description:
        'Combine your barefoot luxury retreat in Zanzibar with world-class mainland safaris. We coordinate 90-minute private air charters directly to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro with premier luxury safari camps.',
    },
    privacyEyebrow: 'LEGAL & TRUST ASSURANCE',
    termsEyebrow: 'HOSPITALITY POLICIES & TERMS',
    lastUpdated: 'Last Updated: September 2026',
    lastUpdatedPrefix: 'Last Updated: ',
  },
  pl: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • POŁUDNIOWE WYBRZEŻE ZANZIBARU',
      heading: 'Prywatne Wille na Zanzibarze',
      description:
        'Odkryj nasze 8 prywatnych, rzemieślniczo wykończonych rezydencji o powierzchni od 78 m² do 95 m². Każda willa oferuje w pełni prywatny basen ze słodką wodą, autentyczną suahilijską architekturę z kamienia koralowego oraz spersonalizowaną, całodobową obsługę kamerdynera.',
    },
    about: {
      eyebrow: 'LUKSUS NA BOSO • DZIEDZICTWO SUAHILI I OMANU',
      heading: 'O Zanzirangi House',
      description:
        'Położony na nieskazitelnym, koralowym wybrzeżu południowego Kizimkazi Dimbani, Zanzirangi House to kameralne, prywatne sanktuarium stworzone, by zapewnić pełne odosobnienie, architektoniczną harmonię i serdeczną zanzibarską gościnność.',
    },
    contact: {
      eyebrow: 'BEZPOŚREDNI KONSJERŻ I ZAPYTANIA',
      heading: 'Kontakt i Rezerwacje',
      description:
        'Zaplanuj swój wyjątkowy pobyt z naszym zespołem konsjerżów. Niezależnie od tego, czy chodzi o dostępność prywatnej willi, 45-minutowy transfer z lotniska ZNZ, czy indywidualny plan safari w Tanzanii — jesteśmy do dyspozycji 24/7.',
    },
    dining: {
      eyebrow: 'GASTRONOMIA PROSTO Z OCEANU I OGRODU',
      heading: 'Kuchnia nad Oceanem',
      description:
        'Posmakuj autentycznego dziedzictwa kulinarnego Zanzibaru, łączącego suahilijskie przyprawy z owocami morza z Oceanu Indyjskiego, codziennie poławianymi przez rybaków z Kizimkazi na tradycyjnych łodziach dhow. Delektuj się prywatnymi kolacjami na werandzie, grillem na plaży i wyjątkowymi kolacjami przy świecach pod gwiazdami.',
    },
    experiences: {
      eyebrow: 'STARANNIE WYBRANE PRZYGODY NA WYSPIE • MENAI BAY I DALEJ',
      heading: 'Doświadczenia na Zanzibarze',
      description:
        'Od etycznych spotkań z dzikimi delfinami w Rezerwacie Morskim Menai Bay, przez prywatne wycieczki po Stone Town z listy UNESCO i ekologiczne szlaki przypraw, po rejsy dhow o zachodzie słońca — odkryj Zanzibar z naszymi prywatnymi przewodnikami.',
    },
    safari: {
      eyebrow: 'WYPRAWY LOTNICZE: BUSZ I PLAŻA • TANZANIA KONTYNENTALNA',
      heading: 'Safari w Tanzanii',
      description:
        'Połącz luksusowy wypoczynek na Zanzibarze z safari światowej klasy na kontynencie. Organizujemy 90-minutowe prywatne loty czarterowe bezpośrednio do Parku Narodowego Serengeti, krateru Ngorongoro i pod Kilimandżaro, z pobytem w najlepszych luksusowych obozach safari.',
    },
    privacyEyebrow: 'INFORMACJE PRAWNE I ZAUFANIE',
    termsEyebrow: 'ZASADY POBYTU I WARUNKI',
    lastUpdated: 'Ostatnia aktualizacja: wrzesień 2026',
    lastUpdatedPrefix: 'Ostatnia aktualizacja: ',
  },
  ar: {
    villas: {
      eyebrow: 'كيزيمكازي ديمباني • الساحل الجنوبي لزنجبار',
      heading: 'فلل خاصة في زنجبار',
      description:
        'اكتشفوا مساكننا الخاصة الثماني المصممة بحرفية، بمساحات تتراوح بين 78 و95 مترًا مربعًا. تضم كل فيلا مسبحًا خاصًا بالكامل بمياه عذبة، وعمارة سواحلية أصيلة من الحجر المرجاني، وخدمة خادم شخصي مخصص على مدار الساعة.',
    },
    about: {
      eyebrow: 'فخامة حافية القدمين • إرث سواحلي عُماني',
      heading: 'عن Zanzirangi House',
      description:
        'يقع Zanzirangi House على امتداد الساحل المرجاني الجنوبي البكر في كيزيمكازي ديمباني، وهو ملاذ خاص فائق التميّز صُمّم ليمنحكم عزلة تامة وتناغمًا معماريًا وضيافة زنجبارية حميمة.',
    },
    contact: {
      eyebrow: 'الكونسيرج المباشر والاستفسارات',
      heading: 'التواصل والحجوزات',
      description:
        'خططوا لإقامتكم المصممة خصيصًا مع فريق الكونسيرج لدينا. سواء لترتيب توفر فيلا خاصة، أو النقل من مطار ZNZ خلال 45 دقيقة، أو برامج سفاري مخصصة في تنزانيا، نحن في خدمتكم على مدار الساعة.',
    },
    dining: {
      eyebrow: 'مأكولات من المحيط والمزرعة إلى المائدة',
      heading: 'المطاعم المطلة على المحيط',
      description:
        'تذوّقوا الإرث الطهوي الأصيل لزنجبار، حيث تمتزج التوابل السواحلية بمأكولات المحيط الهندي البحرية التي يصطادها يوميًا صيادو كيزيمكازي على قوارب الداو التقليدية. استمتعوا بعشاء خاص على الشرفة، وحفلات شواء على الشاطئ، وعشاء مخصص على ضوء الشموع تحت النجوم.',
    },
    experiences: {
      eyebrow: 'مغامرات جزرية منتقاة • خليج ميناي وما بعده',
      heading: 'تجارب زنجبار',
      description:
        'من اللقاءات المسؤولة مع الدلافين البرية في محمية خليج ميناي البحرية، إلى الجولات الخاصة في المدينة الحجرية المدرجة على قائمة اليونسكو، ومسارات التوابل العضوية، والإبحار بقارب الداو عند الغروب — اكتشفوا زنجبار برفقة مرشدينا الخاصين.',
    },
    safari: {
      eyebrow: 'رحلات جوية بين البرية والشاطئ • البر الرئيسي لتنزانيا',
      heading: 'سفاري تنزانيا',
      description:
        'اجمعوا بين ملاذكم الفاخر في زنجبار ورحلات سفاري عالمية المستوى في البر الرئيسي. ننسّق رحلات طيران خاصة مستأجرة مدتها 90 دقيقة مباشرة إلى منتزه سيرينغيتي الوطني وفوهة نغورونغورو وجبل كليمنجارو، مع الإقامة في أرقى مخيمات السفاري الفاخرة.',
    },
    privacyEyebrow: 'الشؤون القانونية وضمان الثقة',
    termsEyebrow: 'سياسات الضيافة والشروط',
    lastUpdated: 'آخر تحديث: سبتمبر 2026',
    lastUpdatedPrefix: 'آخر تحديث: ',
  },
  zh: {
    villas: {
      eyebrow: '基济姆卡济丁巴尼 • 桑给巴尔南海岸',
      heading: '桑给巴尔私享别墅',
      description:
        '探索我们的 8 座匠心私属居所，面积从 78 至 95 平方米不等。每座别墅均配备完全私享的淡水浸泡泳池、地道斯瓦希里珊瑚石建筑，以及 24 小时专属管家贴心服务。',
    },
    about: {
      eyebrow: '赤足奢华 • 斯瓦希里—阿曼传承',
      heading: '关于 Zanzirangi House',
      description:
        'Zanzirangi House 坐落于基济姆卡济丁巴尼原始静谧的南部珊瑚海岸，是一处极致精品的私享秘境，为您带来完全的隐逸、和谐的建筑之美，以及温馨亲切的桑给巴尔式款待。',
    },
    contact: {
      eyebrow: '专属礼宾与咨询',
      heading: '联系与预订',
      description:
        '与我们的礼宾团队一同规划您的专属旅程。无论是安排私享别墅房态、从 ZNZ 机场出发约 45 分钟的专车接送，还是定制坦桑尼亚猎游行程，我们全天候 24 小时为您服务。',
    },
    dining: {
      eyebrow: '海洋至餐桌 • 农场至餐桌美食',
      heading: '临海餐饮',
      description:
        '品味地道的桑给巴尔饮食传承：斯瓦希里香料与基济姆卡济渔民每日乘传统单桅帆船捕获的印度洋海鲜完美交融。尽享私密露台用餐、海滩烧烤，以及星空下的定制烛光晚宴。',
    },
    experiences: {
      eyebrow: '精选海岛探险 • 梅奈湾及更远',
      heading: '桑给巴尔体验',
      description:
        '从梅奈湾海洋保护区负责任的野生海豚邂逅，到联合国教科文组织世界遗产石头城私人导览、有机香料之旅与日落单桅帆船巡航——与我们的专属私人向导一同体验桑给巴尔。',
    },
    safari: {
      eyebrow: '包机直达的丛林与海滩探险 • 坦桑尼亚大陆',
      heading: '坦桑尼亚猎游',
      description:
        '将您在桑给巴尔的赤足奢华度假与世界级大陆猎游完美结合。我们安排 90 分钟私人包机，直飞塞伦盖蒂国家公园、恩戈罗恩戈罗火山口与乞力马扎罗山，入住顶级奢华猎游营地。',
    },
    privacyEyebrow: '法律与信任保障',
    termsEyebrow: '礼宾政策与条款',
    lastUpdated: '最后更新：2026 年 9 月',
    lastUpdatedPrefix: '最后更新：',
  },
  fr: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • CÔTE SUD DE ZANZIBAR',
      heading: 'Villas Privées à Zanzibar',
      description:
        "Découvrez nos 8 résidences privées artisanales de 78 m² à 95 m². Chaque villa dispose d'un bassin d'eau douce entièrement privatif, d'une authentique architecture swahilie en pierre de corail et d'un service de majordome dédié 24h/24.",
    },
    about: {
      eyebrow: 'LUXE PIEDS NUS • HÉRITAGE SWAHILI-OMANAIS',
      heading: 'À Propos de Zanzirangi House',
      description:
        'Niché sur la côte corallienne préservée du sud de Zanzibar, à Kizimkazi Dimbani, Zanzirangi House est un sanctuaire privé ultra-confidentiel conçu pour offrir une intimité absolue, une harmonie architecturale et une hospitalité zanzibarite chaleureuse.',
    },
    contact: {
      eyebrow: 'CONCIERGERIE DIRECTE & DEMANDES',
      heading: 'Contact & Réservations',
      description:
        "Planifiez votre séjour sur mesure avec notre équipe de conciergerie. Disponibilité d'une villa privée, transfert de 45 minutes depuis l'aéroport ZNZ ou itinéraire de safari personnalisé en Tanzanie : nous sommes à votre écoute 24h/24.",
    },
    dining: {
      eyebrow: "GASTRONOMIE DE L'OCÉAN ET DU JARDIN À LA TABLE",
      heading: "Gastronomie Face à l'Océan",
      description:
        "Savourez l'authentique héritage culinaire de Zanzibar, mariant épices swahilies et produits de la mer de l'océan Indien pêchés chaque jour par les pêcheurs artisanaux de Kizimkazi à bord de leurs dhows. Profitez de dîners privés sur la véranda, de barbecues sur la plage et de dîners aux chandelles sur mesure sous les étoiles.",
    },
    experiences: {
      eyebrow: 'AVENTURES INSULAIRES SÉLECTIONNÉES • MENAI BAY ET AU-DELÀ',
      heading: 'Expériences à Zanzibar',
      description:
        "Des rencontres éthiques avec les dauphins sauvages de la réserve marine de Menai Bay aux visites privées de Stone Town, classée à l'UNESCO, en passant par les routes bio des épices et les croisières en dhow au coucher du soleil : vivez Zanzibar avec nos guides privés dédiés.",
    },
    safari: {
      eyebrow: 'EXPÉDITIONS BROUSSE & PLAGE EN AVION • TANZANIE CONTINENTALE',
      heading: 'Safari en Tanzanie',
      description:
        "Associez votre retraite de luxe pieds nus à Zanzibar à des safaris d'exception sur le continent. Nous organisons des vols charters privés de 90 minutes directement vers le parc national du Serengeti, le cratère du Ngorongoro et le Kilimandjaro, avec les plus beaux camps de safari de luxe.",
    },
    privacyEyebrow: 'MENTIONS LÉGALES & CONFIANCE',
    termsEyebrow: "POLITIQUES D'ACCUEIL & CONDITIONS",
    lastUpdated: 'Dernière mise à jour : septembre 2026',
    lastUpdatedPrefix: 'Dernière mise à jour : ',
  },
  sw: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • PWANI YA KUSINI YA ZANZIBAR',
      heading: 'Villa Binafsi Zanzibar',
      description:
        'Gundua makazi yetu 8 binafsi yaliyotengenezwa kwa ufundi wa mikono, yenye ukubwa wa mita za mraba 78 hadi 95. Kila villa ina bwawa binafsi kabisa la maji baridi, usanifu halisi wa Kiswahili wa mawe ya matumbawe, na huduma ya mhudumu binafsi saa 24 kila siku.',
    },
    about: {
      eyebrow: 'ANASA YA PEKUPEKU • URITHI WA KISWAHILI NA OMANI',
      heading: 'Kuhusu Zanzirangi House',
      description:
        'Likiwa kando ya pwani safi ya matumbawe ya kusini huko Kizimkazi Dimbani, Zanzirangi House ni makazi binafsi ya kipekee yaliyoundwa kukupa utulivu kamili, maelewano ya usanifu, na ukarimu wa karibu wa Kizanzibari.',
    },
    contact: {
      eyebrow: 'MHUDUMU WA MOJA KWA MOJA NA MASWALI',
      heading: 'Mawasiliano na Uhifadhi',
      description:
        'Panga ukaaji wako maalum pamoja na timu yetu ya wahudumu. Iwe ni kupanga nafasi ya villa binafsi, usafiri wa dakika 45 kutoka uwanja wa ndege wa ZNZ, au ratiba maalum za safari Tanzania, tunapatikana saa 24 kila siku.',
    },
    dining: {
      eyebrow: 'MAPISHI KUTOKA BAHARINI NA SHAMBANI HADI MEZANI',
      heading: 'Chakula Ufukweni mwa Bahari',
      description:
        'Onja urithi halisi wa mapishi ya Zanzibar unaochanganya viungo vya Kiswahili na vyakula vya baharini vya Bahari ya Hindi vinavyovuliwa kila siku na wavuvi wa jadi wa Kizimkazi kwa majahazi. Furahia mlo binafsi barazani, choma ufukweni, na chakula cha jioni cha mishumaa chini ya nyota.',
    },
    experiences: {
      eyebrow: 'MATUKIO TEULE YA KISIWANI • GHUBA YA MENAI NA ZAIDI',
      heading: 'Uzoefu wa Zanzibar',
      description:
        'Kuanzia kukutana kwa heshima na pomboo pori katika Hifadhi ya Bahari ya Ghuba ya Menai hadi ziara binafsi za urithi wa UNESCO Mji Mkongwe, njia za viungo asilia, na safari za jahazi wakati wa machweo — furahia Zanzibar pamoja na waongozaji wetu binafsi.',
    },
    safari: {
      eyebrow: 'SAFARI ZA NDEGE PORINI NA UFUKWENI • TANZANIA BARA',
      heading: 'Safari ya Tanzania',
      description:
        'Unganisha mapumziko yako ya kifahari Zanzibar na safari za kiwango cha kimataifa Tanzania Bara. Tunaratibu ndege binafsi za kukodi za dakika 90 moja kwa moja hadi Hifadhi ya Taifa ya Serengeti, Kreta ya Ngorongoro na Mlima Kilimanjaro, pamoja na kambi bora za kifahari za safari.',
    },
    privacyEyebrow: 'MASUALA YA KISHERIA NA UAMINIFU',
    termsEyebrow: 'SERA ZA UKARIMU NA MASHARTI',
    lastUpdated: 'Imesasishwa: Septemba 2026',
    lastUpdatedPrefix: 'Imesasishwa: ',
  },
  es: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • COSTA SUR DE ZANZÍBAR',
      heading: 'Villas Privadas en Zanzíbar',
      description:
        'Descubra nuestras 8 residencias privadas artesanales de 78 m² a 95 m². Cada villa cuenta con una piscina de agua dulce 100% privada, auténtica arquitectura suajili de piedra coralina y un servicio de mayordomo personal las 24 horas.',
    },
    about: {
      eyebrow: 'LUJO DESCALZO • HERENCIA SUAJILI-OMANÍ',
      heading: 'Sobre Zanzirangi House',
      description:
        'Enclavado en la prístina costa coralina del sur, en Kizimkazi Dimbani, Zanzirangi House es un santuario privado ultra boutique concebido para ofrecer total privacidad, armonía arquitectónica y una íntima hospitalidad zanzibareña.',
    },
    contact: {
      eyebrow: 'CONSERJERÍA DIRECTA Y CONSULTAS',
      heading: 'Contacto y Reservas',
      description:
        'Planifique su estancia a medida con nuestro equipo de conserjería. Ya sea para consultar la disponibilidad de una villa privada, traslados de 45 minutos desde el aeropuerto de ZNZ o itinerarios de safari personalizados en Tanzania, estamos a su disposición las 24 horas.',
    },
    dining: {
      eyebrow: 'GASTRONOMÍA DEL MAR Y DEL HUERTO A LA MESA',
      heading: 'Gastronomía Frente al Mar',
      description:
        'Saboree la auténtica herencia culinaria de Zanzíbar, que fusiona especias suajilis con mariscos del océano Índico capturados a diario por los pescadores artesanales de Kizimkazi en sus dhows. Disfrute de cenas privadas en la veranda, barbacoas en la playa y cenas a medida a la luz de las velas bajo las estrellas.',
    },
    experiences: {
      eyebrow: 'AVENTURAS ISLEÑAS SELECCIONADAS • MENAI BAY Y MÁS ALLÁ',
      heading: 'Experiencias en Zanzíbar',
      description:
        'Desde encuentros éticos con delfines salvajes en la Reserva Marina de Menai Bay hasta visitas privadas por Stone Town, Patrimonio de la UNESCO, rutas de especias orgánicas y travesías en dhow al atardecer: viva Zanzíbar con nuestros guías privados.',
    },
    safari: {
      eyebrow: 'EXPEDICIONES AÉREAS DE SABANA Y PLAYA • TANZANIA CONTINENTAL',
      heading: 'Safari en Tanzania',
      description:
        'Combine su refugio de lujo descalzo en Zanzíbar con safaris de primer nivel en el continente. Coordinamos vuelos chárter privados de 90 minutos directamente al Parque Nacional del Serengeti, el cráter del Ngorongoro y el monte Kilimanjaro, con los mejores campamentos de safari de lujo.',
    },
    privacyEyebrow: 'AVISO LEGAL Y CONFIANZA',
    termsEyebrow: 'POLÍTICAS DE HOSPITALIDAD Y TÉRMINOS',
    lastUpdated: 'Última actualización: septiembre de 2026',
    lastUpdatedPrefix: 'Última actualización: ',
  },
  it: {
    villas: {
      eyebrow: 'KIZIMKAZI DIMBANI • COSTA SUD DI ZANZIBAR',
      heading: 'Ville Private a Zanzibar',
      description:
        'Scoprite le nostre 8 residenze private artigianali, da 78 m² a 95 m². Ogni villa dispone di una piscina d’acqua dolce a uso esclusivo, autentica architettura swahili in pietra corallina e un servizio di maggiordomo dedicato 24 ore su 24.',
    },
    about: {
      eyebrow: 'LUSSO A PIEDI NUDI • EREDITÀ SWAHILI-OMANITA',
      heading: 'Scopri Zanzirangi House',
      description:
        'Adagiato lungo l’incontaminata costa corallina meridionale di Kizimkazi Dimbani, Zanzirangi House è un rifugio privato ultra-boutique pensato per offrire totale riservatezza, armonia architettonica e un’intima ospitalità zanzibarina.',
    },
    contact: {
      eyebrow: 'CONCIERGE DIRETTO E RICHIESTE',
      heading: 'Contatti e Prenotazioni',
      description:
        'Pianificate il vostro soggiorno su misura con il nostro team di concierge. Che si tratti della disponibilità di una villa privata, di un transfer di 45 minuti dall’aeroporto ZNZ o di itinerari safari personalizzati in Tanzania, siamo a vostra disposizione 24 ore su 24.',
    },
    dining: {
      eyebrow: 'GASTRONOMIA DAL MARE E DALL’ORTO ALLA TAVOLA',
      heading: 'Ristorazione Fronte Oceano',
      description:
        'Assaporate l’autentica tradizione culinaria di Zanzibar, che unisce spezie swahili e pesce dell’Oceano Indiano pescato ogni giorno dai pescatori artigianali di Kizimkazi a bordo dei loro dhow. Godetevi cene private in veranda, barbecue in spiaggia e cene a lume di candela su misura sotto le stelle.',
    },
    experiences: {
      eyebrow: 'AVVENTURE SELEZIONATE SULL’ISOLA • MENAI BAY E OLTRE',
      heading: 'Esperienze a Zanzibar',
      description:
        'Dagli incontri etici con i delfini selvatici nella Riserva Marina di Menai Bay ai tour privati di Stone Town, patrimonio UNESCO, dai percorsi delle spezie biologiche alle veleggiate in dhow al tramonto: vivete Zanzibar con le nostre guide private dedicate.',
    },
    safari: {
      eyebrow: 'SPEDIZIONI IN VOLO TRA SAVANA E SPIAGGIA • TANZANIA CONTINENTALE',
      heading: 'Safari in Tanzania',
      description:
        'Unite il vostro rifugio di lusso a piedi nudi a Zanzibar a safari di livello mondiale sul continente. Organizziamo voli charter privati di 90 minuti diretti al Parco Nazionale del Serengeti, al cratere di Ngorongoro e al Monte Kilimanjaro, con i migliori campi tendati di lusso.',
    },
    privacyEyebrow: 'NOTE LEGALI E GARANZIE',
    termsEyebrow: 'POLITICHE DI OSPITALITÀ E TERMINI',
    lastUpdated: 'Ultimo aggiornamento: settembre 2026',
    lastUpdatedPrefix: 'Ultimo aggiornamento: ',
  },
};

export type InternalLinkKey = 'villas' | 'dining' | 'experiences' | 'safari' | 'contact';

export interface InternalLinkCopy {
  title: string;
  description: string;
  cta: string;
}

export interface InternalLinksText {
  eyebrow: string;
  heading: string;
  links: Record<InternalLinkKey, InternalLinkCopy>;
}

export const INTERNAL_LINKS_I18N: Record<Language, InternalLinksText> = {
  en: {
    eyebrow: 'EXPLORE MORE OF ZANZIRANGI HOUSE',
    heading: 'Complete Your Zanzibar & Tanzania Journey',
    links: {
      villas: {
        title: 'Private Luxury Villas',
        description: 'Explore 8 handcrafted plunge-pool suites in Kizimkazi with 24/7 dedicated butler service.',
        cta: 'Explore our private villas',
      },
      dining: {
        title: 'Oceanfront Dining',
        description: 'Savor daily line-caught seafood, artisanal Swahili spices, and romantic beachfront candlelit dinners.',
        cta: 'Discover oceanfront dining experiences',
      },
      experiences: {
        title: 'Zanzibar Experiences',
        description: 'Embark on ethical Menai Bay dolphin dhow safaris, Stone Town walks, and organic spice farm tours.',
        cta: 'Explore curated Zanzibar tours',
      },
      safari: {
        title: 'Tanzania Safari Connections',
        description: 'Seamless fly-in bush charters from Zanzibar to Serengeti National Park and Ngorongoro Crater.',
        cta: 'Discover Tanzania safari journeys',
      },
      contact: {
        title: 'Concierge & Direct Booking',
        description: 'Coordinate your customized stay, private transfers, and bespoke itinerary with our team.',
        cta: 'Contact concierge & reserve directly',
      },
    },
  },
  pl: {
    eyebrow: 'ODKRYJ WIĘCEJ ZANZIRANGI HOUSE',
    heading: 'Dopełnij Swoją Podróż po Zanzibarze i Tanzanii',
    links: {
      villas: {
        title: 'Prywatne Luksusowe Wille',
        description: 'Odkryj 8 ręcznie wykończonych apartamentów z prywatnym basenem w Kizimkazi i całodobową obsługą kamerdynera.',
        cta: 'Odkryj nasze prywatne wille',
      },
      dining: {
        title: 'Kuchnia nad Oceanem',
        description: 'Delektuj się codziennie łowionymi owocami morza, rzemieślniczymi przyprawami suahili i romantycznymi kolacjami przy świecach na plaży.',
        cta: 'Odkryj kulinarne doznania nad oceanem',
      },
      experiences: {
        title: 'Doświadczenia na Zanzibarze',
        description: 'Wyrusz na etyczne rejsy dhow z delfinami w Menai Bay, spacery po Stone Town i wycieczki na ekologiczne farmy przypraw.',
        cta: 'Odkryj wyselekcjonowane wycieczki po Zanzibarze',
      },
      safari: {
        title: 'Połączenia Safari w Tanzanii',
        description: 'Wygodne loty czarterowe z Zanzibaru do Parku Narodowego Serengeti i krateru Ngorongoro.',
        cta: 'Odkryj podróże safari po Tanzanii',
      },
      contact: {
        title: 'Konsjerż i Rezerwacja Bezpośrednia',
        description: 'Zaplanuj z naszym zespołem spersonalizowany pobyt, prywatne transfery i indywidualny plan podróży.',
        cta: 'Skontaktuj się z konsjerżem i zarezerwuj bezpośrednio',
      },
    },
  },
  ar: {
    eyebrow: 'اكتشفوا المزيد من ZANZIRANGI HOUSE',
    heading: 'أكملوا رحلتكم في زنجبار وتنزانيا',
    links: {
      villas: {
        title: 'فلل فاخرة خاصة',
        description: 'اكتشفوا 8 أجنحة مصممة يدويًا بمسابح خاصة في كيزيمكازي مع خدمة خادم شخصي على مدار الساعة.',
        cta: 'اكتشفوا فللنا الخاصة',
      },
      dining: {
        title: 'المطاعم المطلة على المحيط',
        description: 'تذوّقوا المأكولات البحرية المصطادة يوميًا، والتوابل السواحلية الحرفية، وعشاءً رومانسيًا على ضوء الشموع على الشاطئ.',
        cta: 'اكتشفوا تجارب الطعام المطلة على المحيط',
      },
      experiences: {
        title: 'تجارب زنجبار',
        description: 'انطلقوا في رحلات مسؤولة بقارب الداو لمشاهدة الدلافين في خليج ميناي، وجولات في المدينة الحجرية، وزيارات لمزارع التوابل العضوية.',
        cta: 'استكشفوا جولات زنجبار المختارة',
      },
      safari: {
        title: 'رحلات سفاري تنزانيا',
        description: 'رحلات طيران مستأجرة سلسة من زنجبار إلى منتزه سيرينغيتي الوطني وفوهة نغورونغورو.',
        cta: 'اكتشفوا رحلات السفاري في تنزانيا',
      },
      contact: {
        title: 'الكونسيرج والحجز المباشر',
        description: 'نسّقوا مع فريقنا إقامتكم المخصصة، والتنقلات الخاصة، وبرنامج رحلتكم المصمم حسب رغبتكم.',
        cta: 'تواصلوا مع الكونسيرج واحجزوا مباشرة',
      },
    },
  },
  zh: {
    eyebrow: '探索更多 ZANZIRANGI HOUSE',
    heading: '圆满您的桑给巴尔与坦桑尼亚之旅',
    links: {
      villas: {
        title: '私享奢华别墅',
        description: '探索基济姆卡济 8 座匠心打造的私人泳池套房，尊享 24 小时专属管家服务。',
        cta: '探索我们的私享别墅',
      },
      dining: {
        title: '临海餐饮',
        description: '品味每日垂钓的新鲜海鲜、手工斯瓦希里香料，以及浪漫的海滩烛光晚宴。',
        cta: '探索临海美食体验',
      },
      experiences: {
        title: '桑给巴尔体验',
        description: '踏上梅奈湾负责任的单桅帆船观豚之旅、石头城漫步与有机香料农场之旅。',
        cta: '探索精选桑给巴尔之旅',
      },
      safari: {
        title: '坦桑尼亚猎游衔接',
        description: '从桑给巴尔无缝包机直飞塞伦盖蒂国家公园与恩戈罗恩戈罗火山口。',
        cta: '探索坦桑尼亚猎游之旅',
      },
      contact: {
        title: '礼宾服务与官网直订',
        description: '与我们的团队一同安排您的定制住宿、私人接送与专属行程。',
        cta: '联系礼宾并直接预订',
      },
    },
  },
  fr: {
    eyebrow: 'EN DÉCOUVRIR PLUS SUR ZANZIRANGI HOUSE',
    heading: 'Complétez Votre Voyage à Zanzibar et en Tanzanie',
    links: {
      villas: {
        title: 'Villas de Luxe Privées',
        description: 'Découvrez 8 suites artisanales avec bassin privé à Kizimkazi et service de majordome dédié 24h/24.',
        cta: 'Découvrir nos villas privées',
      },
      dining: {
        title: "Gastronomie Face à l'Océan",
        description: 'Savourez des fruits de mer pêchés chaque jour à la ligne, des épices swahilies artisanales et des dîners romantiques aux chandelles sur la plage.',
        cta: "Découvrir nos expériences gastronomiques face à l'océan",
      },
      experiences: {
        title: 'Expériences à Zanzibar',
        description: "Embarquez pour des safaris éthiques en dhow avec les dauphins de Menai Bay, des promenades dans Stone Town et la visite de fermes d'épices bio.",
        cta: 'Explorer nos excursions à Zanzibar',
      },
      safari: {
        title: 'Connexions Safari en Tanzanie',
        description: 'Vols charters fluides depuis Zanzibar vers le parc national du Serengeti et le cratère du Ngorongoro.',
        cta: 'Découvrir nos safaris en Tanzanie',
      },
      contact: {
        title: 'Conciergerie & Réservation Directe',
        description: 'Organisez avec notre équipe votre séjour personnalisé, vos transferts privés et votre itinéraire sur mesure.',
        cta: 'Contacter la conciergerie et réserver en direct',
      },
    },
  },
  sw: {
    eyebrow: 'GUNDUA ZAIDI ZANZIRANGI HOUSE',
    heading: 'Kamilisha Safari Yako ya Zanzibar na Tanzania',
    links: {
      villas: {
        title: 'Villa Binafsi za Kifahari',
        description: 'Gundua vyumba 8 vya kifahari vilivyotengenezwa kwa mikono vyenye bwawa binafsi huko Kizimkazi, pamoja na mhudumu binafsi saa 24.',
        cta: 'Gundua villa zetu binafsi',
      },
      dining: {
        title: 'Chakula Ufukweni mwa Bahari',
        description: 'Furahia vyakula vya baharini vinavyovuliwa kila siku, viungo vya asili vya Kiswahili, na chakula cha jioni cha mishumaa ufukweni.',
        cta: 'Gundua milo ya ufukweni mwa bahari',
      },
      experiences: {
        title: 'Uzoefu wa Zanzibar',
        description: 'Anza safari za jahazi za kuona pomboo kwa heshima katika Ghuba ya Menai, matembezi Mji Mkongwe, na ziara za mashamba ya viungo asilia.',
        cta: 'Gundua ziara teule za Zanzibar',
      },
      safari: {
        title: 'Safari za Tanzania',
        description: 'Ndege za kukodi kwa urahisi kutoka Zanzibar hadi Hifadhi ya Taifa ya Serengeti na Kreta ya Ngorongoro.',
        cta: 'Gundua safari za Tanzania',
      },
      contact: {
        title: 'Mhudumu na Uhifadhi wa Moja kwa Moja',
        description: 'Panga pamoja na timu yetu ukaaji wako maalum, usafiri binafsi, na ratiba yako ya kipekee.',
        cta: 'Wasiliana na mhudumu na uhifadhi moja kwa moja',
      },
    },
  },
  es: {
    eyebrow: 'DESCUBRA MÁS DE ZANZIRANGI HOUSE',
    heading: 'Complete Su Viaje por Zanzíbar y Tanzania',
    links: {
      villas: {
        title: 'Villas Privadas de Lujo',
        description: 'Descubra 8 suites artesanales con piscina privada en Kizimkazi y servicio de mayordomo las 24 horas.',
        cta: 'Descubra nuestras villas privadas',
      },
      dining: {
        title: 'Gastronomía Frente al Mar',
        description: 'Saboree mariscos pescados a diario, especias suajilis artesanales y románticas cenas a la luz de las velas en la playa.',
        cta: 'Descubra nuestras experiencias gastronómicas frente al mar',
      },
      experiences: {
        title: 'Experiencias en Zanzíbar',
        description: 'Embárquese en safaris éticos en dhow con delfines en Menai Bay, paseos por Stone Town y visitas a granjas de especias orgánicas.',
        cta: 'Explore nuestras excursiones por Zanzíbar',
      },
      safari: {
        title: 'Conexiones de Safari en Tanzania',
        description: 'Vuelos chárter sin complicaciones desde Zanzíbar al Parque Nacional del Serengeti y al cráter del Ngorongoro.',
        cta: 'Descubra los safaris en Tanzania',
      },
      contact: {
        title: 'Conserjería y Reserva Directa',
        description: 'Coordine con nuestro equipo su estancia personalizada, traslados privados e itinerario a medida.',
        cta: 'Contacte con conserjería y reserve directamente',
      },
    },
  },
  it: {
    eyebrow: 'SCOPRI DI PIÙ SU ZANZIRANGI HOUSE',
    heading: 'Completate il Vostro Viaggio tra Zanzibar e Tanzania',
    links: {
      villas: {
        title: 'Ville Private di Lusso',
        description: 'Scoprite 8 suite artigianali con piscina privata a Kizimkazi e servizio di maggiordomo dedicato 24 ore su 24.',
        cta: 'Scoprite le nostre ville private',
      },
      dining: {
        title: 'Ristorazione Fronte Oceano',
        description: 'Gustate pesce pescato ogni giorno, spezie swahili artigianali e romantiche cene a lume di candela sulla spiaggia.',
        cta: 'Scoprite le esperienze gastronomiche fronte oceano',
      },
      experiences: {
        title: 'Esperienze a Zanzibar',
        description: 'Partite per safari etici in dhow con i delfini di Menai Bay, passeggiate a Stone Town e visite a fattorie di spezie biologiche.',
        cta: 'Esplorate i tour selezionati di Zanzibar',
      },
      safari: {
        title: 'Collegamenti Safari in Tanzania',
        description: 'Voli charter senza pensieri da Zanzibar al Parco Nazionale del Serengeti e al cratere di Ngorongoro.',
        cta: 'Scoprite i viaggi safari in Tanzania',
      },
      contact: {
        title: 'Concierge e Prenotazione Diretta',
        description: 'Organizzate con il nostro team il vostro soggiorno personalizzato, i transfer privati e un itinerario su misura.',
        cta: 'Contattate il concierge e prenotate direttamente',
      },
    },
  },
};
