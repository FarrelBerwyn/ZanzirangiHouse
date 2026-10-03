import { Router, Request, Response } from 'express';
import { supportRepository } from './database/repositories/supportRepository.ts';
import { settingsRepository } from './database/repositories/settingsRepository.ts';
import { supportAiEngine } from './services/supportAiEngine.ts';
import { authenticateAdmin, AuthenticatedRequest, requirePermission } from './auth.ts';
import { auditRepository } from './database/repositories/auditRepository.ts';

// Support inbox & knowledge base are restricted to admins holding the 'support' permission.
const requireSupport = requirePermission('support');

const auditSupport = (req: AuthenticatedRequest, action: string, details: string) =>
  auditRepository
    .log({ action, userEmail: req.user?.email || 'admin', details, ipAddress: req.ip })
    .catch((e: any) => console.error('[AUDIT] Support audit failed:', e.message));
import { SupportConversationStatus } from './database/supportTypes.ts';
import { emailService } from './services/emailService.ts';
import { webPushService } from './services/webPushService.ts';
import { supportEscalationService } from './services/supportEscalationService.ts';

export const supportRouter = Router();

function toStr(val: any): string {
  if (Array.isArray(val)) return String(val[0] || '');
  return typeof val === 'string' ? val : val !== undefined && val !== null ? String(val) : '';
}

// ==============================================================================
// 1. PUBLIC VISITOR ENDPOINTS
// ==============================================================================

/**
 * POST /api/support/conversation
 * Initializes or fetches an active conversation for the visitor.
 * Can attach booking context if inquiry originates from booking modal.
 */
supportRouter.post('/conversation', async (req: Request, res: Response) => {
  try {
    const { visitor_id, session_id, language, current_page, booking_id, metadata } = req.body;

    if (!visitor_id || !session_id) {
      return res.status(400).json({ success: false, error: 'visitor_id and session_id are required' });
    }

    // Look for active conversation
    let conv = await supportRepository.getActiveConversationByVisitor(toStr(visitor_id));

    if (!conv) {
      conv = await supportRepository.createConversation({
        visitor_id: toStr(visitor_id),
        session_id: toStr(session_id),
        language: toStr(language) || 'en',
        current_page: toStr(current_page) || '/',
        booking_id: booking_id ? toStr(booking_id) : null,
        metadata: metadata || null,
        status: 'AI_ACTIVE',
      });
    } else if (booking_id || metadata) {
      // Update booking context if new inquiry submitted
      conv = await supportRepository.updateConversation(conv.id, {
        booking_id: booking_id ? toStr(booking_id) : conv.booking_id,
        metadata: metadata ? { ...conv.metadata, ...metadata } : conv.metadata,
        language: language ? toStr(language) : conv.language,
        current_page: current_page ? toStr(current_page) : conv.current_page,
      });
    }

    const messages = await supportRepository.getMessages(conv!.id);

    res.json({
      success: true,
      data: {
        conversation: conv,
        messages,
      },
    });
  } catch (err: any) {
    console.error('Error initializing support conversation:', err.message);
    res.status(500).json({ success: false, error: 'Failed to initialize conversation' });
  }
});

/**
 * GET /api/support/conversation/:id
 * Fetches conversation and its full message history.
 * Verifies visitor ownership.
 */
