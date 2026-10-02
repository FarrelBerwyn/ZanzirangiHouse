import { supportRepository } from '../database/repositories/supportRepository.ts';
import { webPushService } from './webPushService.ts';
import { emailService } from './emailService.ts';

export class SupportEscalationService {
  private timer: NodeJS.Timeout | null = null;

  /**
   * Initializes the recurring escalation monitor that checks for unanswered guest inquiries.
   */
  startEscalationMonitor() {
    if (this.timer) return;
    if (process.env.NODE_ENV === 'test' || process.env.ZANZIRANGI_NO_LISTEN === '1') {
      return;
    }
    console.log('[SUPPORT_ESCALATION] Escalation monitor started (30s polling cycle).');
    this.timer = setInterval(() => {
      this.checkEscalations().catch((e) => console.error('[SUPPORT_ESCALATION] Escalation check error:', e.message));
    }, 30000);
    this.timer.unref();
  }

  stopEscalationMonitor() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Triggered immediately when AI / visitor triggers HUMAN_REQUIRED.
   * Multi-layer notification:
   * 1. 🔔 Web Dashboard (status updated)
   * 2. 📱 Web Push to HP Staff
   * 3. 📧 Urgent Email via Hostinger SMTP
   * 4. 💬 WhatsApp / Telegram Fallback (if configured)
   */
  async triggerHumanRequired(params: {
    conversationId: string;
    visitorMessage: string;
    visitorId?: string;
    language?: string;
    currentPage?: string;
    handoffReason?: string;
  }) {
    const { conversationId, visitorMessage, visitorId = 'Guest', language = 'en', currentPage = '/', handoffReason } = params;

    console.log(`[SUPPORT_ESCALATION] 🚨 HUMAN_REQUIRED triggered for conversation ${conversationId}`);

    // Check who is currently on duty
    const onDutyStaff = await supportRepository.getOnDutyStaff().catch(() => []);
    const hasAgentOnline = onDutyStaff.length > 0;

    // 1. Web Push Notification to HP Staff
    const pushBody = hasAgentOnline
      ? `Guest requires assistance:\n"${visitorMessage.slice(0, 95)}"`
      : `⚠️ NO AGENT ON DUTY! Guest waiting:\n"${visitorMessage.slice(0, 90)}"`;

    webPushService
      .sendNotificationToStaff({
        title: hasAgentOnline ? '🔔 Zanzirangi House – Customer Support' : '🚨 URGENT: Guest Waiting (No Agent On Duty)',
        body: pushBody,
        conversationId,
      })
      .catch((e: any) => console.warn('[SUPPORT_ESCALATION] Web push error:', e.message));

    // 2. Email alert to info@zanzirangihouse.com via Hostinger SMTP
    emailService
      .sendHumanSupportAlert({
        conversationId,
        visitorId,
        language,
        currentPage,
        lastMessage: visitorMessage,
        handoffReason: handoffReason || (hasAgentOnline ? 'Guest inquiry handed off to staff' : 'URGENT: No staff currently on duty!'),
      })
      .catch((e: any) => console.error('[SUPPORT_ESCALATION] Email alert error:', e.message));

    // 3. Fallback Webhook (Telegram / WhatsApp)
    this.sendWebhookFallback({
      title: '🚨 Zanzirangi Support Alert (HUMAN REQUIRED)',
      message: visitorMessage,
      conversationId,
      hasAgentOnline,
    }).catch(() => {});

    // 4. Register in database Escalation Queue
    await supportRepository.createEscalationQueueItem(conversationId, visitorMessage).catch((e: any) =>
      console.warn('[SUPPORT_ESCALATION] Failed to insert queue item:', e.message)
    );
  }

  /**
   * Called when a human staff member replies to the customer.
   * Clears the escalation queue for this conversation.
   */
  async resolveEscalation(conversationId: string) {
    console.log(`[SUPPORT_ESCALATION] ✓ Resolving escalation for conversation ${conversationId}`);
    await supportRepository.resolveEscalationQueueItem(conversationId).catch(() => {});
  }

