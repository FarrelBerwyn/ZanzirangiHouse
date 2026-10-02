import React from 'react';
import { ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { HomeSectionContent, cmsList, cmsText } from '../data/homeSectionsCms';
import { OTA_DEFAULTS_I18N } from '../data/sectionDefaultsI18n';

interface OtaChannelsSectionProps {
  currentLang: Language;
  cmsContent?: HomeSectionContent;
}

export const OTA_DEFAULT_CHANNELS = [
  { name: 'Booking.com', tag: 'Preferred Partner', url: '' },
  { name: 'Trip.com', tag: 'Luxury Collection', url: '' },
  { name: 'Agoda', tag: 'VIP Selected', url: '' },
  { name: 'Expedia', tag: 'Boutique Partner', url: '' },
];

export const OTA_DEFAULT_TEXT = {
  eyebrow: 'Global Distribution',
  bannerTitle: 'Direct Reservation Advantages',
  bannerText: 'Best Rate Guarantee • Complimentary Tropical Welcome Drink • Flexible Arrival Policy',
  badge: 'Book Direct Privilege',
};

export const OtaChannelsSection: React.FC<OtaChannelsSectionProps> = ({ currentLang, cmsContent }) => {
  const t = TRANSLATIONS[currentLang];
  const localDefaults = OTA_DEFAULTS_I18N[currentLang] || OTA_DEFAULTS_I18N.en;
  const text = {
    eyebrow: cmsText(cmsContent?.eyebrow, localDefaults.eyebrow),
    heading: cmsText(cmsContent?.heading, t.ota.heading),
    subhead: cmsText(cmsContent?.subhead, t.ota.subhead),
    notice: cmsText(cmsContent?.notice, t.ota.notice),
    bannerTitle: cmsText(cmsContent?.bannerTitle, localDefaults.bannerTitle),
    bannerText: cmsText(cmsContent?.bannerText, localDefaults.bannerText),
    badge: cmsText(cmsContent?.badge, localDefaults.badge),
  };

  const localizedDefaultChannels = OTA_DEFAULT_CHANNELS.map((ch, i) => ({ ...ch, tag: localDefaults.channelTags[i] || ch.tag }));
  const channels = cmsList<{ name: string; tag: string; url?: string }>(cmsContent?.channels, localizedDefaultChannels);

  return (
    <section id="distribution" className="py-20 bg-[#FAF8F5] text-[#1C1B1A] border-y border-[#E7DFD2]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 text-[11px] tracking-[0.3em] uppercase text-[#A07E54] font-medium mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{text.eyebrow}</span>
          </div>
          <h2
            id="ota-heading"
            className="font-serif text-2xl sm:text-3xl font-light uppercase tracking-wide text-[#141413] mb-2"
          >
            {text.heading}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6862]">
            {text.subhead}
          </p>
        </div>

        {/* Channel Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 max-w-4xl mx-auto">
          {channels.map((ch, idx) => (
            <a
              key={idx}
              href={ch.url || undefined}
              target={ch.url ? '_blank' : undefined}
              rel={ch.url ? 'noopener noreferrer' : undefined}
              className="bg-[#F4EFE6] border border-[#E7DFD2] rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-1 hover:border-[#B8966C] transition-colors"
            >
              <span className="font-serif text-lg font-medium text-[#141413] tracking-wide">
                {ch.name}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#A07E54]">
                {ch.tag}
              </span>
            </a>
          ))}
        </div>

        {/* Direct Booking Privilege Guarantee Banner */}
        <div className="max-w-3xl mx-auto bg-[#1C1B1A] text-[#FAF8F5] rounded-xl p-5 sm:p-6 border border-[#2C2B28] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-9 h-9 rounded-full bg-[#B8966C]/20 text-[#C4A27A] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs tracking-wider uppercase font-semibold text-[#FAF8F5]">
                {text.bannerTitle}
              </p>
              <p className="text-[11px] text-[#D8CCB8]">
                {text.bannerText}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C4A27A] bg-white/5 px-3 py-1.5 rounded border border-[#C4A27A]/30 whitespace-nowrap">
            {text.badge}
          </span>
        </div>

        {/* Demo Notice */}
        <p className="text-center text-[11px] font-mono text-[#6B6862] mt-6">
          *{text.notice}
        </p>
      </div>
    </section>
  );
};
