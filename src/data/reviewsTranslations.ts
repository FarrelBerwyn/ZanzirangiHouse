import { Language, Review } from '../types';
import { REVIEWS_DATA } from './reviews';

export interface LocalizedReview {
  country: string;
  stayDate: string;
  villaStayed: string;
  title: string;
  reviewText: string;
}

export const REVIEWS_LOCALIZED_DATA: Record<
  Language,
  Record<string, LocalizedReview>
> = {
  en: {
    'rev-01': {
      country: 'United Kingdom',
      stayDate: 'November 2025',
      villaStayed: 'Sultan Oceanfront Villa',
      title: 'An absolute paradise beyond all expectations',
      reviewText: 'From the moment our private chauffeur welcomed us at Zanzibar Airport to our final sunset dhow sail, every detail was orchestrated to absolute perfection. The plunge pool perched over the ocean tide was magical.',
    },
    'rev-02': {
      country: 'France',
      stayDate: 'January 2026',
      villaStayed: 'Makuti Garden Sanctuary',
      title: 'Authentic elegance and supreme tranquility',
      reviewText: 'The architectural restraint, use of indigenous coral stone, and attentive but discrete butler service reminded us of the very finest Aman or Singita lodges. The Swahili coconut seafood dinner was unforgettable.',
    },
    'rev-03': {
      country: 'Sweden',
      stayDate: 'February 2026',
      villaStayed: 'The Royal Presidential Villa',
      title: 'The ultimate private sanctuary in East Africa',
      reviewText: 'We traveled as a family of five. Having our own private infinity pool suspended above the coral lagoon and our personal chef preparing fresh catches each evening redefined what luxury travel means to us.',
    },
    'rev-04': {
      country: 'United Arab Emirates',
      stayDate: 'December 2025',
      villaStayed: 'Zanzibar Spice Villa',
      title: 'Deeply restorative and culturally rich',
      reviewText: 'The antique carved brass doors and private lap pool created a serene atmosphere. Waking up to ocean breezes and seeing wild dolphins on the sunrise dhow excursion was a lifelong highlight.',
    },
    'rev-05': {
      country: 'South Africa',
      stayDate: 'October 2025',
      villaStayed: 'Coral Cove Villa',
      title: 'Genuine African hospitality at an international standard',
      reviewText: 'Stepping directly from our villa deck into the warm turquoise Indian Ocean was pure bliss. The staff’s warmth and attention to detail made us feel like honored family in Tanzania.',
    },
  },
  pl: {
    'rev-01': {
      country: 'Wielka Brytania',
      stayDate: 'Listopad 2025',
      villaStayed: 'Willa Sułtańska nad Oceanem',
      title: 'Absolutny raj przewyższający wszelkie oczekiwania',
      reviewText: 'Od chwili powitania przez prywatnego szofera na lotnisku po pożegnalny rejs łodzią dhow o zachodzie słońca – każdy detal był dopracowany do perfekcji. Prywatny basen nad oceanem był po prostu magiczny.',
    },
    'rev-02': {
      country: 'Francja',
      stayDate: 'Styczeń 2026',
      villaStayed: 'Oaza Ogrodowa Makuti',
      title: 'Autentyczna elegancja i niezrównany spokój',
      reviewText: 'Architektoniczna dyskrecja, lokalny kamień koralowy i dyskretna opieka kamerdynera dorównują najlepszym luksusowym lożom świata. Suahilijska kolacja z owocami morza i mlekiem kokosowym była niezapomniana.',
    },
    'rev-03': {
      country: 'Szwecja',
      stayDate: 'Luty 2026',
      villaStayed: 'Królewska Willa Prezydencka',
      title: 'Najwspanialsze prywatne sanktuarium w Afryce Wschodniej',
      reviewText: 'Podróżowaliśmy z pięcioosobową rodziną. Własny prywatny basen infinity zawieszony nad laguną koralową oraz osobisty szef kuchni na nowo zdefiniowały dla nas pojęcie podróży w stylu luksusu.',
    },
    'rev-04': {
      country: 'Zjednoczone Emiraty Arabskie',
      stayDate: 'Grudzień 2025',
      villaStayed: 'Willa Przypraw Zanzibaru',
      title: 'Głęboki relaks i bogactwo kultury',
      reviewText: 'Zabytkowe rzeźbione drzwi z mosiądzem i prywatny basen stworzyły niezwykłą atmosferę. Poranki przy powiewie morskiej bryzy i dzikie delfiny podczas rejsu o wschodzie słońca to wspomnienie na całe życie.',
    },
    'rev-05': {
      country: 'Republika Południowej Afryki',
      stayDate: 'Październik 2025',
      villaStayed: 'Willa Koralowej Zatoki',
      title: 'Prawdziwa afrykańska gościnność w światowym standardzie',
      reviewText: 'Zejście bezpośrednio z tarasu willi do ciepłego turkusowego Oceanu Indyjskiego to czyste szczęście. Ciepło personelu i troska o każdy szczegół sprawiły, że poczuliśmy się jak w rodzinie.',
    },
  },
  ar: {
    'rev-01': {
      country: 'المملكة المتحدة',
      stayDate: 'نوفمبر 2025',
      villaStayed: 'فيلا السلطان الشاطئية',
      title: 'جنة استوائية فاخرة تفوق كل التوقعات',
      reviewText: 'منذ اللحظة الأولى لاستقبالنا بسيارة خاصة في مطار زنجبار وحتى آخر رحلة إبحار بقارب الداو عند الغروب، كان كل تفصيل متقناً لدرجة الإبهار. مسبح الفيلا المطل مباشرة على أمواج المحيط ساحر للغاية.',
    },
    'rev-02': {
      country: 'فرنسا',
      stayDate: 'يناير 2026',
      villaStayed: 'ملاذ حديقة ماكوتي',
      title: 'أناقة أصيلة وهدوء منقطع النظير',
      reviewText: 'الهندسة المعمارية المستوحاة من حجر المرجان وخدمة المساعد الشخصي الراقية تضاهي أرقى نزل أمان العالمية. عشاء المأكولات البحرية السواحيلية بحليب جوز الهند كان تجربة لا تُنسى.',
    },
    'rev-03': {
      country: 'السويد',
      stayDate: 'فبراير 2026',
      villaStayed: 'الفيلا الرئاسية الملكية',
      title: 'الملاذ الخاص الأروع في شرق إفريقيا',
      reviewText: 'سافرنا كعائلة مكونة من خمسة أفراد. وجود مسبح خاص لا متناهٍ يطل على الحيد المرجاني وطاهٍ شخصي يعد لنا صيد البحر الطازج كل مساء أعاد صياغة مفهوم الفخامة الحقيقية لدينا.',
    },
    'rev-04': {
      country: 'الإمارات العربية المتحدة',
      stayDate: 'ديسمبر 2025',
      villaStayed: 'فيلا زنجبار للتوابل',
      title: 'سكينة تامة وغنى ثقافي استثنائي',
      reviewText: 'الأبواب العمانية الأثرية المنحوتة بنقوش النحاس والمسبح الخاص أضفيا جواً من الطمأنينة العميقة. الاستيقاظ على نسيم البحر ومشاهدة الدلافين البرية عند شروق الشمس ذكرى تدوم مدى الحياة.',
    },
    'rev-05': {
      country: 'جنوب إفريقيا',
      stayDate: 'أكتوبر 2025',
      villaStayed: 'فيلا خليج المرجان',
      title: 'ضيافة إفريقية صادقة بأرقى المعايير العالمية',
      reviewText: 'النزول مباشرة من شرفة الفيلا الخشبية إلى مياه المحيط الهندي الفيروزية الدافئة كان متعة خالصة. دفء الفريق واهتمامهم الدقيق جعلانا نشعر وكأننا وسط عائلتنا في تنزانيا.',
    },
  },
  zh: {
    'rev-01': {
      country: '英国',
      stayDate: '2025年11月',
      villaStayed: '苏丹海滨独栋别墅',
      title: '超越一切期许的世外隐逸桃源',
      reviewText: '从专车司机在桑给巴尔机场热情相迎，到最后一晚乘木雕帆船巡游落日，每个细节都近乎无懈可击。悬于海潮之上的私享温水跃水池梦幻迷人。',
    },
    'rev-02': {
      country: '法国',
      stayDate: '2026年1月',
      villaStayed: '马库蒂私家花园静谧别苑',
      title: '原汁原味的典雅与超凡脱俗的静谧',
      reviewText: '克制内敛的在地珊瑚石建筑美学，周到体贴却绝不打扰的专属管家服务，令人联想到安缦或野奢营地的至高水准。斯瓦希里椰香海鲜晚宴回味无穷。',
    },
    'rev-03': {
      country: '瑞典',
      stayDate: '2026年2月',
      villaStayed: '皇家至尊总统官邸',
      title: '东非无可比拟的顶级私密避世圣殿',
      reviewText: '我们一家五口同行。拥有悬挑于珊瑚泻湖之上的私享无边泳池，每晚更有专属私厨现烹当日鲜捞海味，彻底刷新了我们对奢华旅行的定义。',
    },
    'rev-04': {
      country: '阿联酋',
      stayDate: '2025年12月',
      villaStayed: '桑给巴尔丁香香料别墅',
      title: '深度疗愈身心，尽享厚重人文底蕴',
      reviewText: '古董黄铜铆钉雕花木门与私人泳池营造出极致宁静。清晨在海风拂面中醒来，乘日出传统帆船偶遇野生海豚嬉戏，成为终生难忘的高光记忆。',
    },
    'rev-05': {
      country: '南非',
      stayDate: '2025年10月',
      villaStayed: '珊瑚湾全景独栋别墅',
      title: '以世界顶级水准传递发自内心的非洲温情',
      reviewText: '从别墅私人露台赤足直接步入温暖纯净的印度洋碧海，纯粹的幸福油然而生。工作人员的真诚微笑与体贴关怀，让我们在坦桑尼亚感受到了如家般的温暖。',
    },
  },
  fr: {
    'rev-01': {
      country: 'Royaume-Uni',
      stayDate: 'Novembre 2025',
      villaStayed: 'Villa Sultan Front de Mer',
      title: 'Un véritable paradis au-delà de toute espérance',
      reviewText: 'Dès l’accueil de notre chauffeur privé à l’aéroport jusqu’à notre dernière navigation au crépuscule en dhow, chaque instant fut parfait. Le bassin privatif au-dessus de la marée était féerique.',
    },
    'rev-02': {
      country: 'France',
      stayDate: 'Janvier 2026',
      villaStayed: 'Sanctuaire Jardin Makuti',
      title: 'Élégance authentique et sérénité absolue',
      reviewText: 'La pureté architecturale en pierre de corail et le service attentionné mais discret nous ont rappelé les plus beaux lodges Aman ou Singita. Le dîner swahili au lait de coco était inoubliable.',
    },
    'rev-03': {
      country: 'Suède',
      stayDate: 'Février 2026',
      villaStayed: 'La Villa Présidentielle Royale',
      title: 'Le sanctuaire privé ultime d’Afrique de l’Est',
      reviewText: 'Nous avons voyagé à cinq en famille. Disposer de notre piscine à débordement suspendue sur le lagon et de notre chef privé cuisinant la pêche fraîche a redéfini le voyage de luxe.',
    },
    'rev-04': {
      country: 'Émirats Arabes Unis',
      stayDate: 'Décembre 2025',
      villaStayed: 'Villa Épices de Zanzibar',
      title: 'Profondément ressourçant et d’une grande richesse culturelle',
      reviewText: 'Les portes antiques sculptées et la piscine privée ont créé une atmosphère de paix pure. Se réveiller avec la brise marine et observer les dauphins au lever du soleil restera gravé à jamais.',
    },
    'rev-05': {
      country: 'Afrique du Sud',
      stayDate: 'Octobre 2025',
      villaStayed: 'Villa Anse de Corail',
      title: 'Une hospitalité africaine sincère aux standards internationaux',
      reviewText: 'Accéder directement depuis notre terrasse aux eaux chaudes et turquoise de l’océan Indien était un pur bonheur. La bienveillance de l’équipe nous a fait sentir comme en famille.',
    },
  },
  sw: {
    'rev-01': {
      country: 'Uingereza',
      stayDate: 'Novemba 2025',
      villaStayed: 'Villa ya Sultan Ukingoni mwa Bahari',
      title: 'Peponi ya kweli inayozidi matarajio yote',
      reviewText: 'Kuanzia dereva wetu binafsi alipotukaribisha uwanja wa ndege hadi safari ya mwisho ya jahazi machweo, kila kitu kilikuwa bora kabisa. Bwawa binafsi linalotazama maji ya bahari lilikuwa la kustaajabisha.',
    },
    'rev-02': {
      country: 'Ufaransa',
      stayDate: 'Januari 2026',
      villaStayed: 'Makuti Garden Sanctuary',
      title: 'Uzuri wa asili na utulivu wa kipekee',
      reviewText: 'Ujenzi wa mawe ya matumbawe na huduma makini ya wahudumu binafsi inalingana na hoteli bora zaidi duniani. Chakula cha jioni cha Waswahili cha nazi na samaki wa baharini kilikuwa kizuri sana.',
    },
    'rev-03': {
      country: 'Uswidi',
      stayDate: 'Februari 2026',
      villaStayed: 'The Royal Presidential Villa',
      title: 'Makazi binafsi ya hadhi ya juu kabisa Afrika Mashariki',
      reviewText: 'Tulisafiri tukiwa familia ya watu watano. Kuwa na bwawa letu binafsi linalotazama bahari na mpishi wetu anayeandaa samaki wabichi kila jioni kulibadilisha kabisa mtazamo wetu wa anasa.',
    },
    'rev-04': {
      country: 'Falme za Kiarabu (UAE)',
      stayDate: 'Desemba 2025',
      villaStayed: 'Zanzibar Spice Villa',
      title: 'Kupumzika kwa kina na utajiri wa kitamaduni',
      reviewText: 'Milango ya kale ya kuchongwa ya shaba na bwawa binafsi la kuogelea viliunda utulivu wa kipekee. Kuamka na upepo wa bahari na kuona pomboo alfajiri kuliacha kumbukumbu nzuri maishani.',
    },
    'rev-05': {
      country: 'Afrika Kusini',
      stayDate: 'Oktoba 2025',
      villaStayed: 'Coral Cove Villa',
      title: 'Ukarimu wa kweli wa Kiafrika kwa viwango vya kimataifa',
      reviewText: 'Kutembea moja kwa moja kutoka kwenye ukumbi wa villa yetu hadi ndani ya maji ya joto ya Bahari ya Hindi kulileta furaha kuu. Wafanyakazi walitufanya tujisikie kama familia hapa Tanzania.',
    },
  },
  es: {
    'rev-01': {
      country: 'Reino Unido',
      stayDate: 'Noviembre 2025',
      villaStayed: 'Villa Sultán Frente al Océano',
      title: 'Un paraíso absoluto que superó toda expectativa',
      reviewText: 'Desde que el chófer privado nos recibió en el aeropuerto hasta nuestro último paseo en dhow al atardecer, cada detalle estuvo cuidado a la perfección. La piscina sobre el mar fue pura magia.',
    },
    'rev-02': {
      country: 'Francia',
      stayDate: 'Enero 2026',
      villaStayed: 'Santuario Jardín Makuti',
      title: 'Elegancia auténtica y calma absoluta',
      reviewText: 'La sutileza arquitectónica en piedra de coral y el servicio discreto de mayordomo recuerdan a los mejores retiros del mundo. La cena suajili con mariscos y leche de coco fue insuperable.',
    },
    'rev-03': {
      country: 'Suecia',
      stayDate: 'Febrero 2026',
      villaStayed: 'La Villa Presidencial Real',
      title: 'El santuario privado definitivo en África Oriental',
      reviewText: 'Viajamos en familia cinco personas. Tener nuestra piscina infinita sobre la laguna de coral y un chef privado cocinando pesca fresca cada noche redefinió lo que significa el lujo para nosotros.',
    },
    'rev-04': {
      country: 'Emiratos Árabes Unidos',
      stayDate: 'Diciembre 2025',
      villaStayed: 'Villa Especias de Zanzíbar',
      title: 'Profundo descanso y gran riqueza cultural',
      reviewText: 'Las puertas antiguas talladas con herrajes de bronce y la piscina privada crearon un remanso de paz. Despertar con la brisa marina y ver delfines al amanecer fue inolvidable.',
    },
    'rev-05': {
      country: 'Sudáfrica',
      stayDate: 'Octubre 2025',
      villaStayed: 'Villa Caleta de Coral',
      title: 'Auténtica hospitalidad africana de nivel internacional',
      reviewText: 'Bajar directamente desde el porche de madera a las cálidas aguas turquesas del Índico fue gloria pura. El cariño y la dedicación del equipo nos hicieron sentir en familia en Tanzania.',
    },
  },
  it: {
    'rev-01': {
      country: 'Regno Unito',
      stayDate: 'Novembre 2025',
      villaStayed: 'Villa Sultano Fronte Oceano',
      title: 'Un paradiso assoluto oltre ogni aspettativa',
      reviewText: 'Dall’accoglienza con autista privato in aeroporto fino all’ultima veleggiata sul dhow al tramonto, ogni dettaglio è stato perfetto. La piscina affacciata sulla marea dell’oceano era magica.',
    },
    'rev-02': {
      country: 'Francia',
      stayDate: 'Gennaio 2026',
      villaStayed: 'Santuario Giardino Makuti',
      title: 'Autentica eleganza e quiete suprema',
      reviewText: 'La sobrietà architettonica in pietra corallina e il maggiordomo discreto e premuroso ricordano i migliori lodge al mondo. La cena swahili a base di frutti di mare e latte di cocco è stata memorabile.',
    },
    'rev-03': {
      country: 'Svezia',
      stayDate: 'Febbraio 2026',
      villaStayed: 'La Villa Presidenziale Reale',
      title: 'Il rifugio privato d’eccellenza in Africa Orientale',
      reviewText: 'Abbiamo viaggiato in famiglia in cinque. Avere la nostra infinity pool sospesa sulla laguna corallina e uno chef personale che cucinava pescato fresco ha ridefinito il nostro concetto di lusso.',
    },
    'rev-04': {
      country: 'Emirati Arabi Uniti',
      stayDate: 'Dicembre 2025',
      villaStayed: 'Villa Spezie di Zanzibar',
      title: 'Profondamente rigenerante e ricco di cultura',
      reviewText: 'Gli antichi portoni intagliati in ottone e la piscina privata creano una pace totale. Svegliarsi con la brezza marina e avvistare i delfini all’alba rimarrà un ricordo indelebile.',
    },
    'rev-05': {
      country: 'Sudafrica',
      stayDate: 'Ottobre 2025',
      villaStayed: 'Villa Baia del Corallo',
      title: 'Vera ospitalità africana ai massimi standard mondiali',
      reviewText: 'Scendere dalla terrazza della villa direttamente nelle calde acque turchesi dell’Oceano Indiano è stata pura felicità. Il calore dello staff ci ha fatto sentire in famiglia in Tanzania.',
    },
  },
};