supportRouter.get('/conversation/:id', async (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const visitor_id = toStr(req.query.visitor_id) || toStr(req.headers['x-visitor-id']);

    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Security check: visitor must own conversation
    if (!visitor_id || conv.visitor_id !== visitor_id) {
      return res.status(403).json({ success: false, error: 'Access denied to this conversation' });
    }

    const messages = await supportRepository.getMessages(id);
    res.json({ success: true, data: { conversation: conv, messages } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve conversation' });
  }
});

/**
 * POST /api/support/conversation/:id/messages
 * Visitor sends a message:
 * 1. Persists visitor message in database.
 * 2. Evaluates query with SupportAiEngine if status is AI_ACTIVE / WAITING_HUMAN.
 * 3. Returns bot response or marks as WAITING_HUMAN.
 * 4. If status is HUMAN_ACTIVE, skips bot reply and awaits admin reply.
 */
supportRouter.post('/conversation/:id/messages', async (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const { message, visitor_id, metadata, language } = req.body;
    const msgText = toStr(message).trim();

    if (!msgText) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const vId = toStr(visitor_id);
    if (!vId || conv.visitor_id !== vId) {
      return res.status(403).json({ success: false, error: 'Access denied to this conversation' });
    }

    // 1. Store visitor message
    const userMsg = await supportRepository.createMessage({
      conversation_id: id,
      sender_type: 'VISITOR',
      sender_id: conv.visitor_id,
      message: msgText,
      message_type: 'TEXT',
      metadata,
    });

    // 2. Evaluate query with AI Decision Layer using recent concierge name from settings
    let conciergeName = 'Elena';
    try {
      const settings = await settingsRepository.getSettings();
      if (settings?.supportName && settings.supportName.trim()) {
        conciergeName = settings.supportName.trim();
      }
    } catch (_) {}

    const activeLang = (typeof language === 'string' && language.trim())
      ? language.trim().toLowerCase()
      : (typeof metadata?.language === 'string' && metadata.language.trim())
      ? metadata.language.trim().toLowerCase()
      : (conv.language || 'en');

    if (activeLang && activeLang !== conv.language) {
      try {
        await supportRepository.updateConversation(id, { language: activeLang });
        conv.language = activeLang;
      } catch (_) {}
    }

    const evaluation = await supportAiEngine.evaluateQuery(
      msgText,
      activeLang,
      conv.current_page,
      conciergeName
    );

    // 3. Save AI event audit log
    await supportRepository.logAiEvent({
      conversation_id: id,
      message_id: userMsg.id,
      intent: evaluation.intent,
      confidence: evaluation.confidence,
      knowledge_source: evaluation.knowledge_source,
      decision: evaluation.decision,
    });

    let botMsg = null;
    let nextStatus: SupportConversationStatus = conv.status;

    if (evaluation.decision === 'HANDOFF_TO_HUMAN') {
      // Detailed question, negotiation, discount, event, or explicit human request!
      nextStatus = 'WAITING_HUMAN';
      await supportRepository.updateConversation(id, {
        status: 'WAITING_HUMAN',
      });

      // Multi-layer notification & Escalation system:
      // 1. Web Dashboard chime & badge
      // 2. Web Push notification to HP staff
      // 3. Urgent Email alert via Hostinger SMTP to info@zanzirangihouse.com
      // 4. Escalation timers (2m push reminder, 5m email reminder, 10m fallback)
      await supportEscalationService.triggerHumanRequired({
        conversationId: id,
        visitorMessage: msgText,
        visitorId: conv.visitor_id,
        language: conv.language,
        currentPage: conv.current_page,
        handoffReason: evaluation.handoffReason,
      });

      botMsg = await supportRepository.createMessage({
        conversation_id: id,
        sender_type: 'AI',
        sender_id: 'juma_concierge_ai',
        message: evaluation.replyText,
        message_type: 'TEXT',
        ai_confidence: evaluation.confidence,
        metadata: {
          handoffReason: evaluation.handoffReason,
        },
      });
    } else {
      // AUTO_ANSWER (Simple question, greeting like "malam", pleasantry, or recognized FAQ)
      // Answer immediately with Elena!
      if (conv.status === 'HUMAN_ACTIVE') {
        nextStatus = 'HUMAN_ACTIVE';
      }

      botMsg = await supportRepository.createMessage({
        conversation_id: id,
        sender_type: 'AI',
        sender_id: 'juma_concierge_ai',
        message: evaluation.replyText,
        message_type: evaluation.action ? 'ACTION' : 'TEXT',
        ai_confidence: evaluation.confidence,
        metadata: {
          action: evaluation.action,
        },
      });
    }

    res.json({
      success: true,
      data: {
        userMessage: userMsg,
        botMessage: botMsg,
        conversationStatus: nextStatus,
      },
    });
  } catch (err: any) {
    console.error('Error posting visitor support message:', err.message);
    res.status(500).json({ success: false, error: 'Failed to process support message' });
  }
});

/**
 * GET /api/support/conversation/:id/poll
 * Lightweight polling for new messages since a given timestamp.
 */
