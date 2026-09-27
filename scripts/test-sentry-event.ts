import 'dotenv/config';
import * as Sentry from '@sentry/node';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
console.log('Testing Sentry connection with DSN:', dsn ? dsn.replace(/:[^@]+@/, ':***@') : 'MISSING');

if (!dsn) {
  console.error('❌ SENTRY_DSN missing!');
  process.exit(1);
}

Sentry.init({
  dsn,
  environment: 'production-audit-test',
});

async function triggerTestError() {
  try {
    const testError = new Error('CuraLink Production Audit Verification: Deliberate Test Error for Sentry');
    const eventId = Sentry.captureException(testError);
    console.log(`📤 Dispatched test error to Sentry! Event ID: ${eventId}`);
    
    // Flush to guarantee network transmission to Sentry servers
    const flushed = await Sentry.flush(5000);
    console.log(`📬 Sentry flush result: ${flushed ? 'Successfully sent to Sentry ingest server ✅' : 'Timed out'}`);
  } catch (err: any) {
    console.error('❌ Error sending to Sentry:', err);
  }
}

triggerTestError();
