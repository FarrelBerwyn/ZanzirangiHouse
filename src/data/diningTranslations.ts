import { Language, DiningCategory } from '../types';
import { DINING_CATEGORIES } from './dining';
import { localizeUnlessEdited } from './homeSectionsCms';

export interface DiningCategoryLocalization {
  name: string;
  tabLabel: string;
  subtitle: string;
  description: string;
  signatureDishes: Array<{
    name: string;
    description: string;
  }>;
}

export const DINING_TRANSLATIONS: Record<Language, Record<string, DiningCategoryLocalization>> = {
  en: {
    local: {
      name: 'Authentic Swahili Cuisine',
      tabLabel: 'Swahili',
      subtitle: 'Heritage Flavors & Zanzibar Spices',
      description: 'Centuries of Arab, Persian, Indian, and East African maritime trade converged in Zanzibar’s coastal kitchens. Our executive chefs prepare time-honored recipes featuring freshly harvested coconut milk, aromatic cardamom, cloves from Pemba, and line-caught seafood brought straight to our shores.',
      signatureDishes: [
        {
          name: 'Zanzibari Coral Reef Snapper in Coconut & Turmeric',
          description: 'Pan-seared wild reef snapper simmered with fresh green coriander, stone-ground turmeric, and hand-squeezed coastal coconut milk served with saffron rice.',
        },
        {
          name: 'Tanzanian Urojo & Tiger Prawn Stew',
          description: 'A tangy, slow-simmered mango and tamarind broth with tender prawns, spiced cassava crisps, and crushed chili coconut sambal.',
        },
        {
          name: 'Slow-Braised Goat with Pilau Spices',
          description: 'Fork-tender local lamb infused with star anise, cinnamon quills, and black cardamom, accompanied by pickled kachumbari salad.',
        },
      ],
    },
    arabic: {
      name: 'Authentic Arabic & Omani Cuisine',
      tabLabel: 'Arabic',
      subtitle: 'Royal Omani Heritage, Clay-Oven Grills & Middle Eastern Mezze',
      description: 'A celebration of Zanzibar’s centuries-old royal Omani heritage and Arabian sea routes. Savor slow-braised spiced meats, clay-oven flatbreads, exquisite cold and hot mezze, fragrant saffron-infused rice dishes, and sweet rosewater delicacies prepared by master chefs.',
      signatureDishes: [
        {
          name: 'Omani Shuwa Spiced Slow-Roasted Lamb',
          description: 'Tender lamb slow-cooked for 24 hours with cloves, cardamom, coriander, dry lime, and banana leaves, served over fragrant golden saffron Kabsa rice.',
        },
        {
          name: 'Royal Mezze & Fresh Za’atar Khubz',
          description: 'Velvety pomegranate-drizzled hummus, smoky Mutabal, crispy herbed falafel, and handmade wood-fired Arabic flatbreads.',
        },
        {
          name: 'Mashwi Seafood & Charred Lime Platter',
          description: 'Charcoal-grilled Menai Bay jumbo prawns, calamari, and reef catch seasoned with Aleppo pepper, sumac, garlic, and wild herbs.',
        },
        {
          name: 'Warm Pistachio Baklava & Rosewater Muhallabia',
          description: 'Delicate flaky filo pastry layered with toasted pistachios and orange-blossom cardamom syrup alongside chilled rosewater milk pudding.',
        },
      ],
    },
    western: {
      name: 'Modern Western Gastronomy',
      tabLabel: 'Western',
      subtitle: 'International Standards with Refined Precision',
      description: 'Designed for international palates seeking comforting familiarity prepared with the highest fine-dining techniques. Prime imported beef cuts, fresh Mediterranean salads, homemade handmade pasta, and decadent desserts executed with crisp culinary precision.',
      signatureDishes: [
        {
          name: 'Prime Wagyu Tenderloin with Truffle Glaze',
          description: 'Char-grilled to perfection, paired with smooth parsnip mousseline, blistered vine tomatoes, and a 24-hour reduced red wine jus.',
        },
        {
          name: 'Wild Yellowfin Tuna Tartare with Avocado',
          description: 'Line-caught local tuna diced with Hass avocado, cold-pressed olive oil, caper berries, and house-baked sourdough crisps.',
        },
        {
          name: 'Handmade Tagliolini with Rock Lobster',
          description: 'Fresh egg pasta tossed with sweet Kizimkazi rock lobster tail, garlic confit, baby cherry tomatoes, and a light Pinot Grigio bisque.',
        },
      ],
    },
    fusion: {
      name: 'Swahili Contemporary Fusion',
      tabLabel: 'Fusion',
      subtitle: 'Where Tropical Island Meets Modern French Haute Cuisine',
      description: 'Our culinary signature. An imaginative dialogue between classical French technique and Zanzibar’s extraordinary spice terroir. Expect harmonious pairings like vanilla bean infused lobster butter, tamarind reductions, and passion fruit soufflés.',
      signatureDishes: [
        {
          name: 'Butter-Poached Rock Lobster with Pemba Vanilla',
          description: 'Sweet succulent lobster poached in clarified French butter scented with fragrant Pemba vanilla pods, sweet potato emulsion, and sea asparagus.',
        },
        {
          name: 'Seared Duck Breast with Tamarind & Hibiscus',
          description: 'Crispy skin Magret duck breast served medium rare with a tart hibiscus flower glaze, roasted baby carrots, and spiced cassava purée.',
        },
        {
          name: 'Valrhona Chocolate & Zanzibar Cardamom Fondant',
          description: 'Molten dark 70% chocolate cake perfumed with green cardamom, served with house-spun coconut gelato and passionfruit coulis.',
        },
      ],
    },
    beverages: {
      name: 'Beverages, Cellar & Refreshments',
      tabLabel: 'Beverages',
      subtitle: 'Fine Cellar Wines, Fresh Juices, Soft Drinks & Mineral Waters',
      description: 'An elevated beverage program curated for tropical indulgence. Enjoy world-class cellar vintages, pure cold-pressed Zanzibar tropical juices, house-crafted botanical soft drinks, and premium pristine mineral waters served beachfront or poolside.',
      signatureDishes: [
        {
          name: 'Curated Cellar Wines & Champagne (Wines)',
          description: 'Old and New World collections, crisp South African Chenin Blanc & Sauvignon Blanc, elegant French Champagnes, and full-bodied Tuscan & Bordeaux reds.',
        },
        {
          name: 'Cold-Pressed Zanzibar Tropical Nectars (Juice)',
          description: 'Sun-ripened passion fruit, sweet Alfonso mango, crushed pineapple with fresh mint, and young King coconut water straight from coastal palm groves.',
        },
        {
          name: 'Artisanal Botanical Sodas & Tonics (Soft Drinks)',
          description: 'House-brewed fiery ginger beer with crushed lemongrass, sparkling Tanzanian hibiscus cooler, craft botanical tonics, and classic iced sodas.',
        },
        {
          name: 'Pristine Mineral Waters (Waters)',
          description: 'Still and sparkling premium European & East African spring waters served crystal chilled with fresh garden cucumber, mint, and Makunduchi lime.',
        },
      ],
    },
  },

  fr: {
    local: {
      name: 'Cuisine Swahilie Authentique',
      tabLabel: 'Swahili',
      subtitle: 'Saveurs Patrimoniales & Épices de Zanzibar',
      description: 'Des siècles d’échanges maritimes arabes, perses, indiens et est-africains ont façonné la gastronomie côtière de Zanzibar. Nos chefs exécutifs préparent des recettes traditionnelles à base de lait de coco fraîchement pressé, de cardamome, de clous de girofle de Pemba et de poissons fraîchement pêchés.',
      signatureDishes: [
        {
          name: 'Vivaneau des Récifs au Lait de Coco & Curcuma',
          description: 'Vivaneau sauvage poêlé mijoté à la coriandre fraîche, au curcuma moulu sur pierre et au lait de coco artisanal, servi avec un riz au safran.',
        },
        {
          name: 'Marmite d’Urojo Tanzanien & Gambas Tigrées',
          description: 'Bouillon mijoté acidulé à la mangue et au tamarin avec gambas tigrées, croustillants de manioc épicés et sambal pimenté à la noix de coco.',
        },
        {
          name: 'Agneau Braisé Fondant aux Épices Pilau',
          description: 'Agneau fondant parfumé à l’anis étoilé, à la cannelle et à la cardamome noire, accompagné d’une salade kachumbari marinée.',
        },
      ],
    },
    arabic: {
      name: 'Cuisine Arabe & Omanaise Raffinée',
      tabLabel: 'Arabe',
      subtitle: 'Héritage Royal Omanais, Grillades au Feu de Bois & Mezzés',
      description: 'Une célébration des liens historiques entre Zanzibar et le Sultanat d’Oman. Savourez des viandes marinées cuites à l’étouffée, des pains plats artisanaux sortis du four en terre cuite, de somptueux mezzés et des desserts parfumés à la fleur d’oranger.',
      signatureDishes: [
        {
          name: 'Agneau Shuwa Omanais Rôti 24 Heures',
          description: 'Agneau fondant mariné aux clous de girofle, cardamome, citron séché et feuilles de bananier, servi sur un riz Kabsa au safran doré.',
        },
        {
          name: 'Mezzés Royaux & Khubz Artisanal au Za’atar',
          description: 'Houmous velouté aux perles de grenade, Moutabal fumé d’aubergine, falafels dorés et pains plats traditionnels tout juste cuits.',
        },
        {
          name: 'Plateau de Fruits de Mer Mashwi au Citron Braisé',
          description: 'Gambas géantes de Menai Bay, calamars et poissons des récifs grillés au charbon de bois, assaisonnés de sumac, ail et herbes sauvages.',
        },
        {
          name: 'Baklava Tiède aux Pistaches & Mouhallabieh à la Rose',
          description: 'Pâte filo feuilletée garnie de pistaches grillées et sirop de cardamome, accompagnée d’un entremets lacté à l’eau de rose.',
        },
      ],
    },
    western: {
      name: 'Gastronomie Occidentale Moderne',
      tabLabel: 'Occidental',
      subtitle: 'Standards Internationaux & Précision Haute Couture',
      description: 'Une carte internationale pensée pour satisfaire les palais les plus exigeants grâce à des techniques de haute cuisine : découpes de bœuf d’exception, salades méditerranéennes croquantes, pâtes fraîches maison et desserts haute précision.',
      signatureDishes: [
        {
          name: 'Filet de Bœuf Wagyu au Jus Corsé à la Truffe',
          description: 'Cuit à la perfection à la braise, mousseline onctueuse de panais, tomates grappes rôties et réduction de vin rouge mijotée 24h.',
        },
        {
          name: 'Tartare de Thon Jaune Sauvage & Avocat Crémeux',
          description: 'Thon sauvage de ligne coupé au couteau, avocat Hass, huile d’olive extra vierge première pression à froid et crostinis de levain.',
        },
        {
          name: 'Tagliolini Frais à la Langouste des Récifs',
          description: 'Pâtes fraîches maison sautées aux queues de langouste de Kizimkazi, ail confit, tomates cerises confites et bisque légère au Pinot Grigio.',
        },
      ],
    },
    fusion: {
      name: 'Haute Cuisine Fusion Swahilie-Française',
      tabLabel: 'Fusion',
      subtitle: 'La Rencontre Entre Terroir Tropical et Gastronomie Française',
      description: 'Notre signature gastronomique exclusive. Un dialogue poétique entre la rigueur de la cuisine française et les trésors botaniques de Zanzibar : homard poché au beurre de vanille de Pemba, réductions de tamarin et soufflés au fruit de la passion.',
      signatureDishes: [
        {
          name: 'Langouste Royale Pochée au Beurre & Vanille de Pemba',
          description: 'Chair tendre de langouste pochée dans un beurre doux clarifié à la vanille bourbon de Pemba, mousseline de patate douce et salicornes.',
        },
        {
          name: 'Magret de Canard Rôti au Glaçage Tamarin & Hibiscus',
          description: 'Magret croustillant servi rosé avec une réduction acidulée de fleurs d’hibiscus, jeunes carottes glacées et purée de manioc épicée.',
        },
        {
          name: 'Fondant Cacao Valrhona & Cardamome de Zanzibar',
          description: 'Cœur coulant de chocolat noir 70% aux graines de cardamome verte, servi avec une glace maison au lait de coco et coulis de maracuja.',
        },
      ],
    },
    beverages: {
      name: 'Cave à Vins, Nectars & Rafraîchissements',
      tabLabel: 'Boissons',
      subtitle: 'Grands Crus, Jus Frais Pressés & Eaux Minérales Fines',
      description: 'Une sélection raffinée de boissons de prestige : grands vins et champagnes de renommée mondiale, purs nectars de fruits tropicaux pressés à froid chaque matin et rafraîchissements botaniques servis au bord de l’eau.',
      signatureDishes: [
        {
          name: 'Sélection de Grands Crus & Champagnes d’Exception',
          description: 'Vins prestigieux du Nouveau et de l’Ancien Monde, Chenin Blanc sud-africain éclatant, champagnes français millésimés et grands rouges toscans.',
        },
        {
          name: 'Nectars Tropicaux Pressés à Froid de Zanzibar',
          description: 'Fruit de la passion mûri au soleil, mangues Alfonso gorgées de sucre, ananas à la menthe fraîche et eau de coco vert tout juste cueillie.',
        },
        {
          name: 'Sodas & Tonics Botaniques Faits Maison',
          description: 'Bière de gingembre artisanale piquante à la citronnelle fraîche, boisson gazeuse florale à l’hibiscus de Tanzanie et tonics botaniques.',
        },
        {
          name: 'Eaux Minérales d’Origine Protégée',
          description: 'Eaux de source plates et gazeuses européennes et est-africaines de haute pureté, servies glacées avec concombre du potager et citron vert.',
        },
      ],
    },
  },

  sw: {
    local: {
      name: 'Vyakula Asilia vya Kiswahili',
      tabLabel: 'Kiswahili',
      subtitle: 'Ladha za Urithi na Viungo vya Zanzibar',
      description: 'Karne za biashara ya bahari ziliungana katika jiko za pwani ya Zanzibar. Wapishi wetu huandaa vyakula vya asili vikitumia tui la nazi safi, iliki, karafuu za Pemba, na samaki wabichi wa baharini.',
      signatureDishes: [
        {
          name: 'Samaki wa Matumbawe katika Tui la Nazi na Manjano',
          description: 'Samaki mbichi wa miamba akipikwa na giligilani, manjano asilia ya mawe na tui zito la nazi safi, akisindikizwa na wali wa zafarani.',
        },
        {
          name: 'Urojo wa Kitanzania na Kamba Wakubwa',
          description: 'Supu nzito yenye ladha ya embe na ukwaju pamoja na kamba laini, bajia, na pilipili ya nazi iliyosagwa.',
        },
        {
          name: 'Nyama ya Mbuzi Laini Yenye Viungo vya Pilau',
          description: 'Nyama laini ya mbuzi iliyochemshwa polepole na mdalasini, iliki nyeusi na hiliki, ikisindikizwa na kachumbari safi.',
        },
      ],
    },
    arabic: {
      name: 'Vyakula vya Kiarabu na Omani',
      tabLabel: 'Kiarabu',
      subtitle: 'Urithi wa Kifalme wa Omani, Mishikaki na Mezze',
      description: 'Ushereheshaji wa urithi wa kifalme wa Omani visiwani Zanzibar. Furahia nyama zilizochemshwa kwa polepole, mikate ya moto ya tanuri, na vyakula vyenye ladha ya zafarani na maua ya waridi.',
      signatureDishes: [
        {
          name: 'Shuwa ya Omani: Kondoo Aliyepikwa Saa 24',
          description: 'Kondoo laini sana aliyepikwa kwa saa 24 kwenye majani ya migomba na karafuu, iliki na limau kavu, akilala juu ya wali wa Kabsa.',
        },
        {
          name: 'Mezze ya Kifalme na Mkate Mpya wa Za’atar',
          description: 'Hummus laini yenye komamanga, Mutabal ya biringanya, falafel moto na mikate ya Kiarabu iliyookwa motoni.',
        },
        {
          name: 'Dishi la Samaki na Kamba wa Mashwi na Ndimu',
          description: 'Kamba wakubwa wa Menai Bay na pweza waliookwa mkaa na kitunguu saumu, sumaki na mimea ya asili.',
        },
        {
          name: 'Baklava ya Pistachio na Muhallabia ya Waridi',
          description: 'Keki laini yenye karanga za pistachio na asali ya iliki pamoja na uji mtamu wa maziwa wenye manukato ya waridi.',
        },
      ],
    },
    western: {
      name: 'Vyakula vya Kisasa vya Kimagharibi',
      tabLabel: 'Kimagharibi',
      subtitle: 'Ubora wa Kimataifa kwa Ufundi wa Hali ya Juu',
      description: 'Vyakula vya kimataifa vilivyoandaliwa kwa ubora wa kiwango cha juu. Nyama bora za ng’ombe, saladi safi za Mediterania, pasta za mikono na vitindamlo vitamu.',
      signatureDishes: [
        {
          name: 'Nyama ya Wagyu Laini na Mchuzi wa Truffle',
          description: 'Imeokwa kwa ufundi wa hali ya juu na supu nzito ya divai nyekundu iliyochemshwa saa 24 na nyanya tamu za shamba.',
        },
        {
          name: 'Tartare ya Jodari Mbichi na Parachichi',
          description: 'Samaki wa jodari aliyevuliwa leo akichanganywa na parachichi laini, mafuta ya zeituni na mikate mikavu ya asili.',
        },
        {
          name: 'Pasta ya Tagliolini na Kamba Mkubwa wa Baharini',
          description: 'Pasta safi ya mayai ikichanganywa na kamba wa Kizimkazi, kitunguu saumu kilichoiva polepole na nyanya ndogo tamu.',
        },
      ],
    },
    fusion: {
      name: 'Mchanganyiko wa Kisasa wa Kiswahili & Kifaransa',
      tabLabel: 'Mchanganyiko',
      subtitle: 'Mkutano wa Ladha za Kitropiki na Upishi wa Kifaransa',
      description: 'Sahihi yetu ya kipekee ya upishi. Ushirikiano kati ya ufundi wa kifaransa na viungo adimu vya Zanzibar kama vile vanila ya Pemba na ukwaju mtamu.',
      signatureDishes: [
        {
          name: 'Kamba Mkubwa Aliyetokotwa na Siagi na Vanila ya Pemba',
          description: 'Kamba mtamu aliyepikwa ndani ya siagi safi ya Kifaransa yenye harufu nzuri ya vanila ya Pemba na viazi vitamu vilivyosagwa.',
        },
        {
          name: 'Kidari cha Bata na Mchuzi wa Ukwaju na Rozela',
          description: 'Nyama ya bata iliyoiva kwa ukamilifu ikiwa na mchuzi wa maua ya rozela na ukwaju, ikisindikizwa na muhogo uliotiwa viungo.',
        },
        {
          name: 'Keki ya Chokoleti ya Valrhona na Iliki ya Zanzibar',
          description: 'Keki moto ya chokoleti nzito yenye iliki ya kijani, ikisindikizwa na aiskrimu ya tui la nazi na rojo ya pasheni.',
        },
      ],
    },
    beverages: {
      name: 'Vinywaji, Mvinyo & Viburudisho',
      tabLabel: 'Vinywaji',
      subtitle: 'Mvinyo Bora, Juisi Asilia & Maji Safi ya Chemchemi',
      description: 'Chaguo bora la vinywaji vilivyotengenezwa mahususi kwa hali ya hewa ya kitropiki. Mvinyo maarufu duniani, juisi safi za matunda ya Zanzibar zilizokamuliwa leo na vinywaji baridi.',
      signatureDishes: [
        {
          name: 'Mkusanyiko wa Mvinyo Bora na Champagne',
          description: 'Mvinyo bora kutoka Afrika Kusini, Ufaransa na Italia, pamoja na Champagne za kifahari.',
        },
        {
          name: 'Juisi Safi za Matunda ya Kitropiki ya Zanzibar',
          description: 'Juisi za pasheni zilizopikwa na jua, maembe matamu, nanasi lililochanganywa na mnanaa na madafu freshi.',
        },
        {
          name: 'Soda za Asili na Tangawizi ya Nyumbani',
          description: 'Bia ya tangawizi ya asili yenye mchaichai mkali, kinywaji cha rozela baridi na soda za kawaida zenye barafu.',
        },
        {
          name: 'Maji Safi ya Chemchemi za Milimani',
          description: 'Maji safi yasiyo na gesi na yenye gesi yakihudumiwa yakiwa baridi na tango safi la bustani na limau.',
        },
      ],
    },
  },

  es: {
    local: {
      name: 'Auténtica Cocina Suajili',
      tabLabel: 'Suajili',
      subtitle: 'Sabores Patrimoniales y Especias de Zanzíbar',
      description: 'Siglos de comercio marítimo árabe, persa, indio y africano convergen en los fogones costeros de Zanzíbar. Leche de coco fresca, cardamomo, clavos de olor de Pemba y pescados recién salidos del mar.',
      signatureDishes: [
        {
          name: 'Pargo de Arrecife al Coco y Cúrcuma de Zanzíbar',
          description: 'Pargo salvaje dorado a fuego lento con cilantro fresco, cúrcuma molida a mano y leche de coco virgen sobre arroz con azafrán.',
        },
        {
          name: 'Guiso Tradicional Urojo con Langostinos Tigre',
          description: 'Caldo agridulce de mango y tamarindo con langostinos tiernos, crujientes de yuca especiada y sambal picante de coco.',
        },
        {
          name: 'Cordero Braseado Suave con Especias Pilau',
          description: 'Cordero local sumamente tierno con anís estrellado, canela en rama y cardamomo negro, acompañado de ensalada kachumbari.',
        },
      ],
    },
    arabic: {
      name: 'Cocina Árabe y Omaní Señorial',
      tabLabel: 'Árabe',
      subtitle: 'Herencia Real de Omán, Asados en Barro y Mezze',
      description: 'Celebración de los lazos centenarios entre Zanzíbar y el Sultanato de Omán. Carnes marinadas a fuego lento, panes planos recién salidos del horno, mezzes exquisitos y postres con agua de rosas.',
      signatureDishes: [
        {
          name: 'Cordero Asado Shuwa Omaní en Cocción de 24 Horas',
          description: 'Cordero extra tierno cocinado durante 24 horas con clavos, cardamomo y lima seca sobre arroz aromático Kabsa.',
        },
        {
          name: 'Mezze Real y Pan Khubz Caliente con Za’atar',
          description: 'Hummus sedoso con granada, Mutabal ahumado de berenjena, falafel crujiente y panes árabes artesanales recién horneados.',
        },
        {
          name: 'Parrillada Mashwi de Mariscos con Lima Tostada',
          description: 'Langostinos gigantes de Menai Bay, calamares y pesca del día al carbón con zumaque, ajo y hierbas silvestres.',
        },
        {
          name: 'Baklava Caliente de Pistacho y Muhallabia de Rosas',
          description: 'Hojaldre fino con pistachos tostados y almíbar de cardamomo junto a un suave pudin lácteo al agua de rosas.',
        },
      ],
    },
    western: {
      name: 'Gastronomía Occidental Moderna',
      tabLabel: 'Occidental',
      subtitle: 'Excelencia Internacional con Precisión Culinaria',
      description: 'Platos internacionales preparados con las más altas técnicas gastronómicas: cortes nobles de ternera, pastas caseras hechas a mano y ensaladas mediterráneas frescas.',
      signatureDishes: [
        {
          name: 'Solomillo Wagyu con Reducción Glaseada de Trufa',
          description: 'A la parrilla en su punto exacto con muselina de chirivía, tomates de rama confitados y reducción de vino tinto de 24 horas.',
        },
        {
          name: 'Tartar de Atún Salvaje de Aleta Amarilla y Aguacate',
          description: 'Atún local cortado a cuchillo con aguacate Hass, aceite de oliva virgen extra y crujientes de masa madre casera.',
        },
        {
          name: 'Tagliolini Hechos a Mano con Langosta de Roca',
          description: 'Pasta fresca al huevo salteada con cola de langosta de Kizimkazi, ajo confitado y una suave bisque al vino blanco.',
        },
      ],
    },
    fusion: {
      name: 'Fusión Contemporánea Suajili y Francesa',
      tabLabel: 'Fusión',
      subtitle: 'Encuentro Entre Isla Tropical y Haute Cuisine Francesa',
      description: 'Nuestra exclusiva firma culinaria. Diálogo creativo entre la alta técnica francesa y el terruño botánico de Zanzíbar: mantequillas infusionadas en vainilla de Pemba y soufflés de maracuyá.',
      signatureDishes: [
        {
          name: 'Langosta de Roca Pochada en Mantequilla y Vainilla de Pemba',
          description: 'Suculenta langosta en mantequilla clarificada aromatizada con vainas de vainilla de Pemba y emulsión de boniato.',
        },
        {
          name: 'Magret de Pato Crujiente con Glaseado de Tamarindo e Hibisco',
          description: 'Magret en su punto con reducción agridulce de flores de hibisco, zanahorias baby glaseadas y puré de yuca especiado.',
        },
        {
          name: 'Fondant de Chocolate Valrhona y Cardamomo de Zanzíbar',
          description: 'Volcán de chocolate negro 70% con corazón fundente al cardamomo verde, helado artesano de coco y coulis de maracuyá.',
        },
      ],
    },
    beverages: {
      name: 'Bodega de Vinos, Zumos y Bebidas',
      tabLabel: 'Bebidas',
      subtitle: 'Grandes Vinos de Bodega, Zumos Frescos y Aguas Minerales',
      description: 'Una cuidada carta de bebidas tropicales y grandes reservas: vinos y champagnes prestigiosos, zumos naturales prensados en frío y cócteles botánicos sin alcohol.',
      signatureDishes: [
        {
          name: 'Selección de Vinos de Bodega y Champagnes',
          description: 'Vinos sudafricanos frescos, grandes tintos de Burdeos y Toscana, y los más selectos champagnes franceses.',
        },
        {
          name: 'Zumos Tropicales de Zanzíbar Prensados en Frío',
          description: 'Maracuyá madurada al sol, mangos dulces, piña con menta fresca y agua de coco recién recolectada del palmeral.',
        },
        {
          name: 'Sodas Botánicas Artesanales de la Casa',
          description: 'Cerveza de jengibre especiada con limoncillo, refresco espumoso de hibisco tanzano y tónicas botánicas.',
        },
        {
          name: 'Aguas Minerales Puras de Manantial',
          description: 'Aguas minerales de alta pureza servidas bien frías con pepino fresco del huerto y lima de Makunduchi.',
        },
      ],
    },
  },

  it: {
    local: {
      name: 'Autentica Cucina Swahili',
      tabLabel: 'Swahili',
      subtitle: 'Sapori Tradizionali & Spezie di Zanzibar',
      description: 'Secoli di scambi marittimi arabi, persiani e indiani si fondono nelle ricette costiere di Zanzibar. Latte di cocco fresco, cardamomo aromatico, chiodi di garofano di Pemba e pescato del giorno.',
      signatureDishes: [
        {
          name: 'Dentice dei Coralli al Cocco e Curcuma di Zanzibar',
          description: 'Dentice selvatico cotto a fuoco lento con coriandolo fresco, curcuma macinata su pietra e latte di cocco con riso allo zafferano.',
        },
        {
          name: 'Zuppa Tradizionale Urojo con Mazzancolle Giganti',
          description: 'Brodo agrodolce al mango e tamarindo con gamberi teneri, chips croccanti di manioca e sambal piccante di cocco.',
        },
        {
          name: 'Stufato Morbido di Capretto alle Spezie Pilau',
          description: 'Carne di capretto morbidissima aromatizzata con anice stellato, cannella e cardamomo nero con insalata fresca kachumbari.',
        },
      ],
    },
    arabic: {
      name: 'Cucina Araba & Tradizione dell’Oman',
      tabLabel: 'Araba',
      subtitle: 'Eredità Reale Omanita, Cotture al Forno & Mezze',
      description: 'Una celebrazione delle radici storiche tra Zanzibar e l’Oman. Carni speziate cotte lentamente, fragranti focacce appena sfornate, ricche mezze calde e fredde e dolci all’acqua di rose.',
      signatureDishes: [
        {
          name: 'Agnello Shuwa Omanita Brasato 24 Ore',
          description: 'Agnello morbidissimo cotto a bassa temperatura con chiodi di garofano, cardamomo e lime essiccato su riso Kabsa allo zafferano.',
        },
        {
          name: 'Mezze Reali & Focaccia Calda Za’atar Khubz',
          description: 'Hummus vellutato con melograno, Mutabal di melanzane affumicate, falafel dorati e focacce cotte al forno a legna.',
        },
        {
          name: 'Grigliata di Mare Mashwi con Lime Brasato',
          description: 'Gamberi giganti di Menai Bay, calamari e pescato del giorno cotti sulla brace con sommacco, aglio ed erbe aromatiche.',
        },
        {
          name: 'Baklava Calda al Pistacchio & Muhallabia alle Rose',
          description: 'Pasta fillo croccante con pistacchi tostati e sciroppo profumato al cardamomo insieme a un delicato budino alle rose.',
        },
      ],
    },
    western: {
      name: 'Gastronomia Occidentale Contemporanea',
      tabLabel: 'Occidentale',
      subtitle: 'Standard Internazionali & Rigore dell’Alta Cucina',
      description: 'Piatti internazionali curati con maestria: tagli selezionati di carne, pasta fresca fatta a mano e insalate mediterranee croccanti.',
      signatureDishes: [
        {
          name: 'Filetto di Manzo Wagyu con Glassa al Tartufo',
          description: 'Cotto alla griglia con mousseline di pastinaca, pomodorini confit e riduzione di vino rosso concentrata per 24 ore.',
        },
        {
          name: 'Tartare di Tonno Pinna Gialla con Avocado',
          description: 'Tonno fresco tagliato al coltello con avocado Hass, olio extravergine d’oliva spremuto a freddo e crostini di pane a lievitazione naturale.',
        },
        {
          name: 'Tagliolini Fatti a Mano con Aragosta di Scoglio',
          description: 'Pasta fresca all’uovo saltata con aragosta di Kizimkazi, aglio dolce confit, pomodorini datterini e bisque leggera al vino bianco.',
        },
      ],
    },
    fusion: {
      name: 'Haute Cuisine Fusion Swahili-Francese',
      tabLabel: 'Fusion',
      subtitle: 'L’Incontro tra Terroir Tropicale e Cucina Francese',
      description: 'Il fiore all’occhiello della nostra offerta gastronomica: tecniche francesi d’autore incontrano la vaniglia di Pemba, il tamarindo e il frutto della passione.',
      signatureDishes: [
        {
          name: 'Aragosta di Scoglio Affogata nel Burro alla Vaniglia di Pemba',
          description: 'Pregiata aragosta cotta nel burro chiarificato alla vaniglia di Pemba con purea soffice di patate dolci e asparagi di mare.',
        },
        {
          name: 'Petto d’Anatra con Glassa al Tamarindo e Ibisco',
          description: 'Pelle croccante e cottura rosata con glassa acidula di ibisco, carote baby glassate e purea speziata di manioca.',
        },
        {
          name: 'Tortino Caldo al Cioccolato Valrhona & Cardamomo',
          description: 'Cuore fondente al cioccolato fondente 70% profumato al cardamomo con gelato al latte di cocco fatto in casa e maracuja.',
        },
      ],
    },
    beverages: {
      name: 'Cantina Vini, Succhi Tropicali & Rinfreschi',
      tabLabel: 'Bevande',
      subtitle: 'Grandi Vini, Succhi Freschi & Acque Minerali',
      description: 'Una cantina selezionata per il massimo piacere tropicale: etichette rinomate, champagne francesi, spremute fresche a freddo e bibite botaniche della casa.',
      signatureDishes: [
        {
          name: 'Vini Selezionati di Cantina & Champagne',
          description: 'Chenin Blanc sudafricano, grandi rossi di Borgogna e Toscana e i più raffinati champagne francesi.',
        },
        {
          name: 'Nettari Tropicali di Zanzibar Estratti a Freddo',
          description: 'Frutto della passione dolce, mango maturo, ananas alla menta ed energizzante acqua di cocco fresco di palma.',
        },
        {
          name: 'Soda Botaniche & Ginger Beer Artigianale',
          description: 'Ginger beer piccante con lemongrass fresco, bevanda frizzante all’ibisco della Tanzania e tonica botanica.',
        },
        {
          name: 'Acque Minerali d’Alta Quota',
          description: 'Acque minerali naturali e frizzanti servite fredde con cetriolo dell’orto e lime fresco di Makunduchi.',
        },
      ],
    },
  },

  pl: {
    local: {
      name: 'Autentyczna Kuchnia Suahili',
      tabLabel: 'Suahili',
      subtitle: 'Tradycyjne Smaki & Przyprawy Zanzibaru',
      description: 'Wielowiekowe szlaki handlowe zbiegły się w nadmorskich kuchniach Zanzibaru. Świeże mleko kokosowe, aromatyczny kardamon, goździki z Pemby i ryby prosto z połowu.',
      signatureDishes: [
        {
          name: 'Snapper z Rafy w Sosie Kokosowym z Kurkumą',
          description: 'Dziki snapper duszony ze świeżą kolendrą, ręcznie mieloną kurkumą i świeżym mlekiem kokosowym z ryżem szafranowym.',
        },
        {
          name: 'Tradycyjny Urojo z Krewetkami Królewskimi',
          description: 'Aromatyczny bulion z mango i tamaryndowca z soczystymi krewetkami, chrupiącym maniokiem i pastą chili-kokos.',
        },
        {
          name: 'Duszona Delikatna Kozina z Przyprawami Pilau',
          description: 'Wyjątkowo miękkie mięso z anyżem gwiazdkowym, laską cynamonu i czarnym kardamonem z marynowaną sałatką kachumbari.',
        },
      ],
    },
    arabic: {
      name: 'Wykwintna Kuchnia Arabska i Omańska',
      tabLabel: 'Arabska',
      subtitle: 'Królewskie Dziedzictwo Omanu, Piec Gliniany i Mezze',
      description: 'Uczczenie historycznych więzi Zanzibaru z Sułtanatem Omanu. Pieczone mięsa, podpłomyki z pieca glinianego, wyborne mezze i desery z wodą różaną.',
      signatureDishes: [
        {
          name: 'Omańska Jagnięcina Shuwa Pieczona 24 Godziny',
          description: 'Rozpływająca się w ustach jagnięcina z goździkami, suszoną limonką i kardamonem na złocistym ryżu Kabsa.',
        },
        {
          name: 'Królewskie Mezze i Ciepły Chlebek z Za’atarem',
          description: 'Aksamitny hummus z granatem, wędzony Mutabal z bakłażana, chrupiący falafel i ręcznie wypiekane chlebki.',
        },
        {
          name: 'Półmisek Owoców Morza Mashwi z Pieczoną Limonką',
          description: 'Grillowane na węglu krewetki olbrzymie, kalmary i ryby z sumakiem, czosnkiem i dzikimi ziołami.',
        },
        {
          name: 'Ciepła Baklawa Pistacjowa & Deser Różany Muhallabia',
          description: 'Chrupiące ciasto filo z prażonymi pistacjami i syropem kardamonowym obok schłodzonego kremu z wodą różaną.',
        },
      ],
    },
    western: {
      name: 'Nowoczesna Gastronomia Zachodnia',
      tabLabel: 'Zachodnia',
      subtitle: 'Międzynarodowe Standardy i Kulinarna Precyzja',
      description: 'Dania kuchni międzynarodowej przygotowane z najwyższą dbałością o kunszt: steki wołowe klasy premium, świeże sałaty i domowe makarony.',
      signatureDishes: [
        {
          name: 'Polędwica Wagyu w Glazurze Truflowej',
          description: 'Grillowana do perfekcji z aksamitnym purée z pasternaku, pieczonymi pomidorkami i sosem winnym redukowanym przez dobę.',
        },
        {
          name: 'Tatar z Dzikiego Tuńczyka Żółtopłetwego z Awokado',
          description: 'Świeży tuńczyk z awokado Hass, oliwą z pierwszego tłoczenia na zimno i domowymi grzankami na zakwasie.',
        },
        {
          name: 'Ręcznie Robione Tagliolini z Homarem Skalnym',
          description: 'Świeży makaron jajeczny z ogonem homara z Kizimkazi, konfitowanym czosnkiem i lekkim sosem bisque.',
        },
      ],
    },
    fusion: {
      name: 'Nowoczesny Fusion Suahili i Kuchni Francuskiej',
      tabLabel: 'Fusion',
      subtitle: 'Spotkanie Tropikalnej Wyspy z Francuskim Kunsztem',
      description: 'Nasza autorska wizytówka kulinarna. Kreatywne połączenie francuskich technik haute cuisine ze skarbami zanzibarskich przypraw.',
      signatureDishes: [
        {
          name: 'Homar Skalny Pochowany w Maśle z Wanilią z Pemby',
          description: 'Soczysty homar w maśle klarowanym pachnącym wanilią z Pemby z kremem ze słodkich ziemniaków.',
        },
        {
          name: 'Pierś z Kaczki z Glazurą z Tamaryndowca i Hibiskusa',
          description: 'Chrupiąca kaczka z kwaskowatą redukcją z kwiatów hibiskusa, glazurowaną marchewką i pikantnym purée z manioku.',
        },
        {
          name: 'Fondant Czekoladowy Valrhona z Kardamonem',
          description: 'Płynne ciasto z gorzkiej czekolady 70% z kardamonem, domowymi lodami kokosowymi i sosem marakuja.',
        },
      ],
    },
    beverages: {
      name: 'Kolekcja Win, Soki Tropikalne i Napoje',
      tabLabel: 'Napoje',
      subtitle: 'Wyborne Wina z Piwniczki, Świeże Soki i Wody Mineralne',
      description: 'Karta trunków stworzona z myślą o tropikalnym relaksie: prestiżowe wina, szampany, świeżo tłoczone soki i orzeźwiające toniki rzemieślnicze.',
      signatureDishes: [
        {
          name: 'Wyselekcjonowane Wina z Piwniczki i Szampany',
          description: 'Wina ze Starego i Nowego Świata, rześkie Chenin Blanc z RPA, szampany francuskie i pełne wina toskańskie.',
        },
        {
          name: 'Świeżo Tłoczone Soki z Owoców Zanzibaru',
          description: 'Dojrzała w słońcu marakuja, słodkie mango Alfonso, ananas z miętą i woda z młodych orzechów kokosowych.',
        },
        {
          name: 'Rzemieślnicze Sody Botaniczne i Ginger Beer',
          description: 'Pikantne piwo imbirowe z trawą cytrynową, orzeźwiający napój z hibiskusa i toniki ziołowe.',
        },
        {
          name: 'Krystaliczne Wody Źródlane',
          description: 'Wody niegazowane i gazowane podawane schłodzone ze świeżym ogórkiem i zanzibarską limonką.',
        },
      ],
    },
  },

  ar: {
    local: {
      name: 'المطبخ السواحلي الأصيل',
      tabLabel: 'سواحلي',
      subtitle: 'نكهات التراث وتوابل زنجبار العريقة',
      description: 'قرون من التجارة البحرية العربية والفارسية والهندية اجتمعت في مطابخ سواحل زنجبار. يقدم طهاتنا وصفات متوارثة تعتمد على حليب جوز الهند الطازج، والهيل العطري، وقرنفل جزيرة بيمبا، وصيد اليوم الطازج.',
      signatureDishes: [
        {
          name: 'سمك النهاش المرجاني بحليب جوز الهند والكركم',
          description: 'سمك مرجاني بري مشوح ومطهو مع الكزبرة الخضراء، والكركم المطحون، وحليب جوز الهند الساحلي مع أرز الزعفران.',
        },
        {
          name: 'حساء أوروجو التنزاني مع الروبيان الملكي',
          description: 'مرق المانجو والتمر الهندي اللذيذ مع الروبيان الطري، ورقائق الكسافا المقرمشة وصلصة جوز الهند الحارة.',
        },
        {
          name: 'لحم الماعز المطهو ببطء بتوابل البيلاو',
          description: 'لحم طري يذوب في الفم متبل باليانسون النجمي، وأعواد القرفة، والهيل الأسود مع سلطة كاتشومباري المتبلة.',
        },
      ],
    },
    arabic: {
      name: 'المطبخ العربي والعُماني التراثي',
      tabLabel: 'عربي',
      subtitle: 'التراث العُماني الملكي، المشاوي في أفران الطين والمقبلات الفاخرة',
      description: 'احتفاء بالروابط التاريخية العريقة بين زنجبار وسلطنة عُمان. تلذذ باللحوم المتبلة المطهوة على نار هادئة، والخبز المخبوز في أفران الطين، وتشكيلات المازة الباردة والساخنة وحلويات ماء الورد العطرة.',
      signatureDishes: [
        {
          name: 'شواء اللحم العُماني المتبل والمطهو لمدة 24 ساعة',
          description: 'لحم طري مطهو ببطء مع القرنفل والهيل والليمون المجفف وأوراق الموز على أرز الكبسة بالزعفران الذهبي.',
        },
        {
          name: 'المازة الملكية وخبز الزعتر الساخن',
          description: 'حمص ناعم بحبات الرمان، ومتبل باذنجان مدخن، وفلافل مقرمشة بالأعشاب وخبز عربي مخبوز طازجاً.',
        },
        {
          name: 'مشاوي المأكولات البحرية مع الليمون المشوي',
          description: 'روبيان خليج ميناي الجامبو، والحبار المشوي على الفحم، وصيد المرجان مع السماق والثوم والأعشاب البرية.',
        },
        {
          name: 'بقلاوة الفستق الدافئة ومهلبية ماء الورد',
          description: 'رقائق الفيلو الهشة بالفستق المحمص وشراب الهيل وزهر البرتقال إلى جانب مهلبية الحليب الباردة بماء الورد.',
        },
      ],
    },
    western: {
      name: 'فن الطهي الغربي العصري',
      tabLabel: 'غربي',
      subtitle: 'المعايير العالمية الفاخرة بدقة احترافية',
      description: 'أطباق عالمية ترضي كافة الأذواق بأرقى أساليب الطهي الفاخر: قطع لحم بقر واغيو المستوردة الممتازة، وسلطات البحر المتوسط الطازجة، والمعكرونة المحضرة يدوياً والحلويات الفاخرة.',
      signatureDishes: [
        {
          name: 'فيليه واغيو المشوي مع صوص الكمأة',
          description: 'مشوي على الفحم بدقة مع موس الجزر الأبيض الناعم، وطماطم كرزية مشوية وصوص اللحم المركز لمدة 24 ساعة.',
        },
        {
          name: 'تارتار التونة صفراء الزعانف مع الأفوكادو',
          description: 'تونة بحرية طازجة مفرومة مع أفوكادو هاس، وزيت زيتون بكر معصور على البارد وخبز العجين المخمر المقرمش.',
        },
        {
          name: 'تاليوليني محضر يدوياً مع لحم الكركند',
          description: 'معكرونة طازجة محضرة بالبيض مع ذيل كركند كيزيمكازي، وثوم كونفيه، وطماطم صغيرة وصوص خفيف بمرق الكركند.',
        },
      ],
    },
    fusion: {
      name: 'مزيج المطبخ السواحلي والفرنسي الراقي',
      tabLabel: 'فيوجن',
      subtitle: 'لقاء سحر الجزر الاستوائية مع فن الطهي الفرنسي الكلاسيكي',
      description: 'بصمتنا المطبخية المميزة التي تجمع بين الدقة الفرنسية وتوابل زنجبار الفريدة: كركند بصلصة زبدة فانيليا بيمبا، واختزالات التمر الهندي وحلويات الماراكويا الاستوائية.',
      signatureDishes: [
        {
          name: 'كركند البحر المسلوق بالزبدة وفانيليا بيمبا العطرية',
          description: 'لحم كركند حلو مسلوق برفق في الزبدة المصفاة ومعطر بقرون فانيليا بيمبا الفاخرة مع مهروس البطاطا الحلوة.',
        },
        {
          name: 'صدر بط مشوي بصوص التمر الهندي والكركديه',
          description: 'صدر بط مقرمش مطهو بدرجة وردية مع صوص زهور الكركديه الحامض، وجزر صغير مشوي ومهروس الكسافا المتبل.',
        },
        {
          name: 'فوندان شوكولاتة فالرونا مع هيل زنجبار الأخضر',
          description: 'كيك الشوكولاتة الداكنة 70% الذائبة والمعطرة بحبات الهيل الأخضر، مع آيس كريم حليب جوز الهند المنزلي.',
        },
      ],
    },
    beverages: {
      name: 'المشروبات، والعصائر الاستوائية المنعشة',
      tabLabel: 'المشروبات',
      subtitle: 'أرقى أنواع المشروبات، العصائر المعصورة على البارد والمياه النقية',
      description: 'برنامج مشروبات متكامل للاسترخاء الاستوائي: عصائر طازجة مستخلصة من فواكه زنجبار الغنية، ومشروبات الأعشاب المنعشة المحضرة منزلياً ومياه الينابيع الباردة.',
      signatureDishes: [
        {
          name: 'مجموعة المشروبات العالمية الفاخرة',
          description: 'تشكيلة راقية من أرقى المنتجات العالمية المنتقاة بعناية لترضي كافة الأذواق في أجواء الجزيرة الساحرة.',
        },
        {
          name: 'عصائر فواكه زنجبار الاستوائية الطازجة',
          description: 'ماراكويا مشبعة بالشمس، ومانجو ألفونسو الحلو، وأناناس بالنعناع الأخضر، وماء جوز الهند الطازج من البساتين.',
        },
        {
          name: 'صودا الأعشاب الطبيعية والزنجبيل المنزلي',
          description: 'مشروب الزنجبيل المنزلي الحار مع عشب الليمون الطازج، وعصير الكركديه التنزاني الفوار ومشروبات مثلجة منعشة.',
        },
        {
          name: 'مياه الينابيع المعدنية النقية',
          description: 'مياه ينابيع طبيعية وغازية تقدم باردة مع شرائح الخيار الطازج وليمون ماكوندوتشي الأخضر العطري.',
        },
      ],
    },
  },

  zh: {
    local: {
      name: '正宗斯瓦希里传统飨宴',
      tabLabel: '斯瓦希里',
      subtitle: '历史风味与桑给巴尔特色香料',
      description: '数百年阿拉伯、波斯、印度与东非的海上贸易在桑给巴尔沿海厨房中交相辉映。行政主厨运用新鲜手榨椰奶、芳香豆蔻、彭巴岛优质丁香与刚出水的鲜活海鲜，呈现世代传承的传统滋味。',
      signatureDishes: [
        {
          name: '椰香姜黄桑给巴尔珊瑚红鲷鱼',
          description: '野生海捕红鲷鱼轻煎后，慢火煨入鲜芫荽、手工研磨姜黄与海边新鲜手榨浓郁椰奶，配以金黄藏红花香米饭。',
        },
        {
          name: '坦桑尼亚传统 Urojo 煨黑虎虾浓汤',
          description: '酸爽开胃的慢炖芒果酸角热汤，搭配弹嫩海捕黑虎虾、香酥木薯脆片与手捣辣椒椰子风味辣酱。',
        },
        {
          name: '皮劳香料慢炖至尊羔羊肉',
          description: '入口即化的本地鲜嫩羔羊肉，融合八角茴香、肉桂树皮与黑豆蔻芳香，佐以清新腌渍卡丘姆巴里番茄洋葱沙拉。',
        },
      ],
    },
    arabic: {
      name: '正宗阿拉伯与阿曼王室风情料理',
      tabLabel: '阿拉伯',
      subtitle: '阿曼王室传承、传统泥炉炭火烤肉与中东精选冷热前菜 (Mezze)',
      description: '向桑给巴尔数百年阿曼王室渊源与古阿拉伯海上丝绸之路致敬。细品慢炖香料鲜肉、泥炉手作现烤扁面包、精致冷热开胃前菜，以及主厨巧手烹制的大马士革玫瑰水甜点。',
      signatureDishes: [
        {
          name: '阿曼传统舒瓦 (Shuwa) 24小时慢烤香料羊肉',
          description: '严选鲜嫩羊肉，裹以丁香、小豆蔻、香菜籽、干青柠与芭蕉叶，慢火焖烤整整24小时，铺于金黄藏红花卡布萨香米饭之上。',
        },
        {
          name: '王室甄选 Mezze 拼盘与现烤扎塔尔 (Za’atar) 扁面包',
          description: '淋有红石榴珍珠的天鹅绒鹰嘴豆泥、烟熏茄子泥 (Mutabal)、香脆中东炸鹰嘴豆丸子与现出炉手工阿拉伯扁面包。',
        },
        {
          name: '炭烤 Mashwi 豪华海鲜拼盘配焦香青柠',
          description: '梅奈湾野生大明虾、鲜鱿鱼与当日海钓珊瑚礁鲜鱼，撒上阿勒颇辣椒、野生漆树果粉、大蒜与地中海香草炭火炙烤。',
        },
        {
          name: '温热开心果巴克拉瓦千层酥与大马士革玫瑰布丁',
          description: '层层酥脆的菲洛油酥皮裹满香烤开心果与橙花豆蔻糖浆，佐以冰镇大马士革玫瑰纯露牛奶布丁。',
        },
      ],
    },
    western: {
      name: '现代极简西方当代精致餐饮',
      tabLabel: '西式',
      subtitle: '国际顶级标准与一丝不苟的烹饪匠心',
      description: '为追求国际品位并注重舒享美食的贵宾打造：严选进口顶级牛肉部位、新鲜地中海风味沙拉、手工每日现制意式面条，以及精雕细琢的法式奢享甜点。',
      signatureDishes: [
        {
          name: '特选和牛牛柳配黑松露浓郁肉汁',
          description: '炭火炙烤锁住鲜美汁水，搭配如丝般顺滑的欧洲防风草泥、油封藤蔓小番茄与耗时24小时慢熬浓缩红酒牛肉原汁。',
        },
        {
          name: '野生黄鳍金枪鱼塔塔配哈斯牛油果',
          description: '当日延绳海捕黄鳍金枪鱼手工切粒，佐以哈斯优质牛油果、初榨冷压特级橄榄油、酸豆与自焙酸种脆片。',
        },
        {
          name: '纯手工现擀细扁意面 (Tagliolini) 配岩石龙虾',
          description: '新鲜鸡蛋手工面裹着基济姆卡齐野生岩石龙虾尾、油封甜蒜、樱桃番茄与轻盈甘甜的灰皮诺干白龙虾浓汤。',
        },
      ],
    },
    fusion: {
      name: '斯瓦希里风土与当代法式 Haute Cuisine 融合创新',
      tabLabel: '创意融合',
      subtitle: '热带海岛奇珍香料与法式殿堂级烹饪艺术的美妙碰撞',
      description: '我们引以为傲的招牌料理。法国古典料理技艺与桑给巴尔非凡香料风土的跨时空对话：彭巴岛香草荚浸润龙虾黄油、酸角浓汁、热带百香果舒芙蕾等神妙搭配。',
      signatureDishes: [
        {
          name: '彭巴岛原生香草黄油浸煮岩石龙虾',
          description: '鲜甜多汁的岩石龙虾，在浸润了彭巴岛天然香草荚的法国澄清黄油中慢火浸熟，配以红薯丝绒乳化酱与海芦笋。',
        },
        {
          name: '香煎脆皮法式鸭胸配酸角与洛神花浓汁',
          description: '法式七分熟香脆鸭胸，淋上微酸甘美的洛神花果酸角糖浆，佐以焦糖嫩胡萝卜与特调香料木薯泥。',
        },
        {
          name: '法国法芙娜 (Valrhona) 黑巧与桑给巴尔绿豆蔻熔岩蛋糕',
          description: '70%顶级纯黑巧熔岩爆浆，融入青豆蔻天然清幽香气，配主厨手作纯椰奶冰淇淋与现榨百香果酸甜淋酱。',
        },
      ],
    },
    beverages: {
      name: '名庄酒窖、热带纯榨果汁与精致软饮',
      tabLabel: '精致酒饮',
      subtitle: '名庄典藏佳酿、纯天然冷压热带果汁与纯净天然矿泉水',
      description: '为赤道热带度假量身定制的高品位酒饮清单：世界名庄佳酿、桑给巴尔当地庄园每日鲜榨纯正热带冷压果汁、手工精酿草本气泡水与高端泉水。',
      signatureDishes: [
        {
          name: '特选酒窖珍藏佳酿与法国香槟',
          description: '涵盖新旧世界经典产区，清冽爽朗的南非白诗南与长相思、优雅尊贵的法国干邑与香槟，以及托斯卡纳与波尔多名庄红葡萄酒。',
        },
        {
          name: '桑给巴尔纯正热带冷压原汁',
          description: '自然阳光成熟百香果原汁、纯甜阿方索芒果汁、薄荷鲜凤梨汁，以及从棕榈树上采摘的清凉国王椰子水。',
        },
        {
          name: '手作天然草本气泡苏打与精酿汤力水',
          description: '主厨手工自酿新鲜柠檬草生姜汁干姜水、坦桑尼亚洛神花气泡冰饮，以及经典草本冰镇软饮。',
        },
        {
          name: '高山优质天然矿泉水',
          description: '提供欧洲与东非高品质气泡水与纯净水，冰镇上桌，配以新鲜有机黄瓜片与马昆杜奇新鲜青柠。',
        },
      ],
    },
  },
};