supportRouter.get('/conversation/:id/poll', async (req: Request, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const after = toStr(req.query.after);
    const visitor_id = toStr(req.query.visitor_id) || toStr(req.headers['x-visitor-id']);

    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!visitor_id || conv.visitor_id !== visitor_id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    let messages = await supportRepository.getMessages(id);
    if (after) {
      const afterTime = new Date(after).getTime();
      messages = messages.filter((m) => new Date(m.created_at).getTime() > afterTime);
    }

    res.json({
      success: true,
      data: {
        status: conv.status,
        messages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to poll messages' });
  }
});

// ==============================================================================
// 2. ADMIN SUPPORT INBOX ENDPOINTS (Protected with authenticateAdmin)
// ==============================================================================

/**
 * GET /api/support/admin/conversations
 * Lists conversations with filter, search, unread badge counters.
 */
supportRouter.get('/admin/conversations', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = toStr(req.query.status);
    const search = toStr(req.query.search);
    const limit = req.query.limit ? parseInt(toStr(req.query.limit), 10) : undefined;

    const conversations = await supportRepository.getConversations({
      status: status || undefined,
      search: search || undefined,
      limit,
    });

    const allConvs = await supportRepository.getConversations();
    const counts = {
      all: allConvs.length,
      waiting: allConvs.filter((c) => c.status === 'WAITING_HUMAN').length,
      aiActive: allConvs.filter((c) => c.status === 'AI_ACTIVE').length,
      humanActive: allConvs.filter((c) => c.status === 'HUMAN_ACTIVE').length,
      resolved: allConvs.filter((c) => c.status === 'RESOLVED').length,
      closed: allConvs.filter((c) => c.status === 'CLOSED').length,
    };

    res.json({
      success: true,
      data: {
        conversations,
        counts,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /api/support/admin/conversations/:id
 * Fetches conversation details, full message history, and AI audit events.
 */
supportRouter.get('/admin/conversations/:id', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const messages = await supportRepository.getMessages(id);
    const aiEvents = await supportRepository.getAiEvents(id);

    res.json({
      success: true,
      data: {
        conversation: conv,
        messages,
        aiEvents,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve conversation details' });
  }
});

/**
 * POST /api/support/admin/conversations/:id/messages
 * Admin sends a message:
 * - Persisted as sender_type: ADMIN
 * - If status was WAITING_HUMAN, updates to HUMAN_ACTIVE
 * - Can include contextual links (action metadata)
 */
supportRouter.post('/admin/conversations/:id/messages', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const { message, action, suggestedByAi } = req.body;
    const msgText = toStr(message).trim();

    if (!msgText) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    const conv = await supportRepository.getConversationById(id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    const adminEmail = req.user?.email || 'admin@zanzirangihouse.com';

    const newMsg = await supportRepository.createMessage({
      conversation_id: id,
      sender_type: 'ADMIN',
      sender_id: adminEmail,
      message: msgText,
      message_type: action ? 'ACTION' : 'TEXT',
      metadata: {
        action,
        suggestedByAi: !!suggestedByAi,
      },
    });

    // Update conversation status to HUMAN_ACTIVE if it was WAITING_HUMAN or AI_ACTIVE
    const updatedConv = await supportRepository.updateConversation(id, {
      status: 'HUMAN_ACTIVE',
      assigned_admin_id: adminEmail,
    });
    // Stop reminder timers for this conversation
    await supportEscalationService.resolveEscalation(id);
    await auditSupport(req, 'SUPPORT_REPLY_SENT', `Replied in conversation ${id}`);

    res.json({
      success: true,
      data: {
        message: newMsg,
        conversation: updatedConv,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to send admin message' });
  }
});

/**
 * PATCH /api/support/admin/conversations/:id/status
 * Updates status (TAKE OVER -> HUMAN_ACTIVE, RETURN TO AI -> AI_ACTIVE, RESOLVE -> RESOLVED, CLOSE -> CLOSED).
 */
supportRouter.patch('/admin/conversations/:id/status', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const status = toStr(req.body.status) as SupportConversationStatus;

    const validStatuses: SupportConversationStatus[] = [
      'AI_ACTIVE',
      'WAITING_HUMAN',
      'HUMAN_ACTIVE',
      'WAITING_FOR_VISITOR',
      'RESOLVED',
      'CLOSED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    const adminEmail = req.user?.email || 'admin@zanzirangihouse.com';
    const updates: Partial<any> = { status };

    if (status === 'HUMAN_ACTIVE') {
      updates.assigned_admin_id = adminEmail;
    } else if (status === 'AI_ACTIVE') {
      updates.assigned_admin_id = null;
    }

    const updated = await supportRepository.updateConversation(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Create system audit event message in conversation
    let sysText = '';
    if (status === 'HUMAN_ACTIVE') {
      sysText = `Concierge staff (${adminEmail}) has taken over the conversation. AI auto-replies are paused.`;
    } else if (status === 'AI_ACTIVE') {
      sysText = `Conversation returned to AI Concierge (Juma).`;
    } else if (status === 'RESOLVED') {
      sysText = `Conversation marked as resolved by ${adminEmail}.`;
    } else if (status === 'CLOSED') {
      sysText = `Conversation closed.`;
    }

    if (sysText) {
      await supportRepository.createMessage({
        conversation_id: id,
        sender_type: 'SYSTEM',
        sender_id: 'system',
        message: sysText,
        message_type: 'SYSTEM_EVENT',
      });
    }

    await auditSupport(req, 'SUPPORT_STATUS_CHANGED', `Conversation ${id} → ${status}`);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update conversation status' });
  }
});

/**
 * GET /api/support/admin/conversations/:id/suggested-reply
 * Generates an AI suggested reply for the human concierge to use or edit.
 */
supportRouter.get('/admin/conversations/:id/suggested-reply', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const messages = await supportRepository.getMessages(id);

    const visitorMsgs = messages.filter((m) => m.sender_type === 'VISITOR');
    const lastVisitorMsg = visitorMsgs[visitorMsgs.length - 1]?.message || '';

    const history = messages.map((m) => ({
      sender: m.sender_type,
      text: m.message,
    }));

    const suggestedReply = supportAiEngine.generateSuggestedReplyForAdmin(lastVisitorMsg, history);

    res.json({
      success: true,
      data: {
        suggestedReply,
        lastVisitorMessage: lastVisitorMsg,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to generate suggested reply' });
  }
});

// ==============================================================================
// 3. KNOWLEDGE BASE CRUD ENDPOINTS (Protected with authenticateAdmin)
// ==============================================================================

/**
 * GET /api/support/admin/knowledge-base
 */
supportRouter.get('/admin/knowledge-base', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = toStr(req.query.category);
    const language = toStr(req.query.language);
    const status = toStr(req.query.status);
    const search = toStr(req.query.search);

    const items = await supportRepository.getKnowledgeBase({
      category: category || undefined,
      language: language || undefined,
      status: status || undefined,
      search: search || undefined,
    });
    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch knowledge base' });
  }
});

/**
 * POST /api/support/admin/knowledge-base
 */
supportRouter.post('/admin/knowledge-base', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, answer, category, language, status, source } = req.body;
    const qText = toStr(question).trim();
    const aText = toStr(answer).trim();

    if (!qText || !aText) {
      return res.status(400).json({ success: false, error: 'Question and answer are required' });
    }

    const saved = await supportRepository.saveKnowledgeItem({
      question: qText,
      answer: aText,
      category: toStr(category) || 'General',
      language: toStr(language) || 'en',
      status: (toStr(status) as any) || 'PUBLISHED',
      source: (toStr(source) as any) || 'MANUAL',
    });
    await auditSupport(req, 'KNOWLEDGE_ITEM_CREATED', `Created knowledge item: ${qText.slice(0, 80)}`);

    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to save knowledge item' });
  }
});

/**
 * PUT /api/support/admin/knowledge-base/:id
 */
supportRouter.put('/admin/knowledge-base/:id', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const { question, answer, category, language, status } = req.body;

    const saved = await supportRepository.saveKnowledgeItem({
      id,
      question: toStr(question),
      answer: toStr(answer),
      category: toStr(category),
      language: toStr(language),
      status: toStr(status) as any,
    });
    await auditSupport(req, 'KNOWLEDGE_ITEM_UPDATED', `Updated knowledge item ${id}`);

    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update knowledge item' });
  }
});

/**
 * DELETE /api/support/admin/knowledge-base/:id
 */
supportRouter.delete('/admin/knowledge-base/:id', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = toStr(req.params.id);
    const deleted = await supportRepository.deleteKnowledgeItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Knowledge item not found' });
    }
    await auditSupport(req, 'KNOWLEDGE_ITEM_DELETED', `Deleted knowledge item ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete knowledge item' });
  }
});

// ==============================================================================
// 4. ANALYTICS ENDPOINT (Protected with authenticateAdmin)
// ==============================================================================

/**
 * GET /api/support/admin/analytics
 */
supportRouter.get('/admin/analytics', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const analytics = await supportRepository.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch support analytics' });
  }
});

// ==============================================================================
// 5. BOOKING & HOSTINGER EMAIL ALERTS
// ==============================================================================

/**
 * POST /api/support/booking-alert
 * Dispatched when a guest submits a villa booking inquiry modal.
 * Triggers instant Hostinger SMTP email alert to hotel management.
 */
supportRouter.post('/booking-alert', async (req: Request, res: Response) => {
  try {
    const booking = req.body;
    if (!booking || !booking.fullName || !booking.villaName) {
      return res.status(400).json({ success: false, error: 'Incomplete booking details' });
    }

    // Fire email asynchronously via Hostinger SMTP without blocking visitor
    emailService.sendBookingAlert(booking).catch((err) => {
      console.error('[EMAIL] Background booking alert failed:', err.message);
    });

    res.json({ success: true, message: 'Booking alert dispatched successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/support/admin/test-email
 * Verifies Hostinger SMTP connection and sends test email.
 */
supportRouter.post('/admin/test-email', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { targetEmail } = req.body;
    const to = targetEmail || req.user?.email || 'info@zanzirangihouse.com';
    const result = await emailService.testConnection(to);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 6. WEB PUSH NOTIFICATIONS & STAFF ON-DUTY
// ==============================================================================

/**
 * GET /api/support/push/public-key
 * Returns VAPID public key for Web Push subscription in browser / PWA.
 */
supportRouter.get('/push/public-key', (_req: Request, res: Response) => {
  res.json({ success: true, publicKey: webPushService.getPublicKey() });
});

/**
 * POST /api/support/push/subscribe
 * Registers or updates a staff member's Web Push subscription.
 */
supportRouter.post('/push/subscribe', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, error: 'Invalid push subscription payload' });
    }

    const email = req.user?.email || 'admin@zanzirangihouse.com';
    const role = req.user?.role || 'STAFF';

    const saved = await supportRepository.savePushSubscription({
      user_email: email,
      role,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_agent: req.headers['user-agent'] || null,
    });

    res.json({ success: true, subscription: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/support/push/unsubscribe
 * Unregisters a staff member's Web Push subscription.
 */
supportRouter.post('/push/unsubscribe', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await supportRepository.deletePushSubscription(endpoint);
    }
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/support/push/test
 * Sends a test push notification to verify the staff HP receives the alert.
 */
supportRouter.post('/push/test', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const email = req.user?.email || 'Staff';
    const result = await webPushService.sendNotificationToStaff({
      title: '🔔 Zanzirangi House Support – Test Alert',
      body: `Hi ${email.split('@')[0]}! Your phone is connected to Zanzirangi Support Alerts. When guests require human assistance, you will receive real-time notifications here.`,
      url: '/admin',
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/support/duty/status
 * Fetches On Duty staff members and current user's duty state.
 */
supportRouter.get('/duty/status', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staffList = await supportRepository.getStaffDutyList();
    const myEmail = req.user?.email || '';
    const myDuty = staffList.find((s) => s.user_email.toLowerCase() === myEmail.toLowerCase());

    res.json({
      success: true,
      staff: staffList,
      isOnDuty: Boolean(myDuty?.is_on_duty),
      hasAgentOnline: staffList.some((s) => s.is_on_duty),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/support/duty/toggle
 * Toggles On Duty / Off Duty status for the authenticated staff member.
 */
supportRouter.post('/duty/toggle', authenticateAdmin, requireSupport, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { isOnDuty } = req.body;
    const email = req.user?.email || 'admin@zanzirangihouse.com';
    const name = (req.user as any)?.name || email.split('@')[0];
    const role = req.user?.role || 'STAFF';

    const updated = await supportRepository.updateStaffDuty(email, Boolean(isOnDuty), name, role);
    const staffList = await supportRepository.getStaffDutyList();

    res.json({
      success: true,
      duty: updated,
      staff: staffList,
      hasAgentOnline: staffList.some((s) => s.is_on_duty),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


