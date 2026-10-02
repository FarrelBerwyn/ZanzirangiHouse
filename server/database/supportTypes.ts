export type SupportConversationStatus =
  | 'NEW'
  | 'AI_ACTIVE'
  | 'AI_HANDLING'
  | 'WAITING_HUMAN'
  | 'HUMAN_REQUIRED'
  | 'ASSIGNED'
  | 'HUMAN_ACTIVE'
  | 'HUMAN_REPLIED'
  | 'WAITING_FOR_VISITOR'
  | 'WAITING_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type SupportSenderType = 'VISITOR' | 'AI' | 'ADMIN' | 'SYSTEM';

export type SupportMessageType = 'TEXT' | 'ACTION' | 'SYSTEM_EVENT';

export type SupportAiDecision = 'AUTO_ANSWER' | 'SAFE_ANSWER' | 'HANDOFF_TO_HUMAN';

export type SupportKnowledgeStatus = 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';

export type SupportKnowledgeSource = 'MANUAL' | 'CANDIDATE_FROM_ADMIN' | 'FAQ_IMPORT';

export interface SupportActionMetadata {
  label: string;
  actionType: 'SCROLL' | 'MODAL' | 'LINK';
  target?: string; // e.g. 'stay', 'experiences', 'dining', 'tanzania', 'shuttle', 'booking_modal'
}

export interface SupportBookingContext {
  bookingId?: string;
  villaId?: string;
  villaName?: string;
  roomNumber?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  specialRequests?: string;
  airportTransfer?: boolean;
}

export interface SupportConversationRecord {
  id: string;
  visitor_id: string;
  session_id: string;
  status: SupportConversationStatus;
  language: string;
  assigned_admin_id: string | null;
  current_page: string;
  booking_id: string | null;
  metadata?: SupportBookingContext | null;
  created_at: string;
  updated_at: string;
  last_message_at: string;
}

export interface SupportMessageRecord {
  id: string;
  conversation_id: string;
  sender_type: SupportSenderType;
  sender_id: string;
  message: string;
  message_type: SupportMessageType;
  ai_confidence?: number | null;
  metadata?: {
    action?: SupportActionMetadata;
    systemEvent?: string;
    suggestedByAi?: boolean;
    handoffReason?: string;
    originalLanguage?: string;
    translatedText?: string;
  } | null;
  created_at: string;
}

export interface SupportKnowledgeRecord {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  status: SupportKnowledgeStatus;
  source: SupportKnowledgeSource;
  created_at: string;
  updated_at: string;
}

export interface SupportAiEventRecord {
  id: string;
  conversation_id: string;
  message_id: string;
  intent: string;
  confidence: number;
  knowledge_source: string;
  decision: SupportAiDecision;
  created_at: string;
}

export interface SupportAnalyticsSummary {
  totalConversations: number;
  aiResolved: number;
  humanAssisted: number;
  waiting: number;
  unresolved: number;
  aiResolutionRate: number; // percentage
  avgAiResponseTimeSec: number;
  avgHumanResponseTimeMin: number;
  categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export interface SupportPushSubscriptionRecord {
  id: string;
  user_email: string;
  role: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportStaffDutyRecord {
  id: string;
  user_email: string;
  name: string;
  role: string;
  is_on_duty: boolean;
  last_active_at: string;
  updated_at: string;
}

export interface SupportEscalationItemRecord {
  id: string;
  conversation_id: string;
  visitor_message: string;
  triggered_at: string;
  reminder_2m_sent: boolean;
  reminder_5m_sent: boolean;
  reminder_10m_sent: boolean;
  resolved_at: string | null;
}

