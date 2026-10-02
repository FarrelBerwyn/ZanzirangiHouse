import { Language } from '../types';
import { ZanzibarDestination, ZANZIBAR_DESTINATIONS } from './exploreZanzibar';
import { TanzaniaDestination, TANZANIA_DESTINATIONS } from './tanzaniaDestinations';
import { localizeUnlessEdited, localizeListUnlessEdited } from './homeSectionsCms';

export interface LocalizedZanzibarDest {
  name: string;
  theme: string;
  location: string;
  shortDescription: string;
  highlights: string[];
  ctaLabel: string;
}

export interface LocalizedTanzaniaDest {
  name: string;
  tagline: string;
  region: string;
  flightTimeFromZanzibar: string;
  description: string;
  highlights: string[];
  bestFor: string;
  safariType: string;
}

export const ZANZIBAR_DEST_TRANSLATIONS: Record<
  Language,
  Record<string, LocalizedZanzibarDest>
> = {
  en: {
    'dest-stone-town': {
      name: 'STONE TOWN',
      theme: 'Culture & Heritage',
      location: 'West Coast • UNESCO World Heritage Site',
      shortDescription:
        'Labyrinthine coral ragstone alleyways, centuries-old Omani brass-studded carved doors, Persian baths, and the vibrant scents of coffee and clove hanging in historic Swahili courtyards.',
      highlights: [
        'House of Wonders & Old Fort',
        'Freddie Mercury Museum',
        'Darajani Spice Market',
        'Forodhani Gardens Sunset Bazaar',
      ],
      ctaLabel: 'Explore Stone Town',
    },
    'dest-mnemba': {
      name: 'MNEMBA ISLAND',
      theme: 'Marine Life & Crystal Waters',
      location: 'North-East Coast • Protected Marine Sanctuary',
      shortDescription:
        'An idyllic triangular coral atoll surrounded by electric turquoise waters. Dive or snorkel alongside green sea turtles, playful dolphins, and vibrant clownfish in one of Africa’s premier marine reserves.',
      highlights: [
        'Crystalline coral reef walls',
        'Green sea turtle nesting sites',
        'Pristine sandbank picnics',
        'Dolphin observation',
      ],
      ctaLabel: 'Discover Mnemba Atoll',
    },
    'dest-spice-farms': {
      name: 'SPICE FARMS',
      theme: 'The Flavours of Zanzibar',
      location: 'Central Countryside • Historical Plantations',
      shortDescription:
        'Walk through fragrant rainforest groves of cloves, green cardamom pods, cinnamon bark, and wild vanilla vines. Uncover the centuries of maritime spice trade that gave Zanzibar its legendary nickname.',
      highlights: [
        'Fresh vanilla & cinnamon harvesting',
        'Rare tropical fruit tastings',
        'Handmade leaf crowns & Swahili songs',
        'Traditional spice lunch',
      ],
      ctaLabel: 'Taste Spice Heritage',
    },
    'dest-jozani': {
      name: 'JOZANI FOREST',
      theme: 'Nature & Wildlife',
      location: 'South-Central Zanzibar • National Park',
      shortDescription:
        'Zanzibar’s only national park preserves 50 square kilometers of virgin groundwater forest, ancient red mahogany groves, and the playful, critically endangered Zanzibar Red Colobus monkey.',
      highlights: [
        'Endemic Red Colobus monkeys',
        'Mangrove boardwalk trail',
        'Over 40 butterfly species',
        'Medicinal tree guide',
      ],
      ctaLabel: 'Trek Jozani Canopy',
    },
    'dest-nungwi': {
      name: 'NUNGWI & KENDWA',
      theme: 'Beaches & Sunset',
      location: 'North Coast • Non-Tidal Swimming',
      shortDescription:
        'Famous for uninterrupted 24-hour swimming without tidal recedes, powdery talcum beaches, artisan dhow boatbuilding workshops, and legendary golden hour celebrations as the sun melts into the calm northern sea.',
      highlights: [
        'All-day turquoise swimming beaches',
        'Traditional dhow boatyard tours',
        'Sea turtle conservation pond',
        'Vibrant sunset beach gatherings',
      ],
      ctaLabel: 'Experience North Beaches',
    },
  },
  pl: {
    'dest-stone-town': {
      name: 'STONE TOWN',
      theme: 'Kultura i Dziedzictwo',
      location: 'Zachodnie Wybrzeże • Obiekt UNESCO',
      shortDescription:
        'Labirynt uliczek z koralowego kamienia, wiekowe rzeźbione drzwi z mosiężnymi ćwiekami, łaźnie perskie oraz zapach kardamonu i kawy unoszący się w historycznych suahilijskich dziedzińcach.',
      highlights: [
        'Dom Cudów i Stary Fort',
        'Muzeum Freddiego Mercury’ego',
        'Targ Przypraw Darajani',
        'Wieczorny Bazar Forodhani Gardens',
      ],
      ctaLabel: 'Odkryj Stone Town',
    },
    'dest-mnemba': {
      name: 'WYSPA MNEMBA',
      theme: 'Życie Morskie i Turkusowe Wody',
      location: 'Północno-Wschodnie Wybrzeże • Rezerwat Morski',
      shortDescription:
        'Rajski atol koralowy otoczony lazurowymi wodami. Nurkuj z rurką w towarzystwie zielonych żółwi morskich, dzikich delfinów i barwnych ryb w jednym z najlepszych rezerwatów Afryki.',
      highlights: [
        'Krystaliczne ściany rafy koralowej',
        'Miejsca lęgowe żółwi zielonych',
        'Pikniki na dziewiczych mieliznach',
        'Obserwacja delfinów w naturze',
      ],
      ctaLabel: 'Odkryj Atol Mnemba',
    },
    'dest-spice-farms': {
      name: 'PLANTACJE PRZYPRAWSKIE',
      theme: 'Smaki Zanzibaru',
      location: 'Centralna Część Wyspy • Historyczne Plantacje',
      shortDescription:
        'Spaceruj wśród pachnących gajów goździkowców, zielonego kardamonu, kory cynamonowca i pnączy wanilii. Poznaj stulecia morskiego handlu, który dał Zanzibarowi sławę Wyspy Przypraw.',
      highlights: [
        'Zbiór świeżej wanilii i cynamonu',
        'Degustacja rzadkich owoców tropikalnych',
        'Tradycyjne korony z liści palmowych',
        'Autentyczny obiad z przyprawami',
      ],
      ctaLabel: 'Poznaj Dziedzictwo Przypraw',
    },
    'dest-jozani': {
      name: 'LAS JOZANI',
      theme: 'Natura i Dzika Przyroda',
      location: 'Południowo-Środkowy Zanzibar • Park Narodowy',
      shortDescription:
        'Jedyny park narodowy Zanzibaru chroniący 50 km² pierwotnego lasu deszczowego, starożytne mahonie oraz endemiczne, krytycznie zagrożone gerezy rude (Red Colobus).',
      highlights: [
        'Endemiczne małpy Red Colobus',
        'Kładka przez lasy namorzynowe',
        'Ponad 40 gatunków motyli',
        'Przewodnik po drzewach leczniczych',
      ],
      ctaLabel: 'Przejdź Ścieżką Jozani',
    },
    'dest-nungwi': {
      name: 'NUNGWI I KENDWA',
      theme: 'Plaże i Spektakularne Zachody Słońca',
      location: 'Północne Wybrzeże • Pływanie bez Względu na Pływy',
      shortDescription:
        'Słynące z całodobowej możliwości kąpieli bez odpływów, plaż o miękkim jak puder piasku, tradycyjnych stoczni łodzi dhow i legendarnych zachodów słońca na północnym krańcu wyspy.',
      highlights: [
        'Kąpiele w lazurowym morzu przez cały dzień',
        'Zwiedzanie stoczni łodzi dhow',
        'Akwarium ochronne żółwi morskich',
        'Zachody słońca przy muzyce na plaży',
      ],
      ctaLabel: 'Poznaj Północne Wybrzeże',
    },
  },
  ar: {
    'dest-stone-town': {
      name: 'مدينة ستون تاون',
      theme: 'الثقافة والتراث التاريخي',
      location: 'الساحل الغربي • موقع تراث عالمي لليونسكو',
      shortDescription:
        'أزقة حجرية مرجانية ملتوية، وأبواب عمانية خشبية منحوتة بمسامير نحاسية عريقة، وحمامات فارسية، وعبق القهوة والهيل والقرنفل في أروقة البيوت السواحيلية القديمة.',
      highlights: [
        'بيت العجائب والقلعة القديمة',
        'متحف فريدي ميركوري',
        'سوق داراجاني للتوابل',
        'بازار حديقة فورودهاني للغروب',
      ],
      ctaLabel: 'استكشف ستون تاون',
    },
    'dest-mnemba': {
      name: 'جزيرة منيمبا',
      theme: 'الحياة البحرية والمياه الكريستالية',
      location: 'الساحل الشمالي الشرقي • محمية بحرية طبيعية',
      shortDescription:
        'شبه جزيرة مرجانية مثلثة تسبح في مياه فيروزية متلألئة. تجربة غطس فريدة بجوار السلاحف البحرية الخضراء والدلافين وأسراب الأسماك الملونة في إحدى أرقى محميات إفريقيا.',
      highlights: [
        'جدران الشعب المرجانية النقية',
        'مواقع تعشيش السلاحف الخضراء',
        'نزهات على الضفاف الرملية العذراء',
        'مشاهدة الدلافين والسباحة قربها',
      ],
      ctaLabel: 'اكتشف حيد منيمبا',
    },
    'dest-spice-farms': {
      name: 'مزارع التوابل التاريخية',
      theme: 'نكهات وعطور زنجبار',
      location: 'الريف الأوسط • مزارع ملكية قديمة',
      shortDescription:
        'جولة بين أشجار القرنفل وقرون الهيل الخضراء ولحاء القرفة وفانيليا الغابات العطرية. تعرف على تاريخ تجارة التوابل البحرية التي جعلت زنجبار تُلقب بجزيرة التوابل.',
      highlights: [
        'حصاد الفانيليا والقرفة الطازجة',
        'تذوق فواكه استوائية نادرة',
        'تيجان أوراق النخيل المصنوعة يدوياً',
        'غداء تقليدي بأشهى توابل الجزيرة',
      ],
      ctaLabel: 'تذوق تراث التوابل',
    },
    'dest-jozani': {
      name: 'غابة جوزاني الوطنية',
      theme: 'الطبيعة والحياة البرية',
      location: 'جنوب وسط زنجبار • حديقة وطنية',
      shortDescription:
        'الحديقة الوطنية الوحيدة في زنجبار، تمتد على 50 كم² من الغابات العذراء وأشجار الماهوجني، وموطن قرد الكولوبوس الأحمر النادر والمهدد بالانقراض.',
      highlights: [
        'قرود الكولوبوس الحمراء النادرة',
        'مسار المشي في غابات المانغروف',
        'أكثر من 40 نوعاً من الفراشات',
        'جولة للأشجار الطبية التقليدية',
      ],
      ctaLabel: 'مسار غابة جوزاني',
    },
    'dest-nungwi': {
      name: 'نونغوي وكيندوا',
      theme: 'شواطئ بيضاء ومغيب الشمس',
      location: 'الساحل الشمالي • سباحة متواصلة دون انحسار المد',
      shortDescription:
        'تتميز بإمكانية السباحة المتواصلة على مدار اليوم دون تأثر بالمد والجزر، مع رمال بيضاء ناعمة كالحرير، وورش صناعة قوارب الداو التقليدية، وأروع مشاهد الغروب.',
      highlights: [
        'شواطئ فيروزية نقية طوال اليوم',
        'جولة ورش صناعة سفن الداو الخشبية',
        'حوض رعاية وحماية السلاحف البحرية',
        'أجواء احتفالية شاطئية عند الغروب',
      ],
      ctaLabel: 'استمتع بشواطئ الشمال',
    },
  },
  zh: {
    'dest-stone-town': {
      name: '石头城 (STONE TOWN)',
      theme: '人文底蕴与世界遗产',
      location: '西海岸 • 联合国教科文组织世界文化遗产',
      shortDescription:
        '曲折幽深的珊瑚石古巷、镌刻着数百年历史与铜铆钉的阿曼雕花木门、波斯浴室遗迹，以及斯瓦希里历史庭院中弥漫的现磨咖啡与丁香幽香。',
      highlights: [
        '奇迹之屋与古堡要塞遗址',
        '弗雷迪·默丘里生平纪念馆',
        '达拉贾尼百年香料综合大市场',
        '福罗达尼海滨花园日落夜市',
      ],
      ctaLabel: '漫游石头城',
    },
    'dest-mnemba': {
      name: '姆内姆巴岛 (MNEMBA ISLAND)',
      theme: '海洋生灵与玻璃纯净之水',
      location: '东北海岸 • 国家级受保护海洋自然保护区',
      shortDescription:
        '宛若三角形绿宝石般的梦幻珊瑚环礁，被碧绿通透的荧光海水环绕。在此可与野生绿海龟漫游、与灵动海豚伴游，探寻非洲首屈一指的珊瑚礁生态。',
      highlights: [
        '如水晶般纯澈的珊瑚礁断崖墙',
        '濒危野生绿海龟栖息与繁育海湾',
        '纯净无人白沙洲野餐私享',
        '近距离观察野生海豚嬉戏',
      ],
      ctaLabel: '探秘姆内姆巴环礁',
    },
    'dest-spice-farms': {
      name: '传统有机香料庄园',
      theme: '桑给巴尔的传世芳香',
      location: '中部原生态乡村 • 历史种植园核心区',
      shortDescription:
        '穿行于丁香密林、翠绿小豆蔻荚、肉桂树皮与野生香草藤蔓交织的雨林绿荫下，揭开数个世纪以来让桑岛闻名遐迩的印度洋海上香料贸易传奇。',
      highlights: [
        '现采天然香草荚与新鲜肉桂皮',
        '品尝庄园稀有热带奇珍鲜果',
        '当地匠人现编棕榈叶冠与斯瓦希里歌谣',
        '地道古法香料秘制私房午宴',
      ],
      ctaLabel: '品鉴香料传奇',
    },
    'dest-jozani': {
      name: '乔扎尼国家森林公园',
      theme: '原始自然与珍稀野生动物',
      location: '中南部腹地 • 桑给巴尔唯一国家公园',
      shortDescription:
        '全岛唯一的国家级森林保护区，庇护着50平方公里的原始常绿雨林、古老红桃花心木树林，以及全球绝无仅有的桑给巴尔特有红疣猴。',
      highlights: [
        '世界特有极度濒危红疣猴 (Red Colobus)',
        '穿行于红树林高架木栈道探秘',
        '观察超过40种热带珍稀原生蝴蝶',
        '当地药用原生林木向导深度解说',
      ],
      ctaLabel: '徒步乔扎尼树冠林',
    },
    'dest-nungwi': {
      name: '农圭与肯德瓦海滩',
      theme: '无潮汐海泳与落日赞歌',
      location: '北部海岸 • 24小时全天候畅泳胜地',
      shortDescription:
        '以全天候不受潮汐退落影响的平静碧海闻名，拥有如爽身粉般细柔的纯白沙滩、古老木帆船（Dhow）手工建造作坊，以及余晖染透北海的金色黄昏。',
      highlights: [
        '全天候通透无阻的绿松石海水浴场',
        '传统手工木质多桅帆船造船厂探访',
        '天然海龟救援与保育水塘生态站',
        '海滨黄昏时刻的浪漫落日余晖聚会',
      ],
      ctaLabel: '游历北部醉美海滩',
    },
  },
  fr: {
    'dest-stone-town': {
      name: 'STONE TOWN',
      theme: 'Histoire & Patrimoine Swahili',
      location: 'Côte Ouest • Classé au Patrimoine Mondial de l’UNESCO',
      shortDescription:
        'Ruelle labyrinthique en pierre de corail, portes omanaise séculaires ornées de laiton, bains persans et effluves de café torréfié et de clou de girofle dans les cours intérieures.',
      highlights: [
        'Maison des Merveilles et Vieux Fort',
        'Musée Freddie Mercury',
        'Marché aux Épices de Darajani',
        'Marché nocturne des Jardins de Forodhani',
      ],
      ctaLabel: 'Explorer Stone Town',
    },
    'dest-mnemba': {
      name: 'ÎLE DE MNEMBA',
      theme: 'Faune Marine & Eaux Cristallines',
      location: 'Côte Nord-Est • Sanctuaire Marin Protégé',
      shortDescription:
        'Un atoll corallien triangulaire baigné d’eaux turquoise lumineuses. Plongez au milieu des tortues vertes, des dauphins sauvages et des poissons multicolores dans l’un des plus beaux parcs marins d’Afrique.',
      highlights: [
        'Tombants de récifs coralliens immaculés',
        'Sites de ponte des tortues vertes marines',
        'Pique-nique exclusif sur banc de sable vierge',
        'Observation et nage auprès des dauphins',
      ],
      ctaLabel: 'Découvrir l’Atoll de Mnemba',
    },
    'dest-spice-farms': {
      name: 'FERMES D’ÉPICES',
      theme: 'Les Saveurs de Zanzibar',
      location: 'Campagne Centrale • Plantations Historiques',
      shortDescription:
        'Parcourez les bosquets odorants de clous de girofle, gousses de cardamome, écorces de cannelle et lianes de vanille sauvage. Revivez les siècles de négoce qui ont fait la renommée de l’Île aux Épices.',
      highlights: [
        'Récolte de vanille et cannelle fraîche',
        'Dégustation de fruits tropicaux rares',
        'Couronnes tressées en feuilles de palmier',
        'Déjeuner traditionnel aux épices locales',
      ],
      ctaLabel: 'Goûter aux Épices Royales',
    },
    'dest-jozani': {
      name: 'FORÊT DE JOZANI',
      theme: 'Nature Sauvage & Forêt Primaire',
      location: 'Centre-Sud de Zanzibar • Parc National',
      shortDescription:
        'L’unique parc national de Zanzibar abrite 50 km² de forêt pluviale sempervirente, de gigantesques acajous rouges et le célèbre colobe roux de Zanzibar, espèce rare et protégée.',
      highlights: [
        'Colobes roux de Zanzibar endémiques',
        'Passerelle au cœur de la mangrove',
        'Plus de 40 espèces de papillons tropicaux',
        'Découverte des plantes médicinales traditionnelles',
      ],
      ctaLabel: 'Explorer la Forêt de Jozani',
    },
    'dest-nungwi': {
      name: 'NUNGWI & KENDWA',
      theme: 'Plages Paradisiaques & Couchers de Soleil',
      location: 'Côte Nord • Baignade Permanente sans Marées',
      shortDescription:
        'Réputées pour leur baignade 24h/24 sans reflux marin, leurs plages de sable blanc poudré, leurs chantiers artisanaux de dhows et leurs crépuscules dorés sur la mer calme.',
      highlights: [
        'Baignade en eaux calmes tout au long du jour',
        'Visite des chantiers de bateaux dhow en bois',
        'Bassin naturel de préservation des tortues',
        'Atmosphère chaleureuse au coucher du soleil',
      ],
      ctaLabel: 'Vivre l’Échappée du Nord',
    },
  },
  sw: {
    'dest-stone-town': {
      name: 'MJI MKONGWE (STONE TOWN)',
      theme: 'Utamaduni na Urithi wa Kihistoria',
      location: 'Pwani ya Magharibi • Urithi wa Dunia wa UNESCO',
      shortDescription:
        'Njia nyembamba za mawe ya matumbawe, milango ya kale ya kuchongwa ya Kiumani yenye vigingi vya shaba, bafu za Kiajemi na harufu nzuri ya kahawa na karafuu mitaani.',
      highlights: [
        'Beit-al-Ajaib (Nyumba ya Maajabu) na Ngome Kongwe',
        'Makumbusho ya Freddie Mercury',
        'Soko Kuu la Viungo la Darajani',
        'Bustani za Forodhani wakati wa machweo',
      ],
      ctaLabel: 'Tembelea Mji Mkongwe',
    },
    'dest-mnemba': {
      name: 'KISIWA CHA MNEMBA',
      theme: 'Viumbe wa Baharini na Maji Safi',
      location: 'Pwani ya Kaskazini-Mashariki • Hifadhi ya Bahari',
      shortDescription:
        'Kisiwa kizuri chenye umbo la pembetatu kilichozungukwa na maji ya turquoise yenye kung’aa. Piga mbizi na kasa wa kijani, pomboo na samaki wa matumbawe katika hifadhi bora ya bahari.',
      highlights: [
        'Miamba mizuri ya matumbawe yenye rangi',
        'Makazi ya kutagia mayai ya kasa wa baharini',
        'Chakula cha mchana kwenye fungu safi za mchanga',
        'Kutazama pomboo porini wakiruka',
      ],
      ctaLabel: 'Gundua Kisiwa cha Mnemba',
    },
    'dest-spice-farms': {
      name: 'MASHAMBA YA VIUNGO',
      theme: 'Ladha na Manukato ya Zanzibar',
      location: 'Kijijini Katikati • Mashamba ya Kihistoria',
      shortDescription:
        'Tembea katikati ya mikarafuu, iliki, mdalasini na minyonyore ya vanila. Jifunze historia ya biashara ya viungo iliyoipa Zanzibar jina maarufu la Kisiwa cha Viungo.',
      highlights: [
        'Kuvuna vanila na kumenya mdalasini mbichi',
        'Kuonja matunda adimu ya kitropiki',
        'Kutengenezewa taji za majani ya minazi',
        'Chakula kitamu cha mchana chenye viungo asilia',
      ],
      ctaLabel: 'Onja Viungo vya Asili',
    },
    'dest-jozani': {
      name: 'MSITU WA JOZANI',
      theme: 'Asili na Wanyama Pori',
      location: 'Kusini-Kati ya Zanzibar • Hifadhi ya Taifa',
      shortDescription:
        'Hifadhi ya taifa pekee ya Zanzibar yenye ukubwa wa kilomita za mraba 50 ya msitu wa asili, miti mikubwa ya mahogany na kima adimu wa rangi nyekundu (Red Colobus).',
      highlights: [
        'Kima wekundu wa kipekee duniani (Red Colobus)',
        'Njia ya mbao katikati ya mikoko ya majini',
        'Zaidi ya spishi 40 za vipepeo wazuri',
        'Mwongozo wa miti ya dawa za asili',
      ],
      ctaLabel: 'Tembea Msitu wa Jozani',
    },
    'dest-nungwi': {
      name: 'NUNGWI NA KENDWA',
      theme: 'Fukwe Safi na Machweo ya Jua',
      location: 'Pwani ya Kaskazini • Kuogelea Bila Maji Kupwa',
      shortDescription:
        'Inajulikana kwa kuogelea saa 24 bila kizuizi cha maji kupwa, mchanga mweupe kama unga, karakana za kutengeneza majahazi ya kitamaduni na machweo ya kipekee baharini.',
      highlights: [
        'Fukwe tulivu za kuogelea mchana kutwa',
        'Kutembelea gereji za kuunda majahazi ya mbao',
        'Bwawa la asili la kutunza kasa wa baharini',
        'Mikusanyiko mizuri ya machweo ufukweni',
      ],
      ctaLabel: 'Furahia Fukwe za Kaskazini',
    },
  },
  es: {
    'dest-stone-town': {
      name: 'STONE TOWN',
      theme: 'Cultura y Patrimonio Suajili',
      location: 'Costa Oeste • Patrimonio Mundial de la UNESCO',
      shortDescription:
        'Callejuelas de piedra coralina, portones omaníes tallados con clavos de latón, baños persas y los aromas del café y el clavo flotando en patios históricos.',
      highlights: [
        'Casa de las Maravillas y Antiguo Fuerte',
        'Museo Freddie Mercury',
        'Mercado de Especias de Darajani',
        'Bazar al atardecer en Forodhani Gardens',
      ],
      ctaLabel: 'Explorar Stone Town',
    },
    'dest-mnemba': {
      name: 'ISLA DE MNEMBA',
      theme: 'Vida Marina y Aguas Cristalinas',
      location: 'Costa Noreste • Reserva Marina Protegida',
      shortDescription:
        'Atolón coralino de aguas turquesas resplandecientes. Nade con tortugas marinas verdes, delfines en libertad y peces de arrecife en uno de los mejores santuarios de África.',
      highlights: [
        'Arrecifes de coral de gran visibilidad',
        'Áreas de anidación de tortugas verdes',
        'Pícnics en bancos de arena desiertos',
        'Avistamiento de delfines en su hábitat',
      ],
      ctaLabel: 'Descubrir el Atolón Mnemba',
    },
    'dest-spice-farms': {
      name: 'PLANTACIONES DE ESPECIAS',
      theme: 'Los Sabores de Zanzíbar',
      location: 'Centro Rural • Fincas Históricas',
      shortDescription:
        'Camine entre arboledas de clavo, vainas de cardamomo, cortezas de canela y enredaderas de vainilla. Reviva la legendaria ruta de las especias de la isla.',
      highlights: [
        'Cosecha de vainilla y canela fresca',
        'Degustación de frutas exóticas tropicales',
        'Tocados artesanales de hojas de palma',
        'Almuerzo tradicional especiado',
      ],
      ctaLabel: 'Saborear las Especias',
    },
    'dest-jozani': {
      name: 'BOSQUE DE JOZANI',
      theme: 'Naturaleza y Fauna Autóctona',
      location: 'Centro-Sur de Zanzíbar • Parque Nacional',
      shortDescription:
        'El único parque nacional de la isla acoge 50 km² de selva tropical virgen, caobas centenarias y el simpático y amenazado colobo rojo de Zanzíbar.',
      highlights: [
        'Monos colobo rojo endémicos',
        'Pasarela de madera entre manglares',
        'Más de 40 especies de mariposas',
        'Guía botánica de plantas medicinales',
      ],
      ctaLabel: 'Recorrer el Bosque Jozani',
    },
    'dest-nungwi': {
      name: 'NUNGWI Y KENDWA',
      theme: 'Playas Infinitas y Puestas de Sol',
      location: 'Costa Norte • Baño Todo el Día sin Mareas',
      shortDescription:
        'Famosas por permitir el baño las 24 horas sin retirada de mareas, arenas blancas de tacto sedoso, astilleros de veleros dhow tradicionales y atardeceres mágicos.',
      highlights: [
        'Playas turquesas para nadar todo el día',
        'Ruta por astilleros de dhows tradicionales',
        'Santuario de rescate de tortugas marinas',
        'Ambiente festivo y relajado al atardecer',
      ],
      ctaLabel: 'Conocer las Playas del Norte',
    },
  },
  it: {
    'dest-stone-town': {
      name: 'STONE TOWN',
      theme: 'Storia e Tradizione Swahili',
      location: 'Costa Ovest • Sito Patrimonio Mondiale UNESCO',
      shortDescription:
        'Un labirinto di vicoli in pietra corallina, antichi portoni intagliati in stile omanita con borchie d’ottone, bagni persiani e profumi di caffè e chiodi di garofano.',
      highlights: [
        'Palazzo delle Meraviglie e Forte Antico',
        'Museo di Freddie Mercury',
        'Mercato delle Spezie di Darajani',
        'Bazar gastronomico serale ai Forodhani Gardens',
      ],
      ctaLabel: 'Esplora Stone Town',
    },
    'dest-mnemba': {
      name: 'ISOLA DI MNEMBA',
      theme: 'Mondo Marino e Acque Cristalline',
      location: 'Costa Nord-Est • Riserva Marina Naturale',
      shortDescription:
        'Un atollo corallino triangolare circondato da limpide acque turchesi. Snorkeling e immersioni accanto a tartarughe marine, delfini liberi e pesci tropicali.',
      highlights: [
        'Pareti coralline incontaminate',
        'Siti di riproduzione delle tartarughe verdi',
        'Picnic su banchi di sabbia bianchissima',
        'Incontri ravvicinati con i delfini',
      ],
      ctaLabel: 'Scopri l’Atollo di Mnemba',
    },
    'dest-spice-farms': {
      name: 'FATTORIE DELLE SPEZIE',
      theme: 'I Profumi e Sapori di Zanzibar',
      location: 'Entroterra Rurale • Antiche Piantagioni',
      shortDescription:
        'Passeggia tra alberi di chiodi di garofano, baccelli di cardamomo, scorze di cannella e liane di vaniglia. Rivivi secoli di rotte marittime che resero celebre l’Isola delle Spezie.',
      highlights: [
        'Raccolta di vaniglia e cannella fresche',
        'Degustazione di frutti tropicali insoliti',
        'Coroncine tradizionali intrecciate a mano',
        'Pranzo tipico speziato fatto in casa',
      ],
      ctaLabel: 'Assapora la Tradizione delle Spezie',
    },
    'dest-jozani': {
      name: 'FORESTA DI JOZANI',
      theme: 'Natura Vergine e Fauna Selvatica',
      location: 'Centro-Sud di Zanzibar • Parco Nazionale',
      shortDescription:
        'L’unico parco nazionale di Zanzibar conserva 50 km² di foresta primaria pluviale, mogani secolari e le simpatiche scimmie colobo rosso, specie endemica protetta.',
      highlights: [
        'Scimmie colobo rosso di Zanzibar',
        'Passerella sospesa tra le mangrovie',
        'Oltre 40 specie di farfalle variopinte',
        'Percorso guidato tra piante medicinali',
      ],
      ctaLabel: 'Cammina nella Foresta di Jozani',
    },
    'dest-nungwi': {
      name: 'NUNGWI E KENDWA',
      theme: 'Spiagge Idilliache e Tramonti d’Oro',
      location: 'Costa Nord • Balneazione Continua senza Maree',
      shortDescription:
        'Famose per consentire il nuoto 24 ore su 24 senza il ritiro della marea, spiagge vellutate, cantieri artigianali di dhow in legno e tramonti memorabili sulla costa nord.',
      highlights: [
        'Acque turchesi balneabili a ogni ora',
        'Visita guidata ai maestri d’ascia dei dhow',
        'Vasca naturale di tutela delle tartarughe marine',
        'Aperitivi e serate rilassate sulla sabbia',
      ],
      ctaLabel: 'Vivi le Spiagge del Nord',
    },
  },
};

