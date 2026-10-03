import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  DATABASE_CONNECTION_LIMIT: z.string().optional(),
  DATABASE_POOL_TIMEOUT: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),

  // Cloudflare Turnstile (fail fast in production if missing or using test dummy key)
  TURNSTILE_SECRET_KEY: isProd
    ? z.string().min(1, 'TURNSTILE_SECRET_KEY is required in production')
    : z.string().default('1x0000000000000000000000000000000AA'),
  TURNSTILE_SITE_KEY: isProd
    ? z.string().min(1, 'TURNSTILE_SITE_KEY is required in production')
    : z.string().default('1x00000000000000000000AA'),

  // E-Prescription Digital Signature Secret
  PRESCRIPTION_SECRET: isProd
    ? z.string().min(16, 'PRESCRIPTION_SECRET is required in production (min 16 chars)')
    : z.string().default('curalink-rx-dev-signature-key-2026'),

  // ML Microservice
  ML_SERVICE_URL: z.string().default('http://localhost:8000'),

  // Admin Access Whitelist (comma-separated emails)
  ADMIN_EMAILS: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI Symptom Checker (Anthropic Claude API)
  ANTHROPIC_API_KEY: z.string().optional(),

  // AI (Google Gemini)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),

  // Video Consultation (Jitsi Meet & Daily)
  JITSI_DOMAIN: z.string().default('meet.jit.si'),
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),

  // Payments (Razorpay)
  RAZORPAY_KEY_ID: isProd
    ? z.string().min(1, 'RAZORPAY_KEY_ID is required in production')
    : z.string().default('rzp_test_curalink_dev'),
  RAZORPAY_KEY_SECRET: isProd
    ? z.string().min(1, 'RAZORPAY_KEY_SECRET is required in production')
    : z.string().default('dev_razorpay_secret_key'),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Real Email Notifications (Resend)
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  APP_URL: z.string().default('http://localhost:3000'),
  API_URL: z.string().default('http://localhost:5000'),
  EMAIL_ENABLED: z.string().default('true').transform((val) => val === 'true' || val === '1'),
  RESEND_WEBHOOK_SECRET: isProd
    ? z.string().min(1, 'RESEND_WEBHOOK_SECRET is required in production')
    : z.string().optional(),

  // Real SMS Notifications (MSG91/Twilio)
  SMS_API_KEY: z.string().optional(),

  // Medical Records File Storage (S3/Cloudinary)
  STORAGE_API_KEY: z.string().optional(),
  STORAGE_BUCKET_NAME: z.string().optional(),

  // Location/Geocoding (Google Maps)
  GEOCODING_API_KEY: z.string().optional(),

  // Error Monitoring (Sentry)
  SENTRY_DSN: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (data.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['TURNSTILE_SECRET_KEY'],
        message: 'Production cannot use Cloudflare dummy Turnstile secret key',
      });
    }
  }
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ FATAL: Invalid environment variables at startup:');
  console.error(JSON.stringify(_env.error.format(), null, 2));
  throw new Error('Fatal: Invalid environment configuration. Application exiting.');
}

export const env = _env.data;
