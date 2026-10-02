import { Language, GalleryItem } from '../types';
import { GALLERY_DATA } from './gallery';
import { localizeUnlessEdited } from './homeSectionsCms';

export interface LocalizedGalleryItem extends GalleryItem {
  localizedCategoryName: string;
}

export const GALLERY_TRANSLATIONS: Record<
  Language,
  {
    eyebrow: string;
    categories: Record<string, string>;
    items: Record<string, { title: string; caption: string }>;
    lightbox: {
      imageCounter: (curr: number, total: number) => string;
      close: string;
      prev: string;
      next: string;
    };
  }
> = {
  en: {
    eyebrow: 'Visual Archive',
    categories: {
      all: 'All Photographs',
      property: 'Property',
      villas: 'Villas',
      dining: 'Dining',
      pool: 'Pool',
      garden: 'Garden',
      zanzibar: 'Zanzibar',
      experiences: 'Experiences',
    },
    items: {
      'g-prop-01': {
        title: 'Cliffside Oceanfront Sanctuary',
        caption: 'The sweeping coastal grounds of Zanzirangi House overlooking Menai Bay.',
      },
      'g-prop-02': {
        title: 'Swahili Coral Ragstone Architecture',
        caption: 'Sustainable indigenous timber, makuti thatch roofs, and artisanal stone craftsmanship.',
      },
      'g-prop-03': {
        title: 'Twilight Over Menai Bay Shoreline',
        caption: 'Sunset hues reflecting across private beachfront daybeds and gentle evening tides.',
      },
      'g-vil-real': {
        title: 'Zanzirangi Villa Access Pathway',
        caption: 'Atmospheric evening stone pathway winding to private thatched Makuti villas amidst illuminated tropical palms.',
      },
      'g-vil-01': {
        title: 'Sultan Oceanfront Villa Sun Deck',
        caption: 'Private timber deck with personal plunge pool overlooking the turquoise Indian Ocean.',
      },
      'g-vil-02': {
        title: 'Hand-Carved Zanzibar Four-Poster Teak Bed',
        caption: 'Egyptian cotton linens and natural ocean breeze cross-ventilation in the Master Suite.',
      },
      'g-vil-03': {
        title: 'Makuti Garden Sanctuary Verandah',
        caption: 'Secluded outdoor lounge enveloped by blooming frangipani and traveler palms.',
      },
      'g-din-01': {
        title: 'Oceanfront Candlelit Beach Dinner',
        caption: 'Private barefoot dining beneath equatorial stars with personalized butler service.',
      },
      'g-din-02': {
        title: 'Line-Caught Reef Snapper in Coconut Bisque',
        caption: 'Fresh morning catch infused with garden-harvested lemongrass, ginger, and turmeric.',
      },
      'g-din-03': {
        title: 'Artisanal Tropical Breakfast Presentation',
        caption: 'Sun-ripened papaya, passion fruit curd, fresh baked brioche, and spiced Tanzanian coffee.',
      },
      'g-pol-01': {
        title: '25m Ocean Horizon Infinity Pool',
        caption: 'Freshwater infinity pool merging seamlessly with the azure waters of Menai Bay.',
      },
      'g-pol-02': {
        title: 'Sunken Poolside Daybed Lounge',
        caption: 'Shaded canopy loungers with poolside refreshments and chilled coconut water.',
      },
      'g-gar-real': {
        title: 'Illuminated Night Garden Pathway',
        caption: 'Lit stone walkway bordered by banana palms and indigenous frangipani leading to garden villas.',
      },
      'g-gar-01': {
        title: 'From Our Garden Organic Produce & Herbs',
        caption: 'The estate’s organic garden where seasonal vegetables, chili, and spices are cultivated for our kitchen.',
      },
      'g-gar-02': {
        title: 'Centenary Baobab Tree & Botanical Pathways',
        caption: 'Ancient sculptural baobabs and fragrant flowering frangipani throughout the retreat grounds.',
      },
      'g-zan-01': {
        title: 'Stone Town Ancient Carved Doorway',
        caption: 'Masterwork Swahili teak and brass carving in the UNESCO cultural quarter.',
      },
      'g-zan-02': {
        title: 'Pristine White Coral Sands of Nungwi',
        caption: 'Endless turquoise tides and powdery sands along the island’s northern coast.',
      },
      'g-exp-01': {
        title: 'Menai Bay Wild Dolphin Pod',
        caption: 'Early morning dolphin encounters swimming peacefully in open coastal waters.',
      },
      'g-exp-02': {
        title: 'Red Colobus in Jozani National Park',
        caption: 'Endemic Red Colobus monkey resting peacefully in the mahogany canopy.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Image ${c} / ${t}`,
      close: 'Close lightbox',
      prev: 'Previous image',
      next: 'Next image',
    },
  },
  pl: {
    eyebrow: 'Archiwum Wizualne',
    categories: {
      all: 'Wszystkie Zdjęcia',
      property: 'Posiadłość',
      villas: 'Wille',
      dining: 'Gastronomia',
      pool: 'Basen',
      garden: 'Ogród',
      zanzibar: 'Zanzibar',
      experiences: 'Doświadczenia',
    },
    items: {
      'g-prop-01': {
        title: 'Nadmorska Oaza na Klifie',
        caption: 'Malownicze tereny Zanzirangi House z widokiem na Zatokę Menai.',
      },
      'g-prop-02': {
        title: 'Suahilijska Architektura z Wapienia Koralowego',
        caption: 'Trwałe drewno rodzime, strzechy makuti i kunsztowne kamieniarstwo.',
      },
      'g-prop-03': {
        title: 'Zmierzch nad Brzegiem Zatoki Menai',
        caption: 'Barwy zachodu słońca odbijające się w falach przy prywatnych leżankach na plaży.',
      },
      'g-vil-real': {
        title: 'Ścieżka do Willi Zanzirangi',
        caption: 'Klimatyczna wieczorna kamienna ścieżka prowadząca do prywatnych willi krytych strzechą makuti.',
      },
      'g-vil-01': {
        title: 'Taras Słoneczny Willi Sultan Oceanfront',
        caption: 'Prywatny drewniany taras z basenem zanurzeniowym nad lazurowym Oceanem Indyjskim.',
      },
      'g-vil-02': {
        title: 'Ręcznie Rzeźbione Łoże Tekowe z Zanzibaru',
        caption: 'Egipska bawełna i naturalna cyrkulacja morskiej bryzy w Apartamencie Głównym.',
      },
      'g-vil-03': {
        title: 'Weranda Willi Ogrodowej Makuti',
        caption: 'Ustronny salonik na świeżym powietrzu w otoczeniu plumerii i palm pielgrzyma.',
      },
      'g-din-01': {
        title: 'Kolacja przy Świecach na Plaży',
        caption: 'Prywatna kolacja na boso pod równikowymi gwiazdami z dedykowaną obsługą.',
      },
      'g-din-02': {
        title: 'Świeży Snapper z Rafy w Sosie Kokosowym',
        caption: 'Poranny połów wzbogacony trawą cytrynową, imbirem i kurkumą z naszego ogrodu.',
      },
      'g-din-03': {
        title: 'Rzemieślnicze Śniadanie Tropikalne',
        caption: 'Dojrzała papaja, krem z marakui, ciepłe brioszki i aromatyczna kawa tanzańska.',
      },
      'g-pol-01': {
        title: '25-metrowy Basen bezkrawędziowy z widokiem na Horyzont',
        caption: 'Basen ze słodką wodą harmonijnie łączący się z błękitem Zatoki Menai.',
      },
      'g-pol-02': {
        title: 'Zacienione Leżanki przy Basenie',
        caption: 'Zadaszone łoża wypoczynkowe z orzeźwiającymi napojami i chłodną wodą kokosową.',
      },
      'g-gar-real': {
        title: 'Oświetlona Wieczorna Ścieżka Ogrodowa',
        caption: 'Podświetlona alejka kamienna pośród palm bananowych i pachnących plumerii.',
      },
      'g-gar-01': {
        title: 'Ekologiczne Zioła i Warzywa z Naszego Ogrodu',
        caption: 'Ogród posiadłości dostarczający świeżych ziół, papryczek chili i warzyw do naszej kuchni.',
      },
      'g-gar-02': {
        title: 'Stuletni Baobab i Ścieżki Botaniczne',
        caption: 'Majestatyczne rzeźbiarskie baobaby i pachnąca roślinność na terenie resortu.',
      },
      'g-zan-01': {
        title: 'Tradycyjne Rzeźbione Drzwi w Stone Town',
        caption: 'Arcydzieło zanzibarskiego rzeźbiarstwa z drewna tekowego i mosiądzu wpisane na listę UNESCO.',
      },
      'g-zan-02': {
        title: 'Białe Koralowe Piaski Plaży Nungwi',
        caption: 'Krystaliczne turkusowe wody i pudrowy piasek północnego wybrzeża wyspy.',
      },
      'g-exp-01': {
        title: 'Stado Dzikich Delfinów w Zatoce Menai',
        caption: 'Poranne spotkania z delfinami pływającymi swobodnie w ciepłych wodach przybrzeżnych.',
      },
      'g-exp-02': {
        title: 'Gereza Czerwona w Parku Narodowym Jozani',
        caption: 'Zanzibarska gereza czerwona odpoczywająca w koronach mahoniowych drzew.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Zdjęcie ${c} / ${t}`,
      close: 'Zamknij podgląd',
      prev: 'Poprzednie zdjęcie',
      next: 'Następne zdjęcie',
    },
  },
  ar: {
    eyebrow: 'الأرشيف البصري',
    categories: {
      all: 'جميع الصور',
      property: 'المنتجع',
      villas: 'الفلل',
      dining: 'المطاعم',
      pool: 'المسبح',
      garden: 'الحدائق',
      zanzibar: 'زنجبار',
      experiences: 'التجارب',
    },
    items: {
      'g-prop-01': {
        title: 'ملاذ ساحلي على الجرف البحري',
        caption: 'أرجاء منتجع زانزيرانجي هاوس البانورامية المطلة على خليج ميناي.',
      },
      'g-prop-02': {
        title: 'العمارة السواحلية بأحجار المرجان وأسقف الماكوتي',
        caption: 'أخشاب محلية مستدامة، وأسقف قش الماكوتي، وحرفية حجرية يدوية رفيعة المستوى.',
      },
      'g-prop-03': {
        title: 'ألوان الغسق فوق شواطئ خليج ميناي',
        caption: 'انعكاس ألوان غروب الشمس فوق مقصورات الاسترخاء الشاطئية الخاصة وأمواج المساء الهادئة.',
      },
      'g-vil-real': {
        title: 'المسار الحجري المؤدي لفلل زانزيرانجي',
        caption: 'ممر حجري ساحر مضاء ليلاً يقود إلى الفلل الشاطئية الخاصة وسط أشجار النخيل الاستوائية.',
      },
      'g-vil-01': {
        title: 'شرفة التشمس لفيلا السلطان الشاطئية',
        caption: 'شرفة خشبية خاصة تضم مسبحاً خاصاً يطل مباشرة على المحيط الهندي الفيروزي.',
      },
      'g-vil-02': {
        title: 'سرير زنجباري منحوت من خشب الساج بأربعة أعمدة',
        caption: 'بياضات من القطن المصري ونسيم بحري عليل يتدفق عبر الجناح الرئيسي.',
      },
      'g-vil-03': {
        title: 'شرفة فيلا ماكوتي المحاطة بالحدائق',
        caption: 'صالة جلوس خارجية هادئة تلفها أزهار الفرانجيباني وأشجار النخيل الاستوائية.',
      },
      'g-din-01': {
        title: 'عشاء شاطئي خاص على أضواء الشموع',
        caption: 'عشاء حافي القدمين على رمال الشاطئ تحت سماء استوائية مع خدمة نادل خاص.',
      },
      'g-din-02': {
        title: 'سمك النهاش الطازج في حساء حليب جوز الهند',
        caption: 'صيد الصباح الطازج متبل بعشب الليمون والزنجبيل والكركم من حديقة المنتجع.',
      },
      'g-din-03': {
        title: 'إفطار استوائي بأرقى معايير الضيافة',
        caption: 'بابايا طازجة، وخثارة فاكهة الآلام، وبريوش ساخن، وقهوة تنزانية غنية بالنكهات.',
      },
      'g-pol-01': {
        title: 'مسبح أفق لا متناهي بطول 25 متراً',
        caption: 'مسبح مياه عذبة يندمج بسلاسة مع مياه خليج ميناي اللازوردية.',
      },
      'g-pol-02': {
        title: 'أسرّة استرخاء مظللة بمحاذاة المسبح',
        caption: 'جلسات استراحة مظللة تقدم مرطبات منعشة ومياه جوز الهند الطازجة.',
      },
      'g-gar-real': {
        title: 'ممشى الحديقة الليلية المضاءة',
        caption: 'ممشى حجري تحفه أشجار الموز وزهور الياسمين الهندي العطرة ليلاً.',
      },
      'g-gar-01': {
        title: 'محاصيل وأعشاب عضوية من حديقتنا الخاصة',
        caption: 'حديقة المنتجع العضوية حيث تُزرع الخضروات الموسمية والتوابل لإعداد أطباقنا اليومية.',
      },
      'g-gar-02': {
        title: 'شجرة الباوباب المعمرة والمسارات النباتية',
        caption: 'أشجار باوباب أثرية منحوتة وأزهار فواحة في جميع أرجاء المنتجع.',
      },
      'g-zan-01': {
        title: 'أبواب خشبية أثرية منقوشة في المدينة الحجرية',
        caption: 'تحفة فنية سواحلية من خشب الساج والنحاس في الحي الثقافي التاريخي لليونسكو.',
      },
      'g-zan-02': {
        title: 'رمال نونجوي المرجانية البيضاء الناعمة',
        caption: 'مياه فيروزية لا متناهية ورمال بيضاء نقية على طول الساحل الشمالي للجزيرة.',
      },
      'g-exp-01': {
        title: 'أسراب الدلافين البرية في خليج ميناي',
        caption: 'مشاهدة الدلافين والسباحة بالقرب منها في الصباح الباكر في مياه الساحل المفتوحة.',
      },
      'g-exp-02': {
        title: 'قرد الكولوبوس الأحمر في غابة جوزاني الوطنية',
        caption: 'فصيلة نادرة من قردة الكولوبوس تستريح وسط أشجار الماهوجني الكثيفة.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `صورة ${c} من ${t}`,
      close: 'إغلاق نافذة العرض',
      prev: 'الصورة السابقة',
      next: 'الصورة التالية',
    },
  },
  zh: {
    eyebrow: '典藏影像档案',
    categories: {
      all: '全部画廊照片',
      property: '庄园全景',
      villas: '独栋别墅',
      dining: '美馔佳肴',
      pool: '无边泳池',
      garden: '热带花园',
      zanzibar: '桑给巴尔',
      experiences: '海岛探索',
    },
    items: {
      'g-prop-01': {
        title: '伫立于悬崖之巅的临海秘境',
        caption: '俯瞰梅奈湾壮阔蔚蓝海平面的 Zanzirangi House 私享滨海庄园。',
      },
      'g-prop-02': {
        title: '珊瑚石与马库蒂天然木构建筑',
        caption: '甄选当地可持续原木、传统马库蒂茅草穹顶与精工珊瑚石雕筑。',
      },
      'g-prop-03': {
        title: '梅奈湾海岸线的金色暮光',
        caption: '落日余晖洒在私家海滩日光躺椅与宁静退落的晚潮之上。',
      },
      'g-vil-real': {
        title: '庄园夜幕景观石板步道',
        caption: '在隐蔽璀璨的棕榈树灯影中，蜿蜒通往马库蒂独立私属别墅。',
      },
      'g-vil-01': {
        title: '苏丹海景别墅私属观景阳台',
        caption: '配有独立跳水泳池的宽敞柚木露台，直面印度洋蔚蓝海景。',
      },
      'g-vil-02': {
        title: '手工雕花斯瓦希里柚木四柱大床',
        caption: '主卧套房配备高密埃及棉床品与迎面吹来的天然清凉海风。',
      },
      'g-vil-03': {
        title: '马库蒂花园谧境遮阴走廊',
        caption: '掩映在盛开的鸡蛋花与旅人蕉之中的私享户外休憩廊台。',
      },
      'g-din-01': {
        title: '星空烛光私享沙滩晚宴',
        caption: '赤足漫步在赤道星空下的沙滩，尊享一对一私人管家侍餐。',
      },
      'g-din-02': {
        title: '野生礁红鱼佐自研椰奶浓汤',
        caption: '清晨出海捕捞的鲜鱼，佐以庄园新鲜采摘的柠檬草、鲜姜与郁金。',
      },
      'g-din-03': {
        title: '手工精制热带阳光早餐',
        caption: '金黄木瓜、百香果果酱、温热新鲜法式布里欧修面包配坦桑尼亚精品咖啡。',
      },
      'g-pol-01': {
        title: '25米临海地平线无边泳池',
        caption: '清凉淡水无边泳池与梅奈湾清澈碧绿的海水融为一体。',
      },
      'g-pol-02': {
        title: '泳池畔遮阳天幕休闲榻',
        caption: '在宽敞凉棚下尽情品尝清凉软饮与新鲜现开冰镇椰子水。',
      },
      'g-gar-real': {
        title: '璀璨夜灯掩映的花园步道',
        caption: '石径两旁栽种着香蕉棕榈与馥郁芬芳的鸡蛋花树，通往幽静庭院。',
      },
      'g-gar-01': {
        title: '庄园自培有机香料与时令蔬菜',
        caption: '后院私人生态种植园，直供主厨当日所选的纯天然香草与辣椒。',
      },
      'g-gar-02': {
        title: '百年古猴面包树与植物小径',
        caption: '掩映在度假庄园深处古老而奇妙的自然巨树与繁花绿植。',
      },
      'g-zan-01': {
        title: '石头城联合国教科文组织古迹雕花木门',
        caption: '桑给巴尔传统手工艺大师雕琢的柚木铜钉门雕艺术。',
      },
      'g-zan-02': {
        title: '农威海滩细腻洁白的珊瑚沙滩',
        caption: '桑给巴尔北部绵延不绝的碧绿潮汐与纯白如粉的细沙。',
      },
      'g-exp-01': {
        title: '梅奈湾野生海豚嬉戏群',
        caption: '晨曦泛舟出海，在开阔的蔚蓝海湾中近距离邂逅跃动的野生海豚。',
      },
      'g-exp-02': {
        title: '乔扎尼国家公园红疣猴',
        caption: '桑给巴尔特有的珍稀红疣猴栖息在浓密的红木林树冠之上。',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `照片 ${c} / ${t}`,
      close: '关闭大图预览',
      prev: '上一张',
      next: '下一张',
    },
  },
  fr: {
    eyebrow: 'Archive Visuelle',
    categories: {
      all: 'Toutes les Photos',
      property: 'Domaine',
      villas: 'Villas',
      dining: 'Gastronomie',
      pool: 'Piscine',
      garden: 'Jardin',
      zanzibar: 'Zanzibar',
      experiences: 'Expériences',
    },
    items: {
      'g-prop-01': {
        title: 'Sanctuaire Côtier Perché sur la Falaise',
        caption: 'Les vastes jardins côtiers de Zanzirangi House surplombant la baie de Menai.',
      },
      'g-prop-02': {
        title: 'Architecture Swahilie en Pierre de Corail',
        caption: 'Bois indigènes durables, toitures en chaume makuti et maçonnerie d’art.',
      },
      'g-prop-03': {
        title: 'Crépuscule sur le Littoral de Menai Bay',
        caption: 'Reflets dorés du coucher de soleil sur les lits de plage privés et les marées du soir.',
      },
      'g-vil-real': {
        title: 'Allée d’Accès aux Villas Zanzirangi',
        caption: 'Allée nocturne en pierre serpentant vers les villas privées au toit de chaume sous les palmiers illuminés.',
      },
      'g-vil-01': {
        title: 'Terrasse Ensoleillée de la Villa Sultan Front de Mer',
        caption: 'Terrasse en bois privative avec bassin de plongée face aux eaux turquoise de l’océan Indien.',
      },
      'g-vil-02': {
        title: 'Lit Baldaquin en Teck Sculpté Artisanal',
        caption: 'Linge en coton égyptien et douce ventilation marine dans la Suite Maître.',
      },
      'g-vil-03': {
        title: 'Véranda du Sanctuaire Makuti Jardin',
        caption: 'Salon extérieur isolé enveloppé de frangipaniers fleuris et d’arbres du voyageur.',
      },
      'g-din-01': {
        title: 'Dîner aux Chandelles sur la Plage',
        caption: 'Dîner privé pieds nus sous les étoiles équatoriales avec service de majordome.',
      },
      'g-din-02': {
        title: 'Vivaneau Sauvage de Récif en Bisque de Coco',
        caption: 'Pêche du matin infusée de citronnelle, gingembre et curcuma cueillis dans notre jardin.',
      },
      'g-din-03': {
        title: 'Présentation Petit-Déjeuner Tropical Artisanal',
        caption: 'Papaye mûre à point, crème de fruit de la passion, brioche dorée et café tanzanien.',
      },
      'g-pol-01': {
        title: 'Piscine à Débordement de 25m Face à l’Horizon',
        caption: 'Piscine d’eau douce se confondant harmonieusement avec les reflets de la baie de Menai.',
      },
      'g-pol-02': {
        title: 'Salons Transats Ombragés au Bord de l’Eau',
        caption: 'Bain de soleil abrité avec rafraîchissements délicats et eau de coco fraîche.',
      },
      'g-gar-real': {
        title: 'Allée Nocturne Éclairée du Jardin Botanique',
        caption: 'Chemin de pierre bordé de bananiers et de frangipaniers menant aux villas.',
      },
      'g-gar-01': {
        title: 'Herbes Aromatiques et Légumes Bio du Domaine',
        caption: 'Notre potager biologique où légumes de saison et épices sont cultivés pour la table.',
      },
      'g-gar-02': {
        title: 'Baobab Centenaire et Sentiers Botaniques',
        caption: 'Baobabs sculpturaux anciens et fleurs odorantes répartis sur le domaine.',
      },
      'g-zan-01': {
        title: 'Porte Ancestrale Sculptée de Stone Town',
        caption: 'Chef-d’œuvre d’ébénisterie swahilie en teck et laiton classé à l’UNESCO.',
      },
      'g-zan-02': {
        title: 'Sables de Corail Blanc Pur de Nungwi',
        caption: 'Eaux cristallines et sable fin et soyeux sur la côte nord de l’île.',
      },
      'g-exp-01': {
        title: 'Dauphins Sauvages de la Baie de Menai',
        caption: 'Rencontres matinales avec les dauphins évoluant paisiblement au large.',
      },
      'g-exp-02': {
        title: 'Colobe Rouge du Parc National de Jozani',
        caption: 'Singe colobe rouge endémique perché dans la canopée des acajous.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Photo ${c} sur ${t}`,
      close: 'Fermer la vue agrandie',
      prev: 'Photo précédente',
      next: 'Photo suivante',
    },
  },
  sw: {
    eyebrow: 'Kumbukumbu ya Picha',
    categories: {
      all: 'Picha Zote',
      property: 'Hoteli',
      villas: 'Majumba (Villas)',
      dining: 'Chakula',
      pool: 'Bwawa',
      garden: 'Bustani',
      zanzibar: 'Zanzibar',
      experiences: 'Matukio',
    },
    items: {
      'g-prop-01': {
        title: 'Makazi ya Pwani Juu ya Jabali',
        caption: 'Mandhari mapana ya Zanzirangi House yanayotazama Ghuba ya Menai.',
      },
      'g-prop-02': {
        title: 'Usanifu wa Mawe ya Matumbawe na Makuti',
        caption: 'Mbao imara za asili, paa la makuti na ustadi wa hali ya juu wa ujenzi wa mawe.',
      },
      'g-prop-03': {
        title: 'Machweo ya Jua Pwani ya Ghuba ya Menai',
        caption: 'Rangi za dhahabu za jua zikimulika vitanda vya ufukweni na mawimbi ya jioni.',
      },
      'g-vil-real': {
        title: 'Njia ya Mawe Kuelekea Majumba ya Zanzirangi',
        caption: 'Njia nzuri ya mawe yenye taa za jioni kuelekea majumba ya makuti kati ya mitende.',
      },
      'g-vil-01': {
        title: 'Ubaraza wa Jua wa Villa ya Sultan',
        caption: 'Ubaraza wa mbao wenye kidimbwi binafsi cha maji ukitazama Bahari ya Hindi.',
      },
      'g-vil-02': {
        title: 'Kitanda cha Asili cha Mninga cha Zanzibar',
        caption: 'Mashuka ya pamba ya Misri na hewa asilia ya upepo wa bahari chumbani.',
      },
      'g-vil-03': {
        title: 'Ukumbi wa Nje wa Villa ya Bustani',
        caption: 'Sebule ya nje iliyotulia katikati ya maua ya mlangilangi na miti ya kitropiki.',
      },
      'g-din-01': {
        title: 'Chakula cha Jioni Ufukweni chenye Mishumaa',
        caption: 'Chakula binafsi mchangani chini ya nyota kikiambatana na huduma maalum.',
      },
      'g-din-02': {
        title: 'Changu Mbichi wa Mwambao katika Mchuzi wa Nazi',
        caption: 'Samaki wa asubuhi aliyepikwa na mchaichai, tangawizi na manjano ya bustanini.',
      },
      'g-din-03': {
        title: 'Kifungua Kinywa cha Matunda Asilia ya Kitropiki',
        caption: 'Papai bivu, rojo ya pasheni, mkate safi wa joto na kahawa ya viungo ya Tanzania.',
      },
      'g-pol-01': {
        title: 'Bwawa la Futi 25 Linazama Upeo wa Macho',
        caption: 'Bwawa la maji baridi linaloungana na mandhari ya Ghuba ya Menai.',
      },
      'g-pol-02': {
        title: 'Vitanda vya Kivuli Kando ya Bwawa',
        caption: 'Pumzika kwenye vitanda vya kivuli ukiburudika na madafu baridi.',
      },
      'g-gar-real': {
        title: 'Njia ya Bustani Yenye Taa za Usiku',
        caption: 'Njia ya mawe yenye migomba na maua ya asili inayoelekea vyumbani.',
      },
      'g-gar-01': {
        title: 'Mboga na Viungo vya Asili Kutoka Bustanini',
        caption: 'Bustani yetu ya asili inayozalisha mboga za majani, pilipili na viungo vya jikoni.',
      },
      'g-gar-02': {
        title: 'Mbuyu wa Karne na Njia za Asili',
        caption: 'Mibuyu mikubwa ya kale na maua yenye harufu nzuri ndani ya hoteli.',
      },
      'g-zan-01': {
        title: 'Mlango wa Kale Uliochongwa wa Mji Mkongwe',
        caption: 'Sanaa ya kipekee ya mbao za mninga na shaba iliyotambuliwa na UNESCO.',
      },
      'g-zan-02': {
        title: 'Mchanga Mweupe Safi wa Nungwi',
        caption: 'Mawimbi ya samawati na mchanga safi mweupe kaskazini mwa kisiwa.',
      },
      'g-exp-01': {
        title: 'Pomboo Pori Katika Ghuba ya Menai',
        caption: 'Tazama pomboo wakiogelea kwa amani asubuhi mapema baharini.',
      },
      'g-exp-02': {
        title: 'Kima Mwekundu Katika Hifadhi ya Jozani',
        caption: 'Kima wekundu wa kipekee wa Zanzibar wakiwa juu ya miti ya msitu wa Jozani.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Picha ${c} kati ya ${t}`,
      close: 'Funga picha',
      prev: 'Picha iliyotangulia',
      next: 'Picha inayofuata',
    },
  },
  es: {
    eyebrow: 'Archivo Visual',
    categories: {
      all: 'Todas las Fotografías',
      property: 'Propiedad',
      villas: 'Villas',
      dining: 'Gastronomía',
      pool: 'Piscina',
      garden: 'Jardín',
      zanzibar: 'Zanzíbar',
      experiences: 'Experiencias',
    },
    items: {
      'g-prop-01': {
        title: 'Santuario Costero Frente al Acantilado',
        caption: 'Los extensos terrenos costeros de Zanzirangi House con vistas a Menai Bay.',
      },
      'g-prop-02': {
        title: 'Arquitectura Suajili en Piedra de Coral',
        caption: 'Maderas autóctonas sostenibles, techumbres makuti y artesanía en piedra.',
      },
      'g-prop-03': {
        title: 'Crepúsculo Sobre la Costa de Menai Bay',
        caption: 'Tonos del atardecer reflejándose en las tumbonas de playa privada y las suaves mareas.',
      },
      'g-vil-real': {
        title: 'Sendero de Piedra Hacia las Villas Zanzirangi',
        caption: 'Mágico sendero nocturno iluminado que conduce a las villas privadas bajo palmeras tropicales.',
      },
      'g-vil-01': {
        title: 'Solárium de la Villa Sultan Frente al Océano',
        caption: 'Terraza privada de madera con piscina de inmersión con vistas al océano Índico.',
      },
      'g-vil-02': {
        title: 'Cama con Dosel de Teca Tallada a Mano',
        caption: 'Ropa de cama de algodón egipcio y ventilación natural con brisa marina en la Suite Principal.',
      },
      'g-vil-03': {
        title: 'Porche del Santuario Makuti en el Jardín',
        caption: 'Salón exterior privado envuelto por frangipanis en flor y palmeras del viajero.',
      },
      'g-din-01': {
        title: 'Cena en la Playa a la Luz de las Velas',
        caption: 'Cena privada descalzo sobre la arena bajo las estrellas con mayordomo exclusivo.',
      },
      'g-din-02': {
        title: 'Pargo Fresco de Arrecife en Bisque de Coco',
        caption: 'Pesca fresca del día infusionada con limoncillo, jengibre y cúrcuma de nuestro huerto.',
      },
      'g-din-03': {
        title: 'Desayuno Tropical Artesanal',
        caption: 'Papaya madura, crema de maracuyá, brioche caliente y café especiado de Tanzania.',
      },
      'g-pol-01': {
        title: 'Piscina Infinita de 25m Hacia el Horizonte Marino',
        caption: 'Piscina de agua dulce fundiéndose a la perfección con los tonos turquesa de Menai Bay.',
      },
      'g-pol-02': {
        title: 'Tumbonas Bajo Sombra Junto a la Piscina',
        caption: 'Camas de descanso a la sombra con bebidas refrescantes y agua de coco fría.',
      },
      'g-gar-real': {
        title: 'Sendero Iluminado en el Jardín Nocturno',
        caption: 'Camino de piedra rodeado de bananeros y frangipanis aromáticos hacia las villas.',
      },
      'g-gar-01': {
        title: 'Verduras y Especias Orgánicas de Nuestro Huerto',
        caption: 'El huerto ecológico del hotel donde se cultivan ingredientes frescos para nuestra cocina.',
      },
      'g-gar-02': {
        title: 'Baobab Centenario y Rutas Botánicas',
        caption: 'Antiguos baobabs esculturales y flores fragantes en todos los rincones del resort.',
      },
      'g-zan-01': {
        title: 'Puerta Antigua Tallada en Stone Town',
        caption: 'Obra maestra de madera de teca y latón en el barrio histórico de la UNESCO.',
      },
      'g-zan-02': {
        title: 'Arenas Blancas de Coral en Nungwi',
        caption: 'Aguas cristalinas color turquesa y finas arenas blancas en la costa norte de la isla.',
      },
      'g-exp-01': {
        title: 'Delfines Salvajes en la Bahía de Menai',
        caption: 'Avistamiento de delfines nadando en libertad en aguas costeras a primera hora de la mañana.',
      },
      'g-exp-02': {
        title: 'Colobo Rojo en el Parque Nacional Jozani',
        caption: 'Mono colobo rojo endémico descansando plácidamente en las copas de caoba.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Fotografía ${c} de ${t}`,
      close: 'Cerrar visor',
      prev: 'Fotografía anterior',
      next: 'Fotografía siguiente',
    },
  },
  it: {
    eyebrow: 'Archivio Visivo',
    categories: {
      all: 'Tutte le Fotografie',
      property: 'Tenuta',
      villas: 'Ville',
      dining: 'Ristorazione',
      pool: 'Piscina',
      garden: 'Giardino',
      zanzibar: 'Zanzibar',
      experiences: 'Esperienze',
    },
    items: {
      'g-prop-01': {
        title: 'Oasi Panoramica sulla Scogliera',
        caption: 'I vasti giardini costieri di Zanzirangi House affacciati su Menai Bay.',
      },
      'g-prop-02': {
        title: 'Architettura Swahili in Pietra Corallina',
        caption: 'Legni indigeni sostenibili, tetti in makuti e pregiata lavorazione artigianale della pietra.',
      },
      'g-prop-03': {
        title: 'Crepuscolo Lungo la Costa di Menai Bay',
        caption: 'I riflessi del tramonto sui lettini della spiaggia privata e le calme maree serali.',
      },
      'g-vil-real': {
        title: 'Sentiero in Pietra Verso le Ville Zanzirangi',
        caption: 'Suggestivo percorso serale illuminato che conduce alle ville private tra le palme tropicali.',
      },
      'g-vil-01': {
        title: 'Solarium della Villa Sultan Fronte Oceano',
        caption: 'Ponte privato in legno con vasca idromassaggio affacciata sulle acque turchesi dell’Oceano Indiano.',
      },
      'g-vil-02': {
        title: 'Letto a Baldacchino in Teak Intagliato a Mano',
        caption: 'Lenzuola in cotone egiziano e fresca brezza marina naturale nella Master Suite.',
      },
      'g-vil-03': {
        title: 'Veranda della Villa Makuti nel Giardino',
        caption: 'Salotto all’aperto appartato circondato da frangipani in fiore e palme del viaggiatore.',
      },
      'g-din-01': {
        title: 'Cena a Piedi Nudi sulla Spiaggia a Lume di Candela',
        caption: 'Cena privata sotto il cielo stellato equatoriale con servizio maggiordomo dedicato.',
      },
      'g-din-02': {
        title: 'Dentice di Barriera Pescato al Mattino in Zuppa di Cocco',
        caption: 'Pescato freschissimo aromatizzato con citronella, zenzero e curcuma del nostro orto botanico.',
      },
      'g-din-03': {
        title: 'Presentazione Colazione Tropicale Artigianale',
        caption: 'Papaya matura, crema al frutto della passione, brioche calde e caffè speziato della Tanzania.',
      },
      'g-pol-01': {
        title: 'Piscina a Sfioro da 25m Affacciata sull’Oceano',
        caption: 'Piscina d’acqua dolce che si fonde armoniosamente con le sfumature di Menai Bay.',
      },
      'g-pol-02': {
        title: 'Lettini Prendisole Ombreggiati a Bordo Piscina',
        caption: 'Comode sedute all’ombra con bibite rinfrescanti e acqua di cocco appena aperta.',
      },
      'g-gar-real': {
        title: 'Sentiero Notturno Illuminato nel Giardino Botanico',
        caption: 'Passeggiata in pietra contornata da banani e frangipani profumati verso le ville.',
      },
      'g-gar-01': {
        title: 'Erbe Aromatiche e Ortaggi Biologici dal Nostro Orto',
        caption: 'L’orto biologico della tenuta che produce ortaggi di stagione e spezie per la nostra cucina.',
      },
      'g-gar-02': {
        title: 'Baobab Centenario e Percorsi Botanici',
        caption: 'Antichi e maestosi baobab tra fiori esotici e sentieri curati nella tenuta.',
      },
      'g-zan-01': {
        title: 'Antica Porta Intagliata a Mano a Stone Town',
        caption: 'Capolavoro d’ebanisteria swahili in legno di teak e ottone nel centro storico UNESCO.',
      },
      'g-zan-02': {
        title: 'Sabbia Bianca Corallina della Spiaggia di Nungwi',
        caption: 'Maree turchesi e sabbia finissima lungo la rinomata costa settentrionale dell’isola.',
      },
      'g-exp-01': {
        title: 'Delfini Selvatici nella Baia di Menai',
        caption: 'Avvistamento mattutino di branchi di delfini liberi nelle acque calde dell’oceano.',
      },
      'g-exp-02': {
        title: 'Colobo Rosso nel Parco Nazionale di Jozani',
        caption: 'Raro primate endemico di Zanzibar che riposa tra le chiome degli alberi di mogano.',
      },
    },
    lightbox: {
      imageCounter: (c, t) => `Immagine ${c} di ${t}`,
      close: 'Chiudi anteprima',
      prev: 'Immagine precedente',
      next: 'Immagine successiva',
    },
  },
};

export function getLocalizedGallery(lang: Language, baseGallery: GalleryItem[] = GALLERY_DATA): LocalizedGalleryItem[] {
  const dict = GALLERY_TRANSLATIONS[lang] || GALLERY_TRANSLATIONS.en;
  return baseGallery.map((item) => {
    const itemTrans = dict.items[item.id];
    const catLabel = dict.categories[item.category] || item.category;
    const seed = GALLERY_DATA.find((g) => g.id === item.id);
    const en = GALLERY_TRANSLATIONS.en.items[item.id];
    return {
      ...item,
      title: localizeUnlessEdited(item.title, seed?.title, en?.title, itemTrans?.title),
      caption: localizeUnlessEdited(item.caption, seed?.caption, en?.caption, itemTrans?.caption),
      description: localizeUnlessEdited(item.description, seed?.description, en?.caption, itemTrans?.caption),
      localizedCategoryName: catLabel,
    };
  });
}

