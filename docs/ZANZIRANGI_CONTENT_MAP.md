# Zanzirangi House: Complete Public Website Content Map & CMS Inventory

**Document Version:** 1.0.0  
**Audit Date:** September 26, 2026  
**Target Domain:** [https://zanzirangihouse.com](https://zanzirangihouse.com)  
**CMS Route:** [https://zanzirangihouse.com/admin](https://zanzirangihouse.com/admin)  
**Lead Full-Stack Architect:** Senior Implementation Engineer  

---

## 1. Architectural Content Hierarchy

The Zanzirangi House architecture follows a structured, relational content model:

```
SITE CONFIGURATION (Brand, Contacts, Socials, Global Meta)
  │
  ├── HOMEPAGE SECTIONS (Ordered & Toggleable)
  │    ├── 01. Hero & Slide Carousel (Slides, Badges, CTAs, Video/Poster)
  │    ├── 02. Quick Search Bar (Availability Config)
  │    ├── 03. Editorial Narrative ("More Than A Stay")
  │    ├── 04. Villas Preview (Filtered Inventory & Pricing)
  │    ├── 05. Property Experience ("Discover The Retreat")
  │    ├── 06. Oceanfront Gastronomy (Culinary Categories & Signature Menus)
  │    ├── 07. Experiences Showcase (Island Excursions & Guided Tours)
  │    ├── 08. Regional Exploration (Zanzibar Landmarks & Wildlife)
  │    ├── 09. Beyond Zanzibar (Fly-in Safari Connections)
  │    ├── 10. Custom Itinerary Planner (Day-by-Day Curated Journeys)
  │    ├── 11. Shuttle & Arrival (Private Chauffeur & Transfers)
  │    ├── 12. Concierge Showcase (24/7 Dedicated Butler Service)
  │    ├── 13. Why Stay (Core Sanctuary Differentiators)
  │    ├── 14. Brand Video Reel (Cinematic Storyboard Sequence)
  │    ├── 15. Estate Facilities (Infrastructure & Wellness Features)
  │    ├── 16. Curated Gallery (7 Filtered Photography Collections)
  │    ├── 17. Guest Testimonials (Verified Reviews & Ratings)
  │    ├── 18. Channel Distribution (OTA Badges & Accreditations)
  │    ├── 19. Location & Interactive Map (Coordinates & Distances)
  │    └── 20. Final Conversion CTA (Direct Booking Engagement)
  │
  ├── ROOMS & VILLAS COLLECTION (8 Units with Galleries, Amenities, Pricing)
  ├── DINING & MENUS COLLECTION (4 Categories with Dishes & Hours)
  ├── EXPERIENCES COLLECTION (Island Tours & Ocean Activities)
  ├── SAFARI DESTINATIONS (Serengeti, Ngorongoro, Kilimanjaro, Tarangire)
  ├── MEDIA LIBRARY (Images, Video Assets, Alt Texts, Relationships)
  ├── TESTIMONIALS & REVIEWS (Guest Ratings, Testimonials, Badges)
  ├── FACILITIES & AMENITIES (Resort Infrastructure & Highlights)
  └── SEO & METADATA (Global & Per-Route Metadata, OpenGraph, JSON-LD)
```

---

## 2. Comprehensive Inventory of Public Sections

Below is the forensic inventory of every single public-facing UI element on `zanzirangihouse.com`, mapped into database schemas and CMS management modules.

---

### Section 01: Hero & Ambient Visual Journey
1. **Section Name:** Hero Section & Slide Reel
2. **Page:** Homepage (`/`) & subpage headers
3. **Component:** `src/components/HeroSection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`hero`), `src/data/propertyConfig.ts`, `src/data/Zanzirangi-home.mp4`
5. **Text Fields:**
   - Location Eyebrow Badge (`badgeLocation`: `"KIZIMKAZI DIMBANI, ZANZIBAR"`)
   - Brand Main Title (`brandName`: `"Zanzibar Luxury Villa - Zanzirangi House"`)
   - Luxury Subtitle Descriptor (`luxurySubtitle`: `"Private Pool Retreat"`)
   - Narrative Paragraph (`subtitleNarrative`: `"Stay, explore and experience the island — with Tanzania beyond."`)
   - Primary CTA Text (`bookCta`: `"PLAN YOUR JOURNEY"`)
   - Secondary CTA Text (`exploreCta`: `"EXPLORE THE RETREAT"`)
6. **Image Fields:** Poster photography (`posterImage`: Unsplash coral pool link)
7. **Video Fields:** Background looping video (`heroVideo`: `Zanzirangi-home.mp4`, 1.68 MB)
8. **Carousel:** Hero slides collection (supports multiple rotating hero slides with image/video backgrounds)
9. **Cards:** None
10. **Lists:** None
11. **Buttons:** Primary Button ("PLAN YOUR JOURNEY"), Secondary Button ("EXPLORE THE RETREAT"), Scroll Down indicator cue
12. **Links:** Google Maps Location Link (`GOOGLE_MAPS_URL`)
13. **Icons:** `MapPin`, `Compass`, `ChevronDown`, `Sparkles`
14. **Ordering:** Top index (Order: 1)
15. **Visibility:** Toggleable (`visible: true`)
16. **Data to be Database-Driven:** Slide title, subtitle, narrative description, poster image URL, video URL, CTA labels & destinations, slide ordering, slide visibility.
17. **Recommended CMS Editor:** `Homepage Editor -> Hero & Slides Manager` (Repeater with Drag & Drop ordering, preview, and image selector).
18. **Required Database Fields:**
    ```ts
    hero: {
      visible: boolean;
      activeSlideIndex: number;
      slides: Array<{
        id: string;
        badgeText: string;
        title: string;
        subtitle: string;
        description: string;
        posterImage: string;
        videoUrl: string;
        primaryCtaText: string;
        primaryCtaLink: string;
        secondaryCtaText: string;
        secondaryCtaLink: string;
        order: number;
        visible: boolean;
      }>;
    }
    ```

---

### Section 02: Quick Search / Booking Availability Bar
1. **Section Name:** Quick Booking Bar
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/QuickBookingBar.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`quickBooking`), `src/data/villas.ts`
5. **Text Fields:**
   - Label: Check-in, Check-out, Guests, Preferred Villa
   - Button text: `"CHECK AVAILABILITY"`
   - Note: `"Best Rate Guaranteed • Direct WhatsApp & Email Concierge"`
6. **Image Fields:** None
7. **Video Fields:** None
8. **Carousel:** None
9. **Cards:** Horizontal bar container
10. **Lists:** Villa dropdown selection list
11. **Buttons:** Check Availability CTA button
12. **Links:** Triggers `BookingModal`
13. **Icons:** `Calendar`, `Users`, `Home`, `ArrowRight`, `ShieldCheck`
14. **Ordering:** Order: 2
15. **Visibility:** Toggleable (`visible: true`)
16. **Data to be Database-Driven:** Guarantee note, button label, min/max guests limit, default stay duration.
17. **Recommended CMS Editor:** `Homepage Editor -> Quick Booking Bar Settings`.
18. **Required Database Fields:**
    ```ts
    quickBooking: {
      visible: boolean;
      guaranteeText: string;
      ctaText: string;
      minGuests: number;
      maxGuests: number;
    }
    ```

---

### Section 03: Editorial Introduction ("More Than A Stay")
1. **Section Name:** Editorial Introduction
2. **Page:** Homepage (`/`) & About Page (`/about`)
3. **Component:** `src/components/PropertyIntro.tsx`
4. **Current Content Source:** `src/data/introTranslations.ts`, `src/data/propertyConfig.ts`
5. **Text Fields:**
   - Philosophy Eyebrow Tag (`philosophyTag`: `"MORE THAN A STAY"`)
   - Headline (`heading`: `"An intimate sanctuary between the ocean breeze and Swahili heritage"`)
   - Italic Pull-Quote (`quote`: `"Where Indian Ocean tranquility meets handcrafted Swahili elegance."`)
   - Narrative Body Paragraph (`body`: Multi-sentence retreat description)
   - Image Caption (`locationTag`: `"KIZIMKAZI COASTLINE"`)
6. **Image Fields:** Editorial architecture photo (`src="https://images.unsplash.com/photo-1540541338287-41700207dee6..."`)
7. **Video Fields:** None
8. **Carousel:** None
9. **Cards:** Editorial two-column feature layout with photo card
10. **Lists:** None
11. **Buttons:** None
12. **Links:** None
13. **Icons:** None
14. **Ordering:** Order: 3
15. **Visibility:** Toggleable (`visible: true`)
16. **Data to be Database-Driven:** Eyebrow tag, heading, quote, body narrative, image URL, image alt text, location caption.
17. **Recommended CMS Editor:** `Homepage Editor -> Editorial Introduction`.
18. **Required Database Fields:**
    ```ts
    intro: {
      visible: boolean;
      eyebrow: string;
      title: string;
      quote: string;
      description: string;
      image: string;
      imageAlt: string;
      caption: string;
    }
    ```

---

### Section 04: Stay & Private Villas Showcase
1. **Section Name:** Stay / Villas & Suites Showcase
2. **Page:** Homepage (`/`) & Villas Page (`/villas`)
3. **Component:** `src/components/VillasSection.tsx` & `src/components/VillaDetailModal.tsx`
4. **Current Content Source:** `src/data/villas.ts`, `src/data/villaCategoryTranslations.ts`, `src/data/villaTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"EXCLUSIVE RETREAT ACCOMMODATION"`)
   - Title (`"Stay Your Way"`)
   - Subtitle (`"8 Handcrafted Sanctuary Residences in Kizimkazi"`)
   - Category Tabs (`All Units (8)`, `Oceanfront Master (2)`, `Garden Seclusion (3)`, `Lagoon Access (3)`)
   - Per Villa: Room Number (`"VILLA 01"`), Name (`"Sultan Oceanfront Villa"`), Type (`"Master Ocean Villa with Private Plunge Pool"`), Size (`"95 m²"`), Bed (`"King Four-Poster"`), Bath (`"En-suite Wet Room"`), View (`"Direct Panoramic Sunset"`), Price (`"$480"`), Price Unit (`"/ night"`), Short Description, Full Editorial Description, Architectural Highlights.
6. **Image Fields:**
   - Per Villa: Cover/Hero Image + Gallery Array (4-6 photos per villa)
7. **Video Fields:** Optional villa walkthrough video
8. **Carousel:** Villa detail photo carousel & card image sliders
9. **Cards:** 8 individual villa inventory cards with hover zoom, price tag, and feature badges
10. **Lists:** Per-villa amenities list (10 items each: Private Pool, Butler, WiFi, Mini Bar, etc.)
11. **Buttons:** "VIEW SPECIFICATIONS" (opens `VillaDetailModal`), "RESERVE SANCTUARY" (opens `BookingModal`), Category Filter Pills
12. **Links:** Direct reservation inquiry with pre-selected villa ID
13. **Icons:** `Bed`, `Users`, `Maximize2`, `Waves`, `Eye`, `Check`, `Sparkles`, `ArrowRight`
14. **Ordering:** Order: 4 (Per villa: `orderIndex: 1..8`)
15. **Visibility:** Toggleable per section AND per villa (`isAvailable: true`, `status: "published" | "draft" | "hidden"`)
16. **Data to be Database-Driven:** Complete Villa CRUD (inventory records, prices, descriptions, photography gallery, amenities, capacity, availability, category classification).
17. **Recommended CMS Editor:** Dedicated CMS Module: `Rooms & Villas Manager` (`/admin/rooms`).
18. **Required Database Fields:**
    ```ts
    villas: Array<{
      id: string;
      roomNumber: string;
      name: string;
      type: string;
      category: 'oceanfront' | 'garden' | 'lagoon';
      pricePerNight: string;
      priceCurrency: string;
      pricePeriod: string;
      capacity: number;
      bedType: string;
      bathrooms: string;
      sizeSquareMeters: string;
      viewType: string;
      availability: boolean;
      featured: boolean;
      shortDescription: string;
      fullDescription: string;
      architecturalFeature: string;
      coverImage: string;
      gallery: string[];
      amenities: string[];
      order: number;
      status: 'published' | 'draft' | 'hidden';
    }>
    ```

---

### Section 05: Property Experience ("Discover The Retreat")
1. **Section Name:** Property Experience & Identity Pillars
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/PropertyExperienceSection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`retreat`)
5. **Text Fields:**
   - Eyebrow (`"DISCOVER THE RETREAT"`)
   - Heading (`"A Sanctuary of Barefoot Elegance & Stillness"`)
   - Description (`"Crafted for travelers who seek authentic intimacy over commercial resorts."`)
   - 4 Pillars:
     1. Private Plunge Pools (100% privacy, unconstrained tidal swimming)
     2. Ocean-to-Table Gastronomy (Daily catch, rare spices)
     3. Marine Protected Sanctuary (Menai Bay dolphin reserve)
     4. Direct Mainland Safari Bridge (Fly-in bush & beach itineraries)
6. **Image Fields:** Pillar background illustrations & photography
7. **Video Fields:** None
8. **Carousel:** None
9. **Cards:** 4 feature cards with subtle luxury borders
10. **Lists:** Pillar bullet points
11. **Buttons:** None
12. **Links:** None
13. **Icons:** `Waves`, `UtensilsCrossed`, `Compass`, `PlaneTakeoff`
14. **Ordering:** Order: 5
15. **Visibility:** Toggleable (`visible: true`)
16. **Data to be Database-Driven:** Section heading, description, 4 pillar titles, descriptions, icons, ordering.
17. **Recommended CMS Editor:** `Homepage Editor -> Property Experience Pillars`.
18. **Required Database Fields:**
    ```ts
    propertyExperience: {
      visible: boolean;
      eyebrow: string;
      title: string;
      description: string;
      pillars: Array<{
        id: string;
        title: string;
        description: string;
        iconName: string;
        order: number;
      }>;
    }
    ```

---

### Section 06: Oceanfront Gastronomy & Dining
1. **Section Name:** Oceanfront Dining & Culinary Experience
2. **Page:** Homepage (`/`) & Dining Page (`/dining`)
3. **Component:** `src/components/DiningSection.tsx`
4. **Current Content Source:** `src/data/dining.ts`, `src/data/diningTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"TASTE ZANZIBAR"`)
   - Heading (`"Artisanal Ocean-to-Table Gastronomy"`)
   - Philosophy Quote (`"Line-caught Kizimkazi seafood and organic spices harvested at sunrise."`)
   - Narrative Paragraph
   - 4 Dining Categories:
     1. Oceanfront Seafood Grill (Line-caught lobster, kingfish carpaccio, mangrove crab)
     2. Swahili Spice Infusions (Omani-Swahili curry, coconut pilau, cardamom lemongrass cream)
     3. Sunset Beach Candlelight Dinners (Private beach dining, personal dhow table)
     4. Private Veranda Breakfast (Tropical fruit platters, fresh baobab smoothies, artisan pastries)
   - Signature Dishes (name, description, ingredients)
6. **Image Fields:** 4 category feature photos + dish detail images
7. **Video Fields:** None
8. **Carousel:** Dining tabbed carousel with signature dishes
9. **Cards:** Category cards, dish cards, quote cards
10. **Lists:** Signature dishes list per category
11. **Buttons:** Tab buttons, "RESERVE PRIVATE DINNER" CTA
12. **Links:** Opens `BookingModal` or WhatsApp direct concierge
13. **Icons:** `Utensils`, `Wine`, `Sparkles`, `Clock`, `Flame`
14. **Ordering:** Order: 6
15. **Visibility:** Toggleable (`visible: true`)
16. **Data to be Database-Driven:** Headings, category titles, descriptions, cover images, signature dishes list with descriptions, operating hours.
17. **Recommended CMS Editor:** Dedicated CMS Module: `Dining & Menus Manager` (`/admin/dining`).
18. **Required Database Fields:**
    ```ts
    dining: {
      visible: boolean;
      eyebrow: string;
      title: string;
      quote: string;
      description: string;
      categories: Array<{
        id: string;
        name: string;
        tabLabel: string;
        subtitle: string;
        description: string;
        image: string;
        signatureDishes: Array<{
          name: string;
          description: string;
          price?: string;
        }>;
        order: number;
        visible: boolean;
      }>;
    }
    ```

---

### Section 07: Zanzibar Experiences & Private Excursions
1. **Section Name:** Experiences & Tours Showcase
2. **Page:** Homepage (`/`) & Experiences Page (`/experiences`)
3. **Component:** `src/components/ExperiencesSection.tsx`
4. **Current Content Source:** `src/data/experiences.ts`, `src/data/experienceTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"EXPERIENCES"`)
   - Heading (`"Discover Zanzibar Beyond the Ordinary"`)
   - Subtitle (`"Bespoke private tours guided by local marine and cultural naturalists."`)
   - Experience Cards:
     - Ethical Dolphin Dhow Excursion (Menai Bay, 3-4 hours, strict wildlife distance protocol)
     - Private Sandbank Sunset Picnic (Kizimkazi reef, 4 hours)
     - UNESCO Stone Town Heritage Walk (3 hours, historical architecture)
     - Organic Spice Farm Immersion (3 hours, clove & vanilla plantations)
     - Jozani Red Colobus Forest Safari (3 hours, indigenous primates)
     - Sunset Dhow Sailing with Canapés (2.5 hours)
6. **Image Fields:** 6+ high-res excursion photos
7. **Video Fields:** Excursion video clip links
8. **Carousel:** Experience cards grid with filter tags
9. **Cards:** Individual experience cards with duration pill, tag badge, description, and CTA
10. **Lists:** Inclusions and duration tags
11. **Buttons:** Filter pills (`All`, `Marine`, `Culture`, `Nature`), "INQUIRE EXPERIENCE"
12. **Links:** Direct inquiry via WhatsApp or Chat Assistant
13. **Icons:** `Compass`, `Clock`, `Anchor`, `Palmtree`, `Sparkles`, `ArrowRight`
14. **Ordering:** Order: 7
15. **Visibility:** Toggleable per section AND per experience
16. **Data to be Database-Driven:** Experience records (title, category tag, duration, description, image URL, ordering, active status).
17. **Recommended CMS Editor:** Dedicated CMS Module: `Experiences Manager` (`/admin/experiences`).
18. **Required Database Fields:**
    ```ts
    experiences: Array<{
      id: string;
      title: string;
      category: 'marine' | 'culture' | 'nature' | 'sunset';
      duration: string;
      tag: string;
      description: string;
      image: string;
      price?: string;
      order: number;
      visible: boolean;
    }>
    ```

---

### Section 08: Regional Exploration (Explore Zanzibar)
1. **Section Name:** Regional Highlights
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/ExploreZanzibarSection.tsx`
4. **Current Content Source:** `src/data/exploreZanzibar.ts`
5. **Text Fields:** Eyebrow, title, description, regional landmark cards (Stone Town, Mnemba Atoll, Jozani Forest, Nungwi).
6. **Image Fields:** Photography per destination.
7. **Buttons:** "DISCOVER REGION"
8. **Ordering:** Order: 8
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Titles, distances from Kizimkazi, highlights descriptions, images.
11. **Recommended CMS Editor:** `Homepage Editor -> Regional Exploration`.

---

### Section 09: Beyond Zanzibar & Tanzania Safari
1. **Section Name:** Tanzania Mainland Safari Connection
2. **Page:** Homepage (`/`) & Safari Page (`/safari`)
3. **Component:** `src/components/BeyondZanzibarSection.tsx`
4. **Current Content Source:** `src/data/tanzaniaDestinations.ts`, `src/data/destinationTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"ONE ISLAND. A WHOLE TANZANIA TO DISCOVER."`)
   - Heading (`"Fly-In Bush & Beach Safaris"` )
   - Description (`"Seamless chartered flight connections connecting Zanzibar (ZNZ) to Tanzania's premier game reserves."`)
   - 4 Destinations:
     1. Serengeti National Park (Great Migration, Big Five, 90-min flight)
     2. Ngorongoro Crater (World's largest intact volcanic caldera, black rhinos)
     3. Mount Kilimanjaro (Roof of Africa scenic fly-overs & guided climbs)
     4. Tarangire National Park (Vast elephant herds & ancient baobab valleys)
6. **Image Fields:** High-resolution wildlife photography (lions, elephants, migration)
7. **Buttons:** "PLAN SAFARI PACKAGE", "INQUIRE FLIGHT CONNECTION"
8. **Ordering:** Order: 9
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Safari destinations, flight timings, highlight copy, photography, partner camp descriptions.
11. **Recommended CMS Editor:** Dedicated CMS Module: `Safari & Tours Manager` (`/admin/safari`).

---

### Section 10: Custom Itinerary Builder
1. **Section Name:** Bespoke Itinerary Planner
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/CustomItinerarySection.tsx`
4. **Current Content Source:** `src/data/itinerary.ts`, `src/data/itineraryTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"BUILD YOUR TANZANIA JOURNEY"`)
   - Heading (`"Harmonized Island & Bush Schedules"`)
   - 3 Curated Timelines:
     - 3-Day Tropical Sanctuary Escape
     - 5-Day Zanzibar Coastal & Cultural Immersion
     - 7-Day Bush & Beach Odyssey (Zanzibar + Serengeti)
   - Day-by-day itinerary breakdown (Day 1: Arrival & Sunset Dhow, Day 2: Dolphin Reef & Spa, etc.)
6. **Image Fields:** Itinerary preview photos
7. **Buttons:** Duration selector pills, "REQUEST BESPOKE SCHEDULE"
8. **Ordering:** Order: 10
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Itinerary titles, duration days, day-by-day activities, images.
11. **Recommended CMS Editor:** `Homepage Editor -> Itinerary Planner`.

---

### Section 11: Shuttle & Arrival Service
1. **Section Name:** Airport Transfers & Chauffeur Coordination
2. **Page:** Homepage (`/`) & Contact Page (`/contact`)
3. **Component:** `src/components/ShuttleSection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`shuttle`)
5. **Text Fields:**
   - Eyebrow (`"ARRIVE. RELAX. WE'LL TAKE CARE OF THE REST."`)
   - Heading (`"Private Chauffeur Airport Coordination"`)
   - Details: 55-minute scenic drive from Abeid Amani Karume International Airport (ZNZ) across Unguja's spice roads.
   - Amenities: Air-conditioned private SUV, iced lemongrass towels, chilled fresh coconut water on arrival.
6. **Image Fields:** Private chauffeur vehicle & arrival driveway photos
7. **Buttons:** "COORDINATE AIRPORT TRANSFER"
8. **Ordering:** Order: 11
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Travel time, airport code, complimentary transfer policies, vehicle specs.
11. **Recommended CMS Editor:** `Homepage Editor -> Arrival & Transfers`.

---

### Section 12: Concierge Showcase ("Your Journey, Personally Arranged")
1. **Section Name:** 24/7 Dedicated Butler & Concierge
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/ConciergeSection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`concierge`)
5. **Text Fields:**
   - Eyebrow (`"YOUR JOURNEY, PERSONALLY ARRANGED"`)
   - Heading (`"Dedicated 24/7 Personal Butler Support"`)
   - Description (`"From customized sunrise dolphin departures to private beach dinners, your dedicated concierge ensures flawless arrangements."`)
