import React, { useState, useEffect } from 'react';
import { ArrowUp, Instagram, Facebook, Youtube, Settings, MessageSquare, Calendar } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { TRANSLATIONS } from '../data/translations';
import { PAGE_NAMES } from '../data/pageTranslations';
import { DEFAULT_SETTINGS } from '../data/seedDefaults';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.95-4.47V8.58a8.27 8.27 0 0 0 4.82 1.55V6.69z" />
  </svg>
);

const FOOTER_EXTRA_TRANSLATIONS: Record<
  Language,
  {
    planStay: string;
    cmsDemo: string;
    languagesLabel: string;
    socialLabel: string;
    reservations: string;
    customerSupport: string;
    liveSupport: string;
    email: string;
    location: string;
    locationAddress: string;
    top: string;
    social: { instagram: string; facebook: string; tiktok: string; youtube: string };
    supportPrompt: string;
  }
> = {
  en: {
    planStay: 'PLAN YOUR STAY',
    cmsDemo: 'Client CMS & Admin Demo',
    languagesLabel: 'Languages',
    socialLabel: 'Social Media',
    reservations: 'Reservations:',
    customerSupport: 'Customer Support:',
    liveSupport: 'Live Support • Elena (Online)',
    email: 'Email:',
    location: 'Location:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
    top: 'Top',
    social: { instagram: 'Follow us on Instagram', facebook: 'Follow us on Facebook', tiktok: 'Watch our videos on TikTok', youtube: 'Subscribe to our YouTube channel' },
    supportPrompt: 'Hello Zanzirangi House Customer Support! I would like to inquire about availability and planning our stay.',
  },
  pl: {
    planStay: 'ZAPLANUJ POBYT',
    cmsDemo: 'Panel CMS i Demo Klienta',
    languagesLabel: 'Języki',
    socialLabel: 'Media Społecznościowe',
    reservations: 'Rezerwacje:',
    customerSupport: 'Wsparcie Klienta:',
    liveSupport: 'Wsparcie na żywo • Elena (Online)',
    email: 'Email:',
    location: 'Lokalizacja:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
    top: 'Góra',
    social: { instagram: 'Obserwuj nas na Instagramie', facebook: 'Obserwuj nas na Facebooku', tiktok: 'Oglądaj nasze filmy na TikToku', youtube: 'Subskrybuj nasz kanał na YouTube' },
    supportPrompt: 'Dzień dobry, Zanzirangi House! Chciałbym zapytać o dostępność willi i zaplanowanie pobytu.',
  },
  ar: {
    planStay: 'خطط لإقامتك',
    cmsDemo: 'لوحة التحكم والعرض التجريبي',
    languagesLabel: 'اللغات',
    socialLabel: 'وسائل التواصل',
    reservations: 'الحجوزات:',
    customerSupport: 'خدمة العملاء:',
    liveSupport: 'دعم مباشر • إيلينا (متصل)',
    email: 'البريد الإلكتروني:',
    location: 'الموقع:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111، زنجبار، تنزانيا',
    top: 'للأعلى',
    social: { instagram: 'تابعونا على إنستغرام', facebook: 'تابعونا على فيسبوك', tiktok: 'شاهدوا مقاطعنا على تيك توك', youtube: 'اشتركوا في قناتنا على يوتيوب' },
    supportPrompt: 'مرحباً خدمة عملاء زانزيرانجي هاوس! أود الاستفسار عن التوافر وتخطيط إقامتنا.',
  },
  zh: {
    planStay: '规划您的入住',
    cmsDemo: '管理后台演示',
    languagesLabel: '语言选择',
    socialLabel: '关注我们',
    reservations: '预订专线:',
    customerSupport: '客户服务:',
    liveSupport: '在线客服 • Elena（在线）',
    email: '电子邮箱:',
    location: '地理位置:',
    locationAddress: '坦桑尼亚桑给巴尔 Bwejuu 72111, Kwa Lila 31',
    top: '返回顶部',
    social: { instagram: '在 Instagram 上关注我们', facebook: '在 Facebook 上关注我们', tiktok: '在 TikTok 上观看我们的视频', youtube: '订阅我们的 YouTube 频道' },
    supportPrompt: '您好 Zanzirangi House 客服团队！我想咨询预订空房并规划我们的桑给巴尔之旅。',
  },
  fr: {
    planStay: 'PLANIFIEZ VOTRE SÉJOUR',
    cmsDemo: 'Démonstration CMS & Admin',
    languagesLabel: 'Langues',
    socialLabel: 'Réseaux Sociaux',
    reservations: 'Réservations :',
    customerSupport: 'Support Client :',
    liveSupport: 'Support en direct • Elena (En ligne)',
    email: 'Courriel :',
    location: 'Emplacement :',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzanie',
    top: 'Haut',
    social: { instagram: 'Suivez-nous sur Instagram', facebook: 'Suivez-nous sur Facebook', tiktok: 'Regardez nos vidéos sur TikTok', youtube: 'Abonnez-vous à notre chaîne YouTube' },
    supportPrompt: 'Bonjour le service client de Zanzirangi House ! Je souhaite me renseigner sur les disponibilités pour notre séjour.',
  },
  sw: {
    planStay: 'PANGA KUKAA KWAKO',
    cmsDemo: 'Onyesho la Mfumo wa Usimamizi (CMS)',
    languagesLabel: 'Lugha',
    socialLabel: 'Mitandao ya Kijamii',
    reservations: 'Uhifadhi:',
    customerSupport: 'Huduma kwa Wateja:',
    liveSupport: 'Msaada wa Moja kwa Moja • Elena (Yuko Mtandaoni)',
    email: 'Barua pepe:',
    location: 'Mahali:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
    top: 'Juu',
    social: { instagram: 'Tufuate kwenye Instagram', facebook: 'Tufuate kwenye Facebook', tiktok: 'Tazama video zetu kwenye TikTok', youtube: 'Jiunge na chaneli yetu ya YouTube' },
    supportPrompt: 'Habari Huduma kwa Wateja Zanzirangi House! Ningependa kuulizia kuhusu nafasi na kupanga kukaa kwetu.',
  },
  es: {
    planStay: 'PLANIFIQUE SU ESTANCIA',
    cmsDemo: 'Demostración de Panel CMS',
    languagesLabel: 'Idiomas',
    socialLabel: 'Redes Sociales',
    reservations: 'Reservas:',
    customerSupport: 'Atención al Cliente:',
    liveSupport: 'Soporte en directo • Elena (En línea)',
    email: 'Correo:',
    location: 'Ubicación:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzíbar, Tanzania',
    top: 'Arriba',
    social: { instagram: 'Síganos en Instagram', facebook: 'Síganos en Facebook', tiktok: 'Vea nuestros vídeos en TikTok', youtube: 'Suscríbase a nuestro canal de YouTube' },
    supportPrompt: '¡Hola equipo de atención de Zanzirangi House! Me gustaría consultar sobre disponibilidad y planificar nuestra estancia.',
  },
  it: {
    planStay: 'PIANIFICA IL TUO SOGGIORNO',
    cmsDemo: 'Demo CMS e Gestione',
    languagesLabel: 'Lingue',
    socialLabel: 'Social Media',
    reservations: 'Prenotazioni:',
    customerSupport: 'Servizio Clienti:',
    liveSupport: 'Supporto Live • Elena (Online)',
    email: 'Email:',
    location: 'Posizione:',
    locationAddress: 'Kwa Lila 31, Bwejuu 72111, Zanzibar, Tanzania',
    top: 'Inizio',
    social: { instagram: 'Seguici su Instagram', facebook: 'Seguici su Facebook', tiktok: 'Guarda i nostri video su TikTok', youtube: 'Iscriviti al nostro canale YouTube' },
    supportPrompt: 'Salve assistenza clienti Zanzirangi House! Vorrei informazioni sulla disponibilità e sulla pianificazione del nostro soggiorno.',
  },
};