export const TANZANIA_DEST_TRANSLATIONS: Record<
  Language,
  Record<string, LocalizedTanzaniaDest>
> = {
  en: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Wildlife & the Great Migration',
      region: 'Northern Tanzania',
      flightTimeFromZanzibar: '1h 45m Direct Bush Plane',
      description:
        'Vast golden savannahs that stretch endlessly to the horizon. Witness millions of wildebeest and zebras braving crocodile-laden rivers, accompanied by resident prides of lions, solitary leopards, and luxury tented bush retreats under star-strewn equatorial skies.',
      highlights: [
        'The Great Wildebeest Migration',
        'Predator tracking with veteran rangers',
        'Sunrise hot air balloon safaris with Champagne brunch',
        'Exclusive luxury tented bush camps',
      ],
      bestFor: 'Big Five sightings & dramatic wildlife spectacles',
      safariType: 'Fly-in Bush Plane Safari',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'One of Africa’s most extraordinary natural landscapes',
      region: 'Crater Highlands',
      flightTimeFromZanzibar: '1h 30m to Manyara Airstrip',
      description:
        'The world’s largest intact volcanic caldera, creating a self-contained ecological haven 600 meters deep. Descend through misty rim acacia forests into an ancient amphitheater bustling with endangered black rhinos, hippos, and thousands of pink flamingos wading in Lake Magadi.',
      highlights: [
        'Rare critically endangered Black Rhino conservation zone',
        'Dramatic 600m caldera descent drive',
        'Massive soda lake with shimmering flamingo flocks',
        'Dramatic rim lodges with panoramic cloud vistas',
      ],
      bestFor: 'Geological splendor & concentrated wildlife density',
      safariType: 'Crater Floor Game Drives',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANJARO',
      tagline: 'Stand at the roof of Africa',
      region: 'North-Eastern Tanzania',
      flightTimeFromZanzibar: '1h 10m to Kilimanjaro Int’l',
      description:
        'Africa’s highest peak and the world’s tallest free-standing mountain rises majestically 5,895 meters above tropical plains. From scenic private helicopter flights encircling Uhuru Peak to day treks along lush lower rainforest trails and coffee estates, experience Tanzania’s iconic crown.',
      highlights: [
        'Scenic helicopter mountain tours over the glacier summit',
        'Private day hikes on Marangu or Machame rainforest routes',
        'Organic Chagga coffee farm and waterfall visits',
        'Spectacular sunset silhouette photography',
      ],
      bestFor: 'Iconic aerial perspectives & alpine trekking',
      safariType: 'Scenic Flight & Guided Day Expedition',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Elephants, baobabs and untamed landscapes',
      region: 'Manyara Region',
      flightTimeFromZanzibar: '1h 20m Flight',
      description:
        'Famed for its colossal ancient baobab trees that stand like silent sentinels across a rugged river valley. Tarangire hosts East Africa’s highest concentration of elephant herds, where majestic family matriarchs guide their calves along the life-giving Tarangire River.',
      highlights: [
        'Giant multi-centenary baobab tree forests',
        'Enormous elephant gatherings of up to 300 individuals',
        'Dry-season wildlife congregations along the river',
        'Tree-climbing pythons and over 550 bird species',
      ],
      bestFor: 'Baobab landscapes & intimate elephant encounters',
      safariType: 'River Valley 4x4 Expedition',
    },
  },
  pl: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Dzika przyroda i Wielka Migracja',
      region: 'Północna Tanzania',
      flightTimeFromZanzibar: '1h 45m Bezpośredni lot awionetką',
      description:
        'Bezkresne złociste sawanny sięgające horyzontu. Bądź świadkiem Wielkiej Migracji milionów antylop gnu i zebr, w towarzystwie lwów, gepardów oraz luksusowych obozowisk pod rozgwieżdżonym afrykańskim niebem.',
      highlights: [
        'Wielka Migracja antylop gnu i zebr',
        'Tropienie drapieżników z doświadczonymi strażnikami',
        'Lot balonem o wschodzie słońca ze śniadaniem z szampanem',
        'Ekskluzywne luksusowe obozy namiotowe w buszu',
      ],
      bestFor: 'Wielka Piątka i spektakularne sceny dzikiej przyrody',
      safariType: 'Safari z dolotem awionetką',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'Jeden z najbardziej niezwykłych cudów natury Afryki',
      region: 'Wyżyna Kraterowa',
      flightTimeFromZanzibar: '1h 30m do lądowiska Manyara',
      description:
        'Największa nienaruszona kaldera wulkaniczna na świecie o głębokości 600 metrów tworzy samowystarczalny ekosystem. Zjedź w dół do prastarego amfiteatru zamieszkałego przez czarne nosorożce, hipopotamy i tysiące różowych flamingów.',
      highlights: [
        'Ochrona krytycznie zagrożonego nosorożca czarnego',
        'Ekscytujący zjazd 600 m w głąb kaldery',
        'Jezioro sodowe Magadi z tysiącami flamingów',
        'Spektakularne lodże na krawędzi krateru z widokiem na chmury',
      ],
      bestFor: 'Cuda geologii i niezwykła gęstość dzikich zwierząt',
      safariType: 'Safari 4x4 na dnie krateru',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANDŻARO',
      tagline: 'Stań u stóp dachu Afryki',
      region: 'Północno-Wschodnia Tanzania',
      flightTimeFromZanzibar: '1h 10m na lotnisko Kilimanjaro',
      description:
        'Najwyższy szczyt Afryki i najwyższa samotna góra świata wznosi się na 5895 m n.p.m. Od widokowych lotów helikopterem wokół szczytu Uhuru, po jednodniowe trekkingi szlakami lasów deszczowych i plantacji kawy.',
      highlights: [
        'Widokowe loty helikopterem nad ośnieżonym szczytem',
        'Prywatne jednodniowe wędrówki szlakami Marangu i Machame',
        'Wizyta na tradycyjnej plantacji kawy plemienia Chagga',
        'Fotografia sylwetek góry o zachodzie słońca',
      ],
      bestFor: 'Niezapomniane widoki z lotu ptaka i trekking górski',
      safariType: 'Lot widokowy i wycieczka piesza z przewodnikiem',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Słonie, baobaby i dziewiczy krajobraz',
      region: 'Region Manyara',
      flightTimeFromZanzibar: '1h 20m Lot',
      description:
        'Słynący z olbrzymich wiekowych baobabów stojących niczym milczący strażnicy w dolinie rzeki. Tarangire skupia największe stada słoni w Afryce Wschodniej, gromadzące się wokół rzeki Tarangire.',
      highlights: [
        'Lasy potężnych stuletnich baobabów',
        'Ogromne stada słoni liczące nawet do 300 osobników',
        'Gromadzenie się zwierząt nad rzeką w porze suchej',
        'Wspinające się na drzewa pytony i 550 gatunków ptaków',
      ],
      bestFor: 'Krajobrazy z baobabami i bliskie spotkania ze słoniami',
      safariType: 'Wyprawa 4x4 w dolinę rzeki',
    },
  },
  ar: {
    'dest-serengeti': {
      name: 'سيرينغيتي',
      tagline: 'الحياة البرية العذراء والهجرة الكبرى للحيوانات',
      region: 'شمال تنزانيا',
      flightTimeFromZanzibar: '1 ساعة و45 دقيقة بطائرة خاصة مباشرة',
      description:
        'سافانا ذهبية شاسعة تمتد إلى ما لا نهاية. شاهد ملايين حيوانات النو والحمر الوحشية تخوض الأنهار المليئة بالتماسيح، وتتبع قطعان الأسود والنمور مع إقامة في مخيمات برية فاخرة تحت نجوم إفريقيا.',
      highlights: [
        'الهجرة الكبرى لحيوانات النو والحمر الوحشية',
        'تتبع الحيوانات المفترسة مع مرشدين محترفين',
        'رحلات المنطاد عند شروق الشمس مع وجبة برانش فاخرة',
        'مخيمات سفاري فندقية خاصة في قلب الأدغال',
      ],
      bestFor: 'مشاهدة الحيوانات الخمس الكبار واستعراضات الطبيعة الخلابة',
      safariType: 'رحلة سفاري جوية بطائرة خاصة',
    },
    'dest-ngorongoro': {
      name: 'نغورونغورو',
      tagline: 'إحدى أعظم العجائب الطبيعية الساحرة في إفريقيا',
      region: 'مرتفعات الفوهة البركانية',
      flightTimeFromZanzibar: '1 ساعة و30 دقيقة إلى مهبط مانيارا',
      description:
        'أكبر كالديرا بركانية سليمة في العالم بعمق 600 متر تؤوي نظاماً بيئياً فريداً. انزل بين أشجار الأكاسيا إلى هذا المدرج الطبيعي الذي يعج بالكركدن الأسود النادر وأفراس النهر وطيور الفلامنغو الوردية.',
      highlights: [
        'محمية وحيد القرن الأسود المهدد بالانقراض',
        'مسار هبوط مذهل بعمق 600 متر في قاع الفوهة',
        'بحيرة مائية ضخمة تحتضن أسراب طيور الفلامنغو',
        'نزل فاخرة على حافة الفوهة بإطلالة على السحاب',
      ],
      bestFor: 'روعة التضاريس الجيولوجية وكثافة الحياة الفطرية',
      safariType: 'جولات استكشافية بسيارات الدفع الرباعي',
    },
    'dest-kilimanjaro': {
      name: 'كليمنجارو',
      tagline: 'قف على أعلى قمة في القارة الإفريقية',
      region: 'شمال شرق تنزانيا',
      flightTimeFromZanzibar: '1 ساعة و10 دقائق إلى مطار كليمنجارو الدولي',
      description:
        'أعلى قمة في إفريقيا وأعلى جبل قائم بذاته في العالم يرتفع 5,895 متراً فوق السهول الاستوائية. من جولات الهليكوبتر الخاصة حول قمة أوهورو إلى المسارات اليومية في الغابات الماطرة ومزارع البن.',
      highlights: [
        'جولات هليكوبتر بانورامية فوق القمة الثلجية',
        'مسارات مشي يومية في غابات مارانغو وماتشامي الماطرة',
        'زيارة مزارع البن العضوي لشعب تشاغا والشلالات',
        'تصوير ظلال الجبل الساحرة وقت الغروب',
      ],
      bestFor: 'مشاهد جوية ساحرة ومغامرات تسلق الطبيعة الجبلية',
      safariType: 'طيران بانورامي ورحلة استكشافية جبلية خاصة',
    },
    'dest-tarangire': {
      name: 'تارانجيري',
      tagline: 'أفيال عملاقة، وأشجار باوباب وطبيعة جامحة',
      region: 'إقليم مانيارا',
      flightTimeFromZanzibar: '1 ساعة و20 دقيقة طيران',
      description:
        'يشتهر بأشجاره الضخمة من الباوباب القديم التي تقف كالحراس عبر وادي النهر الوعر. يضم تارانجيري أكبر تجمع لقطعان الأفيال في شرق إفريقيا وهي تشرب من مياه النهر العذب.',
      highlights: [
        'غابات أشجار الباوباب العملاقة التي تعود لمئات السنين',
        'تجمعات أفيال هائلة تصل إلى 300 فيل في القطيع الواحد',
        'تجمع الحيوانات حول ضفاف النهر في مواسم الجفاف',
        'ثعابين الأشجار وأكثر من 550 نوعاً من الطيور النادرة',
      ],
      bestFor: 'مشاهد أشجار الباوباب والاقتراب من قطعان الفيلة',
      safariType: 'رحلة استكشافية 4x4 في وادي النهر',
    },
  },
  zh: {
    'dest-serengeti': {
      name: '塞伦盖蒂 (SERENGETI)',
      tagline: '旷野野生动物与百万动物大迁徙盛景',
      region: '坦桑尼亚北部高原',
      flightTimeFromZanzibar: '1小时45分 丛林专机直达',
      description:
        '延绵至天际线的金色浩瀚大草原。亲历数以百万计的角马和斑马横渡充满鳄鱼的马拉河，与狮群、猎豹同行，在赤道璀璨星空下的奢华帐篷营地中安枕。',
      highlights: [
        '举世闻名的角马与斑马大迁徙奇观',
        '随同资深野保向导追踪顶级猎食者足迹',
        '日出热气球空中游猎与香槟野奢早午餐',
        '纯正独家非洲野奢帐篷营地体验',
      ],
      bestFor: '追寻非洲五霸与壮丽野生动物奇观',
      safariType: '轻型丛林飞机直达游猎',
    },
    'dest-ngorongoro': {
      name: '恩戈罗恩戈罗 (NGORONGORO)',
      tagline: '非洲大陆极具传奇色彩的自然地质奇迹',
      region: '火山口高地生态圈',
      flightTimeFromZanzibar: '1小时30分 飞抵曼雅拉跑道',
      description:
        '全球面积最大的完整未破裂火山口，在600米深处构筑了一个遗世独立的天然生态圣殿。穿越晨雾的金合欢林俯冲进入古老盆地，邂逅黑犀牛、河马与数万只火烈鸟。',
      highlights: [
        '极其珍稀的濒危非洲黑犀牛重点保护区',
        '沿600米陡峭崖壁俯冲进入火山口盆地',
        '漫游在栖息着万千粉红火烈鸟的苏打盐湖',
        '悬崖边缘全景野奢山庄俯瞰云雾翻腾',
      ],
      bestFor: '壮观地质遗迹与高度密集的野生动物群',
      safariType: '火山口盆地专业四驱车巡猎',
    },
    'dest-kilimanjaro': {
      name: '乞力马扎罗 (KILIMANJARO)',
      tagline: '伫立于非洲屋脊之下，仰望雪域圣山',
      region: '坦桑尼亚东北部',
      flightTimeFromZanzibar: '1小时10分 飞抵乞力马扎罗国际机场',
      description:
        '非洲之巅与世界最高的独立山峰，巍峨耸立于热带原野之上达5,895米。无论是搭乘私人直升机环绕乌呼鲁冰川之巅，还是在山麓葱郁雨林与咖啡庄园间轻徒步，皆能领略非洲之冠的非凡震撼。',
      highlights: [
        '私人直升机全景俯瞰冰川环抱的雪域主峰',
        '专业向导带领徒步穿越马兰古或马查姆热带雨林',
        '探访原住民查加族有机咖啡种植庄园与林间瀑布',
        '定格日落时分圣山巍峨剪影的摄影大片',
      ],
      bestFor: '壮阔空中俯瞰视角与高山雨林生态轻徒步',
      safariType: '直升机全景飞行与专属轻徒步探索',
    },
    'dest-tarangire': {
      name: '塔兰吉雷 (TARANGIRE)',
      tagline: '巨型猴面包树林、象群家族与未被驯服的狂野旷野',
      region: '曼雅拉大区河谷',
      flightTimeFromZanzibar: '1小时20分 航程',
      description:
        '以耸立于崎岖河谷两岸的参天古老猴面包树而闻名遐迩。塔兰吉雷聚集了东非密度最高的野生大象家族，慈爱的象群首领在此引领幼象沿着滋养万物的塔兰吉雷河迁徙涉水。',
      highlights: [
        '数百年甚至上千年的巨型猴面包树原始森林',
        '由多达300头大象构成的超级壮观群落',
        '旱季各种野生动物在河谷两岸集结饮水的壮观场面',
        '罕见爬树蟒蛇与超过550种珍稀飞鸟天堂',
      ],
      bestFor: '猴面包树日落大片与零距离近观巨象家族',
      safariType: '塔兰吉雷河谷敞篷四驱专业越野游猎',
    },
  },
  fr: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Faune Sauvage & la Grande Migration',
      region: 'Nord de la Tanzanie',
      flightTimeFromZanzibar: '1h 45m Vol direct en avion de brousse',
      description:
        'D’immenses savanes dorées s’étendant à perte de vue. Soyez témoin de la Grande Migration de millions de gnous et de zèbres bravant les fleuves, aux côtés des meutes de lions et de camps de tentes sous les étoiles équatoriales.',
      highlights: [
        'La Grande Migration des gnous et des zèbres',
        'Pistage des grands prédateurs avec rangers chevronnés',
        'Safari en montgolfière au lever du soleil avec brunch au champagne',
        'Camps de brousse de luxe sous tente privative',
      ],
      bestFor: 'Observation des Big Five & scènes animalières mythiques',
      safariType: 'Safari Aérien en Avion de Brousse',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'L’un des sanctuaires naturels les plus spectaculaires d’Afrique',
      region: 'Hautes Terres du Cratère',
      flightTimeFromZanzibar: '1h 30m vers la piste de Manyara',
      description:
        'La plus grande caldeira volcanique intacte au monde, formant un havre écologique clos de 600 mètres de profondeur. Descendez dans un amphithéâtre naturel abritant rhinocéros noirs, hippopotames et flamants roses.',
      highlights: [
        'Zone protégée du rhinocéros noir en danger critique',
        'Descente spectaculaire de 600 m au fond du cratère',
        'Vaste lac salé peuplé de nuées de flamants roses',
        'Lodges sur la crête offrant des panoramas féeriques sur les nuages',
      ],
      bestFor: 'Géologie unique et densité d’animaux exceptionnelle',
      safariType: 'Safari 4x4 au Fond du Cratère',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANDJARO',
      tagline: 'Au pied du toit de l’Afrique',
      region: 'Nord-Est de la Tanzanie',
      flightTimeFromZanzibar: '1h 10m vers l’Aéroport Int’l du Kilimandjaro',
      description:
        'Le plus haut sommet d’Afrique et la plus haute montagne isolée du monde s’élèvent à 5 895 mètres. Des survols panoramiques en hélicoptère aux randonnées guidées en forêt pluviale et plantations de café.',
      highlights: [
        'Survols panoramiques en hélicoptère au-dessus des glaciers',
        'Randonnées privées d’une journée sur les voies Marangu ou Machame',
        'Visite de fermes de café biologique Chagga et cascades',
        'Photographies inoubliables de la silhouette au crépuscule',
      ],
      bestFor: 'Perspectives aériennes iconiques & randonnée alpine',
      safariType: 'Vol Panoramique & Randonnée d’une Journée',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Éléphants, baobabs et paysages indomptés',
      region: 'Région de Manyara',
      flightTimeFromZanzibar: '1h 20m de Vol',
      description:
        'Réputé pour ses majestueux baobabs centenaires qui veillent sur la vallée fluviale. Le parc abrite la plus forte concentration de troupeaux d’éléphants d’Afrique de l’Est le long de la rivière Tarangire.',
      highlights: [
        'Forêts de baobabs géants plusieurs fois centenaires',
        'Troupeaux d’éléphants spectaculaires comptant jusqu’à 300 individus',
        'Concentration d’animaux au bord de la rivière en saison sèche',
        'Pythons grimpant aux arbres et plus de 550 espèces d’oiseaux',
      ],
      bestFor: 'Paysages de baobabs & rencontres intimes avec les éléphants',
      safariType: 'Expédition 4x4 dans la Vallée Fluviale',
    },
  },
  sw: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Wanyamapori na Uhamiaji Mkubwa wa Wanyama',
      region: 'Kaskazini mwa Tanzania',
      flightTimeFromZanzibar: 'Saa 1 na dakika 45 kwa ndege ya moja kwa moja',
      description:
        'Nyasi pana za dhahabu zinazofika upeo wa macho. Shuhudia uhamiaji wa mamilioni ya nyumbu na punda milia wakivuka mito yenye mamba, sambamba na simba, chui na kambi za hema za kifahari.',
      highlights: [
        'Uhamiaji Mkuu wa nyumbu na punda milia',
        'Kufuatilia wanyama wakali na walinzi wenye uzoefu',
        'Safari za puto la angani alfajiri na kifungua kinywa cha kifahari',
        'Kambi za hema za hadhi ya juu porini',
      ],
      bestFor: 'Wanyama Wakubwa Watano (Big Five) na maajabu ya asili',
      safariType: 'Safari ya Ndege Porini',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'Moja ya maajabu ya asili ya kipekee zaidi barani Afrika',
      region: 'Milima ya Bonde la Volkano',
      flightTimeFromZanzibar: 'Saa 1 na dakika 30 hadi Manyara',
      description:
        'Bonde kubwa zaidi la volkano lisilovunjika duniani lenye kina cha mita 600, likiwa na mfumo kamili wa asili. Shuka chini uone vifaru weusi walio hatarini kutoweka, viboko na maelfu ya heroe kwenye Ziwa Magadi.',
      highlights: [
        'Eneo la hifadhi ya Kifaru Mweusi aliye hatarini kutoweka',
        'Mteremko wa kusisimua wa mita 600 ndani ya kreta',
        'Ziwa kubwa la chumvi lenye makundi makubwa ya heroe (flamingos)',
        'Hoteli nzuri za kando ya kreta zenye mandhari ya mawingu',
      ],
      bestFor: 'Maajabu ya kijiolojia na wingi wa wanyamapori',
      safariType: 'Safari ya Magari ya 4x4 Ndani ya Bonde',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANJARO',
      tagline: 'Simama kwenye paa la Bara la Afrika',
      region: 'Kaskazini-Mashariki mwa Tanzania',
      flightTimeFromZanzibar: 'Saa 1 na dakika 10 hadi Uwanja wa Ndege wa KIA',
      description:
        'Kilele cha juu zaidi barani Afrika na mlima mrefu zaidi unaojitegemea duniani wenye mita 5,895 juu ya usawa wa bahari. Kuanzia safari za helikopta za angani hadi matembezi ya msituni na mashamba ya kahawa.',
      highlights: [
        'Safari za helikopta za angani juu ya kilele chenye barafu',
        'Matembezi binafsi ya mchana kwenye njia za Marangu au Machame',
        'Kutembelea mashamba ya kahawa ya Wachagga na maporomoko ya maji',
        'Upigaji picha mzuri wa mlima wakati wa machweo',
      ],
      bestFor: 'Mandhari ya angani na matembezi ya mlimani',
      safariType: 'Safari ya Ndege na Matembezi ya Siku Moja',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Tembo, mibuyu mikubwa na mandhari ya asili',
      region: 'Mkoa wa Manyara',
      flightTimeFromZanzibar: 'Saa 1 na dakika 20 kwa ndege',
      description:
        'Inasifika kwa miti mikubwa ya mibuyu ya kale iliyosimama kwenye bonde la mto. Tarangire ina msongamano mkubwa zaidi wa makundi ya tembo Afrika Mashariki kando ya Mto Tarangire.',
      highlights: [
        'Misitu mikubwa ya miti ya mibuyu ya karne nyingi',
        'Makundi makubwa ya tembo ya hadi tembo 300 pamoja',
        'Mikusanyiko ya wanyama kando ya mto wakati wa kiangazi',
        'Chawa na chatu wanaopanda miti na ndege zaidi ya 550',
      ],
      bestFor: 'Mandhari ya mibuyu na kukutana na makundi ya tembo',
      safariType: 'Safari ya 4x4 Kando ya Bonde la Mto',
    },
  },
  es: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Vida salvaje y la Gran Migración anual',
      region: 'Norte de Tanzania',
      flightTimeFromZanzibar: '1h 45m Vuelo directo en avioneta',
      description:
        'Extensas sabanas doradas que se extienden hasta el confín del horizonte. Admire a millones de ñus y cebras cruzando ríos caudalosos, rodeados de leones y campamentos de tiendas de lujo bajo cielos ecuatoriales.',
      highlights: [
        'El sobrecogedor espectáculo de la Gran Migración',
        'Rastreo de grandes felinos con expertos guías guardaparques',
        'Safaris en globo al amanecer con brindis con champán',
        'Campamentos de tiendas de campaña de gran lujo',
      ],
      bestFor: 'Los Cinco Grandes y escenas de naturaleza salvaje',
      safariType: 'Safari Aéreo en Avioneta',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'Uno de los escenarios naturales más fascinantes de África',
      region: 'Tierras Altas del Cráter',
      flightTimeFromZanzibar: '1h 30m al aeródromo de Manyara',
      description:
        'La caldera volcánica intacta más grande del planeta, con 600 metros de profundidad. Descienda al corazón de este anfiteatro natural repleto de rinocerontes negros, hipopótamos y bandadas de flamencos.',
      highlights: [
        'Santuario del rinoceronte negro en peligro crítico',
        'Descenso inolvidable de 600 m al fondo del cráter',
        'Inmenso lago salino con miles de flamencos rosados',
      ],
      bestFor: 'Grandeza geológica y alta concentración de fauna',
      safariType: 'Safari 4x4 en el Fondo del Cráter',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANJARO',
      tagline: 'A los pies del techo del continente africano',
      region: 'Noreste de Tanzania',
      flightTimeFromZanzibar: '1h 10m al Aeropuerto Int’l de Kilimanjaro',
      description:
        'La cumbre más alta de África y la montaña solitaria más alta del mundo se eleva 5.895 metros. Desde vuelos privados en helicóptero alrededor del pico Uhuru hasta caminatas por bosques nubosos y cafetales.',
      highlights: [
        'Vuelos escénicos en helicóptero sobre los glaciares cimeros',
        'Caminatas guiadas de un día por las rutas Marangu o Machame',
        'Visitas a plantaciones tradicionales de café Chagga y cascadas',
      ],
      bestFor: 'Perspectivas aéreas legendarias y senderismo alpino',
      safariType: 'Vuelo Panorámico y Excursión Guiada',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Elefantes, baobabs y paisajes indómitos',
      region: 'Región de Manyara',
      flightTimeFromZanzibar: '1h 20m de Vuelo',
      description:
        'Célebre por sus descomunales baobabs milenarios que custodian el valle fluvial. Tarangire alberga la mayor densidad de manadas de elefantes de África Oriental a lo largo de las riberas del río.',
      highlights: [
        'Bosques de baobabs colosales de varios siglos de antigüedad',
        'Impresionantes concentraciones de elefantes de hasta 300 ejemplares',
        'Gran afluencia de fauna junto al río en la estación seca',
      ],
      bestFor: 'Paisajes con baobabs y encuentros íntimos con elefantes',
      safariType: 'Expedición 4x4 por el Valle del Río',
    },
  },
  it: {
    'dest-serengeti': {
      name: 'SERENGETI',
      tagline: 'Natura selvaggia e la Grande Migrazione',
      region: 'Tanzania Settentrionale',
      flightTimeFromZanzibar: '1h 45m Volo diretto in aereo da boscaglia',
      description:
        'Infinite savane dorate che si estendono fino all’orizzonte. Ammira milioni di gnu e zebre che sfidano i fiumi popolati da coccodrilli, leoni e leopardi, con sistemazioni in campi tendati di lusso sotto cieli stellati.',
      highlights: [
        'La Grande Migrazione di gnu e zebre',
        'Tracciamento dei predatori con ranger esperti',
        'Safari in mongolfiera all’alba con brunch e champagne',
        'Campi tendati esclusivi immersi nella savana',
      ],
      bestFor: 'I Big Five e memorabili spettacoli faunistici',
      safariType: 'Safari Aereo Diretto da Zanzibar',
    },
    'dest-ngorongoro': {
      name: 'NGORONGORO',
      tagline: 'Uno dei paesaggi naturali più straordinari al mondo',
      region: 'Altopiani del Cratere',
      flightTimeFromZanzibar: '1h 30m alla pista di Manyara',
      description:
        'La più grande caldera vulcanica intatta al mondo, profonda 600 metri, che racchiude un ecosistema unico. Scendi tra acacie nebbiose in un anfiteatro abitato da rinoceronti neri, ippopotami e fenicotteri rosa.',
      highlights: [
        'Area di salvaguardia del raro rinoceronte nero',
        'Spettacolare discesa di 600 m nel cratere',
        'Vasto lago salato scintillante con colonie di fenicotteri',
      ],
      bestFor: 'Splendore geologico e altissima densità di fauna',
      safariType: 'Game Drive 4x4 nel Cratere',
    },
    'dest-kilimanjaro': {
      name: 'KILIMANGIARO',
      tagline: 'Al cospetto del tetto d’Africa',
      region: 'Tanzania Nord-Orientale',
      flightTimeFromZanzibar: '1h 10m all’Aeroporto Int’l del Kilimangiaro',
      description:
        'La vetta più alta d’Africa e la montagna isolata più alta del mondo si erge per 5.895 metri sulla savana. Da voli panoramici in elicottero sul ghiacciaio di Uhuru Peak a trekking tra foreste pluviali e piantagioni di caffè.',
      highlights: [
        'Voli scenografici in elicottero sui ghiacciai della vetta',
        'Escursioni giornaliere lungo le rotte Marangu o Machame',
        'Visita a piantagioni biologiche di caffè Chagga e cascate',
      ],
      bestFor: 'Panorami aerei iconici e trekking alpino tropicale',
      safariType: 'Volo Panoramico ed Escursione Guidata',
    },
    'dest-tarangire': {
      name: 'TARANGIRE',
      tagline: 'Elefanti, baobab e paesaggi selvaggi',
      region: 'Regione di Manyara',
      flightTimeFromZanzibar: '1h 20m di Volo',
      description:
        'Celebre per i suoi maestosi baobab secolari che svettano lungo la vallata del fiume. Il Tarangire vanta la più alta concentrazione di elefanti dell’Africa orientale lungo il corso d’acqua.',
      highlights: [
        'Foreste di baobab giganti centenari',
        'Incredibili branchi di elefanti fino a 300 esemplari',
        'Animali selvatici radunati attorno al fiume nella stagione secca',
      ],
      bestFor: 'Scenari di baobab e incontri ravvicinati con gli elefanti',
      safariType: 'Spedizione 4x4 nella Valle Fluviale',
    },
  },
};

