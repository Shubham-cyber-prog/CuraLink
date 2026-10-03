import { TurnstileService } from '../../src/services/turnstile.service';

describe('TurnstileService Unit Tests', () => {
  let turnstileService: TurnstileService;

  beforeEach(() => {
    turnstileService = new TurnstileService();
  });

  it('should immediately fail if token is empty or missing', async () => {
    const resultEmpty = await turnstileService.verifyToken('');
    expect(resultEmpty.success).toBe(false);
    expect(resultEmpty.errorCodes).toContain('missing-input-response');

    const resultWhitespace = await turnstileService.verifyToken('   ');
    expect(resultWhitespace.success).toBe(false);
    expect(resultWhitespace.errorCodes).toContain('missing-input-response');
  });

  it('should verify successfully when Cloudflare returns success', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, 'error-codes': [], challenge_ts: new Date().toISOString() }),
    } as any);

    try {
      const result = await turnstileService.verifyToken('XXXX.DUMMY.TOKEN.XXXX');
      expect(result.success).toBe(true);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should fail verification when Cloudflare returns failure', async () => {
    const originalFetch = global.fetch;
    const originalSecret = process.env.TURNSTILE_SECRET_KEY;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-secret'] }),
    } as any);

    try {
      process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';
      const failService = new TurnstileService();
      const result = await failService.verifyToken('any-token');
      expect(result.success).toBe(false);
      expect(result.errorCodes).toBeDefined();
    } finally {
      global.fetch = originalFetch;
      process.env.TURNSTILE_SECRET_KEY = originalSecret;
    }
  });
});
