import 'dotenv/config';
import * as Sentry from '@sentry/node';

// Initialize Sentry for Express backend error monitoring
const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  });
  console.log('🛡️  Sentry initialized for Express backend');
} else {
  console.warn('⚠️  SENTRY_DSN not set — backend error monitoring disabled');
}

import app from './app';
import { env } from './config/env';

const HOST = process.env.HOST;
const server = HOST
  ? app.listen(env.PORT, HOST, () => {
      console.log(`🚀 CuraLink Auth Server listening on ${HOST}:${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`🤖 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY?.trim() ? 'Present ✅' : 'Missing ❌'}`);
      console.log(`🤖 GEMINI_MODEL: ${process.env.GEMINI_MODEL?.trim() || '(default: gemini-3.6-flash)'}`);
    })
  : app.listen(env.PORT, () => {
      console.log(`🚀 CuraLink Auth Server listening on port ${env.PORT} (IPv4 + IPv6 dual-stack) in ${env.NODE_ENV} mode`);
      console.log(`🤖 GEMINI_API_KEY: ${process.env.GEMINI_API_KEY?.trim() ? 'Present ✅' : 'Missing ❌'}`);
      console.log(`🤖 GEMINI_MODEL: ${process.env.GEMINI_MODEL?.trim() || '(default: gemini-3.6-flash)'}`);
    });

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