6. **Image Fields:** Butler service & welcoming host photography
7. **Buttons:** "CHAT WITH CONCIERGE VIA WHATSAPP", "DIRECT CALL"
8. **Ordering:** Order: 12
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Concierge welcome message, response time guarantee, contact action buttons.
11. **Recommended CMS Editor:** `Homepage Editor -> Concierge Service`.

---

### Section 13: Why Stay With Us (Core Pillars)
1. **Section Name:** Brand Differentiators
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/WhyStaySection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`whyStay`)
5. **Text Fields:**
   - Eyebrow (`"WHY ZANZIRANGI HOUSE"`)
   - Heading (`"The Pure Luxury of Space, Privacy & Authenticity"`)
   - 4 Pillars:
     1. 100% Private Freshwater Plunge Pools
     2. Authentic Swahili-Omani Coral Stone Architecture
     3. Sustainable Ocean-to-Table Gastronomy
     4. Ethical Marine Wildlife Excursions
6. **Cards:** 4 pillar benefit cards with icons
7. **Ordering:** Order: 13
8. **Visibility:** Toggleable (`visible: true`)
9. **Data to be Database-Driven:** 4 core pillar titles, subtitles, and icons.
10. **Recommended CMS Editor:** `Homepage Editor -> Why Stay Pillars`.

