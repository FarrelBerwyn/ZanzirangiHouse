import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { applyCmsContact } from './data/propertyConfig';
import { applyTranslations, EntityTranslations } from './i18n/cmsTranslations';
import { Language, Villa, GalleryItem, Facility, Review } from './types';
import { VILLAS_DATA } from './data/villas';
import { GALLERY_DATA } from './data/gallery';
import { FACILITIES_DATA } from './data/facilities';
import { REVIEWS_DATA } from './data/reviews';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QuickBookingBar } from './components/QuickBookingBar';
import { PropertyIntro } from './components/PropertyIntro';
import { VillasSection } from './components/VillasSection';
import { VillaDetailModal } from './components/VillaDetailModal';
import { PropertyExperienceSection } from './components/PropertyExperienceSection';
import { DiningSection } from './components/DiningSection';
import { ExperiencesSection } from './components/ExperiencesSection';
import { ExploreZanzibarSection } from './components/ExploreZanzibarSection';
import { BeyondZanzibarSection } from './components/BeyondZanzibarSection';
import { CustomItinerarySection } from './components/CustomItinerarySection';
import { ShuttleSection } from './components/ShuttleSection';
import { ConciergeSection } from './components/ConciergeSection';
import { WhyStaySection } from './components/WhyStaySection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { PromotionalVideoSection } from './components/PromotionalVideoSection';
import { GallerySection } from './components/GallerySection';
import { ReviewsSection } from './components/ReviewsSection';
import { OtaChannelsSection } from './components/OtaChannelsSection';
import { MapSection } from './components/MapSection';
import { FinalCtaSection } from './components/FinalCtaSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { ChatAssistant } from './components/ChatAssistant';

// CMS Admin Portal Components
import { authApi, AdminUser } from './services/authApi';
import {
  contentApi,
  HomepageContent,
  PageContentModel,
  ChauffeurConfigModel,
  WhyStayConfigModel,
  DiningConfigModel,
  ExperienceModel,
  SafariDestinationModel,
  GlobalContentModel,
  ADMIN_SESSION_EXPIRED_EVENT,
} from './services/contentApi';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboardHome } from './admin/pages/AdminDashboardHome';
import { AdminHomepageEditor } from './admin/pages/AdminHomepageEditor';
import { AdminRoomsManager } from './admin/pages/AdminRoomsManager';
import { AdminGalleryManager } from './admin/pages/AdminGalleryManager';
import { AdminVideosManager } from './admin/pages/AdminVideosManager';
import { AdminFacilitiesManager } from './admin/pages/AdminFacilitiesManager';
import { AdminTestimonialsManager } from './admin/pages/AdminTestimonialsManager';
import { AdminContactManager } from './admin/pages/AdminContactManager';
import { AdminSeoManager } from './admin/pages/AdminSeoManager';
import { AdminMediaLibrary } from './admin/pages/AdminMediaLibrary';
import { AdminSettingsManager } from './admin/pages/AdminSettingsManager';
import { AdminSupportInbox } from './admin/pages/AdminSupportInbox';
import { AdminNotificationSettings } from './admin/pages/AdminNotificationSettings';
import { AdminAccessManager } from './admin/pages/AdminAccessManager';
import { AdminTransfersManager } from './admin/pages/AdminTransfersManager';
import { AdminWhyStayManager } from './admin/pages/AdminWhyStayManager';
import { AdminDiningManager } from './admin/pages/AdminDiningManager';
import { AdminExperiencesManager } from './admin/pages/AdminExperiencesManager';
import { AdminSafariManager } from './admin/pages/AdminSafariManager';
import { AdminGlobalContentManager } from './admin/pages/AdminGlobalContentManager';
import { AdminPageEditor } from './admin/pages/AdminPageEditor';
import { AdminTranslationsManager } from './admin/pages/AdminTranslationsManager';

// Dedicated Subpages for Organic Google Sitelinks & Deep-Link Exploration
import { VillasPage } from './pages/VillasPage';
import { DiningPage } from './pages/DiningPage';
import { ExperiencesPage } from './pages/ExperiencesPage';
import { SafariPage } from './pages/SafariPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

