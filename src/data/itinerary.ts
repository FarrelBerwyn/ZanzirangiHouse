import { PROPERTY_CONFIG } from './propertyConfig';
export interface ItineraryDay {
  dayNumber: string;
  dayTitle: string;
  location: string;
  activities: {
    id: string;
    time: string;
    title: string;
    description: string;
    includedByDefault: boolean;
  }[];
}

export const SAMPLE_ITINERARY: ItineraryDay[] = [
  {
    dayNumber: 'DAY 01',
    dayTitle: 'Arrival & Sanctuary Welcome',
    location: 'Zanzirangi House • South Coast',
    activities: [
      {
        id: 'act-1-1',
        time: 'Morning / Afternoon',
        title: 'VIP Airport Meet & Chauffeur Transfer',
        description: 'Private air-conditioned shuttle greeting directly upon arrival at Abeid Amani Karume International Airport (ZNZ).',
        includedByDefault: true,
      },
      {
        id: 'act-1-2',
        time: 'Afternoon',
        title: 'Check-in & Fresh Coconut Welcome',
        description: 'Settle into your private sanctuary, explore the oceanfront grounds, and enjoy fresh young coconut water under the palms.',
        includedByDefault: true,
      },
      {
        id: 'act-1-3',
        time: 'Evening',
        title: 'Sunset Welcome Dinner at Zanzirangi Restaurant',
        description: 'First taste of authentic island hospitality with fresh reef catch and organic garden spices.',
        includedByDefault: true,
      },
    ],
  },
  {
    dayNumber: 'DAY 02',
    dayTitle: 'Culture & Fragrant Spice Heritage',
    location: 'Stone Town & Central Plantations',
    activities: [
      {
        id: 'act-2-1',
        time: '09:00 AM',
        title: 'UNESCO Stone Town Historical Walking Tour',
        description: 'Private guide through the House of Wonders, Sultan’s Palace, ancient Omani doorways, and narrow historic bazaars.',
        includedByDefault: true,
      },
      {
        id: 'act-2-2',
        time: '01:30 PM',
        title: 'Organic Spice Farm Tour & Farmstead Lunch',
        description: 'Smell and taste fresh vanilla, cloves, nutmeg, and cardamom harvested straight from the tropical soil.',
        includedByDefault: true,
      },
      {
        id: 'act-2-3',
        time: '07:30 PM',
        title: 'Swahili Tasting Banquet at Zanzirangi House',
        description: 'Executive chef showcase featuring slow-cooked coconut curries, tamarind broths, and saffron pilau.',
        includedByDefault: true,
      },
    ],
  },
  {
    dayNumber: 'DAY 03',
    dayTitle: 'Marine Atoll & Sunset Sailing',
    location: 'Mnemba Atoll & Menai Bay',
    activities: [
      {
        id: 'act-3-1',
        time: '08:30 AM',
        title: 'Mnemba Island Sandbank & Snorkeling Expedition',
        description: 'Speedboat cruise to electric turquoise waters; snorkel with tropical marine life and relax on disappearing powder sandbanks.',
        includedByDefault: true,
      },
      {
        id: 'act-3-2',
        time: '04:30 PM',
        title: 'Private Wooden Dhow Sunset Cruise',
        description: 'Traditional handcrafted Swahili dhow cruise with chilled refreshments, ocean breezes, and panoramic sunset views.',
        includedByDefault: true,
      },
    ],
  },
  {
    dayNumber: 'DAY 04',
    dayTitle: 'Rejuvenation at The Sanctuary',
    location: 'Zanzirangi House Grounds',
    activities: [
      {
        id: 'act-4-1',
        time: 'All Morning',
        title: 'Slow Breakfast & Oceanfront Poolside Rest',
        description: 'Artisanal tropical fruit boards, coastal coffee, and lazy laps in the 25m ocean-facing infinity pool.',
        includedByDefault: true,
      },
      {
        id: 'act-4-2',
        time: '02:00 PM',
        title: 'From Our Garden to Your Table Botanical Walk',
        description: 'Stroll the estate gardens with our head chef, discovering how island herbs and seasonal vegetables are cultivated.',
        includedByDefault: true,
      },
      {
        id: 'act-4-3',
        time: '08:00 PM',
        title: 'Candlelit Stargazing & taarab Music by the Shore',
        description: 'Relax with ambient acoustic melodies beneath the southern cross constellations.',
        includedByDefault: true,
      },
    ],
  },
  {
    dayNumber: 'DAY 05–08',
    dayTitle: 'The Wild Mainland Safari Adventure',
    location: 'Serengeti & Ngorongoro Crater',
    activities: [
      {
        id: 'act-5-1',
        time: 'Day 05 Morning',
        title: 'Fly-in Bush Flight from Zanzibar to Serengeti',
        description: 'Scenic aerial flight touching down on a remote bush airstrip inside Serengeti National Park.',
        includedByDefault: true,
      },
      {
        id: 'act-5-2',
        time: 'Day 05–06',
        title: 'Big Five Game Drives & Luxury Tented Camp',
        description: 'Full-day 4x4 safaris tracking lions, cheetahs, and migrating herds with veteran wilderness guides.',
        includedByDefault: true,
      },
      {
        id: 'act-5-3',
        time: 'Day 07',
        title: 'Ngorongoro Crater Floor Expedition',
        description: 'Descend 600 meters into the volcanic caldera for rare black rhino encounters and flamingo lake views.',
        includedByDefault: true,
      },
      {
        id: 'act-5-4',
        time: 'Day 08',
        title: 'Return Bush Flight & Farewell Connection',
        description: 'Fly back to Zanzibar or connect seamlessly to international flight departures from Dar es Salaam or Kilimanjaro.',
        includedByDefault: true,
      },
    ],
  },
];

export function buildItineraryWhatsAppUrl(
  selectedActivityIds: string[],
  whatsappNumber: string = PROPERTY_CONFIG.whatsappNumber
): string {
  const selectedTitles: string[] = [];
  SAMPLE_ITINERARY.forEach((day) => {
    day.activities.forEach((act) => {
      if (selectedActivityIds.includes(act.id)) {
        selectedTitles.push(`• ${day.dayNumber}: ${act.title}`);
      }
    });
  });

  const text = `Hello Zanzirangi House Concierge! I would like to plan a custom Tanzania & Zanzibar journey with your team:

Selected Itinerary Highlights:
${selectedTitles.length > 0 ? selectedTitles.join('\n') : '• Full 8-Day Signature Tanzania & Zanzibar Experience'}

Please let me know availability, recommended seasons, and how we can personalize this stay. Thank you!`;

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
