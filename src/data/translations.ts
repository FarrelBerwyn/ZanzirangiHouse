import { Language } from '../types';

export interface TranslationDictionary {
  nav: {
    stay: string;
    experiences: string;
    facilities?: string;
    dining: string;
    explore?: string;
    concierge?: string;
    about?: string;
    gallery: string;
    location: string;
    bookStay: string;
    planStay?: string;
    cmsPitch: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    exploreProperty: string;
    bookYourStay: string;
    scrollIndicator: string;
  };
  quickBooking: {
    title: string;
    checkIn: string;
    checkOut: string;
    guests: string;
    villaChoice: string;
    allVillas: string;
    checkAvailability: string;
    guestsCount: string;
  };
  intro: {
    heading: string;
    subhead: string;
    body: string;
    statsVillas: string;
    statsPool: string;
    statsDining: string;
    statsSupport: string;
  };
  villas: {
    heading: string;
    subhead: string;
    viewVilla: string;
    bookVilla: string;
    perNight: string;
    maxGuests: string;
    bed: string;
    bath: string;
    size: string;
    view: string;
    amenities: string;
    requestBooking: string;
    featuredTag: string;
    allUnits: string;
  };
  facilities: {
    heading: string;
    subhead: string;
  };
  dining: {
    heading: string;
    subhead: string;
    exploreMenu: string;
    signatureDishes: string;
  };
  video: {
    heading: string;
    subhead: string;
    playFilm: string;
    pauseFilm: string;
    storylineConcept: string;
    sceneArrival: string;
    sceneExterior: string;
    sceneVilla: string;
    scenePool: string;
    sceneDining: string;
    sceneSunset: string;
    sceneSafari: string;
  };
  experiences: {
    heading: string;
    subhead: string;
    tabResort: string;
    tabZanzibar: string;
    tabTanzania: string;
    discoverTanzaniaTitle: string;
    discoverTanzaniaText: string;
    marketplaceVision: string;
  };
  surroundings: {
    heading: string;
    subhead: string;
    distance: string;
    travelTime: string;
  };
  gallery: {
    heading: string;
    subhead: string;
    all: string;
    villas: string;
    rooms: string;
    pool: string;
    dining: string;
    food: string;
    beach: string;
    facilities: string;
    experiences: string;
    fullscreen: string;
  };
  reviews: {
    heading: string;
    subhead: string;
    sampleBadge: string;
    sampleNotice: string;
  };
  ota: {
    heading: string;
    subhead: string;
    notice: string;
  };
  map: {
    heading: string;
    subhead: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    getDirections: string;
  };
  finalCta: {
    heading: string;
    subhead: string;
    bookStay: string;
    contactUs: string;
  };
  footer: {
    brandStatement: string;
    quickLinks: string;
    contactConcierge: string;
    sanctuaryAddress: string;
    allRightsReserved: string;
    clientDemoNotice: string;
  };
  bookingModal: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    selectedVilla: string;
    dates: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    country: string;
    specialRequests: string;
    airportTransfer: string;
    submitRequest: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    chatViaWhatsapp: string;
    close: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      stay: 'STAY',
      experiences: 'EXPERIENCES',
      facilities: 'Facilities',
      dining: 'DINING',
      explore: 'EXPLORE',
      concierge: 'CONCIERGE',
      about: 'ABOUT',
      gallery: 'Gallery',
      location: 'Location',
      bookStay: 'PLAN YOUR STAY',
      planStay: 'PLAN YOUR STAY',
      cmsPitch: 'Client CMS Preview',
    },
    hero: {
      eyebrow: 'ZANZIBAR, TANZANIA',
      title: 'Zanzirangi House — Private Luxury Villas in Zanzibar',
      subtitle: 'Experience private plunge pool villas in Kizimkazi, ocean-to-table dining and bespoke Tanzania safaris.',
      exploreProperty: 'EXPLORE THE RETREAT',
      bookYourStay: 'PLAN YOUR JOURNEY',
      scrollIndicator: 'SCROLL TO DISCOVER',
    },
    quickBooking: {
      title: 'Plan Your Sanctuary Escape',
      checkIn: 'CHECK-IN',
      checkOut: 'CHECK-OUT',
      guests: 'GUESTS',
      villaChoice: 'ACCOMMODATION',
      allVillas: 'Select Preferred Villa',
      checkAvailability: 'CHECK AVAILABILITY',
      guestsCount: 'Guests',
    },
    intro: {
      heading: 'MORE THAN A STAY',
      subhead: 'Discover a private retreat where the beauty of Zanzibar meets the warmth of authentic island hospitality.',
      body: 'A carefully designed private sanctuary where modern luxury meets the timeless soul of Zanzibar. Sheltered along the peaceful southern coastline of Kizimkazi, Zanzirangi House offers an intimate gateway to barefoot oceanfront living, fresh garden gastronomy, curated island adventures, and seamless connections to mainland Tanzania safaris.',
      statsVillas: 'PRIVATE VILLAS',
      statsPool: 'SWIMMING POOL',
      statsDining: 'DINING & BAR',
      statsSupport: 'GUEST CONCIERGE',
    },
    villas: {
      heading: 'STAY YOUR WAY',
      subhead: 'Thoughtfully designed spaces for comfort, privacy and unforgettable stays.',
      viewVilla: 'VIEW VILLA',
      bookVilla: 'REQUEST BOOKING',
      perNight: 'per night',
      maxGuests: 'Guests',
      bed: 'Bed',
      bath: 'Bath',
      size: 'Size',
      view: 'View',
      amenities: 'Villa Amenities',
      requestBooking: 'Request This Villa',
      featuredTag: 'Featured Sanctuary',
      allUnits: 'Explore All 8 Villas',
    },
    facilities: {
      heading: 'EVERYTHING YOU NEED',
      subhead: 'Uncompromising refinement tailored for wellness, restoration, and effortless comfort.',
    },
    dining: {
      heading: 'TASTE THE EXPERIENCE',
      subhead: 'A gastronomic journey from traditional Swahili spices to contemporary haute cuisine.',
      exploreMenu: 'EXPLORE SIGNATURE DISHES',
      signatureDishes: 'Signature Tasting Highlights',
    },
    video: {
      heading: 'EXPERIENCE THE PROPERTY',
      subhead: 'A cinematic preview journey through our private coastal sanctuary.',
      playFilm: 'PLAY FILM',
      pauseFilm: 'PAUSE FILM',
      storylineConcept: 'Promotional Storyline Sequence',
      sceneArrival: 'Arrival & Welcome',
      sceneExterior: 'Coastal Architecture',
      sceneVilla: 'Private Villa Quarters',
      scenePool: 'Infinity Pool Lagoon',
      sceneDining: 'Swahili Culinary Arts',
      sceneSunset: 'Sunset Dhow Journey',
      sceneSafari: 'Tanzania Safari Horizon',
    },
    experiences: {
      heading: 'EXPERIENCE MORE THAN A STAY',
      subhead: 'Immersive coastal adventures, cultural heritage, and the gateway to the African wild.',
      tabResort: 'At The Resort',
      tabZanzibar: 'Zanzibar Island',
      tabTanzania: 'Discover Tanzania (Safari)',
      discoverTanzaniaTitle: 'DISCOVER TANZANIA',
      discoverTanzaniaText: 'Your stay can be the beginning of a larger Tanzanian journey. Connect seamlessly with private charter flights to the Serengeti, Ngorongoro Crater, and Mount Kilimanjaro.',
      marketplaceVision: 'Future Tourism Marketplace Integration',
    },
    surroundings: {
      heading: 'DISCOVER THE SURROUNDINGS',
      subhead: 'Idyllic coastal seclusion with effortless proximity to Zanzibar’s natural and historic wonders.',
      distance: 'Distance',
      travelTime: 'Travel Time',
    },
    gallery: {
      heading: 'VISUAL CHRONICLES',
      subhead: 'An intimate window into light, texture, and tranquil Indian Ocean living.',
      all: 'ALL',
      villas: 'VILLAS',
      rooms: 'ROOMS',
      pool: 'POOL',
      dining: 'DINING',
      food: 'FOOD',
      beach: 'BEACH',
      facilities: 'FACILITIES',
      experiences: 'EXPERIENCES',
      fullscreen: 'View High Resolution',
    },
    reviews: {
      heading: 'WHAT OUR GUESTS SAY',
      subhead: 'Reflections from international travelers who have made our sanctuary their home.',
      sampleBadge: 'SAMPLE / DEMO TESTIMONIALS',
      sampleNotice: 'Client Presentation Note: For demo purposes, sample testimonials are illustrated above. Verified guest reviews will be integrated upon official property launch.',
    },
    ota: {
      heading: 'BOOK WITH CONFIDENCE',
      subhead: 'Global luxury distribution and direct booking guarantee.',
      notice: 'Available through selected booking channels. Partner logos shown for demonstration.',
    },
    map: {
      heading: 'FIND US',
      subhead: 'Kizimkazi Dimbani • South Coast, Zanzibar • Tanzania',
      address: 'Property Address',
      phone: 'Direct Telephone',
      email: 'Concierge Inquiries',
      whatsapp: 'Instant WhatsApp Concierge',
      getDirections: 'GET DIRECTIONS',
    },
    finalCta: {
      heading: 'YOUR TANZANIA EXPERIENCE STARTS HERE.',
      subhead: 'Discover a private retreat surrounded by comfort, nature and authentic Tanzanian hospitality.',
      bookStay: 'BOOK YOUR STAY',
      contactUs: 'CONTACT US',
    },
    footer: {
      brandStatement: 'An intimate eight-villa private sanctuary on the southern shores of Zanzibar, bridging authentic Swahili soul with international luxury hospitality.',
      quickLinks: 'Navigation',
      contactConcierge: 'Guest Concierge',
      sanctuaryAddress: 'Sanctuary Address',
      allRightsReserved: 'All rights reserved.',
      clientDemoNotice: 'Pitching Demonstration Model. Built for presentation to property owners, investors & hospitality partners.',
    },
    bookingModal: {
      title: 'REQUEST A RESERVATION',
      subtitle: 'Please select your travel dates and requirements. Our dedicated reservations team will confirm availability within 4 hours.',
      step1: 'Reservation Details',
      step2: 'Guest Contact Information',
      selectedVilla: 'Preferred Villa',
      dates: 'Stay Dates',
      guestName: 'Full Name',
      guestEmail: 'Email Address',
      guestPhone: 'Phone / WhatsApp Number',
      country: 'Country of Residence',
      specialRequests: 'Special Requests & Dietary Notes',
      airportTransfer: 'Request VIP Private Airport Chauffeur Transfer',
      submitRequest: 'SUBMIT BOOKING REQUEST',
      submitting: 'TRANSMITTING REQUEST...',
      successTitle: 'Inquiry Transmitted Successfully',
      successMessage: 'Thank you. Your reservation request has been received by our private concierge. A tailored availability quote has been scheduled.',
      chatViaWhatsapp: 'Chat Directly via WhatsApp',
      close: 'Close Window',
    },
  },
  fr: {
    nav: {
      stay: 'Séjour',
      experiences: 'Expériences',
      facilities: 'Installations',
      dining: 'Gastronomie',
      explore: 'Explorer',
      concierge: 'Conciergerie',
      about: 'À Propos',
      gallery: 'Galerie',
      location: 'Emplacement',
      bookStay: 'Réserver Votre Séjour',
      planStay: 'Réserver',
      cmsPitch: 'Aperçu CMS Propriétaire',
    },
    hero: {
      eyebrow: 'Zanzibar • Tanzanie',
      title: 'VOTRE ÉCHAPPÉE PRIVÉE EN TANZANIE',
      subtitle: 'Vivez le confort, la nature et une hospitalité authentique dans une destination d’exception.',
      exploreProperty: 'EXPLORER LA PROPRIÉTÉ',
      bookYourStay: 'RÉSERVER VOTRE SÉJOUR',
      scrollIndicator: 'DÉCOUVRIR',
    },
    quickBooking: {
      title: 'Planifiez Votre Séjour',
      checkIn: 'ARRIVÉE',
      checkOut: 'DÉPART',
      guests: 'VOYAGEURS',
      villaChoice: 'VILLA',
      allVillas: 'Sélectionnez une Villa',
      checkAvailability: 'VÉRIFIER LA DISPONIBILITÉ',
      guestsCount: 'Personnes',
    },
    intro: {
      heading: 'UN LIEU POUR RALENTIR',
      subhead: 'Où la Nature Sauvage Rencontre le Sanctuaire Moderne',
      body: 'Un refuge privé soigneusement conçu où le confort moderne rencontre la beauté et le caractère de la Tanzanie. Nichée sur la côte sud de Zanzibar, chaque villa rend hommage au patrimoine swahili.',
      statsVillas: 'VILLAS PRIVÉES',
      statsPool: 'PISCINE INFINIE',
      statsDining: 'RESTAURANT & BAR',
      statsSupport: 'SUPPORT CLIENT',
    },
    villas: {
      heading: 'SÉJOURNEZ À VOTRE FAÇON',
      subhead: 'Des espaces pensés pour le confort, l’intimité et des séjours inoubliables.',
      viewVilla: 'VOIR LA VILLA',
      bookVilla: 'DEMANDER UNE RÉSERVATION',
      perNight: 'par nuit',
      maxGuests: 'Invités',
      bed: 'Lit',
      bath: 'Salle de bain',
      size: 'Superficie',
      view: 'Vue',
      amenities: 'Équipements de la Villa',
      requestBooking: 'Demander cette Villa',
      featuredTag: 'Sanctuaire d’Exception',
      allUnits: 'Découvrir les 8 Villas',
    },
    facilities: {
      heading: 'TOUT CE DONT VOUS AVEZ BESOIN',
      subhead: 'Un raffinement sans compromis conçu pour le bien-être et le confort absolu.',
    },
    dining: {
      heading: 'DÉGUSTEZ L’EXPÉRIENCE',
      subhead: 'Un voyage gastronomique des épices traditionnelles swahilies à la haute cuisine contemporaine.',
      exploreMenu: 'DÉCOUVRIR LE MENU',
      signatureDishes: 'Plats Signatures',
    },
    video: {
      heading: 'DÉCOUVREZ LA PROPRIÉTÉ',
      subhead: 'Un voyage cinématographique à travers notre sanctuaire côtier privé.',
      playFilm: 'LANCER LE FILM',
      pauseFilm: 'PAUSE',
      storylineConcept: 'Séquence Scénaristique',
      sceneArrival: 'Arrivée & Accueil',
      sceneExterior: 'Architecture Côtière',
      sceneVilla: 'Villas Privées',
      scenePool: 'Piscine Débordante',
      sceneDining: 'Arts Culinaires',
      sceneSunset: 'Voilier Dhow au Coucher',
      sceneSafari: 'Horizon Safari Tanzanie',
    },
    experiences: {
      heading: 'PLUS QU’UN SÉJOUR, UNE EXPÉRIENCE',
      subhead: 'Aventures côtières, patrimoine culturel et porte d’entrée vers la faune africaine.',
      tabResort: 'Au Domaine',
      tabZanzibar: 'Île de Zanzibar',
      tabTanzania: 'Découvrir la Tanzanie (Safari)',
      discoverTanzaniaTitle: 'DÉCOUVRIR LA TANZANIE',
      discoverTanzaniaText: 'Votre séjour peut être le point de départ d’une grande aventure tanzanienne vers le Serengeti, le Ngorongoro et le Kilimandjaro.',
      marketplaceVision: 'Plateforme Tourisme du Futur',
    },
    surroundings: {
      heading: 'DÉCOUVREZ LES ENVIRONS',
      subhead: 'Isolement idyllique et proximité immédiate avec les merveilles naturelles de Zanzibar.',
      distance: 'Distance',
      travelTime: 'Temps de Trajet',
    },
    gallery: {
      heading: 'CHRONIQUES VISUELLES',
      subhead: 'Une immersion dans la lumière et la douceur de vivre de l’Océan Indien.',
      all: 'TOUT',
      villas: 'VILLAS',
      rooms: 'CHAMBRES',
      pool: 'PISCINE',
      dining: 'RESTAURANT',
      food: 'PLATS',
      beach: 'PLAGE',
      facilities: 'SERVICES',
      experiences: 'ACTIVITÉS',
      fullscreen: 'Plein Écran',
    },
    reviews: {
      heading: 'CE QUE DISENT NOS CLIENTS',
      subhead: 'Les impressions de nos voyageurs internationaux.',
      sampleBadge: 'TÉMOIGNAGES DE DÉMONSTRATION',
      sampleNotice: 'Note de Présentation : Avis de démonstration présentés pour illustrer la future intégration des avis vérifiés.',
    },
    ota: {
      heading: 'RÉSERVEZ EN TOUTE CONFIANCE',
      subhead: 'Distribution internationale de luxe et garantie du meilleur tarif direct.',
      notice: 'Disponible via les canaux sélectionnés. Logos présentés à titre de démonstration.',
    },
    map: {
      heading: 'NOUS TROUVER',
      subhead: 'Kizimkazi Dimbani • Côte Sud, Zanzibar • Tanzanie',
      address: 'Adresse de la Propriété',
      phone: 'Téléphone Direct',
      email: 'Email Conciergerie',
      whatsapp: 'WhatsApp Concierge',
      getDirections: 'ITINÉRAIRE',
    },
    finalCta: {
      heading: 'VOTRE EXPÉRIENCE TANZANIENNE COMMENCE ICI.',
      subhead: 'Découvrez un sanctuaire privé alliant confort, nature et hospitalité authentique.',
      bookStay: 'RÉSERVER VOTRE SÉJOUR',
      contactUs: 'CONTACTEZ-NOUS',
    },
    footer: {
      brandStatement: 'Un sanctuaire privé de huit villas sur les côtes méridionales de Zanzibar, unissant l’âme swahilie à l’hôtellerie d’excellence.',
      quickLinks: 'Navigation',
      contactConcierge: 'Conciergerie',
      sanctuaryAddress: 'Adresse',
      allRightsReserved: 'Tous droits réservés.',
      clientDemoNotice: 'Modèle de Démonstration pour Présentation Client.',
    },
    bookingModal: {
      title: 'DEMANDE DE RÉSERVATION',
      subtitle: 'Sélectionnez vos dates. Notre équipe vous répondra sous 4 heures.',
      step1: 'Détails du Séjour',
      step2: 'Coordonnées de Contact',
      selectedVilla: 'Villa Préférée',
      dates: 'Dates du Séjour',
      guestName: 'Nom Complet',
      guestEmail: 'Adresse Email',
      guestPhone: 'Téléphone / WhatsApp',
      country: 'Pays de Résidence',
      specialRequests: 'Demandes Spéciales',
      airportTransfer: 'Demander le Chauffeur VIP Privé',
      submitRequest: 'ENVOYER LA DEMANDE',
      submitting: 'TRANSMISSION...',
      successTitle: 'Demande Transmise avec Succès',
      successMessage: 'Merci. Votre demande a bien été reçue par notre conciergerie.',
      chatViaWhatsapp: 'Échanger par WhatsApp',
      close: 'Fermer',
    },
  },
  sw: {
    nav: {
      stay: 'Malazi',
      experiences: 'Matukio',
      facilities: 'Huduma',
      dining: 'Vyakula',
      explore: 'Gundua',
      concierge: 'Huduma',
      about: 'Kuhusu Sisi',
      gallery: 'Picha',
      location: 'Mahali',
      bookStay: 'Weka Nafasi Yako',
      planStay: 'Panga Safari',
      cmsPitch: 'Onyesho la Mfumo wa CMS',
    },
    hero: {
      eyebrow: 'Zanzibar • Tanzania',
      title: 'KIMBILIO LAKO BINAFSI NCHINI TANZANIA',
      subtitle: 'Pata faraja, asili na ukarimu wa dhati katika eneo moja la kipekee.',
      exploreProperty: 'TAZAMA ENEO LOTE',
      bookYourStay: 'WEKA NAFASI YAKO',
      scrollIndicator: 'SHUKA CHINI KUGUNDUA',
    },
    quickBooking: {
      title: 'Panga Safari Yako',
      checkIn: 'KUINGIA',
      checkOut: 'KUTOKA',
      guests: 'WAGENI',
      villaChoice: 'VILLA',
      allVillas: 'Chagua Villa Unayopenda',
      checkAvailability: 'HAKIKI NAFASI',
      guestsCount: 'Wageni',
    },
    intro: {
      heading: 'MAHALI PA KUTULIZA NAFSI',
      subhead: 'Mahali Ambapo Asili ya Pwani Inakutana na Anasa ya Kisasa',
      body: 'Kimbilio la faragha lililoundwa kwa uangalifu ambapo faraja ya kisasa inakutana na uzuri na utamaduni wa Tanzania. Kando ya pwani tulivu ya kusini mwa Zanzibar, kila villa inaakisi urithi wa Kiswahili.',
      statsVillas: 'VILLA ZA KIBINAFSI',
      statsPool: 'BWANA LA KUOGELEA',
      statsDining: 'MGAHAWA NA BAARI',
      statsSupport: 'HUDUMA KWA WAGENI',
    },
    villas: {
      heading: 'KAA KWA UTULIVU',
      subhead: 'Nafasi zilizoundwa kwa ustadi kwa ajili ya faraja, usiri na kumbukumbu za kudumu.',
      viewVilla: 'ANGALIA VILLA',
      bookVilla: 'OMBA NAFASI',
      perNight: 'kwa usiku',
      maxGuests: 'Wageni',
      bed: 'Kitanda',
      bath: 'Bafu',
      size: 'Ukubwa',
      view: 'Mandhari',
      amenities: 'Vifaa vya Villa',
      requestBooking: 'Omba Villa Hii',
      featuredTag: 'Villa Bora',
      allUnits: 'Tazama Villa Zote 8',
    },
    facilities: {
      heading: 'KILA KITU UNACHOHITAJI',
      subhead: 'Huduma bora zilizoboreshwa kwa ajili ya afya, mapumziko na utulivu kamili.',
    },
    dining: {
      heading: 'ONJA UTAMU WA ZANZIBAR',
      subhead: 'Safari ya ladha kutoka viungo vya asili vya Waswahili hadi vyakula vya kimataifa.',
      exploreMenu: 'TAZAMA MENYU YA VYAKULA',
      signatureDishes: 'Vyakula Maalum',
    },
    video: {
      heading: 'JIONEE MWENYEWE ENEO LETU',
      subhead: 'Safari ya picha za sinema kupitia kimbilio letu la pwani.',
      playFilm: 'CHEZA FILAMU',
      pauseFilm: 'SIMAMISHA',
      storylineConcept: 'Mtiririko wa Sinema',
      sceneArrival: 'Kufika & Mapokezi',
      sceneExterior: 'Majengo ya Pwani',
      sceneVilla: 'Ndani ya Villa',
      scenePool: 'Bwawa la Bahari',
      sceneDining: 'Ladha ya Vyakula',
      sceneSunset: 'Safari ya Mashua',
      sceneSafari: 'Safari za Tanzania',
    },
    experiences: {
      heading: 'ZAIDI YA MALAZI TU',
      subhead: 'Safari za baharini, urithi wa kiutamaduni na mwanzo wa safari za mbuga za wanyama.',
      tabResort: 'Ndani ya Eneo',
      tabZanzibar: 'Kisiwa cha Zanzibar',
      tabTanzania: 'Gundua Tanzania (Safari)',
      discoverTanzaniaTitle: 'GUNDUA TANZANIA',
      discoverTanzaniaText: 'Ukaaji wako unaweza kuwa mwanzo wa safari kubwa ya Tanzania kuelekea Serengeti, Ngorongoro na Mlima Kilimanjaro.',
      marketplaceVision: 'Soko la Utalii la Baadaye',
    },
    surroundings: {
      heading: 'GUNDUA MAENEO YA KARIBU',
      subhead: 'Utulivu wa pwani ukiwa karibu na vivutio vya kihistoria na vya asili vya Zanzibar.',
      distance: 'Umbali',
      travelTime: 'Muda wa Safari',
    },
    gallery: {
      heading: 'PICHA ZA ENZINI',
      subhead: 'Tazama uzuri wa mwanga, hewa safi na bahari ya Hindi.',
      all: 'ZOTE',
      villas: 'VILLA',
      rooms: 'VYUMBA',
      pool: 'BWAWA',
      dining: 'MGAHAWA',
      food: 'VYAKULA',
      beach: 'UFUKWENI',
      facilities: 'HUDUMA',
      experiences: 'MATUKIO',
      fullscreen: 'Picha Kamili',
    },
    reviews: {
      heading: 'WAGENI WETU WANACHOSEMA',
      subhead: 'Ushuhuda kutoka kwa wageni wa kimataifa waliotutembelea.',
      sampleBadge: 'MAONI YA MFANO / DEMO',
      sampleNotice: 'Kumbuka: Haya ni maoni ya mfano kwa ajili ya kuwasilisha mfumo kwa wateja.',
    },
    ota: {
      heading: 'WEKA NAFASI KWA KUJIAMINI',
      subhead: 'Inapatikana pia kupitia mitandao mikubwa ya utalii duniani.',
      notice: 'Inapatikana kupitia njia zilizochaguliwa za kuweka nafasi. Nembo zinaonyeshwa kama mfano tu.',
    },
    map: {
      heading: 'TUTAFUTE',
      subhead: 'Kizimkazi Dimbani • Pwani ya Kusini, Zanzibar • Tanzania',
      address: 'Anwani ya Eneo',
      phone: 'Simu ya Moja kwa Moja',
      email: 'Barua Pepe ya Concierge',
      whatsapp: 'Wasiliana kwa WhatsApp',
      getDirections: 'PATA MAELEKEZO',
    },
    finalCta: {
      heading: 'SAFARI YAKO YA TANZANIA INAANZIA HAPA.',
      subhead: 'Gundua kimbilio la faragha lililozungukwa na faraja, asili na ukarimu wa dhati wa Kitanzania.',
      bookStay: 'WEKA NAFASI YAKO',
      contactUs: 'WASILIANA NASI',
    },
    footer: {
      brandStatement: 'Kimbilio la faragha la villa nane kusini mwa Zanzibar, linalounganisha utamaduni wa Waswahili na ukarimu wa kiwango cha juu cha kimataifa.',
      quickLinks: 'Viungo vya Haraka',
      contactConcierge: 'Mhudumu Maalum',
      sanctuaryAddress: 'Anwani ya Kimbilio',
      allRightsReserved: 'Haki zote zimehifadhiwa.',
      clientDemoNotice: 'Mfano wa Onyesho kwa ajili ya wamiliki na wawekezaji wa hoteli.',
    },
    bookingModal: {
      title: 'OMBI LA KUWEKA NAFASI',
      subtitle: 'Tafadhali chagua tarehe unazotaka. Timu yetu itakujibu ndani ya masaa 4.',
      step1: 'Maelezo ya Safari',
      step2: 'Mawasiliano Yako',
      selectedVilla: 'Villa Unayoitaka',
      dates: 'Tarehe za Kukaa',
      guestName: 'Jina Kamili',
      guestEmail: 'Barua Pepe',
      guestPhone: 'Nambari ya Simu / WhatsApp',
      country: 'Nchi Unapoishi',
      specialRequests: 'Maombi Maalum',
      airportTransfer: 'Omba Usafiri Binafsi wa Uwanja wa Ndege',
      submitRequest: 'TUMA OMBI LAKO',
      submitting: 'INATUMA...',
      successTitle: 'Ombi Limetumwa Kikamilifu',
      successMessage: 'Asante sana. Ombi lako limepokelewa na tutawasiliana nawe mara moja.',
      chatViaWhatsapp: 'Wasiliana Papo Hapo kwa WhatsApp',
      close: 'Funga',
    },
  },
  es: {
    nav: {
      stay: 'Alojamiento',
      experiences: 'Experiencias',
      facilities: 'Instalaciones',
      dining: 'Gastronomía',
      explore: 'Explorar',
      concierge: 'Conserje',
      about: 'Nosotros',
      gallery: 'Galería',
      location: 'Ubicación',
      bookStay: 'Reserve Su Estancia',
      planStay: 'Planear Estancia',
      cmsPitch: 'Vista Previa CMS',
    },
    hero: {
      eyebrow: 'Zanzíbar • Tanzania',
      title: 'SU REFUGIO PRIVADO EN TANZANIA',
      subtitle: 'Disfrute del confort, la naturaleza y la hospitalidad auténtica en un destino excepcional.',
      exploreProperty: 'EXPLORAR LA PROPIEDAD',
      bookYourStay: 'RESERVE SU ESTANCIA',
      scrollIndicator: 'DESPLÁCESE PARA DESCUBRIR',
    },
    quickBooking: {
      title: 'Planifique Su Escapada',
      checkIn: 'LLEGADA',
      checkOut: 'SALIDA',
      guests: 'HUÉSPEDES',
      villaChoice: 'VILLA',
      allVillas: 'Seleccione una Villa',
      checkAvailability: 'CONSULTAR DISPONIBILIDAD',
      guestsCount: 'Huéspedes',
    },
    intro: {
      heading: 'UN LUGAR PARA DESACELERAR',
      subhead: 'Donde la Naturaleza se Une al Santuario Moderno',
      body: 'Un refugio privado cuidadosamente diseñado donde el confort contemporáneo se encuentra con la belleza y el alma de Tanzania. Situado en la costa sur de Zanzíbar, cada villa rinde homenaje a la arquitectura swahili.',
      statsVillas: 'VILLAS PRIVADAS',
      statsPool: 'PISCINA INFINITA',
      statsDining: 'RESTAURANTE Y BAR',
      statsSupport: 'ATENCIÓN AL HUÉSPED',
    },
    villas: {
      heading: 'VIVA A SU MANERA',
      subhead: 'Espacios concebidos para el confort, la intimidad y estancias inolvidables.',
      viewVilla: 'VER VILLA',
      bookVilla: 'SOLICITAR RESERVA',
      perNight: 'por noche',
      maxGuests: 'Huéspedes',
      bed: 'Cama',
      bath: 'Baño',
      size: 'Tamaño',
      view: 'Vistas',
      amenities: 'Servicios de la Villa',
      requestBooking: 'Solicitar Esta Villa',
      featuredTag: 'Santuario Destacado',
      allUnits: 'Ver las 8 Villas',
    },
    facilities: {
      heading: 'TODO LO QUE NECESITA',
      subhead: 'Sofisticación sin concesiones diseñada para el bienestar y la máxima relajación.',
    },
    dining: {
      heading: 'SABOREE LA EXPERIENCIA',
      subhead: 'Un viaje culinario desde las especias de Zanzíbar hasta la alta cocina contemporánea.',
      exploreMenu: 'VER MENÚ',
      signatureDishes: 'Platos Exclusivos',
    },
    video: {
      heading: 'DESCUBRA LA PROPIEDAD',
      subhead: 'Un recorrido cinematográfico por nuestro santuario costero.',
      playFilm: 'VER VÍDEO',
      pauseFilm: 'PAUSA',
      storylineConcept: 'Secuencia Narrativa',
      sceneArrival: 'Llegada y Bienvenida',
      sceneExterior: 'Arquitectura Costera',
      sceneVilla: 'Villas Privadas',
      scenePool: 'Piscina Infinita',
      sceneDining: 'Gastronomía Swahili',
      sceneSunset: 'Atardecer en Dhow',
      sceneSafari: 'Horizonte Safari Tanzania',
    },
    experiences: {
      heading: 'MÁS QUE UNA ESTANCIA',
      subhead: 'Aventuras marinas, patrimonio cultural y la puerta de entrada a la fauna africana.',
      tabResort: 'En el Resort',
      tabZanzibar: 'Isla de Zanzíbar',
      tabTanzania: 'Descubra Tanzania (Safari)',
      discoverTanzaniaTitle: 'DESCUBRA TANZANIA',
      discoverTanzaniaText: 'Su estancia puede ser el inicio de un viaje memorable hacia el Serengueti, el Cráter del Ngorongoro y el Kilimanjaro.',
      marketplaceVision: 'Plataforma Turística del Futuro',
    },
    surroundings: {
      heading: 'DESCUBRA LOS ALREDEDORES',
      subhead: 'Aislamiento idílico y cercanía absoluta a las maravillas naturales de Zanzíbar.',
      distance: 'Distancia',
      travelTime: 'Tiempo de Viaje',
    },
    gallery: {
      heading: 'CRÓNICAS VISUALES',
      subhead: 'Una mirada íntima a la luz y la serenidad del Océano Índico.',
      all: 'TODO',
      villas: 'VILLAS',
      rooms: 'HABITACIONES',
      pool: 'PISCINA',
      dining: 'RESTAURANTE',
      food: 'PLATOS',
      beach: 'PLAYA',
      facilities: 'SERVICIOS',
      experiences: 'EXPERIENCIAS',
      fullscreen: 'Pantalla Completa',
    },
    reviews: {
      heading: 'LO QUE DICEN NUESTROS HUÉSPEDES',
      subhead: 'Impresiones de viajeros internacionales.',
      sampleBadge: 'TESTIMONIOS DE DEMOSTRACIÓN',
      sampleNotice: 'Nota de Presentación: Reseñas de muestra ilustradas para la demostración del cliente.',
    },
    ota: {
      heading: 'RESERVE CON TOTAL CONFIANZA',
      subhead: 'Presencia global de lujo y garantía de mejor tarifa directa.',
      notice: 'Disponible en canales seleccionados. Logotipos con fines demostrativos.',
    },
    map: {
      heading: 'DÓNDE ESTAMOS',
      subhead: 'Kizimkazi Dimbani • Costa Sur, Zanzíbar • Tanzania',
      address: 'Dirección',
      phone: 'Teléfono Directo',
      email: 'Correo Concierge',
      whatsapp: 'WhatsApp Concierge',
      getDirections: 'CÓMO LLEGAR',
    },
    finalCta: {
      heading: 'SU EXPERIENCIA EN TANZANIA COMIENZA AQUÍ.',
      subhead: 'Descubra un retiro privado rodeado de confort, naturaleza y auténtica hospitalidad.',
      bookStay: 'RESERVE SU ESTANCIA',
      contactUs: 'CONTÁCTENOS',
    },
    footer: {
      brandStatement: 'Un santuario íntimo de ocho villas en la costa sur de Zanzíbar, uniendo la esencia swahili con el lujo internacional.',
      quickLinks: 'Navegación',
      contactConcierge: 'Conserjería',
      sanctuaryAddress: 'Ubicación',
      allRightsReserved: 'Todos los derechos reservados.',
      clientDemoNotice: 'Modelo de Demostración para Presentación a Propietarios e Inversores.',
    },
    bookingModal: {
      title: 'SOLICITAR RESERVA',
      subtitle: 'Seleccione sus fechas. Nuestro equipo responderá en menos de 4 horas.',
      step1: 'Detalles de la Reserva',
      step2: 'Datos de Contacto',
      selectedVilla: 'Villa Seleccionada',
      dates: 'Fechas',
      guestName: 'Nombre Completo',
      guestEmail: 'Correo Electrónico',
      guestPhone: 'Teléfono / WhatsApp',
      country: 'País de Residencia',
      specialRequests: 'Peticiones Especiales',
      airportTransfer: 'Solicitar Traslado VIP Privado',
      submitRequest: 'ENVIAR SOLICITUD',
      submitting: 'ENVIANDO...',
      successTitle: 'Solicitud Enviada con Éxito',
      successMessage: 'Muchas gracias. Su solicitud de reserva ha sido recibida con éxito.',
      chatViaWhatsapp: 'Contactar por WhatsApp',
      close: 'Cerrar',
    },
  },
  it: {
    nav: {
      stay: 'Soggiorno',
      experiences: 'Esperienze',
      facilities: 'Servizi',
      dining: 'Ristorazione',
      explore: 'Scopri',
      concierge: 'Concierge',
      about: 'Chi Siamo',
      gallery: 'Galleria',
      location: 'Posizione',
      bookStay: 'Prenota il Tuo Soggiorno',
      planStay: 'Prenota',
      cmsPitch: 'Anteprima CMS',
    },
    hero: {
      eyebrow: 'Zanzibar • Tanzania',
      title: 'IL TUO RIFUGIO PRIVATO IN TANZANIA',
      subtitle: 'Vivi il comfort, la natura e un’ospitalità autentica in una destinazione eccezionale.',
      exploreProperty: 'ESPLORA LA PROPRIETÀ',
      bookYourStay: 'PRENOTA IL TUO SOGGIORNO',
      scrollIndicator: 'SCORRI PER SCOPRIRE',
    },
    quickBooking: {
      title: 'Pianifica la Tua Fuga',
      checkIn: 'ARRIVO',
      checkOut: 'PARTENZA',
      guests: 'OSPITI',
      villaChoice: 'VILLA',
      allVillas: 'Seleziona una Villa',
      checkAvailability: 'VERIFICA DISPONIBILITÀ',
      guestsCount: 'Ospiti',
    },
    intro: {
      heading: 'UN LUOGO DOVE RALLENTARE',
      subhead: 'Dove la Natura Incontra il Santuario Moderno',
      body: 'Un rifugio privato progettato con cura dove il comfort moderno incontra la bellezza e il carattere della Tanzania. Situata sulla costa meridionale di Zanzibar, ogni villa rende omaggio all’eredità costiera swahili.',
      statsVillas: 'VILLE PRIVATE',
      statsPool: 'PISCINA A SFIORO',
      statsDining: 'RISTORANTE E BAR',
      statsSupport: 'ASSISTENZA OSPITI',
    },
    villas: {
      heading: 'VIVI A MODO TUO',
      subhead: 'Spazi pensati per il comfort, la privacy e soggiorni indimenticabili.',
      viewVilla: 'VEDI LA VILLA',
      bookVilla: 'RICHIEDI PRENOTAZIONE',
      perNight: 'a notte',
      maxGuests: 'Ospiti',
      bed: 'Letto',
      bath: 'Bagno',
      size: 'Superficie',
      view: 'Vista',
      amenities: 'Servizi della Villa',
      requestBooking: 'Richiedi Questa Villa',
      featuredTag: 'Santuario Esclusivo',
      allUnits: 'Scopri Tutte le 8 Ville',
    },
    facilities: {
      heading: 'TUTTO CIÒ DI CUI HAI BISOGNO',
      subhead: 'Raffinatezza senza compromessi pensata per il benessere e il relax assoluto.',
    },
    dining: {
      heading: 'GUSTA L’ESPERIENZA',
      subhead: 'Un viaggio gastronomico dalle spezie di Zanzibar all’alta cucina internazionale.',
      exploreMenu: 'SCOPRI IL MENU',
      signatureDishes: 'I Nostri Piatti Iconici',
    },
    video: {
      heading: 'SCOPRI LA PROPRIETÀ',
      subhead: 'Un viaggio cinematografico nel nostro santuario costiero privato.',
      playFilm: 'GUARDA IL FILM',
      pauseFilm: 'PAUSA',
      storylineConcept: 'Sequenza Narrativa',
      sceneArrival: 'Arrivo & Benvenuto',
      sceneExterior: 'Architettura Costiera',
      sceneVilla: 'Le Nostre Ville',
      scenePool: 'Piscina a Sfioro',
      sceneDining: 'Arte Culinaria',
      sceneSunset: 'Tramonto sul Dhow',
      sceneSafari: 'Safari in Tanzania',
    },
    experiences: {
      heading: 'PIÙ DI UN SEMPLICE SOGGIORNO',
      subhead: 'Avventure costiere, patrimonio culturale e la porta d’accesso alla fauna africana.',
      tabResort: 'Nel Resort',
      tabZanzibar: 'Isola di Zanzibar',
      tabTanzania: 'Scopri la Tanzania (Safari)',
      discoverTanzaniaTitle: 'SCOPRI LA TANZANIA',
      discoverTanzaniaText: 'Il vostro soggiorno può essere l’inizio di un magnifico viaggio nel Serengeti, nel Cratere di Ngorongoro e sul Kilimangiaro.',
      marketplaceVision: 'Piattaforma Turistica del Futuro',
    },
    surroundings: {
      heading: 'SCOPRI I DINTORNI',
      subhead: 'Tranquillità incontaminata a breve distanza dalle meraviglie di Zanzibar.',
      distance: 'Distanza',
      travelTime: 'Tempo di Viaggio',
    },
    gallery: {
      heading: 'CRONACHE VISIVE',
      subhead: 'Uno sguardo intimo sulla luce e la quiete dell’Oceano Indiano.',
      all: 'TUTTO',
      villas: 'VILLE',
      rooms: 'CAMERE',
      pool: 'PISCINA',
      dining: 'RISTORANTE',
      food: 'PIATTI',
      beach: 'SPIAGGIA',
      facilities: 'SERVIZI',
      experiences: 'ESPERIENZE',
      fullscreen: 'Schermo Intero',
    },
    reviews: {
      heading: 'COSA DICONO I NOSTRI OSPITI',
      subhead: 'Le testimonianze dei nostri ospiti internazionali.',
      sampleBadge: 'RECENSIONI DI DIMOSTRAZIONE',
      sampleNotice: 'Nota di Presentazione: Recensioni dimostrative predisposte per la presentazione al cliente.',
    },
    ota: {
      heading: 'PRENOTA IN TOTALE SICUREZZA',
      subhead: 'Presenza sui principali canali mondiali e miglior tariffa diretta garantita.',
      notice: 'Disponibile tramite canali selezionati. Loghi mostrati a scopo illustrativo.',
    },
    map: {
      heading: 'DOVE SIAMO',
      subhead: 'Kizimkazi Dimbani • Costa Sud, Zanzibar • Tanzania',
      address: 'Indirizzo',
      phone: 'Telefono Diretto',
      email: 'Email Concierge',
      whatsapp: 'WhatsApp Concierge',
      getDirections: 'INDICAZIONI STRADALI',
    },
    finalCta: {
      heading: 'LA TUA ESPERIENZA IN TANZANIA INIZIA QUI.',
      subhead: 'Scoprite un rifugio privato immerso nel comfort, nella natura e nell’ospitalità autentica.',
      bookStay: 'PRENOTA IL TUO SOGGIORNO',
      contactUs: 'CONTATTACI',
    },
    footer: {
      brandStatement: 'Un santuario esclusivo di otto ville sulla costa meridionale di Zanzibar, che unisce l’anima swahili all’ospitalità d’eccellenza.',
      quickLinks: 'Navigazione',
      contactConcierge: 'Concierge',
      sanctuaryAddress: 'Indirizzo',
      allRightsReserved: 'Tutti i diritti riservati.',
      clientDemoNotice: 'Modello dimostrativo per presentazione a proprietari e investitori.',
    },
    bookingModal: {
      title: 'RICHIEDI UNA PRENOTAZIONE',
      subtitle: 'Selezionate le vostre date. Il nostro team vi risponderà entro 4 ore.',
      step1: 'Dettagli del Soggiorno',
      step2: 'Contatti Ospite',
      selectedVilla: 'Villa Preferita',
      dates: 'Date del Soggiorno',
      guestName: 'Nome e Cognome',
      guestEmail: 'Indirizzo Email',
      guestPhone: 'Telefono / WhatsApp',
      country: 'Paese di Residenza',
      specialRequests: 'Richieste Particolari',
      airportTransfer: 'Richiedi Autista VIP Privato',
      submitRequest: 'INVIA RICHIESTA',
      submitting: 'INVIO IN CORSO...',
      successTitle: 'Richiesta Inviata con Successo',
      successMessage: 'Grazie. La vostra richiesta è stata ricevuta dal nostro concierge privato.',
      chatViaWhatsapp: 'Contattaci su WhatsApp',
      close: 'Chiudi',
    },
  },
  ar: {
    nav: {
      stay: 'الإقامة',
      experiences: 'التجارب',
      facilities: 'المرافق',
      dining: 'المطاعم',
      explore: 'استكشف',
      concierge: 'الكونسيرج',
      about: 'من نحن',
      gallery: 'معرض الصور',
      location: 'الموقع',
      bookStay: 'احجز إقامتك',
      planStay: 'احجز الآن',
      cmsPitch: 'معاينة إدارة المحتوى',
    },
    hero: {
      eyebrow: 'زنجبار • تنزانيا',
      title: 'ملاذك الخاص في تنزانيا',
      subtitle: 'اختبر الراحة والطبيعة والضيافة الأصيلة في وجهة استثنائية فريدة.',
      exploreProperty: 'استكشف المنتجع',
      bookYourStay: 'احجز إقامتك',
      scrollIndicator: 'مرر للأسفل للاكتشاف',
    },
    quickBooking: {
      title: 'خطط لملاذك الخاص في زنجبار',
      checkIn: 'تاريخ الوصول',
      checkOut: 'تاريخ المغادرة',
      guests: 'النزلاء',
      villaChoice: 'نوع الإقامة',
      allVillas: 'اختر الفيلا المفضلة',
      checkAvailability: 'تحقق من التوفر',
      guestsCount: 'نزلاء',
    },
    intro: {
      heading: 'مكان للهدوء والسكينة',
      subhead: 'حيث تلتقي الطبيعة الساحرة بالفخامة المعاصرة',
      body: 'ملاذ خاص صُمم بعناية حيث تلتقي الراحة العصرية مع سحر وطبيعة تنزانيا. تقع فيلاتنا على الساحل الجنوبي الهادئ لزنجبار، وتحتفي كل فيلا بالتراث السواحلي العريق مع جدران من حجر المرجان الطبيعي وأخشاب دافئة وشرفات تطل مباشرة على إيقاع المحيط الهندي.',
      statsVillas: 'فيلات خاصة',
      statsPool: 'مسابح خاصة',
      statsDining: 'مطاعم راقية',
      statsSupport: 'خدمة كونسيرج 24/7',
    },
    villas: {
      heading: 'إقامتك بأسلوبك الخاص',
      subhead: 'مساحات مصممة بعناية فائقة لتمنحك الخصوصية والراحة وتجارب لا تُنسى.',
      viewVilla: 'عرض تفاصيل الفيلا',
      bookVilla: 'طلب الحجز',
      perNight: 'لكل ليلة',
      maxGuests: 'نزلاء',
      bed: 'السرير',
      bath: 'الحمام',
      size: 'المساحة',
      view: 'الإطلالة',
      amenities: 'مزايا الفيلا',
      requestBooking: 'حجز هذه الفيلا',
      featuredTag: 'الملاذ المميز',
      allUnits: 'استكشف جميع الفيلات الـ 8',
    },
    facilities: {
      heading: 'كل ما تحتاجه لإقامة مثالية',
      subhead: 'فخامة ورفاهية مخصصة للاسترخاء واستعادة الحيوية والراحة المطلقة.',
    },
    dining: {
      heading: 'تذوق أشهى النكهات',
      subhead: 'رحلة طهي مميزة تجمع المأكولات العربية العريقة والنكهات السواحلية وفنون الطهي العالمية.',
      exploreMenu: 'استكشف قائمة الطعام',
      signatureDishes: 'أبرز الأطباق المميزة',
    },
    video: {
      heading: 'رحلة سينمائية في زنجبار',
      subhead: 'استمتع بمشاهدة تجربة الإقامة الفاخرة وأفق المحيط الهندي الساحر.',
      playFilm: 'تشغيل الفيديو',
      pauseFilm: 'إيقاف مؤقت',
      storylineConcept: 'الفكرة العامة',
      sceneArrival: 'الوصول والاستقبال',
      sceneExterior: 'التصميم والهندسة المعمارية',
      sceneVilla: 'الفيلات الخاصة الفاخرة',
      scenePool: 'المسبح اللامتناهي والمحيط',
      sceneDining: 'تجارب المأكولات والمشروبات',
      sceneSunset: 'غروب الشمس وقوارب الداو',
      sceneSafari: 'رحلات السفاري والتراث',
    },
    experiences: {
      heading: 'تجارب لا تُنسى واكتشف تنزانيا',
      subhead: 'أنشطة استثنائية ورحلات استكشافية مصممة خصيصاً لذكريات تدوم مدى الحياة.',
      tabResort: 'أنشطة المنتجع',
      tabZanzibar: 'جزيرة زنجبار',
      tabTanzania: 'سفاري تنزانيا',
      discoverTanzaniaTitle: 'بوابتك إلى تنزانيا الكبرى',
      discoverTanzaniaText: 'من شواطئ زنجبار الفيروزية الهادئة إلى سهول سيرينغيتي ومحمية نغورونغورو، نوفر لك رحلات طيران خاصة وتجارب سفاري متكاملة.',
      marketplaceVision: 'خدمات متكاملة لجميع احتياجات رحلتك',
    },
    surroundings: {
      heading: 'المعالم المجاورة وسحر الجزيرة',
      subhead: 'عزلة ساحلية هادئة مع سهولة الوصول إلى أبرز معالم زنجبار الطبيعية والتاريخية.',
      distance: 'المسافة',
      travelTime: 'وقت الرحلة',
    },
    gallery: {
      heading: 'معرض الصور الحصري',
      subhead: 'لمحات بصرية من ملاذ زنجيرانجي هاوس الساحر.',
      all: 'الكل',
      villas: 'الفيلات',
      rooms: 'الأجنحة',
      pool: 'المسبح',
      dining: 'المأكولات',
      food: 'الأطباق',
      beach: 'الشاطئ',
      facilities: 'المرافق',
      experiences: 'التجارب',
      fullscreen: 'تكبير الصورة',
    },
    reviews: {
      heading: 'آراء وشهادات ضيوفنا',
      subhead: 'تجارب حقيقية من ضيوف عاشوا رفاهية الإقامة في زنجيرانجي هاوس.',
      sampleBadge: 'تقييمات النزلاء المعتمدة',
      sampleNotice: 'تقييمات موثقة من مسافرين من مختلف أنحاء العالم.',
    },
    ota: {
      heading: 'منصات الحجز العالمية الشريكة',
      subhead: 'معترف به ومصنف كأحد أفضل المنتجعات الفاخرة في شرق أفريقيا.',
      notice: 'احجز مباشرة للحصول على أفضل الأسعار وترقيات مجانية عند التوفر.',
    },
    map: {
      heading: 'الموقع والاتصال',
      subhead: 'كيزيمكازي ديمباني • الساحل الجنوبي، زنجبار • تنزانيا',
      address: 'العنوان',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      whatsapp: 'خدمة الكونسيرج',
      getDirections: 'الاتجاهات على الخريطة',
    },
    finalCta: {
      heading: 'ملاذك الاستثنائي بانتظارك',
      subhead: 'اكتشف منتجعاً خاصاً يجمع الراحة والطبيعة وكرم الضيافة التنزانية الأصيلة.',
      bookStay: 'احجز إقامتك الآن',
      contactUs: 'تواصل معنا',
    },
    footer: {
      brandStatement: 'ملاذ فاخر يضم ثماني فيلات على السواحل الجنوبية لزنجبار، يجمع بين الروح السواحلية والضيافة العالمية المرموقة.',
      quickLinks: 'روابط سريعة',
      contactConcierge: 'الكونسيرج',
      sanctuaryAddress: 'العنوان',
      allRightsReserved: 'جميع الحقوق محفوظة.',
      clientDemoNotice: 'نسخة تجريبية مخصصة للمعاينة وتقديم المشروع للمستثمرين.',
    },
    bookingModal: {
      title: 'طلب حجز إقامة فاخرة',
      subtitle: 'حدد التواريخ المفضلة وسيقوم فريق الكونسيرج بالرد عليك خلال 4 ساعات.',
      step1: 'تفاصيل الإقامة',
      step2: 'بيانات الضيف',
      selectedVilla: 'الفيلا المختارة',
      dates: 'تواريخ الإقامة',
      guestName: 'الاسم الكامل',
      guestEmail: 'البريد الإلكتروني',
      guestPhone: 'رقم الهاتف / الاتصال',
      country: 'دولة الإقامة',
      specialRequests: 'طلبات خاصة',
      airportTransfer: 'طلب خدمة السائق الخاص من وإلى المطار',
      submitRequest: 'إرسال طلب الحجز',
      submitting: 'جارٍ الإرسال...',
      successTitle: 'تم إرسال الطلب بنجاح',
      successMessage: 'شكراً لك. استلم فريق الكونسيرج الخاص بنا طلبك وسيتواصل معك قريباً.',
      chatViaWhatsapp: 'محادثة المساعد الشخصي',
      close: 'إغلاق',
    },
  },
  zh: {
    nav: {
      stay: '住宿空间',
      experiences: '精彩体验',
      facilities: '度假设施',
      dining: '珍馐美馔',
      explore: '探索秘境',
      concierge: '专属礼宾',
      about: '关于我们',
      gallery: '官方画廊',
      location: '地理位置',
      bookStay: '预订尊享入住',
      planStay: '预订入住',
      cmsPitch: '客户管理演示',
    },
    hero: {
      eyebrow: '桑给巴尔 • 坦桑尼亚',
      title: '您在坦桑尼亚的专属私密度假胜地',
      subtitle: '在绝美目的地体验舒适、自然与地道真挚的热情款待。',
      exploreProperty: '探索度假胜地',
      bookYourStay: '预订尊享入住',
      scrollIndicator: '向下滚动探索',
    },
    quickBooking: {
      title: '规划您的桑给巴尔静谧之旅',
      checkIn: '入住日期',
      checkOut: '退房日期',
      guests: '入住人数',
      villaChoice: '房型选择',
      allVillas: '选择心仪别墅',
      checkAvailability: '查询空房',
      guestsCount: '位客人',
    },
    intro: {
      heading: '放慢步调的绝佳殿堂',
      subhead: '当原始旷野自然邂逅现代奢华绿洲',
      body: '精心打造的私密静修圣地，现代奢华与坦桑尼亚的自然风情在此完美交融。度假村坐落于桑给巴尔静谧的南部海岸线，每座独栋别墅均致敬斯瓦希里沿海文化，采用天然珊瑚岩、温润原木与开阔露台，尽揽印度洋的潮起潮落。',
      statsVillas: '私密独栋别墅',
      statsPool: '无边际泳池',
      statsDining: '奢华餐厅与酒吧',
      statsSupport: '24小时贴心管家',
    },
    villas: {
      heading: '尽享心仪居住方式',
      subhead: '专为舒适、私密与难忘回忆量身定制的奢华空间。',
      viewVilla: '查看别墅详情',
      bookVilla: '申请预订',
      perNight: '每晚',
      maxGuests: '位客人',
      bed: '床型',
      bath: '卫浴',
      size: '面积',
      view: '景观',
      amenities: '配套设施',
      requestBooking: '预订此别墅',
      featuredTag: '特别甄选',
      allUnits: '探索全部8栋别墅',
    },
    facilities: {
      heading: '满足您的一切奢享所需',
      subhead: '专为身心疗愈、奢适休憩与优雅生活精心打造的高端设施。',
    },
    dining: {
      heading: '品味舌尖上的非凡飨宴',
      subhead: '融汇传统斯瓦希里香料、正宗阿拉伯风味与现代国际高级料理的味觉之旅。',
      exploreMenu: '探索主厨菜单',
      signatureDishes: '主厨招牌品鉴特色',
    },
    video: {
      heading: '电影级沉浸式风光展映',
      subhead: '随镜头步入印度洋畔的奢华度假殿堂。',
      playFilm: '播放影片',
      pauseFilm: '暂停播放',
      storylineConcept: '分镜概念',
      sceneArrival: '贵宾专车接机与迎宾礼遇',
      sceneExterior: '古猴面包树林与建筑风貌',
      sceneVilla: '纯手作柚木私密别墅内景',
      scenePool: '俯瞰珊瑚礁的无边际泳池',
      sceneDining: '新鲜海鲜与烛光海边晚宴',
      sceneSunset: '传统木制独桅帆船日落巡游',
      sceneSafari: '飞越塞伦盖蒂的探险启程',
    },
    experiences: {
      heading: '特色体验与探索坦桑尼亚',
      subhead: '为您量身定制的私家活动与精彩探险，铸就终生难忘的旅程回忆。',
      tabResort: '度假村内体验',
      tabZanzibar: '桑给巴尔本岛',
      tabTanzania: '坦桑尼亚旷野',
      discoverTanzaniaTitle: '开启坦桑尼亚辽阔旷野之旅',
      discoverTanzaniaText: '从桑给巴尔蔚蓝宁静的海滩，直飞塞伦盖蒂大草原与恩戈罗恩戈罗火山口，我们提供完备的私人专机与奢华野奢猎游安排。',
      marketplaceVision: '一站式顶级度假与探险生态',
    },
    surroundings: {
      heading: '周边风光与著名名胜',
      subhead: '远离喧嚣的海滨隐逸，同时便捷通达桑给巴尔的历史古迹与自然奇观。',
      distance: '距离',
      travelTime: '车程',
    },
    gallery: {
      heading: '官方影像画廊',
      subhead: '桑吉朗吉之家的视觉美学呈现。',
      all: '全部',
      villas: '独栋别墅',
      rooms: '客房套房',
      pool: '泳池景致',
      dining: '餐厅环境',
      food: '特色珍馐',
      beach: '沙滩海岸',
      facilities: '度假配套',
      experiences: '活动体验',
      fullscreen: '全屏大图',
    },
    reviews: {
      heading: '宾客真实评价与见证',
      subhead: '来自全球旅行家在桑吉朗吉之家的真实体验与赞誉。',
      sampleBadge: '认证住客真实评价',
      sampleNotice: '汇聚全球各大奢华旅行平台真实住客心声。',
    },
    ota: {
      heading: '全球官方合作渠道',
      subhead: '屡获殊荣，荣膺东非顶级奢华度假别墅称号。',
      notice: '通过官网直接预订可尊享最优价格保证及免费房型升级礼遇。',
    },
    map: {
      heading: '地理位置与联络方式',
      subhead: '基济姆卡齐迪姆巴尼 • 南岸，桑给巴尔 • 坦桑尼亚',
      address: '详细地址',
      phone: '贵宾专线',
      email: '电子邮箱',
      whatsapp: '管家助理',
      getDirections: '地图导航指引',
    },
    finalCta: {
      heading: '开启您的海滨私享假期',
      subhead: '在舒适、自然与坦桑尼亚真挚待客之道中，发现属于您的私密度假天堂。',
      bookStay: '立即预订奢华入住',
      contactUs: '联系管家团队',
    },
    footer: {
      brandStatement: '位于桑给巴尔南部海岸的八栋尊享私密独栋别墅群，将斯瓦希里文化精髓与世界级奢华待客之道完美融合。',
      quickLinks: '快速导航',
      contactConcierge: '礼宾服务',
      sanctuaryAddress: '度假村地址',
      allRightsReserved: '版权所有 翻印必究。',
      clientDemoNotice: '专为业主与投资人打造的客户管理系统演示版本。',
    },
    bookingModal: {
      title: '申请奢华别墅预订',
      subtitle: '选择您的理想日期，我们的私家管家团队将在4小时内给予确认。',
      step1: '预订行程详情',
      step2: '住客联系信息',
      selectedVilla: '所选心仪别墅',
      dates: '入住与退房日期',
      guestName: '贵宾姓名',
      guestEmail: '电子邮箱',
      guestPhone: '联系电话',
      country: '常住国家/地区',
      specialRequests: '个性化特别需求',
      airportTransfer: '预订往返机场VIP私人专车接送',
      submitRequest: '提交预订申请',
      submitting: '正在提交...',
      successTitle: '预订申请提交成功',
      successMessage: '感谢您的选择。我们的专属礼宾团队已收到您的申请，将竭诚为您安排一切。',
      chatViaWhatsapp: '在线管家客服',
      close: '关闭窗口',
    },
  },
  pl: {
    nav: {
      stay: 'POBYT',
      experiences: 'DOŚWIADCZENIA',
      facilities: 'Udogodnienia',
      dining: 'RESTAURACJA',
      explore: 'ODKRYJ',
      concierge: 'KONSJERŻ',
      about: 'O NAS',
      gallery: 'Galeria',
      location: 'Lokalizacja',
      bookStay: 'ZAREZERWUJ POBYT',
      planStay: 'ZAPLANUJ POBYT',
      cmsPitch: 'Panel Klienta',
    },
    hero: {
      eyebrow: 'ZANZIBAR, TANZANIA • ZANZIRANGI HOUSE',
      title: 'TWÓJ PRYWATNY PORTAL DO ZANZIBARU',
      subtitle: 'Zamieszkaj, odkrywaj i poznaj wyspę — z bezkresną Tanzanią na wyciągnięcie ręki.',
      exploreProperty: 'ODKRYJ REZYDENCJĘ',
      bookYourStay: 'ZAPLANUJ PODRÓŻ',
      scrollIndicator: 'Przewiń, aby odkryć',
    },
    quickBooking: {
      title: 'Sprawdź Dostępność i Zaplanuj Swój Pobyt',
      checkIn: 'Data Przyjazdu',
      checkOut: 'Data Wyjazdu',
      guests: 'Liczba Gości',
      villaChoice: 'Kategoria Willi',
      allVillas: 'Wszystkie Wille i Apartamenty',
      checkAvailability: 'Sprawdź Dostępność',
      guestsCount: 'Gości',
    },
    intro: {
      heading: 'WIĘCEJ NIŻ POBYT',
      subhead: 'Odkryj prywatną oazę, gdzie urok Zanzibaru spotyka się z ciepłem autentycznej gościnności.',
      body: 'Zanzirangi House to kameralne schronienie położone na spokojnym południowym wybrzeżu Zanzibaru w Kizimkazi. Oferujemy nie tylko ekskluzywne wille, ale przede wszystkim pełne doświadczenie Tanzanii: kuchnię organiczną z ogrodu, rejsy tradycyjnymi dhow, spotkania z delfinami oraz bezpośrednie loty na safari do Serengeti.',
      statsVillas: 'Ekskluzywnych Willi i Bungalowów',
      statsPool: 'Basen Infinity z Widokiem na Ocean',
      statsDining: 'Restauracja z Własnym Ogrodem',
      statsSupport: 'Osobisty Konsjerż i Lokaj 24/7',
    },
    villas: {
      heading: 'ZAMIESZKAJ PO SWOJEMU',
      subhead: 'Osiem ręcznie wykończonych rezydencji stworzonych z myślą o prywatności, komforcie i naturalnym rytmie oceanu.',
      viewVilla: 'ODKRYJ TEN POKÓJ',
      bookVilla: 'Zapytaj o tę willę',
      perNight: 'za noc',
      maxGuests: 'Maks. liczba osób',
      bed: 'Łóżko',
      bath: 'Łazienka',
      size: 'Powierzchnia',
      view: 'Widok',
      amenities: 'W cenie pobytu',
      requestBooking: 'ZAPYTAJ O REZERWACJĘ',
      featuredTag: 'Rekomendowane',
      allUnits: 'Wszystkie Pokoje i Wille',
    },
    facilities: {
      heading: 'PRZESTRZENIE REZYDENCJI',
      subhead: 'Stworzone do niespiesznego relaksu i odnowy zmysłów pod palmami Zanzibaru',
    },
    dining: {
      heading: 'SMAKI ZANZIBARU',
      subhead: 'Kulinarna podróż od naszego bujnego ogrodu wprost na Twój stół',
      exploreMenu: 'Zobacz Kartę Dań',
      signatureDishes: 'Specjalności Szefa Kuchni',
    },
    video: {
      heading: 'FILMOWA PODRÓŻ',
      subhead: 'Poczuj magię Zanzirangi House i zachwycające krajobrazy Tanzanii',
      playFilm: 'Odtwórz Film',
      pauseFilm: 'Zatrzymaj Film',
      storylineConcept: 'Koncepcja Filmowa',
      sceneArrival: 'Przyjazd i Powitanie',
      sceneExterior: 'Tropikalna Natura',
      sceneVilla: 'Prywatna Willa',
      scenePool: 'Basen Infinity',
      sceneDining: 'Kolacja pod Gwiazdami',
      sceneSunset: 'Zachód Słońca na Oceanie',
      sceneSafari: 'Przygoda Safari',
    },
    experiences: {
      heading: 'DOŚWIADCZENIA',
      subhead: 'Odkryj magię Zanzibaru i bezkresne przestrzenie Tanzanii',
      tabResort: 'W Rezydencji',
      tabZanzibar: 'Wyspa Zanzibar',
      tabTanzania: 'Safari w Tanzanii',
      discoverTanzaniaTitle: 'JEDNA WYSPA. CAŁA TANZANIA DO ODKRYCIA.',
      discoverTanzaniaText: 'Połącz relaks na białych plażach z prywatnym przelotem czarterowym na safari do Parku Narodowego Serengeti, krateru Ngorongoro i pod Kilimandżaro.',
      marketplaceVision: 'Indywidualny program podróży szyty na miarę',
    },
    surroundings: {
      heading: 'ATRAKCJE W POBLIŻU',
      subhead: 'Ciekawe miejsca i skarby południowego wybrzeża Zanzibaru',
      distance: 'Odległość',
      travelTime: 'Czas dojazdu',
    },
    gallery: {
      heading: 'GALERIA WIZUALNA',
      subhead: 'Zajrzyj do naszego tropikalnego sanktuarium',
      all: 'Wszystkie',
      villas: 'Wille',
      rooms: 'Pokoje',
      pool: 'Basen',
      dining: 'Restauracja',
      food: 'Kuchnia',
      beach: 'Plaża',
      facilities: 'Przestrzenie',
      experiences: 'Przygody',
      fullscreen: 'Pełny ekran',
    },
    reviews: {
      heading: 'WRAŻENIA GOŚCI',
      subhead: 'Opinie podróżników, którzy wybrali Zanzirangi House',
      sampleBadge: 'Zweryfikowany Gość',
      sampleNotice: 'Autentyczne relacje z pobytu w Kizimkazi, Zanzibar',
    },
    ota: {
      heading: 'ZAUFANI PARTNERZY',
      subhead: 'Wysokie oceny w wiodących światowych portalach podróżniczych',
      notice: 'Gwarancję najlepszych stawek oraz indywidualne przywileje zyskujesz przy rezerwacji bezpośredniej.',
    },
    map: {
      heading: 'LOKALIZACJA I DOJAZD',
      subhead: 'Kizimkazi Dimbani, spokojne południowe wybrzeże Zanzibaru',
      address: 'Adres',
      phone: 'Telefon',
      email: 'E-mail',
      whatsapp: 'Wsparcie Konsjerża',
      getDirections: 'Otwórz w Google Maps',
    },
    finalCta: {
      heading: 'ZAPLANUJ SWOJĄ PODRÓŻ DO RAJU',
      subhead: 'Niezapomniane chwile spokoju, autentycznych smaków i bezkresnego błękitu Oceanu Indyjskiego.',
      bookStay: 'ZAREZERWUJ POBYT',
      contactUs: 'SKONTAKTUJ SIĘ Z NAMI',
    },
    footer: {
      brandStatement: 'Kameralna luksusowa rezydencja na Zanzibarze, będąca bramą do odkrywania wyspy i wypraw safari w głąb Tanzanii.',
      quickLinks: 'Nawigacja',
      contactConcierge: 'Konsjerż i Kontakt',
      sanctuaryAddress: 'Kizimkazi Dimbani, Południowe Wybrzeże, Zanzibar, Tanzania',
      allRightsReserved: 'Wszelkie prawa zastrzeżone.',
      clientDemoNotice: 'Wersja demonstracyjna platformy Zanzirangi House.',
    },
    bookingModal: {
      title: 'Zapytanie o Rezerwację Willi',
      subtitle: 'Wprowadź preferowane daty, a nasz dedykowany konsjerż odpowie z ofertą w ciągu 4 godzin.',
      step1: 'Szczegóły Pobytu',
      step2: 'Dane Kontaktowe',
      selectedVilla: 'Wybrana Willa',
      dates: 'Termin Pobytu',
      guestName: 'Imię i Nazwisko',
      guestEmail: 'Adres E-mail',
      guestPhone: 'Numer Telefonu',
      country: 'Kraj Zamieszkania',
      specialRequests: 'Życzenia Specjalne (dieta, okazja, życzenia dot. willi)',
      airportTransfer: 'Prywatny transfer VIP z lotniska ZNZ',
      submitRequest: 'WYŚLIJ ZAPYTANIE',
      submitting: 'Wysyłanie...',
      successTitle: 'Zapytanie Zostało Wysłane',
      successMessage: 'Dziękujemy! Nasz zespół konsjerża zweryfikuje dostępność willi i skontaktuje się z Tobą.',
      chatViaWhatsapp: 'Czat z Działem Obsługi',
      close: 'Zamknij',
    },
  },
};
