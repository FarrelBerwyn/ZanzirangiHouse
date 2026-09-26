import React from 'react';
import { ArrowUp, Instagram, Facebook, Youtube, Settings, MessageSquare, Calendar } from 'lucide-react';
import { Language } from '../types';
import { PROPERTY_CONFIG } from '../data/propertyConfig';
import { TRANSLATIONS } from '../data/translations';

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
    liveSupport: 'Live Support • Juma (Online)',
    email: 'Email:',
    location: 'Location:',
    locationAddress: 'Kizimkazi Dimbani, South Coast, Zanzibar, Tanzania',
    top: 'Top',
    supportPrompt: 'Hello Zanzirangi House Customer Support! I would like to inquire about availability and planning our stay.',
  },
  pl: {
    planStay: 'ZAPLANUJ POBYT',
    cmsDemo: 'Panel CMS i Demo Klienta',
    languagesLabel: 'Języki',
    socialLabel: 'Media Społecznościowe',
    reservations: 'Rezerwacje:',
    customerSupport: 'Wsparcie Klienta:',
    liveSupport: 'Wsparcie na żywo • Juma (Online)',
    email: 'Email:',
    location: 'Lokalizacja:',
    locationAddress: 'Kizimkazi Dimbani, Południowe Wybrzeże, Zanzibar, Tanzania',
    top: 'Góra',
    supportPrompt: 'Dzień dobry, Zanzirangi House! Chciałbym zapytać o dostępność willi i zaplanowanie pobytu.',
  },
  ar: {
    planStay: 'خطط لإقامتك',
    cmsDemo: 'لوحة التحكم والعرض التجريبي',
    languagesLabel: 'اللغات',
    socialLabel: 'وسائل التواصل',
    reservations: 'الحجوزات:',
    customerSupport: 'خدمة العملاء:',
    liveSupport: 'دعم مباشر • جمعة (متصل)',
    email: 'البريد الإلكتروني:',
    location: 'الموقع:',
    locationAddress: 'كيزيمكازي ديمباني، الساحل الجنوبي، زنجبار، تنزانيا',
    top: 'للأعلى',
    supportPrompt: 'مرحباً خدمة عملاء زانزيرانجي هاوس! أود الاستفسار عن التوافر وتخطيط إقامتنا.',
  },
  zh: {
    planStay: '规划您的入住',
    cmsDemo: '管理后台演示',
    languagesLabel: '语言选择',
    socialLabel: '关注我们',
    reservations: '预订专线:',
    customerSupport: '客户服务:',
    liveSupport: '在线客服 • Juma（在线）',
    email: '电子邮箱:',
    location: '地理位置:',
    locationAddress: '坦桑尼亚桑给巴尔南海岸 Kizimkazi Dimbani',
    top: '返回顶部',
    supportPrompt: '您好 Zanzirangi House 客服团队！我想咨询预订空房并规划我们的桑给巴尔之旅。',
  },
  fr: {
    planStay: 'PLANIFIEZ VOTRE SÉJOUR',
    cmsDemo: 'Démonstration CMS & Admin',
    languagesLabel: 'Langues',
    socialLabel: 'Réseaux Sociaux',
    reservations: 'Réservations :',
    customerSupport: 'Support Client :',
    liveSupport: 'Support en direct • Juma (En ligne)',
    email: 'Courriel :',
    location: 'Emplacement :',
    locationAddress: 'Kizimkazi Dimbani, Côte Sud, Zanzibar, Tanzanie',
    top: 'Haut',
    supportPrompt: 'Bonjour le service client de Zanzirangi House ! Je souhaite me renseigner sur les disponibilités pour notre séjour.',
  },
  sw: {
    planStay: 'PANGA KUKAA KWAKO',
    cmsDemo: 'Onyesho la Mfumo wa Usimamizi (CMS)',
    languagesLabel: 'Lugha',
    socialLabel: 'Mitandao ya Kijamii',
    reservations: 'Uhifadhi:',
    customerSupport: 'Huduma kwa Wateja:',
    liveSupport: 'Msaada wa Moja kwa Moja • Juma (Yuko Mtandaoni)',
    email: 'Barua pepe:',
    location: 'Mahali:',
    locationAddress: 'Kizimkazi Dimbani, Pwani ya Kusini, Zanzibar, Tanzania',
    top: 'Juu',
    supportPrompt: 'Habari Huduma kwa Wateja Zanzirangi House! Ningependa kuulizia kuhusu nafasi na kupanga kukaa kwetu.',
  },
  es: {
    planStay: 'PLANIFIQUE SU ESTANCIA',
    cmsDemo: 'Demostración de Panel CMS',
    languagesLabel: 'Idiomas',
    socialLabel: 'Redes Sociales',
    reservations: 'Reservas:',
    customerSupport: 'Atención al Cliente:',
    liveSupport: 'Soporte en directo • Juma (En línea)',
    email: 'Correo:',
    location: 'Ubicación:',
    locationAddress: 'Kizimkazi Dimbani, Costa Sur, Zanzíbar, Tanzania',
    top: 'Arriba',
    supportPrompt: '¡Hola equipo de atención de Zanzirangi House! Me gustaría consultar sobre disponibilidad y planificar nuestra estancia.',
  },
  it: {
    planStay: 'PIANIFICA IL TUO SOGGIORNO',
    cmsDemo: 'Demo CMS e Gestione',
    languagesLabel: 'Lingue',
    socialLabel: 'Social Media',
    reservations: 'Prenotazioni:',
    customerSupport: 'Servizio Clienti:',
    liveSupport: 'Supporto Live • Juma (Online)',
    email: 'Email:',
    location: 'Posizione:',
    locationAddress: 'Kizimkazi Dimbani, Costa Sud, Zanzibar, Tanzania',
    top: 'Inizio',
    supportPrompt: 'Salve assistenza clienti Zanzirangi House! Vorrei informazioni sulla disponibilità e sulla pianificazione del nostro soggiorno.',
  },
};

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
  };
  dynamicSocials?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  dynamicCopyright?: string;
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
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const extra = FOOTER_EXTRA_TRANSLATIONS[currentLang] || FOOTER_EXTRA_TRANSLATIONS.en;

  const contactPhone = dynamicContact?.phone || PROPERTY_CONFIG.contact.phone;
  const contactEmail = dynamicContact?.email || PROPERTY_CONFIG.email;
  const contactAddress = dynamicContact?.address || extra.locationAddress;
  const socials = {
    instagram: dynamicSocials?.instagram || PROPERTY_CONFIG.socials.instagram,
    facebook: dynamicSocials?.facebook || PROPERTY_CONFIG.socials.facebook,
    tiktok: dynamicSocials?.tiktok || PROPERTY_CONFIG.socials.tiktok,
    youtube: dynamicSocials?.youtube || PROPERTY_CONFIG.socials.youtube,
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: t.nav.stay || 'Private Villas', href: '/villas' },
    { label: t.nav.dining || 'Oceanfront Dining', href: '/dining' },
    { label: t.nav.experiences || 'Zanzibar Experiences', href: '/experiences' },
    { label: 'Tanzania Safari', href: '/safari' },
    { label: t.nav.about || 'About Sanctuary', href: '/about' },
    { label: 'Contact & Reservations', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ];

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
              {PROPERTY_CONFIG.name}
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#C4A27A] block font-mono">
              Zanzibar • Tanzania
            </span>
            <p className="text-xs sm:text-sm text-[#D8CCB8]/80 leading-relaxed max-w-sm">
              {t.footer.brandStatement}
            </p>

            {/* Plan Your Stay CTA Button */}
            {/* Plan Stay CTA */}
            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs font-bold tracking-[0.2em] uppercase rounded transition-all shadow-md active:scale-95 flex items-center space-x-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{extra.planStay}</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#A07E54] block mb-2">
              {t.footer.quickLinks}
            </span>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-[#D8CCB8]/90">
              {navLinks.map((link) => (
                <li key={link.href}>
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
                  <span>{extra.liveSupport}</span>
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
                  href="https://www.google.com/maps/place/Zanzirangi+House/@-6.2345748,39.528593,17z/data=!3m1!4b1!4m6!3m5!1s0x185d3d007c81b231:0xd21c4f44e083553a!8m2!3d-6.2345748!4d39.5311679!16s%2Fg%2F11yyhxw2xf?entry=ttu&g_ep=EgoyMDI2MDkyMi4wIKXMDSoASAFQAw%3D%3D"
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
                title="Follow us on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="TikTok"
                title="Watch our videos on TikTok"
              >
                <TikTokIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label="YouTube"
                title="Subscribe to our YouTube channel"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B6862] gap-4">
          <p className="text-center sm:text-left">
            {dynamicCopyright || `© ${new Date().getFullYear()} ${PROPERTY_CONFIG.name}. ${t.footer.allRightsReserved}`}
          </p>

          <div className="flex items-center space-x-4 text-[11px] text-[#A07E54]">
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick(e, '/privacy')}
              className="hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="hover:underline transition-colors"
            >
              Terms & Conditions
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
      </div>
    </footer>
  );
};
