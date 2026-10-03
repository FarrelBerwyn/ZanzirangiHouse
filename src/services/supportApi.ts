import {
  SupportConversationRecord,
  SupportMessageRecord,
  SupportKnowledgeRecord,
  SupportAiEventRecord,
  SupportAnalyticsSummary,
  SupportConversationStatus,
  SupportActionMetadata,
} from '../../server/database/supportTypes';
import { authApi } from './authApi';

const API_BASE = '/api/support';

export interface VisitorSession {
  visitorId: string;
  sessionId: string;
  conversationId?: string;
}

class SupportApiClient {
  // -------------------------------------------------------------
  // Visitor Session Management
  // -------------------------------------------------------------
  getOrCreateVisitorSession(): VisitorSession {
    const KEY = 'zanzirangi_visitor_support_session';
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.visitorId && parsed.sessionId) {
          return parsed;
        }
      }
    } catch {}

    const newSession: VisitorSession = {
      visitorId: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      sessionId: `ses_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };

    try {
      localStorage.setItem(KEY, JSON.stringify(newSession));
    } catch {}

    return newSession;
  }

  saveVisitorConversationId(conversationId: string) {
    const KEY = 'zanzirangi_visitor_support_session';
    try {
      const current = this.getOrCreateVisitorSession();
      current.conversationId = conversationId;
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {}
  }

  // -------------------------------------------------------------
  // Visitor Endpoints
  // -------------------------------------------------------------
  async initVisitorConversation(data: {
    visitor_id: string;
    session_id: string;
    language?: string;
    current_page?: string;
    booking_id?: string | null;
    metadata?: any;
  }): Promise<{ conversation: SupportConversationRecord; messages: SupportMessageRecord[] }> {
    const res = await fetch(`${API_BASE}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to initialize conversation');
    this.saveVisitorConversationId(json.data.conversation.id);
    return json.data;
  }

  async getVisitorConversation(
    conversationId: string,
    visitorId: string
  ): Promise<{ conversation: SupportConversationRecord; messages: SupportMessageRecord[] }> {
    const res = await fetch(`${API_BASE}/conversation/${conversationId}?visitor_id=${encodeURIComponent(visitorId)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to retrieve conversation');
    return json.data;
  }

  async sendVisitorMessage(
    conversationId: string,
    visitorId: string,
    message: string,
    metadata?: any,
    language?: string
  ): Promise<{
    userMessage: SupportMessageRecord;
    botMessage: SupportMessageRecord | null;
    conversationStatus: SupportConversationStatus;
  }> {
    const res = await fetch(`${API_BASE}/conversation/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId, message, metadata, language }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send message');
    return json.data;
  }

  async pollVisitorMessages(
    conversationId: string,
    visitorId: string,
    afterTimestamp?: string
  ): Promise<{ status: SupportConversationStatus; messages: SupportMessageRecord[] }> {
    let url = `${API_BASE}/conversation/${conversationId}/poll?visitor_id=${encodeURIComponent(visitorId)}`;
    if (afterTimestamp) {
      url += `&after=${encodeURIComponent(afterTimestamp)}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to poll messages');
    return json.data;
  }

  // -------------------------------------------------------------
  // Admin Endpoints
  // -------------------------------------------------------------
  private getAuthHeaders(): HeadersInit {
    // Same token the rest of the CMS uses (authApi -> 'zanzirangi_cms_jwt_token').
    const token = authApi.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    // Never send an empty "Bearer " header; the server answers 401 without one.
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async adminGetConversations(filter?: {
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<{
    conversations: (SupportConversationRecord & { messageCount: number; lastMessageText?: string })[];
    counts: {
      all: number;
      waiting: number;
      aiActive: number;
      humanActive: number;
      resolved: number;
      closed: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filter?.status) params.set('status', filter.status);
    if (filter?.search) params.set('search', filter.search);
    if (filter?.limit) params.set('limit', String(filter.limit));

    const res = await fetch(`${API_BASE}/admin/conversations?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch admin conversations');
    return json.data;
  }

  async adminGetConversation(conversationId: string): Promise<{
    conversation: SupportConversationRecord;
    messages: SupportMessageRecord[];
    aiEvents: SupportAiEventRecord[];
  }> {
    const res = await fetch(`${API_BASE}/admin/conversations/${conversationId}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch conversation detail');
    return json.data;
  }

  async adminSendMessage(
    conversationId: string,
    message: string,
    action?: SupportActionMetadata,
    suggestedByAi?: boolean
  ): Promise<{ message: SupportMessageRecord; conversation: SupportConversationRecord }> {
    const res = await fetch(`${API_BASE}/admin/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message, action, suggestedByAi }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to send admin message');
    return json.data;
  }

  async adminUpdateStatus(
    conversationId: string,
    status: SupportConversationStatus
  ): Promise<SupportConversationRecord> {
    const res = await fetch(`${API_BASE}/admin/conversations/${conversationId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to update conversation status');
    return json.data;
  }

  async adminGetSuggestedReply(conversationId: string): Promise<{
    suggestedReply: string;
    lastVisitorMessage: string;
  }> {
    const res = await fetch(`${API_BASE}/admin/conversations/${conversationId}/suggested-reply`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch suggested reply');
    return json.data;
  }

  async adminGetKnowledgeBase(filter?: {
    category?: string;
    language?: string;
    status?: string;
    search?: string;
  }): Promise<SupportKnowledgeRecord[]> {
    const params = new URLSearchParams();
    if (filter?.category) params.set('category', filter.category);
    if (filter?.language) params.set('language', filter.language);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.search) params.set('search', filter.search);

    const res = await fetch(`${API_BASE}/admin/knowledge-base?${params.toString()}`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch knowledge base');
    return json.data;
  }

  async adminSaveKnowledgeItem(data: {
    id?: string;
    question: string;
    answer: string;
    category?: string;
    language?: string;
    status?: string;
    source?: string;
  }): Promise<SupportKnowledgeRecord> {
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `${API_BASE}/admin/knowledge-base/${data.id}` : `${API_BASE}/admin/knowledge-base`;

    const res = await fetch(url, {
      method,
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to save knowledge item');
    return json.data;
  }

  async adminDeleteKnowledgeItem(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/knowledge-base/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    return !!json.success;
  }

  async adminGetAnalytics(): Promise<SupportAnalyticsSummary> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch analytics');
    return json.data;
  }

  // -------------------------------------------------------------
  // Web Push & Staff Duty Endpoints
  // -------------------------------------------------------------
  async getVapidPublicKey(): Promise<string> {
    const res = await fetch(`${API_BASE}/push/public-key`);
    const json = await res.json();
    if (!json.success) throw new Error('Failed to fetch VAPID key');
    return json.publicKey;
  }

  async subscribePush(subscription: any): Promise<boolean> {
    const res = await fetch(`${API_BASE}/push/subscribe`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ subscription }),
    });
    const json = await res.json();
    return !!json.success;
  }

  async unsubscribePush(endpoint: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/push/unsubscribe`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ endpoint }),
    });
    const json = await res.json();
    return !!json.success;
  }

  async testPushNotification(): Promise<any> {
    const res = await fetch(`${API_BASE}/push/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return res.json();
  }

  async getDutyStatus(): Promise<{ staff: any[]; isOnDuty: boolean; hasAgentOnline: boolean }> {
    const res = await fetch(`${API_BASE}/duty/status`, {
      headers: this.getAuthHeaders(),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to fetch duty status');
    return json;
  }

  async toggleDutyStatus(isOnDuty: boolean): Promise<{ duty: any; staff: any[]; hasAgentOnline: boolean }> {
    const res = await fetch(`${API_BASE}/duty/toggle`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ isOnDuty }),
    });
    const json = await res.json();
    if (!json.success) throw new Error('Failed to toggle duty status');
    return json;
  }
}

export const supportApi = new SupportApiClient();

