import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { env } from '../config/env';

const router = Router();

/**
 * Standard Svix / Resend Webhook Signature Verification using Node built-in crypto.
 * Prevents ESM/CommonJS compatibility issues while strictly enforcing security.
 */
export function verifyResendWebhook(
  rawBody: string,
  headers: { id?: string; timestamp?: string; signature?: string },
  secret: string
): boolean {
  if (!headers.id || !headers.timestamp || !headers.signature || !secret) {
    return false;
  }

  try {
    // 5-minute timestamp tolerance check
    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(headers.timestamp, 10);
    if (isNaN(tsSec) || Math.abs(nowSec - tsSec) > 300) {
      return false;
    }

    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const toSign = `${headers.id}.${headers.timestamp}.${rawBody}`;

    const signatures = headers.signature.split(' ');
    for (const part of signatures) {
      const [version, sig] = part.split(',');
      if (version === 'v1' && sig) {
        const sigBuf = Buffer.from(sig);

        // Try standard Svix base64 key first, then fallback to utf-8 key
        for (const buf of [Buffer.from(secretKey, 'base64'), Buffer.from(secretKey, 'utf-8')]) {
          const expSig = crypto.createHmac('sha256', buf).update(toSign).digest('base64');
          const expBuf = Buffer.from(expSig);
          if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
            return true;
          }
        }
      }
    }
  } catch (err) {
    console.error('[ResendWebhook] Signature verification error:', err);
    return false;
  }

  return false;
}

/**
 * POST /api/webhooks/resend
 * Handles webhook notifications from Resend for delivery, bounce, and complaint events.
 */
router.post('/resend', async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = env.RESEND_WEBHOOK_SECRET || process.env.RESEND_WEBHOOK_SECRET;

  const svixId = req.headers['svix-id'] as string | undefined;
  const svixTimestamp = req.headers['svix-timestamp'] as string | undefined;
  const svixSignature = req.headers['svix-signature'] as string | undefined;

  let rawBody = (req as any).rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

  // If secret configured, verify signature
  if (webhookSecret) {
    const isValid = verifyResendWebhook(
      rawBody,
      { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret
    );

    if (!isValid) {
      console.warn('[ResendWebhook] ❌ Rejected invalid webhook signature');
      res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }
  }

  try {
    const payload = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawBody);
    const eventType = payload?.type; // e.g. "email.delivered", "email.bounced", "email.complained"
    const emailId = payload?.data?.email_id || payload?.data?.id;

    if (!emailId || !eventType) {
      res.status(200).json({ received: true });
      return;
    }

    console.log(`[ResendWebhook] Processing ${eventType} for message: ${emailId}`);

    if (eventType === 'email.delivered') {
      await prisma.notificationLog.updateMany({
        where: { providerMessageId: emailId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });
    } else if (eventType === 'email.bounced') {
      const bounceDetails = payload?.data?.bounce ? JSON.stringify(payload.data.bounce) : 'Email bounced by recipient mail server';
      await prisma.notificationLog.updateMany({
        where: { providerMessageId: emailId },
        data: {
          status: 'BOUNCED',
          errorMessage: bounceDetails.slice(0, 500),
        },
      });
    } else if (eventType === 'email.complained') {
      await prisma.notificationLog.updateMany({
        where: { providerMessageId: emailId },
        data: {
          status: 'COMPLAINED',
          errorMessage: 'Recipient marked email as spam/complaint',
        },
      });
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('[ResendWebhook] Error handling event:', err?.message || err);
    res.status(500).json({ success: false, message: 'Error processing webhook event' });
  }
});

export default router;
