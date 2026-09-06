import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

// Protect all appointment routes
router.use(authenticate);

router.post('/book', authorize(Role.PATIENT), (req, res, next) => appointmentController.book(req, res, next));
router.get('/my-appointments', authorize(Role.PATIENT, Role.DOCTOR), (req, res, next) => appointmentController.getMyAppointments(req, res, next));

export default router;
