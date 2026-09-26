import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageSquare, Navigation, Copy, Check, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { TRANSLATIONS } from '../data/translations';

interface MapSectionProps {
  currentLang: Language;
}

export const MapSection: React.FC<MapSectionProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${PROPERTY_CONFIG.address}, ${PROPERTY_CONFIG.city}, ${PROPERTY_CONFIG.country}`);
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
            <span>Southern Zanzibar Sanctuary</span>
          </div>
          <h2
            id="map-heading"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-[0.05em] uppercase text-[#FAF8F5] mb-2"
          >
            {t.map.heading}
          </h2>
          <p className="text-[#D8CCB8]/80 text-sm sm:text-base">
            {t.map.subhead}
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
                  {PROPERTY_CONFIG.address}, {PROPERTY_CONFIG.city}, {PROPERTY_CONFIG.country}
                </p>
                <button
                  onClick={handleCopyAddress}
                  className="inline-flex items-center space-x-1.5 text-[11px] text-[#C4A27A] hover:underline pt-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Address Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Exact Coordinates & Address</span>
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
                  href={`tel:${PROPERTY_CONFIG.contact.phone}`}
                  className="font-mono text-sm text-[#FAF8F5] hover:text-[#C4A27A] transition-colors flex items-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C4A27A]" />
                  <span>{PROPERTY_CONFIG.contact.phone}</span>
                </a>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.email}
                </span>
                <a
                  href={`mailto:${PROPERTY_CONFIG.contact.email}`}
                  className="font-mono text-sm text-[#FAF8F5] hover:text-[#C4A27A] transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C4A27A]" />
                  <span>{PROPERTY_CONFIG.contact.email}</span>
                </a>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#C4A27A] block">
                  {t.map.whatsapp}
                </span>
                <a
                  href={`https://wa.me/${PROPERTY_CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{PROPERTY_CONFIG.contact.whatsapp}</span>
                </a>
              </div>
            </div>

            {/* Direct Action Link */}
            <a
              href="https://www.google.com/maps/place/Zanzirangi+House/@-6.2345748,39.528593,17z/data=!3m1!4b1!4m6!3m5!1s0x185d3d007c81b231:0xd21c4f44e083553a!8m2!3d-6.2345748!4d39.5311679!16s%2Fg%2F11yyhxw2xf?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-semibold tracking-[0.18em] uppercase rounded flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.map.getDirections}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>

          {/* Right Column: Custom Luxury Styled Map Canvas */}
          <div className="lg:col-span-7 bg-[#1C1B1A] border border-[#2C2B28] rounded-2xl overflow-hidden relative min-h-[420px] shadow-xl flex flex-col justify-between p-6 sm:p-8">
            {/* Map Imagery Texture */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity filter contrast-125"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141413] via-[#141413]/70 to-transparent" />

            {/* Coordinates Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 bg-black/70 backdrop-blur rounded font-mono text-[11px] text-[#C4A27A] tracking-wider border border-white/10">
                Lat: {PROPERTY_CONFIG.coordinates.lat} • Lng: {PROPERTY_CONFIG.coordinates.lng}
              </span>
              <span className="px-2.5 py-1 bg-white/10 backdrop-blur rounded text-[10px] uppercase tracking-wider text-[#FAF8F5]">
                Menai Bay Marine Reserve
              </span>
            </div>

            {/* Center Landmark Pin */}
            <div className="relative z-10 my-auto text-center py-12">
              <div className="inline-flex flex-col items-center animate-bounce">
                <div className="w-12 h-12 rounded-full bg-[#B8966C] text-[#141413] flex items-center justify-center shadow-2xl ring-8 ring-[#B8966C]/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="mt-3 px-3 py-1 bg-[#141413] border border-[#C4A27A] rounded text-xs font-serif tracking-wider text-[#FAF8F5]">
                  {PROPERTY_CONFIG.name}
                </div>
              </div>
            </div>

            {/* Travel Time References */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-black/60 backdrop-blur rounded border border-white/5">
                <span className="text-[#A07E54] block text-[10px]">Abeid Amani Int'l Airport</span>
                <span className="text-[#FAF8F5]">55 min (Private Chauffeur)</span>
              </div>
              <div className="p-3 bg-black/60 backdrop-blur rounded border border-white/5">
                <span className="text-[#A07E54] block text-[10px]">Stone Town UNESCO</span>
                <span className="text-[#FAF8F5]">50 min (Scenic Drive)</span>
              </div>
              <div className="p-3 bg-black/60 backdrop-blur rounded border border-white/5 col-span-2 sm:col-span-1">
                <span className="text-[#A07E54] block text-[10px]">Kizimkazi Dimbani Beach</span>
                <span className="text-[#FAF8F5]">Direct Oceanfront Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