export const EXPLORE_UI_TRANSLATIONS: Record<
  Language,
  {
    eyebrow: string;
    heading: string;
    subhead: string;
    badge: string;
    highlightsLabel: string;
    whatsappPrompt: string;
  }
> = {
  en: {
    eyebrow: 'Island Discovery',
    heading: 'EXPLORE ZANZIBAR',
    subhead: 'Beyond the retreat, Zanzibar is a world of historic stone alleyways, turquoise marine sanctuaries, and fragrant spice groves.',
    badge: 'Curated Excursion',
    highlightsLabel: 'Highlights:',
    whatsappPrompt: 'Hello Zanzirangi Concierge! I would like to learn more and plan an excursion to',
  },
  pl: {
    eyebrow: 'Odkryj Wyspę',
    heading: 'ODKRYJ ZANZIBAR',
    subhead: 'Poza posiadłością Zanzibar to świat historycznych kamiennych uliczek, turkusowych rezerwatów morskich i pachnących gajów przyprawowych.',
    badge: 'Wyselekcjonowana Wyprawa',
    highlightsLabel: 'Główne atrakcje:',
    whatsappPrompt: 'Dzień dobry Zanzirangi Concierge! Chciałbym dowiedzieć się więcej i zaplanować wycieczkę do',
  },
  ar: {
    eyebrow: 'استكشاف الجزيرة',
    heading: 'استكشف زنجبار',
    subhead: 'خلف أروقة المنتجع، تفتح زنجبار أبوابها على عالم من الأزقة التاريخية العريقة والمحميات البحرية الفيروزية ومزارع التوابل العطرة.',
    badge: 'رحلة حصرية مختارة',
    highlightsLabel: 'أبرز المعالم:',
    whatsappPrompt: 'مرحباً كونسيرج زانزيرانجي! أود الاستفسار والتنسيق لرحلة استكشافية إلى',
  },
  zh: {
    eyebrow: '海岛探索指南',
    heading: '探索桑给巴尔',
    subhead: '走出私享别苑，桑给巴尔是一座由古老石巷、绿松石般纯净海洋自然保护区与香气四溢的丁香肉桂林木构筑的传奇国度。',
    badge: '专属甄选游程',
    highlightsLabel: '行程亮点：',
    whatsappPrompt: '您好 Zanzirangi 礼宾团队！我想咨询并定制前往以下目的地的专属探索行程：',
  },
  fr: {
    eyebrow: 'Découverte de l’Île',
    heading: 'EXPLORER ZANZIBAR',
    subhead: 'Au-delà du domaine, Zanzibar est un univers de ruelles chargées d’histoire, de réserves marines turquoise et de plantations d’épices parfumées.',
    badge: 'Excursion Exclusive',
    highlightsLabel: 'Points Forts :',
    whatsappPrompt: 'Bonjour la Conciergerie Zanzirangi ! J’aimerais en savoir plus et organiser une excursion vers',
  },
  sw: {
    eyebrow: 'Ugunduzi wa Kisiwa',
    heading: 'GUNDUA ZANZIBAR',
    subhead: 'Zaidi ya makazi yetu, Zanzibar ni ulimwengu wa vichochoro vya mawe vya kihistoria, hifadhi za bahari za zumaridi na mashamba ya viungo yenye harufu nzuri.',
    badge: 'Safari Maalum Iliyoratibiwa',
    highlightsLabel: 'Mambo Muhimu:',
    whatsappPrompt: 'Habari Zanzirangi Concierge! Ningependa kupata maelezo zaidi na kupanga safari ya kuelekea',
  },
  es: {
    eyebrow: 'Descubrimiento de la Isla',
    heading: 'EXPLORE ZANZÍBAR',
    subhead: 'Más allá de nuestro refugio, Zanzíbar es un universo de callejuelas históricas, santuarios marinos turquesas y aromáticas plantaciones de especias.',
    badge: 'Excursión Exclusiva',
    highlightsLabel: 'Puntos Destacados:',
    whatsappPrompt: '¡Hola Conserjería Zanzirangi! Me gustaría obtener más información y planificar una excursión a',
  },
  it: {
    eyebrow: 'Alla Scoperta dell’Isola',
    heading: 'ESPLORA ZANZIBAR',
    subhead: 'Oltre il rifugio, Zanzibar è un mondo di vicoli in pietra ricchi di storia, riserve marine turchesi e profumate piantagioni di spezie.',
    badge: 'Escursione Curata',
    highlightsLabel: 'Punti di Forza:',
    whatsappPrompt: 'Buongiorno Concierge Zanzirangi! Vorrei maggiori informazioni e pianificare un’escursione a',
  },
};

