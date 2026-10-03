import crypto from 'crypto';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { verifyTurnstile } from '../middleware/turnstile.middleware';
import { Role } from '../types/role';

const router = Router();

// Public routes (Rate limited & Bot Protected)
router.post('/register', authLimiter, verifyTurnstile, (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, verifyTurnstile, (req, res, next) => authController.login(req, res, next));
router.post('/google', authLimiter, (req, res, next) => authController.googleLogin(req, res, next));
router.get('/google/mobile-login', (req, res) => authController.googleMobileLogin(req, res));
router.get('/google/callback', (req, res, next) => authController.googleMobileCallback(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', authLimiter, verifyTurnstile, (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, (req, res, next) => authController.resetPassword(req, res, next));
router.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/resend-verification', authLimiter, (req, res, next) => authController.resendVerification(req, res, next));

// Token refresh (uses curalink_refresh cookie)
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// CSRF Token endpoint
router.get('/csrf-token', (req, res) => {
  const token = req.cookies?.curalink_csrf || crypto.randomBytes(32).toString('hex');
  res.cookie('curalink_csrf', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, token });
});

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticate, authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => authController.updateProfile(req, res, next));

// Test-only role authorization route (never exposed in staging/production)
if (process.env.NODE_ENV === 'test') {
  router.get('/doctor-only', authenticate, authorize(Role.DOCTOR), (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome Doctor! Access granted to medical records portal.',
    });
  });
}

export default router;