---

### Section 14: Promotional Brand Reel (Storyboards)
1. **Section Name:** Cinematic Brand Storyboard Player
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/PromotionalVideoSection.tsx`
4. **Current Content Source:** `src/components/PromotionalVideoSection.tsx` (Internal 7 scenes array)
5. **Text Fields:**
   - Eyebrow (`"CINEMATIC BRAND REEL"`)
   - Heading (`"Experience Zanzirangi House in Motion"`)
   - 7 Scenes:
     1. Arrival (0:00 - 0:15)
     2. Architecture (0:15 - 0:30)
     3. Villa Interiors (0:30 - 0:50)
     4. Plunge Pool Sanctuary (0:50 - 1:10)
     5. Oceanfront Gastronomy (1:10 - 1:30)
     6. Golden Twilight Dhow Sailing (1:30 - 1:55)
     7. Mainland Safari Gateway (1:55 - 2:20)
6. **Image Fields:** 7 photography frame images for scene transitions
7. **Video Fields:** Video source URL (YouTube/Vimeo or MP4)
8. **Buttons:** Play/Pause, Mute/Unmute, Scene jump navigation pills
9. **Ordering:** Order: 14
10. **Visibility:** Toggleable (`visible: true`)
11. **Data to be Database-Driven:** Scene titles, descriptions, frame images, direct video stream URL, timeline timestamps.
12. **Recommended CMS Editor:** Dedicated CMS Module: `Videos & Storyboard Manager` (`/admin/videos`).

---

### Section 15: Estate Facilities & Infrastructure
1. **Section Name:** Resort Facilities
2. **Page:** Homepage (`/`) & Villas Page (`/villas`)
3. **Component:** `src/components/FacilitiesSection.tsx`
4. **Current Content Source:** `src/data/facilities.ts`, `src/data/facilitiesTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"SANCTUARY FACILITIES"`)
   - Heading (`"Designed for Rejuvenation & Privacy"`)
   - 6 Facilities:
     1. Private Plunge Pools (Freshwater swimming, uninterrupted by low tide)
     2. Oceanfront Dining Pavilion (Artisanal seafood, sunset views)
     3. Lush Botanical Gardens (Ancient baobabs, fragrant frangipani)
     4. Wellness & Yoga Verandas (Private sunset sessions)
     5. High-Speed Optical Wi-Fi (Seamless digital connectivity)
     6. 24/7 Butler & Chauffeur Services (Personalized island logistics)
6. **Image Fields:** Facility photography cards
7. **Cards:** 6 facility grid cards with icon, title, description, and highlights
8. **Icons:** `Waves`, `Utensils`, `Palmtree`, `HeartPulse`, `Wifi`, `UserCheck`
9. **Ordering:** Order: 15
10. **Visibility:** Toggleable per section AND per facility item
11. **Data to be Database-Driven:** Facility items CRUD (title, description, icon name, image URL, order, visibility).
12. **Recommended CMS Editor:** Dedicated CMS Module: `Facilities Manager` (`/admin/facilities`).

---

### Section 16: Curated Photo Gallery & Lightbox
1. **Section Name:** Photography Gallery & Lightbox
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/GallerySection.tsx` & `src/components/LightboxModal.tsx`
4. **Current Content Source:** `src/data/gallery.ts`, `src/data/galleryTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"VISUAL JOURNEY"`)
   - Heading (`"Moments Captured at Zanzirangi House"`)
   - 7 Categories: `All`, `Property`, `Villas`, `Dining`, `Pool`, `Garden`, `Zanzibar`, `Experiences`
   - Per Photo: Caption, category, aspect ratio (`portrait` | `landscape` | `square`), alt text
