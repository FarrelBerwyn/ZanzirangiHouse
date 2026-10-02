import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, BookOpen, Leaf, Sun, Sunset, Moon, Coffee, HeartHandshake, X } from 'lucide-react';
import { Language, DiningCategory } from '../types';
import { getLocalizedDining } from '../data/diningTranslations';
import { DINING_CATEGORIES } from '../data/dining';
import { localizeUnlessEdited } from '../data/homeSectionsCms';
import { TRANSLATIONS } from '../data/translations';
import { ScrollFadeContainer } from './ScrollFadeContainer';
import { ScrollReveal, StaggerContainer, StaggerItem } from './ScrollReveal';

import { DiningConfigModel } from '../services/contentApi';

interface DiningSectionProps {
  currentLang: Language;
  dynamicConfig?: DiningConfigModel | null;
}

/** A dish as rendered: built-in dishes only have name/description; CMS dishes may add price, dietary and visible. */
type DishView = DiningCategory['signatureDishes'][number] & { price?: string; dietary?: string; visible?: boolean };

const DEFAULT_GARDEN_IMAGE =
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85';

/** Truncated placeholders the server returns when a column is empty — never shown, always replaced by built-in text. */
const SERVER_PLACEHOLDERS: Partial<Record<string, string>> = {
  intro: 'Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables.',
  gardenDesc: 'Tucked within the grounds of Zanzirangi House is our private botanical garden...',
};

/** English values seeded into the database for untouched fields; other languages show their own translation instead. */
const SEEDED_ENGLISH: Partial<Record<string, string>> = {
  heading: 'TASTE ZANZIBAR',
  subhead: '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
};

