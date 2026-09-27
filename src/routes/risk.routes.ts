import { Router, Request, Response, NextFunction } from 'express';
import { mlServiceClient } from '../services/ml-service.client';
import { authenticate } from '../middleware/auth.middleware';
import { diabetesRiskSchema, heartRiskSchema, urgencyTextSchema } from '../validators/risk.validator';

const router = Router();

/**
 * GET /api/risk/status
 * Check health and connectivity to the ML microservice.
 */
router.get('/status', async (_req: Request, res: Response) => {
  const health = await mlServiceClient.checkHealth();
  res.status(health.healthy ? 200 : 503).json(health);
});

// Protect all risk prediction routes with authentication
router.use(authenticate);

/**
 * POST /api/risk/diabetes
 * Compute diabetes risk score and explainable feature contributions.
 */
router.post('/diabetes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = diabetesRiskSchema.parse(req.body);
    const result = await mlServiceClient.predictDiabetesRisk(validated);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for diabetes risk prediction.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/risk/heart
 * Compute cardiovascular disease risk and explainable feature contributions.
 */
router.post('/heart', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = heartRiskSchema.parse(req.body);
    const result = await mlServiceClient.predictHeartRisk(validated);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for cardiovascular risk prediction.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.post('/predict', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { modelType, features } = req.body;
    const type = (modelType || req.body.type || '').toLowerCase();
    const data = features || req.body.data || req.body;
    if (type === 'diabetes') {
      const validated = diabetesRiskSchema.parse(data);
      const result = await mlServiceClient.predictDiabetesRisk(validated);
      res.status(200).json({ success: true, data: result });
      return;
    }
    if (type === 'heart') {
      const validated = heartRiskSchema.parse(data);
      const result = await mlServiceClient.predictHeartRisk(validated);
      res.status(200).json({ success: true, data: result });
      return;
    }
    res.status(400).json({ success: false, error: 'Invalid modelType: must be diabetes or heart' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/risk/urgency
 * Predict clinical symptom urgency using the custom-trained text classifier.
 */
router.post('/urgency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const text = req.body?.symptomText || req.body?.symptoms || req.body?.message || '';
    const { symptomText } = urgencyTextSchema.parse({ symptomText: text });
    const result = await mlServiceClient.predictUrgency(symptomText);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for urgency classification.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