6. **Image Fields:** 18+ high-resolution curated photographs
7. **Carousel:** Interactive masonry/grid layout with full-screen lightbox modal
8. **Buttons:** Category filter tabs, photo zoom click, lightbox Next/Previous/Close
9. **Ordering:** Order: 16 (Per photo: `orderIndex: 1..N`)
10. **Visibility:** Toggleable per category AND per image
11. **Data to be Database-Driven:** Full Gallery CRUD (upload, select from Media Library, assign category, write caption & alt text, reorder, publish/unpublish).
12. **Recommended CMS Editor:** Dedicated CMS Module: `Gallery Manager` (`/admin/gallery`).
13. **Required Database Fields:**
    ```ts
    gallery: Array<{
      id: string;
      title: string;
      caption: string;
      category: 'property' | 'villas' | 'dining' | 'pool' | 'garden' | 'zanzibar' | 'experiences';
      imageUrl: string;
      aspectRatio: 'portrait' | 'landscape' | 'square';
      altText: string;
      order: number;
      visible: boolean;
    }>
    ```

---

### Section 17: Guest Impressions & Testimonials
1. **Section Name:** Guest Reviews & Testimonials
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/ReviewsSection.tsx`
4. **Current Content Source:** `src/data/reviews.ts`, `src/data/reviewsTranslations.ts`
5. **Text Fields:**
   - Eyebrow (`"GUEST IMPRESSIONS"`)
   - Heading (`"Words from Those Who Have Lived the Sanctuary"`)
   - Aggregate Rating Score (`9.9 / 10 Exceptional` across 140+ verified stays)
   - Per Testimonial: Guest Name, Country of origin, Country Code (flag), Star Rating (5.0), Stay Date, Villa Stayed (`"Sultan Oceanfront Villa"`), Review Headline, Review Body Text, Verified Stay Badge.
6. **Cards:** Testimonial cards with quotation marks and luxury star rating
7. **Ordering:** Order: 17
8. **Visibility:** Toggleable per review
9. **Data to be Database-Driven:** Testimonials CRUD (guest name, country, rating, date, villa stayed, review text, featured flag, visibility).
10. **Recommended CMS Editor:** Dedicated CMS Module: `Testimonials Manager` (`/admin/testimonials`).
11. **Required Database Fields:**
    ```ts
    testimonials: Array<{
      id: string;
      guestName: string;
      country: string;
      countryCode: string;
      rating: number;
      stayDate: string;
      villaStayed: string;
      title: string;
      reviewText: string;
      featured: boolean;
      order: number;
      visible: boolean;
    }>
    ```

---

### Section 18: OTA Channel Distribution Trust Badges
1. **Section Name:** External Channel Distribution Badges
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/OtaChannelsSection.tsx`
4. **Current Content Source:** `src/data/propertyConfig.ts` (`OTA_CHANNELS`)
5. **Text Fields:**
   - Eyebrow (`"DISTRIBUTION & VERIFIED ACCREDITATIONS"`)
   - Channel Badges:
     1. Booking.com (`9.8 / 10 Exceptional`, Premier Review Award)
     2. Trip.com (`5.0 Star Luxury Choice`, Diamond Luxury Partner)
     3. Agoda (`9.7 Customer Choice`, Top Villas in East Africa)
     4. Expedia (`4.9 / 5.0 Excellent`, VIP Access Preferred Property)
