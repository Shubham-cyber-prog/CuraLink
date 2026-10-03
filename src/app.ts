import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import consultationRoutes from './routes/consultation.routes';
import paymentRoutes from './routes/payment.routes';
import doctorRoutes from './routes/doctor.routes';
import prescriptionRoutes from './routes/prescription.routes';
import reviewRoutes from './routes/review.routes';
import privacyRoutes from './routes/privacy.routes';
import symptomRoutes from './routes/symptom.routes';
import doctorDashboardRoutes from './routes/doctor-dashboard.routes';
import riskRoutes from './routes/risk.routes';
import vitalsRoutes from './routes/vitals.routes';
import adminRoutes from './routes/admin.routes';
import messageRoutes from './routes/message.routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler } from './middleware/error.middleware';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { securityHeaders } from './middleware/security-headers.middleware';
import { csrfProtection } from './middleware/csrf.middleware';
import { apiLimiter, aiLimiter } from './middleware/rate-limit.middleware';
import { requestId } from './middleware/request-id.middleware';
import { env } from './config/env';

export const app = express();

// Enable reverse proxy trust (for accurate client IP extraction behind load balancers/proxies)
app.set('trust proxy', 1);

// Unique Request ID propagation and tracing
app.use(requestId);

// HTTP Compression (gzip / deflate for responses)
app.use(compression());

// Helmet: standard secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://accounts.google.com',
          'https://gsi.gstatic.com',
          'https://apis.google.com',
          'https://challenges.cloudflare.com',
          'https://meet.jit.si',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://accounts.google.com', 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: [
          "'self'",
          'https://accounts.google.com',
          'https://challenges.cloudflare.com',
          'https://meet.jit.si',
        ],
        connectSrc: [
          "'self'",
          'http://localhost:5000',
          'http://127.0.0.1:5000',
          'ws://localhost:3000',
          'ws://127.0.0.1:3000',
          'https://curalink-056t.onrender.com',
          'https://*.onrender.com',
          'https://accounts.google.com',
          'https://oauth2.googleapis.com',
          'https://www.googleapis.com',
          'https://nominatim.openstreetmap.org',
          'https://challenges.cloudflare.com',
          'https://meet.jit.si',
          'wss://meet.jit.si',
          'https://*.sentry.io',
          'https://*.ingest.sentry.io',
          'https://*.ingest.us.sentry.io',
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Custom security headers (Permissions-Policy, HSTS)
app.use(securityHeaders);

// Static uploads serving for E-Prescriptions
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Strict CORS: only allow origins specified in ALLOWED_ORIGINS (or no-origin for mobile apps)
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Mobile native apps (Capacitor/React Native) or curl/server-to-server requests have no Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In local development or testing, allow localhost/127.0.0.1 origins
      if (env.NODE_ENV !== 'production' || process.env.NODE_ENV !== 'production') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }

      return callback(new Error(`Origin '${origin}' not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Turnstile-Token',
      'X-Client-Platform',
      'sentry-trace',
      'baggage',
      'traceparent',
      'tracestate',
      'X-Requested-With',
      'Accept',
    ],
  })
);

// Body parsing and cookies (preserve rawBody for webhook signature verification)
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf-8');
  }
}));
app.use(cookieParser());

// CSRF Protection (applied after cookie-parser)
app.use(csrfProtection);

// Global API Rate Limiting
app.use('/api/', apiLimiter);

// Doctor Dashboard Routes (Mount before /api/doctors so /me is not caught by /:id)
app.use('/api/doctor/me', doctorDashboardRoutes);
app.use('/api/doctors/me', doctorDashboardRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/symptom-checker', aiLimiter, symptomRoutes);
app.use('/api/symptoms', aiLimiter, symptomRoutes);
app.use('/api/risk', aiLimiter, riskRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/webhooks', webhookRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'CuraLink Health Backend API',
    status: 'online',
    version: '1.0.0',
    documentation: 'https://github.com/Shubham-cyber-prog/CuraLink',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      consultations: '/api/consultations',
      messages: '/api/messages',
      symptomChecker: '/api/symptom-checker',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
