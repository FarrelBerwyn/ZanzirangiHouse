import { getMysqlPool } from '../connection.ts';
import {
  SupportConversationRecord,
  SupportMessageRecord,
  SupportKnowledgeRecord,
  SupportAiEventRecord,
  SupportAnalyticsSummary,
  SupportConversationStatus,
} from '../supportTypes.ts';

function toIso(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  try {
    return new Date(val).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function parseJson(val: any): any {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

class SupportRepository {
  // -------------------------------------------------------------
  // Conversations
  // -------------------------------------------------------------
  async getConversations(filter?: {
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<(SupportConversationRecord & { messageCount: number; lastMessageText?: string })[]> {
    const pool = getMysqlPool();

    let query = `
      SELECT 
        c.*,
        COUNT(m.id) as message_count,
        (
          SELECT m2.message 
          FROM support_messages m2 
          WHERE m2.conversation_id = c.id 
          ORDER BY m2.created_at DESC 
          LIMIT 1
        ) as last_message_text
      FROM support_conversations c
      LEFT JOIN support_messages m ON m.conversation_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filter?.status && filter.status !== 'ALL') {
      query += ' AND c.status = ?';
      params.push(filter.status);
    }

    if (filter?.search) {
      const q = `%${filter.search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(c.id) LIKE ? OR 
        LOWER(c.visitor_id) LIKE ? OR 
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.fullName'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.email'))) LIKE ? OR
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.villaName'))) LIKE ?
      )`;
      params.push(q, q, q, q, q);
    }

    query += ' GROUP BY c.id ORDER BY c.last_message_at DESC';

    if (filter?.limit && filter.limit > 0) {
      query += ' LIMIT ?';
      params.push(Number(filter.limit));
    }

    const [rows]: any = await pool.query(query, params);

    return rows.map((r: any) => ({
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status as SupportConversationStatus,
      language: r.language || 'en',
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || '/',
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at),
      messageCount: Number(r.message_count || 0),
      lastMessageText: r.last_message_text || undefined,
    }));
  }

  async getConversationById(id: string): Promise<SupportConversationRecord | null> {
    const pool = getMysqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM support_conversations WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status as SupportConversationStatus,
      language: r.language || 'en',
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || '/',
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at),
    };
  }

  async getActiveConversationByVisitor(visitorId: string): Promise<SupportConversationRecord | null> {
    const pool = getMysqlPool();
    // Prioritize non-closed/non-resolved conversations, or return most recent
    const [rows]: any = await pool.query(
      `SELECT * FROM support_conversations 
       WHERE visitor_id = ? AND status NOT IN ('CLOSED', 'RESOLVED')
       ORDER BY last_message_at DESC 
       LIMIT 1`,
      [visitorId]
    );

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        visitor_id: r.visitor_id,
        session_id: r.session_id,
        status: r.status as SupportConversationStatus,
        language: r.language || 'en',
        assigned_admin_id: r.assigned_admin_id || null,
        current_page: r.current_page || '/',
        booking_id: r.booking_id || null,
        metadata: parseJson(r.metadata),
        created_at: toIso(r.created_at),
        updated_at: toIso(r.updated_at),
        last_message_at: toIso(r.last_message_at),
      };
    }

    // Fallback: return most recent conversation for visitor
    const [fallbackRows]: any = await pool.query(
      `SELECT * FROM support_conversations 
       WHERE visitor_id = ? 
       ORDER BY last_message_at DESC 
       LIMIT 1`,
      [visitorId]
    );

    if (!fallbackRows || fallbackRows.length === 0) return null;
    const r = fallbackRows[0];

    return {
      id: r.id,
      visitor_id: r.visitor_id,
      session_id: r.session_id,
      status: r.status as SupportConversationStatus,
      language: r.language || 'en',
      assigned_admin_id: r.assigned_admin_id || null,
      current_page: r.current_page || '/',
      booking_id: r.booking_id || null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
      last_message_at: toIso(r.last_message_at),
    };
  }

  async createConversation(data: {
    visitor_id: string;
    session_id: string;
    language?: string;
    current_page?: string;
    booking_id?: string | null;
    metadata?: any;
    status?: SupportConversationStatus;
  }): Promise<SupportConversationRecord> {
    const pool = getMysqlPool();
    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const status = data.status || 'AI_ACTIVE';
    const language = data.language || 'en';
    const currentPage = data.current_page || '/';
    const bookingId = data.booking_id || null;
    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;

    await pool.query(
      `INSERT INTO support_conversations 
        (id, visitor_id, session_id, status, language, current_page, booking_id, metadata, created_at, updated_at, last_message_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, data.visitor_id, data.session_id, status, language, currentPage, bookingId, metadataStr]
    );

    const created = await this.getConversationById(id);
    return created!;
  }

  async updateConversation(
    id: string,
    updates: Partial<SupportConversationRecord>
  ): Promise<SupportConversationRecord | null> {
    const pool = getMysqlPool();
    const setClauses: string[] = [];
    const params: any[] = [];

    if (updates.status !== undefined) {
      setClauses.push('status = ?');
      params.push(updates.status);
    }
    if (updates.language !== undefined) {
      setClauses.push('language = ?');
      params.push(updates.language);
    }
    if (updates.assigned_admin_id !== undefined) {
      setClauses.push('assigned_admin_id = ?');
      params.push(updates.assigned_admin_id);
    }
    if (updates.current_page !== undefined) {
      setClauses.push('current_page = ?');
      params.push(updates.current_page);
    }
    if (updates.booking_id !== undefined) {
      setClauses.push('booking_id = ?');
      params.push(updates.booking_id);
    }
    if (updates.metadata !== undefined) {
      setClauses.push('metadata = ?');
      params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
    }
    if (updates.last_message_at !== undefined) {
      setClauses.push('last_message_at = ?');
      params.push(new Date(updates.last_message_at));
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    if (setClauses.length === 1) {
      return this.getConversationById(id);
    }

    params.push(id);
    await pool.query(
      `UPDATE support_conversations SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );

    return this.getConversationById(id);
  }

  // -------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------
  async getMessages(conversationId: string): Promise<SupportMessageRecord[]> {
    const pool = getMysqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM support_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    return rows.map((r: any) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      sender_type: r.sender_type,
      sender_id: r.sender_id,
      message: r.message,
      message_type: r.message_type || 'TEXT',
      ai_confidence: r.ai_confidence !== null && r.ai_confidence !== undefined ? parseFloat(r.ai_confidence) : null,
      metadata: parseJson(r.metadata),
      created_at: toIso(r.created_at),
    }));
  }

  async createMessage(data: {
    conversation_id: string;
    sender_type: 'VISITOR' | 'AI' | 'ADMIN' | 'SYSTEM';
    sender_id: string;
    message: string;
    message_type?: 'TEXT' | 'ACTION' | 'SYSTEM_EVENT';
    ai_confidence?: number | null;
    metadata?: any;
  }): Promise<SupportMessageRecord> {
    const pool = getMysqlPool();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const messageType = data.message_type || 'TEXT';
    const confidence = data.ai_confidence !== undefined ? data.ai_confidence : null;
    const metadataStr = data.metadata ? JSON.stringify(data.metadata) : null;

    await pool.query(
      `INSERT INTO support_messages 
        (id, conversation_id, sender_type, sender_id, message, message_type, ai_confidence, metadata, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, data.conversation_id, data.sender_type, data.sender_id, data.message, messageType, confidence, metadataStr]
    );

    // Update conversation last_message_at and updated_at
    await pool.query(
      'UPDATE support_conversations SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [data.conversation_id]
    );

    return {
      id,
      conversation_id: data.conversation_id,
      sender_type: data.sender_type,
      sender_id: data.sender_id,
      message: data.message,
      message_type: messageType,
      ai_confidence: confidence,
      metadata: data.metadata || null,
      created_at: new Date().toISOString(),
    };
  }

  // -------------------------------------------------------------
  // Knowledge Base
  // -------------------------------------------------------------
  async getKnowledgeBase(filter?: {
    category?: string;
    language?: string;
    status?: string;
    search?: string;
  }): Promise<SupportKnowledgeRecord[]> {
    const pool = getMysqlPool();
    let query = 'SELECT * FROM support_knowledge_base WHERE 1=1';
    const params: any[] = [];

    if (filter?.category && filter.category !== 'ALL') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(filter.category);
    }

    if (filter?.language && filter.language !== 'ALL') {
      query += ' AND (language = ? OR language = "all")';
      params.push(filter.language);
    }

    if (filter?.status && filter.status !== 'ALL') {
      query += ' AND status = ?';
      params.push(filter.status);
    }

    if (filter?.search) {
      const q = `%${filter.search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(question) LIKE ? OR LOWER(answer) LIKE ?)';
      params.push(q, q);
    }

    query += ' ORDER BY updated_at DESC';

    const [rows]: any = await pool.query(query, params);

    return rows.map((r: any) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category || 'General',
      language: r.language || 'en',
      status: r.status,
      source: r.source,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
    }));
  }

  async getKnowledgeItem(id: string): Promise<SupportKnowledgeRecord | null> {
    const pool = getMysqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM support_knowledge_base WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows || rows.length === 0) return null;
    const r = rows[0];

    return {
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category || 'General',
      language: r.language || 'en',
      status: r.status,
      source: r.source,
      created_at: toIso(r.created_at),
      updated_at: toIso(r.updated_at),
    };
  }

  async saveKnowledgeItem(data: {
    id?: string;
    question: string;
    answer: string;
    category?: string;
    language?: string;
    status?: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
    source?: 'MANUAL' | 'CANDIDATE_FROM_ADMIN' | 'FAQ_IMPORT';
  }): Promise<SupportKnowledgeRecord> {
    const pool = getMysqlPool();
    const id = data.id || `kb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const category = data.category || 'General';
    const language = data.language || 'en';
    const status = data.status || 'PUBLISHED';
    const source = data.source || 'MANUAL';

    await pool.query(
      `INSERT INTO support_knowledge_base 
        (id, question, answer, category, language, status, source, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
        question = VALUES(question),
        answer = VALUES(answer),
        category = VALUES(category),
        language = VALUES(language),
        status = VALUES(status),
        source = VALUES(source),
        updated_at = CURRENT_TIMESTAMP`,
      [id, data.question.trim(), data.answer.trim(), category, language, status, source]
    );

    const saved = await this.getKnowledgeItem(id);
    return saved!;
  }

  async deleteKnowledgeItem(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    const [res]: any = await pool.query(
      'DELETE FROM support_knowledge_base WHERE id = ?',
      [id]
    );
    return res.affectedRows > 0;
  }

  // -------------------------------------------------------------
  // AI Events & Audit Trail
  // -------------------------------------------------------------
  async logAiEvent(data: {
    conversation_id: string;
    message_id: string;
    intent: string;
    confidence: number;
    knowledge_source: string;
    decision: 'AUTO_ANSWER' | 'SAFE_ANSWER' | 'HANDOFF_TO_HUMAN';
  }): Promise<SupportAiEventRecord> {
    const pool = getMysqlPool();
    const id = `aie_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.query(
      `INSERT INTO support_ai_events 
        (id, conversation_id, message_id, intent, confidence, knowledge_source, decision, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, data.conversation_id, data.message_id, data.intent, data.confidence, data.knowledge_source, data.decision]
    );

    return {
      id,
      conversation_id: data.conversation_id,
      message_id: data.message_id,
      intent: data.intent,
      confidence: data.confidence,
      knowledge_source: data.knowledge_source,
      decision: data.decision,
      created_at: new Date().toISOString(),
    };
  }

  async getAiEvents(conversationId: string): Promise<SupportAiEventRecord[]> {
    const pool = getMysqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM support_ai_events WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    return rows.map((r: any) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      message_id: r.message_id,
      intent: r.intent,
      confidence: parseFloat(r.confidence),
      knowledge_source: r.knowledge_source,
      decision: r.decision,
      created_at: toIso(r.created_at),
    }));
  }

  // -------------------------------------------------------------
  // Analytics
  // -------------------------------------------------------------
  async getAnalytics(): Promise<SupportAnalyticsSummary> {
    const pool = getMysqlPool();

    const [convRows]: any = await pool.query('SELECT status, assigned_admin_id FROM support_conversations');
    const [eventRows]: any = await pool.query('SELECT intent FROM support_ai_events');

    const totalConversations = convRows.length;
    const aiResolved = convRows.filter((c: any) => c.status === 'RESOLVED' && !c.assigned_admin_id).length;
    const humanAssisted = convRows.filter((c: any) => c.assigned_admin_id || c.status === 'HUMAN_ACTIVE').length;
    const waiting = convRows.filter((c: any) => c.status === 'WAITING_HUMAN').length;
    const unresolved = convRows.filter((c: any) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;

    const aiResolutionRate = totalConversations > 0 ? Math.round((aiResolved / totalConversations) * 100) : 0;

    const categoryCounts: Record<string, number> = {
      'Check-in': 0,
      'Pricing': 0,
      'Villa': 0,
      'Airport Transfer': 0,
      'Safari': 0,
      'Dining': 0,
      'Wi-Fi': 0,
      'Wellness': 0,
      'Family': 0,
      'Other': 0,
    };

    eventRows.forEach((e: any) => {
      const intent = (e.intent || '').toLowerCase();
      if (intent.includes('checkin') || intent.includes('checkout') || intent.includes('time')) {
        categoryCounts['Check-in']++;
      } else if (intent.includes('price') || intent.includes('rate') || intent.includes('payment')) {
        categoryCounts['Pricing']++;
      } else if (intent.includes('villa') || intent.includes('room') || intent.includes('pool')) {
        categoryCounts['Villa']++;
      } else if (intent.includes('airport') || intent.includes('transfer') || intent.includes('shuttle')) {
        categoryCounts['Airport Transfer']++;
      } else if (intent.includes('safari') || intent.includes('serengeti') || intent.includes('ngorongoro')) {
        categoryCounts['Safari']++;
      } else if (intent.includes('din') || intent.includes('food') || intent.includes('breakfast')) {
        categoryCounts['Dining']++;
      } else if (intent.includes('wifi') || intent.includes('internet') || intent.includes('starlink')) {
        categoryCounts['Wi-Fi']++;
      } else if (intent.includes('spa') || intent.includes('wellness') || intent.includes('massage')) {
        categoryCounts['Wellness']++;
      } else if (intent.includes('family') || intent.includes('children') || intent.includes('kid')) {
        categoryCounts['Family']++;
      } else {
        categoryCounts['Other']++;
      }
    });

    const totalCategoryHits = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    const categories = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat,
      count,
      percentage: Math.round((count / totalCategoryHits) * 100),
    }));

    return {
      totalConversations,
      aiResolved,
      humanAssisted,
      waiting,
      unresolved,
      aiResolutionRate,
      avgAiResponseTimeSec: 0.8,
      avgHumanResponseTimeMin: 4.2,
      categories,
    };
  }
}

export const supportRepository = new SupportRepository();
