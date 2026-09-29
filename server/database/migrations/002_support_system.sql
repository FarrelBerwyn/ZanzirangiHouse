-- Zanzirangi House: Production Support & Customer Concierge Schema
-- Version: 002_support_system
-- Engine: InnoDB, Charset: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE TABLE IF NOT EXISTS support_conversations (
  id VARCHAR(100) PRIMARY KEY,
  visitor_id VARCHAR(100) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  status ENUM('AI_ACTIVE', 'WAITING_HUMAN', 'HUMAN_ACTIVE', 'WAITING_FOR_VISITOR', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'AI_ACTIVE',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  assigned_admin_id VARCHAR(100) NULL,
  current_page VARCHAR(255) DEFAULT '/',
  booking_id VARCHAR(100) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conv_visitor (visitor_id),
  INDEX idx_conv_status (status),
  INDEX idx_conv_last_message (last_message_at),
  INDEX idx_conv_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_messages (
  id VARCHAR(100) PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL,
  sender_type ENUM('VISITOR', 'AI', 'ADMIN', 'SYSTEM') NOT NULL,
  sender_id VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
  ai_confidence DECIMAL(4,3) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_msg_conv (conversation_id),
  INDEX idx_msg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_knowledge_base (
  id VARCHAR(100) PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  status ENUM('PUBLISHED', 'DRAFT', 'UNPUBLISHED') NOT NULL DEFAULT 'PUBLISHED',
  source ENUM('MANUAL', 'CANDIDATE_FROM_ADMIN', 'FAQ_IMPORT') NOT NULL DEFAULT 'MANUAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_kb_status (status),
  INDEX idx_kb_category (category),
  INDEX idx_kb_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_ai_events (
  id VARCHAR(100) PRIMARY KEY,
  conversation_id VARCHAR(100) NOT NULL,
  message_id VARCHAR(100) NOT NULL,
  intent VARCHAR(100) NOT NULL,
  confidence DECIMAL(4,3) NOT NULL,
  knowledge_source VARCHAR(100) NOT NULL,
  decision ENUM('AUTO_ANSWER', 'SAFE_ANSWER', 'HANDOFF_TO_HUMAN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ai_conv (conversation_id),
  INDEX idx_ai_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
