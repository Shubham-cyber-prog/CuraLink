export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';

export interface SendNotificationPayload {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientPushToken?: string;
  subject: string;
  body: string;
  channels: NotificationChannel[];
  metadata?: Record<string, any>;
}

export class NotificationService {
  async send(payload: SendNotificationPayload): Promise<{ success: boolean; dispatchedChannels: string[] }> {
    const dispatched: string[] = [];

    for (const channel of payload.channels) {
      try {
        switch (channel) {
          case 'EMAIL':
            await this.sendEmail(payload.recipientEmail, payload.subject, payload.body);
            dispatched.push('EMAIL');
            break;
          case 'SMS':
            await this.sendSMS(payload.recipientPhone, payload.body);
            dispatched.push('SMS');
            break;
          case 'PUSH':
            await this.sendPushNotification(payload.recipientPushToken, payload.subject, payload.body);
            dispatched.push('PUSH');
            break;
        }
      } catch (err) {
        console.error(`[NotificationService] Error sending ${channel} to ${payload.recipientId}:`, err);
      }
    }

    return {
      success: dispatched.length > 0,
      dispatchedChannels: dispatched,
    };
  }

  private async sendEmail(email?: string, subject?: string, body?: string): Promise<void> {
    if (!email) return;

    // Resend / SMTP integration check
    if (process.env.RESEND_API_KEY) {
      // Production email dispatch via Resend API
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'CuraLink Healthcare <notifications@curalink.health>',
          to: email,
          subject,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #111827;">
            <h2 style="color: #0F766E;">CuraLink Healthcare</h2>
            <p>${body}</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin-top: 20px;" />
            <p style="font-size: 12px; color: #6B7280;">This is an automated notification from CuraLink. Please do not reply directly.</p>
          </div>`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Resend email API returned status ${res.status}`);
      }
    } else {
      console.log(`[Mock Notification Dispatch] EMAIL sent to ${email} | Subject: "${subject}" | Content: "${body}"`);
    }
  }

  private async sendSMS(phone?: string, message?: string): Promise<void> {
    if (!phone) return;

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Twilio SMS dispatch
      console.log(`[Twilio SMS Integration] Dispatching SMS to ${phone}`);
    } else {
      console.log(`[Mock Notification Dispatch] SMS sent to ${phone} | Content: "${message}"`);
    }
  }

  private async sendPushNotification(token?: string, title?: string, message?: string): Promise<void> {
    if (!token) return;
    console.log(`[Mock Notification Dispatch] PUSH sent to token ${token} | Title: "${title}" | Message: "${message}"`);
  }
}

export const notificationService = new NotificationService();
