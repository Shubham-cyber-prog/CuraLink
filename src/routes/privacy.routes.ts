import { Router } from 'express';
import { privacyController } from '../controllers/privacy.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { Role } from '../types/role';

const router = Router();

router.use(authenticate);

// User routes
router.post('/request-erasure', (req, res, next) =>
  privacyController.requestDataErasure(req, res, next)
);

router.get('/status', (req, res, next) => privacyController.getPrivacyStatus(req, res, next));

// Admin routes
router.put('/process-erasure/:requestId', authorize(Role.ADMIN), (req, res, next) =>
  privacyController.processDataErasure(req, res, next)
);

export default router;
