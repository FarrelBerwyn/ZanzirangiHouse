import { Language, Facility } from '../types';
import { FACILITIES_DATA } from './facilities';
import { localizeUnlessEdited } from './homeSectionsCms';

export interface FacilityLocalization {
  title: string;
  category: string;
  description: string;
  hours: string;
  highlight: string;
}

export const FACILITIES_TRANSLATIONS: Record<Language, Record<string, FacilityLocalization>> = {
  en: {
    pool: {
      title: 'Oceanfront Infinity Pool',
      category: 'Relaxation & Wellness',
      description: 'Suspended above the turquoise tides of the Indian Ocean, our 25-meter freshwater infinity pool mirrors the sky and ocean horizons with sunken sunbeds and attentive poolside service.',
      hours: '06:30 – 22:00 Daily',
      highlight: 'Heated freshwater with ocean horizon views',
    },
    dining: {
      title: 'The Tamarind Dining Pavilion',
      category: 'Culinary Arts',
      description: 'An open-air pavilion beneath vaulted Makuti thatch offering panoramic ocean views. Experience fine dining infused with the aromas of Zanzibar spices and the freshest catches of the day.',
      hours: 'Breakfast, Lunch & Dinner',
      highlight: 'Farm-to-table organic produce & fresh daily seafood',
    },
    massage: {
      title: 'Swahili Botanical Spa & Massage',
      category: 'Holistic Wellness',
      description: 'Secluded open-air spa salas nestled in coastal gardens. Indulge in bespoke massages using cold-pressed Zanzibar coconut oil, lemongrass, ground cloves, and indigenous African botanicals.',
      hours: '08:00 – 20:00 by Appointment',
      highlight: 'Authentic Clove & Lemongrass Aromatherapy',
    },
    bbq: {
      title: 'Barefoot Beach BBQ & Firepit',
      category: 'Evening Gathering',
      description: 'As the sun dips into the Indian Ocean, gather around our shoreline firepit for grilled lobster, tiger prawns, and spiced tenderloins cooked over coconut husks under the African constellations.',
      hours: 'Sunset from 18:30',
      highlight: 'Oceanfront candlelit dining with live acoustic Taarab music',
    },
    breakfast: {
      title: 'Artisanal Gourmet Breakfast',
      category: 'Morning Ritual',
      description: 'Awaken to tropical fruit platters from local orchards, freshly baked brioche, passion fruit curd, Tanzanian arabica coffee, and eggs cooked to your preference in your villa or by the sea.',
      hours: '07:00 – 11:00 (In-Villa or Pavilion)',
      highlight: 'Complimentary for all staying guests',
    },
    wifi: {
      title: 'High-Speed Starlink Satellite Wi-Fi',
      category: 'Connectivity',
      description: 'Enjoy blazing-fast, low-latency satellite internet across the entire estate, private villas, beachfront loungers, and dining terraces, ensuring seamless communication and remote productivity.',
      hours: '24/7 Unlimited High Speed',
      highlight: 'Reliable fiber-speed connectivity in every corner',
    },
    minibar: {
      title: 'Curated Organic Mini Bar & Cellar',
      category: 'Private Indulgence',
      description: 'Each villa is stocked with organic kombuchas, pressed baobab nectars, chilled South African wines, artisanal spirits, and local roasted cashew nuts, replenished daily.',
      hours: 'Replenished daily',
      highlight: 'Selected complimentary local beverages included',
    },
    beach: {
      title: 'Private Beach & Marine Sanctuary',
      category: 'Nature & Coastal Access',
      description: 'Step directly onto untouched powdery coral sands with crystal-clear waters sheltered by an offshore barrier reef. Complimentary paddleboards, sea kayaks, and snorkel equipment provided.',
      hours: 'Sunrise to Sunset',
      highlight: 'Private shaded cabanas & crystal lagoon swimming',
    },
    concierge: {
      title: '24/7 Bespoke Butler & Concierge',
      category: 'Personalized Care',
      description: 'From unpacking your luggage and arranging private dhow sunset sails to tailoring dietary preferences and planning safari excursions on the mainland, your personal host is always at hand.',
      hours: '24 Hours Dedicated Support',
      highlight: 'Personalized itinerary curation and seamless service',
    },
  },

  fr: {
    pool: {
      title: 'Piscine à Débordement Front de Mer',
      category: 'Détente & Bien-Être',
      description: 'Suspendue au-dessus des marées turquoise de l’océan Indien, notre piscine d’eau douce de 25 mètres épouse l’horizon avec lits de repos immergés et service attentionné.',
      hours: '06h30 – 22h00 Tous les jours',
      highlight: 'Eau douce tempérée avec vue infinie sur l’océan',
    },
    dining: {
      title: 'Pavillon Gastronomique Le Tamarinier',
      category: 'Haute Gastronomie',
      description: 'Pavillon ouvert sous une haute toiture en makuti offrant une vue panoramique sur l’océan. Savourez une haute cuisine imprégnée d’épices de Zanzibar et de poissons du jour.',
      hours: 'Petit-déjeuner, Déjeuner & Dîner',
      highlight: 'Produits bio de la ferme et poissons nobles du jour',
    },
    massage: {
      title: 'Spa Botanique & Massages Swahilis',
      category: 'Bien-Être Holistique',
      description: 'Salas de massage intimistes nichées dans les jardins côtiers. Soins sur mesure à l’huile de coco vierge de Zanzibar, citronnelle, clous de girofle et essences africaines.',
      hours: '08h00 – 20h00 Sur Réservation',
      highlight: 'Aromathérapie authentique au Girofle & Citronnelle',
    },
    bbq: {
      title: 'Barbecue de Plage & Brasero Nocturne',
      category: 'Soirée Conviviale',
      description: 'Au coucher du soleil, réunissez-vous autour du brasero pour déguster langoustes grillées et gambas cuites sur braises de coco sous la voûte céleste africaine.',
      hours: 'Au Coucher du Soleil dès 18h30',
      highlight: 'Dîner aux chandelles au bord de l’eau et musique taarab acoustique',
    },
    breakfast: {
      title: 'Petit-Déjeuner Gastronomique Artisanal',
      category: 'Rituel Matinal',
      description: 'Réveillez-vous avec des plateaux de fruits tropicaux des vergers locaux, brioches dorées au four, café pur arabica de Tanzanie et œufs cuisinés selon vos souhaits.',
      hours: '07h00 – 11h00 (En Villa ou au Pavillon)',
      highlight: 'Inclus pour tous nos hôtes résidents',
    },
    wifi: {
      title: 'Wi-Fi Satellite Starlink Très Haut Débit',
      category: 'Connectivité',
      description: 'Profitez d’un accès Internet par satellite Starlink ultra-rapide et stable sur l’ensemble du domaine, vos terrasses privées, transats de plage et restaurants.',
      hours: '24h/24 Haut Débit Illimité',
      highlight: 'Connexion très haut débit sans faille dans chaque villa',
    },
    minibar: {
      title: 'Mini-Bar Bio Curaté & Sélection de Crus',
      category: 'Plaisir Privatif',
      description: 'Chaque villa propose kombuchas artisanaux, nectars de baobab pressés, vins sud-africains réputés et noix de cajou locales torréfiées, réapprovisionnés chaque jour.',
      hours: 'Réapprovisionné chaque jour',
      highlight: 'Sélection de boissons locales offertes gracieusement',
    },
    beach: {
      title: 'Plage Privée & Sanctuaire Marin',
      category: 'Accès Mer & Nature',
      description: 'Accédez directement à une plage de sable corallien immaculé aux eaux calmes et cristallines. Stand-up paddles, kayaks de mer et masques de snorkeling offerts.',
      hours: 'Du Lever au Coucher du Soleil',
      highlight: 'Cabanas ombragées privées et lagon turquoise de baignade',
    },
    concierge: {
      title: 'Majordome Privé & Conciergerie 24h/24',
      category: 'Service Sur Mesure',
      description: 'Du déballage de vos bagages à la réservation d’un voilier privé dhow au crépuscule ou d’un safari sur le continent, votre hôte dédié répond à chacune de vos envies.',
      hours: 'Assistance dédiée 24h/24',
      highlight: 'Création d’itinéraires personnalisés et discrétion absolue',
    },
  },

  sw: {
    pool: {
      title: 'Bwawa la Kuogelea Linalotazama Bahari',
      category: 'Pumziko & Afya',
      description: 'Limeinuliwa juu ya maji ya kijani ya Bahari ya Hindi, bwawa hili la maji baridi la mita 25 linakutana na upeo wa bahari likiwa na vitanda vya majini.',
      hours: '06:30 – 22:00 Kila Siku',
      highlight: 'Maji safi baridi yenye mwonekano wa upeo wa bahari',
    },
    dining: {
      title: 'Banda la Kifahari la Chakula la Mkwaju',
      category: 'Sanaa ya Mapishi',
      description: 'Banda la wazi chini ya paa kubwa la makuti linalotoa mandhari ya bahari. Furahia vyakula vya kiwango cha juu vyenye harufu ya viungo vya Zanzibar.',
      hours: 'Asubuhi, Mchana na Usiku',
      highlight: 'Vyakula asilia vya shambani na samaki wabichi wa leo',
    },
    massage: {
      title: 'Spa ya Asili ya Kiswahili na Masaji',
      category: 'Matibabu ya Asili',
      description: 'Vyumba vya wazi vilivyojificha ndani ya bustani za pwani. Furahia masaji maalum kwa kutumia mafuta ya nazi ya Zanzibar, mchaichai na karafuu.',
      hours: '08:00 – 20:00 kwa Miadi',
      highlight: 'Aromatherapy halisi ya Karafuu na Mchaichai',
    },
    bbq: {
      title: 'Choma ya Ufukoni na Moto wa Usiku',
      category: 'Mkusanyiko wa Jioni',
      description: 'Jua linapozama Bahari ya Hindi, kusanyika kando ya moto wa pwani kwa ajili ya kamba na minofu ya samaki iliyochomwa juu ya vifuu vya nazi.',
      hours: 'Machweo kuanzia saa 18:30',
      highlight: 'Chakula cha jioni kando ya mishumaa na muziki wa taarab',
    },
    breakfast: {
      title: 'Kiamsha Kinywa cha Kifahari cha Asili',
      category: 'Desturi ya Asubuhi',
      description: 'Amka na matunda ya kitropiki kutoka mashamba ya wenyeji, mikate moto ya kuoka, kahawa ya arabika ya Tanzania na mayai uipendavyo.',
      hours: '07:00 – 11:00 (Chumbani au Bandani)',
      highlight: 'Bure kwa wageni wote wanaolala',
    },
    wifi: {
      title: 'Wi-Fi ya Kasi ya Juu ya Satelaiti ya Starlink',
      category: 'Mawasiliano',
      description: 'Furahia mtandao wa kasi ya ajabu wa satelaiti kote hotelini, ndani ya vyumba, kando ya bwawa na ufukweni kwa mawasiliano yasiyokatika.',
      hours: 'Saa 24 Kasi ya Juu Bila Kikomo',
      highlight: 'Mawasiliano ya haraka kila pembe ya hoteli',
    },
    minibar: {
      title: 'Mini Bar ya Vinywaji Asilia',
      category: 'Faraja Binafsi',
      description: 'Kila villa ina vinywaji asilia, juisi ya ubuyu, mvinyo bora wa Afrika Kusini na korosho safi za kukaangwa zinazojazwa kila siku.',
      hours: 'Hujazwa upya kila siku',
      highlight: 'Vinywaji teule vya bure vimejumuishwa',
    },
    beach: {
      title: 'Ufukwe Binafsi na Hifadhi ya Bahari',
      category: 'Hali ya Hewa na Pwani',
      description: 'Kanyaga mchanga mweupe nyororo wa matumbawe na maji safi kama kioo. Boti za kasia na vifaa vya mbizi vinatolewa bure kabisa.',
      hours: 'Mawio hadi Machweo',
      highlight: 'Mabanda binafsi ya kivuli na kuogelea salama baharini',
    },
    concierge: {
      title: 'Mnyweshaji na Mhudumu Binafsi Saa 24',
      category: 'Huduma Maalum',
      description: 'Kuanzia kupanga mizigo yako, kuandaa safari za jahazi hadi kupanga safari za mbugani Bara, mhudumu wako binafsi yuko tayari kusaidia.',
      hours: 'Huduma Maalum ya Saa 24',
      highlight: 'Mpangilio maalum wa safari na ukarimu wa hali ya juu',
    },
  },

  es: {
    pool: {
      title: 'Piscina Infinita Frente al Océano',
      category: 'Relax y Bienestar',
      description: 'Suspendida sobre las aguas turquesas del océano Índico, nuestra piscina de agua dulce de 25 metros se funde con el horizonte con tumbonas sumergidas.',
      hours: '06:30 – 22:00 Todos los días',
      highlight: 'Agua dulce climatizada con vistas panorámicas al océano',
    },
    dining: {
      title: 'Pabellón Gastronómico El Tamarindo',
      category: 'Alta Cocina',
      description: 'Pabellón al aire libre bajo techumbre de makuti con vistas al mar. Alta gastronomía impregnada de las especias de Zanzíbar y la pesca del día.',
      hours: 'Desayuno, Almuerzo y Cena',
      highlight: 'Ingredientes orgánicos locales y mariscos frescos del día',
    },
    massage: {
      title: 'Spa Botánico y Masajes Suajilis',
      category: 'Bienestar Holístico',
      description: 'Cabañas de spa privadas en jardines costeros. Masajes exclusivos con aceite de coco virgen de Zanzíbar, limoncillo, clavo y plantas medicinales africanas.',
      hours: '08:00 – 20:00 con Cita Previa',
      highlight: 'Aromaterapia auténtica con Clavo y Lemongrass',
    },
    bbq: {
      title: 'Barbacoa en la Playa y Hoguera Nocturna',
      category: 'Encuentros al Atardecer',
      description: 'Al ponerse el sol, reúnase alrededor de la hoguera para degustar langostas y langostinos tigre asados a la brasa bajo el cielo estrellado.',
      hours: 'Al Atardecer desde las 18:30',
      highlight: 'Cena a la luz de las velas frente al mar con música taarab en directo',
    },
    breakfast: {
      title: 'Desayuno Gourmet Artesanal',
      category: 'Ritual Matutino',
      description: 'Comience el día con fruta tropical recién cortada, brioche casero, café arábica tanzano y huevos preparados al gusto en su villa o junto al mar.',
      hours: '07:00 – 11:00 (En Villa o Pabellón)',
      highlight: 'Incluido para todos los huéspedes alojados',
    },
    wifi: {
      title: 'Wi-Fi Satelital Starlink de Alta Velocidad',
      category: 'Conectividad',
      description: 'Internet satelital ultrarrápido y de baja latencia en todo el resort, villas privadas, hamacas de playa y restaurantes.',
      hours: '24/7 Ilimitado de Alta Velocidad',
      highlight: 'Cobertura óptima de fibra óptica en cada rincón',
    },
    minibar: {
      title: 'Mini Bar Orgánico y Selección de Vinos',
      category: 'Placer Privado',
      description: 'Cada villa cuenta con kombuchas orgánicas, zumos naturales de baobab, vinos sudafricanos y anacardos tostados locales, repuestos a diario.',
      hours: 'Reposición diaria',
      highlight: 'Bebidas locales selectas incluidas de cortesía',
    },
    beach: {
      title: 'Playa Privada y Santuario Marino',
      category: 'Naturaleza y Mar',
      description: 'Acceso directo a arenas de coral virgen con aguas protegidas por el arrecife exterior. Tablas de paddle surf, kayaks y equipos de snorkel de cortesía.',
      hours: 'Del Amanecer al Atardecer',
      highlight: 'Cabañas privadas con sombra y baño seguro en la laguna',
    },
    concierge: {
      title: 'Mayordomo Personal y Conserjería 24 Horas',
      category: 'Atención Exclusiva',
      description: 'Desde deshacer sus maletas hasta organizar salidas en velero dhow o safaris en el continente, su anfitrión personal estará siempre a su disposición.',
      hours: 'Atención Dedicada 24 Horas',
      highlight: 'Diseño de itinerarios a medida y servicio impecable',
    },
  },

  it: {
    pool: {
      title: 'Piscina a Sfioro Fronte Oceano',
      category: 'Relax & Benessere',
      description: 'Sospesa sulle maree turchesi dell’oceano Indiano, la piscina d’acqua dolce di 25 metri si fonde con l’orizzonte con lettini immersi a pelo d’acqua.',
      hours: '06:30 – 22:00 Tutti i giorni',
      highlight: 'Acqua dolce riscaldata con vista aperta sull’orizzonte',
    },
    dining: {
      title: 'Padiglione Ristorante Il Tamarindo',
      category: 'Alta Cucina',
      description: 'Elegante padiglione aperto con tetto in makuti e vista panoramica. Raffinata gastronomia esaltata dalle spezie di Zanzibar e dal pescato del giorno.',
      hours: 'Colazione, Pranzo e Cena',
      highlight: 'Prodotti biologici della terra e pesce fresco quotidiano',
    },
    massage: {
      title: 'Spa Botanica & Massaggi Swahili',
      category: 'Benessere Olistico',
      description: 'Salas per massaggi immerse nei giardini costieri. Trattamenti su misura con olio di cocco di Zanzibar, lemongrass, chiodi di garofano ed essenze botaniche.',
      hours: '08:00 – 20:00 su Appuntamento',
      highlight: 'Aromaterapia autentica con Chiodi di Garofano e Lemongrass',
    },
    bbq: {
      title: 'Barbecue sulla Spiaggia & Braciere Notturno',
      category: 'Serata Sotto le Stelle',
      description: 'Al calare del sole, ritrovo attorno al braciere per aragoste grigliate e gamberi cotti sulla brace di cocco sotto le costellazioni africane.',
      hours: 'Al Tramonto dalle 18:30',
      highlight: 'Cena a lume di candela sulla spiaggia con musica taarab acustica',
    },
    breakfast: {
      title: 'Colazione Gourmet Artigianale',
      category: 'Risveglio del Mattino',
      description: 'Frutta tropicale appena colta, brioche calde, caffè arabica della Tanzania e uova cucinate secondo i vostri desideri in villa o in riva al mare.',
      hours: '07:00 – 11:00 (In Villa o al Padiglione)',
      highlight: 'Inclusa per tutti gli ospiti residenti',
    },
    wifi: {
      title: 'Wi-Fi Satellitare Starlink ad Alta Velocità',
      category: 'Connettività',
      description: 'Internet satellitare ultraveloce a bassa latenza su tutta la proprietà, nelle ville private, sui lettini in spiaggia e nelle terrazze ristorante.',
      hours: '24/7 Illimitato ad Alta Velocità',
      highlight: 'Connessione affidabile ad alta velocità in ogni angolo',
    },
    minibar: {
      title: 'Minibar Biologico & Cantinetta Vini',
      category: 'Coccola Privata',
      description: 'Ogni villa è provvista di kombucha bio, nettari di baobab, vini sudafricani e anacardi tostati dell’isola riforniti ogni giorno.',
      hours: 'Rifornimento quotidiano',
      highlight: 'Selezione di bevande locali offerte di benvenuto',
    },
    beach: {
      title: 'Spiaggia Riservata & Oasi Marina',
      category: 'Mare & Natura',
      description: 'Accesso diretto alla sabbia corallina candida bagnata da acque calme e trasparenti. Stand-up paddle, kayak da mare e maschere da snorkeling gratuiti.',
      hours: 'Dall’Alba al Tramonto',
      highlight: 'Cabanas private all’ombra e balneazione protetta nella laguna',
    },
    concierge: {
      title: 'Maggiordomo Personale & Concierge 24/7',
      category: 'Ospitalità su Misura',
      description: 'Dal disfare i bagagli all’organizzazione di escursioni al tramonto su dhow o safari in Tanzania continentale, il vostro assistente personale è sempre a disposizione.',
      hours: 'Supporto dedicato 24 ore su 24',
      highlight: 'Itinerari personalizzati e massima riservatezza',
    },
  },

  pl: {
    pool: {
      title: 'Basen Infinity z Widokiem na Ocean',
      category: 'Relaks i Wellness',
      description: 'Zawieszony nad falami Oceanu Indyjskiego, 25-metrowy basen ze słodką wodą tworzy jednolitą taflę z horyzontem, oferując zanurzone leżanki.',
      hours: '06:30 – 22:00 Codziennie',
      highlight: 'Podgrzewana słodka woda z widokiem na horyzont',
    },
    dining: {
      title: 'Pawilon Restauracyjny Tamaryndowiec',
      category: 'Sztuka Kulinarna',
      description: 'Otwarty pawilon pod dachem ze strzechy makuti z panoramicznym widokiem na fale oceanu. Wykwintne potrawy pachnące przyprawami Zanzibaru.',
      hours: 'Śniadania, Obiady i Kolacje',
      highlight: 'Ekologiczne produkty prosto od lokalnych rolników i świeże ryby',
    },
    massage: {
      title: 'Botaniczne Spa i Masaże Suahili',
      category: 'Holistyczne Ukojenie',
      description: 'Kameralne altany spa w nadmorskim ogrodzie. Autorskie masaże z użyciem tłoczonego na zimno oleju kokosowego, trawy cytrynowej i goździków.',
      hours: '08:00 – 20:00 na Zapisy',
      highlight: 'Autentyczna aromaterapia goździkowa i z trawy cytrynowej',
    },
    bbq: {
      title: 'Grill Plażowy na Piasku i Ognisko',
      category: 'Wieczorne Spotkanie',
      description: 'Gdy słońce zachodzi nad oceanem, zbierzcie się wokół plażowego ogniska na grillowanego homara i krewetki pieczone na łupinach kokosa.',
      hours: 'Zachód słońca od 18:30',
      highlight: 'Kolacja przy świecach nad samym brzegiem z muzyką taarab na żywo',
    },
    breakfast: {
      title: 'Rzemieślnicze Śniadanie Smakoszy',
      category: 'Poranny Rytuał',
      description: 'Półmiski owoców tropikalnych, maślane brioszki z pieca, kawa arabika z Tanzanii oraz jajka przygotowywane według życzenia w willi lub nad morzem.',
      hours: '07:00 – 11:00 (W Willi lub Pawilonie)',
      highlight: 'W cenie dla wszystkich gości hotelowych',
    },
    wifi: {
      title: 'Szybki Internet Satelitarny Starlink',
      category: 'Łączność',
      description: 'Błyskawiczny internet satelitarny w całym obiekcie, willach, na plaży i tarasach widokowych, zapewniający pełną wygodę pracy i kontaktu.',
      hours: '24/7 Nielimitowana Szybkość',
      highlight: 'Niezawodna prędkość światłowodu w każdym zakątku',
    },
    minibar: {
      title: 'Ekologiczny Minibar i Selekcja Win',
      category: 'Prywatna Przyjemność',
      description: 'Każda willa wyposażona jest w organiczne kombuche, soki z baobabu, wina południowoafrykańskie i lokalne orzechy nerkowca uzupełniane codziennie.',
      hours: 'Uzupełniany codziennie',
      highlight: 'Wybrane lokalne napoje wliczone w cenę pobytu',
    },
    beach: {
      title: 'Prywatna Plaża i Rezerwat Morski',
      category: 'Natura i Wybrzeże',
      description: 'Zejście wprost na biały piasek koralowy z krystalicznie czystą wodą osłoniętą barierą rafy. Deski SUP, kajaki morskie i maski do snorkelingu w cenie.',
      hours: 'Od Wschodu do Zachodu Słońca',
      highlight: 'Prywatne zacienione altany i bezpieczna kąpiel w lagunie',
    },
    concierge: {
      title: 'Osobisty Kamerdyner i Concierge 24/7',
      category: 'Indywidualna Troska',
      description: 'Od rozpakowania walizek po rejs tradycyjnym dhow o zachodzie słońca i safari na lądzie – Wasz dedykowany opiekun jest zawsze do dyspozycji.',
      hours: 'Całodobowe Dedykowane Wsparcie',
      highlight: 'Szyte na miarę plany pobytu i dyskretna obsługa VIP',
    },
  },

  ar: {
    pool: {
      title: 'مسبح لامتناهٍ بإطلالة ساحلية مباشرة',
      category: 'الاسترخاء والاستجمام',
      description: 'معلق فوق مياه المحيط الهندي الفيروزية، يمتد مسبح المياه العذبة بطول 25 متراً ليتلاقى مع الأفق مع أسرّة تشمس مغمورة وخدمة راقية.',
      hours: '06:30 – 22:00 يومياً',
      highlight: 'مياه عذبة مدفأة مع إطلالة مفتوحة على الأفق البحري',
    },
    dining: {
      title: 'جناح مطعم التمر هندي الفاخر',
      category: 'فنون الطهي الفاخر',
      description: 'جناح مفتوح في الهواء الطلق تحت سقف الماكوتي مع إطلالة بانورامية على المحيط لتجربة طعام راقية غنية بتوابل زنجبار وصيد اليوم الطازج.',
      hours: 'إفطار، غداء وعشاء',
      highlight: 'منتجات عضوية طازجة من المزرعة ومأكولات بحرية يومية',
    },
    massage: {
      title: 'سبا الأعشاب والتدليك السواحلي',
      category: 'العافية الطبيعية المتكاملة',
      description: 'أجنحة سبا خاصة في الحدائق الساحلية. جلسات تدليك مخصصة باستخدام زيت جوز الهند المعصور على البارد، وعشب الليمون والقرنفل.',
      hours: '08:00 – 20:00 بالحجز المسبق',
      highlight: 'علاج عطري أصيل بالقرنفل وعشب الليمون الطبيعي',
    },
    bbq: {
      title: 'مشاوي الشاطئ وجلسة النار المسائية',
      category: 'سهرات مسائية راقية',
      description: 'مع غروب الشمس، اجتمع حول نار الشاطئ لتذوق أشهى أطباق الكركند المشوي والروبيان المحضر على فحم جوز الهند تحت النجوم الإفريقية.',
      hours: 'عند الغروب من الساعة 18:30',
      highlight: 'عشاء شاطئي رومانسي على ضوء الشموع مع موسيقى الطرب الحية',
    },
    breakfast: {
      title: 'إفطار تقليدي فاخر ومميز',
      category: 'طقوس الصباح الهادئة',
      description: 'استيقظ على أطباق الفواكه الاستوائية الطازجة، والمخبوزات الساخنة، وقهوة أرابيكا التنزانية الفاخرة، والبيض المحضر حسب رغبتك.',
      hours: '07:00 – 11:00 (في الفيلا أو الجناح المطعم)',
      highlight: 'مشمول ومجاني لجميع النزلاء المقيمين',
    },
    wifi: {
      title: 'إنترنت ستارلينك الفضائي فائق السرعة',
      category: 'الاتصال الذكي',
      description: 'إنترنت فضائي سريع جداً وبزمن استجابة منخفض في كافة أرجاء المنتجع، والفلل الخاصة، وشاطئ البحر، مما يضمن تواصلاً سلساً.',
      hours: 'سرعة فائقة غير محدودة على مدار 24/7',
      highlight: 'تغطية قوية وسريعة تصل إلى كل ركن',
    },
    minibar: {
      title: 'ميني بار عضوي ومشروبات مختارة',
      category: 'رفاهية خاصة',
      description: 'تحتوي كل فيلا على كمبوتشا عضوية، وعصائر التبلدي الطبيعية، ومشروبات راقية ومكسرات الكاجو المحمصة يومياً.',
      hours: 'يتم تجديده يومياً',
      highlight: 'مشروبات محلية مجانية مختارة مشمولة في الإقامة',
    },
    beach: {
      title: 'شاطئ خاص ومحمية بحرية',
      category: 'الطبيعة والوصول للشاطئ',
      description: 'انطلق مباشرة إلى الرمال المرجانية الناعمة والمياه الكريستالية المحمية. نوفر قوارب كاياك وألواح تجديف ومعدات غوص سطحي مجاناً.',
      hours: 'من الشروق حتى الغروب',
      highlight: 'مظلات شاطئية مظللة خاصة ومياه مثالية للسباحة الهادئة',
    },
    concierge: {
      title: 'نادل خاص وخدمة كونسيرج 24 ساعة',
      category: 'عناية وخدمة مخصصة',
      description: 'من تفريغ أمتعتك وترتيب رحلات الإبحار الشراعية عند الغروب إلى تنسيق رحلات السفاري البرية، مضيفك الخاص في خدمتك دائماً.',
      hours: 'دعم مخصص على مدار 24 ساعة',
      highlight: 'تنظيم برامج سياحية خاصة وخدمة لا تشوبها شائبة',
    },
  },

  zh: {
    pool: {
      title: '临海悬崖全景无边际泳池',
      category: '惬意休闲与身心焕活',
      description: '悬挑于印度洋绿松石波涛之上，25米长淡水无边泳池与天际线连为一体，配有下沉式水中日光浴躺椅与池畔专人酒水服务。',
      hours: '每日 06:30 – 22:00',
      highlight: '恒温纯净淡水，坐拥浩瀚壮美海天一线景观',
    },
    dining: {
      title: '罗望子海景露天美食凉亭',
      category: '殿堂级烹饪艺术',
      description: '座落于挑高马库蒂棕榈编织凉亭下，俯瞰360度开阔海景。品味融合桑给巴尔特色香料与当日海捕鲜活海味的精致美馔。',
      hours: '早餐、午餐及星空晚餐',
      highlight: '自产庄园有机食材与当日近海现捞海鲜',
    },
    massage: {
      title: '斯瓦希里热带草本水疗与私享按摩',
      category: '全身心理疗疗愈',
      description: '隐匿于海滨花园中的私密露天水疗凉亭。尊享运用桑给巴尔冷榨椰子油、柠檬草、丁香及东非野生植物精油的定制护理。',
      hours: '08:00 – 20:00（需提前预约）',
      highlight: '正宗纯天然丁香与新鲜柠檬草芳香疗法',
    },
    bbq: {
      title: '赤足海滩炭火烧烤与星空篝火沙龙',
      category: '温馨日暮夜幕雅聚',
      description: '夕阳沉入印度洋之际，围坐于海岸篝火旁，品尝在椰壳炭火上炙烤的现捞龙虾、黑虎虾与香料牛柳，仰望璀璨赤道南十字星。',
      hours: '日落时分 18:30 起',
      highlight: '海边烛光晚宴伴随现场斯瓦希里 Taarab 原声音乐演奏',
    },
    breakfast: {
      title: '主厨手作庄园精品定制早餐',
      category: '清晨味蕾唤醒仪式',
      description: '清晨醒来，享用来自本地热带果园的鲜切水果拼盘、现烤酥脆法式牛角包、坦桑尼亚高山阿拉比卡手冲咖啡，或在海风中享用现制蛋料理。',
      hours: '07:00 – 11:00（可送至别墅内或在餐厅享用）',
      highlight: '所有下榻住客均尊享免费全套早餐服务',
    },
    wifi: {
      title: 'Starlink 高速卫星超宽带无线网络',
      category: '全球全天候互联',
      description: '全庄园度假村无死角覆盖低延迟高速卫星宽带，无论在私人别墅、海滩躺椅还是用餐露台，均能畅快沟通与远程办公。',
      hours: '24小时高速无限流量',
      highlight: '度假村每一处角落均畅享稳定高速光纤级网速',
    },
    minibar: {
      title: '庄园有机健康迷你吧与私人酒窖',
      category: '别墅内私享甘醇',
      description: '每间别墅均配备有机康普茶、纯正猴面包树原汁、精选南非名庄冰镇葡萄酒与本地烤腰果，每日专人免费补充更新。',
      hours: '每日专人定时补充',
      highlight: '尊享精选免费赠饮特色饮品与精致小点',
    },
    beach: {
      title: '私属原生态白沙滩与海洋圣境',
      category: '自然探索与海岸亲水',
      description: '举步即达未受污染的粉状白细珊瑚沙滩，外海天然屏障环礁环抱着宁静清澈海水。免费提供桨板、海上皮划艇与专业浮潜装备。',
      hours: '日出至日落全天开放',
      highlight: '私密遮阳海滩凉亭与适合悠游的天然泻湖海域',
    },
    concierge: {
      title: '24小时贴身私人管家与全能礼宾',
      category: '无微不至个性化服务',
      description: '从抵店行李拆封整理、预订夕阳帆船出海，到根据您的口味偏好定制菜肴与安排坦桑尼亚内陆国家公园 Safari，管家时刻恭候。',
      hours: '24小时全天候专属一对一贴心协助',
      highlight: '量身定制度假行程规划与无可挑剔的英式贴身管家礼遇',
    },
  },
};

export function getLocalizedFacilities(lang: Language, baseFacilities: Facility[] = FACILITIES_DATA): Facility[] {
  const translations = FACILITIES_TRANSLATIONS[lang] || FACILITIES_TRANSLATIONS.en;

  return baseFacilities.map((fac) => {
    const loc = translations[fac.id];
    if (!loc) return fac;
    const seed = FACILITIES_DATA.find((f) => f.id === fac.id);
    const en = FACILITIES_TRANSLATIONS.en[fac.id];
    const pick = (field: 'title' | 'category' | 'description' | 'hours' | 'highlight') =>
      localizeUnlessEdited(fac[field] as string, seed?.[field] as string, en?.[field], loc[field]);

    return {
      ...fac,
      title: pick('title'),
      category: pick('category'),
      description: pick('description'),
      hours: pick('hours'),
      highlight: pick('highlight'),
    };
  });
}
