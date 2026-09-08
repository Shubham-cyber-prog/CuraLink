import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

router.use(authenticate);

// Patient routes
router.get('/my-prescriptions', authorize(Role.PATIENT), (req, res, next) =>
  prescriptionController.getMyPrescriptions(req, res, next)
);

// Doctor routes
router.post('/issue', authorize(Role.DOCTOR), (req, res, next) =>
  prescriptionController.createPrescription(req, res, next)
);

// Shared / Download routes
router.get('/:id', (req, res, next) => prescriptionController.getPrescription(req, res, next));
router.get('/:id/download', (req, res, next) =>
  prescriptionController.downloadPrescription(req, res, next)
);

export default router;