6. **Cards:** 4 channel accreditation cards
7. **Ordering:** Order: 18
8. **Visibility:** Toggleable (`visible: true`)
9. **Data to be Database-Driven:** Channel name, rating score, award label, badge visibility.
10. **Recommended CMS Editor:** `Homepage Editor -> OTA Distribution Badges`.

---

### Section 19: Location, Map & Coordinates
1. **Section Name:** Sanctuary Location & Map Directions
2. **Page:** Homepage (`/`) & Contact Page (`/contact`)
3. **Component:** `src/components/MapSection.tsx`
4. **Current Content Source:** `src/data/propertyConfig.ts`, `src/data/translations.ts` (`map`)
5. **Text Fields:**
   - Eyebrow (`"LOCATION & ACCESS"`)
   - Heading (`"Kizimkazi Dimbani, South Coast Zanzibar"`)
   - Geographic Coordinates (`-6.4429° S, 39.4678° E`)
   - Distances:
     - Abeid Amani Karume Int'l Airport (ZNZ): 55 km / 55 mins
     - Stone Town UNESCO Quarter: 58 km / 60 mins
     - Menai Bay Marine Conservation Departure: 1.2 km / 3 mins
6. **Embeds:** Google Maps interactive responsive `<iframe>`
7. **Buttons:** "OPEN IN GOOGLE MAPS"
8. **Ordering:** Order: 19
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Latitude, longitude, embed URL, distance items list.
11. **Recommended CMS Editor:** `Contact & Location Manager` (`/admin/contact`).

