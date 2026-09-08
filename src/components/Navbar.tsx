import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Calendar } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import logoImg from '../assets/Zanzirangi-logo.png';

interface NavbarProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
  onOpenBooking: (villaId?: string) => void;
  onOpenCmsPitch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onSelectLang,
  onOpenBooking,
  onOpenCmsPitch,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: t.nav.stay || 'STAY', href: '#stay' },
    { label: t.nav.experiences || 'EXPERIENCES', href: '#experiences' },
    { label: t.nav.dining || 'DINING', href: '#dining' },
    { label: t.nav.explore || 'EXPLORE', href: '#explore' },
    { label: t.nav.concierge || 'CONCIERGE', href: '#concierge' },
    { label: t.nav.about || 'ABOUT', href: '#about' },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'ar', label: 'العربية', flag: '🇦🇪' },
    { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'sw', label: 'Kiswahili', flag: '🇹🇿' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  const ariaLabels: Record<Language, { selectLanguage: string; openMenu: string; closeMenu: string }> = {
    en: { selectLanguage: 'Select Language', openMenu: 'Open navigation menu', closeMenu: 'Close navigation menu' },
    pl: { selectLanguage: 'Wybierz język', openMenu: 'Otwórz menu nawigacji', closeMenu: 'Zamknij menu nawigacji' },
    ar: { selectLanguage: 'اختر اللغة', openMenu: 'افتح قائمة التنقل', closeMenu: 'أغلق قائمة التنقل' },
    zh: { selectLanguage: '选择语言', openMenu: '打开导航菜单', closeMenu: '关闭导航菜单' },
    fr: { selectLanguage: 'Choisir la langue', openMenu: 'Ouvrir le menu', closeMenu: 'Fermer le menu' },
    sw: { selectLanguage: 'Chagua Lugha', openMenu: 'Fungua menyu', closeMenu: 'Funga menyu' },
    es: { selectLanguage: 'Seleccionar idioma', openMenu: 'Abrir menú de navegación', closeMenu: 'Cerrar menú de navegación' },
    it: { selectLanguage: 'Seleziona lingua', openMenu: 'Apri menu di navigazione', closeMenu: 'Chiudi menu di navigazione' },
  };
  const currentAria = ariaLabels[currentLang] || ariaLabels.en;

  return (
    <>
      <header
        id="main-navigation"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#141413]/95 backdrop-blur-md border-b border-[#2C2B28]/80 py-2.5 shadow-2xl'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-4 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 xl:px-10 flex items-center justify-between gap-x-3 sm:gap-x-4 md:gap-x-6 xl:gap-x-8">
          {/* Brand Logo & Name */}
          <a
            href="#"
            id="nav-brand-logo"
            className="flex items-center space-x-2.5 sm:space-x-3 tracking-wider group focus:outline-none flex-shrink-0"
          >
            <img
              src={logoImg}
              alt="Zanzirangi House Logo"
              className={`${
                isScrolled ? 'w-8 h-8 sm:w-9 sm:h-9' : 'w-8 h-8 sm:w-11 sm:h-11'
              } rounded-full object-cover border border-[#C4A27A]/50 shadow-md group-hover:scale-105 group-hover:border-[#C4A27A] transition-all duration-300 flex-shrink-0`}
            />
            <div className="flex flex-col text-left leading-tight flex-shrink-0">
              <span
                className={`font-serif tracking-[0.16em] sm:tracking-[0.2em] text-[#FAF8F5] uppercase transition-all duration-300 group-hover:text-[#C4A27A] font-medium ${
                  isScrolled ? 'text-xs sm:text-base md:text-lg' : 'text-sm sm:text-lg md:text-xl'
                }`}
              >
                ZANZIRANGI
              </span>
              <span
                className={`font-serif tracking-[0.34em] sm:tracking-[0.4em] text-[#C4A27A] uppercase transition-all duration-300 font-light ${
                  isScrolled ? 'text-[9px] sm:text-[11px] md:text-xs' : 'text-[10px] sm:text-xs md:text-sm'
                }`}
              >
                HOUSE
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Visible on XL screens with dedicated gap) */}
          <nav
            id="desktop-nav-links"
            className="hidden xl:flex items-center space-x-4 2xl:space-x-7 text-[11px] 2xl:text-[12px] tracking-[0.14em] 2xl:tracking-[0.18em] uppercase font-medium text-[#FAF8F5]/90 flex-shrink"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-[#C4A27A] relative py-1 whitespace-nowrap after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C4A27A] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Items (Desktop XL) */}
          <div className="hidden xl:flex items-center space-x-3 2xl:space-x-4 flex-shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                id="language-selector-button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 text-[11px] 2xl:text-xs tracking-widest uppercase rounded border border-[#FAF8F5]/20 text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors"
                aria-label={currentAria.selectLanguage}
              >
                <Globe className="w-3.5 h-3.5 opacity-80" />
                <span>{currentLang.toUpperCase()}</span>
              </button>

              {langDropdownOpen && (
                <div
                  id="language-dropdown-menu"
                  className="absolute right-0 mt-2 w-44 bg-[#1C1B1A] border border-[#2C2B28] rounded shadow-xl py-2 z-50 text-xs tracking-wider max-h-80 overflow-y-auto"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        currentLang === l.code
                          ? 'bg-[#B8966C]/20 text-[#C4A27A]'
                          : 'text-[#FAF8F5]/80 hover:bg-white/5 hover:text-[#FAF8F5]'
                      }`}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {currentLang === l.code && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plan Your Stay Button */}
            <button
              id="header-book-button"
              onClick={() => onOpenBooking()}
              className="flex items-center space-x-2 px-4 2xl:px-5 py-2.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-[11px] 2xl:text-xs tracking-[0.16em] uppercase font-semibold rounded transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{t.nav.planStay || t.nav.bookStay || 'PLAN YOUR STAY'}</span>
            </button>
          </div>

          {/* Mobile & Tablet Navigation Actions (Below XL) */}
          <div className="flex items-center space-x-2 sm:space-x-3 xl:hidden flex-shrink-0">
            {/* Quick Language Dropdown on Tablet (Hidden on mobile/HP because it is already available when expanded) */}
            <div className="relative hidden md:block">
              <button
                id="tablet-language-button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1 px-2 py-1 text-[11px] tracking-wider uppercase rounded border border-[#FAF8F5]/20 text-[#FAF8F5] hover:border-[#C4A27A] hover:text-[#C4A27A] transition-colors cursor-pointer"
                aria-label={currentAria.selectLanguage}
              >
                <Globe className="w-3 h-3 opacity-80" />
                <span>{currentLang.toUpperCase()}</span>
              </button>

              {langDropdownOpen && (
                <div
                  id="tablet-language-dropdown"
                  className="absolute right-0 mt-2 w-40 bg-[#1C1B1A] border border-[#2C2B28] rounded shadow-2xl py-2 z-50 text-xs tracking-wider max-h-72 overflow-y-auto"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onSelectLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        currentLang === l.code
                          ? 'bg-[#B8966C]/20 text-[#C4A27A] font-semibold'
                          : 'text-[#FAF8F5]/80 hover:bg-white/5 hover:text-[#FAF8F5]'
                      }`}
                    >
                      <span className="flex items-center space-x-1.5">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {currentLang === l.code && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              id="mobile-book-icon-button"
              onClick={() => onOpenBooking()}
              className="px-2.5 sm:px-3 py-1.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase rounded whitespace-nowrap shadow-sm transition-colors cursor-pointer"
            >
              {t.nav.planStay || t.nav.bookStay || 'PLAN'}
            </button>

            <button
              id="mobile-menu-toggle-button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 text-[#FAF8F5] hover:text-[#C4A27A] transition-colors focus:outline-none cursor-pointer"
              aria-label={currentAria.openMenu}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay (Above all layers in Expand Mode) */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-overlay"
          className="fixed inset-0 w-full h-full bg-[#141413] z-[100] xl:hidden flex flex-col justify-between overflow-y-auto animate-fadeIn text-[#FAF8F5]"
        >
          {/* Top Bar of Expanded Navbar: Logo on Left, Close (X) on Right */}
          <div className="w-full flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#2C2B28]/80 bg-[#141413] flex-shrink-0">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2.5 tracking-wider focus:outline-none"
            >
              <img
                src={logoImg}
                alt="Zanzirangi House Logo"
                className="w-8 h-8 rounded-full object-cover border border-[#C4A27A]/50 shadow-md flex-shrink-0"
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-serif tracking-[0.16em] text-sm text-[#FAF8F5] uppercase font-medium">
                  ZANZIRANGI
                </span>
                <span className="font-serif tracking-[0.34em] text-[10px] text-[#C4A27A] uppercase font-light">
                  HOUSE
                </span>
              </div>
            </a>

            <button
              id="mobile-menu-close-button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-full text-[#FAF8F5] hover:text-[#C4A27A] hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
              aria-label={currentAria.closeMenu}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Links Content */}
          <div className="flex-1 flex flex-col justify-center items-center py-8 px-6 space-y-6 text-center">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl tracking-[0.18em] text-[#FAF8F5] hover:text-[#C4A27A] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Bottom Section: Languages & Plan Stay Button */}
          <div className="flex flex-col items-center space-y-5 px-6 pb-8 pt-3 flex-shrink-0 border-t border-[#2C2B28]/50">
            {/* Language Selector in Mobile */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs tracking-widest max-w-xs">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onSelectLang(l.code)}
                  className={`px-3 py-1.5 rounded-full transition-colors text-xs cursor-pointer ${
                    currentLang === l.code
                      ? 'bg-[#B8966C] text-[#141413] font-semibold shadow-sm'
                      : 'text-[#FAF8F5]/70 bg-white/5 hover:text-white border border-white/5'
                  }`}
                >
                  {l.flag} {l.code.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              id="mobile-overlay-book-button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3.5 bg-[#B8966C] hover:bg-[#C4A27A] text-[#141413] text-xs sm:text-sm tracking-[0.2em] uppercase font-semibold rounded-lg text-center shadow-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              {t.nav.planStay || t.nav.bookStay || 'PLAN YOUR STAY'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