export const REVIEWS_UI_TRANSLATIONS: Record<
  Language,
  {
    eyebrow: string;
    heading: string;
    subhead: string;
    verifiedGuest: string;
    sampleNoticeTitle: string;
    sampleNoticeBody: string;
  }
> = {
  en: {
    eyebrow: 'Guest Impressions',
    heading: 'WHAT OUR GUESTS REMEMBER',
    subhead: 'Moments of quiet stillness, warm Swahili welcomes, and the timeless rhythm of the Indian Ocean.',
    verifiedGuest: 'Verified Guest',
    sampleNoticeTitle: 'Editorial Presentation Notice',
    sampleNoticeBody: 'Guest testimonials shown above represent sample guest experiences curated for architectural pitch and preview presentation.',
  },
  pl: {
    eyebrow: 'Wrażenia Gości',
    heading: 'CO ZAPAMIĘTUJĄ NASI GOŚCIE',
    subhead: 'Chwile wyciszenia, ciepłe powitanie w duchu suahili i kojący rytm fal Oceanu Indyjskiego.',
    verifiedGuest: 'Zweryfikowany Gość',
    sampleNoticeTitle: 'Informacja o charakterze poglądowym',
    sampleNoticeBody: 'Powyższe opinie stanowią przykładowe recenzje gości przygotowane na potrzeby prezentacji architektonicznej i wizualizacji obiektu.',
  },
  ar: {
    eyebrow: 'انطباعات الضيوف',
    heading: 'ذكريات لا تُنسى من إقامة ضيوفنا',
    subhead: 'لحظات من السكون الهادئ، وحفاوة الاستقبال السواحيلي الأصيل، وإيقاع أمواج المحيط الهندي الخالد.',
    verifiedGuest: 'ضيف موثق',
    sampleNoticeTitle: 'تنويه العرض التقديمي',
    sampleNoticeBody: 'آراء الضيوف المعروضة أعلاه تمثل نماذج لتجارب الإقامة المختارة لأغراض العرض التقديمي والمعاينة الأولية.',
  },
  zh: {
    eyebrow: '宾客真实印记',
    heading: '铭刻于心的一期一会',
    subhead: '静谧放空的晨昏时光、温暖真挚的斯瓦希里礼遇，以及印度洋恒久不变的潮汐韵律。',
    verifiedGuest: '尊贵入住宾客',
    sampleNoticeTitle: '别苑预览展示说明',
    sampleNoticeBody: '以上宾客评价属于别苑建筑设计与试运营预览阶段精选呈现的体验典范，旨在展现私享旅宿标准。',
  },
  fr: {
    eyebrow: 'Impressions de Voyage',
    heading: 'CE QUE NOS HÔTES RETIENNENT',
    subhead: 'Moments de quiétude absolue, chaleureuse hospitalité swahilie et doux ressac de l’océan Indien.',
    verifiedGuest: 'Hôte Vérifié',
    sampleNoticeTitle: 'Notice de Présentation Éditoriale',
    sampleNoticeBody: 'Les témoignages présentés ci-dessus reflètent des expériences types élaborées pour la présentation architecturale et la prévisualisation.',
  },
  sw: {
    eyebrow: 'Maoni ya Wageni',
    heading: 'MAMBO AMBAYO WAGENI WETU WANAKUMBUKA',
    subhead: 'Nyakati za utulivu mkubwa, ukarimu mchangamfu wa Kiswahili na mdundo wa milele wa Bahari ya Hindi.',
    verifiedGuest: 'Mgeni Aliyethibitishwa',
    sampleNoticeTitle: 'Taarifa ya Maonyesho',
    sampleNoticeBody: 'Maoni ya wageni yaliyoonyeshwa hapo juu ni mifano ya uzoefu wa wageni iliyoandaliwa kwa ajili ya mawasilisho na maonyesho ya awali.',
  },
  es: {
    eyebrow: 'Impresiones de Huéspedes',
    heading: 'LO QUE NUESTROS HUÉSPEDES RECUERDAN',
    subhead: 'Instantes de sosiego pleno, cálidas bienvenidas suajilis y el ritmo eterno de las olas del Índico.',
    verifiedGuest: 'Huésped Verificado',
    sampleNoticeTitle: 'Aviso de Presentación Editorial',
    sampleNoticeBody: 'Los testimonios mostrados representan experiencias de muestra seleccionadas para la presentación arquitectónica y la vista previa.',
  },
  it: {
    eyebrow: 'Impressioni degli Ospiti',
    heading: 'COSA RICORDANO I NOSTRI OSPITI',
    subhead: 'Momenti di assoluta quiete, calorosa accoglienza swahili e il ritmo senza tempo dell’Oceano Indiano.',
    verifiedGuest: 'Ospite Verificato',
    sampleNoticeTitle: 'Nota di Presentazione Editoriale',
    sampleNoticeBody: 'Le recensioni mostrate sopra costituiscono testimonianze esemplificative predisposte a scopo di presentazione architettonica e anteprima.',
  },
};

export function getLocalizedReviews(lang: Language, baseReviews: Review[] = REVIEWS_DATA): Review[] {
  const dict = REVIEWS_LOCALIZED_DATA[lang] || REVIEWS_LOCALIZED_DATA.en;
  return baseReviews.map((rev) => {
    const loc = dict[rev.id];
    if (!loc) return rev;
    return {
      ...rev,
      country: loc.country,
      stayDate: loc.stayDate,
      villaStayed: loc.villaStayed,
      title: loc.title,
      reviewText: loc.reviewText,
    };
  });
}