export const BEYOND_UI_TRANSLATIONS: Record<
  Language,
  {
    eyebrow: string;
    heading: string;
    subhead: string;
    flightLabel: string;
    highlightsLabel: string;
    bestForLabel: string;
    planSafariBtn: string;
    chatPrompt: string;
  }
> = {
  en: {
    eyebrow: 'East Africa Safari Connections',
    heading: 'ONE ISLAND. A WHOLE TANZANIA TO DISCOVER.',
    subhead: 'Seamlessly transition from beachfront relaxation to wild savannah expeditions. Our concierge coordinates direct bush flights, expert safari guides, and luxury tented lodges.',
    flightLabel: 'Flight Time:',
    highlightsLabel: 'Safari Highlights:',
    bestForLabel: 'Best For:',
    planSafariBtn: 'PLAN YOUR TANZANIA JOURNEY',
    chatPrompt: 'Hello Zanzirangi Safari Concierge! I would like to plan a Tanzania safari combination with my stay at Zanzirangi House for',
  },
  pl: {
    eyebrow: 'Połączenia Safari w Afryce Wschodniej',
    heading: 'JEDNA WYSPA. CAŁA TANZANIA DO ODKRYCIA.',
    subhead: 'Płynnie połącz relaks na plaży z wyprawą na dziką sawannę. Nasz concierge koordynuje bezpośrednie loty awionetką, doświadczonych przewodników i luksusowe lodże namiotowe.',
    flightLabel: 'Czas lotu:',
    highlightsLabel: 'Główne punkty safari:',
    bestForLabel: 'Najlepsze na:',
    planSafariBtn: 'ZAPLANUJ SWOJĄ PODRÓŻ PO TANZANII',
    chatPrompt: 'Dzień dobry Zanzirangi Safari Concierge! Chciałbym zaplanować połączenie pobytu w Zanzirangi House z safari w Tanzanii dla celu',
  },
  ar: {
    eyebrow: 'رحلات السفاري في شرق إفريقيا',
    heading: 'جزيرة ساحرة.. وتنزانيا بأكملها في انتظارك.',
    subhead: 'انتقل بسلاسة من الاسترخاء الشاطئي إلى مغامرات السافانا البرية؛ حيث ينسق فريق الكونسيرج طيراناً خاصاً مباشراً مع أمهر مرشدي السفاري ونزل الأدغال الفاخرة.',
    flightLabel: 'مدة الطيران:',
    highlightsLabel: 'أبرز مميزات السفاري:',
    bestForLabel: 'مثالي لـ:',
    planSafariBtn: 'خطط لرحلتك في تنزانيا',
    chatPrompt: 'مرحباً كونسيرج سفاري زانزيرانجي! أود التخطيط لدمج إقامتي في زانزيرانجي هاوس مع رحلة سفاري في تنزانيا إلى',
  },
  zh: {
    eyebrow: '东非荒野游猎无缝联运',
    heading: '一处海岛秘境，纵览整个坦桑尼亚传奇。',
    subhead: '从赤足漫步的海滨避世无缝切换至狂野的非洲大草原。我们的专属礼宾团队将为您协调直飞丛林飞机、资深国家公园巡猎向导与星级野奢营地。',
    flightLabel: '直飞航程：',
    highlightsLabel: '游猎核心亮点：',
    bestForLabel: '适宜体验：',
    planSafariBtn: '规划您的坦桑尼亚游猎盛宴',
    chatPrompt: '您好 Zanzirangi 游猎礼宾团队！我想在入住 Zanzirangi House 期间搭配定制坦桑尼亚大陆游猎行程，目的地：',
  },
  fr: {
    eyebrow: 'Liaisons Safaris en Afrique de l’Est',
    heading: 'UNE ÎLE. TOUTE LA TANZANIE À DÉCOUVRIR.',
    subhead: 'Passez en toute fluidité du repos en bord de mer aux expéditions en savane. Notre conciergerie organise vos vols directs en avion de brousse, guides chevronnés et lodges de luxe.',
    flightLabel: 'Durée du Vol :',
    highlightsLabel: 'Points Forts du Safari :',
    bestForLabel: 'Idéal pour :',
    planSafariBtn: 'PLANIFIER VOTRE SAFARI EN TANZANIE',
    chatPrompt: 'Bonjour le service Concierge Safari Zanzirangi ! J’aimerais combiner mon séjour à Zanzirangi House avec un safari en Tanzanie pour',
  },
  sw: {
    eyebrow: 'Muunganiko wa Safari za Afrika Mashariki',
    heading: 'KISIWA KIMOJA. TANZANIA NZIMA YA KUGUNDUA.',
    subhead: 'Badilisha kwa urahisi kutoka utulivu wa ufukweni hadi safari za mbuga za wanyama. Mhudumu wetu anaratibu ndege za porini, waongozaji stadi na kambi za hema za kifahari.',
    flightLabel: 'Muda wa Ndege:',
    highlightsLabel: 'Mambo Makuu ya Safari:',
    bestForLabel: 'Inafaa Zaidi kwa:',
    planSafariBtn: 'PANGA SAFARI YAKO YA TANZANIA',
    chatPrompt: 'Habari Zanzirangi Safari Concierge! Ningependa kupanga safari ya pamoja ya Zanzirangi House na mbuga za Tanzania kwa ajili ya',
  },
  es: {
    eyebrow: 'Conexiones de Safari en África Oriental',
    heading: 'UNA ISLA. TODA TANZANIA POR DESCUBRIR.',
    subhead: 'Pase sin esfuerzo del descanso frente al mar a expediciones en la sabana salvaje. Nuestra conserjería coordina vuelos chárter directos, guías expertos y alojamientos de lujo.',
    flightLabel: 'Tiempo de Vuelo:',
    highlightsLabel: 'Aspectos Destacados:',
    bestForLabel: 'Ideal para:',
    planSafariBtn: 'PLANIFIQUE SU VIAJE POR TANZANIA',
    chatPrompt: '¡Hola Conserjería de Safari Zanzirangi! Quisiera combinar mi estancia en Zanzirangi House con un safari en Tanzania para',
  },
  it: {
    eyebrow: 'Collegamenti Safari in Africa Orientale',
    heading: 'UN’ISOLA. TUTTA LA TANZANIA DA SCOPRIRE.',
    subhead: 'Passa con estrema naturalezza dal relax in riva al mare alle emozioni della savana. Il nostro concierge coordina voli bush diretti, ranger esperti e lussuosi lodge tendati.',
    flightLabel: 'Tempo di Volo:',
    highlightsLabel: 'Punti di Forza del Safari:',
    bestForLabel: 'Ideale per:',
    planSafariBtn: 'PIANIFICA IL TUO VIAGGIO IN TANZANIA',
    chatPrompt: 'Buongiorno Safari Concierge Zanzirangi! Vorrei pianificare la combinazione del mio soggiorno a Zanzirangi House con un safari in Tanzania a',
  },
};

