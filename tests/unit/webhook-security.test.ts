import request from 'supertest';
import app from '../../src/app';
import crypto from 'crypto';

describe('Resend Webhook Security Tests', () => {
  const originalSecret = process.env.RESEND_WEBHOOK_SECRET;

  afterEach(() => {
    process.env.RESEND_WEBHOOK_SECRET = originalSecret;
  });

  it('should reject requests with 500 when RESEND_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;

    const response = await request(app)
      .post('/api/webhooks/resend')
      .send({ type: 'email.delivered', data: { id: 'msg_123' } });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/secret is not configured/i);
  });

  it('should reject requests with 401 when signature headers are missing or invalid', async () => {
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_test_secret_key_12345';

    const response = await request(app)
      .post('/api/webhooks/resend')
      .set('svix-id', 'msg_fake_123')
      .set('svix-timestamp', Math.floor(Date.now() / 1000).toString())
      .set('svix-signature', 'v1,invalid_signature_hash')
      .send({ type: 'email.delivered', data: { id: 'msg_123' } });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/invalid webhook signature/i);
  });

  it('should accept requests with 200 when signature is cryptographically valid', async () => {
    const secret = 'whsec_test_secret_key_12345';
    process.env.RESEND_WEBHOOK_SECRET = secret;

    const secretKey = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    const svixId = 'msg_svix_test_001';
    const svixTimestamp = Math.floor(Date.now() / 1000).toString();
    const payload = JSON.stringify({ type: 'email.delivered', data: { id: 'msg_123' } });

    const toSign = `${svixId}.${svixTimestamp}.${payload}`;
    const expectedSig = crypto.createHmac('sha256', Buffer.from(secretKey, 'utf-8')).update(toSign).digest('base64');

    const response = await request(app)
      .post('/api/webhooks/resend')
      .set('Content-Type', 'application/json')
      .set('svix-id', svixId)
      .set('svix-timestamp', svixTimestamp)
      .set('svix-signature', `v1,${expectedSig}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
  });
});
