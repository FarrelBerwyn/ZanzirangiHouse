import webpush from 'web-push';
import { supportRepository } from '../database/repositories/supportRepository.ts';

// Standard VAPID credentials for Web Push
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BI6ZzUgSWdCiNylYuSYHQJ6one6Xxi3xln1zxIZ_TIK0_u-tb08uxhdwQRiqFife81rWgGmGM9ETDjU_SUCJtsM';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'QdvTfruhF5J5Namm7FHzOROFwMF8QFxFHr6ks9Y2Rdo';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:info@zanzirangihouse.com';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e: any) {
  console.warn('[WEB_PUSH] VAPID initialization notice:', e.message);
}

export interface PushPayload {
  title: string;
  body: string;
  conversationId?: string;
  url?: string;
  badge?: string;
  icon?: string;
  tag?: string;
}

export class WebPushService {
  getPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }

  /**
   * Dispatches push notifications to staff mobile devices and desktop browsers.
   * If on-duty staff exist, prioritizes them; otherwise alerts all registered staff.
   */
  async sendNotificationToStaff(payload: PushPayload, role?: string): Promise<{ sent: number; failed: number }> {
    const subscriptions = await supportRepository.getPushSubscriptions(role);
    if (!subscriptions || subscriptions.length === 0) {
      console.log('[WEB_PUSH] No active push subscriptions found for staff.');
      return { sent: 0, failed: 0 };
    }

    const targetUrl = payload.url || (payload.conversationId ? `/admin?tab=inbox&conversation=${payload.conversationId}` : '/admin');
    const pushData = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon-48x48.png',
      badge: payload.badge || '/favicon-32x32.png',
      data: {
        url: targetUrl,
        conversationId: payload.conversationId || null,
        timestamp: Date.now(),
      },
    });

    let sent = 0;
    let failed = 0;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };
          await webpush.sendNotification(pushSubscription, pushData, {
            TTL: 60 * 60, // 1 hour TTL
            urgency: 'high',
          });
          sent++;
        } catch (err: any) {
          failed++;
          // If subscription has expired or unsubscribed (404 or 410 Gone), prune from database
          if (err.statusCode === 404 || err.statusCode === 410) {
            console.log(`[WEB_PUSH] Pruning expired subscription for ${sub.user_email} (${err.statusCode})`);
            await supportRepository.deletePushSubscription(sub.endpoint).catch(() => {});
          } else {
            console.warn(`[WEB_PUSH] Failed to send push to ${sub.user_email}:`, err.message);
          }
        }
      })
    );

    console.log(`[WEB_PUSH] Dispatched push alerts: ${sent} sent, ${failed} failed across ${subscriptions.length} devices.`);
    return { sent, failed };
  }
}

export const webPushService = new WebPushService();
