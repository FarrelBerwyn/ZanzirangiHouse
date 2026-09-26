-- Zanzirangi House: Production Relational MySQL Schema
-- Version: 001_initial_schema
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(100) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(191) NOT NULL DEFAULT 'Zanzirangi House',
  tagline TEXT,
  default_currency VARCHAR(20) DEFAULT 'USD ($)',
  reservation_notification_email VARCHAR(191),
  concierge_phone VARCHAR(50),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_config (
  id INT PRIMARY KEY DEFAULT 1,
  hero_title VARCHAR(255) NOT NULL,
  hero_subtitle VARCHAR(255),
  hero_description TEXT,
  hero_badge_text VARCHAR(100),
  hero_primary_cta_text VARCHAR(100),
  hero_primary_cta_link VARCHAR(255),
  hero_secondary_cta_text VARCHAR(100),
  hero_secondary_cta_link VARCHAR(255),
  hero_image VARCHAR(500),
  auto_play_interval INT DEFAULT 6,
  intro_eyebrow VARCHAR(100),
  intro_title VARCHAR(255),
  intro_description TEXT,
  contact_phone VARCHAR(100),
  contact_email VARCHAR(191),
  contact_whatsapp VARCHAR(100),
  contact_address TEXT,
  socials_json TEXT,
  footer_copyright TEXT,
  footer_tagline TEXT,
  meta_last_updated TIMESTAMP NULL DEFAULT NULL,
  meta_updated_by VARCHAR(191)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hero_slides (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  badge_text VARCHAR(100),
  primary_cta_text VARCHAR(100),
  primary_cta_link VARCHAR(255),
  secondary_cta_text VARCHAR(100),
  secondary_cta_link VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  video_url VARCHAR(500),
  alignment VARCHAR(50) DEFAULT 'center',
  overlay_opacity DECIMAL(3,2) DEFAULT 0.40,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  INDEX idx_hero_slides_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_sections (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(191) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  INDEX idx_sections_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS villas (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  short_name VARCHAR(100),
  type VARCHAR(191),
  subtitle VARCHAR(255),
  short_description TEXT,
  description TEXT,
  price_per_night DECIMAL(10,2) NOT NULL DEFAULT 400.00,
  price_unit VARCHAR(50) DEFAULT 'USD',
  promotional_price DECIMAL(10,2) NULL DEFAULT NULL,
  size_sqm INT DEFAULT 85,
  max_guests INT DEFAULT 2,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  beds_count INT DEFAULT 1,
  bed_type VARCHAR(191),
  bathroom_type VARCHAR(191),
  view_type VARCHAR(191),
  architectural_feature TEXT,
  hero_image VARCHAR(500),
  cover_image VARCHAR(500),
  status VARCHAR(50) DEFAULT 'published',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  INDEX idx_villas_status (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS villa_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id VARCHAR(100) NOT NULL,
  amenity_name VARCHAR(191) NOT NULL,
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
  INDEX idx_villa_amenities (villa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS villa_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  villa_id VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
  INDEX idx_villa_images (villa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gallery_items (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(191) NOT NULL,
  caption TEXT,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  aspect_ratio VARCHAR(20) DEFAULT '4/3',
  sort_order INT DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  INDEX idx_gallery_cat (category, sort_order, published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS facilities (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  hours VARCHAR(100),
  highlight VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  INDEX idx_facilities_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(100) PRIMARY KEY,
  guest_name VARCHAR(191) NOT NULL,
  country VARCHAR(100),
  avatar_url VARCHAR(500),
  rating INT DEFAULT 5,
  stay_date VARCHAR(100),
  villa_stayed VARCHAR(191),
  title VARCHAR(191),
  review_text TEXT NOT NULL,
  verified_stay BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  INDEX idx_testimonials_order (sort_order, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_storyboard (
  id INT PRIMARY KEY DEFAULT 1,
  video_url VARCHAR(500) NOT NULL,
  poster_image VARCHAR(500) NOT NULL,
  scenes_json LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS seo_routes (
  route_path VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  canonical_url VARCHAR(500),
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(500),
  robots VARCHAR(100) DEFAULT 'index, follow',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(100) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INT NULL,
  height INT NULL,
  alt_text VARCHAR(255),
  caption TEXT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  user_email VARCHAR(191) NOT NULL,
  details TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_time (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