---

### Section 20: Final Call To Action (Conversion Banner)
1. **Section Name:** Final Call to Action
2. **Page:** Homepage (`/`)
3. **Component:** `src/components/FinalCtaSection.tsx`
4. **Current Content Source:** `src/data/translations.ts` (`finalCta`)
5. **Text Fields:**
   - Eyebrow (`"YOUR PRIVATE RETREAT AWAITS"`)
   - Heading (`"Begin Your Zanzibar & Tanzania Journey"`)
   - Subtitle (`"Direct reservations receive complimentary airport chauffeur coordination and curated arrival amenities."`)
   - Primary CTA: `"RESERVE SANCTUARY"`
   - Secondary CTA: `"INQUIRE VIA WHATSAPP"`
6. **Image Fields:** Full-width background ambient photograph
7. **Buttons:** Reserve Sanctuary button, WhatsApp direct button
8. **Ordering:** Order: 20
9. **Visibility:** Toggleable (`visible: true`)
10. **Data to be Database-Driven:** Eyebrow, headline, subtitle, button labels, background photo URL.
11. **Recommended CMS Editor:** `Homepage Editor -> Final Call to Action`.

---

### Global Element 21: Header & Navigation
1. **Name:** Fixed Luxury Navigation Header
2. **Component:** `src/components/Navbar.tsx`
3. **Current Content Source:** `src/data/translations.ts` (`nav`), `src/assets/zanzirangi-logo-new.jpeg`
4. **Text Fields:** Navigation link labels (`VILLAS`, `DINING`, `EXPERIENCES`, `SAFARI`, `ABOUT`, `CONTACT`), CTA button label (`"PLAN YOUR STAY"`).
5. **Image Fields:** Brand logo image (`logoImg`).
6. **Buttons:** Theme toggle (Light/Dark), Language selector dropdown (8 languages), Book CTA button, Mobile burger menu button.
7. **Security Note:** ZERO Admin / CMS / Login links visible.
8. **Data to be Database-Driven:** Logo image URL, navigation items array (label, target path, order, visibility), header CTA label & action.
9. **Recommended CMS Editor:** `Settings -> Navigation & Header`.

