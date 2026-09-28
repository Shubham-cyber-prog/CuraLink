import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { VitalsAiService, VitalRecord } from '../services/vitals-ai.service';
import { Role } from '../types/role';

const router = Router();

// Protect all vitals routes with authentication
router.use(authenticate);

/**
 * POST /api/vitals
 * Log new patient vital reading
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      systolicBp,
      diastolicBp,
      bloodGlucose,
      glucoseType = 'FASTING',
      weight,
      heartRate,
      spO2,
      temperature,
      notes,
      recordedAt,
    } = req.body;

    // Validate that at least one primary metric is provided
    if (
      bloodGlucose == null &&
      systolicBp == null &&
      weight == null &&
      heartRate == null &&
      spO2 == null &&
      temperature == null
    ) {
      res.status(400).json({
        success: false,
        message: 'Please provide at least one vital metric (Blood Glucose, Blood Pressure, Weight, Heart Rate).',
      });
      return;
    }

    // Validate physiological limits to reject impossible values
    if (systolicBp != null) {
      const s = parseInt(systolicBp);
      if (isNaN(s) || s < 40 || s > 300) {
        res.status(400).json({
          success: false,
          message: 'Invalid systolic blood pressure: value must be between 40 and 300 mmHg.',
        });
        return;
      }
    }

    if (diastolicBp != null) {
      const d = parseInt(diastolicBp);
      if (isNaN(d) || d < 20 || d > 200) {
        res.status(400).json({
          success: false,
          message: 'Invalid diastolic blood pressure: value must be between 20 and 200 mmHg.',
        });
        return;
      }
    }

    if (bloodGlucose != null) {
      const g = parseFloat(bloodGlucose);
      if (isNaN(g) || g < 20 || g > 1000) {
        res.status(400).json({
          success: false,
          message: 'Invalid blood glucose level: value must be between 20 and 1000 mg/dL.',
        });
        return;
      }
    }

    if (spO2 != null) {
      const o2 = parseInt(spO2);
      if (isNaN(o2) || o2 < 50 || o2 > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid oxygen saturation (SpO2): percentage must be between 50% and 100%.',
        });
        return;
      }
    }

    if (heartRate != null) {
      const hr = parseInt(heartRate);
      if (isNaN(hr) || hr < 25 || hr > 300) {
        res.status(400).json({
          success: false,
          message: 'Invalid heart rate: value must be between 25 and 300 bpm.',
        });
        return;
      }
    }

    if (weight != null) {
      const w = parseFloat(weight);
      if (isNaN(w) || w < 1 || w > 500) {
        res.status(400).json({
          success: false,
          message: 'Invalid weight: value must be between 1 and 500 kg.',
        });
        return;
      }
    }

    if (temperature != null) {
      const t = parseFloat(temperature);
      if (isNaN(t) || t < 85 || t > 115) {
        res.status(400).json({
          success: false,
          message: 'Invalid temperature: value must be between 85°F and 115°F.',
        });
        return;
      }
    }

    const newLog = await (prisma as any).vitalLog.create({
      data: {
        userId,
        systolicBp: systolicBp != null ? parseInt(systolicBp) : null,
        diastolicBp: diastolicBp != null ? parseInt(diastolicBp) : null,
        bloodGlucose: bloodGlucose != null ? parseFloat(bloodGlucose) : null,
        glucoseType,
        weight: weight != null ? parseFloat(weight) : null,
        heartRate: heartRate != null ? parseInt(heartRate) : null,
        spO2: spO2 != null ? parseInt(spO2) : null,
        temperature: temperature != null ? parseFloat(temperature) : null,
        notes: notes || null,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      },
    });

    // Run AI analysis on recent logs to provide immediate trend feedback
    const recentLogs = await (prisma as any).vitalLog.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
      take: 60,
    });

    const aiReport = VitalsAiService.analyzeVitals(recentLogs);

    res.status(201).json({
      success: true,
      message: 'Vital record saved successfully.',
      data: {
        vital: newLog,
        aiFeedback: {
          overallTrajectory: aiReport.overallTrajectory,
          activeAlerts: aiReport.alerts,
          summaryText: aiReport.summaryText,
          summaryTextHindi: aiReport.summaryTextHindi,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vitals
 * Get chronological vital logs for current user
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { days } = req.query;

    let dateFilter: any = {};
    if (days && days !== 'all') {
      const numDays = parseInt(String(days)) || 30;
      const cutoff = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
      dateFilter = { recordedAt: { gte: cutoff } };
    }

    const vitals = await (prisma as any).vitalLog.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    res.status(200).json({
      success: true,
      data: vitals,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vitals/trends
 * Formatted time-series dataset ready for SVG/Canvas graphing
 */
