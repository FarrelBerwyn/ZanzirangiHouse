# Zanzirangi House | Luxury Stay & Tanzania Experiences

<div align="center">
  <img src="public/zanzirangi-logo-new.jpeg" alt="Zanzirangi House Logo" width="220" style="border-radius: 16px; margin-bottom: 16px;" />
  <p><strong>A private luxury sanctuary in Zanzibar with curated island experiences, dining, safari connections, and personalized AI concierge services.</strong></p>

  <p>
    <a href="https://zanzirangi.com"><img src="https://img.shields.io/badge/Website-zanzirangi.com-1E1E1E?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Website" /></a>
    <img src="https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/AI_Powered-Google_Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  </p>
</div>

---

## 🌴 Overview

**Zanzirangi House** is an ultra-luxury hospitality web platform developed for a premier private villa estate and experiential retreat in Zanzibar, Tanzania. Combining timeless coastal aesthetics with cutting-edge web performance, the application provides an immersive guest journey—from browsing villas and previewing authentic culinary offerings, to booking custom island adventures and consulting a real-time multilingual AI concierge.

---

## ✨ Key Features

### 🏡 Luxury Villa Accommodations
* **Interactive Villa Showcase**: High-resolution galleries, room specifications, architectural highlights, and bespoke amenities.
* **Category Filtering**: Seamlessly filter between Presidential Suites, Oceanfront Villas, Garden Pavilions, and Family Retreats.
* **Detailed Modals & Lightbox**: Interactive modal dialogs with rich image sliders and full-screen image inspection.

### 🤖 24/7 AI Concierge Assistant
* **Powered by Google Gemini**: Integrated via `@google/genai` for intelligent, real-time responses.
* **Personalized Hospitality Recommendations**: Instantly answers queries about villas, dining options, safari excursions, local weather, and travel logistics.
* **Multilingual Fluency**: Engages effortlessly in English, Swahili, Arabic, Chinese, Polish, French, German, Italian, and Spanish.

### 🍽️ Coastal Gastronomy & Dining
* **Authentic Swahili & Arabic Cuisine**: Showcasing local spices, fresh seafood catches, mezze, and farm-to-table breakfast spreads.
* **Private Dining & Chef Service**: Romantic beach dinners, in-villa barbecue setups, and bespoke dietary curation.
* **Artisanal Tropical Beverages**: Specialty mocktails, cocktails, spiced teas, and fresh coconut refreshments.

### 🧭 Curated Zanzibar Tours & Tanzania Safaris
* **Zanzibar Archipelago Excursions**: Stone Town heritage walks, Spice Farm sensory tours, Prison Island giant tortoise sanctuaries, and Jozani Red Colobus Forest treks.
* **Beyond Zanzibar (Mainland Safaris)**: Seamless safari flight connections and luxury camps in Serengeti National Park, Ngorongoro Crater, Mount Kilimanjaro, and Mikumi.
* **Bespoke Itinerary Planner**: Guests can tailor multi-day private adventures with custom transit and dedicated guides.

### 🌐 Global Guest Localization
* Comprehensive multi-language support across the entire interface, dynamically adapting navigation, room descriptions, and concierge prompts for international travelers.

### ⚡ Performance & Design Polish
* **Fluid Scroll & Micro-Animations**: Smooth scroll reveal effects and gestures powered by `motion`.
* **Zero Layout Shift (CLS)**: Optimized media delivery with video hero background and modern responsive grid layouts.
* **Quick Booking Bar**: Sticky reservation bar allowing instant WhatsApp/Email inquiry submission.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework & Core** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vite.dev/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **Animation & Motion** | [Motion](https://motion.dev/) (Framer Motion engine) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Generative AI** | [Google Gen AI SDK](https://github.com/google-gemini/generative-ai-js) (`@google/genai`) |
| **Typography** | Cormorant Garamond (Serif Display) + Plus Jakarta Sans (Sans-Serif) |

---

## 📁 Project Directory Structure

```text
zanzirangi-house-v2/
├── .github/                # GitHub Actions CI/CD workflows
├── public/                 # Static assets (logos, images, favicon)
├── src/
│   ├── assets/             # Component-level static media assets
│   ├── components/         # Reusable UI sections and modules
│   │   ├── BeyondZanzibarSection.tsx   # Mainland safaris showcase
│   │   ├── BookingModal.tsx            # Reservation inquiry modal
│   │   ├── ChatAssistant.tsx           # Multilingual AI Concierge (Gemini)
│   │   ├── DiningSection.tsx           # Dining menus and culinary experiences
│   │   ├── ExperiencesSection.tsx      # Island tours and adventures
│   │   ├── HeroSection.tsx             # Video hero header & CTAs
│   │   ├── Navbar.tsx                  # Responsive navigation & language switcher
│   │   ├── QuickBookingBar.tsx         # Sticky reservation toolbar
│   │   ├── VillasSection.tsx           # Villa catalog and category tabs
│   │   └── ...
│   ├── data/               # Static listings, tour details, and translations
│   ├── App.tsx             # Root page layout and state management
│   ├── index.css           # Global Tailwind CSS entry
│   ├── main.tsx            # React application entry point
│   ├── types.ts            # TypeScript interfaces and schema types
│   └── vite-env.d.ts       # Vite client environment type definitions
├── index.html              # HTML5 entry with SEO & OpenGraph tags
├── package.json            # Dependencies and build scripts
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel SPA routing and framework config
└── vite.config.ts          # Vite build, plugin, and server settings
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v20.x` or `v22.x` (LTS recommended)
* **npm**: `v10.x` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/FarrelBerwyn/ZanzirangiHouse.git
cd zanzirangi-house-v2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` (or copy from `.env.example`):
```bash
cp .env.example .env.local
```

Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!NOTE]
> You can acquire an API key via [Google AI Studio](https://aistudio.google.com/).

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build & Production

To create an optimized production build:
```bash
npm run build
```
The compiled, minified static files will be placed into the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

To run TypeScript verification:
```bash
npm run lint
```

---

## 🌐 Deployment Configuration

This project compiles into a **pure static Single Page Application (SPA)** that can be hosted on any modern CDN or hosting platform (Hostinger, Vercel, Cloudflare Pages, Netlify, GitHub Pages).

### Recommended Settings:
* **Framework Preset**: `Vite` (or `Static / React`)
* **Root Directory**: `./`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Start Command**: *(Leave empty / not required)*

---

## 📄 License & Brand Notice

© 2026 **Zanzirangi House**. All rights reserved.  
Brand identity, imagery, media, and architectural assets belong to Zanzirangi House & Luxury Retreats Zanzibar.
