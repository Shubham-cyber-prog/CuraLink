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

  it('should verify successfully against Cloudflare API using official test pass keys', async () => {
    // Cloudflare official always-pass token & secret
    // Any non-empty token with secret 1x0000000000000000000000000000000AA always passes
    const result = await turnstileService.verifyToken('XXXX.DUMMY.TOKEN.XXXX');
    expect(result.success).toBe(true);
  });

  it('should fail verification when using Cloudflare official fail secret key', async () => {
    const originalSecret = process.env.TURNSTILE_SECRET_KEY;
    try {
      // Cloudflare official always-fail secret
      process.env.TURNSTILE_SECRET_KEY = '2x0000000000000000000000000000000AA';
      const failService = new TurnstileService();
      const result = await failService.verifyToken('any-token');
      expect(result.success).toBe(false);
      expect(result.errorCodes).toBeDefined();
    } finally {
      process.env.TURNSTILE_SECRET_KEY = originalSecret;
    }
  });
});
