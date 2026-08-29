import { Router, Request, Response } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getMe(req, res, next));

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