router.get('/trends', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { days = '30' } = req.query;

    let dateFilter: any = {};
    if (days !== 'all') {
      const numDays = parseInt(String(days)) || 30;
      const cutoff = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
      dateFilter = { recordedAt: { gte: cutoff } };
    }

    const rawLogs = await (prisma as any).vitalLog.findMany({
      where: {
        userId,
        ...dateFilter,
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Format for charting
    const trendPoints = rawLogs.map((log: any) => {
      const d = new Date(log.recordedAt);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        id: log.id,
        date: dateLabel,
        isoDate: d.toISOString(),
        timestamp: d.getTime(),
        bloodGlucose: log.bloodGlucose,
        glucoseType: log.glucoseType,
        systolicBp: log.systolicBp,
        diastolicBp: log.diastolicBp,
        weight: log.weight,
        heartRate: log.heartRate,
        spO2: log.spO2,
      };
    });

    const aiReport = VitalsAiService.analyzeVitals(rawLogs);

    res.status(200).json({
      success: true,
      data: {
        timeSeries: trendPoints,
        insights: aiReport,
        overallTrajectory: aiReport.overallTrajectory,
        alerts: aiReport.alerts,
        summaryText: aiReport.summaryText,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vitals/ai-insights
 * Detailed AI deterioration report and active clinical alerts
 */
router.get('/ai-insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const logs = await (prisma as any).vitalLog.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
      take: 90,
    });

    const aiReport = VitalsAiService.analyzeVitals(logs);

    res.status(200).json({
      success: true,
      data: aiReport,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vitals/patient/:patientId
 * Doctor endpoint: retrieve a patient's longitudinal vital trends and AI alerts
 */
router.get('/patient/:patientId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patientId = String(req.params.patientId);
    const requestingUser = req.user!;
    if (requestingUser.role === Role.PATIENT && requestingUser.id !== patientId) {
      res.status(403).json({ success: false, message: 'You are not authorized to view another patient\'s vitals.' });
      return;
    }

    if (requestingUser.role === Role.DOCTOR) {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: requestingUser.id },
      });
      const doctorIds = [requestingUser.id];
      if (doctorProfile) doctorIds.push(doctorProfile.id);

      const hasConsultation = await prisma.appointment.findFirst({
        where: {
          userId: patientId,
          doctorId: { in: doctorIds },
        },
      });

      if (!hasConsultation) {
        res.status(403).json({
          success: false,
          message: 'You are not authorized to access this patient\'s vitals because you have no clinical consultations with them.',
        });
        return;
      }
    }

    const { days = '30' } = req.query;

    let dateFilter: any = {};
    if (days !== 'all') {
      const numDays = parseInt(String(days)) || 30;
      const cutoff = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
      dateFilter = { recordedAt: { gte: cutoff } };
    }

    const logs = await (prisma as any).vitalLog.findMany({
      where: {
        userId: patientId,
        ...dateFilter,
      },
      orderBy: { recordedAt: 'asc' },
    });

    const aiReport = VitalsAiService.analyzeVitals(logs);

    const trendPoints = logs.map((log: any) => {
      const d = new Date(log.recordedAt);
      return {
        id: log.id,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isoDate: d.toISOString(),
        timestamp: d.getTime(),
        bloodGlucose: log.bloodGlucose,
        systolicBp: log.systolicBp,
        diastolicBp: log.diastolicBp,
        weight: log.weight,
        heartRate: log.heartRate,
        spO2: log.spO2,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        timeSeries: trendPoints,
        insights: aiReport,
        totalLogs: logs.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/vitals/:id
 * Remove an errant vital entry with ownership verification
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user!;

    const existingLog = await (prisma as any).vitalLog.findUnique({ where: { id } });
    if (!existingLog) {
      res.status(404).json({ success: false, message: 'Vital entry not found' });
      return;
    }

    if (existingLog.userId !== requestingUser.id && requestingUser.role !== Role.ADMIN) {
      res.status(403).json({ success: false, message: 'You are not authorized to delete this vital entry.' });
      return;
    }

    await (prisma as any).vitalLog.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Vital entry deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
