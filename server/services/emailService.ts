import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { globalContentRepository } from '../database/repositories/globalContentRepository.ts';

dotenv.config();

export interface BookingAlertPayload {
  bookingId?: string;
  villaName: string;
  roomNumber?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  specialRequests?: string;
  airportTransfer?: boolean;
}

export interface SupportAlertPayload {
  conversationId: string;
  visitorId: string;
  language: string;
  currentPage?: string;
  lastMessage: string;
  handoffReason?: string;
}

class EmailService {
  private getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE !== 'false'; // default true for 465
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';

    if (!user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  private async getRecipientEmail(): Promise<string> {
    try {
      const global = await globalContentRepository.get();
      if (global?.contactEmail) {
        return global.contactEmail;
      }
    } catch {}
    return process.env.ADMIN_ALERT_EMAIL || process.env.ALERT_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'info@zanzirangihouse.com';
  }

  /**
   * Sends an immediate email notification when a guest submits a villa booking inquiry
   */
  async sendBookingAlert(payload: BookingAlertPayload): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log('[EMAIL] Hostinger SMTP not configured (SMTP_USER/SMTP_PASS missing). Skipped sending booking alert email.');
        return false;
      }

      const toEmail = await this.getRecipientEmail();
      const fromEmail = process.env.SMTP_USER || 'info@zanzirangihouse.com';
      const appUrl = process.env.APP_URL || 'https://zanzirangihouse.com';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1C1B1A; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E7DFD2; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #141413; padding: 28px 32px; text-align: center; }
    .gold-title { color: #A07E54; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .main-title { color: #FAF8F5; font-size: 22px; font-weight: 300; margin: 0; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
    .info-table td { padding: 10px 12px; border-bottom: 1px solid #F4EFE6; font-size: 13px; }
    .info-table td.label { width: 38%; color: #6B6862; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .info-table td.value { color: #141413; font-weight: 500; }
    .requests-box { background: #F4EFE6; border-left: 3px solid #A07E54; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #3A3835; font-style: italic; }
    .btn { display: block; width: fit-content; margin: 28px auto 8px; background: #B8966C; color: #141413; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
    .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #8F8B84; border-top: 1px solid #F4EFE6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="gold-title">Zanzirangi House Zanzibar</div>
      <h1 class="main-title">New Villa Reservation Alert</h1>
    </div>
    <div class="body">
      <div class="badge">Immediate Action Required</div>
      <p style="font-size: 14px; line-height: 1.6; margin-top: 0;">A guest has just submitted a direct reservation inquiry on <strong>zanzirangihouse.com</strong>:</p>
      
      <table class="info-table">
        <tr>
          <td class="label">Guest Name</td>
          <td class="value"><strong>${payload.fullName}</strong></td>
        </tr>
        <tr>
          <td class="label">Guest Email</td>
          <td class="value"><a href="mailto:${payload.email}" style="color: #A07E54;">${payload.email}</a></td>
        </tr>
        <tr>
          <td class="label">Phone / WhatsApp</td>
          <td class="value">${payload.phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td class="label">Country of Origin</td>
          <td class="value">${payload.country || 'Not specified'}</td>
        </tr>
        <tr>
          <td class="label">Villa Selection</td>
          <td class="value"><strong>${payload.villaName}</strong> ${payload.roomNumber ? `(${payload.roomNumber})` : ''}</td>
        </tr>
        <tr>
          <td class="label">Stay Dates</td>
          <td class="value"><strong>${payload.checkIn} → ${payload.checkOut}</strong></td>
        </tr>
        <tr>
          <td class="label">Party Size</td>
          <td class="value">${payload.guests} Guests</td>
        </tr>
        <tr>
          <td class="label">Airport Transfer</td>
          <td class="value">${payload.airportTransfer ? 'Yes (Requested)' : 'No'}</td>
        </tr>
      </table>

      ${payload.specialRequests ? `
      <div class="label" style="font-size: 11px; font-weight: 700; color: #6B6862; text-transform: uppercase;">Special Requests:</div>
      <div class="requests-box">"${payload.specialRequests}"</div>
      ` : ''}

      <a href="${appUrl}/admin/support" class="btn">Open Support Inbox & Reply</a>
    </div>
    <div class="footer">
      Zanzirangi House • Luxury Private Sanctuary • Kizimkazi Dimbani, Zanzibar<br>
      Hostinger Automated Alert Engine
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `"Zanzirangi House Concierge" <${fromEmail}>`,
        to: toEmail,
        subject: `🏨 [NEW BOOKING] ${payload.fullName} - ${payload.villaName} (${payload.checkIn} to ${payload.checkOut})`,
        html: htmlContent,
      });

      console.log(`[EMAIL] ✓ Booking alert successfully sent via Hostinger SMTP to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error('[EMAIL] Failed to send booking alert email via Hostinger SMTP:', err.message);
      return false;
    }
  }

  /**
   * Sends an urgent alert when a live chat visitor requests human concierge support
   */
  async sendHumanSupportAlert(payload: SupportAlertPayload): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log('[EMAIL] Hostinger SMTP not configured (SMTP_USER/SMTP_PASS missing). Skipped sending human support alert email.');
        return false;
      }

      const toEmail = await this.getRecipientEmail();
      const fromEmail = process.env.SMTP_USER || 'info@zanzirangihouse.com';
      const appUrl = process.env.APP_URL || 'https://zanzirangihouse.com';

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 24px; color: #1C1B1A; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #E7DFD2; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: #92400E; padding: 24px 32px; text-align: center; }
    .gold-title { color: #FEF3C7; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 700; margin-bottom: 6px; }
    .main-title { color: #ffffff; font-size: 20px; font-weight: 400; margin: 0; }
    .body { padding: 32px; }
    .badge { display: inline-block; background: #FEE2E2; color: #991B1B; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; margin-bottom: 16px; }
    .message-box { background: #F4EFE6; border-left: 4px solid #B8966C; padding: 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; line-height: 1.5; color: #141413; }
    .info-list { font-size: 12px; color: #6B6862; margin: 16px 0; }
    .btn { display: block; width: fit-content; margin: 28px auto 8px; background: #141413; color: #FAF8F5; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
    .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #8F8B84; border-top: 1px solid #F4EFE6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="gold-title">Live Chat Concierge Alert</div>
      <h1 class="main-title">Guest Waiting for Human Support</h1>
    </div>
    <div class="body">
      <div class="badge">URGENT: Visitor Waiting</div>
      <p style="font-size: 14px; margin-top: 0;">A guest on <strong>zanzirangihouse.com</strong> has requested to speak with a human concierge or asked a question requiring staff intervention:</p>
      
      <div class="message-box">
        <strong>Guest Query:</strong><br>
        "${payload.lastMessage}"
      </div>

      <div class="info-list">
        • <strong>Visitor ID:</strong> ${payload.visitorId}<br>
        • <strong>Language:</strong> ${payload.language.toUpperCase()}<br>
        • <strong>Active Page:</strong> ${payload.currentPage || '/'}<br>
        • <strong>Handoff Reason:</strong> ${payload.handoffReason || 'Guest requested human assistance'}
      </div>

      <a href="${appUrl}/admin/support" class="btn">Open Inbox & Reply Now</a>
    </div>
    <div class="footer">
      Zanzirangi House Hostinger Alert Dispatcher • Fast response increases direct booking conversion.
    </div>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `"Zanzirangi House Alert" <${fromEmail}>`,
        to: toEmail,
        subject: `⚠️ [ACTION REQUIRED] Guest Needs Human Response on Zanzirangi House`,
        html: htmlContent,
      });

      console.log(`[EMAIL] ✓ Human support alert successfully sent via Hostinger SMTP to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.error('[EMAIL] Failed to send human support alert email via Hostinger SMTP:', err.message);
      return false;
    }
  }

  /**
   * Tests the Hostinger SMTP connection
   */
  async testConnection(targetEmail?: string): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        return {
          success: false,
          message: 'SMTP credentials missing. Please set SMTP_USER and SMTP_PASS in your environment or Admin settings.',
        };
      }

      await transporter.verify();

      if (targetEmail) {
        const fromEmail = process.env.SMTP_USER || 'info@zanzirangihouse.com';
        await transporter.sendMail({
          from: `"Zanzirangi House Test" <${fromEmail}>`,
          to: targetEmail,
          subject: '✅ Hostinger SMTP Test - Zanzirangi House',
          html: '<p>Congratulations! Your Hostinger SMTP email integration is working perfectly. You will now receive instant alerts for villa bookings and guest support requests.</p>',
        });
      }

      return {
        success: true,
        message: 'Hostinger SMTP connection verified successfully! Test email delivered.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `SMTP Connection error: ${err.message}`,
      };
    }
  }
}

export const emailService = new EmailService();