import { GlobalContentModel } from '../services/contentApi';
import { localizeUnlessEdited } from '../data/homeSectionsCms';

// Footer tagline seeded into global_content; treated as a built-in default for non-English visitors.
const SEEDED_FOOTER_TAGLINE = 'An intimate sanctuary between the ocean breeze and Swahili heritage.';

const DEFAULT_MAPS_URL =
  'https://www.google.com/maps/place/Zanzirangi+House/@-6.2345748,39.528593,17z/data=!3m1!4b1!4m6!3m5!1s0x185d3d007c81b231:0xd21c4f44e083553a!8m2!3d-6.2345748!4d39.5311679!16s%2Fg%2F11yyhxw2xf?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D';

interface FooterProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenBooking: () => void;
  onOpenSupportChat?: (query?: string) => void;
  onNavigate?: (url: string) => void;
  dynamicContact?: {
    phone?: string;
    email?: string;
    address?: string;
    whatsappNumber?: string;
    googleMapsUrl?: string;
  };
  dynamicSocials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  dynamicCopyright?: string;
  dynamicGlobal?: GlobalContentModel | null;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onSelectLang,
  onOpenBooking,
  onOpenSupportChat,
  onNavigate,
  dynamicContact,
  dynamicSocials,
  dynamicCopyright,
  dynamicGlobal,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const extra = FOOTER_EXTRA_TRANSLATIONS[currentLang] || FOOTER_EXTRA_TRANSLATIONS.en;

  const tEn = TRANSLATIONS.en;
  const extraEn = FOOTER_EXTRA_TRANSLATIONS.en;

  const [supportName, setSupportName] = useState<string>(() => {
    try {
      const cached = localStorage.getItem('zh_support_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.supportName) return parsed.supportName;
      }
    } catch (_) {}
    return DEFAULT_SETTINGS.supportName || 'Elena';
  });

  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail?.supportName) setSupportName(e.detail.supportName);
    };
    window.addEventListener('zh:support_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('zh:support_profile_updated', handleProfileUpdate);
  }, []);

  const activeSupportName = supportName || DEFAULT_SETTINGS.supportName || 'Elena';
  const liveSupportText = extra.liveSupport
    .replace(/\b(Elena|Juma)\b/g, activeSupportName)
    .replace(/(إيلينا|جمعة)/g, activeSupportName)
    .replace(/朱马/g, activeSupportName);

  const cms = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() ? value : undefined;

  // Contact details come from Admin → Contact & WhatsApp (homepage.contact).
  const contactPhone = cms(dynamicContact?.phone) || PROPERTY_CONFIG.contact.phone;
  const contactEmail = cms(dynamicContact?.email) || PROPERTY_CONFIG.email;
  const contactAddress = cms(dynamicContact?.address) || extra.locationAddress;
  const mapsUrl = cms(dynamicContact?.googleMapsUrl) || DEFAULT_MAPS_URL;

  const brandName = cms(dynamicGlobal?.brandName) || PROPERTY_CONFIG.name;
  // English shows exactly what is saved; other languages keep the built-in translation while the
  // tagline is still the seeded/English default.
  const brandStatement = localizeUnlessEdited(
    cms(dynamicGlobal?.footerTagline),
    currentLang === 'en' ? undefined : SEEDED_FOOTER_TAGLINE,
    tEn.footer.brandStatement,
    t.footer.brandStatement
  );
  const planStayLabel = localizeUnlessEdited(
    cms(dynamicGlobal?.ctaPlanStayLabel),
    'PLAN YOUR STAY',
    extraEn.planStay,
    extra.planStay
  );
  const copyrightText =
    cms(dynamicCopyright) ||
    cms(dynamicGlobal?.footerCopyright) ||
    `© ${new Date().getFullYear()} ${brandName}. ${t.footer.allRightsReserved}`;
  const disclaimer = cms(dynamicGlobal?.footerDisclaimer);

  const globalSocials = (dynamicGlobal?.socials || {}) as Record<string, string | undefined>;
  const socials = {
    instagram: cms(dynamicSocials?.instagram) || cms(globalSocials.instagram) || PROPERTY_CONFIG.socials.instagram,
    facebook: cms(dynamicSocials?.facebook) || cms(globalSocials.facebook) || PROPERTY_CONFIG.socials.facebook,
    tiktok: cms(dynamicSocials?.tiktok) || cms(globalSocials.tiktok) || PROPERTY_CONFIG.socials.tiktok,
    youtube: cms(dynamicSocials?.youtube) || cms(globalSocials.youtube) || PROPERTY_CONFIG.socials.youtube,
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNames = PAGE_NAMES[currentLang] || PAGE_NAMES.en;
  const pageNamesEn = PAGE_NAMES.en;

  // Built-in quick links; `en` lists the English defaults a CMS label may still hold.
  const builtInLinks: { href: string; label: string; en: string[] }[] = [
    { href: '/villas', label: t.nav.stay || pageNames.villas, en: [tEn.nav.stay, pageNamesEn.villas] },
    { href: '/dining', label: t.nav.dining || pageNames.dining, en: [tEn.nav.dining, pageNamesEn.dining] },
    { href: '/experiences', label: t.nav.experiences || pageNames.experiences, en: [tEn.nav.experiences, pageNamesEn.experiences] },
    { href: '/safari', label: pageNames.safari, en: ['SAFARI', pageNamesEn.safari] },
    { href: '/about', label: t.nav.about || pageNames.about, en: [tEn.nav.about || 'ABOUT', pageNamesEn.about] },
    { href: '/contact', label: pageNames.contact, en: ['CONTACT', pageNamesEn.contact] },
    { href: '/privacy', label: pageNames.privacy, en: [pageNamesEn.privacy] },
    { href: '/terms', label: pageNames.terms, en: [pageNamesEn.terms] },
  ];

  const localizeLinkLabel = (label: string, href: string): string => {
    const builtIn = builtInLinks.find((b) => b.href === href);
    if (!builtIn) return label;
    const enMatch = builtIn.en.find((e) => !!e && e.toUpperCase() === label.trim().toUpperCase());
    return localizeUnlessEdited(label, enMatch, enMatch, builtIn.label);
  };

  // Quick links follow Admin → Navigation & Footer; the built-in list is used when none are visible.
  const cmsLinks = (Array.isArray(dynamicGlobal?.navLinks) ? dynamicGlobal!.navLinks : [])
    .filter((link) => link && link.visible !== false && link.label && link.href)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((link) => ({ label: localizeLinkLabel(link.label, link.href), href: link.href }));

  const navLinks = cmsLinks.length > 0 ? cmsLinks : builtInLinks.map(({ label, href }) => ({ label, href }));

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate && href.startsWith('/')) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'pl', label: 'Polski' },
    { code: 'ar', label: 'العربية' },
    { code: 'zh', label: '中文' },
    { code: 'fr', label: 'Français' },
    { code: 'sw', label: 'Kiswahili' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
  ];

  return (
    <footer id="main-footer" className="bg-[#0D0D0C] text-[#FAF8F5] pt-20 pb-12 border-t border-[#22211F]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#22211F]">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.16em] uppercase text-[#FAF8F5] block">
              {brandName}
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C4A27A] block font-mono">
              Zanzibar • Tanzania
            </span>
            <p className="text-xs sm:text-sm text-[#D8CCB8]/80 leading-relaxed max-w-sm">
              {brandStatement}
            </p>

            {/* Plan Your Stay CTA Button */}
            {/* Plan Stay CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-[0.2em] uppercase rounded transition-all shadow-md active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{planStayLabel}</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
              {t.footer.quickLinks}
            </span>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-[#D8CCB8]/90">
              {navLinks.map((link, idx) => (
                <li key={`${link.href}-${idx}`}>
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="hover:text-[#C4A27A] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Concierge & Inquiries */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
              {t.footer.contactConcierge}
            </span>
            <div className="space-y-2.5 text-xs text-[#D8CCB8]/90 font-mono">
              <p>
                <span className="text-[10px] text-[#6B6862] block">{extra.reservations}</span>
                <a href={`tel:${contactPhone}`} className="hover:text-[#C4A27A]">
                  {contactPhone}
                </a>
              </p>
              <p>
                <span className="text-[10px] text-[#6B6862] block">{extra.customerSupport}</span>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = extra.supportPrompt;
                    if (onOpenSupportChat) {
                      onOpenSupportChat(prompt);
                    } else {
                      window.dispatchEvent(new CustomEvent('open-customer-support', { detail: { query: prompt } }));
                    }
                  }}
                  className="hover:text-emerald-300 text-emerald-400 font-semibold flex items-center space-x-1.5 cursor-pointer text-left transition-colors pt-0.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>{liveSupportText}</span>
                </button>
              </p>
              <p>
                <span className="text-[10px] text-[#6B6862] block">{extra.email}</span>
                <a href={`mailto:${contactEmail}`} className="hover:text-[#C4A27A]">
                  {contactEmail}
                </a>
              </p>
              <p>
                <span className="text-[10px] text-[#6B6862] block">{extra.location}</span>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#D8CCB8]/80 hover:text-[#C4A27A] transition-colors text-[11px] block"
                >
                  {contactAddress}
                </a>
              </p>
            </div>
          </div>

          {/* Social & Language */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block">
              {extra.languagesLabel}
            </span>
            <div className="flex flex-col space-y-1 text-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onSelectLang(l.code)}
                  className={`text-left py-0.5 transition-colors cursor-pointer ${
                    currentLang === l.code
                      ? 'text-[#C4A27A] font-semibold'
                      : 'text-[#D8CCB8]/60 hover:text-[#FAF8F5]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block pt-2">
              {extra.socialLabel}
            </span>
            <div className="pt-1 flex items-center space-x-2.5">
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="Instagram"
                title={extra.social.instagram}
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="Facebook"
                title={extra.social.facebook}
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="TikTok"
                title={extra.social.tiktok}
              >
                <TikTokIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="YouTube"
                title={extra.social.youtube}
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6862] gap-4">
          <p className="text-center sm:text-left">
            {copyrightText}
          </p>

          <div className="flex items-center space-x-4 text-[11px] text-[#A07E54]">
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick(e, '/privacy')}
              className="hover:underline transition-colors"
            >
              {pageNames.privacy}
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="hover:underline transition-colors"
            >
              {pageNames.terms}
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 text-xs tracking-wider uppercase text-[#D8CCB8] hover:text-white transition-colors cursor-pointer"
          >
            <span>{extra.top}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {disclaimer && (
          <p className="pt-4 text-[11px] leading-relaxed text-[#6B6862] text-center sm:text-left">
            {disclaimer}
          </p>
        )}
      </div>
    </footer>
  );
};