  /**
   * Periodically checks pending escalations for 2m, 5m, and 10m thresholds.
   */
  private async checkEscalations() {
    const pending = await supportRepository.getPendingEscalations();
    if (!pending || pending.length === 0) return;

    const now = Date.now();

    for (const item of pending) {
      const triggeredTime = new Date(item.triggered_at).getTime();
      const elapsedMinutes = (now - triggeredTime) / 60000;

      // Tier 1: 2 Minutes Unanswered -> Push Reminder
      if (elapsedMinutes >= 2 && !item.reminder_2m_sent) {
        console.log(`[SUPPORT_ESCALATION] ⏱️ 2m Reminder for conversation ${item.conversation_id}`);
        await webPushService.sendNotificationToStaff({
          title: '⚠️ Zanzirangi Support Reminder (2m)',
          body: `Unread guest inquiry waiting 2+ minutes:\n"${item.visitor_message.slice(0, 80)}"`,
          conversationId: item.conversation_id,
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_2m_sent: true });
      }

      // Tier 2: 5 Minutes Unanswered -> Email Escalation to Management
      if (elapsedMinutes >= 5 && !item.reminder_5m_sent) {
        console.log(`[SUPPORT_ESCALATION] ⏱️ 5m Escalation for conversation ${item.conversation_id}`);
        await emailService.sendHumanSupportAlert({
          conversationId: item.conversation_id,
          visitorId: 'Urgent Escalation',
          language: 'en',
          lastMessage: `[UNANSWERED FOR 5 MINUTES] ${item.visitor_message}`,
          handoffReason: 'Guest message has been unanswered for 5 minutes. Please respond immediately.',
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_5m_sent: true });
      }

      // Tier 3: 10 Minutes Unanswered -> Critical Webhook / Push
      if (elapsedMinutes >= 10 && !item.reminder_10m_sent) {
        console.log(`[SUPPORT_ESCALATION] 🚨 10m Critical Escalation for conversation ${item.conversation_id}`);
        await webPushService.sendNotificationToStaff({
          title: '🚨 CRITICAL ESCALATION (10m Unanswered)',
          body: `Guest has been waiting 10 minutes without a reply:\n"${item.visitor_message.slice(0, 80)}"`,
          conversationId: item.conversation_id,
        });
        await this.sendWebhookFallback({
          title: '🚨 CRITICAL 10M UNANSWERED SUPPORT INQUIRY',
          message: item.visitor_message,
          conversationId: item.conversation_id,
          hasAgentOnline: false,
        });
        await supportRepository.updateEscalationReminders(item.id, { reminder_10m_sent: true });
      }
    }
  }

  /**
   * Optional fallback to Telegram or WhatsApp Webhook if configured in environment variables.
   */
  private async sendWebhookFallback(data: {
    title: string;
    message: string;
    conversationId: string;
    hasAgentOnline: boolean;
  }) {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const whatsappWebhook = process.env.WHATSAPP_WEBHOOK_URL;
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    const text = `${data.title}\n\nMessage: "${data.message}"\n\nLink: ${appUrl}/admin?tab=inbox&conversation=${data.conversationId}`;

    if (telegramToken && telegramChatId) {
      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: 'HTML',
          }),
        });
      } catch (err: any) {
        console.warn('[SUPPORT_ESCALATION] Telegram fallback failed:', err.message);
      }
    }

    if (whatsappWebhook) {
      try {
        await fetch(whatsappWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'support_escalation',
            conversationId: data.conversationId,
            text,
          }),
        });
      } catch (err: any) {
        console.warn('[SUPPORT_ESCALATION] WhatsApp webhook fallback failed:', err.message);
      }
    }
  }
}

export const supportEscalationService = new SupportEscalationService();
