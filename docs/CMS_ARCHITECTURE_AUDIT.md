# Zanzirangi House: CMS Architecture Forensic Project Audit

**Document Version:** 1.0.0  
**Audit Date:** September 26, 2026  
**Auditor:** Lead Full-Stack Architect & Senior Implementation Engineer  
**Target Domain:** [https://zanzirangihouse.com](https://zanzirangihouse.com)  
**Target Admin Route:** [https://zanzirangihouse.com/admin](https://zanzirangihouse.com/admin)  
**Hosting Environment:** Hostinger (Production) / GitHub Actions (CI/CD)  

---

## Executive Summary

This forensic audit assesses the current technical architecture of the Zanzirangi House codebase (`zanzirangi-house-v3`). The primary business objective is to evolve the project from a static/code-bound presentation layer into a dynamic, database-driven website with a dedicated, self-managed Admin Dashboard (`/admin`).

The audit reveals an ultra-polished, visually exceptional frontend engineered with React 19, Vite, Tailwind CSS v4, and Motion. However, **100% of website content, media links, translations, and reservation logic are currently hardcoded in static TypeScript files**. The existing `/admin` concept is an in-memory client-side demo modal (`CmsAdminModal.tsx`) that does not persist data across sessions.

This document presents the detailed findings across all 22 required audit dimensions and defines the migration strategy to achieve full CMS capabilities while preserving 100% of the existing luxury design, branding, SEO rankings, and performance.

---

## Forensic Audit (22 Audit Points)

### 1. Current Frontend Framework
* **Core Framework:** React 19.0.1 (`react`, `react-dom`).
* **Language:** TypeScript 5.8.2 (`tsconfig.json` target ES2022, bundler module resolution).
* **Styling Engine:** Tailwind CSS v4.1.14 using `@tailwindcss/vite` plugin and `@import "tailwindcss";` in `src/index.css`.
* **Theme System:** Custom `@theme` tokens in CSS defining a luxury color palette (Sand, Gold, Charcoal, Clay) coupled with a dynamic `ThemeContext` (Light/Dark mode) with early flash prevention script in `index.html`.
* **Animation Libraries:** Motion v12.23.24 (`motion/react`) for luxury scroll reveals, hero typography transitions, and modal view animations.
* **Iconography:** `lucide-react` v0.546.0.

---

### 2. Build System
* **Bundler & Tooling:** Vite 6.2.3 (`vite.config.ts`).
* **Vite Plugins:**
  * `@vitejs/plugin-react` (Fast Refresh & JSX transform).
  * `@tailwindcss/vite` (Vite-native Tailwind compiler).
* **Vite Configuration Highlights:**
  * `base: './'` (relative path resolution for static hosting flexibility).
  * Alias `@` resolves to the project root directory.
  * Server configuration binds to `0.0.0.0:3000` with `DISABLE_HMR` handling for remote dev environments.
* **Build Script:**
  ```bash
  npm run build # vite build && node scripts/generate_routes.js
  ```
* **Post-Build Static Route Generator:** `scripts/generate_routes.js` reads `dist/index.html` after the Vite build completes and duplicates it into physical subdirectories (`dist/villas/index.html`, `dist/dining/index.html`, etc.) while injecting canonical URLs, unique meta descriptions, OpenGraph tags, and Twitter Card headers for search engine crawlers.

---

### 3. Entry Points
* **HTML Document Entry:** `index.html` (root level).
  * Contains early theme loader script to eliminate Dark Mode Flash of Unstyled Content (FOUC).
  * Contains complete primary SEO metadata, Geo/ICBM coordinates (`-6.4429, 39.4678`), OpenGraph tags, circular favicons, typography preconnects (Google Fonts *Cormorant Garamond* & *Plus Jakarta Sans*), and extensive JSON-LD structured schemas (`WebPage`, `Organization`, `Product`, `Resort`, `FAQPage`, `BreadcrumbList`).
  * Mounts application at `<div id="root"></div>`.
* **JavaScript/TypeScript Entry:** `src/main.tsx`.
  * Renders `<App />` inside React `<StrictMode>` into `document.getElementById('root')`.
* **CSS/Style Entry:** `src/index.css` (imported at the top of `src/main.tsx`).

---

### 4. Routing Architecture
* **Implementation:** Lightweight client-side Single Page Application (SPA) routing implemented custom inside `src/App.tsx`.
* **State & Navigation Mechanism:**
  * `currentPath` state initialized via `window.location.pathname.replace(/\/+$/, '') || '/'`.
  * `handleNavigate(path)` pushes state via `window.history.pushState({}, '', cleanPath)`.
  * `popstate` event listener synchronizes browser Back/Forward navigation with smooth scroll to top.
* **Existing Canonical Routes:**
  * `/` — Full main homepage journey (20 continuous luxury sections).
  * `/villas` — Dedicated Private Luxury Villas inventory & amenities page.
  * `/dining` — Oceanfront gastronomy & culinary experience showcase.
  * `/experiences` — Menai Bay dolphin dhow excursions & island tours.
  * `/safari` — Tanzania bush-and-beach fly-in safari itineraries.
  * `/about` — Heritage, architecture, and sanctuary philosophy.
  * `/contact` — Direct concierge booking, maps, transfer inquiries.
  * `/privacy` — Privacy Policy & GDPR/guest data statement.
  * `/terms` — Terms & Conditions, booking and cancellation rules.
* **Routing Limitations:**
  * No library router (`react-router-dom`) is currently used.
  * No `/admin` route or administrative route protection exists in `App.tsx`.
  * Web server fallbacks rely on `.htaccess` rewrite rules (`RewriteRule ^ index.html [L]`) on Apache/Hostinger or pre-rendered route directories.

---

### 5. Existing Page Structure
* **Main Homepage (`/`):** A single-page, vertically integrated storytelling flow composed of 20 distinct section modules:
  1. `HeroSection`: Full-viewport ambient looping video (`Zanzirangi-home.mp4`) with luxury typography.
  2. `QuickBookingBar`: Real-time interactive check-in/out and guest counter bar.
  3. `PropertyIntro`: Editorial narrative ("More Than A Stay").
  4. `VillasSection`: 8-villa inventory cards with tabbed categories and modal triggers.
  5. `PropertyExperienceSection`: Discover the retreat overview.
  6. `DiningSection`: 4 culinary categories with signature dishes and tabbed switching.
  7. `ExperiencesSection`: Island excursions with duration tags and inquiry links.
  8. `ExploreZanzibarSection`: Regional highlights (Stone Town, Mnemba, Jozani).
  9. `BeyondZanzibarSection`: Mainland Tanzania fly-in safari integration.
  10. `CustomItinerarySection`: Multi-day bespoke itinerary builder interface.
  11. `ShuttleSection`: Airport arrival coordination & chauffeur service details.
  12. `ConciergeSection`: 24/7 personal butler and concierge highlight.
  13. `WhyStaySection`: Brand differentiators and privacy pillars.
  14. `PromotionalVideoSection`: Interactive cinematic storyboard player (7 scenes).
  15. `FacilitiesSection`: Estate infrastructure, pools, wellness, garden.
  16. `GallerySection`: 7-category filtered photography grid with lightbox modal.
  17. `ReviewsSection`: Verified guest testimonials and ratings.
  18. `OtaChannelsSection`: External channel distribution trust badges (Booking.com, Agoda, Expedia).
  19. `MapSection`: Kizimkazi Dimbani interactive map and directions.
  20. `FinalCtaSection`: Direct reservation encouragement with WhatsApp link.
* **Global Overlays & Subpages:**
  * Persistent `Navbar` and `Footer` with multi-language selector (8 languages) and Dark Mode toggle.
  * Subpages in `src/pages/` (`VillasPage`, `DiningPage`, `ExperiencesPage`, `SafariPage`, `AboutPage`, `ContactPage`, `PrivacyPage`, `TermsPage`).
  * Floating `ChatAssistant`: Rule-based personal concierge in bottom-left screen corner.
  * Modals: `BookingModal`, `VillaDetailModal`, `LightboxModal`, and `CmsAdminModal`.

---

### 6. Existing Component Structure
* **Total Components:** 35 files in `src/components/`.
* **Component Classification:**
  * **Layout & Navigation:** `Navbar.tsx`, `Footer.tsx`, `Breadcrumbs.tsx`.
  * **Section Containers:** 18 distinct section components.
  * **Modals & Overlays:**
    * `BookingModal.tsx` (Inquiry submission form).
    * `VillaDetailModal.tsx` (Comprehensive villa specifications and photo carousel).
    * `LightboxModal.tsx` (Full-screen media lightbox).
    * `CmsAdminModal.tsx` (Client pitch concept modal).
  * **Interactive Widgets:**
    * `ChatAssistant.tsx` (Personal AI concierge with simulated knowledge base).
    * `QuickBookingBar.tsx` (Sticky reservation filter).
  * **Animation & Visual Helpers:**
    * `ScrollFadeContainer.tsx` (Horizontal touch carousel with gradient edges).
    * `ScrollReveal.tsx` (Viewport intersection observer animation wrapper).
    * `InternalLinkingSection.tsx` (SEO contextual link block between subpages).

---

### 7. Where Content is Currently Hardcoded
All textual content, pricing, specifications, and localized translations are stored in static TypeScript files within `src/data/`:
* `src/data/propertyConfig.ts`: Resort name, phone numbers, WhatsApp links, email, coordinates, social links, stats, and OTA badges.
* `src/data/villas.ts`: 8 villas with room numbers, titles, capacities, square footage, bed types, pricing per night (`$390` - `$480`), architectural features, descriptions, and amenities arrays.
* `src/data/dining.ts`: Dining categories, dining descriptions, and signature dishes.
* `src/data/experiences.ts`: List of guided island excursions, tags, and durations.
* `src/data/exploreZanzibar.ts`: Zanzibar landmark descriptions (Stone Town, Prison Island, etc.).
* `src/data/tanzaniaDestinations.ts`: Safari destinations (Serengeti, Ngorongoro, Kilimanjaro, Tarangire).
* `src/data/facilities.ts`: Resort amenities and wellness features.
* `src/data/gallery.ts`: 18+ gallery entries categorized into 7 filters.
* `src/data/reviews.ts`: Guest review cards, reviewer names, countries, ratings, and quotes.
* `src/data/itinerary.ts`: 3-day, 5-day, and 7-day curated travel itineraries.
* `src/data/surroundings.ts`: Nearby points of interest around Kizimkazi.
* **Multilingual Localization Dictionaries (8 Languages: EN, FR, SW, ES, IT, AR, ZH, PL):**
  * `translations.ts` (60 KB)
  * `villaTranslations.ts` (79 KB)
  * `diningTranslations.ts` (52 KB)
  * `experienceTranslations.ts` (53 KB)
  * `facilitiesTranslations.ts` (31 KB)
  * `galleryTranslations.ts` (35 KB)
  * `introTranslations.ts` (74 KB)
  * `itineraryTranslations.ts` (50 KB)
  * `reviewsTranslations.ts` (22 KB)
  * `serviceTranslations.ts` (75 KB)
  * `villaCategoryTranslations.ts` (20 KB)
  * `destinationTranslations.ts` (68 KB)
  * `chatTranslations.ts` (45 KB)

---

### 8. Where Images are Currently Hardcoded
* **External Stock Photography (Unsplash CDN):** Over 60 high-resolution photographic URLs hardcoded directly in:
  * `src/data/villas.ts`
  * `src/data/dining.ts`
  * `src/data/experiences.ts`
  * `src/data/exploreZanzibar.ts`
  * `src/data/facilities.ts`
  * `src/data/gallery.ts`
  * `src/data/tanzaniaDestinations.ts`
  * `src/components/PromotionalVideoSection.tsx`
* **Local Brand Assets:**
  * Stored in `public/`: `zanzirangi-villas.jpg`, `zanzirangi-villa's.jpg`, `zanzirangi-logo-new.jpeg`, `zanzirangi-logo-circle.png`, `Zanzirangi-logo.png`, `zanzirangi-house-logo.jpg`.
  * Duplicated in `src/assets/`: `zanzirangi-villas.jpg`, `zanzirangi-logo-new.jpeg`, `Zanzirangi-logo.png`.
  * Duplicated in `src/components/`: `zanzirangi-villas.jpg`, `zanzirangi-house-logo.jpg`.

---

### 9. Where Videos are Currently Hardcoded
* **Hero Background Video:**
  * File location: `src/data/Zanzirangi-home.mp4` (1.68 MB).
  * Imported in `src/components/HeroSection.tsx`:
    ```tsx
    import heroVideo from '../data/Zanzirangi-home.mp4';
    // Fallbacks:
    <source src={heroVideo} type="video/mp4" />
    <source src="./Zanzirangi-home.mp4" type="video/mp4" />
    <source src="./videos/Zanzirangi-home.mp4" type="video/mp4" />
    ```
* **Promotional Video Section:**
  * In `src/components/PromotionalVideoSection.tsx`, the player is not playing a video file, but is an automated slideshow that steps through 7 scene frames with Unsplash photos, timed play/pause controls, and scene text.

---

### 10. Existing API Usage
* **Runtime HTTP Calls:** There are currently **zero** active runtime network API requests (`fetch` or `axios`) made by the frontend.
* **Third-Party Embeds:**
  * Google Maps Embed `<iframe>` in `MapSection.tsx` pointing to `-6.4429, 39.4678`.
* **Dormant SDKs:**
  * `@google/genai` is listed in `package.json` and `dotenv` is installed, but neither is invoked in application code.

---

### 11. Existing Backend, If Any
* **Status:** **None**.
* The application runs strictly as client-side JavaScript in the user's browser.
* All form actions (e.g. `BookingModal` submission) run a simulated `setTimeout` before displaying a success message, with optional redirects to WhatsApp via `wa.me` links.

---

### 12. Existing Database, If Any
* **Status:** **None**.
* There is no persistence layer.
* In `src/components/CmsAdminModal.tsx`, clicking "Save Changes" merely runs:
  ```ts
  setSaveFeedback('Configuration synchronized successfully in demo state.');
  ```
  Data reverts to static TypeScript defaults immediately upon page reload.

---

### 13. Existing Authentication, If Any
* **Status:** **None**.
* There is no session token, JWT, cookies, or role-based access control.
* Any visitor who triggers `onOpenCmsPitch` from the footer can see the prototype CMS modal.

---

### 14. Existing Environment Variables
* File `.env.example` contains:
  ```env
  GEMINI_API_KEY=
  ```
* No runtime environment variables are loaded or consumed in the browser client bundle.
* Vite references `DISABLE_HMR` in `vite.config.ts` during development.

---

### 15. Existing Deployment Configuration
* **Hostinger Deployment:**
  * Documented in `HOSTINGER_DEPLOYMENT.md`.
  * Manual deployment model: run `npm run build`, zip the `dist/` directory into `zanzirangi-house-deploy.zip`, upload to Hostinger File Manager, and extract into `public_html/`.
* **Apache Server Configuration:**
  * `public/.htaccess`: Configures `mod_rewrite` to route non-file requests to `index.html`, enables `mod_expires` (1-year asset cache, 1-hour XML/text cache, 0-second HTML cache), and enables `mod_deflate` Gzip compression.
* **GitHub Actions:**
  * `.github/workflows/deploy.yml`: Triggers on push to `main`, runs `npm run build`, and deploys the `dist/` folder to GitHub Pages (`actions/deploy-pages@v4`).
* **Vercel Configuration:**
  * `vercel.json`: Defines Vite framework presets with clean URLs and rewrite rule `/(.*)` to `/index.html`.

---

### 16. Existing SEO Architecture
* **Traditional SEO:**
  * High-quality `<title>`, `<meta name="description">`, `<meta name="keywords">`, `<meta name="robots">`, and `<link rel="canonical">` tags on every page.
  * Active dynamic updates via `useEffect` in `App.tsx` matching `ROUTE_SEO` rules on client route transitions.
* **Structured Data (JSON-LD):**
  * Embedded in `index.html` with interconnected `@graph` schema objects:
    * `WebPage` with `speakable` specification for voice search.
    * `Organization` with logo, contact point, geo-location, and social profile links (`sameAs`).
    * `Resort` with star rating, coordinates, price range, and amenities.
    * `FAQPage` answering 5 high-intent traveler questions.
    * `BreadcrumbList` establishing page hierarchy.
* **Generative Engine Optimization (GEO):**
  * `public/llms.txt`: Plaintext structured fact sheet crafted specifically for citation by AI search engines (ChatGPT Search, Perplexity AI, Google Gemini, Claude).
  * Speakable specifications and clear informational definitions across content sections.
* **Multilingual SEO:**
  * Alternate language definitions (`xhtml:link rel="alternate" hreflang="..."`) in `public/sitemap.xml`.

---

### 17. Existing Sitemap
* **Location:** `public/sitemap.xml` (copied to `dist/sitemap.xml` on build).
* **Coverage:** 9 canonical URLs (`/`, `/villas`, `/dining`, `/experiences`, `/safari`, `/about`, `/contact`, `/privacy`, `/terms`).
* **Attributes:** `<lastmod>2026-09-25</lastmod>`, `<changefreq>`, `<priority>`, `<xhtml:link>` hreflang annotations across 8 languages + `x-default`, and Google `<image:image>` metadata tags.

---

### 18. Existing robots.txt
* **Location:** `public/robots.txt`.
* **Rules:**
  * `User-agent: *` — `Allow: /`, `Disallow: /admin`, `Disallow: /api/`.
  * Explicit `Allow: /` grants for 11 AI search crawlers (`Googlebot`, `Bingbot`, `Google-Extended`, `GPTBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `anthropic-ai`, `Applebot`, `Applebot-Extended`, `cohere-ai`, `meta-externalagent`).
  * Declares `Sitemap: https://zanzirangihouse.com/sitemap.xml`.
  * **Note:** Note that `/admin` and `/api/` are already designated as disallowed from search indexation in `robots.txt`, which perfectly matches our target architecture.

---

### 19. Existing Asset Directories
* `public/`:
  * Root assets (`.htaccess`, `.nojekyll`, `favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`, `robots.txt`, `sitemap.xml`, `llms.txt`).
  * Brand images (`zanzirangi-villas.jpg`, `zanzirangi-logo-circle.png`, `zanzirangi-logo-new.jpeg`, etc.).
* `src/assets/`:
  * Bundled images (`zanzirangi-villas.jpg`, `zanzirangi-logo-new.jpeg`, `Zanzirangi-logo.png`).
* `src/data/`:
  * Media file `Zanzirangi-home.mp4` (1.68 MB).
* `src/components/`:
  * Orphaned image files (`zanzirangi-villa's.jpg`, `zanzirangi-house-logo.jpg`).
* **Recommendation:** Unify media management under a dedicated public media folder or cloud storage bucket.

---

### 20. Existing Public Paths
The following URLs and endpoints are currently publicly accessible:
* `https://zanzirangihouse.com/` (Homepage)
* `https://zanzirangihouse.com/villas`
* `https://zanzirangihouse.com/dining`
* `https://zanzirangihouse.com/experiences`
* `https://zanzirangihouse.com/safari`
* `https://zanzirangihouse.com/about`
* `https://zanzirangihouse.com/contact`
* `https://zanzirangihouse.com/privacy`
* `https://zanzirangihouse.com/terms`
* `https://zanzirangihouse.com/robots.txt`
* `https://zanzirangihouse.com/sitemap.xml`
* `https://zanzirangihouse.com/llms.txt`
* `https://zanzirangihouse.com/assets/*` (Hashed bundle scripts and styles)

---

### 21. Hostinger Compatibility Risks

| Risk Factor | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Hosting Plan Tier Constraints** | Hostinger offers Shared, Cloud, and VPS hosting. Standard Shared Hosting runs Apache + PHP 8.x + MariaDB. It does NOT reliably support long-running Node.js daemon processes (e.g. Express server running on port 5000) without crashing under memory limits or process managers. | Architect the backend to either: (A) Use a robust headless BaaS (e.g. Supabase, Firebase, or PocketBase) that communicates via client-side HTTPS without requiring Node daemons on Hostinger, OR (B) Provide a lightweight PHP REST API + MySQL layer natively supported on 100% of Hostinger plans, OR (C) Node.js API with Hostinger Application Manager if VPS/Cloud is configured. |
| **Media File Persistence** | If media uploads are stored directly in `public_html/uploads/`, any subsequent Git automated pull or full `dist/` zip re-deployment will overwrite or delete uploaded client photos. | Isolate media storage into a permanent, un-tracked directory outside the build output (e.g., `/public_html/storage/` protected from deployment overwrites) or utilize dedicated Cloudinary / Supabase Storage with CDN. |
| **Client-Side Routing on `/admin`** | Navigating directly to `https://zanzirangihouse.com/admin` or hitting browser refresh inside `/admin/dashboard` will trigger an Apache HTTP 404 error if `.htaccess` is missing or lacks the rewrite fallback. | Add explicit rewrite rules in `public/.htaccess` directing `/admin` and all sub-routes to `index.html` while preserving API endpoint paths. |
| **Database File Locking (SQLite)** | If SQLite is used directly on Hostinger shared disk, concurrent writes from the admin dashboard and web visitors can cause file-locking errors or database corruption. | Utilize MySQL / MariaDB (native to Hostinger) or an external managed Postgres/BaaS (Supabase) to guarantee atomic transactions. |
| **SEO Integrity** | Replacing client-side code must not damage existing Google sitelinks, pre-rendered routes, or OpenGraph cards. | Maintain `scripts/generate_routes.js` and keep initial static data as instant fallbacks so the site never shows a blank loading screen to search crawlers. |

---

### 22. Recommended Migration Path

To fulfill the owner's objective without disrupting the live website, we recommend a **4-Stage Progressive Decoupled Architecture**:

```
                       INTERNET
                          │
                          ▼
                 zanzirangihouse.com
                          │
                 ┌────────┴────────┐
                 │                 │
                 ▼                 ▼
          PUBLIC WEBSITE       ADMIN DASHBOARD
          /                    /admin
                 │                 │
                 │                 │
                 └────────┬────────┘
                          │
                          ▼
                     BACKEND API
              (/api or Supabase/REST)
                          │
                ┌─────────┴──────────┐
                │                    │
                ▼                    ▼
             DATABASE            MEDIA STORAGE
          content/data          photos/videos/files
                │                    │
                └─────────┬──────────┘
                          ▼
                      HOSTINGER
```

#### Phase 1: Database & Data Schema Foundation
1. Design normalized data schemas for:
   * **Villas Inventory** (Name, pricing, size, capacity, features, descriptions, gallery, amenities, availability).
   * **Property Configuration** (Contact numbers, WhatsApp, emails, address, social links, stats).
   * **Dining & Gastronomy** (Categories, menus, signature dishes, descriptions).
   * **Experiences & Tours** (Excursions, durations, highlights, pricing).
   * **Safari Packages** (Destinations, itineraries, details).
   * **Gallery & Media** (Images, video links, categories, aspect ratios, alt text).
   * **Reviews & Testimonials** (Author, country, rating, date, text, status).
   * **SEO & Meta Management** (Page titles, meta descriptions, canonical URLs, keywords).
   * **Reservation Inquiries** (Guest submissions captured securely for owner review).
2. Seed the database with the current static data from `src/data/` so zero content is lost.

#### Phase 2: Secure Backend API & Authentication
1. Implement secure authentication (email/password with hashed credentials, JWT session tokens, and route guards).
2. Create authenticated REST API endpoints:
   * `GET /api/content/:section` (Public read, cached).
   * `PUT /api/content/:section` (Admin write with JWT verification).
   * `POST /api/media/upload` (Secure image & video upload with validation).
   * `GET /api/inquiries` & `POST /api/inquiries` (Secure booking management).
3. Ensure Hostinger deployment options:
   * **Option 1 (Hostinger Native Cloud/BaaS):** Supabase / PocketBase connection — 100% reliable, zero server maintenance, built-in Auth, instant REST API, PostgreSQL, and CDN media storage.
   * **Option 2 (Hostinger PHP/MySQL API):** Drop-in `public_html/api/` folder using native PHP 8.x and Hostinger MySQL database.

#### Phase 3: Admin Dashboard Implementation (`/admin`)
1. Integrate `/admin` into the application router.
2. Build administrative UI adhering to the Zanzirangi luxury dark aesthetic:
   * **Admin Login Screen** (`/admin/login`) with credential validation and error handling.
   * **Dashboard Overview** (`/admin`): Quick statistics, inquiry counts, villa availability status, and quick links.
   * **Villas Manager** (`/admin/villas`): Edit pricing, descriptions, amenities, and availability with instant live preview.
   * **Media Manager** (`/admin/media`): Upload new villa photos and videos; copy URLs or assign directly to inventory.
   * **Dining & Experiences Manager** (`/admin/dining`, `/admin/experiences`): Update menus, signature dishes, and excursion details.
   * **Content & Property Settings** (`/admin/property`): Update phone numbers, WhatsApp, rates, and hotel policies.
   * **SEO Manager** (`/admin/seo`): Fine-tune page titles, descriptions, and keywords without touching code.
   * **Inquiries Inbox** (`/admin/inquiries`): View incoming reservation inquiries with contact info and special requests.

#### Phase 4: Dynamic Frontend Hydration with Graceful Fallback
1. Update public components to fetch dynamic content from the API on load.
2. Preserve current static data as **instant fallback data**:
   * If the API is loading or network is offline, the site immediately renders the bundled static data with zero delay or layout shift.
   * Once dynamic data loads from the database, it seamlessly updates in place.
   * Search engines and crawlers are guaranteed 100% complete content on the first byte.
3. Test Hostinger deployment with `.htaccess` rewrite rules and verify both public routes and `/admin` routes.

---

## Conclusion

The Zanzirangi House codebase is exceptionally well-structured on the frontend. By implementing the decoupled architecture audited above, the resort owner can effortlessly manage villa prices, photos, menus, and contact information through `zanzirangihouse.com/admin` while keeping the public website blazing fast, visually magnificent, and completely search-optimized on Hostinger.