const SEO_TRANSLATIONS: Record<Language, { title: string; description: string }> = {
  en: {
    title: 'Zanzirangi House',
    description: 'Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.',
  },
  pl: {
    title: 'Zanzirangi House | Luksusowy Pobyt i Niezapomniane Safari w Tanzanii',
    description: 'Odkryj Zanzirangi House — prywatną luksusową oazę na Zanzibarze z unikalnymi atrakcjami wyspy, wykwintną kuchnią, wyprawami safari i osobistą opieką konsjerża.',
  },
  ar: {
    title: 'منزل زنجيرانجي | إقامة فاخرة وتجارب تنزانيا الاستثنائية',
    description: 'اكتشف منزل زنجيرانجي — ملاذ فاخر خاص في زنجبار مع تجارب جزرية منتقاة، ومطاعم راقية، وجولات سياحية، ورحلات سفاري، وخدمات كونسيرج مخصصة.',
  },
  zh: {
    title: 'Zanzirangi House 赞齐兰吉私邸 | 桑给巴尔奢华度假与坦桑尼亚探索之旅',
    description: '探索 Zanzirangi House — 隐匿于桑给巴尔的顶级私人奢华避世谧境，尽享定制海岛体验、珍馐美馔、陆地猎游连接与 24/7 私人管家尊贵服务。',
  },
  fr: {
    title: 'Zanzirangi House | Séjour de Luxe & Expériences en Tanzanie',
    description: 'Découvrez Zanzirangi House — un sanctuaire de luxe privé à Zanzibar avec des expériences insulaires sur mesure, gastronomie, excursions, safaris et conciergerie dédiée.',
  },
  sw: {
    title: 'Zanzirangi House | Malazi ya Kifahari & Safari za Tanzania',
    description: 'Gundua Zanzirangi House — makazi ya kifahari na amani huko Zanzibar yenye uzoefu wa kipekee wa kisiwa, chakula bora, safari za wanyama, na huduma binafsi za kiongozi.',
  },
  es: {
    title: 'Zanzirangi House | Estancia de Lujo y Experiencias en Tanzania',
    description: 'Descubra Zanzirangi House — un santuario privado de lujo en Zanzíbar con exclusivas experiencias isleñas, gastronomía, excursiones, safaris y conserjería personalizada.',
  },
  it: {
    title: 'Zanzirangi House | Soggiorno di Lusso ed Esperienze in Tanzania',
    description: 'Scoprite Zanzirangi House — un esclusivo rifugio di lusso a Zanzibar con esperienze sull’isola su misura, alta cucina, tour, safari e servizio concierge dedicato.',
  },
};

const ROUTE_SEO: Record<string, { title: string; description: string; canonical: string }> = {
  '/': {
    title: 'Zanzirangi House',
    description: 'Experience Zanzibar luxury villas with private plunge pools at Zanzirangi House in Kizimkazi. Enjoy ocean-to-table dining and bespoke Tanzania safari journeys.',
    canonical: 'https://zanzirangihouse.com/',
  },
  '/villas': {
    title: 'Private Luxury Villas in Zanzibar | Zanzirangi House',
    description: 'Explore 8 exclusive private plunge pool villas in Kizimkazi, Zanzibar. Handcrafted coral stone suites with dedicated 24/7 butler service.',
    canonical: 'https://zanzirangihouse.com/villas',
  },
  '/dining': {
    title: 'Oceanfront Dining in Zanzibar | Zanzirangi House',
    description: 'Artisanal ocean-to-table gastronomy featuring line-caught Kizimkazi seafood, rare Swahili spices, and private sunset beach candlelit dinners.',
    canonical: 'https://zanzirangihouse.com/dining',
  },
  '/experiences': {
    title: 'Zanzibar Experiences & Private Tours | Zanzirangi House',
    description: 'Bespoke Zanzibar island tours: ethical Menai Bay dolphin dhow safaris, Stone Town UNESCO heritage walks, and organic spice farm excursions.',
    canonical: 'https://zanzirangihouse.com/experiences',
  },
  '/safari': {
    title: 'Tanzania Safari from Zanzibar | Zanzirangi House',
    description: 'Seamless fly-in bush and beach safaris connecting Zanzibar to Serengeti National Park, Ngorongoro Crater, and Mount Kilimanjaro.',
    canonical: 'https://zanzirangihouse.com/safari',
  },
  '/about': {
    title: 'About Zanzirangi House | Barefoot Luxury Sanctuary in Kizimkazi',
    description: 'Learn about Zanzirangi House—an ultra-boutique 8-villa sanctuary in Kizimkazi Dimbani combining Swahili-Omani heritage with barefoot eco-luxury.',
    canonical: 'https://zanzirangihouse.com/about',
  },
  '/contact': {
    title: 'Contact & Book Zanzirangi House Zanzibar | Direct Reservations',
    description: 'Contact our 24/7 concierge for direct villa reservations, airport chauffeur transfers from ZNZ, and personalized Tanzania safari itinerary planning.',
    canonical: 'https://zanzirangihouse.com/contact',
  },
  '/privacy': {
    title: 'Privacy Policy | Zanzirangi House Zanzibar',
    description: 'Privacy Policy and guest data protection practices for Zanzirangi House luxury sanctuary in Zanzibar, Tanzania.',
    canonical: 'https://zanzirangihouse.com/privacy',
  },
  '/terms': {
    title: 'Terms & Conditions | Zanzirangi House Zanzibar',
    description: 'Terms and conditions, reservation policies, and guest guidelines for Zanzirangi House boutique retreat.',
    canonical: 'https://zanzirangihouse.com/terms',
  },
};

