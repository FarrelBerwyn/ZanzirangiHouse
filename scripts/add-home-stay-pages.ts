import { getMysqlPool } from '../server/database/connection.ts';

async function main() {
  const pool = getMysqlPool();
  await pool.query(`
    INSERT IGNORE INTO page_contents (id, slug, title, eyebrow, heading, subheading, description, hero_image, sections_config, content_json)
    VALUES
    ('page_home', 'home', 'Home - Zanzirangi House', 'OCEANFRONT SANCTUARY', 'A Sanctuary of Quiet Splendour', 'Kizimkazi • Zanzibar', 'Exclusive ultra-luxury oceanfront private plunge pool villas overlooking the sapphire waters of Zanzibar.', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=85',
     ?,
     ?
    ),
    ('page_stay', 'stay', 'Stay - Private Villas & Residences', 'THE RESIDENCES', 'Sanctuary Plunge Pool Villas', 'Kizimkazi, Zanzibar', 'Discover our 8 private plunge pool ocean villas and beachfront residences crafted in organic Swahili minimalism.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2000&q=85',
     ?,
     ?
    )
  `, [
    JSON.stringify([
      { id: 'hero', name: 'Hero Slides & Narrative', visible: true, order: 1 },
      { id: 'intro', name: 'Narrative Introduction', visible: true, order: 2 },
      { id: 'villas', name: 'Villas & Accommodations', visible: true, order: 3 },
      { id: 'gallery', name: 'Curated Photo Gallery', visible: true, order: 4 },
      { id: 'facilities', name: 'Sanctuary Facilities & Spa', visible: true, order: 5 },
      { id: 'testimonials', name: 'Guest Testimonials & Reviews', visible: true, order: 6 },
      { id: 'video', name: 'Cinematic Brand Video Reel', visible: true, order: 7 },
      { id: 'concierge', name: 'Concierge & Direct Channels', visible: true, order: 8 }
    ]),
    JSON.stringify({ badge: 'Private Oceanfront Sanctuary' }),
    JSON.stringify([
      { id: 'hero', name: 'Stay Hero Header', visible: true, order: 1 },
      { id: 'villas_grid', name: 'Villas & Residences Collection', visible: true, order: 2 },
      { id: 'amenities', name: 'In-Villa Amenities & Privileges', visible: true, order: 3 },
      { id: 'booking_cta', name: 'Plan Your Stay Concierge CTA', visible: true, order: 4 }
    ]),
    JSON.stringify({ amenitiesList: ['Private Plunge Pool', 'Personal Butler Service', 'Oceanfront Veranda', 'High-Speed Starlink Wi-Fi', 'Artisanal Breakfast Included'] })
  ]);
  console.log('✅ Inserted home & stay pages successfully');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
