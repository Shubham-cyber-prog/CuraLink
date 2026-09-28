import dotenv from 'dotenv';

dotenv.config();

process.env.PORT = '5000';
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/curalink_test';
}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'db3d76e73c8d19ab42668fc1ec50efdbf5d8e137f8469e32a24fa68b9cf19a3b6807eb8e2a33ffb909f2b3e85e4a838be812d45a90d859fa3b16dbb67cf9d564';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
process.env.TURNSTILE_SITE_KEY = process.env.TURNSTILE_SITE_KEY || '1x00000000000000000000AA';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id.apps.googleusercontent.com';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_test_mock_key';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'CuraLink <notifications@curalink.health>';
process.env.EMAIL_ENABLED = 'true';
process.env.RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET || 'whsec_test_secret_12345';

