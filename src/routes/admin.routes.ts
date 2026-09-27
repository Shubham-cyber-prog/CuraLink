import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

// Protect all admin endpoints with strict RBAC
router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.get('/doctors', (req, res, next) => adminController.getDoctors(req, res, next));
router.put('/doctors/:doctorId/verify-status', (req, res, next) =>
  adminController.setDoctorVerificationStatus(req, res, next)
);
router.get('/appointments', (req, res, next) => adminController.getAppointments(req, res, next));
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));
router.get('/erasure-requests', (req, res, next) => adminController.getErasureRequests(req, res, next));
router.put('/erasure-requests/:requestId/process', (req, res, next) =>
  adminController.processErasureRequest(req, res, next)
);

export default router;
