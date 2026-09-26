import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
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
import { contentApi, HomepageContent } from './services/contentApi';
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
    title: 'Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat',
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
    title: 'Zanzibar Luxury Villa - Zanzirangi House | Private Pool Retreat',
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

  const [villas, setVillas] = useState<Villa[]>(VILLAS_DATA);
  const [gallery, setGallery] = useState<GalleryItem[]>(GALLERY_DATA);
  const [facilities, setFacilities] = useState<Facility[]>(FACILITIES_DATA);
  const [testimonials, setTestimonials] = useState<Review[]>(REVIEWS_DATA);
  const [videos, setVideos] = useState<any>(null);

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
    if (currentPath === '/admin/homepage') return 'homepage';
    return 'dashboard';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dynamic Content State (Fetched from Database API)
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null);

  // Fetch dynamic content on mount or path change
  const refreshPublicContent = () => {
    contentApi.getHomepage().then((data) => {
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
  };

  useEffect(() => {
    refreshPublicContent();
  }, [currentPath]);

  // Helper to determine if a homepage section should be visible
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
    if (currentPath === '/') {
      const dynamicTitle = homepageContent?.hero?.title;
      const langSeo = SEO_TRANSLATIONS[currentLang] || SEO_TRANSLATIONS.en;
      document.title = dynamicTitle || langSeo.title;
    } else {
      document.title = routeSeo.title;
    }

    const updateMeta = (selector: string, content: string) => {
      const el = document.querySelector(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    updateMeta('meta[name="description"]', routeSeo.description);
    updateMeta('meta[property="og:title"]', routeSeo.title);
    updateMeta('meta[property="og:description"]', routeSeo.description);
    updateMeta('meta[property="og:url"]', routeSeo.canonical);
    updateMeta('meta[name="twitter:title"]', routeSeo.title);
    updateMeta('meta[name="twitter:description"]', routeSeo.description);
    updateMeta('meta[name="twitter:url"]', routeSeo.canonical);

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', routeSeo.canonical);
    }
  }, [currentLang, currentPath, isAdminRoute, homepageContent]);

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
        {adminTab === 'homepage' && (
          <AdminHomepageEditor onUnsavedChangesChange={setHasUnsavedChanges} />
        )}
        {adminTab === 'rooms' && <AdminRoomsManager />}
        {adminTab === 'gallery' && <AdminGalleryManager />}
        {adminTab === 'videos' && <AdminVideosManager />}
        {adminTab === 'facilities' && <AdminFacilitiesManager />}
        {adminTab === 'testimonials' && <AdminTestimonialsManager />}
        {adminTab === 'contact' && <AdminContactManager />}
        {adminTab === 'seo' && <AdminSeoManager />}
        {adminTab === 'media' && <AdminMediaLibrary />}
        {adminTab === 'settings' && <AdminSettingsManager />}
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
        />

        {/* Subpage Routing Views */}
        {currentPath === '/villas' && (
          <VillasPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onSelectVilla={(v) => setSelectedVillaForDetail(v)}
            onRequestBooking={(id) => handleOpenBooking(id)}
            villas={villas}
          />
        )}

        {currentPath === '/dining' && (
          <DiningPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
          />
        )}

        {currentPath === '/experiences' && (
          <ExperiencesPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
          />
        )}

        {currentPath === '/safari' && (
          <SafariPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
          />
        )}

        {currentPath === '/about' && (
          <AboutPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
          />
        )}

        {currentPath === '/contact' && (
          <ContactPage
            currentLang={currentLang}
            onNavigate={handleNavigate}
            onRequestBooking={() => handleOpenBooking()}
            onOpenSupportChat={handleOpenSupportChat}
          />
        )}

        {currentPath === '/privacy' && <PrivacyPage onNavigate={handleNavigate} />}
        {currentPath === '/terms' && <TermsPage onNavigate={handleNavigate} />}

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
              />
            )}

            {/* 05: Property Experience (DISCOVER THE RETREAT) */}
            {isSectionVisible('experience') && (
              <PropertyExperienceSection currentLang={currentLang} />
            )}

            {/* 06: Dining Section (TASTE ZANZIBAR + FROM OUR GARDEN TO YOUR TABLE) */}
            {isSectionVisible('dining') && (
              <DiningSection currentLang={currentLang} />
            )}

            {/* 07: Experiences Section (EXPERIENCES - Discover Zanzibar beyond the ordinary) */}
            {isSectionVisible('experiences') && (
              <ExperiencesSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                onOpenSupportChat={handleOpenSupportChat}
              />
            )}

            {/* 08: Explore Zanzibar (Stone Town, Mnemba, Spice Farms, Jozani, Nungwi) */}
            {isSectionVisible('explore') && (
              <ExploreZanzibarSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
              />
            )}

            {/* 09: Beyond Zanzibar & Tanzania Safari (ONE ISLAND. A WHOLE TANZANIA TO DISCOVER.) */}
            {isSectionVisible('safari') && (
              <BeyondZanzibarSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
                onOpenSupportChat={handleOpenSupportChat}
              />
            )}

            {/* 10: Custom Itinerary Builder (BUILD YOUR TANZANIA JOURNEY) */}
            {isSectionVisible('itinerary') && (
              <CustomItinerarySection
                currentLang={currentLang}
                onOpenSupportChat={handleOpenSupportChat}
              />
            )}

            {/* 11: Shuttle & Arrival Service (ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST.) */}
            {isSectionVisible('shuttle') && (
              <ShuttleSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
              />
            )}

            {/* 12: Concierge Feature (YOUR JOURNEY, PERSONALLY ARRANGED) */}
            {isSectionVisible('concierge') && (
              <ConciergeSection
                currentLang={currentLang}
                onOpenSupportChat={handleOpenSupportChat}
              />
            )}

            {/* 13: Why Stay With Us (WHY ZANZIRANGI HOUSE) */}
            {isSectionVisible('whyStay') && (
              <WhyStaySection currentLang={currentLang} />
            )}

            {/* 14: Promotional Film Journey */}
            {isSectionVisible('video') && (
              <PromotionalVideoSection
                currentLang={currentLang}
                dynamicVideo={videos}
              />
            )}

            {/* 15: Facilities & Amenities */}
            {isSectionVisible('facilities') && (
              <FacilitiesSection
                currentLang={currentLang}
                facilities={facilities}
              />
            )}

            {/* 16: Gallery Section (7 Luxury Categories + Lightbox) */}
            {isSectionVisible('gallery') && (
              <GallerySection
                currentLang={currentLang}
                items={gallery}
              />
            )}

            {/* 17: Guest Impressions & Testimonials */}
            {isSectionVisible('reviews') && (
              <ReviewsSection
                currentLang={currentLang}
                reviews={testimonials}
              />
            )}

            {/* 18: OTA Distribution Trust Channels */}
            {isSectionVisible('otaChannels') && (
              <OtaChannelsSection currentLang={currentLang} />
            )}

            {/* 19: Location, Map & Directions */}
            {isSectionVisible('map') && (
              <MapSection currentLang={currentLang} />
            )}

            {/* 20: Final Call To Action */}
            {isSectionVisible('finalCta') && (
              <FinalCtaSection
                currentLang={currentLang}
                onOpenBooking={() => handleOpenBooking()}
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
          onClose={() => setBookingModalOpen(false)}
          onOpenSupportChat={handleOpenSupportChat}
        />
      </div>
    </ThemeProvider>
  );
}