---

### Global Element 22: Footer & Contact Architecture
1. **Name:** Sophisticated Luxury Footer
2. **Component:** `src/components/Footer.tsx`
3. **Current Content Source:** `src/data/propertyConfig.ts`, `src/data/translations.ts` (`footer`)
4. **Text Fields:**
   - Brand description paragraph
   - Contact details: Telephone, Email, WhatsApp, Physical Address
   - Operating hours note
   - Quick navigation links
   - Experience links
   - Copyright notice
   - Legal links (`Privacy Policy`, `Terms & Conditions`)
5. **Image Fields:** Brand logo
6. **Links:** Social media channels (Instagram, Facebook, TikTok, YouTube, TripAdvisor).
7. **Security Note:** ZERO Admin / CMS links visible.
8. **Data to be Database-Driven:** Phone numbers, email addresses, WhatsApp numbers, social links, copyright text, legal links.
9. **Recommended CMS Editor:** `Contact & Concierge Manager` (`/admin/contact`) + `Settings`.

---

### Global Element 23: SEO & Metadata
1. **Name:** Meta Tags, OpenGraph, Canonical & Structured Data
2. **Component:** `index.html`, `scripts/generate_routes.js`, `src/App.tsx`
3. **Current Content Source:** Static in `index.html` and `ROUTE_SEO` in `App.tsx`
4. **Text Fields:**
   - Global Site Title & Meta Description
   - Per Page: Title, Meta Description, Keywords, Canonical URL, OG Title, OG Description, OG Image, Twitter Card.
