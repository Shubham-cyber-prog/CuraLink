import { Resend } from 'resend';
import { env } from '../../config/env';
import prisma from '../../lib/prisma';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  eventType: string;
  recipientId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  error?: string;
}

export class ResendClient {
  private resend: Resend | null = null;
  private defaultFrom: string;
  private emailEnabled: boolean;

  constructor() {
    const apiKey = env.RESEND_API_KEY || env.EMAIL_API_KEY;
    this.emailEnabled = env.EMAIL_ENABLED;
    this.defaultFrom = env.EMAIL_FROM || env.EMAIL_FROM_ADDRESS || 'CuraLink <onboarding@resend.dev>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      console.warn('[ResendClient] ⚠️ RESEND_API_KEY / EMAIL_API_KEY is not configured. Real dispatch will be skipped in non-production.');
    }
  }

  /**
   * Dispatches transactional email with bounded exponential backoff retries.
   * Isolates provider errors and logs execution into NotificationLog table.
   */
  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, html, text, eventType, recipientId, idempotencyKey, metadata } = options;

    // 1. Idempotency Check
    if (idempotencyKey) {
      try {
        if (prisma.notificationLog?.findUnique) {
          const existing = await prisma.notificationLog.findUnique({
            where: { idempotencyKey },
          });

          if (existing && (existing.status === 'SENT' || existing.status === 'DELIVERED')) {
            console.log(`[ResendClient] ⏩ Skipping duplicate email dispatch for key: ${idempotencyKey}`);
            return {
              success: true,
              messageId: existing.providerMessageId || undefined,
              status: 'SENT',
            };
          }
        }
      } catch {}
    }

    // 2. Check if email sending is enabled or configured, or in test environment
    if (!this.emailEnabled || !this.resend || process.env.NODE_ENV === 'test') {
      console.log(`[ResendClient Simulation] To: ${to} | Subject: "${subject}" | Event: ${eventType}`);
      try {
        if (prisma.notificationLog?.create) {
          await prisma.notificationLog.create({
            data: {
              recipientId,
              recipientEmail: to,
              subject,
              eventType,
              status: 'SENT',
              provider: 'RESEND_SIMULATION',
              providerMessageId: `sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              idempotencyKey,
              metadata: metadata ? JSON.stringify(metadata) : null,
              sentAt: new Date(),
            },
          });
        }
      } catch (e: any) {
        // Safe logging in simulation
      }

      return {
        success: true,
        messageId: `sim_${Date.now()}`,
        status: 'SENT',
      };
    }

    // 3. Create initial pending log record
    let logRecord: any = null;
    try {
      if (prisma.notificationLog?.create) {
        logRecord = await prisma.notificationLog.create({
          data: {
            recipientId,
            recipientEmail: to,
            subject,
            eventType,
            status: 'PENDING',
            provider: 'RESEND',
            idempotencyKey,
            metadata: metadata ? JSON.stringify(metadata) : null,
          },
        });
      }
    } catch {}

    // 4. Bounded exponential backoff retry loop
    const maxRetries = 2; // total 3 attempts
    let lastError: any = null;
    let messageId: string | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.resend.emails.send({
          from: this.defaultFrom,
          to: [to],
          subject,
          html,
          text: text || '',
        });

        if (response.error) {
          throw response.error;
        }

        messageId = response.data?.id;
        break; // Successfully sent
      } catch (err: any) {
        lastError = err;
        const statusCode = err?.statusCode || err?.status || (err?.name === 'validation_error' ? 422 : 500);

        console.warn(`[ResendClient] Attempt ${attempt + 1}/${maxRetries + 1} failed for ${eventType} to ${to}:`, err?.message || err);

        // Fail fast on non-retryable 4xx errors (invalid email, unauthorized, bad domain)
        const isPermanent = statusCode >= 400 && statusCode < 500 && statusCode !== 429;
        if (isPermanent || attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1000ms, 2000ms
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // 5. Update NotificationLog with final outcome
    if (messageId) {
      if (logRecord) {
        await prisma.notificationLog.update({
          where: { id: logRecord.id },
          data: {
            status: 'SENT',
            providerMessageId: messageId,
            sentAt: new Date(),
          },
        }).catch(() => null);
      }

      console.log(`[ResendClient] ✅ Email delivered to Resend | ID: ${messageId} | Recipient: ${to} | Event: ${eventType}`);
      return {
        success: true,
        messageId,
        status: 'SENT',
      };
    } else {
      const errMsg = lastError?.message || 'Unknown Resend error';
      if (logRecord) {
        await prisma.notificationLog.update({
          where: { id: logRecord.id },
          data: {
            status: 'FAILED',
            errorMessage: errMsg.slice(0, 500),
          },
        }).catch(() => null);
      }

      console.error(`[ResendClient] ❌ Email dispatch failed for ${eventType} to ${to}:`, errMsg);
      return {
        success: false,
        status: 'FAILED',
        error: errMsg,
      };
    }
  }
}

export const resendClient = new ResendClient();
