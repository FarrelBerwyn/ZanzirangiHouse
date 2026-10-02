import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, Navigation, Copy, Check, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { TRANSLATIONS } from '../data/translations';
import { HomeSectionContent, cmsList, cmsText } from '../data/homeSectionsCms';
import { MAP_DEFAULTS_I18N } from '../data/sectionDefaultsI18n';

interface MapSectionProps {
  currentLang: Language;
  cmsContent?: HomeSectionContent;
  /** Contact details from Admin → Halaman Home → Kontak */
  contact?: { phone?: string; email?: string; whatsappNumber?: string; address?: string; googleMapsUrl?: string };
}

export const MAP_DEFAULTS = {
  eyebrow: 'Zanzirangi House • Bwejuu',
  badge: 'Bwejuu Beach • East Coast',
  copyLabel: 'Copy Exact Coordinates & Address',
  copiedLabel: 'Address Copied to Clipboard',
  directionsUrl: 'https://maps.app.goo.gl/4rkgUt9tPLa1dZQw5',
  embedUrl: PROPERTY_CONFIG.coordinates.embedUrl,
  travel: [
    { label: "Abeid Amani Karume Int'l Airport", value: '~1 hr 10 min (Private Chauffeur)' },
    { label: 'Stone Town UNESCO', value: '~1 hr 15 min (Scenic Drive)' },
    { label: 'Bwejuu Beach', value: 'Direct Oceanfront Access' },
  ],
};

export const MapSection: React.FC<MapSectionProps> = ({ currentLang, cmsContent, contact }) => {
  const t = TRANSLATIONS[currentLang];
  const localDefaults = MAP_DEFAULTS_I18N[currentLang] || MAP_DEFAULTS_I18N.en;
  const [copied, setCopied] = useState(false);

  const text = {
    eyebrow: cmsText(cmsContent?.eyebrow, localDefaults.eyebrow),
    heading: cmsText(cmsContent?.heading, t.map.heading),
    subhead: cmsText(cmsContent?.subhead, t.map.subhead),
    badge: cmsText(cmsContent?.badge, localDefaults.badge),
    copyLabel: cmsText(cmsContent?.copyLabel, localDefaults.copyLabel),
    copiedLabel: cmsText(cmsContent?.copiedLabel, localDefaults.copiedLabel),
    getDirections: cmsText(cmsContent?.directionsLabel, t.map.getDirections),
    directionsUrl: cmsText(cmsContent?.directionsUrl, cmsText(contact?.googleMapsUrl, MAP_DEFAULTS.directionsUrl)),
    embedUrl: cmsText(cmsContent?.embedUrl, MAP_DEFAULTS.embedUrl),
  };
  const travel = cmsList<{ label: string; value: string }>(cmsContent?.travel, localDefaults.travel);

  const fullAddress = cmsText(contact?.address, `${PROPERTY_CONFIG.address}, ${PROPERTY_CONFIG.city}, ${PROPERTY_CONFIG.country}`);
  const phone = cmsText(contact?.phone, PROPERTY_CONFIG.contact.phone);
  const email = cmsText(contact?.email, PROPERTY_CONFIG.contact.email);
  const whatsappRaw = cmsText(contact?.whatsappNumber, PROPERTY_CONFIG.contact.whatsapp);
  // The CMS stores WhatsApp as bare digits (e.g. 255777890123); display it in international format.
  const whatsapp = /^\d+$/.test(whatsappRaw) ? `+${whatsappRaw}` : whatsappRaw;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="location" className="py-24 md:py-32 bg-[#141413] text-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#C4A27A] font-medium mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{text.eyebrow}</span>
          </div>
          <h2
            id="map-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#FAF8F5] mb-2"
          >
            {text.heading}
          </h2>
          <p className="text-[#D8CCB8]/80 text-sm sm:text-base">
            {text.subhead}
          </p>
        </div>

        {/* Two-Column Grid: Contact / Location Details + Map Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Direct Inquiries and Address Details */}
          <div className="lg:col-span-5 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xl">
            <div className="space-y-6">
              {/* Address Item */}
              <div className="space-y-1.5 pb-6 border-b border-[#2C2B28]">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.address}
                </span>
                <p className="font-serif text-xl text-[#FAF8F5]">
                  {PROPERTY_CONFIG.name}
                </p>
                <p className="text-xs sm:text-sm text-[#D8CCB8] leading-relaxed">
                  {fullAddress}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center space-x-1.5 text-[11px] text-[#C4A27A] hover:underline pt-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{text.copiedLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{text.copyLabel}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.phone}
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="font-mono text-sm text-[#FAF8F5] hover:text-[#C4A27A] transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C4A27A]" />
                  <span>{phone}</span>
                </a>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.email}
                </span>
                <a
                  href={`mailto:${email}`}
                  className="font-mono text-sm text-[#FAF8F5] hover:text-[#C4A27A] transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C4A27A]" />
                  <span>{email}</span>
                </a>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.whatsapp}
                </span>
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{whatsapp}</span>
                </a>
              </div>
            </div>

            {/* Direct Action Link */}
            <a
              href={text.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-semibold tracking-[0.18em] uppercase rounded flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Navigation className="w-4 h-4" />
              <span>{text.getDirections}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>

          {/* Right Column: Live Google Map of Zanzirangi House */}
          <div className="lg:col-span-7 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl overflow-hidden relative min-h-[420px] shadow-xl flex flex-col justify-between p-6 sm:p-8">
            <iframe
              title={`${PROPERTY_CONFIG.name} on Google Maps`}
              src={text.embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              // Google's free embed can't be themed, so tint it into the Zanzirangi charcoal & gold palette.
              style={{ filter: 'grayscale(1) invert(0.92) sepia(0.55) saturate(1.4) hue-rotate(-8deg) brightness(0.9) contrast(1.05)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-[#141413]/15 mix-blend-multiply pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#141413]/90 to-transparent pointer-events-none" />

            {/* Zanzirangi gold pin over the property location (map is centred on it) */}
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-[#B8966C] text-[#141413] flex items-center justify-center shadow-2xl ring-4 ring-[#B8966C]/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#B8966C]" />
            </div>

            {/* Coordinates Badge */}
            {/* Kept top-right so Google's place card (top-left) stays readable */}
            <div className="relative z-10 flex flex-col items-end gap-2 pointer-events-none">
              <span className="px-3 py-1 bg-black/70 backdrop-blur rounded font-mono text-[11px] text-[#C4A27A] tracking-wider border border-white/10">
                Lat: {PROPERTY_CONFIG.coordinates.lat} • Lng: {PROPERTY_CONFIG.coordinates.lng}
              </span>
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur rounded text-[10px] uppercase tracking-wider text-[#FAF8F5]">
                {text.badge}
              </span>
            </div>

            {/* Spacer keeps the badges at the top and travel cards at the bottom of the map */}
            <div className="flex-1 min-h-[220px]" />

            {/* Travel Time References */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pointer-events-none">
              {travel.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 bg-black/60 backdrop-blur rounded border border-white/5 ${
                    idx === travel.length - 1 && travel.length % 2 === 1 ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <span className="text-[#A07E54] block text-[10px]">{item.label}</span>
                  <span className="text-[#FAF8F5]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
