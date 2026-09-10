import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { verifyTurnstile } from '../middleware/turnstile.middleware';
import { Role } from '../types/role';

const router = Router();

<<<<<<< Updated upstream
// Public routes (Rate limited & Bot Protected)
router.post('/register', authLimiter, verifyTurnstile, (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, verifyTurnstile, (req, res, next) => authController.login(req, res, next));
router.post('/google', authLimiter, (req, res, next) => authController.googleLogin(req, res, next));
router.get('/google/mobile-login', (req, res) => authController.googleMobileLogin(req, res));
router.get('/google/callback', (req, res, next) => authController.googleMobileCallback(req, res, next));
=======
// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/google', (req, res, next) => authController.googleLogin(req, res, next));
>>>>>>> Stashed changes
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', authLimiter, verifyTurnstile, (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', authLimiter, (req, res, next) => authController.resetPassword(req, res, next));

// Token refresh (uses curalink_refresh cookie)
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// CSRF Token endpoint
router.get('/csrf-token', (req, res) => {
  // Handled entirely by csrfProtection middleware mapped in app.ts
  // This just ensures the route exists so it hits the middleware
  res.status(200).end();
});

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));
router.put('/profile', authenticate, authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => authController.updateProfile(req, res, next));

// Demo Role-based protected routes
router.get('/doctor-only', authenticate, authorize(Role.DOCTOR), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Doctor! Access granted to medical records portal.',
    user: req.user,
  });
});

router.get('/admin-only', authenticate, authorize(Role.ADMIN), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! Access granted to system administrative controls.',
    user: req.user,
  });
});

export default router;
