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
import { errorHandler } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';
import { securityHeaders } from './middleware/security-headers.middleware';
import { csrfProtection } from './middleware/csrf.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { env } from './config/env';

export const app = express();

// Security Headers
app.use(securityHeaders);

// Static uploads serving for E-Prescriptions
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// CORS
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) 
    // In strict production you might want to block these if you only have a web client
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// CSRF Protection (applied after cookie-parser)
app.use(csrfProtection);

// Global API Rate Limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/privacy', privacyRoutes);

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
