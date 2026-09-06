import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Protect all consultation endpoints
router.use(authenticate);

router.post('/:appointmentId/room', (req, res, next) => consultationController.getRoom(req, res, next));
router.post('/:appointmentId/complete', (req, res, next) => consultationController.complete(req, res, next));

export default router;