export function getLocalizedZanzibarDestinations(lang: Language): ZanzibarDestination[] {
  const dict = ZANZIBAR_DEST_TRANSLATIONS[lang] || ZANZIBAR_DEST_TRANSLATIONS.en;
  return ZANZIBAR_DESTINATIONS.map((dest) => {
    const loc = dict[dest.id];
    if (!loc) return dest;
    return {
      ...dest,
      name: loc.name,
      theme: loc.theme,
      location: loc.location,
      shortDescription: loc.shortDescription,
      highlights: loc.highlights,
      ctaLabel: loc.ctaLabel,
    };
  });
}

export function getLocalizedTanzaniaDestinations(
  lang: Language,
  baseDestinations: TanzaniaDestination[] = TANZANIA_DESTINATIONS
): TanzaniaDestination[] {
  const dict = TANZANIA_DEST_TRANSLATIONS[lang] || TANZANIA_DEST_TRANSLATIONS.en;
  return baseDestinations.map((dest) => {
    const loc = dict[dest.id];
    if (!loc) return dest;
    const seed = TANZANIA_DESTINATIONS.find((d) => d.id === dest.id);
    const en = TANZANIA_DEST_TRANSLATIONS.en[dest.id];
    const pick = (field: Exclude<keyof LocalizedTanzaniaDest, 'highlights'>) =>
      localizeUnlessEdited(dest[field], seed?.[field], en?.[field], loc[field]);
    return {
      ...dest,
      name: pick('name'),
      tagline: pick('tagline'),
      region: pick('region'),
      flightTimeFromZanzibar: pick('flightTimeFromZanzibar'),
      description: pick('description'),
      highlights: localizeListUnlessEdited(dest.highlights, seed?.highlights, en?.highlights, loc.highlights),
      bestFor: pick('bestFor'),
      safariType: pick('safariType'),
    };
  });
}
