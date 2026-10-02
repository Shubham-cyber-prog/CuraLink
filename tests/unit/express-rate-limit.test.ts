import express from 'express';
import request from 'supertest';
import { authLimiter, aiLimiter, apiLimiter } from '../../src/middleware/rate-limit.middleware';

describe('express-rate-limit Middleware Integration', () => {
  describe('authLimiter (strict on auth endpoints)', () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.post('/test-login', authLimiter, (req, res) => {
      res.status(200).json({ success: true, message: 'Logged in' });
    });

    it('should allow requests within limit of 5 per 15 minutes', async () => {
      const response = await request(testApp)
        .post('/test-login')
        .set('x-test-rate-limit', 'true')
        .send({ email: 'rate@test.com' });

      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-limit']).toBe('5');
    });

    it('should reject with 429 after 5 requests when rate limit is tested', async () => {
      const appStrict = express();
      appStrict.use(express.json());
      appStrict.post('/auth-strict', authLimiter, (req, res) => {
        res.status(200).json({ ok: true });
      });

      // Send 5 requests
      for (let i = 0; i < 5; i++) {
        await request(appStrict)
          .post('/auth-strict')
          .set('x-test-rate-limit', 'true')
          .send();
      }

      // 6th request must be rejected with 429
      const sixth = await request(appStrict)
        .post('/auth-strict')
        .set('x-test-rate-limit', 'true')
        .send();

      expect(sixth.status).toBe(429);
      expect(sixth.body.message).toMatch(/too many authentication attempts/i);
    });

    it('should skip rate limiting when in test environment without test header', async () => {
      const appSkipping = express();
      appSkipping.use(express.json());
      appSkipping.post('/auth-skip', authLimiter, (req, res) => {
        res.status(200).json({ ok: true });
      });

      for (let i = 0; i < 7; i++) {
        const res = await request(appSkipping).post('/auth-skip').send();
        expect(res.status).toBe(200);
      }
    });
  });

  describe('aiLimiter (strict on AI compute endpoints)', () => {
    it('should return rate limit info and enforce 10 requests per 15m window', async () => {
      const aiApp = express();
      aiApp.use(express.json());
      aiApp.post('/ai-test', aiLimiter, (req, res) => {
        res.status(200).json({ ok: true });
      });

      const response = await request(aiApp)
        .post('/ai-test')
        .set('x-test-rate-limit', 'true')
        .send();

      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-limit']).toBe('10');
    });
  });

  describe('apiLimiter (general endpoint protection)', () => {
    it('should configure 100 requests per minute limit', async () => {
      const generalApp = express();
      generalApp.use(express.json());
      generalApp.get('/general-test', apiLimiter, (req, res) => {
        res.status(200).json({ ok: true });
      });

      const response = await request(generalApp)
        .get('/general-test')
        .set('x-test-rate-limit', 'true');

      expect(response.status).toBe(200);
      expect(response.headers['ratelimit-limit']).toBe('100');
    });
  });
});