5. **Data to be Database-Driven:** Per-route SEO title, description, canonical link, social share image URL.
6. **Recommended CMS Editor:** Dedicated CMS Module: `SEO & Metadata Manager` (`/admin/seo`).

---

## 3. Comparison Against Admin Dashboard Modules

| CMS Sidebar Module | Corresponding Public Website Sections | Implementation Priority | Status |
| :--- | :--- | :---: | :---: |
| **1. Dashboard** | Executive summary, live connectivity status, audit logs | Foundation | **LIVE** |
| **2. Homepage** | Sections 01, 02, 03, 05, 08, 10, 11, 12, 13, 18, 20 | High (Core Slice) | **LIVE** (Expanded with Hero Carousel & Section Ordering) |
| **3. Rooms & Villas** | Section 04 (8 Villas, Galleries, Amenities, Pricing) | High | Next Slice |
| **4. Gallery** | Section 16 (7 Categories, Lightbox, Captions, Ordering) | Medium | Next Slice |
| **5. Videos** | Section 14 (Cinematic Storyboards, Video URL, Posters) | Medium | Next Slice |
| **6. Facilities** | Section 15 (Estate Infrastructure, Icons, Descriptions) | Medium | Next Slice |
| **7. Testimonials** | Section 17 (Guest Reviews, Ratings, Stay Dates) | Medium | Next Slice |
| **8. Contact & Concierge** | Sections 11, 12, 19, 22 (Phones, WhatsApp, Map, Socials) | High | Next Slice |
| **9. SEO & Metadata** | Section 23 (Page Titles, OpenGraph, Descriptions) | High | Next Slice |
| **10. Media Library** | Central image/video repository for all modules | Foundation | Next Slice |
| **11. Settings** | Admin Users, Navigation, Site configuration | Admin | Next Slice |

---

## 4. Next Implementation Roadmap

To fulfill the continuous vertical slice requirements:
1. **Vertical Slice 1: Homepage Hero + Multi-Slide Carousel**:
   - Multiple editable slides (Title, Subtitle, Narrative, Badge, Cover Image, Video, CTAs, Ordering, Visibility).
   - Add slide, edit slide, delete slide, reorder slides.
   - Save Draft vs. Publish Live.
   - Real-time reflection on `http://localhost:3000/`.
2. **Vertical Slice 2: Homepage Section Visibility & Ordering**:
   - Toggle visibility (Show/Hide) for any homepage section without deleting content.
   - Dynamic section ordering.
3. **Subsequent Vertical Slices**: Rooms, Gallery, Videos, Facilities, Testimonials, Contact, SEO, Media Library, and Settings.