type DiningDish = DiningCategory['signatureDishes'][number];

/**
 * Dishes are matched by position against the built-in dishes of the same category.
 * Extra CMS dish fields (price, dietary, visible, ...) are passed through untouched.
 * An explicitly empty CMS list stays empty (the admin removed every dish); only a missing list falls back.
 */
const localizeDishes = (
  cmsDishes: DiningDish[] | undefined,
  seedDishes: DiningDish[] | undefined,
  enDishes: DiningDish[] | undefined,
  locDishes: DiningDish[] | undefined
): DiningDish[] => {
  const localized = locDishes && locDishes.length > 0 ? locDishes : undefined;
  if (!cmsDishes) return localized || seedDishes || [];
  return cmsDishes.map((dish, i) => ({
    ...dish,
    name: localizeUnlessEdited(dish.name, seedDishes?.[i]?.name, enDishes?.[i]?.name, localized?.[i]?.name),
    description: localizeUnlessEdited(
      dish.description,
      seedDishes?.[i]?.description,
      enDishes?.[i]?.description,
      localized?.[i]?.description
    ),
  }));
};

export function getLocalizedDining(lang: Language, baseCategories: DiningCategory[] = DINING_CATEGORIES): DiningCategory[] {
  const translations = DINING_TRANSLATIONS[lang] || DINING_TRANSLATIONS.en;

  return baseCategories.map((cat) => {
    const loc = translations[cat.id];
    if (!loc) return cat;
    const seed = DINING_CATEGORIES.find((c) => c.id === cat.id);
    const en = DINING_TRANSLATIONS.en[cat.id];
    const pick = (field: 'name' | 'tabLabel' | 'subtitle' | 'description') =>
      localizeUnlessEdited(cat[field], seed?.[field], en?.[field], loc[field]);

    return {
      ...cat,
      name: pick('name'),
      tabLabel: pick('tabLabel'),
      subtitle: pick('subtitle'),
      description: pick('description'),
      signatureDishes: localizeDishes(cat.signatureDishes, seed?.signatureDishes, en?.signatureDishes, loc.signatureDishes),
    };
  });
}
