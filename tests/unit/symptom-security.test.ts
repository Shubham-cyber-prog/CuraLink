import request from 'supertest';
import app from '../../src/app';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '../../src/types/role';
import {
  resetSymptomUserStore,
  symptomUserRateLimiter,
  SYMPTOM_MAX_PER_WINDOW,
  TOTAL_GEMINI_BUDGET_MS,
} from '../../src/routes/symptom.routes';

jest.mock('../../src/services/ml-service.client', () => ({
  mlServiceClient: {
    predictUrgency: jest.fn().mockResolvedValue(null),
  },
}));

describe('Symptom Routes Security & Quota Controls', () => {
  const patientToken = generateToken({
    id: 'patient_symptom_test_user_001',
    email: 'patient.symptom@test.com',
    role: Role.PATIENT,
  });

  beforeEach(() => {
    resetSymptomUserStore();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication Requirement', () => {
    it('should reject unauthenticated POST /api/symptoms with 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/symptoms')
        .send({ symptoms: 'Mild headache for 2 hours' });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/authentication token is required/i);
    });

    it('should reject unauthenticated POST /api/symptom-checker/analyze with 401 Unauthorized', async () => {
      const response = await request(app)
        .post('/api/symptom-checker/analyze')
        .send({ symptoms: 'Mild headache for 2 hours' });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/authentication token is required/i);
    });

    it('should accept authenticated request and process emergency triage short-circuit', async () => {
      const response = await request(app)
        .post('/api/symptoms')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ symptoms: 'Severe chest pain and difficulty breathing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.triageCategory).toBe('RED');
      expect(response.body.data.urgencyLevel).toBe('EMERGENCY');
    });
  });

  describe('Per-User Rate Limiting & Daily Cap', () => {
    it('should enforce short-window rate limit per user and return 429', () => {
      const mockReq = (userId: string) =>
        ({
          user: { id: userId, email: 'user@test.com', role: Role.PATIENT },
          headers: { 'x-test-rate-limit': 'true' },
          ip: '127.0.0.1',
        } as any);

      const mockRes = () => {
        const res: any = {};
        res.setHeader = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
      };

      const next = jest.fn();

      // First SYMPTOM_MAX_PER_WINDOW calls should pass
      for (let i = 0; i < SYMPTOM_MAX_PER_WINDOW; i++) {
        const res = mockRes();
        symptomUserRateLimiter(mockReq('user_rate_test_1'), res, next);
      }
      expect(next).toHaveBeenCalledTimes(SYMPTOM_MAX_PER_WINDOW);

      // (SYMPTOM_MAX_PER_WINDOW + 1)-th call should be blocked with 429
      const blockedRes = mockRes();
      symptomUserRateLimiter(mockReq('user_rate_test_1'), blockedRes, next);

      expect(blockedRes.status).toHaveBeenCalledWith(429);
      expect(blockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringMatching(/too many symptom check requests/i),
        })
      );
    });

    it('should enforce daily quota cap per user and return 429 with daily message', () => {
      let currentTime = 1000000;
      const dateSpy = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

      const mockReq = (userId: string) =>
        ({
          user: { id: userId, email: 'user@test.com', role: Role.PATIENT },
          headers: { 'x-test-rate-limit': 'true' },
          ip: '127.0.0.1',
        } as any);

      const mockRes = () => {
        const res: any = {};
        res.setHeader = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
      };

      const next = jest.fn();

      // Make 3 batches of 5 calls, advancing time by 16 minutes after each batch
      for (let batch = 0; batch < 3; batch++) {
        for (let i = 0; i < 5; i++) {
          symptomUserRateLimiter(mockReq('user_daily_test_1'), mockRes(), next);
        }
        currentTime += 16 * 60 * 1000;
      }
      expect(next).toHaveBeenCalledTimes(15);

      // 16th call is within the 24-hour day, so daily cap blocks it
      const blockedRes = mockRes();
      symptomUserRateLimiter(mockReq('user_daily_test_1'), blockedRes, next);

      expect(blockedRes.status).toHaveBeenCalledWith(429);
      expect(blockedRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringMatching(/daily symptom assessment limit reached/i),
        })
      );

      dateSpy.mockRestore();
    });

    it('should isolate quotas across different users', () => {
      const mockReq = (userId: string) =>
        ({
          user: { id: userId, email: `${userId}@test.com`, role: Role.PATIENT },
          headers: { 'x-test-rate-limit': 'true' },
          ip: '127.0.0.1',
        } as any);

      const mockRes = () => {
        const res: any = {};
        res.setHeader = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
      };

      const next = jest.fn();

      // Exhaust User A's short-window limit
      for (let i = 0; i < SYMPTOM_MAX_PER_WINDOW; i++) {
        symptomUserRateLimiter(mockReq('user_a'), mockRes(), next);
      }
      expect(next).toHaveBeenCalledTimes(SYMPTOM_MAX_PER_WINDOW);

      // User B should still succeed
      const userBRes = mockRes();
      symptomUserRateLimiter(mockReq('user_b'), userBRes, next);
      expect(next).toHaveBeenCalledTimes(SYMPTOM_MAX_PER_WINDOW + 1);
    });
  });

  describe('Gemini Time Budget Cap', () => {
    it('should be configured with a maximum 20-second budget (Render gateway limit is 30s)', () => {
      expect(TOTAL_GEMINI_BUDGET_MS).toBe(20000);
      expect(TOTAL_GEMINI_BUDGET_MS).toBeLessThan(30000);
    });
  });
});
