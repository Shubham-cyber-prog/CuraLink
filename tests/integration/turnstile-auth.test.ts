import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { Role } from '../../src/types/role';

jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      findUnique: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn((callback) =>
      typeof callback === 'function' ? callback(require('../../src/lib/prisma').default) : Promise.all(callback)
    ),
  },
}));

const mockFindUnique = prisma.user.findUnique as unknown as jest.Mock;
const mockCreate = prisma.user.create as unknown as jest.Mock;

describe('Cloudflare Turnstile Bot Protection Integration Tests', () => {
  const validToken = 'XXXX.DUMMY.TOKEN.XXXX';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA';
  });

  describe('1. Signup / Registration Protection', () => {
    const signupData = {
      name: 'Real Human',
      email: 'human@example.com',
      password: 'SecurePassword123!',
      role: 'PATIENT',
    };

    it('should reject signup without Turnstile token with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(signupData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Turnstile token is required');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should reject signup if Turnstile token fails verification with HTTP 400', async () => {
      // Use Cloudflare's always-fail test secret
      process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';

      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...signupData, turnstileToken: 'bot-forged-token' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Bot verification failed');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should accept signup with valid Turnstile token with HTTP 201', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'Real Human',
        email: 'human@example.com',
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...signupData, turnstileToken: validToken });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should accept Turnstile token passed in X-Turnstile-Token header', async () => {
      mockFindUnique.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'user-uuid-2',
        name: 'Real Human',
        email: 'human@example.com',
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .set('X-Turnstile-Token', validToken)
        .send(signupData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe('2. Login Protection', () => {
    const loginData = {
      email: 'human@example.com',
      password: 'SecurePassword123!',
    };

    it('should reject login without Turnstile token with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Turnstile token is required');
    });

    it('should reject login with failed Turnstile verification with HTTP 400', async () => {
      process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';

      const res = await request(app)
        .post('/api/auth/login')
        .send({ ...loginData, turnstileToken: 'bot-credential-stuffing' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Bot verification failed');
    });
  });

  describe('3. Forgot Password Protection', () => {
    const forgotData = {
      email: 'human@example.com',
    };

    it('should reject forgot-password without Turnstile token with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Turnstile token is required');
    });

    it('should reject forgot-password with failed Turnstile verification with HTTP 400', async () => {
      process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ ...forgotData, turnstileToken: 'bot-token-spam' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Bot verification failed');
    });

    it('should accept forgot-password with valid Turnstile token with HTTP 200', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-1',
        email: 'human@example.com',
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ ...forgotData, turnstileToken: validToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
