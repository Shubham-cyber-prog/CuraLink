describe('Environment Configuration & Validation Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should successfully load configuration in test/development mode with safe defaults', () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);

    const { env } = require('../../src/config/env');
    expect(env.NODE_ENV).toBe('test');
    expect(env.PRESCRIPTION_SECRET).toBeDefined();
    expect(env.RAZORPAY_KEY_ID).toBeDefined();
  });

  it('should fail fast at startup in production if Turnstile dummy secret key is used', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA';
    process.env.TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
    process.env.PRESCRIPTION_SECRET = 'super-secret-prescription-key-2026';
    process.env.RAZORPAY_KEY_ID = 'rzp_live_12345';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret_key_12345';
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_prod_12345';

    expect(() => {
      require('../../src/config/env');
    }).toThrow(/Fatal: Invalid environment configuration/i);
  });

  it('should fail fast at startup in production if PRESCRIPTION_SECRET is missing', () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.JWT_SECRET = 'a'.repeat(32);
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
    process.env.TURNSTILE_SECRET_KEY = '0x4AAAAAAAxRealSecretKey123';
    process.env.TURNSTILE_SITE_KEY = '0x4AAAAAAAxRealSiteKey123';
    delete process.env.PRESCRIPTION_SECRET;
    process.env.RAZORPAY_KEY_ID = 'rzp_live_12345';
    process.env.RAZORPAY_KEY_SECRET = 'live_secret_key_12345';
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_prod_12345';

    expect(() => {
      require('../../src/config/env');
    }).toThrow(/Fatal: Invalid environment configuration/i);
  });
});
