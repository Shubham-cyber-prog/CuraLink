import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for security'),
  ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),
  TURNSTILE_SECRET_KEY: z.string().default('1x0000000000000000000000000000000AA'),
  TURNSTILE_SITE_KEY: z.string().default('1x00000000000000000000AA'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // AI Symptom Checker (Anthropic Claude API)
  ANTHROPIC_API_KEY: z.string().optional(),

  // AI (Google Gemini)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),

  // Video Consultation (Jitsi Meet)
  JITSI_DOMAIN: z.string().default('meet.jit.si'),
  DAILY_API_KEY: z.string().optional(),
  DAILY_DOMAIN: z.string().optional(),

  // Payments (Razorpay)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Real Email Notifications (Resend/SendGrid)
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),

  // Real SMS Notifications (MSG91/Twilio)
  SMS_API_KEY: z.string().optional(),

  // Medical Records File Storage (S3/Cloudinary)
  STORAGE_API_KEY: z.string().optional(),
  STORAGE_BUCKET_NAME: z.string().optional(),

  // Location/Geocoding (Google Maps)
  GEOCODING_API_KEY: z.string().optional(),

  // Error Monitoring (Sentry)
  SENTRY_DSN: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