export default function App() {
  // Global State with localStorage persistence
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('zanzirangi_lang') as Language;
      if (saved && ['en', 'fr', 'sw', 'es', 'it', 'pl', 'ar', 'zh'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [villasRaw, setVillas] = useState<Villa[]>(VILLAS_DATA);
  const [galleryRaw, setGallery] = useState<GalleryItem[]>(GALLERY_DATA);
  const [facilitiesRaw, setFacilities] = useState<Facility[]>(FACILITIES_DATA);
  const [testimonialsRaw, setTestimonials] = useState<Review[]>(REVIEWS_DATA);
  const [videosRaw, setVideos] = useState<any>(null);

  // Client Routing state (Supports direct URL access and browser history)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const clean = window.location.pathname.replace(/\/+$/, '') || '/';
      return clean;
    }
    return '/';
  });

  // CMS Admin State
  const isAdminRoute = currentPath.startsWith('/admin');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authApi.getUser());
  const [adminTab, setAdminTab] = useState<string>(() => {
    if (currentPath.startsWith('/admin/')) {
      return currentPath.replace('/admin/', '') || 'dashboard';
    }
    return 'dashboard';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dynamic Content State (Fetched from Database API)
  const [homepageContentRaw, setHomepageContent] = useState<HomepageContent | null>(null);
  const [pageContentsRaw, setPageContents] = useState<Record<string, PageContentModel>>({});
  const [chauffeurConfigRaw, setChauffeurConfig] = useState<ChauffeurConfigModel | null>(null);
  const [whyStayConfigRaw, setWhyStayConfig] = useState<WhyStayConfigModel | null>(null);
  const [diningConfigRaw, setDiningConfig] = useState<DiningConfigModel | null>(null);
  const [experiencesDataRaw, setExperiencesData] = useState<ExperienceModel[] | null>(null);
  const [safariDestinationsRaw, setSafariDestinations] = useState<SafariDestinationModel[] | null>(null);
  const [globalContentRaw, setGlobalContent] = useState<GlobalContentModel | null>(null);

  // Per-language translations of CMS content (Admin → Translations). English uses the CMS as-is.
  const [cmsTranslations, setCmsTranslations] = useState<EntityTranslations>({});
  useEffect(() => {
    let cancelled = false;
    contentApi.getTranslations(currentLang).then((data) => {
      if (!cancelled) setCmsTranslations(data);
    });
    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  const villas = useMemo(() => applyTranslations(villasRaw, cmsTranslations.villas), [villasRaw, cmsTranslations]);
  const gallery = useMemo(() => applyTranslations(galleryRaw, cmsTranslations.gallery), [galleryRaw, cmsTranslations]);
  const facilities = useMemo(() => applyTranslations(facilitiesRaw, cmsTranslations.facilities), [facilitiesRaw, cmsTranslations]);
  const testimonials = useMemo(() => applyTranslations(testimonialsRaw, cmsTranslations.testimonials), [testimonialsRaw, cmsTranslations]);
  const videos = useMemo(() => applyTranslations(videosRaw, cmsTranslations.videos), [videosRaw, cmsTranslations]);
  const homepageContent = useMemo(() => applyTranslations(homepageContentRaw, cmsTranslations.homepage), [homepageContentRaw, cmsTranslations]);
  const chauffeurConfig = useMemo(() => applyTranslations(chauffeurConfigRaw, cmsTranslations.chauffeur), [chauffeurConfigRaw, cmsTranslations]);
  const whyStayConfig = useMemo(() => applyTranslations(whyStayConfigRaw, cmsTranslations.whystay), [whyStayConfigRaw, cmsTranslations]);
  const diningConfig = useMemo(() => applyTranslations(diningConfigRaw, cmsTranslations.dining), [diningConfigRaw, cmsTranslations]);
  const experiencesData = useMemo(() => applyTranslations(experiencesDataRaw, cmsTranslations.experiences), [experiencesDataRaw, cmsTranslations]);
  const safariDestinations = useMemo(() => applyTranslations(safariDestinationsRaw, cmsTranslations.safari), [safariDestinationsRaw, cmsTranslations]);
  const globalContent = useMemo(() => applyTranslations(globalContentRaw, cmsTranslations.global), [globalContentRaw, cmsTranslations]);
  const pageContents = useMemo(() => {
    // Translation paths for pages are keyed by page id, so translate the list then re-key by slug.
    const translated = applyTranslations(Object.values(pageContentsRaw) as PageContentModel[], cmsTranslations.pages);
    const map: Record<string, PageContentModel> = {};
    translated.forEach((p) => {
      map[p.slug] = p;
    });
    return map;
  }, [pageContentsRaw, cmsTranslations]);
  // Fetch dynamic content on mount or path change
  const refreshPublicContent = () => {
    contentApi.getHomepage().then((data) => {
      applyCmsContact(data?.contact);
      setHomepageContent(data);
    });
    contentApi.getVillas().then((data) => {
      if (data && data.length > 0) {
        setVillas(data as any);
      }
    });
    contentApi.getGallery().then((data) => {
      if (data && data.length > 0) {
        setGallery(data as any);
      }
    });
    contentApi.getFacilities().then((data) => {
      if (data && data.length > 0) {
        setFacilities(data as any);
      }
    });
    contentApi.getTestimonials().then((data) => {
      if (data && data.length > 0) {
        setTestimonials(data as any);
      }
    });
    contentApi.getVideos().then((data) => {
      if (data) {
        setVideos(data);
      }
    });
    contentApi.getAllPages().then((pages) => {
      if (pages && pages.length > 0) {
        const map: Record<string, PageContentModel> = {};
        pages.forEach((p) => {
          map[p.slug] = p;
        });
        setPageContents(map);
      }
    });
    contentApi.getChauffeur().then((data) => {
      if (data) setChauffeurConfig(data);
    });
    contentApi.getWhyStay().then((data) => {
      if (data) setWhyStayConfig(data);
    });
    contentApi.getDining().then((data) => {
      if (data) setDiningConfig(data);
    });
    contentApi.getExperiences().then((data) => {
      if (data && data.length > 0) setExperiencesData(data);
    });
    contentApi.getSafari().then((data) => {
      if (data && data.length > 0) setSafariDestinations(data);
    });
    contentApi.getGlobalContent().then((data) => {
      if (data) setGlobalContent(data);
    });
  };

  useEffect(() => {
    refreshPublicContent();
  }, [currentPath]);

  // Helper to determine if a homepage section should be visible
  // Per-section homepage copy managed in Admin → Halaman Home → Konten Section
  const homeSections = applyTranslations(pageContentsRaw['home']?.contentJson?.homeSections || {}, cmsTranslations.homeSections);

  const isSectionVisible = (key: string): boolean => {
    if (!homepageContent?.sections) return true;
    const s = homepageContent.sections.find((sec) => sec.id === key);
    return s ? s.visible !== false : true;
  };

  // Verify admin session if on admin route
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      authApi.verifySession().then((u) => {
        setAdminUser(u);
      });
    }
  }, [currentPath]);

  // An admin API call rejected the session (HTTP 401): drop back to the CMS login screen.
  useEffect(() => {
    const handleSessionExpired = () => {
      setAdminUser(null);
      setHasUnsavedChanges(false);
    };
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  // Synchronize admin tab with path
  useEffect(() => {
    if (currentPath.startsWith('/admin/')) {
      const tab = currentPath.replace('/admin/', '');
      setAdminTab(tab);
    } else if (currentPath === '/admin') {
      setAdminTab('dashboard');
    }
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    const cleanPath = path.replace(/\/+$/, '') || '/';
    setCurrentPath(cleanPath);
    if (window.location.pathname !== cleanPath) {
      window.history.pushState({}, '', cleanPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const clean = window.location.pathname.replace(/\/+$/, '') || '/';
      setCurrentPath(clean);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem('zanzirangi_lang', lang);
    } catch {
      // ignore
    }
  };

  // SEO and Head Management
  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Admin Access | Zanzirangi House CMS';
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', 'noindex, nofollow');
      }
      return;
    }

    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

    const routeSeo = ROUTE_SEO[currentPath] || ROUTE_SEO['/'];
    // Per-page SEO managed in Admin → Info & Legal Pages (contentJson.seo); ROUTE_SEO is the fallback.
    const cmsSeo =
      currentPath !== '/' && ROUTE_SEO[currentPath] ? pageContents[currentPath.slice(1)]?.contentJson?.seo : undefined;
    const cmsText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
    const seoTitle = cmsText(cmsSeo?.title) || routeSeo.title;
    const seoDescription = cmsText(cmsSeo?.description) || routeSeo.description;
    const seoImage = cmsText(cmsSeo?.ogImage);

    if (currentPath === '/') {
      const langSeo = SEO_TRANSLATIONS[currentLang] || SEO_TRANSLATIONS.en;
      document.title = langSeo.title || 'Zanzirangi House';
    } else {
      document.title = seoTitle;
    }

    const updateMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    // Social images: use the page's CMS image when set, otherwise restore the default from index.html.
    const updateImageMeta = (selector: string) => {
      const el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) return;
      if (el.dataset.defaultContent === undefined) {
        el.dataset.defaultContent = el.getAttribute('content') || '';
      }
      el.setAttribute('content', seoImage || el.dataset.defaultContent);
    };

    updateMeta('meta[name="description"]', seoDescription);
    updateMeta('meta[property="og:title"]', seoTitle);
    updateMeta('meta[property="og:description"]', seoDescription);
    updateMeta('meta[property="og:url"]', routeSeo.canonical);
    updateMeta('meta[name="twitter:title"]', seoTitle);
    updateMeta('meta[name="twitter:description"]', seoDescription);
    updateMeta('meta[name="twitter:url"]', routeSeo.canonical);
    updateImageMeta('meta[property="og:image"]');
    updateImageMeta('meta[property="og:image:secure_url"]');
    updateImageMeta('meta[name="twitter:image"]');

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', routeSeo.canonical);
    }
  }, [currentLang, currentPath, isAdminRoute, homepageContent, pageContents]);

  // Modals State for Public Visitors
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedVillaForDetail, setSelectedVillaForDetail] = useState<Villa | null>(null);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [supportInitialQuery, setSupportInitialQuery] = useState<string | null>(null);

  const handleOpenSupportChat = (initialQuery?: string) => {
    if (initialQuery) {
      setSupportInitialQuery(initialQuery);
    }
    setIsSupportChatOpen(true);
  };

  const [bookingParams, setBookingParams] = useState<{
    villaId?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  }>({});

  const handleOpenBooking = (villaId?: string) => {
    setBookingParams((prev) => ({
      ...prev,
      villaId: villaId || prev.villaId,
    }));
    setBookingModalOpen(true);
  };

  const handleCheckAvailability = (details: {
    checkIn: string;
    checkOut: string;
    guests: number;
    villaId: string;
  }) => {
    setBookingParams({
      checkIn: details.checkIn,
      checkOut: details.checkOut,
      guests: details.guests,
      villaId: details.villaId || undefined,
    });
    setBookingModalOpen(true);
  };

  // -----------------------------------------------------------------
  // VIEW A: ADMIN DASHBOARD ARCHITECTURE (ONLY ACCESSIBLE VIA /admin)
  // -----------------------------------------------------------------
  if (isAdminRoute) {
    if (!adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setAdminUser(authApi.getUser());
            refreshPublicContent();
          }}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={(tab) => {
          setAdminTab(tab);
          handleNavigate(tab === 'dashboard' ? '/admin' : `/admin/${tab}`);
        }}
        onLogout={async () => {
          await authApi.logout();
          setAdminUser(null);
          handleNavigate('/admin');
        }}
        user={adminUser}
        hasUnsavedChanges={hasUnsavedChanges}
      >
        {adminTab === 'support' && <AdminSupportInbox />}
        {adminTab === 'homepage' && (
          <AdminHomepageEditor onUnsavedChangesChange={setHasUnsavedChanges} />
        )}
        {adminTab === 'pages' && (
          <AdminPageEditor
            onNavigateToTab={(tab) => {
              setAdminTab(tab);
              handleNavigate(`/admin/${tab}`);
            }}
          />
        )}
        {adminTab === 'transfers' && <AdminTransfersManager />}
        {adminTab === 'whystay' && <AdminWhyStayManager />}
        {adminTab === 'dining' && <AdminDiningManager />}
        {adminTab === 'experiences' && <AdminExperiencesManager />}
        {adminTab === 'safari' && <AdminSafariManager />}
        {adminTab === 'global' && <AdminGlobalContentManager />}
        {adminTab === 'translations' && (
          <AdminTranslationsManager onUnsavedChangesChange={setHasUnsavedChanges} />
        )}
        {adminTab === 'admin-access' && <AdminAccessManager />}
        {adminTab === 'rooms' && <AdminRoomsManager />}
        {adminTab === 'gallery' && <AdminGalleryManager />}
        {adminTab === 'videos' && <AdminVideosManager />}
        {adminTab === 'facilities' && <AdminFacilitiesManager />}
        {adminTab === 'testimonials' && <AdminTestimonialsManager />}
        {adminTab === 'contact' && <AdminContactManager />}
        {adminTab === 'seo' && <AdminSeoManager />}
        {adminTab === 'media' && <AdminMediaLibrary />}
        {adminTab === 'notifications' && <AdminNotificationSettings />}
        {adminTab === 'settings' && (
          <AdminSettingsManager
            onNavigateToTab={(tab) => {
              setAdminTab(tab);
              handleNavigate(`/admin/${tab}`);
            }}
          />
        )}
        {adminTab === 'dashboard' && (
          <AdminDashboardHome
            onNavigateToTab={(tab) => {
              setAdminTab(tab);
              handleNavigate(`/admin/${tab}`);
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // -----------------------------------------------------------------
  // VIEW B: NORMAL PUBLIC SANCTUARY WEBSITE (100% UNMODIFIED DESIGN)
  // -----------------------------------------------------------------
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#FAF8F5] text-[#1C1B1A] font-sans selection:bg-[#B8966C] selection:text-[#141413]">
        {/* 00: Fixed Luxury Navigation Header */}
        <Navbar
          currentLang={currentLang}
          onSelectLang={handleSelectLanguage}
          onOpenBooking={handleOpenBooking}
          onNavigate={handleNavigate}
          dynamicGlobal={globalContent}
        />

        {/* Subpage Routing Views */}
        {currentPath === '/villas' && (
          <VillasPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onSelectVilla={(v) => setSelectedVillaForDetail(v)}
            onRequestBooking={(id) => handleOpenBooking(id)}
            villas={villas}
            facilities={facilities}
            pageContent={pageContents['villas']}
            homeSections={homeSections}
          />
        )}

        {currentPath === '/dining' && (
          <DiningPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            pageContent={pageContents['dining']}
            dynamicDining={diningConfig}
          />
        )}

        {currentPath === '/experiences' && (
          <ExperiencesPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
            pageContent={pageContents['experiences']}
            dynamicExperiences={experiencesData}
            homeSections={homeSections}
          />
        )}

        {currentPath === '/safari' && (
          <SafariPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
            pageContent={pageContents['safari']}
            dynamicSafari={safariDestinations}
            homeSections={homeSections}
          />
        )}

        {currentPath === '/about' && (
          <AboutPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            pageContent={pageContents['about']}
            dynamicWhyStay={whyStayConfig}
            homepageContent={homepageContent}
            homeSections={homeSections}
          />
        )}

        {currentPath === '/contact' && (
          <ContactPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
            pageContent={pageContents['contact']}
            dynamicChauffeur={chauffeurConfig}
            dynamicGlobal={globalContent}
            homepageContent={homepageContent}
            homeSections={homeSections}
          />
        )}

        {currentPath === '/privacy' && (
          <PrivacyPage onNavigate={handleNavigate} pageContent={pageContents['privacy']} currentLang={currentLang} />
        )}
        {currentPath === '/terms' && (
          <TermsPage onNavigate={handleNavigate} pageContent={pageContents['terms']} currentLang={currentLang} />
        )}

        {/* 01 to 20: Full Main Homepage Customer Journey */}
        {currentPath === '/' && (
          <main id="main-content">
            {/* 01: Hero Section with Live Database Content */}
            {isSectionVisible('hero') && (
              <HeroSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                dynamicHero={homepageContent?.hero}
              />
            )}

            {/* 02: Quick Search / Booking Bar */}
            {isSectionVisible('quickBooking') && (
              <QuickBookingBar
                currentLang={currentLang}
                onCheckAvailability={handleCheckAvailability}
                cmsContent={homeSections.quickBooking}
                villas={villas}
              />
            )}

            {/* 03: Editorial Introduction (MORE THAN A STAY) */}
            {isSectionVisible('intro') && (
              <PropertyIntro
                currentLang={currentLang}
                dynamicIntro={homepageContent?.intro}
              />
            )}

            {/* 04: Stay Section (STAY YOUR WAY - Villas, Bungalows, Rooms) */}
            {isSectionVisible('villas') && (
              <VillasSection
                currentLang={currentLang}
                onSelectVilla={(v) => setSelectedVillaForDetail(v)}
                onRequestBooking={(id) => handleOpenBooking(id)}
                villas={villas}
                cmsContent={homeSections.villas}
              />
            )}

            {/* 05: Property Experience (DISCOVER THE RETREAT) */}
            {isSectionVisible('experience') && (
              <PropertyExperienceSection currentLang={currentLang} cmsContent={homeSections.experience} />
            )}

            {/* 06: Dining Section (TASTE ZANZIBAR + FROM OUR GARDEN TO YOUR TABLE) */}
            {isSectionVisible('dining') && (
              <DiningSection currentLang={currentLang} dynamicConfig={diningConfig} />
            )}

            {/* 07: Experiences Section (EXPERIENCES - Discover Zanzibar beyond the ordinary) */}
            {isSectionVisible('experiences') && (
              <ExperiencesSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                onOpenSupportChat={handleOpenSupportChat}
                dynamicExperiences={experiencesData}
              />
            )}

            {/* 08: Explore Zanzibar (Stone Town, Mnemba, Spice Farms, Jozani, Nungwi) */}
            {isSectionVisible('explore') && (
              <ExploreZanzibarSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                cmsContent={homeSections.explore}
              />
            )}

            {/* 09: Beyond Zanzibar & Tanzania Safari (ONE ISLAND. A WHOLE TANZANIA TO DISCOVER.) */}
            {isSectionVisible('safari') && (
              <BeyondZanzibarSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                onOpenSupportChat={handleOpenSupportChat}
                dynamicDestinations={safariDestinations}
              />
            )}

            {/* 10: Custom Itinerary Builder (BUILD YOUR TANZANIA JOURNEY) */}
            {isSectionVisible('itinerary') && (
              <CustomItinerarySection
                currentLang={currentLang}
                onOpenSupportChat={handleOpenSupportChat}
                cmsContent={homeSections.itinerary}
              />
            )}

            {/* 11: Shuttle & Arrival Service (ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST.) */}
            {isSectionVisible('shuttle') && (
              <ShuttleSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                dynamicConfig={chauffeurConfig}
              />
            )}

            {/* 12: Concierge Feature (YOUR JOURNEY, PERSONALLY ARRANGED) */}
            {isSectionVisible('concierge') && (
              <ConciergeSection
                currentLang={currentLang}
                onOpenSupportChat={handleOpenSupportChat}
                cmsContent={homeSections.concierge}
              />
            )}

            {/* 13: Why Stay With Us (WHY ZANZIRANGI HOUSE) */}
            {isSectionVisible('whyStay') && (
              <WhyStaySection currentLang={currentLang} dynamicWhyStay={whyStayConfig} />
            )}

            {/* 14: Promotional Film Journey */}
            {isSectionVisible('video') && (
              <PromotionalVideoSection
                currentLang={currentLang}
                dynamicVideo={videos}
                cmsContent={homeSections.video}
              />
            )}

            {/* 15: Facilities & Amenities */}
            {isSectionVisible('facilities') && (
              <FacilitiesSection
                currentLang={currentLang}
                facilities={facilities}
                cmsContent={homeSections.facilities}
              />
            )}

            {/* 16: Gallery Section (7 Luxury Categories + Lightbox) */}
            {isSectionVisible('gallery') && (
              <GallerySection
                currentLang={currentLang}
                items={gallery}
                cmsContent={homeSections.gallery}
              />
            )}

            {/* 17: Guest Impressions & Testimonials */}
            {isSectionVisible('reviews') && (
              <ReviewsSection
                currentLang={currentLang}
                reviews={testimonials}
                cmsContent={homeSections.reviews}
              />
            )}

            {/* 18: OTA Distribution Trust Channels */}
            {isSectionVisible('otaChannels') && (
              <OtaChannelsSection currentLang={currentLang} cmsContent={homeSections.otaChannels} />
            )}

            {/* 19: Location, Map & Directions */}
            {isSectionVisible('map') && (
              <MapSection
                currentLang={currentLang}
                cmsContent={homeSections.map}
                contact={homepageContent?.contact}
              />
            )}

            {/* 20: Final Call To Action */}
            {isSectionVisible('finalCta') && (
              <FinalCtaSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                cmsContent={homeSections.finalCta}
              />
            )}
          </main>
        )}

        {/* 21: Sophisticated Luxury Footer without any visible Admin links */}
        <Footer
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenBooking={() => handleOpenBooking()}
          onOpenSupportChat={handleOpenSupportChat}
          onNavigate={handleNavigate}
          dynamicContact={homepageContent?.contact}
          dynamicSocials={homepageContent?.socials}
          dynamicCopyright={homepageContent?.footer?.copyrightText}
          dynamicGlobal={globalContent}
        />

        {/* Unified Personal Concierge & Support Chat Assistant in Bottom Left */}
        <ChatAssistant
          currentLang={currentLang}
          onOpenBooking={() => handleOpenBooking()}
          isOpen={isSupportChatOpen}
          onToggleOpen={setIsSupportChatOpen}
          externalQuery={supportInitialQuery}
          onClearExternalQuery={() => setSupportInitialQuery(null)}
        />

        {/* Villa Detail Modal */}
        {selectedVillaForDetail && (
          <VillaDetailModal
            villa={selectedVillaForDetail}
            currentLang={currentLang}
            onClose={() => setSelectedVillaForDetail(null)}
            onRequestBooking={(villaId) => handleOpenBooking(villaId)}
          />
        )}

        {/* Interactive Reservation Inquiry Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          initialVillaId={bookingParams.villaId}
          initialCheckIn={bookingParams.checkIn}
          initialCheckOut={bookingParams.checkOut}
          initialGuests={bookingParams.guests}
          currentLang={currentLang}
          villas={villas}
          onClose={() => setBookingModalOpen(false)}
          onOpenSupportChat={handleOpenSupportChat}
        />
      </div>
    </ThemeProvider>
  );
}
