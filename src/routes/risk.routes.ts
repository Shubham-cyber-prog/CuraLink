import { Router, Request, Response } from 'express';
import { mlServiceClient } from '../services/ml-service.client';

const router = Router();

/**
 * GET /api/risk/status
 * Check health and connectivity to the ML microservice.
 */
router.get('/status', async (_req: Request, res: Response) => {
  const health = await mlServiceClient.checkHealth();
  res.status(health.healthy ? 200 : 503).json(health);
});

/**
 * POST /api/risk/diabetes
 * Compute diabetes risk score and explainable feature contributions.
 */
router.post('/diabetes', async (req: Request, res: Response) => {
  try {
    const result = await mlServiceClient.predictDiabetesRisk(req.body);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for diabetes risk prediction.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error predicting diabetes risk' });
  }
});

/**
 * POST /api/risk/heart
 * Compute cardiovascular disease risk and explainable feature contributions.
 */
router.post('/heart', async (req: Request, res: Response) => {
  try {
    const result = await mlServiceClient.predictHeartRisk(req.body);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for cardiovascular risk prediction.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error predicting heart disease risk' });
  }
});

router.post('/predict', async (req: Request, res: Response) => {
  try {
    const { modelType, features } = req.body;
    const type = (modelType || req.body.type || '').toLowerCase();
    const data = features || req.body.data || req.body;
    if (type === 'diabetes') {
      const result = await mlServiceClient.predictDiabetesRisk(data);
      res.status(200).json({ success: true, data: result });
      return;
    }
    if (type === 'heart') {
      const result = await mlServiceClient.predictHeartRisk(data);
      res.status(200).json({ success: true, data: result });
      return;
    }
    res.status(400).json({ success: false, error: 'Invalid modelType: must be diabetes or heart' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error running risk prediction' });
  }
});

/**
 * POST /api/risk/urgency
 * Predict clinical symptom urgency using the custom-trained text classifier.
 */
router.post('/urgency', async (req: Request, res: Response) => {
  try {
    const text = req.body?.symptomText || req.body?.symptoms || req.body?.message || '';
    if (!text) {
      res.status(400).json({ success: false, error: 'Please provide symptomText' });
      return;
    }
    const result = await mlServiceClient.predictUrgency(text);
    if (!result) {
      res.status(503).json({
        success: false,
        error: 'ML microservice currently unavailable for urgency classification.',
      });
      return;
    }
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Error classifying urgency' });
  }
});

export default router;
