import { Router } from 'express';
import { doctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

// Public route to view verified doctors
router.get('/verified', (req, res, next) => doctorController.getVerifiedDoctors(req, res, next));

// Authenticated doctor profile (must be defined before /:id)
router.get('/me', authenticate, authorize(Role.DOCTOR), (req, res, next) =>
  doctorController.getMyProfile(req, res, next)
);

// Public route to view a single verified doctor by ID
router.get('/:id', (req, res, next) => doctorController.getDoctorById(req, res, next));

// Authenticated routes
router.use(authenticate);

router.post('/verify-submit', authorize(Role.DOCTOR), (req, res, next) =>
  doctorController.submitVerification(req, res, next)
);

// Admin-only route to approve/reject verification status
router.put('/:doctorId/verify-status', authorize(Role.ADMIN), (req, res, next) =>
  doctorController.setVerificationStatus(req, res, next)
);

export default router;