export const DiningSection: React.FC<DiningSectionProps> = ({ currentLang, dynamicConfig }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  // CMS categories/dishes win; built-in translations only fill fields still at their English default.
  // Empty fields of built-in categories are left blank so getLocalizedDining fills them per language.
  // Dishes are localized before hidden ones are removed so positions still line up with the built-in dishes.
  const cmsCategories = (dynamicConfig?.categories || []).filter((c) => c && c.visible !== false);
  const localizedCategories: DiningCategory[] = (
    cmsCategories.length > 0
      ? getLocalizedDining(
          currentLang,
          [...cmsCategories]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((c) => {
              const seed = DINING_CATEGORIES.find((s) => s.id === c.id);
              const dishes: DishView[] = (c.signatureDishes || []).map((d) => ({
                name: d.name || '',
                description: d.description || '',
                price: d.price || '',
                dietary: d.dietary || '',
                visible: d.visible,
              }));
              return {
                id: c.id,
                name: c.name || '',
                tabLabel: c.tabLabel || (seed ? '' : c.name || ''),
                subtitle: c.subtitle || '',
                description: c.description || '',
                image: c.imageUrl || seed?.image || '',
                signatureDishes: dishes,
              };
            })
        )
      : getLocalizedDining(currentLang)
  ).map((cat) => ({
    ...cat,
    signatureDishes: (cat.signatureDishes as DishView[]).filter((d) => d.visible !== false),
  }));
  const currentCategory = localizedCategories[activeCategoryIndex] || localizedCategories[0];

  const diningUi: Record<
    Language,
    {
      eyebrow: string;
      heading: string;
      subhead: string;
      intro: string;
      gardenEyebrow: string;
      gardenBadge: string;
      gardenTitle: string;
      gardenDesc: string;
      tagZeroMiles: string;
      tagSpices: string;
      tagSeafood: string;
      momentsEyebrow: string;
      momentsTitle: string;
      heritageEyebrow: string;
      heritageTitle: string;
      featuredDishes: string;
      exploreMenuBtn: string;
      modalEyebrow: string;
      modalTitle: string;
      modalClose: string;
      aLaCarte: string;
      dietaryNote: string;
      moments: Array<{ title: string; time: string; desc: string }>;
    }
  > = {
    en: {
      eyebrow: 'Gastronomic Soul',
      // Always the English strings: this entry is the baseline used to detect unedited CMS text.
      heading: TRANSLATIONS.en.dining.heading || 'TASTE ZANZIBAR',
      subhead: TRANSLATIONS.en.dining.subhead || '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
      intro:
        'Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables. From line-caught fish brought ashore at sunrise to slow-simmered aromatic curries, dining at Zanzirangi House is an authentic sensory journey.',
      gardenEyebrow: 'Culinary Storytelling',
      gardenBadge: 'Estate Garden',
      gardenTitle: 'FROM OUR GARDEN TO YOUR TABLE',
      gardenDesc:
        'Tucked within the grounds of Zanzirangi House is our private botanical garden, where our kitchen team cultivates organic lemongrass, green chilies, wild basil, sweet mint, fragrant cardamom, and seasonal vegetables. What is harvested in the morning directly shapes our daily tasting menus, pairing earth-grown vitality with the fresh catch of southern Zanzibar’s waters.',
      tagZeroMiles: '🌱 Zero Food Miles',
      tagSpices: '🌶 Hand-Picked Daily Spices',
      tagSeafood: '🐟 Sustainable Coastal Seafood',
      momentsEyebrow: 'Curated Meal Services',
      momentsTitle: 'Dining Throughout the Day',
      heritageEyebrow: 'Culinary Heritage',
      heritageTitle: 'Signature Tasting Portfolios',
      featuredDishes: 'Featured Dishes:',
      exploreMenuBtn: 'EXPLORE COMPLETE MENU',
      modalEyebrow: 'Zanzirangi House Dining',
      modalTitle: 'Seasonal Tasting Portfolio',
      modalClose: '✕ Close',
      aLaCarte: 'A La Carte',
      dietaryNote:
        'Special dietary preferences, Halal, Vegan, and Private Beach Dining can be orchestrated directly with our Executive Chef.',
      moments: [
        {
          title: 'Artisanal Breakfast',
          time: '07:00 – 10:30 AM',
          desc: 'Tropical papaya, passion fruit curds, warm freshly-baked brioche, and spiced Tanzanian coffee served overlooking the morning ocean.',
        },
        {
          title: 'Barefoot Coastal Lunch',
          time: '12:30 – 03:30 PM',
          desc: 'Line-caught yellowfin tuna tartare, rock lobster salads, wood-fired flatbreads, and young King coconut water under the palms.',
        },
        {
          title: 'Sunset Tapas & Taarab',
          time: '05:30 – 07:00 PM',
          desc: 'Crisp plantain crisps, spiced tamarind prawns, cellar wines, and handcrafted botanical cocktails as the ocean horizon turns violet.',
        },
        {
          title: 'Candlelit Dinner',
          time: '07:30 – 10:30 PM',
          desc: 'Slow-simmered Zanzibari coconut curries, Omani spiced braised lamb, and Valrhona chocolate cardamom fondants.',
        },
        {
          title: 'The Restaurant',
          time: 'Open Daily',
          desc: 'Open-air makuti thatched dining pavilion capturing the cool cross-breezes of Menai Bay.',
        },
        {
          title: 'Private Beach Dining',
          time: 'On Request',
          desc: 'Exclusive barefoot table set on the white sand illuminated by lanterns, featuring a customized tasting menu orchestrated by our head chef.',
        },
      ],
    },
    fr: {
      eyebrow: 'Âme Gastronomique',
      heading: t.dining.heading || 'SAVEURS DE ZANZIBAR',
      subhead: t.dining.subhead || '"Ingrédients frais, saveurs insulaires et hospitalité tanzanienne authentique."',
      intro:
        'Des siècles de commerce maritime swahili, omanais et de l’Océan Indien se rencontrent à nos tables. Du poisson frais débarqué à l’aube aux currys mijotés, dîner à Zanzirangi House est une véritable odyssée sensorielle.',
      gardenEyebrow: 'Philosophie Culinaire',
      gardenBadge: 'Jardin du Domaine',
      gardenTitle: 'DE NOTRE JARDIN À VOTRE TABLE',
      gardenDesc:
        'Niché au cœur de Zanzirangi House, notre potager biologique produit citronnelle fraîche, piments doux, basilic sauvage, menthe et cardamome. Récoltés à l’aube, ces trésors aromatiques enrichissent nos créations quotidiennes et subliment la pêche côtière locale.',
      tagZeroMiles: '🌱 Circuit Ultra-Court',
      tagSpices: '🌶 Épices Cueillies du Jour',
      tagSeafood: '🐟 Pêche Côtière Durable',
      momentsEyebrow: 'Services de Repas',
      momentsTitle: 'La Gastronomie au Fil du Jour',
      heritageEyebrow: 'Héritage Culinaire',
      heritageTitle: 'Portefeuilles de Dégustation Signature',
      featuredDishes: 'Plats Emblématiques :',
      exploreMenuBtn: 'DÉCOUVRIR LE MENU COMPLET',
      modalEyebrow: 'Restauration Zanzirangi House',
      modalTitle: 'Menu de Dégustation Saisonnier',
      modalClose: '✕ Fermer',
      aLaCarte: 'À la Carte',
      dietaryNote:
        'Menus diététiques, Halal, Végétalien et dîners privés sur la plage organisés sur mesure avec notre Chef Exécutif.',
      moments: [
        {
          title: 'Petit-Déjeuner Artisanal',
          time: '07:00 – 10:30',
          desc: 'Papayes sucrées, crème de fruit de la passion, brioches chaudes et café tanzanien face aux premières lueurs de l’océan.',
        },
        {
          title: 'Déjeuner Côtier Pieds Nus',
          time: '12:30 – 15:30',
          desc: 'Tartare de thon jaune pêché du matin, salade de langouste des récifs, galettes au feu de bois et eau de coco fraîche.',
        },
        {
          title: 'Tapas au Crépuscule & Taarab',
          time: '17:30 – 19:00',
          desc: 'Chips de bananes plantains, gambas au tamarin épicé, vins de réserve et cocktails botaniques au coucher du soleil.',
        },
        {
          title: 'Dîner aux Chandelles',
          time: '19:30 – 22:30',
          desc: 'Currys swahilis mijotés au lait de coco, agneau confit aux épices d’Oman et fondant au chocolat Valrhona à la cardamome.',
        },
        {
          title: 'Le Restaurant Principal',
          time: 'Ouvert Tous les Jours',
          desc: 'Pavillon ouvert sous toiture traditionnelle en makuti baigné par la douce brise marine de la baie de Menai.',
        },
        {
          title: 'Dîner Privé sur la Plage',
          time: 'Sur Demande',
          desc: 'Table exclusive dressée sur le sable fin à la lueur des lanternes, avec menu dégustation personnalisé orchestré par notre chef.',
        },
      ],
    },
    sw: {
      eyebrow: 'Ladha ya Visiwani',
      heading: t.dining.heading || 'ONJA LADHA YA ZANZIBAR',
      subhead: t.dining.subhead || '"Viungo asilia, ladha za visiwani na ukarimu wa dhati wa Kitanzania."',
      intro:
        'Mamia ya miaka ya biashara ya bahari ya Waswahili, Waomani na Bahari ya Hindi yanakutana mezani petu. Kuanzia samaki wabichi wa alfajiri hadi mchuzi uliokolezwa viungo asilia.',
      gardenEyebrow: 'Hadithi ya Mapishi',
      gardenBadge: 'Bustani ya Hoteli',
      gardenTitle: 'KUTOKA BUSTANINI MOJA KWA MOJA MEZANI',
      gardenDesc:
        'Katikati ya ardhi ya Zanzirangi House kuna bustani yetu ya asili, ambapo wapishi wetu hulima mchaichai, pilipili mbuzi, rihani, mnanaa na iliki. Mavuno ya asubuhi hutengeneza chakula kizuri chenye lishe na ladha adimu.',
      tagZeroMiles: '🌱 Kilimo cha Hapa Hapa',
      tagSpices: '🌶 Viungo Vilivyochumwa Leo',
      tagSeafood: '🐟 Dagaa na Samaki wa Baharini',
      momentsEyebrow: 'Huduma za Chakula',
      momentsTitle: 'Chakula Katika Masaa ya Siku',
      heritageEyebrow: 'Urithi wa Mapishi',
      heritageTitle: 'Aina Maalum za Mapishi Yetu',
      featuredDishes: 'Vyakula Maarufu:',
      exploreMenuBtn: 'TAZAMA MENU KAMILI',
      modalEyebrow: 'Mapishi ya Zanzirangi House',
      modalTitle: 'Menu Maalum ya Msimu',
      modalClose: '✕ Funga',
      aLaCarte: 'Chakula cha Kuagiza',
      dietaryNote:
        'Mahitaji maalum ya chakula, Halal, Mboga tupu (Vegan), na chakula cha jioni ufukweni binafsi huandaliwa moja kwa moja na Mpishi Mkuu.',
      moments: [
        {
          title: 'Kiamsha Kinywa cha Asili',
          time: 'Saa 1:00 – 4:30 Asubuhi',
          desc: 'Papai bichi, sharubati ya pasheni, mikate ya moto na kahawa ya viungo ya Kitanzania ukiiangalia bahari asubuhi.',
        },
        {
          title: 'Chakula cha Mchana Ufukweni',
          time: 'Saa 6:30 – 9:30 Mchana',
          desc: 'Samaki aina ya jodari aliyevuliwa leo, saladi ya kamba, mikate ya kuoka motoni na dafu baridi chini ya minazi.',
        },
        {
          title: 'Vitafunwa vya Machweo & Taarab',
          time: 'Saa 11:30 Jioni – 1:00 Usiku',
          desc: 'Ndizi za kukaanga, kamba wa ukwaju wenye viungo, vinywaji adimu huku jua likizama baharini.',
        },
        {
          title: 'Chakula cha Usiku Chenye Mishumaa',
          time: 'Saa 1:30 – 4:30 Usiku',
          desc: 'Rosti ya nazi ya Kizanzibari, nyama laini yenye viungo vya Kiarabu, na keki ya chokoleti yenye iliki.',
        },
        {
          title: 'Mkahawa Mkuu',
          time: 'Wazi Kila Siku',
          desc: 'Kibanda kikubwa chenye paa la makuti na upepo mwanana kutoka Ghuba ya Menai.',
        },
        {
          title: 'Chakula Binafsi Ufukweni',
          time: 'Kwa Maombi Maalum',
          desc: 'Meza ya kipekee mchangani iliyoangaziwa na taa za kale, pamoja na mapishi maalum ya mpishi mkuu.',
        },
      ],
    },
    es: {
      eyebrow: 'Alma Gastronómica',
      heading: t.dining.heading || 'SABORES DE ZANZÍBAR',
      subhead: t.dining.subhead || '"Ingredientes frescos, esencias isleñas y auténtica hospitalidad tanzana."',
      intro:
        'Siglos de rutas marítimas suajilis, omaníes y del Océano Índico se funden en nuestras mesas. Desde el pescado fresco del amanecer hasta los aromáticos curris cocinados a fuego lento.',
      gardenEyebrow: 'Historia Culinaria',
      gardenBadge: 'Huerto de la Finca',
      gardenTitle: 'DE NUESTRO HUERTO DIRECTO A SU MESA',
      gardenDesc:
        'En los jardines de Zanzirangi House cultivamos citronela, albahaca silvestre, menta, cardamomo y chiles frescos. Lo que se cosecha cada mañana da vida a nuestros menús degustación.',
      tagZeroMiles: '🌱 Cero Huella de Transporte',
      tagSpices: '🌶 Especias Frescas del Día',
      tagSeafood: '🐟 Pesca Costera Sostenible',
      momentsEyebrow: 'Servicios Culinarios',
      momentsTitle: 'Gastronomía a lo Largo del Día',
      heritageEyebrow: 'Herencia Culinaria',
      heritageTitle: 'Colección de Degustación',
      featuredDishes: 'Platos Destacados:',
      exploreMenuBtn: 'VER MENÚ COMPLETO',
      modalEyebrow: 'Gastronomía Zanzirangi House',
      modalTitle: 'Menú de Temporada',
      modalClose: '✕ Cerrar',
      aLaCarte: 'A la Carta',
      dietaryNote:
        'Preferencias dietéticas especiales, Halal, Vegano y Cenas privadas en la playa coordinadas directamente con nuestro Chef Ejecutivo.',
      moments: [
        {
          title: 'Desayuno Artesanal',
          time: '07:00 – 10:30',
          desc: 'Papaya tropical, maracuyá fresco, brioches calientes y café tanzano especiado con vistas al océano matutino.',
        },
        {
          title: 'Almuerzo Descalzo en la Costa',
          time: '12:30 – 15:30',
          desc: 'Tartar de atún aleta amarilla fresco, ensalada de langosta de roca, panes al fuego de leña y agua de coco tierno.',
        },
        {
          title: 'Tapas al Atardecer & Taarab',
          time: '17:30 – 19:00',
          desc: 'Crujientes de plátano macho, langostinos al tamarindo, vinos seleccionados y cócteles botánicos al caer la tarde.',
        },
        {
          title: 'Cena a la Luz de las Velas',
          time: '19:30 – 22:30',
          desc: 'Curris de coco al estilo zanzibarí, cordero braseado con especias omaníes y coulant de chocolate con cardamomo.',
        },
        {
          title: 'El Restaurante Principal',
          time: 'Abierto Diariamente',
          desc: 'Pabellón abierto con techumbre de makuti tradicional que recibe las brisas frescas de la bahía de Menai.',
        },
        {
          title: 'Cena Privada en la Playa',
          time: 'Bajo Petición',
          desc: 'Mesa exclusiva sobre la arena blanca iluminada por farolillos, con menú degustación creado por nuestro chef ejecutivo.',
        },
      ],
    },
    it: {
      eyebrow: 'Anima Gastronomica',
      heading: t.dining.heading || 'SAPORI DI ZANZIBAR',
      subhead: t.dining.subhead || '"Ingredienti freschi, sapori isolani e autentica ospitalità tanzaniana."',
      intro:
        'Secoli di rotte marittime swahili, omanite e dell’Oceano Indiano si incontrano nei nostri piatti. Dal pesce fresco dell’alba ai curry speziati cotti a fuoco lento.',
      gardenEyebrow: 'Narrazione Culinaria',
      gardenBadge: 'Orto della Tenuta',
      gardenTitle: 'DAL NOSTRO ORTO ALLA VOSTRA TAVOLA',
      gardenDesc:
        'All’interno della tenuta di Zanzirangi House coltiviamo citronella, basilico selvatico, menta, peperoncini e cardamomo. Raccolti ogni mattina, compongono le nostre degustazioni del giorno.',
      tagZeroMiles: '🌱 Chilometro Zero',
      tagSpices: '🌶 Spezie Raccolte al Mattino',
      tagSeafood: '🐟 Pescato Locale Sostenibile',
      momentsEyebrow: 'Ristorazione Esclusiva',
      momentsTitle: 'Esperienze Gastronomiche della Giornata',
      heritageEyebrow: 'Tradizione Culinaria',
      heritageTitle: 'Portfolio di Degustazione Signature',
      featuredDishes: 'Piatti Iconici:',
      exploreMenuBtn: 'SCOPRI IL MENU COMPLETO',
      modalEyebrow: 'Ristorazione Zanzirangi House',
      modalTitle: 'Menu Degustazione Stagionale',
      modalClose: '✕ Chiudi',
      aLaCarte: 'À la Carte',
      dietaryNote:
        'Esigenze alimentari speciali, Halal, Vegane e Cene private sulla spiaggia concordabili direttamente con il nostro Executive Chef.',
      moments: [
        {
          title: 'Colazione Artigianale',
          time: '07:00 – 10:30',
          desc: 'Papaya fresca, curd al frutto della passione, brioche fragranti e caffè speziato tanzaniano affacciati sull’oceano.',
        },
        {
          title: 'Pranzo a Piedi Nudi sulla Spiaggia',
          time: '12:30 – 15:30',
          desc: 'Tartare di tonno pinna gialla freschissimo, insalata d’aragosta, focacce cotte a legna e noce di cocco fresca.',
        },
        {
          title: 'Tapas al Tramonto & Taarab',
          time: '17:30 – 19:00',
          desc: 'Chips di platano croccanti, gamberi speziati al tamarindo, vini selezionati e cocktail botanici al calar del sole.',
        },
        {
          title: 'Cena a Lume di Candela',
          time: '19:30 – 22:30',
          desc: 'Curry zanzibarino al latte di cocco, agnello brasato con spezie omanite e tortino al cioccolato e cardamomo.',
        },
        {
          title: 'Il Ristorante',
          time: 'Aperto Tutti i Giorni',
          desc: 'Padiglione all’aperto con tetto in makuti accarezzato dalle brezze marine della baia di Menai.',
        },
        {
          title: 'Cena Privata sulla Spiaggia',
          time: 'Su Richiesta',
          desc: 'Tavolo esclusivo sulla sabbia bianca illuminato da lanterne, con menu degustazione personalizzato dal nostro chef.',
        },
      ],
    },
    pl: {
      eyebrow: 'Dusza Gastronomii',
      heading: t.dining.heading || 'SMAKI ZANZIBARU',
      subhead: t.dining.subhead || '"Świeże składniki, wyspiarskie aromaty i autentyczna tanzańska gościnność."',
      intro:
        'Stulecia morskiego handlu suahili, omańskiego i basenu Oceanu Indyjskiego spotykają się na naszych stołach. Od świeżej ryby z porannego połowu po wolno duszona aromatyczne curry.',
      gardenEyebrow: 'Opowieść Kulinarna',
      gardenBadge: 'Ogród Posiadłości',
      gardenTitle: 'Z NASZEGO OGRODU PROSTO NA TWÓJ STÓŁ',
      gardenDesc:
        'Na terenie Zanzirangi House uprawiamy organiczną trawę cytrynową, papryczki chili, dziką bazylię, miętę i kardamon. Poranne zbiory tworzą nasze codzienne menu degustacyjne.',
      tagZeroMiles: '🌱 Zero Kilometrów Żywności',
      tagSpices: '🌶 Świeżo Zerwane Przyprawy',
      tagSeafood: '🐟 Zrównoważone Owoce Morza',
      momentsEyebrow: 'Posiłki Dnia',
      momentsTitle: 'Kulinaria o Każdej Porze Dnia',
      heritageEyebrow: 'Dziedzictwo Kulinarne',
      heritageTitle: 'Autorskie Zestawy Degustacyjne',
      featuredDishes: 'Dania Pokazowe:',
      exploreMenuBtn: 'ZOBACZ PEŁNE MENU',
      modalEyebrow: 'Kuchnia Zanzirangi House',
      modalTitle: 'Sezonowe Menu Degustacyjne',
      modalClose: '✕ Zamknij',
      aLaCarte: 'A La Carte',
      dietaryNote:
        'Specjalne preferencje dietetyczne, Halal, Wegańskie oraz prywatne kolacje na plaży ustalane są bezpośrednio z Szefem Kuchni.',
      moments: [
        {
          title: 'Rzemieślnicze Śniadanie',
          time: '07:00 – 10:30',
          desc: 'Tropikalna papaja, krem z marakui, ciepłe brioszki i tanzańska kawa z przyprawami z widokiem na ocean.',
        },
        {
          title: 'Nadmorski Obiad Na Boso',
          time: '12:30 – 15:30',
          desc: 'Tatar ze świeżo złowionego tuńczyka żółtopłetwego, sałatka z homara, chlebki z pieca opalanego drewnem i woda kokosowa.',
        },
        {
          title: 'Tapas o Zachodzie Słońca & Taarab',
          time: '17:30 – 19:00',
          desc: 'Chrupki z plantanów, krewetki w pikantnym tamaryndowcu, wyborne wina i autorskie koktajle botaniczne.',
        },
        {
          title: 'Kolacja przy Świecach',
          time: '19:30 – 22:30',
          desc: 'Aromatyczne curry z Zanzibaru na mleku kokosowym, duszona jagnięcina z omańskimi przyprawami i fondant z kardamonem.',
        },
        {
          title: 'Główna Restauracja',
          time: 'Otwarte Codziennie',
          desc: 'Otwarty pawilon pod strzechą makuti, chłodzony morską bryzą z Zatoki Menai.',
        },
        {
          title: 'Prywatna Kolacja na Plaży',
          time: 'Na Zamówienie',
          desc: 'Ekskluzywny stół na białym piasku oświetlony lampionami, ze spersonalizowanym menu degustacyjnym.',
        },
      ],
    },
    ar: {
      eyebrow: 'روح الطهي الأصيلة',
      heading: t.dining.heading || 'تذوق أطايب زنجبار',
      subhead: t.dining.subhead || '"مكونات طازجة ونكهات استوائية فريدة وكرم ضيافة تنزاني أصيل."',
      intro:
        'تلتقي قرون من تراث التجارة البحرية السواحلية والعمانية والمحيط الهندي على موائدنا الفاخرة، بدءاً من صيد الصباح الطازج وحتى أطباق الكاري العطرية المطهوة على نار هادئة.',
      gardenEyebrow: 'فلسفة الطهي المزرعي',
      gardenBadge: 'حديقة المنتجع العضوية',
      gardenTitle: 'من حديقتنا الغنّاء إلى مائدتكم مباشرة',
      gardenDesc:
        'في قلب حدائق زانزيرانجي الخاصة، نزرع عشب الليمون العضوي والفلفل الحار والريحان البري والنعناع العطري وحب الهيل، ليتم حصادها فجراً وإعداد قوائم التذوق الفاخرة يومياً.',
      tagZeroMiles: '🌱 منتجات عضوية محلية 100%',
      tagSpices: '🌶 بهارات طازجة مقطوفة يومياً',
      tagSeafood: '🐟 مأكولات بحرية طازجة ومستدامة',
      momentsEyebrow: 'خدمات الطعام اليومية',
      momentsTitle: 'تجارب تناول الطعام على مدار اليوم',
      heritageEyebrow: 'عراقة المطبخ',
      heritageTitle: 'قوائم التذوق الخاصة وحقائب النكهات',
      featuredDishes: 'أطباق مميزة مختارة:',
      exploreMenuBtn: 'استكشف قائمة الطعام الكاملة',
      modalEyebrow: 'مطاعم زانزيرانجي هاوس',
      modalTitle: 'قائمة التذوق الموسمية الفاخرة',
      modalClose: '✕ إغلاق',
      aLaCarte: 'حسب الطلب (أ لا كارت)',
      dietaryNote:
        'الوجبات الغذائية الخاصة، الحلال، النباتية وتجارب العشاء الشاطئي الخاص تُنسق مباشرة مع رئيس الطهاة التنفيذي.',
      moments: [
        {
          title: 'إفطار حرفي فاخر',
          time: '07:00 – 10:30 صباحاً',
          desc: 'بابايا استوائية ناضجة، كاسترد فاكهة العاطفة، بريوش طازج وقهوة تنزانية بالهيل تطل على أمواج المحيط.',
        },
        {
          title: 'غداء ساحلي هادئ',
          time: '12:30 – 03:30 ظهراً',
          desc: 'تارتار تونة الزعنفة الصفراء الطازجة، سلطة الكركند البحري، خبز التنور وماء جوز الهند الطبيعي.',
        },
        {
          title: 'مقبلات الغروب وموسيقى الطرب',
          time: '05:30 – 07:00 مساءً',
          desc: 'رقائق الموز المقرمشة، روبيان التمر الهندي المتبل، ومشروبات الأعشاب المنعشة وقت المغيب.',
        },
        {
          title: 'عشاء شاعري على أضواء الشموع',
          time: '07:30 – 10:30 مساءً',
          desc: 'كاري جوز الهند الزنجباري التقليدي، لحم الحمل المطهو على الطريقة العمانية الفاخرة، وحلوى الشوكولاتة بالهيل.',
        },
        {
          title: 'المطعم الرئيسي الفاخر',
          time: 'مفتوح يومياً',
          desc: 'جناح طعام مفتوح تحت سقف الماكوتي التراثي يستمتع بنسمات خليج ميناي العليلة.',
        },
        {
          title: 'عشاء شاطئي خاص وساحر',
          time: 'عند الطلب المسبق',
          desc: 'طاولة خاصة على الرمال البيضاء المضاءة بالفوانيس مع قائمة تذوق مبتكرة ومعدة خصيصاً من رئيس الطهاة.',
        },
      ],
    },
    zh: {
      eyebrow: '舌尖美学与海岛灵魂',
      heading: t.dining.heading || '品味桑给巴尔',
      subhead: t.dining.subhead || '"纯鲜地道食材、丰富海岛香料与坦桑尼亚真挚礼遇."',
      intro:
        '数百年斯瓦希里、阿曼苏丹王朝与印度洋远航贸易的香料精华在我们的餐桌上交汇。从拂晓时分渔船直达的新鲜渔获，到慢火煲煨的浓郁海岛咖喱，开启一场沉浸式味蕾航程。',
      gardenEyebrow: '庄园风味故事',
      gardenBadge: '庄园私属有机花园',
      gardenTitle: '从有机花园直抵尊崇餐桌',
      gardenDesc:
        '在 Zanzirangi House 园林深处，主厨团队悉心培植有机柠檬草、青红椒、野生罗勒、薄荷叶与小豆蔻。清晨摘采的天然芳草直接决定了当天的定制赏味菜单，呈现海陆交织的原生鲜美。',
      tagZeroMiles: '🌱 零碳里程自然有机',
      tagSpices: '🌶 当日手工采摘新鲜香料',
      tagSeafood: '🐟 印度洋可持续生态海钓海鲜',
      momentsEyebrow: '全天候餐饮时刻',
      momentsTitle: '朝夕之间 · 专属美馔时光',
      heritageEyebrow: '传奇风味传承',
      heritageTitle: '主厨典藏赏味名录',
      featuredDishes: '主厨特色美馔：',
      exploreMenuBtn: '探索完整赏味菜单',
      modalEyebrow: 'Zanzirangi House 尊享餐饮',
      modalTitle: '时令臻选赏味菜单',
      modalClose: '✕ 关闭',
      aLaCarte: '单点美馔',
      dietaryNote:
        '清真认证、素食偏好、无麸质需求及私人烛光海滩晚宴，皆可由行政总厨为您一对一私属定制。',
      moments: [
        {
          title: '晨光匠心慢享早餐',
          time: '07:00 – 10:30',
          desc: '热带木瓜、百香果凝乳、每日现烤温热法式奶油面包，伴随坦桑尼亚豆蔻手工咖啡俯瞰晨曦海景。',
        },
        {
          title: '海边赤足轻奢午餐',
          time: '12:30 – 15:30',
          desc: '清晨海钓黄鳍金枪鱼塔塔、印度洋岩礁龙虾沙拉、柴火烤饼与现剖鲜甜皇家椰青。',
        },
        {
          title: '日落小食与塔拉布琴乐',
          time: '17:30 – 19:00',
          desc: '香脆大蕉片、慢煨酸角香料大虾、窖藏佳酿与手工调配植物草本特饮，静观海平面染上紫霞。',
        },
        {
          title: '海风星空烛光晚餐',
          time: '19:30 – 22:30',
          desc: '慢炖桑给巴尔醇香椰浆咖喱、阿曼香料烩羊肉与法芙娜小豆蔻熔岩黑巧蛋糕。',
        },
        {
          title: '主厨全日制景观餐厅',
          time: '每日全天开放',
          desc: '传统马库蒂茅草编织露天挑高凉亭，全天候沐浴来自米奈湾的清凉海风。',
        },
        {
          title: '私享海滩星光烛光晚宴',
          time: '需提前私享预约',
          desc: '白色细沙上专设独立灯笼烛光餐台，由行政总厨为您打造专属定制赏味菜单。',
        },
      ],
    },
  };

  if (dynamicConfig?.visible === false) {
    return null;
  }

  const baseUi = diningUi[currentLang] || diningUi.en;
  type UiTextField = Exclude<keyof typeof baseUi, 'moments'> & string;
  const isBlank = (value: string | undefined) => !value || !value.trim();
  // CMS text wins. Built-in per-language text is only used when the CMS value is empty, a server placeholder,
  // or (for non-English visitors) still equal to the built-in / seeded English default.
  const cmsUi = (cmsValue: string | undefined, field: UiTextField): string => {
    if (isBlank(cmsValue) || cmsValue === SERVER_PLACEHOLDERS[field]) return baseUi[field];
    if (currentLang === 'en') return cmsValue as string;
    return localizeUnlessEdited(cmsValue, SEEDED_ENGLISH[field], diningUi.en[field], baseUi[field]);
  };
  const cmsMomentText = (cmsValue: string | undefined, englishDefault: string | undefined, localized: string | undefined) => {
    if (isBlank(cmsValue)) return localized || '';
    if (currentLang === 'en') return cmsValue as string;
    return localizeUnlessEdited(cmsValue, undefined, englishDefault, localized);
  };
  const cmsMoments = (dynamicConfig?.moments || []).filter(
    (m) => m && (!isBlank(m.title) || !isBlank(m.desc) || !isBlank(m.time))
  );
  const ui = {
    ...baseUi,
    eyebrow: cmsUi(dynamicConfig?.eyebrow, 'eyebrow'),
    heading: cmsUi(dynamicConfig?.heading, 'heading'),
    subhead: cmsUi(dynamicConfig?.subhead, 'subhead'),
    intro: cmsUi(dynamicConfig?.intro, 'intro'),
    gardenEyebrow: cmsUi(dynamicConfig?.gardenEyebrow, 'gardenEyebrow'),
    gardenBadge: cmsUi(dynamicConfig?.gardenBadge, 'gardenBadge'),
    gardenTitle: cmsUi(dynamicConfig?.gardenTitle, 'gardenTitle'),
    gardenDesc: cmsUi(dynamicConfig?.gardenDesc, 'gardenDesc'),
    tagZeroMiles: cmsUi(dynamicConfig?.tagZeroMiles, 'tagZeroMiles'),
    tagSpices: cmsUi(dynamicConfig?.tagSpices, 'tagSpices'),
    tagSeafood: cmsUi(dynamicConfig?.tagSeafood, 'tagSeafood'),
    momentsEyebrow: cmsUi(dynamicConfig?.momentsEyebrow, 'momentsEyebrow'),
    momentsTitle: cmsUi(dynamicConfig?.momentsTitle, 'momentsTitle'),
    heritageEyebrow: cmsUi(dynamicConfig?.heritageEyebrow, 'heritageEyebrow'),
    heritageTitle: cmsUi(dynamicConfig?.heritageTitle, 'heritageTitle'),
    moments: (cmsMoments.length > 0
      ? cmsMoments.map((m, i) => ({
          title: cmsMomentText(m.title, diningUi.en.moments[i]?.title, baseUi.moments[i]?.title),
          time: cmsMomentText(m.time, diningUi.en.moments[i]?.time, baseUi.moments[i]?.time),
          desc: cmsMomentText(m.desc, diningUi.en.moments[i]?.desc, baseUi.moments[i]?.desc),
          image: m.image || '',
        }))
      : baseUi.moments.map((m) => ({ ...m, image: '' }))) as Array<{
      title: string;
      time: string;
      desc: string;
      image: string;
    }>,
  };
  // Optional extras: a second garden paragraph (shown only when set; no built-in translation) and the garden photo.
  const gardenDesc2 = isBlank(dynamicConfig?.gardenDesc2) ? '' : (dynamicConfig?.gardenDesc2 as string);
  const gardenImage = isBlank(dynamicConfig?.gardenImage) ? DEFAULT_GARDEN_IMAGE : (dynamicConfig?.gardenImage as string);

  const momentIcons = [Coffee, Sun, Sunset, Moon, UtensilsCrossed, HeartHandshake];

  return (
    <section id="dining" className="pt-16 sm:pt-20 md:pt-28 pb-10 sm:pb-14 md:pb-20 bg-[#FAF8F5] text-[#1C1B1A]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2.5 text-[11px] tracking-[0.32em] uppercase text-[#A07E54] font-semibold mb-3">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{ui.eyebrow}</span>
          </div>

          <h2
            id="dining-heading"
            className="font-serif text-3xl sm:text-5xl md:text-6xl font-light tracking-[0.04em] uppercase text-[#141413] mb-4"
          >
            {ui.heading}
          </h2>

          <p className="font-serif italic text-xl sm:text-2xl text-[#8E6B40] font-light mb-4">
            {ui.subhead}
          </p>

          <p className="text-[#6B6862] text-sm sm:text-base leading-relaxed">
            {ui.intro}
          </p>
        </ScrollReveal>

        {/* Storytelling Element: FROM OUR GARDEN TO YOUR TABLE */}
        <ScrollReveal delay={0.1} className="bg-[#F4EFE6] border border-[#E7DFD2] rounded-3xl p-8 sm:p-12 mb-20 relative overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
              <img
                src={gardenImage}
                alt={ui.gardenTitle || 'Organic spice garden at Zanzirangi House'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-mono uppercase text-[#C4A27A]">
                {ui.gardenBadge}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center space-x-2 text-[10px] tracking-[0.25em] font-mono uppercase text-[#A07E54]">
                <Leaf className="w-3.5 h-3.5" />
                <span>{ui.gardenEyebrow}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#141413] font-light uppercase">
                {ui.gardenTitle}
              </h3>

              <p className="text-sm md:text-base text-[#55524B] leading-relaxed">
                {ui.gardenDesc}
              </p>

              {gardenDesc2 && (
                <p className="text-sm md:text-base text-[#55524B] leading-relaxed">
                  {gardenDesc2}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 pt-2 text-xs font-mono text-[#8E6B40]">
                <span className="px-3 py-1 bg-white/70 border border-[#E7DFD2] rounded-full">
                  {ui.tagZeroMiles}
                </span>
                <span className="px-3 py-1 bg-white/70 border border-[#E7DFD2] rounded-full">
                  {ui.tagSpices}
                </span>
                <span className="px-3 py-1 bg-white/70 border border-[#E7DFD2] rounded-full">
                  {ui.tagSeafood}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* 6 Dining Offerings Grid */}
        <div className="mb-20">
          <ScrollReveal className="mb-8">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#A07E54] block mb-1">
              {ui.momentsEyebrow}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#141413] font-light uppercase">
              {ui.momentsTitle}
            </h3>
          </ScrollReveal>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {ui.moments.map((m, idx) => {
              const Icon = momentIcons[idx] || UtensilsCrossed;
              return (
                <StaggerItem
                  key={idx}
                  className="bg-[#FAF8F5] border border-[#E7DFD2] rounded-2xl p-7 sm:p-8 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {m.image && (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-5 -mt-1">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#A07E54] group-hover:bg-[#1C1B1A] group-hover:text-[#C4A27A] flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-[#A07E54]">
                        {m.time}
                      </span>
                    </div>

                    <h4 className="font-serif text-xl font-normal text-[#141413] mb-2 group-hover:text-[#A07E54] transition-colors">
                      {m.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-[#55524B] leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Cuisine Tradition Tabs & Signature Dishes */}
        <ScrollReveal delay={0.1} className="bg-[#1C1B1A] text-[#FAF8F5] rounded-3xl p-8 sm:p-12 border border-[#2C2B28] shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#2C2B28]">
            <div>
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#C4A27A] block mb-1">
                {ui.heritageEyebrow}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#FAF8F5]">
                {ui.heritageTitle}
              </h3>
            </div>

            {/* Scrollable Cuisine Categories with Dynamic Left & Right Gradient Transparent Fade */}
            <ScrollFadeContainer
              className="relative w-full md:w-auto max-w-full overflow-hidden"
              scrollClassName="flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1 pr-14 sm:pr-16"
              leftGradientClass="bg-gradient-to-r from-[#1C1B1A] via-[#1C1B1A]/90 to-transparent"
              rightGradientClass="bg-gradient-to-l from-[#1C1B1A] via-[#1C1B1A]/90 to-transparent"
              fadeWidth="w-12 sm:w-16"
            >
              {localizedCategories.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryIndex(idx)}
                  className={`whitespace-nowrap flex-shrink-0 px-4 sm:px-5 py-2 text-xs tracking-[0.16em] uppercase font-semibold rounded-full transition-all duration-300 ${
                    activeCategoryIndex === idx
                      ? 'bg-[#B8966C] text-[#141413] shadow-md'
                      : 'bg-[#22211F] text-[#D8CCB8]/70 hover:bg-[#2C2B28] hover:text-white'
                  }`}
                >
                  {cat.tabLabel || cat.name}
                </button>
              ))}
            </ScrollFadeContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden">
              <img
                key={currentCategory.image}
                src={currentCategory.image}
                alt={currentCategory.name}
                className="w-full h-full object-cover animate-fadeIn"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-mono tracking-widest text-[#C4A27A] uppercase block">
                  {currentCategory.subtitle}
                </span>
                <p className="font-serif text-lg font-light italic">
                  {currentCategory.name}
                </p>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm text-[#D8CCB8] leading-relaxed">
                {currentCategory.description}
              </p>

              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#C4A27A] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{ui.featuredDishes}</span>
                </span>

                {(currentCategory?.signatureDishes || []).slice(0, 3).map((dish, i) => (
                  <div key={i} className="space-y-0.5 border-b border-[#2C2B28]/60 pb-2.5">
                    <p className="font-serif text-base font-normal text-[#FAF8F5]">
                      {dish.name}
                    </p>
                    <p className="text-xs text-[#D8CCB8]/70">
                      {dish.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setMenuModalOpen(true)}
                className="py-3.5 px-6 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-[0.2em] uppercase rounded flex items-center justify-center space-x-2 transition-colors mt-4 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{ui.exploreMenuBtn}</span>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Seasonal Menu Modal */}
      {menuModalOpen && (
        <div
          id="menu-preview-modal"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#E7DFD2] space-y-6 animate-fadeIn my-auto">
            <div className="flex items-center justify-between border-b border-[#E7DFD2] pb-4">
              <div>
                <span className="text-[10px] tracking-[0.2em] font-mono uppercase text-[#A07E54] block">
                  {ui.modalEyebrow}
                </span>
                <h3 className="font-serif text-2xl text-[#141413]">
                  {ui.modalTitle}
                </h3>
              </div>
              <button
                onClick={() => setMenuModalOpen(false)}
                className="text-xs uppercase tracking-wider text-[#6B6862] hover:text-black font-semibold px-2 py-1 cursor-pointer"
              >
                {ui.modalClose}
              </button>
            </div>

            <div className="space-y-6 text-sm text-[#2C2B28] max-h-[60vh] overflow-y-auto pr-2">
              {localizedCategories.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <h4 className="font-serif text-lg font-semibold text-[#A07E54] border-b border-[#E7DFD2]/60 pb-1">
                    {cat.name}
                  </h4>
                  {((cat?.signatureDishes || []) as DishView[]).map((dish, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium text-[#141413]">{dish.name}</p>
                        <p className="text-xs text-[#6B6862]">{dish.description}</p>
                        {dish.dietary && (
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#8E6B40] mt-0.5">
                            {dish.dietary}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[#A07E54] font-semibold whitespace-nowrap">
                        {dish.price || ui.aLaCarte}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F4EFE6] rounded-xl text-xs text-[#6B6862] text-center border border-[#E7DFD2]">
              {ui.dietaryNote}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
