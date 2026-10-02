import { PropertyConfig } from '../types';

/**
 * CLIENT_PROPERTY_IMAGES / CONFIGURATION
 * All property details, photography placeholders, and contact details
 * are centralized here for seamless client onboarding and CMS integration.
 */
export const PROPERTY_CONFIG: PropertyConfig = {
  name: 'Zanzirangi House',
  tagline: 'YOUR PRIVATE GATEWAY TO ZANZIBAR',
  subTagline: 'Stay, explore and experience the island — with Tanzania beyond.',
  destination: 'Zanzibar, Tanzania',
  address: 'Kwa Lila 31, Bwejuu 72111',
  city: 'Zanzibar',
  country: 'Tanzania',
  locationDetails: 'Nestled between ancient baobab groves and pristine turquoise coral lagoons on the peaceful east coast of Unguja Island, in Bwejuu.',
  // Google Maps place: Zanzirangi House, Kwa Lila 31, Bwejuu 72111 (https://maps.app.goo.gl/4rkgUt9tPLa1dZQw5)
  coordinates: {
    lat: -6.2345748,
    lng: 39.5311679,
    embedUrl:
      'https://maps.google.com/maps?q=Zanzirangi%20House%2C%20Kwa%20Lila%2031%2C%20Bwejuu&ll=-6.2345748,39.5311679&hl=en&z=15&output=embed',
  },
  // Placeholder contact details; the live values come from Admin → Contact & WhatsApp (see applyCmsContact).
  phone: '+255 777 890 123',
  displayPhone: '+255 (0) 777 890 123',
  whatsappNumber: '255777890123',
  whatsappMessage: 'Hello, I would like to inquire about availability and rates at Zanzirangi House.',
  email: 'info@zanzirangihouse.com',
  contact: {
    phone: '+255 777 890 123',
    email: 'info@zanzirangihouse.com',
    whatsapp: '+255 777 890 123',
  },
  stats: {
    villasCount: 8,
    poolsCount: 1,
    diningCount: 1,
    supportText: '24/7 Butler & Concierge Support',
  },
  socials: {
    instagram: 'https://www.instagram.com/zanzirangihouse',
    facebook: 'https://www.facebook.com/p/Zanzirangi-House-61576133951151/',
    tiktok: 'https://www.tiktok.com/@zanzirangihouse',
    youtube: 'https://www.youtube.com/@zanzirangihouse',
    tripadvisor: 'https://tripadvisor.com',
  },
  social: {
    instagram: 'https://www.instagram.com/zanzirangihouse',
    facebook: 'https://www.facebook.com/p/Zanzirangi-House-61576133951151/',
    tiktok: 'https://www.tiktok.com/@zanzirangihouse',
    youtube: 'https://www.youtube.com/@zanzirangihouse',
    tripadvisor: 'https://tripadvisor.com',
  },
};

export const OTA_CHANNELS = [
  {
    name: 'Booking.com',
    logoText: 'Booking.com',
    rating: '9.8 / 10 Exceptional',
    description: 'Premier Guest Review Award',
  },
  {
    name: 'Trip.com',
    logoText: 'Trip.com',
    rating: '5.0 Star Luxury Choice',
    description: 'Diamond Luxury Partner',
  },
  {
    name: 'Agoda',
    logoText: 'Agoda',
    rating: '9.7 Customer Choice',
    description: 'Top Villas in East Africa',
  },
  {
    name: 'Expedia',
    logoText: 'Expedia',
    rating: '4.9 / 5.0 Excellent',
    description: 'VIP Access Preferred Property',
  },
];

/**
 * Applies the contact details managed in Admin → Contact & WhatsApp (homepage.contact) to
 * PROPERTY_CONFIG, so every WhatsApp link, phone number and email on the site follows the CMS.
 * Called by App before it re-renders with freshly fetched homepage content.
 */
export const applyCmsContact = (contact?: {
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  address?: string;
}) => {
  if (!contact) return;
  const phone = contact.phone?.trim();
  const email = contact.email?.trim();
  const whatsappDigits = contact.whatsappNumber?.replace(/[^0-9]/g, '');
  if (phone) {
    PROPERTY_CONFIG.phone = phone;
    PROPERTY_CONFIG.displayPhone = phone;
    PROPERTY_CONFIG.contact.phone = phone;
  }
  if (email) {
    PROPERTY_CONFIG.email = email;
    PROPERTY_CONFIG.contact.email = email;
  }
  if (whatsappDigits) {
    PROPERTY_CONFIG.whatsappNumber = whatsappDigits;
    PROPERTY_CONFIG.contact.whatsapp = `+${whatsappDigits}`;
  }
};