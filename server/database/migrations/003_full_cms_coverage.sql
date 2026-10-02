-- Zanzirangi House: Full Website CMS Coverage & Admin Access Management Schema
-- Version: 003_full_cms_coverage
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_unicode_ci

-- 1. Extend Users table for status, permissions, and session invalidation
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSON NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT NOT NULL DEFAULT 1;

-- 2. Page Contents table for all dedicated public routes
CREATE TABLE IF NOT EXISTS page_contents (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  eyebrow VARCHAR(255) NULL,
  heading VARCHAR(255) NULL,
  subheading TEXT NULL,
  description TEXT NULL,
  hero_image VARCHAR(500) NULL,
  sections_config JSON NULL,
  content_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(191) NULL,
  INDEX idx_page_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dedicated Chauffeur & Airport Transfers Configuration
CREATE TABLE IF NOT EXISTS chauffeur_config (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(255) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  subhead TEXT NOT NULL,
  route_label VARCHAR(100) NOT NULL,
  route_title VARCHAR(255) NOT NULL,
  vehicle_image VARCHAR(500) NOT NULL,
  specs_eyebrow VARCHAR(100) NOT NULL,
  card_title VARCHAR(255) NOT NULL,
  airport_title VARCHAR(255) NOT NULL,
  airport_desc TEXT NOT NULL,
  shuttle_title VARCHAR(255) NOT NULL,
  shuttle_desc TEXT NOT NULL,
  vehicle_type_title VARCHAR(100) NOT NULL,
  vehicle_type_desc VARCHAR(255) NOT NULL,
  passenger_luggage_title VARCHAR(100) NOT NULL,
  passenger_luggage_desc VARCHAR(255) NOT NULL,
  amenities_note TEXT NOT NULL,
  cta_request_label VARCHAR(100) NOT NULL,
  cta_add_booking_label VARCHAR(100) NOT NULL,
  spec_items_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(191) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Why Stay / The Sanctuary Difference Pillars Configuration
CREATE TABLE IF NOT EXISTS why_stay_config (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(255) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  subhead TEXT NOT NULL,
  pillars_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(191) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Dining Page & Section Configuration
CREATE TABLE IF NOT EXISTS dining_config (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow VARCHAR(255) NOT NULL,
  heading VARCHAR(255) NOT NULL,
  subhead TEXT NOT NULL,
  intro TEXT NOT NULL,
  garden_eyebrow VARCHAR(255) NOT NULL,
  garden_badge VARCHAR(100) NOT NULL,
  garden_title VARCHAR(255) NOT NULL,
  garden_desc TEXT NOT NULL,
  tag_zero_miles VARCHAR(100) NOT NULL,
  tag_spices VARCHAR(100) NOT NULL,
  tag_seafood VARCHAR(100) NOT NULL,
  moments_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(191) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Dining Tasting Categories & Dishes Collection
CREATE TABLE IF NOT EXISTS dining_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  tab_label VARCHAR(100) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  dishes_json JSON NOT NULL,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dining_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Curated Island Experiences Collection
CREATE TABLE IF NOT EXISTS experiences (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  duration VARCHAR(100),
  tag VARCHAR(100),
  price_note VARCHAR(100),
  short_description TEXT,
  description TEXT,
  image_url VARCHAR(500),
  whatsapp_message TEXT,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_exp_cat (category, sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tanzania Safari Destinations & Packages Collection
CREATE TABLE IF NOT EXISTS safari_destinations (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  tagline VARCHAR(255),
  region VARCHAR(100),
  flight_time VARCHAR(100),
  hero_image VARCHAR(500),
  description TEXT,
  highlights_json JSON,
  best_for VARCHAR(255),
  safari_type VARCHAR(100),
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_safari_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Global Content (Navigation, Header CTA, Footer, Concierge Channels)
CREATE TABLE IF NOT EXISTS global_content (
  id INT PRIMARY KEY DEFAULT 1,
  brand_name VARCHAR(191) NOT NULL DEFAULT 'Zanzirangi House',
  nav_links_json JSON NULL,
  cta_plan_stay_label VARCHAR(100) NOT NULL DEFAULT 'PLAN YOUR STAY',
  cta_plan_stay_link VARCHAR(255) NOT NULL DEFAULT '#stay',
  footer_tagline TEXT,
  footer_copyright TEXT,
  contact_phone VARCHAR(100),
  contact_email VARCHAR(191),
  contact_whatsapp VARCHAR(100),
  contact_address TEXT,
  socials_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(191) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
