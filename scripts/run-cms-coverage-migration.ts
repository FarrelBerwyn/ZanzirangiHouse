import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { SHUTTLE_TRANSLATIONS, WHY_STAY_TRANSLATIONS } from '../src/data/serviceTranslations.ts';
import { DINING_CATEGORIES } from '../src/data/dining.ts';
import { EXPERIENCES_DATA } from '../src/data/experiences.ts';
import { TANZANIA_DESTINATIONS } from '../src/data/tanzaniaDestinations.ts';

async function runMigration() {
  console.log('================================================================');
  console.log('ZANZIRANGI HOUSE: CMS COVERAGE & ADMIN ACCESS MIGRATION (003)');
  console.log('================================================================');

  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || '';

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
  });

  console.log(`Connected to MySQL: ${user}@${host}:${port}/${database}`);

  // 1. Run SQL schema file
  const sqlPath = path.resolve('server/database/migrations/003_full_cms_coverage.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  const statements = sql
    .split(';')
    .map((s) => s.replace(/^(\s*--[^\n]*\n)+/g, '').trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await pool.query(stmt);
    console.log('✓ Executed:', stmt.substring(0, 50).replace(/\n/g, ' ') + '...');
  }

  // 2. Set default permissions and status for existing users
  const ALL_PERMISSIONS = [
    'dashboard',
    'pages',
    'homepage',
    'villas',
    'gallery',
    'videos',
    'facilities',
    'testimonials',
    'dining',
    'experiences',
    'safari',
    'transfers',
    'contact',
    'seo',
    'media',
    'settings',
    'admin_access',
  ];

  await pool.query(`
    UPDATE users 
    SET status = COALESCE(NULLIF(status, ''), 'active'),
        permissions = CASE 
          WHEN permissions IS NULL OR permissions = 'null' 
          THEN ? 
          ELSE permissions 
        END,
        token_version = COALESCE(token_version, 1)
  `, [JSON.stringify(ALL_PERMISSIONS)]);
  console.log('✓ Updated existing users with active status and module permissions.');

  // 3. Seed Page Contents (INSERT IGNORE)
  const defaultPages = [
    {
      id: 'villas',
      slug: 'villas',
      title: 'Private Villas in Zanzibar',
      eyebrow: 'KIZIMKAZI DIMBANI • SOUTH COAST ZANZIBAR',
      heading: 'Private Villas in Zanzibar',
      subheading: 'Exclusive 8-Villa Coastal Sanctuary',
      description: 'Discover our 8 private artisanal residences ranging from 78 m² to 95 m². Each villa features a 100% private freshwater plunge pool, authentic Swahili coral-stone architecture, and personalized 24/7 dedicated butler service.',
      hero_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header & Narrative', order: 1, visible: true },
        { id: 'villas_grid', name: '8 Private Villas Collection', order: 2, visible: true },
        { id: 'facilities', name: 'Sanctuary Facilities & Spa', order: 3, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 4, visible: true },
      ]),
    },
    {
      id: 'dining',
      slug: 'dining',
      title: 'Oceanfront Dining',
      eyebrow: 'OCEAN-TO-TABLE & FARM-TO-TABLE GASTRONOMY',
      heading: 'Oceanfront Dining',
      subheading: 'Authentic Flavours & Swahili Spices',
      description: 'Taste authentic Zanzibar culinary heritage blending Swahili spices with Indian Ocean seafood caught daily by Kizimkazi artisanal dhow fishermen. Enjoy private veranda dining, beach barbecues, and bespoke candlelit dinners under the stars.',
      hero_image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header & Philosophy', order: 1, visible: true },
        { id: 'dining_section', name: 'Culinary Soul & Tasting Portfolios', order: 2, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 3, visible: true },
      ]),
    },
    {
      id: 'experiences',
      slug: 'experiences',
      title: 'Zanzibar Experiences',
      eyebrow: 'CURATED ISLAND ADVENTURES • MENAI BAY & BEYOND',
      heading: 'Zanzibar Experiences',
      subheading: 'Intimate Discoveries With Private Guides',
      description: 'From ethical wild dolphin encounters in the Menai Bay Marine Reserve to private Stone Town UNESCO heritage tours, organic spice trails, and sunset dhow sailing—experience Zanzibar with our dedicated private guides.',
      hero_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header', order: 1, visible: true },
        { id: 'experiences_grid', name: 'Curated Experiences Collection', order: 2, visible: true },
        { id: 'explore_zanzibar', name: 'Regional Island Highlights', order: 3, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 4, visible: true },
      ]),
    },
    {
      id: 'safari',
      slug: 'safari',
      title: 'Tanzania Safari',
      eyebrow: 'FLY-IN BUSH & BEACH EXPEDITIONS • TANZANIA MAINLAND',
      heading: 'Tanzania Safari',
      subheading: 'Seamless Bush & Beach Connections',
      description: 'Combine your barefoot luxury retreat in Zanzibar with world-class mainland safaris. We coordinate 90-minute private air charters directly to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro with premier luxury safari camps.',
      hero_image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header', order: 1, visible: true },
        { id: 'safari_destinations', name: 'Mainland Safari Expeditions', order: 2, visible: true },
        { id: 'itinerary_builder', name: 'Custom Itinerary Builder', order: 3, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 4, visible: true },
      ]),
    },
    {
      id: 'about',
      slug: 'about',
      title: 'About Zanzirangi House',
      eyebrow: 'BAREFOOT LUXURY • SWAHILI-OMANI HERITAGE',
      heading: 'About Zanzirangi House',
      subheading: 'An Intimate Sanctuary on Zanzibar’s Peaceful South Coast',
      description: 'Nestled along the pristine southern coral coast of Kizimkazi Dimbani, Zanzirangi House is an ultra-boutique private sanctuary designed to offer total seclusion, architectural harmony, and intimate Zanzibar hospitality.',
      hero_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header', order: 1, visible: true },
        { id: 'property_intro', name: 'More Than A Stay Intro', order: 2, visible: true },
        { id: 'property_experience', name: 'Discover The Retreat', order: 3, visible: true },
        { id: 'why_stay', name: 'Why Zanzirangi House Pillars', order: 4, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 5, visible: true },
      ]),
    },
    {
      id: 'contact',
      slug: 'contact',
      title: 'Contact & Reservations',
      eyebrow: 'DIRECT CONCIERGE & INQUIRIES',
      heading: 'Contact & Reservations',
      subheading: '24/7 Dedicated Butler & Concierge Service',
      description: 'Plan your bespoke stay with our concierge team. Whether arranging private villa availability, 45-minute airport transfers from ZNZ, or custom Tanzania safari itineraries, we are available 24/7.',
      hero_image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2400&q=90',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Page Header', order: 1, visible: true },
        { id: 'concierge', name: '24/7 Concierge Channels', order: 2, visible: true },
        { id: 'shuttle', name: 'VIP Chauffeur & Transfers', order: 3, visible: true },
        { id: 'map', name: 'Location & Interactive Map', order: 4, visible: true },
        { id: 'internal_links', name: 'Exploration Links', order: 5, visible: true },
      ]),
    },
    {
      id: 'privacy',
      slug: 'privacy',
      title: 'Privacy Policy',
      eyebrow: 'LEGAL & TRUST ASSURANCE',
      heading: 'Privacy Policy',
      subheading: 'Guest Data Protection & Trust Safeguards',
      description: 'At Zanzirangi House, safeguarding our guests’ personal data and privacy is of utmost importance.',
      hero_image: '',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Header & Version Date', order: 1, visible: true },
        { id: 'content', name: 'Policy Clauses & Articles', order: 2, visible: true },
      ]),
      content_json: JSON.stringify({
        lastUpdated: 'September 2026',
        introText: 'At Zanzirangi House (accessible from https://zanzirangihouse.com/), safeguarding our guests’ personal data and privacy is of utmost importance. This Privacy Policy details how we collect, use, and protect information when you visit our website, submit booking inquiries, or communicate with our concierge team.',
        sections: [
          {
            title: '1. Information We Collect',
            body: 'When submitting an inquiry or reserving a private villa, you may provide details including your full name, email address, telephone/WhatsApp number, arrival/departure dates, guest party size, and special hospitality or dietary preferences.',
          },
          {
            title: '2. How We Use Your Information',
            items: [
              'Facilitating reservation inquiries and room availability checks.',
              'Coordinating airport chauffeur transfers from Abeid Amani Karume International Airport (ZNZ).',
              'Customizing private dining, marine dolphin tours, and mainland Tanzania safari connections.',
              'Providing 24/7 personal butler and concierge communications.',
            ],
          },
          {
            title: '3. Data Security & Third-Party Disclosure',
            body: 'We implement strict technical and administrative safeguards. We do not sell, rent, or lease guest information to third-party commercial marketing networks. Data is shared exclusively with licensed local service providers (such as official TANAPA safari charter operators) strictly to fulfill your agreed itinerary.',
          },
          {
            title: '4. Contact Our Concierge',
            body: 'For any privacy inquiries or to request data removal, contact our data protection team directly at concierge@zanzirangihouse.com or via official telephone at +255 777 890 123.',
          },
        ],
      }),
    },
    {
      id: 'terms',
      slug: 'terms',
      title: 'Terms & Conditions',
      eyebrow: 'HOSPITALITY POLICIES & TERMS',
      heading: 'Terms & Conditions',
      subheading: 'Hospitality Guidelines & Reservation Policies',
      description: 'Welcome to Zanzirangi House. By accessing our website or submitting reservation requests, you agree to comply with our hospitality guidelines.',
      hero_image: '',
      sections_config: JSON.stringify([
        { id: 'header', name: 'Header & Version Date', order: 1, visible: true },
        { id: 'content', name: 'Terms Clauses & Articles', order: 2, visible: true },
      ]),
      content_json: JSON.stringify({
        lastUpdated: 'September 2026',
        introText: 'Welcome to Zanzirangi House. By accessing our website (https://zanzirangihouse.com/) or submitting accommodation and excursion requests, you agree to comply with the following hospitality terms and reservation guidelines.',
        sections: [
          {
            title: '1. Reservations & Payments',
            body: 'Nightly villa rates range between $390 and $480+ USD and include private plunge pool access, gourmet breakfast, and 24/7 dedicated butler service. Confirmation requires an agreed deposit or voucher via official reservation channels.',
          },
          {
            title: '2. Check-In & Check-Out Times',
            body: 'Standard check-in is from 14:00 (2:00 PM), and check-out is by 11:00 (11:00 AM). Early arrival or late departure may be requested through your personal concierge, subject to villa availability.',
          },
          {
            title: '3. Marine Conservation & Wildlife Etiquette',
            body: 'Zanzirangi House borders the Menai Bay Marine Conservation Area. Guests participating in dhow sailing and dolphin excursions agree to follow ethical wildlife protocols, maintaining respectful distances from marine wildlife in compliance with local environmental regulations.',
          },
          {
            title: '4. Inquiries & Cancellations',
            body: 'To modify or cancel a reservation, contact our concierge directly via email at concierge@zanzirangihouse.com or WhatsApp at +255 777 890 123.',
          },
        ],
      }),
    },
  ];

  for (const page of defaultPages) {
    await pool.query(
      `INSERT IGNORE INTO page_contents 
       (id, slug, title, eyebrow, heading, subheading, description, hero_image, sections_config, content_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        page.id,
        page.slug,
        page.title,
        page.eyebrow,
        page.heading,
        page.subheading,
        page.description,
        page.hero_image,
        page.sections_config,
        page.content_json || null,
      ]
    );
  }
  console.log(`✓ Seeded default page contents (${defaultPages.length} pages).`);

  // 4. Seed Chauffeur Config (INSERT IGNORE)
  const shuttleEn = SHUTTLE_TRANSLATIONS.en;
  await pool.query(
    `INSERT IGNORE INTO chauffeur_config 
     (id, eyebrow, heading, subhead, route_label, route_title, vehicle_image, specs_eyebrow, card_title, airport_title, airport_desc, shuttle_title, shuttle_desc, vehicle_type_title, vehicle_type_desc, passenger_luggage_title, passenger_luggage_desc, amenities_note, cta_request_label, cta_add_booking_label, spec_items_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      shuttleEn.eyebrow,
      shuttleEn.heading,
      shuttleEn.subhead,
      shuttleEn.routeLabel,
      shuttleEn.routeTitle,
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=85',
      shuttleEn.specsEyebrow,
      shuttleEn.cardTitle,
      shuttleEn.airportTitle,
      shuttleEn.airportDesc,
      shuttleEn.shuttleTitle,
      shuttleEn.shuttleDesc,
      shuttleEn.vehicleLabel,
      shuttleEn.vehicleValue,
      shuttleEn.paxLabel,
      shuttleEn.paxValue,
      shuttleEn.safetyNote,
      shuttleEn.ctaRequest,
      shuttleEn.ctaAddBooking,
      JSON.stringify([
        {
          id: 'spec-1',
          type: 'airport',
          title: shuttleEn.airportTitle,
          description: shuttleEn.airportDesc,
          icon: 'Plane',
          order: 1,
          visible: true,
        },
        {
          id: 'spec-2',
          type: 'shuttle',
          title: shuttleEn.shuttleTitle,
          description: shuttleEn.shuttleDesc,
          icon: 'Car',
          order: 2,
          visible: true,
        },
        {
          id: 'spec-3',
          type: 'vehicle_type',
          title: shuttleEn.vehicleLabel,
          description: shuttleEn.vehicleValue,
          icon: 'Car',
          order: 3,
          visible: true,
        },
        {
          id: 'spec-4',
          type: 'passenger_luggage',
          title: shuttleEn.paxLabel,
          description: shuttleEn.paxValue,
          icon: 'Users',
          order: 4,
          visible: true,
        },
      ]),
    ]
  );
  console.log('✓ Seeded chauffeur config.');

  // 5. Seed Why Stay Config (INSERT IGNORE)
  const whyStayEn = WHY_STAY_TRANSLATIONS.en;
  const PILLAR_IMAGES = [
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=85',
  ];
  const formattedPillars = whyStayEn.pillars.map((p, idx) => ({
    id: `pillar-${idx + 1}`,
    number: p.number,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    image: PILLAR_IMAGES[idx] || PILLAR_IMAGES[0],
    order: idx + 1,
    visible: true,
  }));

  await pool.query(
    `INSERT IGNORE INTO why_stay_config (id, eyebrow, heading, subhead, pillars_json)
     VALUES (?, ?, ?, ?, ?)`,
    [
      1,
      whyStayEn.eyebrow,
      whyStayEn.heading,
      whyStayEn.subhead,
      JSON.stringify(formattedPillars),
    ]
  );
  console.log('✓ Seeded why stay config.');

  // 6. Seed Dining Config & Categories (INSERT IGNORE)
  await pool.query(
    `INSERT IGNORE INTO dining_config 
     (id, eyebrow, heading, subhead, intro, garden_eyebrow, garden_badge, garden_title, garden_desc, tag_zero_miles, tag_spices, tag_seafood, moments_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      'Gastronomic Soul',
      'TASTE ZANZIBAR',
      '"Fresh ingredients, island flavours and authentic Tanzanian hospitality."',
      'Centuries of Swahili, Omani, and Indian Ocean sea trade come together at our tables. From line-caught fish brought ashore at sunrise to slow-simmered aromatic curries, dining at Zanzirangi House is an authentic sensory journey.',
      'Culinary Storytelling',
      'Estate Garden',
      'FROM OUR GARDEN TO YOUR TABLE',
      'Tucked within the grounds of Zanzirangi House is our private botanical garden, where our kitchen team cultivates organic lemongrass, green chilies, wild basil, sweet mint, fragrant cardamom, and seasonal vegetables. What is harvested in the morning directly shapes our daily tasting menus, pairing earth-grown vitality with the fresh catch of southern Zanzibar’s waters.',
      '🌱 Zero Food Miles',
      '🌶 Hand-Picked Daily Spices',
      '🐟 Sustainable Coastal Seafood',
      JSON.stringify([
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
      ]),
    ]
  );

  for (let i = 0; i < DINING_CATEGORIES.length; i++) {
    const cat = DINING_CATEGORIES[i];
    await pool.query(
      `INSERT IGNORE INTO dining_categories (id, name, tab_label, subtitle, description, image_url, dishes_json, sort_order, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cat.id,
        cat.name,
        cat.tabLabel,
        cat.subtitle,
        cat.description,
        cat.image,
        JSON.stringify(cat.signatureDishes),
        i + 1,
        true,
      ]
    );
  }
  console.log('✓ Seeded dining config & categories.');

  // 7. Seed Experiences (INSERT IGNORE)
  for (let i = 0; i < EXPERIENCES_DATA.length; i++) {
    const exp = EXPERIENCES_DATA[i];
    await pool.query(
      `INSERT IGNORE INTO experiences (id, title, category, duration, tag, price_note, short_description, description, image_url, whatsapp_message, sort_order, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        exp.id,
        exp.title,
        exp.category,
        exp.duration,
        exp.tag,
        exp.priceNote,
        exp.shortDescription,
        exp.description,
        exp.image,
        exp.whatsappMessage,
        i + 1,
        true,
      ]
    );
  }
  console.log(`✓ Seeded experiences collection (${EXPERIENCES_DATA.length} items).`);

  // 8. Seed Safari Destinations (INSERT IGNORE)
  for (let i = 0; i < TANZANIA_DESTINATIONS.length; i++) {
    const dest = TANZANIA_DESTINATIONS[i];
    await pool.query(
      `INSERT IGNORE INTO safari_destinations (id, name, tagline, region, flight_time, hero_image, description, highlights_json, best_for, safari_type, sort_order, visible)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dest.id,
        dest.name,
        dest.tagline,
        dest.region,
        dest.flightTimeFromZanzibar,
        dest.heroImage,
        dest.description,
        JSON.stringify(dest.highlights),
        dest.bestFor,
        dest.safariType,
        i + 1,
        true,
      ]
    );
  }
  console.log(`✓ Seeded safari destinations collection (${TANZANIA_DESTINATIONS.length} destinations).`);

  // 9. Seed Global Content (INSERT IGNORE)
  await pool.query(
    `INSERT IGNORE INTO global_content 
     (id, brand_name, nav_links_json, cta_plan_stay_label, cta_plan_stay_link, footer_tagline, footer_copyright, contact_phone, contact_email, contact_whatsapp, contact_address, socials_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      'Zanzirangi House',
      JSON.stringify([
        { label: 'STAY', href: '/villas', order: 1, visible: true },
        { label: 'DINING', href: '/dining', order: 2, visible: true },
        { label: 'EXPERIENCES', href: '/experiences', order: 3, visible: true },
        { label: 'SAFARI', href: '/safari', order: 4, visible: true },
        { label: 'ABOUT', href: '/about', order: 5, visible: true },
        { label: 'CONTACT', href: '/contact', order: 6, visible: true },
      ]),
      'PLAN YOUR STAY',
      '#stay',
      'An intimate sanctuary between the ocean breeze and Swahili heritage.',
      '© 2026 Zanzirangi House. All rights reserved. Kizimkazi Dimbani, South Coast Zanzibar, Tanzania.',
      '+255 777 890 123',
      'concierge@zanzirangihouse.com',
      '255777890123',
      'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
      JSON.stringify({
        instagram: 'https://instagram.com/zanzirangihouse',
        facebook: 'https://facebook.com/zanzirangihouse',
        tiktok: 'https://tiktok.com/@zanzirangihouse',
        youtube: 'https://youtube.com/@zanzirangihouse',
        whatsapp: 'https://wa.me/255777890123',
      }),
    ]
  );
  console.log('✓ Seeded global content.');

  // Record migration version
  try {
    await pool.query(
      'INSERT INTO schema_migrations (version) VALUES (?) ON DUPLICATE KEY UPDATE applied_at = CURRENT_TIMESTAMP',
      ['003_full_cms_coverage']
    );
    console.log('✓ Recorded migration 003_full_cms_coverage in schema_migrations.');
  } catch (mErr: any) {
    console.warn('Notice recording schema_migrations:', mErr.message);
  }

  await pool.end();
  console.log('\n================================================================');
  console.log('✅ MIGRATION 003 COMPLETED SUCCESSFULLY WITHOUT ERRORS');
  console.log('================================================================');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
